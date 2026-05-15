from sqlalchemy.orm import Session
from sqlalchemy import or_
import uuid
from datetime import datetime, date, timedelta
from typing import List
from .. import models, schemas
from ..utils import mailer
from .utils import get_spain_now
from .settings import get_clinic_settings
from .services import get_service
from .clients import find_or_create_client

_SLOT_STEP_MINUTES = 15

# Appointments
def check_appointment_collision(db: Session, start_time: datetime, end_time: datetime, ignore_id: str = None):
    """
    Returns an error string if there's a collision with existing appointments or time blocks,
    or if the appointment exceeds the clinic's configured closing time.
    """
    settings = get_clinic_settings(db)

    # 1. Closing Time Check (Dynamic from ClinicSettings)
    close_time_str = settings.close_time if settings and settings.close_time else "19:00"
    close_h, close_m = map(int, close_time_str.split(':'))
    close_limit = end_time.replace(hour=close_h, minute=close_m, second=0, microsecond=0)
    if end_time > close_limit:
        return f"La cita excede el horario de cierre configurado ({close_time_str})."

    # 1b. Working Days Check (Dynamic from ClinicSettings)
    raw_wd = getattr(settings, 'working_days', None)
    if raw_wd and isinstance(raw_wd, str):
        import json
        working_days = json.loads(raw_wd)
    else:
        working_days = raw_wd or [1, 2, 3, 4, 5]
    day_index = start_time.isoweekday()  # 1=Mon, 7=Sun
    if day_index not in list(working_days):
        return "La clínica está cerrada ese día según la configuración del panel."
    
    # 1c. Past Time Restriction
    if start_time < get_spain_now():
        return "No puedes reservar una cita en el pasado."

    # 2. Collision with other Appointments
    query = db.query(models.Appointment).filter(
        models.Appointment.status != "cancelled",
        models.Appointment.start_time < end_time,
        models.Appointment.end_time > start_time
    )
    if ignore_id:
        query = query.filter(models.Appointment.id != ignore_id)
    
    if query.first():
        return "El horario ya está ocupado por otra cita."
        
    # 3. Collision with Time Blocks
    block_query = db.query(models.TimeBlock).filter(
        models.TimeBlock.start_time < end_time,
        models.TimeBlock.end_time > start_time
    )
    if block_query.first():
        return "El horario está bloqueado manualmente."

    return None

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    # Calculate end_time if not provided
    if not appointment.end_time:
        service = get_service(db, appointment.service_id)
        if service:
            appointment.end_time = appointment.start_time + timedelta(minutes=service.duration_minutes)
    
    collision_msg = check_appointment_collision(db, appointment.start_time, appointment.end_time)
    if collision_msg:
        raise ValueError(collision_msg)

    db_appointment = models.Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: str, appointment: schemas.AppointmentUpdate, background_tasks: any = None):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment:
        old_status = db_appointment.status
        update_data = appointment.model_dump(exclude_unset=True)
        
        # Check for collision if time is changing
        new_start = update_data.get("start_time", db_appointment.start_time)
        new_end = update_data.get("end_time", db_appointment.end_time)
        
        if "start_time" in update_data and "end_time" not in update_data:
             service = get_service(db, db_appointment.service_id)
             if service:
                  new_end = new_start + timedelta(minutes=service.duration_minutes)

        if "start_time" in update_data or "end_time" in update_data:
            collision_msg = check_appointment_collision(db, new_start, new_end, ignore_id=appointment_id)
            if collision_msg:
                raise ValueError(collision_msg)

        for key, value in update_data.items():
            setattr(db_appointment, key, value)
            
        # Magic Logic: If marked as completed, decrement 1 from active voucher if exists
        if old_status != "completed" and db_appointment.status == "completed":
            active_voucher = db.query(models.Voucher).filter(
                models.Voucher.client_id == db_appointment.client_id,
                models.Voucher.service_id == db_appointment.service_id,
                models.Voucher.used_sessions < models.Voucher.total_sessions,
                models.Voucher.expiration_date >= date.today()
            ).first()
            if active_voucher:
                active_voucher.used_sessions += 1
                db.add(active_voucher)
                
        db.commit()
        db.refresh(db_appointment)

        # Email Triggers
        if old_status == 'web_pending' and db_appointment.status == 'confirmed':
            if background_tasks:
                background_tasks.add_task(mailer.send_appointment_notification, db_appointment.id, 'confirmation')
            else:
                mailer.send_appointment_notification(db_appointment.id, 'confirmation')

    return db_appointment

def delete_appointment(db: Session, appointment_id: str):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

