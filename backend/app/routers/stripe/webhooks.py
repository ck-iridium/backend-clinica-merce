import uuid
import traceback
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ... import models, database
from ...services.tenant_provisioner import provision_tenant
from ...services.stripe_service import StripeService
from .utils import get_val, extract_and_fallback_onboarding_data

router = APIRouter()

def handle_saas_onboarding(data_object, metadata, db: Session):
    onboarding_data = extract_and_fallback_onboarding_data(data_object, metadata)
    plan_type = metadata.get("plan_type", "pro") or "pro"
    stripe_cust_id = get_val(data_object, 'customer', None)
    stripe_sub_id = get_val(data_object, 'subscription', None)

    provision_tenant(
        db=db,
        tenant_name=onboarding_data["tenant_name"],
        tenant_slug=onboarding_data["tenant_slug"],
        admin_email=onboarding_data["admin_email"],
        admin_name=onboarding_data["admin_name"],
        admin_password=onboarding_data["admin_password"],
        stripe_customer_id=stripe_cust_id,
        stripe_subscription_id=stripe_sub_id,
        plan_type=plan_type
    )

def handle_saas_subscription_update(data_object, metadata, db: Session):
    tenant_id = metadata.get("tenant_id")
    plan_type = metadata.get("plan_type")
    customer_id = get_val(data_object, 'customer', None)
    subscription_id = get_val(data_object, 'subscription', None)

    print(f"[BILLING] Pago de suscripción completado para Tenant ID: {tenant_id} | Cust ID: {customer_id} | Sub ID: {subscription_id}")

    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if tenant:
        tenant.stripe_customer_id = customer_id
        tenant.stripe_subscription_id = subscription_id
        tenant.plan_type = plan_type
        tenant.subscription_status = "active"
        db.commit()
        print(f"[BILLING] [SUCCESS] Inquilino '{tenant.name}' actualizado al plan {plan_type} de forma inmediata.")

        try:
            from ...main import TENANT_STATUS_CACHE
            if tenant.id in TENANT_STATUS_CACHE:
                del TENANT_STATUS_CACHE[tenant.id]
                print(f"[CACHE] Invalidador de caché activado para tenant: {tenant.id}")
        except Exception as e:
            print(f"[CACHE] [WARNING] Error al invalidar caché: {e}")

def handle_appointment_payment(data_object, db: Session):
    appointment_id = get_val(data_object, 'client_reference_id', None)
    print(f"[STRIPE] Pago recibido. Cita ID: {appointment_id}")

    if not appointment_id:
        return

    try:
        uuid.UUID(str(appointment_id))
        appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()

        if appointment:
            appointment.payment_status = "deposit_paid"
            appointment.status = "confirmed"
            appointment.stripe_payment_intent_id = get_val(data_object, 'payment_intent', None)
            appointment.stripe_checkout_session_id = get_val(data_object, 'id', None)
            db.commit()
            print(f"[DB] Cita {appointment_id} confirmada en base de datos.")

            try:
                from ...utils.notifications import create_admin_notification
                create_admin_notification(
                    db,
                    title="Pago Recibido",
                    description=f"Cita confirmada: {appointment.client.name}",
                    type="success",
                    metadata={"appointment_id": appointment.id},
                    tenant_id=appointment.tenant_id
                )
            except Exception:
                pass

            try:
                from ...utils.mailer import send_appointment_notification
                send_appointment_notification(appointment.id, 'confirmation')
            except Exception:
                pass
        else:
            print(f"[DB] [ERROR] Cita {appointment_id} no encontrada.")
    except ValueError:
        print(f"[STRIPE] [INFO] ID {appointment_id} no es un UUID válido. Ignorando.")

def handle_account_updated(data_object, db: Session):
    acc_id = get_val(data_object, 'id', None)
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.stripe_account_id == acc_id).first()
    if settings:
        settings.stripe_charges_enabled = get_val(data_object, 'charges_enabled', False)
        db.commit()
        print(f"[STRIPE] [SUCCESS] Cuenta {acc_id} actualizada.")

def handle_subscription_lifecycle(event_type, data_object, db: Session):
    sub_id = get_val(data_object, 'id', None)
    cust_id = get_val(data_object, 'customer', None)
    sub_status = get_val(data_object, 'status', 'active')
    expires_timestamp = get_val(data_object, 'current_period_end', None)
    metadata = get_val(data_object, 'metadata', {}) or {}

    plan_type = metadata.get("plan_type", "pro") or "pro"

    print(f"[STRIPE] Webhook de Suscripción recibido: {event_type} | Sub ID: {sub_id} | Cust ID: {cust_id} | Status: {sub_status}")

    tenant = db.query(models.Tenant).filter(
        (models.Tenant.stripe_subscription_id == sub_id) |
        (models.Tenant.stripe_customer_id == cust_id)
    ).first()

    if tenant:
        tenant.stripe_subscription_id = sub_id
        if sub_status in ['active', 'trialing']:
            tenant.subscription_status = 'active'
        else:
            tenant.subscription_status = 'suspended'

        tenant.plan_type = plan_type

        if expires_timestamp:
            tenant.subscription_expires_at = datetime.utcfromtimestamp(expires_timestamp)

        db.commit()
        print(f"[STRIPE] [SUCCESS] Inquilino '{tenant.name}' actualizado en DB. Status: {tenant.subscription_status} | Plan: {tenant.plan_type}")

        try:
            from ...main import TENANT_STATUS_CACHE
            if tenant.id in TENANT_STATUS_CACHE:
                del TENANT_STATUS_CACHE[tenant.id]
                print(f"[CACHE] Invalidador de caché activado para tenant: {tenant.id}")
        except Exception as e:
            print(f"[CACHE] [WARNING] Error al invalidar caché: {e}")
    else:
        print(f"[STRIPE] [WARNING] Inquilino no encontrado para Sub ID: {sub_id} o Cust ID: {cust_id}")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(database.get_db)):
    """
    Webhook omnicanal de Stripe (Local y Producción).
    Verifica la firma criptográfica sobre el stream binario y despacha el evento.
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        event = StripeService.construct_event(payload, sig_header)
        if isinstance(event, dict) and event.get("status") == "ignored":
            return {"status": "ignored"}

        # Extraemos el objeto de datos
        if isinstance(event, dict):
            data_object = event.get('data', {}).get('object', {})
            event_type = event.get('type')
        else:
            try:
                data_object = event['data']['object']
                event_type = getattr(event, 'type', None)
            except Exception:
                data_object = getattr(event, 'data', {}).get('object', {}) or event.get('data', {}).get('object', {})
                event_type = getattr(event, 'type', None) or event.get('type')
        
        print(f"[STRIPE] Evento recibido: {event_type}")

        # Despachador de Eventos
        if event_type == 'checkout.session.completed':
            metadata = get_val(data_object, 'metadata', {}) or {}
            event_kind = metadata.get("type")

            if event_kind == "saas_onboarding":
                handle_saas_onboarding(data_object, metadata, db)
            elif event_kind == "saas_subscription_update":
                handle_saas_subscription_update(data_object, metadata, db)
            else:
                handle_appointment_payment(data_object, db)

        elif event_type == 'account.updated':
            handle_account_updated(data_object, db)

        elif event_type in ['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted']:
            handle_subscription_lifecycle(event_type, data_object, db)

        return {"status": "success"}

    except Exception as e:
        print(f"[STRIPE] [FATAL ERROR] Webhook: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
