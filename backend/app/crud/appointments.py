from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, func
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

def auto_cancel_expired_pending_appointments(db: Session, tenant_id: str = None) -> int:
    """
    Liberación en tiempo real: Cancela cualquier cita en 'pending_verification',
    'awaiting_payment' o 'web_pending' creada hace más de 10 minutos para liberar
    inmediatamente el hueco antes de calcular disponibilidad o validar colisiones.
    """
    if not tenant_id:
        tenant_id = current_tenant_var.get()

    limit_time = datetime.utcnow() - timedelta(minutes=10)
    query = db.query(models.Appointment).filter(
        models.Appointment.status.in_(["pending_verification", "awaiting_payment", "web_pending"]),
        models.Appointment.created_at < limit_time
    )
    if tenant_id:
        query = query.filter(models.Appointment.tenant_id == tenant_id)

    expired_appts = query.all()
    if not expired_appts:
        return 0

    for appt in expired_appts:
        old_status = appt.status
        appt.status = "cancelled"
        if old_status == "pending_verification":
            reason = "código OTP no introducido en el tiempo límite (10 min)"
        elif old_status == "awaiting_payment":
            reason = "tiempo de fianza expirado sin pago (10 min)"
        else:
            reason = "reserva pendiente expirada tras 10 min"

        appt.notes = (appt.notes or "") + f"\n[Sistema] Cita cancelada automáticamente: {reason}."
        
        # Eliminar códigos de verificación asociados
        db.query(models.VerificationCode).filter(
            models.VerificationCode.appointment_id == appt.id
        ).delete()

    try:
        db.commit()
    except Exception:
        db.rollback()

    return len(expired_appts)

