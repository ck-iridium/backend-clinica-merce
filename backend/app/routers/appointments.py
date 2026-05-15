from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import date as DateType
from .. import schemas, database, models
from ..crud import appointments as crud
from ..limiter import limiter
from ..crud.settings import get_clinic_settings
from ..scheduler import scheduler
from ..utils import mailer
import stripe
import os
from datetime import datetime, timedelta


router = APIRouter(
    prefix="/appointments",
    tags=["appointments"],
)

# ─── Public endpoints (must be defined BEFORE /{appointment_id} catch-all) ───

@router.get("/availability", response_model=schemas.AvailabilityResponse)
def get_availability(
    date: str = Query(..., description="Target date in YYYY-MM-DD format"),
    service_id: str = Query(..., description="Service UUID"),
    db: Session = Depends(database.get_db),
):
    """
    Returns the list of available time slots for a given date and service.
    Used by the public landing booking widget.
    """
    try:
        target = DateType.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=422, detail="date must be YYYY-MM-DD")

    slots = crud.get_availability_slots(db, target_date=target, service_id=service_id)
    return schemas.AvailabilityResponse(
        date=date,
        service_id=service_id,
        available_slots=slots,
    )


@router.post("/public", response_model=schemas.PublicBookingResponse, status_code=201)
# @limiter.limit("3/hour")
def public_booking(request: Request, booking: schemas.PublicBookingRequest, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    """
    Landing page booking endpoint.
    - Finds or creates the client (deduplication by email / phone).
    - Creates the appointment with status='web_pending'.
    """
    if not booking.client_email and not booking.client_phone:
        raise HTTPException(
            status_code=422,
            detail="Provide at least one of: client_email, client_phone"
        )
    service = db.query(models.Service).filter(models.Service.id == booking.service_id).first()
    settings = get_clinic_settings(db)
    
    # Creamos la cita inicialmente SIN enviar email. 
    # Decidiremos si enviarlo después de intentar generar el pago de Stripe.
    try:
        appt, client, is_new = crud.create_public_appointment(db, booking, background_tasks=background_tasks, send_email=False)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    checkout_url = None

    if service and service.requires_deposit and service.deposit_amount and settings.stripe_account_id and settings.stripe_charges_enabled:
        stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'unit_amount': int(service.deposit_amount * 100),
                        'product_data': {
                            'name': f"Fianza - {service.name}",
                            'description': f"Reserva {appt.start_time.strftime('%d/%m/%Y %H:%M')}",
                        },
                    },
                    'quantity': 1,
                }],
                mode='payment',
                success_url=f"{frontend_url}/reserva/exito?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{frontend_url}/reserva/cancelada",
                client_reference_id=appt.id,
                stripe_account=settings.stripe_account_id # Cargo directo en cuenta conectada
            )
            
            appt.status = "awaiting_payment"
            appt.payment_status = "awaiting_payment"
            db.commit()
            
            checkout_url = session.url
            
            # Programar la liberación del slot a los 10 minutos
            def release_unpaid_slot(appt_id):
                from ..database import SessionLocal
                from ..models import Appointment
                db_local = SessionLocal()
                try:
                    appointment = db_local.query(Appointment).filter(Appointment.id == appt_id).first()
                    if appointment and appointment.payment_status == "awaiting_payment":
                        appointment.status = "cancelled"
                        appointment.notes = (appointment.notes or "") + "\n[Sistema] Cita cancelada por falta de pago (fianza expirada)."
                        db_local.commit()
                        print(f"Slot liberado: Cita {appt_id} cancelada tras 10 min sin pago.")
                finally:
                    db_local.close()

            run_date = datetime.now() + timedelta(minutes=10)
            scheduler.add_job(release_unpaid_slot, 'date', run_date=run_date, args=[appt.id])

            # RESTAURAR NOTIFICACIÓN INICIAL (Para que suene el sonido en el panel)
            from ..crud.appointments import notify_admin_new_appointment
            notify_admin_new_appointment(db, appt)

        except Exception as e:
            print(f"Error creando sesión de Stripe: {e}")
            # Si falla Stripe, permitimos la reserva normal web_pending
            pass

    # Si al final no hay checkout_url (porque no se requiere fianza o falló Stripe),
    # enviamos el correo de verificación inicial ahora.
    if not checkout_url:
        background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'verification_email')

    return schemas.PublicBookingResponse(
        appointment_id=appt.id,
        client_id=client.id,
        is_new_client=is_new,
        start_time=appt.start_time,
        end_time=appt.end_time,
        status=appt.status,
        checkout_url=checkout_url
    )


# ─── Internal CRUD endpoints ────────────────────────────────────────────────

@router.post("/", response_model=schemas.AppointmentResponse)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(database.get_db)):
    try:
        return crud.create_appointment(db=db, appointment=appointment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.AppointmentResponse])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_appointments(db, skip=skip, limit=limit)

@router.patch("/{appointment_id}", response_model=schemas.AppointmentResponse)
def update_appointment(appointment_id: str, appointment_update: schemas.AppointmentUpdate, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    try:
        db_appointment = crud.update_appointment(db, appointment_id=appointment_id, appointment=appointment_update, background_tasks=background_tasks)
        if db_appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return db_appointment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: str, db: Session = Depends(database.get_db)):
    db_appointment = crud.delete_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"ok": True}
