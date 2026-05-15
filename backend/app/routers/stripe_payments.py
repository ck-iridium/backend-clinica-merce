import os
import stripe
import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .. import models, database
from ..crud.settings import get_clinic_settings

router = APIRouter(
    prefix="/stripe",
    tags=["stripe"],
)

def get_stripe_key():
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Falta STRIPE_SECRET_KEY")
    return key

@router.post("/connect")
def connect_stripe_account(db: Session = Depends(database.get_db)):
    stripe.api_key = get_stripe_key()
    settings = get_clinic_settings(db)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    if not settings.stripe_account_id:
        try:
            account = stripe.Account.create(type="standard", country="ES", email=settings.clinic_email or None)
            settings.stripe_account_id = account.id
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    try:
        account_link = stripe.AccountLink.create(
            account=settings.stripe_account_id,
            refresh_url=f"{frontend_url}/dashboard/settings?stripe_refresh=true",
            return_url=f"{frontend_url}/dashboard/settings?stripe_return=true",
            type="account_onboarding",
        )
        return {"url": account_link.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/refresh-status")
def refresh_stripe_status(db: Session = Depends(database.get_db)):
    stripe.api_key = get_stripe_key()
    settings = get_clinic_settings(db)
    if not settings.stripe_account_id: return {"status": "no_account"}
    try:
        account = stripe.Account.retrieve(settings.stripe_account_id)
        settings.stripe_charges_enabled = account.charges_enabled
        db.commit()
        return {"charges_enabled": settings.stripe_charges_enabled}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(database.get_db)):
    """
    Webhook compatible con Stripe (Local y Producción). Blindado con getattr.
    """
    try:
        stripe.api_key = get_stripe_key()
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

        if not sig_header or not webhook_secret:
            return {"status": "ignored"}

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except stripe.error.SignatureVerificationError:
            connect_secret = os.environ.get("STRIPE_CONNECT_WEBHOOK_SECRET")
            if connect_secret:
                try:
                    event = stripe.Webhook.construct_event(payload, sig_header, connect_secret)
                except:
                    raise HTTPException(status_code=400, detail="Invalid signature")
            else:
                raise HTTPException(status_code=400, detail="Invalid signature")

        # Extraemos el objeto de datos
        data_object = event['data']['object']
        event_type = getattr(event, 'type', None)
        
        # --- PROCESAMIENTO ---
        if event_type == 'checkout.session.completed':
            # ACCESO SEGURO CON getattr
            appointment_id = getattr(data_object, 'client_reference_id', None)
            
            print(f"💰 Pago recibido. Cita ID: {appointment_id}")
            
            if appointment_id:
                try:
                    # Validar UUID antes de buscar
                    uuid.UUID(str(appointment_id))
                    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
                    
                    if appointment:
                        appointment.payment_status = "deposit_paid"
                        appointment.status = "confirmed"
                        appointment.stripe_payment_intent_id = getattr(data_object, 'payment_intent', None)
                        appointment.stripe_checkout_session_id = getattr(data_object, 'id', None)
                        db.commit()
                        print(f"✅ Cita {appointment_id} confirmada en base de datos.")

                        # Notificaciones y Emails (no bloqueantes)
                        try:
                            from ..utils.notifications import create_admin_notification
                            create_admin_notification(
                                db,
                                title="✨ Pago Recibido",
                                description=f"Cita confirmada: {appointment.client.name}",
                                type="success",
                                metadata={"appointment_id": appointment.id}
                            )
                        except: pass

                        try:
                            from ..utils.mailer import send_appointment_notification
                            send_appointment_notification(appointment.id, 'confirmation')
                        except: pass
                    else:
                        print(f"❌ Cita {appointment_id} no encontrada.")
                except ValueError:
                    print(f"ℹ️ ID {appointment_id} no es un UUID válido. Ignorando.")

        elif event_type == 'account.updated':
            acc_id = getattr(data_object, 'id', None)
            settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.stripe_account_id == acc_id).first()
            if settings:
                settings.stripe_charges_enabled = getattr(data_object, 'charges_enabled', False)
                db.commit()
                print(f"✅ Cuenta {acc_id} actualizada.")

        return {"status": "success"}

    except Exception as e:
        print(f"🔥 ERROR CRÍTICO WEBHOOK: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
