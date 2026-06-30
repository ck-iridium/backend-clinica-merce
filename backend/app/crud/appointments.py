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
from ..database import current_tenant_var

_SLOT_STEP_MINUTES = 15

# Appointments
def check_appointment_collision(db: Session, start_time: datetime, end_time: datetime, staff_id: str = None, location_id: str = None, ignore_id: str = None):
    """
    Returns an error string if there's a collision with existing appointments or time blocks,
    or if the appointment exceeds the clinic's configured closing time.
    """
    tenant_id = current_tenant_var.get()
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

    # 2. Collision with other Appointments (scoped to tenant and specialist)
    query = db.query(models.Appointment).filter(
        models.Appointment.tenant_id == tenant_id,
        models.Appointment.status != "cancelled",
        models.Appointment.start_time < end_time,
        models.Appointment.end_time > start_time
    )
    if staff_id:
        query = query.filter(models.Appointment.staff_id == staff_id)
        
    if ignore_id:
        query = query.filter(models.Appointment.id != ignore_id)

    if query.first():
        return "El horario ya está ocupado por otra cita."

    # 3. Collision with Time Blocks (scoped to tenant and specialist or global)
    block_query = db.query(models.TimeBlock).filter(
        models.TimeBlock.tenant_id == tenant_id,
        models.TimeBlock.start_time < end_time,
        models.TimeBlock.end_time > start_time,
        or_(models.TimeBlock.staff_id == None, models.TimeBlock.staff_id == staff_id) if staff_id else models.TimeBlock.staff_id == None
    )
    if block_query.first():
        return "El horario está bloqueado manualmente."

    return None