def get_availability_slots(db: Session, target_date: date, service_id: str) -> List[str]:
    """Return available time slots (HH:MM strings) for a given date and service."""
    settings = get_clinic_settings(db)
    margin_hours = float(settings.booking_margin_hours) if settings.booking_margin_hours else 0.0

    raw_wd = getattr(settings, 'working_days', None)
    if raw_wd and isinstance(raw_wd, str):
        import json
        working_days = json.loads(raw_wd)
    else:
        working_days = raw_wd or [1, 2, 3, 4, 5]
    day_index = target_date.isoweekday()
    if day_index not in list(working_days):
        return []

    service = get_service(db, service_id)
    if not service:
        return []
    duration = timedelta(minutes=int(service.duration_minutes))

    open_time_str = settings.open_time if settings and settings.open_time else "09:00"
    close_time_str = settings.close_time if settings and settings.close_time else "19:00"
    lunch_start_str = settings.lunch_start if settings and settings.lunch_start else None
    lunch_end_str = settings.lunch_end if settings and settings.lunch_end else None

    open_h, open_m = map(int, open_time_str.split(':'))
    close_h, close_m = map(int, close_time_str.split(':'))

    if lunch_start_str and lunch_end_str:
        lh_s, lm_s = map(int, lunch_start_str.split(':'))
        lh_e, lm_e = map(int, lunch_end_str.split(':'))
        schedule_blocks = [
            (open_h, open_m, lh_s, lm_s),
            (lh_e, lm_e, close_h, close_m),
        ]
    else:
        schedule_blocks = [(open_h, open_m, close_h, close_m)]

    day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0)
    day_end   = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59)
    # 1. Obtener citas (ignorando las canceladas)
    query_appts = db.query(models.Appointment).filter(
        models.Appointment.start_time >= day_start,
        models.Appointment.start_time <= day_end,
        models.Appointment.status != "cancelled",
    ).all()

    # 2. Las citas pendientes de pago (awaiting_payment) también bloquean la agenda
    # hasta que el cronjob (Barrendero) las cancele oficialmente.
    existing_appts = query_appts

    existing_blocks = db.query(models.TimeBlock).filter(
        models.TimeBlock.start_time >= day_start,
        models.TimeBlock.start_time <= day_end,
    ).all()

    available = []
    step = timedelta(minutes=_SLOT_STEP_MINUTES)
    now_spain = get_spain_now()

    for (sh, sm, eh, em) in schedule_blocks:
        block_start = datetime(target_date.year, target_date.month, target_date.day, sh, sm)
        block_end   = datetime(target_date.year, target_date.month, target_date.day, eh, em)
        slot = block_start

        while slot + duration <= block_end:
            slot_end = slot + duration
            overlaps = False

            # 1. Comprobar citas (incluyendo las pendientes de pago)
            for appt in existing_appts:
                a_start = appt.start_time.replace(tzinfo=None) if appt.start_time.tzinfo else appt.start_time
                a_end   = appt.end_time.replace(tzinfo=None) if appt.end_time.tzinfo else appt.end_time
                if max(slot, a_start) < min(slot_end, a_end):
                    overlaps = True
                    break
            
            # 2. Comprobar bloqueos manuales
            if not overlaps:
                for block in existing_blocks:
                    b_start = block.start_time.replace(tzinfo=None) if block.start_time.tzinfo else block.start_time
                    b_end   = block.end_time.replace(tzinfo=None) if block.end_time.tzinfo else block.end_time
                    if max(slot, b_start) < min(slot_end, b_end):
                        overlaps = True
                        break
            
            # 3. Comprobar margen de antelación
            if not overlaps:
                if slot.date() == now_spain.date():
                    if slot < now_spain + timedelta(hours=margin_hours):
                        overlaps = True

            if not overlaps:
                available.append(slot.strftime("%H:%M"))

            slot += step

    return available

def create_public_appointment(db: Session, booking: schemas.PublicBookingRequest, background_tasks: any = None, send_email: bool = True):
    """Idempotent public booking: find-or-create client, then create appointment."""
    client, is_new = find_or_create_client(
        db,
        name=booking.client_name,
        email=booking.client_email,
        phone=booking.client_phone,
    )

    service = get_service(db, booking.service_id)
    if not service:
        raise ValueError(f"Service {booking.service_id} not found")
    end_time = booking.start_time + timedelta(minutes=int(service.duration_minutes))

    collision_msg = check_appointment_collision(db, booking.start_time, end_time)
    if collision_msg:
        raise ValueError(collision_msg)

    appt = models.Appointment(
        id=str(uuid.uuid4()),
        client_id=client.id,
        service_id=booking.service_id,
        start_time=booking.start_time,
        end_time=end_time,
        status="pending_verification",
        notes=booking.notes,
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)

    if send_email:
        if background_tasks:
            background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'verification_email')
        else:
            mailer.send_appointment_notification(appt.id, 'verification_email')

    return appt, client, is_new