# Appointments
def check_appointment_collision(
    db: Session, 
    start_time: datetime, 
    end_time: datetime, 
    staff_id: str = None, 
    location_id: str = None, 
    service_id: str = None,
    resource_id: str = None,
    ignore_id: str = None
):
    """
    Verifica colisiones de citas y bloqueos considerando:
    1. Horario de cierre y días laborables de la clínica.
    2. Horario de almuerzo / descanso.
    3. Bloqueos de tiempo globales (del centro) o personales del especialista.
    4. Aforo máximo de sede (max_concurrent_appointments si está configurado).
    5. Recursos físicos / cabinas / equipamiento (si el servicio lo requiere).
    6. Citas simultáneas:
       - Si staff_id está definido: valida que ese especialista no tenga otra cita solapada.
       - Si staff_id es None: valida que no se supere el aforo de especialistas disponibles.
       - Citas en otras sedes no bloquean sedes distintas.
    """
    tenant_id = current_tenant_var.get()
    auto_cancel_expired_pending_appointments(db, tenant_id)
    settings = get_clinic_settings(db)

    # 1. Horario de cierre configurado
    close_time_str = settings.close_time if settings and settings.close_time else "19:00"
    close_h, close_m = map(int, close_time_str.split(':'))
    close_limit = end_time.replace(hour=close_h, minute=close_m, second=0, microsecond=0)
    if end_time > close_limit:
        return f"La cita excede el horario de cierre configurado ({close_time_str})."

    # 1b. Días laborables configurados
    raw_wd = getattr(settings, 'working_days', None)
    if raw_wd and isinstance(raw_wd, str):
        import json
        working_days = json.loads(raw_wd)
    else:
        working_days = raw_wd or [1, 2, 3, 4, 5]
    day_index = start_time.isoweekday()  # 1=Mon, 7=Sun
    if day_index not in list(working_days):
        return "La clínica está cerrada ese día según la configuración del panel."

    # 1c. Restricción de tiempo pasado
    if start_time < get_spain_now():
        return "No puedes reservar una cita en el pasado."

    # 1d. Horario de descanso / almuerzo
    lunch_start_str = settings.lunch_start if settings and settings.lunch_start else None
    lunch_end_str = settings.lunch_end if settings and settings.lunch_end else None
    if lunch_start_str and lunch_end_str:
        l_sh, l_sm = map(int, lunch_start_str.split(':'))
        l_eh, l_em = map(int, lunch_end_str.split(':'))
        lunch_start = start_time.replace(hour=l_sh, minute=l_sm, second=0, microsecond=0)
        lunch_end = start_time.replace(hour=l_eh, minute=l_em, second=0, microsecond=0)
        if max(start_time, lunch_start) < min(end_time, lunch_end):
            return f"La cita invade el horario de descanso/almuerzo de la clínica ({lunch_start_str} - {lunch_end_str})."

    # 2. Bloqueos Globales del Centro (staff_id == None bloquea toda la clínica)
    global_block = db.query(models.TimeBlock).filter(
        models.TimeBlock.tenant_id == tenant_id,
        models.TimeBlock.start_time < end_time,
        models.TimeBlock.end_time > start_time,
        models.TimeBlock.staff_id == None
    ).first()
    if global_block:
        return f"El horario está bloqueado en el centro{f' ({global_block.reason})' if global_block.reason else ''}."

    # 2b. Control de Capacidad Máxima Global de la Sede (Aforo físico)
    if location_id:
        loc_obj = db.query(models.Location).filter(
            models.Location.id == location_id,
            models.Location.tenant_id == tenant_id
        ).first()
        if loc_obj and loc_obj.max_concurrent_appointments and loc_obj.max_concurrent_appointments > 0:
            loc_appts_q = db.query(models.Appointment).filter(
                models.Appointment.tenant_id == tenant_id,
                models.Appointment.status != "cancelled",
                models.Appointment.start_time < end_time,
                models.Appointment.end_time > start_time,
                models.Appointment.location_id == location_id
            )
            if ignore_id:
                loc_appts_q = loc_appts_q.filter(models.Appointment.id != ignore_id)
            if loc_appts_q.count() >= loc_obj.max_concurrent_appointments:
                return f"Se ha alcanzado el aforo máximo de la sede {loc_obj.name} ({loc_obj.max_concurrent_appointments} citas simultáneas)."

    # 2c. Control de Recursos Físicos / Cabinas / Máquinas
    target_resource_id = resource_id
    if not target_resource_id and service_id:
        srv = get_service(db, service_id)
        if srv and srv.required_resource_id:
            target_resource_id = srv.required_resource_id

    if target_resource_id:
        res = db.query(models.LocationResource).filter(
            models.LocationResource.id == target_resource_id,
            models.LocationResource.tenant_id == tenant_id,
            models.LocationResource.is_active == True
        ).first()
        if res:
            if location_id and res.location_id != location_id:
                return f"La cabina o equipamiento requerido ({res.name}) no pertenece a esta sede."

            res_appts_q = db.query(models.Appointment).filter(
                models.Appointment.tenant_id == tenant_id,
                models.Appointment.status != "cancelled",
                models.Appointment.start_time < end_time,
                models.Appointment.end_time > start_time,
                or_(
                    models.Appointment.resource_id == res.id,
                    models.Appointment.service_id.in_(
                        db.query(models.Service.id).filter(models.Service.required_resource_id == res.id)
                    )
                )
            )
            if ignore_id:
                res_appts_q = res_appts_q.filter(models.Appointment.id != ignore_id)

            occupied_count = res_appts_q.count()
            if occupied_count >= res.quantity:
                return f"La cabina o equipamiento requerido ({res.name}) ya está ocupado en ese horario ({occupied_count}/{res.quantity} unidades en uso)."

    # 3. Colisión de Citas y Bloqueos de Personal
    if staff_id:
        # A. Citas propias del especialista (un especialista no puede estar en dos citas a la vez)
        own_query = db.query(models.Appointment).filter(
            models.Appointment.tenant_id == tenant_id,
            models.Appointment.status != "cancelled",
            models.Appointment.start_time < end_time,
            models.Appointment.end_time > start_time,
            models.Appointment.staff_id == staff_id
        )
        if ignore_id:
            own_query = own_query.filter(models.Appointment.id != ignore_id)

        if own_query.first():
            return "El especialista seleccionado ya tiene otra cita en este horario."

        # B. Bloqueo personal del especialista
        staff_block = db.query(models.TimeBlock).filter(
            models.TimeBlock.tenant_id == tenant_id,
            models.TimeBlock.start_time < end_time,
            models.TimeBlock.end_time > start_time,
            models.TimeBlock.staff_id == staff_id
        ).first()
        if staff_block:
            return f"El especialista tiene su horario bloqueado{f' ({staff_block.reason})' if staff_block.reason else ''}."

    else:
        # Cuando NO se especifica especialista (staff_id is None):
        # Permitir concurrencia hasta el aforo de especialistas disponibles para esa franja y sede
        loc_filter = [
            models.Appointment.tenant_id == tenant_id,
            models.Appointment.status != "cancelled",
            models.Appointment.start_time < end_time,
            models.Appointment.end_time > start_time
        ]
        if location_id:
            loc_filter.append(or_(models.Appointment.location_id == location_id, models.Appointment.location_id == None))
        if ignore_id:
            loc_filter.append(models.Appointment.id != ignore_id)

        concurrent_count = db.query(models.Appointment).filter(*loc_filter).count()

        # Determinar capacidad de especialistas en la sede para esa franja horaria
        target_date = start_time.date()
        target_day = start_time.isoweekday()

        specific_scheds = db.query(models.StaffSchedule).filter(
            models.StaffSchedule.tenant_id == tenant_id,
            models.StaffSchedule.specific_date == target_date,
            models.StaffSchedule.is_active == True
        )
        if location_id:
            specific_scheds = specific_scheds.filter(models.StaffSchedule.location_id == location_id)
        spec_list = specific_scheds.all()

        overridden_staff_ids = {s.staff_id for s in spec_list}
        recurring_scheds = db.query(models.StaffSchedule).filter(
            models.StaffSchedule.tenant_id == tenant_id,
            models.StaffSchedule.day_of_week == target_day,
            models.StaffSchedule.specific_date == None,
            models.StaffSchedule.is_active == True,
            ~models.StaffSchedule.staff_id.in_(overridden_staff_ids) if overridden_staff_ids else True
        )
        if location_id:
            recurring_scheds = recurring_scheds.filter(models.StaffSchedule.location_id == location_id)
        rec_list = recurring_scheds.all()

        all_scheds = spec_list + rec_list

        if all_scheds:
            working_staff_ids = set()
            for s in all_scheds:
                try:
                    sh, sm = map(int, s.start_time.split(':'))
                    eh, em = map(int, s.end_time.split(':'))
                    shift_st = start_time.replace(hour=sh, minute=sm, second=0, microsecond=0)
                    shift_en = start_time.replace(hour=eh, minute=em, second=0, microsecond=0)
                    if start_time >= shift_st and end_time <= shift_en:
                        working_staff_ids.add(s.staff_id)
                except Exception:
                    working_staff_ids.add(s.staff_id)

            max_capacity = max(len(working_staff_ids), 1)
            if concurrent_count >= max_capacity:
                return "No hay ningún especialista libre en este horario para esta sede."
        else:
            # Si no hay turnos configurados, considerar aforo por especialistas activos en el tenant
            active_staff_count = db.query(models.Profile).filter(
                models.Profile.tenant_id == tenant_id,
                func.lower(models.Profile.role).in_(["specialist", "especialista", "admin", "administrador"])
            ).count()
            max_capacity = max(active_staff_count, 1)
            if concurrent_count >= max_capacity:
                return "El aforo máximo de citas simultáneas está completo para este horario."

    return None