def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    tenant_id = current_tenant_var.get()
    # Calculate end_time if not provided
    if not appointment.end_time:
        service = get_service(db, appointment.service_id)
        if service:
            appointment.end_time = appointment.start_time + timedelta(minutes=service.duration_minutes)

    collision_msg = check_appointment_collision(
        db, 
        appointment.start_time, 
        appointment.end_time, 
        staff_id=appointment.staff_id, 
        location_id=appointment.location_id
    )
    if collision_msg:
        raise ValueError(collision_msg)

    appt_data = appointment.model_dump()
    appt_data["tenant_id"] = tenant_id
    db_appointment = models.Appointment(**appt_data)
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: str, appointment: schemas.AppointmentUpdate, background_tasks: any = None):
    tenant_id = current_tenant_var.get()
    db_appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.tenant_id == tenant_id
    ).first()
    if db_appointment:
        old_status = db_appointment.status
        update_data = appointment.model_dump(exclude_unset=True)

        # Check for collision if time is changing
        new_start = update_data.get("start_time", db_appointment.start_time)
        new_end = update_data.get("end_time", db_appointment.end_time)
        new_staff = update_data.get("staff_id", db_appointment.staff_id)
        new_location = update_data.get("location_id", db_appointment.location_id)

        if "start_time" in update_data and "end_time" not in update_data:
             service = get_service(db, db_appointment.service_id)
             if service:
                  new_end = new_start + timedelta(minutes=service.duration_minutes)

        if "start_time" in update_data or "end_time" in update_data or "staff_id" in update_data or "location_id" in update_data:
            collision_msg = check_appointment_collision(
                db, 
                new_start, 
                new_end, 
                staff_id=new_staff, 
                location_id=new_location, 
                ignore_id=appointment_id
            )
            if collision_msg:
                raise ValueError(collision_msg)

        for key, value in update_data.items():
            setattr(db_appointment, key, value)

        # Magic Logic: If marked as completed, decrement 1 from active voucher if exists
        if old_status != "completed" and db_appointment.status == "completed":
            active_voucher = db.query(models.Voucher).filter(
                models.Voucher.tenant_id == tenant_id,
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
    tenant_id = current_tenant_var.get()
    db_appointment = db.query(models.Appointment).filter(
        models.Appointment.id == appointment_id,
        models.Appointment.tenant_id == tenant_id
    ).first()
    if db_appointment:
        db.delete(db_appointment)
        db.commit()
    return db_appointment

def get_availability_slots(db: Session, target_date: date, service_id: str, location_id: str = None, preferred_staff_id: str = None) -> List[str]:
    """Return available time slots (HH:MM strings) for a given date and service at a specific location."""
    tenant_id = current_tenant_var.get()
    settings = get_clinic_settings(db)
    margin_hours = float(settings.booking_margin_hours) if settings.booking_margin_hours else 0.0

    service = get_service(db, service_id)
    if not service:
        return []
    duration = timedelta(minutes=int(service.duration_minutes))
    day_index = target_date.isoweekday() # 1=Mon ... 7=Sun

    # 1. Resolver Sede (Location)
    if not location_id:
        # Fallback: buscar la primera sede activa del inquilino
        first_loc = db.query(models.Location).filter(
            models.Location.tenant_id == tenant_id,
            models.Location.is_active == True
        ).first()
        if first_loc:
            location_id = first_loc.id
        
    # Si sigue sin haber sedes activas, caemos en el comportamiento antiguo monolítico
    if not location_id:
        raw_wd = getattr(settings, 'working_days', None)
        if raw_wd and isinstance(raw_wd, str):
            import json
            working_days = json.loads(raw_wd)
        else:
            working_days = raw_wd or [1, 2, 3, 4, 5]
        if day_index not in list(working_days):
            return []
            
        open_time_str = settings.open_time if settings and settings.open_time else "09:00"
        close_time_str = settings.close_time if settings and settings.close_time else "19:00"
        lunch_start_str = settings.lunch_start if settings and settings.lunch_start else None
        lunch_end_str = settings.lunch_end if settings and settings.lunch_end else None
        
        open_h, open_m = map(int, open_time_str.split(':'))
        close_h, close_m = map(int, close_time_str.split(':'))
        
        if lunch_start_str and lunch_end_str:
            lh_s, lm_s = map(int, lunch_start_str.split(':'))
            lh_e, lm_e = map(int, lunch_end_str.split(':'))
            schedule_blocks = [(open_h, open_m, lh_s, lm_s), (lh_e, lm_e, close_h, close_m)]
        else:
            schedule_blocks = [(open_h, open_m, close_h, close_m)]
            
        day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0)
        day_end   = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59)
        existing_appts = db.query(models.Appointment).filter(
            models.Appointment.tenant_id == tenant_id,
            models.Appointment.start_time >= day_start,
            models.Appointment.start_time <= day_end,
            models.Appointment.status != "cancelled",
        ).all()
        existing_blocks = db.query(models.TimeBlock).filter(
            models.TimeBlock.tenant_id == tenant_id,
            models.TimeBlock.start_time <= day_end,
            models.TimeBlock.end_time >= day_start,
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
                for appt in existing_appts:
                    a_start = appt.start_time.replace(tzinfo=None) if appt.start_time.tzinfo else appt.start_time
                    a_end   = appt.end_time.replace(tzinfo=None) if appt.end_time.tzinfo else appt.end_time
                    if max(slot, a_start) < min(slot_end, a_end):
                        overlaps = True
                        break
                if not overlaps:
                    for block in existing_blocks:
                        b_start = block.start_time.replace(tzinfo=None) if block.start_time.tzinfo else block.start_time
                        b_end   = block.end_time.replace(tzinfo=None) if block.end_time.tzinfo else block.end_time
                        if max(slot, b_start) < min(slot_end, b_end):
                            overlaps = True
                            break
                if not overlaps and slot.date() == now_spain.date():
                    if slot < now_spain + timedelta(hours=margin_hours):
                        overlaps = True
                if not overlaps:
                    available.append(slot.strftime("%H:%M"))
                slot += step
        return available

    # 2. SISTEMA ROSTERING ACTIVO
    specific_schedules = db.query(models.StaffSchedule).filter(
        models.StaffSchedule.tenant_id == tenant_id,
        models.StaffSchedule.specific_date == target_date,
        models.StaffSchedule.is_active == True
    ).all()
    
    overridden_staff_ids = {s.staff_id for s in specific_schedules}
    
    recurring_schedules = db.query(models.StaffSchedule).filter(
        models.StaffSchedule.tenant_id == tenant_id,
        models.StaffSchedule.day_of_week == day_index,
        models.StaffSchedule.specific_date == None,
        models.StaffSchedule.is_active == True,
        ~models.StaffSchedule.staff_id.in_(overridden_staff_ids) if overridden_staff_ids else True
    ).all()
    
    all_schedules = [s for s in specific_schedules if s.location_id == location_id] + \
                    [s for s in recurring_schedules if s.location_id == location_id]
                    
    if preferred_staff_id and preferred_staff_id != "any" and preferred_staff_id != "Cualquiera":
        all_schedules = [s for s in all_schedules if s.staff_id == preferred_staff_id]
        
    if not all_schedules:
        return []

    day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0)
    day_end   = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59)
    now_spain = get_spain_now()
    step = timedelta(minutes=_SLOT_STEP_MINUTES)
    
    staff_ids = {s.staff_id for s in all_schedules}
    existing_appts = db.query(models.Appointment).filter(
        models.Appointment.tenant_id == tenant_id,
        models.Appointment.staff_id.in_(staff_ids),
        models.Appointment.start_time >= day_start,
        models.Appointment.start_time <= day_end,
        models.Appointment.status != "cancelled",
    ).all()
    
    existing_blocks = db.query(models.TimeBlock).filter(
        models.TimeBlock.tenant_id == tenant_id,
        models.TimeBlock.start_time <= day_end,
        models.TimeBlock.end_time >= day_start,
        or_(models.TimeBlock.staff_id == None, models.TimeBlock.staff_id.in_(staff_ids))
    ).all()

    appts_by_staff = {sid: [] for sid in staff_ids}
    for appt in existing_appts:
        if appt.staff_id in appts_by_staff:
            appts_by_staff[appt.staff_id].append(appt)
            
    blocks_by_staff = {sid: [] for sid in staff_ids}
    global_blocks = []
    for block in existing_blocks:
        if block.staff_id is None:
            global_blocks.append(block)
        elif block.staff_id in blocks_by_staff:
            blocks_by_staff[block.staff_id].append(block)

    union_slots = set()
    
    for schedule in all_schedules:
        sid = schedule.staff_id
        sh, sm = map(int, schedule.start_time.split(':'))
        eh, em = map(int, schedule.end_time.split(':'))
        
        lunch_start_str = settings.lunch_start if settings and settings.lunch_start else None
        lunch_end_str = settings.lunch_end if settings and settings.lunch_end else None
        
        schedule_blocks = []
        if lunch_start_str and lunch_end_str:
            lh_s, lm_s = map(int, lunch_start_str.split(':'))
            lh_e, lm_e = map(int, lunch_end_str.split(':'))
            lunch_start_mins = lh_s * 60 + lm_s
            lunch_end_mins = lh_e * 60 + lm_e
            staff_start_mins = sh * 60 + sm
            staff_end_mins = eh * 60 + em
            
            if staff_start_mins < lunch_start_mins and staff_end_mins > lunch_end_mins:
                schedule_blocks = [(sh, sm, lh_s, lm_s), (lh_e, lm_e, eh, em)]
            else:
                schedule_blocks = [(sh, sm, eh, em)]
        else:
            schedule_blocks = [(sh, sm, eh, em)]
            
        staff_appts = appts_by_staff.get(sid, [])
        staff_blocks = blocks_by_staff.get(sid, []) + global_blocks
        
        for (st_h, st_m, en_h, en_m) in schedule_blocks:
            slot = datetime(target_date.year, target_date.month, target_date.day, st_h, st_m)
            limit = datetime(target_date.year, target_date.month, target_date.day, en_h, en_m)
            
            while slot + duration <= limit:
                slot_end = slot + duration
                overlaps = False
                
                for appt in staff_appts:
                    a_start = appt.start_time.replace(tzinfo=None) if appt.start_time.tzinfo else appt.start_time
                    a_end   = appt.end_time.replace(tzinfo=None) if appt.end_time.tzinfo else appt.end_time
                    if max(slot, a_start) < min(slot_end, a_end):
                        overlaps = True
                        break
                        
                if not overlaps:
                    for block in staff_blocks:
                        b_start = block.start_time.replace(tzinfo=None) if block.start_time.tzinfo else block.start_time
                        b_end   = block.end_time.replace(tzinfo=None) if block.end_time.tzinfo else block.end_time
                        if max(slot, b_start) < min(slot_end, b_end):
                            overlaps = True
                            break
                            
                if not overlaps and slot.date() == now_spain.date():
                    if slot < now_spain + timedelta(hours=margin_hours):
                        overlaps = True
                        
                if not overlaps:
                    union_slots.add(slot.strftime("%H:%M"))
                    
                slot += step

    return sorted(list(union_slots))

