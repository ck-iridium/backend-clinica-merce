import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ... import models, database
from ...services.stripe_service import StripeService

router = APIRouter()

@router.get("/session-appointment/{session_id}")
def get_appointment_by_stripe_session(session_id: str, db: Session = Depends(database.get_db)):
    """
    Recupera los detalles de la cita a partir de un session_id de Stripe.
    Resuelve condiciones de carrera si el webhook de Stripe aún no se ha procesado.
    """
    try:
        # 1. Intentar buscar directamente por stripe_checkout_session_id en DB
        appointment = db.query(models.Appointment).filter(
            models.Appointment.stripe_checkout_session_id == session_id
        ).first()
        
        # 2. Si no se encuentra, consultar a Stripe para obtener el client_reference_id (Appointment ID)
        if not appointment:
            try:
                session = StripeService.retrieve_checkout_session(session_id)
                appointment_id = getattr(session, 'client_reference_id', None)
                if appointment_id:
                    uuid.UUID(str(appointment_id))
                    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
                    if appointment:
                        appointment.stripe_checkout_session_id = session_id
                        if appointment.status == "pending_payment":
                            appointment.status = "confirmed"
                            appointment.payment_status = "deposit_paid"
                        db.commit()
            except Exception as stripe_err:
                print(f"[STRIPE] [WARNING] Error al recuperar sesión: {stripe_err}")
                
        if not appointment:
            raise HTTPException(status_code=404, detail="Cita no encontrada para esta sesión")
            
        return {
            "date": appointment.start_time.date().isoformat(),
            "time": appointment.start_time.strftime("%H:%M"),
            "service_name": appointment.service.name,
            "service_price": appointment.service.price,
            "client_email": appointment.client.email,
            "client_name": appointment.client.name,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