def get_appointments(
    db: Session, 
    skip: int = 0, 
    limit: int = None,
    start_date: datetime = None,
    end_date: datetime = None
):
    tenant_id = current_tenant_var.get()
    auto_cancel_expired_pending_appointments(db, tenant_id)
    query = db.query(models.Appointment).filter(models.Appointment.tenant_id == tenant_id)
    
    if start_date:
        query = query.filter(models.Appointment.start_time >= start_date)
    if end_date:
        query = query.filter(models.Appointment.start_time <= end_date)
        
    query = query.order_by(models.Appointment.start_time.asc())
    
    if skip:
        query = query.offset(skip)
    if limit is not None and limit > 0:
        query = query.limit(limit)
        
    return query.all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    tenant_id = current_tenant_var.get()
    
    appt_data = appointment.model_dump()
    dur_a = appt_data.pop("duration_minutes", None)
    dur_b = appt_data.pop("custom_duration", None)
    duration_mins = dur_a if (dur_a is not None and dur_a > 0) else dur_b

    # Calcular end_time con duración personalizada si se proporciona, o recurrir a la del servicio
    if duration_mins and int(duration_mins) > 0:
        appointment.end_time = appointment.start_time + timedelta(minutes=int(duration_mins))
        appt_data["end_time"] = appointment.end_time
    elif not appointment.end_time:
        service = get_service(db, appointment.service_id)
        if service:
            appointment.end_time = appointment.start_time + timedelta(minutes=service.duration_minutes)
            appt_data["end_time"] = appointment.end_time

    collision_msg = check_appointment_collision(
        db, 
        appointment.start_time, 
        appointment.end_time, 
        staff_id=appointment.staff_id, 
        location_id=appointment.location_id,
        service_id=appointment.service_id,
        resource_id=getattr(appointment, 'resource_id', None)
    )
    if collision_msg:
        raise ValueError(collision_msg)

    # Filtrar solo columnas válidas de la tabla appointments para evitar TypeErrors
    valid_cols = {c.name for c in models.Appointment.__table__.columns}
    filtered_data = {k: v for k, v in appt_data.items() if k in valid_cols}
    filtered_data["tenant_id"] = tenant_id

    # Auto-asignación de resource_id si el servicio lo requiere
    if not filtered_data.get("resource_id"):
        service_obj = get_service(db, appointment.service_id)
        if service_obj and service_obj.required_resource_id:
            filtered_data["resource_id"] = service_obj.required_resource_id

    # Auto-asignación de staff_id y location_id si no vienen especificados
    if not filtered_data.get("staff_id"):
        from sqlalchemy import func
        specialists = db.query(models.Profile).filter(
            models.Profile.tenant_id == tenant_id,
            func.lower(models.Profile.role).in_(["specialist", "especialista", "admin", "administrador"])
        ).all()
        if len(specialists) == 1:
            filtered_data["staff_id"] = specialists[0].id
        elif len(specialists) > 1:
            day_idx = appointment.start_time.isoweekday()
            active_schedule = db.query(models.StaffSchedule).filter(
                models.StaffSchedule.tenant_id == tenant_id,
                models.StaffSchedule.day_of_week == day_idx,
                models.StaffSchedule.is_active == True
            ).first()
            if active_schedule:
                filtered_data["staff_id"] = active_schedule.staff_id
            else:
                filtered_data["staff_id"] = specialists[0].id

    if not filtered_data.get("location_id"):
        loc = db.query(models.Location).filter(
            models.Location.tenant_id == tenant_id,
            models.Location.is_active == True
        ).first()
        if loc:
            filtered_data["location_id"] = loc.id

    db_appointment = models.Appointment(**filtered_data)
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
        dur_a = update_data.pop("duration_minutes", None)
        dur_b = update_data.pop("custom_duration", None)
        duration_mins = dur_a if (dur_a is not None and dur_a > 0) else dur_b

        # Check for collision if time, duration, staff or location is changing
        new_start = update_data.get("start_time", db_appointment.start_time)
        new_staff = update_data.get("staff_id", db_appointment.staff_id)
        new_location = update_data.get("location_id", db_appointment.location_id)

        if duration_mins and int(duration_mins) > 0:
            new_end = new_start + timedelta(minutes=int(duration_mins))
            update_data["end_time"] = new_end
        else:
            new_end = update_data.get("end_time", db_appointment.end_time)
            if "start_time" in update_data and "end_time" not in update_data:
                prev_duration = int((db_appointment.end_time - db_appointment.start_time).total_seconds() / 60) if (db_appointment.end_time and db_appointment.start_time) else None
                if not prev_duration or prev_duration <= 0:
                    service = get_service(db, db_appointment.service_id)
                    prev_duration = service.duration_minutes if service else 30
                new_end = new_start + timedelta(minutes=prev_duration)
                update_data["end_time"] = new_end

        new_service = update_data.get("service_id", db_appointment.service_id)
        new_resource = update_data.get("resource_id", db_appointment.resource_id)

        if "start_time" in update_data or "end_time" in update_data or "staff_id" in update_data or "location_id" in update_data or "service_id" in update_data or "resource_id" in update_data or duration_mins:
            collision_msg = check_appointment_collision(
                db, 
                new_start, 
                new_end, 
                staff_id=new_staff, 
                location_id=new_location,
                service_id=new_service,
                resource_id=new_resource,
                ignore_id=appointment_id
            )
            if collision_msg:
                raise ValueError(collision_msg)

        valid_cols = {c.name for c in models.Appointment.__table__.columns}
        for key, value in update_data.items():
            if key in valid_cols:
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
    auto_cancel_expired_pending_appointments(db, tenant_id)
    settings = get_clinic_settings(db)
    margin_hours = float(settings.booking_margin_hours) if settings.booking_margin_hours else 0.0

    service = get_service(db, service_id)
    if not service:
        return []
    duration = timedelta(minutes=int(service.duration_minutes))
    day_index = target_date.isoweekday() # 1=Mon ... 7=Sun

    # Validación de recurso / cabina física requerida
    required_res = None
    if service.required_resource_id:
        required_res = db.query(models.LocationResource).filter(
            models.LocationResource.id == service.required_resource_id,
            models.LocationResource.tenant_id == tenant_id,
            models.LocationResource.is_active == True
        ).first()

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
                        if b_end.hour == 0 and b_end.minute == 0 and b_end.second == 0 and b_end >= b_start:
                            b_end = b_end.replace(hour=23, minute=59, second=59)
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
        or_(
            models.Appointment.staff_id.in_(staff_ids),
            models.Appointment.staff_id == None
        ),
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
    unassigned_appts = []
    for appt in existing_appts:
        if appt.staff_id in appts_by_staff:
            appts_by_staff[appt.staff_id].append(appt)
        elif appt.staff_id is None:
            unassigned_appts.append(appt)
            
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
            
        staff_appts = list(appts_by_staff.get(sid, []))
        if len(staff_ids) == 1 or preferred_staff_id:
            staff_appts.extend(unassigned_appts)

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
                        if b_end.hour == 0 and b_end.minute == 0 and b_end.second == 0 and b_end >= b_start:
                            b_end = b_end.replace(hour=23, minute=59, second=59)
                        if max(slot, b_start) < min(slot_end, b_end):
                            overlaps = True
                            break

                # Control multi-especialista si hay citas sin asignar en la clínica
                if not overlaps and unassigned_appts and len(staff_ids) > 1 and not preferred_staff_id:
                    overlapping_unassigned = sum(
                        1 for ua in unassigned_appts
                        if max(slot, (ua.start_time.replace(tzinfo=None) if ua.start_time.tzinfo else ua.start_time)) < 
                           min(slot_end, (ua.end_time.replace(tzinfo=None) if ua.end_time.tzinfo else ua.end_time))
                    )
                    if overlapping_unassigned > 0:
                        free_staff_count = 0
                        for other_sched in all_schedules:
                            other_sid = other_sched.staff_id
                            osh, osm = map(int, other_sched.start_time.split(':'))
                            oeh, oem = map(int, other_sched.end_time.split(':'))
                            other_st = datetime(target_date.year, target_date.month, target_date.day, osh, osm)
                            other_en = datetime(target_date.year, target_date.month, target_date.day, oeh, oem)
                            if slot >= other_st and slot_end <= other_en:
                                other_busy = False
                                for oa in appts_by_staff.get(other_sid, []):
                                    oa_start = oa.start_time.replace(tzinfo=None) if oa.start_time.tzinfo else oa.start_time
                                    oa_end   = oa.end_time.replace(tzinfo=None) if oa.end_time.tzinfo else oa.end_time
                                    if max(slot, oa_start) < min(slot_end, oa_end):
                                        other_busy = True
                                        break
                                if not other_busy:
                                    free_staff_count += 1
                        if free_staff_count <= overlapping_unassigned:
                            overlaps = True
                            
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
    # Liberación lazy: limpiar cualquier cita pendiente expirada antes de asignar o validar
    auto_cancel_expired_pending_appointments(db, tenant_id)

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
                    location_id=location_id,
                    service_id=booking.service_id,
                    resource_id=getattr(booking, "resource_id", None)
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
        collision_msg = check_appointment_collision(
            db, 
            booking.start_time, 
            end_time, 
            staff_id=None, 
            location_id=location_id,
            service_id=booking.service_id,
            resource_id=getattr(booking, "resource_id", None)
        )
        if collision_msg:
            raise ValueError(collision_msg)

    if getattr(booking, "save_address_to_crm", False) and client:
        client.address = booking.client_address
        client.client_latitude = booking.client_latitude
        client.client_longitude = booking.client_longitude
        client.client_postal_code = booking.client_postal_code
        client.client_city = booking.client_city
        db.add(client)

    import random

    is_verified_client = bool(getattr(client, "is_verified", False))
    initial_status = "confirmed" if is_verified_client else "pending_verification"

    appt = models.Appointment(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        client_id=client.id,
        service_id=booking.service_id,
        staff_id=assigned_staff_id,
        location_id=location_id,
        resource_id=getattr(booking, "resource_id", None) or (service.required_resource_id if service else None),
        start_time=booking.start_time,
        end_time=end_time,
        status=initial_status,
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

    if not is_verified_client:
        # Generar código OTP de 6 dígitos numéricos
        otp_code = f"{random.randint(100000, 999999)}"
        
        # Invalidar cualquier código anterior de este cliente o cita
        db.query(models.VerificationCode).filter(
            models.VerificationCode.tenant_id == tenant_id,
            models.VerificationCode.client_id == client.id
        ).delete()

        vc = models.VerificationCode(
            tenant_id=tenant_id,
            client_id=client.id,
            appointment_id=appt.id,
            code=otp_code,
            target_email=client.email or booking.client_email,
            expires_at=datetime.utcnow() + timedelta(minutes=10)
        )
        db.add(vc)
        db.commit()

        # Guardar otp_code en la instancia appt para acceso inmediato
        appt.otp_code = otp_code

        # El código de verificación OTP DEBE enviarse SIEMPRE, incondicionalmente
        # (send_email solo rige la confirmación posterior de la cita con Stripe).
        if background_tasks:
            background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'otp_verification', otp_code=otp_code)
        else:
            mailer.send_appointment_notification(appt.id, 'otp_verification', otp_code=otp_code)
    else:
        # Cliente recurrente ya verificado en este tenant: confirmar directamente
        if send_email:
            if background_tasks:
                background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'confirmation')
            else:
                mailer.send_appointment_notification(appt.id, 'confirmation')

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
                if b_end.hour == 0 and b_end.minute == 0 and b_end.second == 0 and b_end >= b_start:
                    b_end = b_end.replace(hour=23, minute=59, second=59)
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
                        if b_end.hour == 0 and b_end.minute == 0 and b_end.second == 0 and b_end >= b_start:
                            b_end = b_end.replace(hour=23, minute=59, second=59)
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
