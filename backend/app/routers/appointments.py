from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks, Request
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
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
    location_id: Optional[str] = Query(None, description="Location UUID"),
    staff_id: Optional[str] = Query(None, description="Preferred Specialist UUID"),
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

    slots = crud.get_availability_slots(
        db, 
        target_date=target, 
        service_id=service_id,
        location_id=location_id,
        preferred_staff_id=staff_id
    )
    return schemas.AvailabilityResponse(
        date=date,
        service_id=service_id,
        location_id=location_id,
        available_slots=slots,
    )


@router.get("/client-saved-address", response_model=Dict[str, Any])
def get_client_saved_address(
    email: str = Query(..., description="Client email"),
    phone: str = Query(..., description="Client phone"),
    db: Session = Depends(database.get_db),
):
    """
    Recupera de forma segura la dirección guardada de un cliente si coinciden
    el email y el teléfono. Evita fugas de datos (fishing) al requerir ambos campos.
    """
    from ..database import current_tenant_var
    tenant_id = current_tenant_var.get()
    
    client = db.query(models.Client).filter(
        models.Client.tenant_id == tenant_id,
        models.Client.email == email.strip().lower(),
        models.Client.phone == phone.strip()
    ).first()
    
    if client and client.address:
        return {
            "has_saved_address": True,
            "client_name": client.name,
            "client_address": client.address,
            "client_latitude": client.client_latitude,
            "client_longitude": client.client_longitude,
            "client_postal_code": client.client_postal_code,
            "client_city": client.client_city
        }
        
    return {"has_saved_address": False}

import functools

def log_exceptions(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            print(f"[PUBLIC_BOOKING_ERROR] {e}\n{tb}", flush=True)
            try:
                with open("public_booking_error.txt", "w", encoding="utf-8") as f:
                    f.write(str(e) + "\n" + tb)
            except Exception:
                pass
            raise e
    return wrapper

@router.post("/public", response_model=schemas.PublicBookingResponse, status_code=201)
# @limiter.limit("3/hour")
@log_exceptions
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

    # ── VALIDACIONES DE MODALIDAD Y COBERTURA GEOGRÁFICA ──
    service = db.query(models.Service).filter(models.Service.id == booking.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Servicio no encontrado")
        
    settings = get_clinic_settings(db)
    
    # 1. Validar modalidad permitida por servicio
    allowed = service.allowed_modality or "clinic"
    requested = booking.service_modality or "clinic"
    
    if allowed == "home_only" and requested == "clinic":
        raise HTTPException(
            status_code=400,
            detail="Este servicio es exclusivo a domicilio."
        )
    if allowed == "clinic_only" and requested == "home":
        raise HTTPException(
            status_code=400,
            detail="Este servicio es exclusivo en clínica."
        )
        
    # 2. Validar que si es a domicilio, el profesional soporte domicilio
    if requested == "home":
        if settings.work_modality == "clinic_only":
            raise HTTPException(
                status_code=400,
                detail="El profesional no ofrece servicios a domicilio actualmente."
            )
            
        # Validar dirección y coordenadas
        if not booking.client_address or booking.client_latitude is None or booking.client_longitude is None:
            raise HTTPException(
                status_code=422,
                detail="La dirección y coordenadas geográficas son obligatorias para citas a domicilio."
            )
            
        # 3. Comprobar lista blanca de zonas híbrida
        in_whitelist = False
        if settings.whitelist_zones:
            import json
            try:
                whitelist = json.loads(settings.whitelist_zones)
            except Exception:
                whitelist = []
            
            if whitelist:
                postal_code = (booking.client_postal_code or "").strip().lower()
                city = (booking.client_city or "").strip().lower()
                for zone in whitelist:
                    zone_clean = str(zone).strip().lower()
                    if (postal_code and zone_clean == postal_code) or (city and zone_clean == city):
                        in_whitelist = True
                        break
                        
        # 4. Si no está en lista blanca, verificar radio kilométrico con Haversine
        if not in_whitelist:
            if settings.operations_center_latitude is None or settings.operations_center_longitude is None:
                raise HTTPException(
                    status_code=400,
                    detail="El profesional no tiene configurado su Centro de Operaciones para calcular la cobertura."
                )
                
            from ..utils.geo import calculate_haversine_distance
            distance = calculate_haversine_distance(
                settings.operations_center_latitude,
                settings.operations_center_longitude,
                booking.client_latitude,
                booking.client_longitude
            )
            
            max_radius = settings.max_coverage_radius_km or 10.0
            if distance > max_radius:
                raise HTTPException(
                    status_code=400,
                    detail=f"Lo sentimos, tu dirección está fuera de nuestro radio de cobertura. Estás a {distance:.1f} km, el límite es {max_radius:.1f} km."
                )
    
    # Creamos la cita inicialmente SIN enviar email. 
    # Decidiremos si enviarlo después de intentar generar el pago de Stripe.
    try:
        appt, client, is_new = crud.create_public_appointment(db, booking, background_tasks=background_tasks, send_email=False)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    checkout_url = None

    # ── Calcular importe de fianza con lógica de sobrescritura ──
    deposit_amount = 0.0
    requires_payment = False
    
    if service:
        if service.requires_deposit and service.deposit_amount and service.deposit_amount > 0:
            deposit_amount = float(service.deposit_amount)
            requires_payment = True
        elif settings.global_deposit_required and settings.global_deposit_amount and settings.global_deposit_amount > 0:
            # Si el servicio no tiene fianza individual y no está exento explícitamente (deposit_amount == 0)
            is_exempt = service.deposit_amount is not None and float(service.deposit_amount) == 0.0
            if not is_exempt:
                deposit_amount = float(settings.global_deposit_amount)
                requires_payment = True

    if requires_payment and settings.stripe_account_id and settings.stripe_charges_enabled:
        stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=['card'],
                line_items=[{
                    'price_data': {
                        'currency': 'eur',
                        'unit_amount': int(deposit_amount * 100),
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
                        
                        # Notificar cancelación al panel
                        from ..utils.notifications import create_admin_notification
                        create_admin_notification(
                            db_local,
                            title="⏰ Reserva Expirada",
                            description=f"Cita de {appointment.client.name} cancelada por falta de pago.",
                            type="warning",
                            metadata={"appointment_id": appt_id}
                        )
                        
                        print(f"Slot liberado: Cita {appt_id} cancelada tras 10 min sin pago.")
                finally:
                    db_local.close()

            run_date = datetime.now() + timedelta(minutes=10)
            scheduler.add_job(release_unpaid_slot, 'date', run_date=run_date, args=[appt.id])

            # RESTAURAR NOTIFICACIÓN INICIAL (Para que suene el sonido en el panel)
            from ..utils.notifications import create_admin_notification
            create_admin_notification(
                db, 
                title="✨ Nueva Reserva Web", 
                description=f"Cita de {client.name} para {appt.start_time.strftime('%H:%M')}",
                type="info",
                metadata={"appointment_id": appt.id}
            )

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
