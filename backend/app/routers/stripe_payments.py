import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .. import models, database
from ..crud.settings import get_clinic_settings
from ..utils.notifications import create_admin_notification

router = APIRouter(
    prefix="/stripe",
    tags=["stripe"],
)

def get_stripe_key():
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Stripe no está configurado (falta STRIPE_SECRET_KEY).")
    return key

@router.post("/connect")
def connect_stripe_account(db: Session = Depends(database.get_db)):
    """
    Genera un Account Link de Stripe para hacer onboarding de la clínica.
    """
    stripe.api_key = get_stripe_key()
    settings = get_clinic_settings(db)
    
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    # Si la clínica no tiene un account_id, lo creamos
    if not settings.stripe_account_id:
        try:
            account = stripe.Account.create(
                type="standard",
                country="ES",
                email=settings.clinic_email or None,
            )
            settings.stripe_account_id = account.id
            db.commit()
            settings.stripe_account_id = account.id
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Error creando cuenta Stripe: {str(e)}")

    # Generamos el Account Link
    try:
        account_link = stripe.AccountLink.create(
            account=settings.stripe_account_id,
            refresh_url=f"{frontend_url}/dashboard/settings?stripe_refresh=true",
            return_url=f"{frontend_url}/dashboard/settings?stripe_return=true",
            type="account_onboarding",
        )
        return {"url": account_link.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error generando link de Stripe: {str(e)}")

@router.get("/refresh-status")
def refresh_stripe_status(db: Session = Depends(database.get_db)):
    """
    Consulta la API de Stripe directamente para actualizar el estado de la cuenta.
    Útil si los webhooks no llegan en local.
    """
    stripe.api_key = get_stripe_key()
    settings = get_clinic_settings(db)
    
    if not settings.stripe_account_id:
        return {"status": "no_account"}
        
    try:
        account = stripe.Account.retrieve(settings.stripe_account_id)
        settings.stripe_charges_enabled = account.charges_enabled
        db.commit()
        return {
            "stripe_account_id": settings.stripe_account_id,
            "charges_enabled": settings.stripe_charges_enabled,
            "details_submitted": account.details_submitted
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error sincronizando con Stripe: {str(e)}")


@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(database.get_db)):
    """
    Endpoint para recibir los Webhooks de Stripe.
    """
    stripe.api_key = get_stripe_key()
    webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
    
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    if not sig_header or not webhook_secret:
        return {"status": "ignored"} # Ignore if not configured properly yet

    try:
        # Intentar validar con el secreto normal
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except stripe.error.SignatureVerificationError:
        # Si falla, intentar con el secreto de Connect (para pagos de la clínica)
        connect_secret = os.environ.get("STRIPE_CONNECT_WEBHOOK_SECRET")
        if connect_secret:
            try:
                event = stripe.Webhook.construct_event(
                    payload, sig_header, connect_secret
                )
            except Exception as e:
                logger.error(f"❌ Error de firma Connect: {e}")
                raise HTTPException(status_code=400, detail="Invalid Connect signature")
        else:
            raise HTTPException(status_code=400, detail="Invalid signature and no Connect secret set")
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")

    # Handle the event
    if event['type'] == 'account.updated':
        account = event['data']['object']
        # Buscar la configuración con este account_id (asumiendo single-tenant local o multi-tenant)
        settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.stripe_account_id == account.id).first()
        if settings:
            # Si el onboarding está completo y charges_enabled es true
            settings.stripe_charges_enabled = account.charges_enabled
            db.commit()

    elif event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        # Usamos client_reference_id para buscar la cita
        appointment_id = session.get("client_reference_id")
        if appointment_id:
            try:
                appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
                if appointment:
                    # 1. ACTUALIZACIÓN CRÍTICA DE LA CITA (Lo primero)
                    appointment.payment_status = "deposit_paid"
                    appointment.status = "confirmed"
                    appointment.stripe_payment_intent_id = session.get("payment_intent")
                    appointment.stripe_checkout_session_id = session.get("id")
                    
                    try:
                        db.commit()
                        logger.info(f"✅ Cita {appointment_id} confirmada exitosamente en DB.")
                    except Exception as e_db:
                        db.rollback()
                        logger.error(f"🔥 FALLO CRÍTICO AL CONFIRMAR CITA {appointment_id} EN DB: {str(e_db)}")
                        raise # Este sí es crítico

                    # 2. INTENTO DE NOTIFICACIÓN (Aislado, no bloqueante)
                    try:
                        # Usamos una función que maneja su propia sesión si es posible, 
                        # o al menos capturamos cualquier error de RLS aquí.
                        from ..utils.notifications import create_admin_notification
                        create_admin_notification(
                            db,
                            title="✨ Pago Recibido",
                            description=f"Se ha confirmado la cita de {appointment.client.name} (Fianza pagada)",
                            type="success",
                            metadata={"appointment_id": appointment.id}
                        )
                        logger.info(f"🔔 Notificación de pago creada para cita {appointment_id}")
                    except Exception as e_notif:
                        # Logeamos pero NO lanzamos excepción para no romper el webhook
                        logger.error(f"⚠️ Error al crear notificación (el pago sí se procesó): {str(e_notif)}")
                        # Opcional: rollback parcial si la sesión quedó sucia
                        db.rollback() 
                    
                    # 3. INTENTO DE EMAIL (Aislado, no bloqueante)
                    try:
                        from ..utils.mailer import send_appointment_notification
                        send_appointment_notification(appointment.id, 'confirmation')
                        logger.info(f"📧 Email de confirmación enviado para cita {appointment_id}")
                    except Exception as e_mail:
                        logger.error(f"⚠️ Error al enviar email de confirmación: {str(e_mail)}")

                else:
                    logger.error(f"❌ Cita {appointment_id} no encontrada en el webhook.")
            except Exception as e_main:
                logger.error(f"🔥 ERROR GENERAL EN WEBHOOK STRIPE: {str(e_main)}")
                import traceback
                logger.error(traceback.format_exc())
                # No lanzamos 500 si la cita ya se guardó para evitar reintentos infinitos de Stripe si el fallo es secundario
                if 'appointment' in locals() and appointment.status == "confirmed":
                    return {"status": "success_with_minor_errors"}
                raise HTTPException(status_code=500, detail="Error interno procesando el pago")

    return {"status": "success"}