def create_public_appointment(db: Session, booking: schemas.PublicBookingRequest, background_tasks: any = None, send_email: bool = True):
    """Idempotent public booking: find-or-create client, auto-assign specialist, then create appointment."""
    tenant_id = current_tenant_var.get()

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

    # --- AUTO-ASSIGN SPECIALIST ---
    location_id = getattr(booking, "location_id", None)
    if not location_id:
        first_loc = db.query(models.Location).filter(
            models.Location.tenant_id == tenant_id,
            models.Location.is_active == True
        ).first()
        if first_loc:
            location_id = first_loc.id

    pref_staff_id = getattr(booking, "staff_id", None)
    assigned_staff_id = None

    day_index = booking.start_time.isoweekday()
    target_date = booking.start_time.date()

    specific_schedules = db.query(models.StaffSchedule).filter(
        models.StaffSchedule.tenant_id == tenant_id,
        models.StaffSchedule.specific_date == target_date,
        models.StaffSchedule.is_active == True
    ).all()
    overridden_staff_ids = {s.staff_id for s in specific_schedules}

    recurring_schedules = db.query(models.StaffSchedule).filter(
        models.StaffSchedule.tenant_id == tenant_id,
        models.StaffSchedule.day_of_week == day_index,
        models.StaffSchedule.specific_date == None,
        models.StaffSchedule.is_active == True,
        ~models.StaffSchedule.staff_id.in_(overridden_staff_ids) if overridden_staff_ids else True
    ).all()

    all_schedules = [s for s in specific_schedules if s.location_id == location_id] + \
                    [s for s in recurring_schedules if s.location_id == location_id]

    if pref_staff_id and pref_staff_id != "any" and pref_staff_id != "Cualquiera":
        all_schedules = [s for s in all_schedules if s.staff_id == pref_staff_id]

    free_staff_ids = []
    for schedule in all_schedules:
        sid = schedule.staff_id
        sh, sm = map(int, schedule.start_time.split(':'))
        eh, em = map(int, schedule.end_time.split(':'))
        shift_start = booking.start_time.replace(hour=sh, minute=sm, second=0, microsecond=0)
        shift_end = booking.start_time.replace(hour=eh, minute=em, second=0, microsecond=0)

        if booking.start_time >= shift_start and end_time <= shift_end:
            settings = get_clinic_settings(db)
            lunch_start_str = settings.lunch_start if settings and settings.lunch_start else None
            lunch_end_str = settings.lunch_end if settings and settings.lunch_end else None
            lunch_overlaps = False
            if lunch_start_str and lunch_end_str:
                l_sh, l_sm = map(int, lunch_start_str.split(':'))
                l_eh, l_em = map(int, lunch_end_str.split(':'))
                lunch_start = booking.start_time.replace(hour=l_sh, minute=l_sm, second=0, microsecond=0)
                lunch_end = booking.start_time.replace(hour=l_eh, minute=l_em, second=0, microsecond=0)
                if max(booking.start_time, lunch_start) < min(end_time, lunch_end):
                    lunch_overlaps = True

            if not lunch_overlaps:
                collision_err = check_appointment_collision(
                    db,
                    booking.start_time,
                    end_time,
                    staff_id=sid,
                    location_id=location_id
                )
                if not collision_err:
                    free_staff_ids.append(sid)

    if not free_staff_ids:
        has_any_schedules = db.query(models.StaffSchedule).filter(models.StaffSchedule.tenant_id == tenant_id).first()
        if has_any_schedules:
            raise ValueError("No hay ningún especialista disponible para este horario.")
        else:
            assigned_staff_id = None
    else:
        assigned_staff_id = free_staff_ids[0]

    if not db.query(models.StaffSchedule).filter(models.StaffSchedule.tenant_id == tenant_id).first():
        collision_msg = check_appointment_collision(db, booking.start_time, end_time)
        if collision_msg:
            raise ValueError(collision_msg)

    if getattr(booking, "save_address_to_crm", False) and client:
        client.address = booking.client_address
        client.client_latitude = booking.client_latitude
        client.client_longitude = booking.client_longitude
        client.client_postal_code = booking.client_postal_code
        client.client_city = booking.client_city
        db.add(client)

    appt = models.Appointment(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        client_id=client.id,
        service_id=booking.service_id,
        staff_id=assigned_staff_id,
        location_id=location_id,
        start_time=booking.start_time,
        end_time=end_time,
        status="pending_verification",
        notes=booking.notes,
        service_modality=getattr(booking, "service_modality", "clinic"),
        client_address=getattr(booking, "client_address", None),
        client_latitude=getattr(booking, "client_latitude", None),
        client_longitude=getattr(booking, "client_longitude", None),
        client_postal_code=getattr(booking, "client_postal_code", None),
        client_city=getattr(booking, "client_city", None),
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

def rebuild_blocked_days_cache(db: Session, tenant_id: str):
    """
    Precomputes the blocked days cache for a given tenant.
    Saves it in clinic_settings.blocked_days_cache.
    Format:
    {
      "global": ["2026-07-02", ...],
      "staff": {
        "staff_uuid": ["2026-07-02", ...]
      }
    }
    """
    from datetime import date, datetime, timedelta
    from sqlalchemy import or_
    from ..models import ClinicSettings, User, TimeBlock, StaffSchedule
    
    settings = db.query(ClinicSettings).filter(ClinicSettings.tenant_id == tenant_id).first()
    if not settings:
        return
        
    # Get all active specialists/staff (all users of this tenant who are not clients)
    staff_members = db.query(User).filter(
        User.tenant_id == tenant_id,
        User.role != "client"
    ).all()
    staff_ids = [s.id for s in staff_members]
    
    # Range of 90 days starting today
    today = date.today()
    days_range = [today + timedelta(days=i) for i in range(90)]
    
    # Fetch all time blocks for the next 90 days
    start_dt = datetime(today.year, today.month, today.day, 0, 0, 0)
    end_dt = datetime(days_range[-1].year, days_range[-1].month, days_range[-1].day, 23, 59, 59)
    
    blocks = db.query(TimeBlock).filter(
        TimeBlock.tenant_id == tenant_id,
        TimeBlock.start_time <= end_dt,
        TimeBlock.end_time >= start_dt,
    ).all()
    
    # Fetch all schedules (specific and recurring)
    schedules = db.query(StaffSchedule).filter(
        StaffSchedule.tenant_id == tenant_id,
        StaffSchedule.is_active == True
    ).all()
    
    global_blocked = []
    staff_blocked = {sid: [] for sid in staff_ids}
    
    # Business hours helper
    open_time_str = settings.open_time or "09:00"
    close_time_str = settings.close_time or "19:30"
    
    for d in days_range:
        d_str = d.isoformat()
        day_index = d.isoweekday() # 1=Mon ... 7=Sun
        
        # 1. Check Global Block
        open_h, open_m = map(int, open_time_str.split(':'))
        close_h, close_m = map(int, close_time_str.split(':'))
        biz_start = datetime(d.year, d.month, d.day, open_h, open_m)
        biz_end = datetime(d.year, d.month, d.day, close_h, close_m)
        
        is_global_vacation = False
        for b in blocks:
            if b.staff_id is None: # Global block
                b_start = b.start_time.replace(tzinfo=None) if b.start_time.tzinfo else b.start_time
                b_end = b.end_time.replace(tzinfo=None) if b.end_time.tzinfo else b.end_time
                # If the global block covers the business hours
                if b_start <= biz_start and b_end >= biz_end:
                    is_global_vacation = True
                    break
                    
        if is_global_vacation:
            global_blocked.append(d_str)
            for sid in staff_ids:
                staff_blocked[sid].append(d_str)
            continue
            
        # 2. Check Staff Block
        for sid in staff_ids:
            # Find the schedule of this staff for this day
            specific = [s for s in schedules if s.staff_id == sid and s.specific_date == d]
            if specific:
                staff_scheds = specific
            else:
                staff_scheds = [s for s in schedules if s.staff_id == sid and s.day_of_week == day_index and s.specific_date is None]
                
            if not staff_scheds:
                staff_blocked[sid].append(d_str)
                continue
                
            is_staff_blocked = True
            for sched in staff_scheds:
                sch_h, sch_m = map(int, sched.start_time.split(':'))
                ech_h, ech_m = map(int, sched.end_time.split(':'))
                sched_start = datetime(d.year, d.month, d.day, sch_h, sch_m)
                sched_end = datetime(d.year, d.month, d.day, ech_h, ech_m)
                
                is_block_covered = False
                for b in blocks:
                    if b.staff_id is None or b.staff_id == sid:
                        b_start = b.start_time.replace(tzinfo=None) if b.start_time.tzinfo else b.start_time
                        b_end = b.end_time.replace(tzinfo=None) if b.end_time.tzinfo else b.end_time
                        if b_start <= sched_start and b_end >= sched_end:
                            is_block_covered = True
                            break
                if not is_block_covered:
                    is_staff_blocked = False
                    break
                    
            if is_staff_blocked:
                staff_blocked[sid].append(d_str)
                
    settings.blocked_days_cache = {
        "global": global_blocked,
        "staff": staff_blocked
    }
    db.commit()
