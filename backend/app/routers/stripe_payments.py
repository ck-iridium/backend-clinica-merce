import os
import stripe
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
                type="express",
                country="ES", # Asumiendo España
                email=settings.clinic_email or None,
                business_type="company",
                company={"name": settings.legal_name or settings.clinic_name}
            )
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
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        raise HTTPException(status_code=400, detail="Invalid signature")

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
            appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
            if appointment and appointment.payment_status == "awaiting_payment":
                appointment.payment_status = "deposit_paid"
                appointment.status = "confirmed"
                appointment.stripe_payment_intent_id = session.get("payment_intent")
                appointment.stripe_checkout_session_id = session.get("id")
                db.commit()
                # Aquí se podría lanzar el mailer para enviar la confirmación de la reserva.
                # from ..utils.mailer import send_booking_confirmation
                # send_booking_confirmation(db, appointment)

    return {"status": "success"}
