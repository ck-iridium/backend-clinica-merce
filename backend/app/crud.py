from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_
from datetime import datetime, date, timedelta
from typing import List
from . import models, schemas
from .utils import mailer
import uuid

def get_spain_now() -> datetime:
    """Returns a naive datetime representing the current local time in Spain."""
    try:
        from zoneinfo import ZoneInfo
        return datetime.now(ZoneInfo("Europe/Madrid")).replace(tzinfo=None)
    except Exception:
        # Fallback de emergencia a UTC+2 (Horario de verano aproximado)
        return datetime.utcnow() + timedelta(hours=2)

# --- SETTINGS ---
def get_clinic_settings(db: Session):
    try:
        settings = db.query(models.ClinicSettings).first()
    except Exception:
        # Si hay un error de esquema (columnas faltantes), intentamos corregir al vuelo
        db.rollback()
        from .utils.migrations import run_auto_migrations
        run_auto_migrations()
        settings = db.query(models.ClinicSettings).first()

    if not settings:
        # Create default singleton settings if not exists
        settings = models.ClinicSettings(
            id=1,
            clinic_name="Clínica Merce",
            invoice_prefix="FA-{YY}-",
            invoice_next_number=1,
            default_tax_rate=21.0
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_clinic_settings(db: Session, update_data: schemas.ClinicSettingsUpdate):
    settings = get_clinic_settings(db)
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings

# --- SITE CONTENT (CMS) ---
def get_site_content(db: Session):
    try:
        content = db.query(models.SiteContent).first()
    except Exception:
        db.rollback()
        from .utils.migrations import run_auto_migrations
        run_auto_migrations()
        content = db.query(models.SiteContent).first()

    if not content:
        content = models.SiteContent(id=1)
        db.add(content)
        db.commit()
        db.refresh(content)
    return content

def update_site_content(db: Session, update_data: schemas.SiteContentUpdate):
    content = get_site_content(db)
    for key, value in update_data.model_dump(exclude_unset=True).items():
        setattr(content, key, value)
    db.commit()
    db.refresh(content)
    return content


def generate_invoice_id(db: Session, target_date=None) -> str:
    if not target_date:
        target_date = datetime.now()
    if isinstance(target_date, str):
        try:
            target_date = datetime.strptime(target_date, "%Y-%m-%d") # simplified handle
        except ValueError:
            target_date = datetime.now()
            
    settings = get_clinic_settings(db)
    prefix = settings.invoice_prefix.replace("{YYYY}", str(target_date.year)).replace("{YY}", str(target_date.year)[-2:]).replace("{MM}", f"{target_date.month:02d}")
    
    # Extract padding length (e.g. if we want to support generic 4 zeros)
    next_numStr = f"{settings.invoice_next_number:04d}"
    
    # Fallback si el usuario no pone ceros en NextNumber es un bug, asumimos siempre 4 digitos
    new_id = f"{prefix}{next_numStr}"
    
    settings.invoice_next_number += 1
    db.add(settings)
    # no db.commit() yet, commit happens inside the outer function to ensure atomicity
    return new_id

# Clients
def get_client(db: Session, client_id: str):
    return db.query(models.Client).filter(models.Client.id == client_id).first()

def create_client(db: Session, client: schemas.ClientCreate):
    if client.email:
        existing = db.query(models.Client).filter(models.Client.email == client.email).first()
        if existing:
            existing.name = client.name
            if client.phone:
                existing.phone = client.phone
            db.commit()
            db.refresh(existing)
            return existing

    db_client = models.Client(**client.model_dump())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: str, client: schemas.ClientUpdate):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if db_client:
        update_data = client.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_client, key, value)
        db.commit()
        db.refresh(db_client)
    return db_client

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Client).offset(skip).limit(limit).all()

# Service Categories
def get_service_category(db: Session, category_id: str):
    return db.query(models.ServiceCategory).filter(models.ServiceCategory.id == category_id).first()

def get_service_categories(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.ServiceCategory).offset(skip).limit(limit).all()

def create_service_category(db: Session, category: schemas.ServiceCategoryCreate):
    db_category = models.ServiceCategory(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_service_category(db: Session, category_id: str, category: schemas.ServiceCategoryUpdate):
    db_category = db.query(models.ServiceCategory).filter(models.ServiceCategory.id == category_id).first()
    if db_category:
        update_data = category.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_category, key, value)
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_service_category(db: Session, category_id: str):
    db_category = db.query(models.ServiceCategory).filter(models.ServiceCategory.id == category_id).first()
    if db_category:
        # Prevent deletion if there are services attached, or alternatively set their category to null.
        # Let's set services category to null if the category is deleted
        for service in db_category.services:
            service.category_id = None
        db.delete(db_category)
        db.commit()
    return db_category

# Services
def get_service(db: Session, service_id: str):
    return db.query(models.Service).filter(models.Service.id == service_id).first()

def get_services(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Service).offset(skip).limit(limit).all()

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.Service(**service.model_dump())
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: str, service: schemas.ServiceUpdate):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if db_service:
        update_data = service.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_service, key, value)
        db.commit()
        db.refresh(db_service)
    return db_service

    return db_service

# Appointments
def check_appointment_collision(db: Session, start_time: datetime, end_time: datetime, ignore_id: str = None):
    """
    Returns True if there's a collision with existing appointments or time blocks,
    or if the appointment exceeds the 19:00 strict closing time.
    """
    # 1. Closing Time Check (Strict 19:00)
    # We assume 'start_time' and 'end_time' are naive datetimes representing LOCAL TIME.
    if end_time.hour >= 19 and end_time.minute > 0:
        return "La cita excede el horario de cierre (19:00)."
    if end_time.hour > 19:
        return "La cita excede el horario de cierre (19:00)."
    
    # 1b. Weekend Restriction (Saturdays & Sundays)
    # weekday() returns 0 for Monday, 5 for Saturday, 6 for Sunday
    if start_time.weekday() in [5, 6]:
        return "La clínica está cerrada los fines de semana (Sábados y Domingos)."
        
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
    # Calculate end_time if not provided (should be provided by frontend, but safety first)
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
        
        # If we only have start_time update but not end_time (unlikely in our app, but anyway)
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
            
        # Lógica mágica: Si se enmarca como completada, descontar 1 del bono activo si lo hay
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

        # Triggers de Email
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

# Vouchers
def get_vouchers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Voucher).offset(skip).limit(limit).all()

def create_voucher(db: Session, voucher: schemas.VoucherCreate):
    v_dict = voucher.model_dump()
    
    # Calculate payment status based on paid vs total
    if v_dict["amount_paid"] >= v_dict["total_price"]:
        v_dict["payment_status"] = "paid"
    elif v_dict["amount_paid"] > 0:
        v_dict["payment_status"] = "partial"
    else:
        v_dict["payment_status"] = "pending"
        
    db_voucher = models.Voucher(**v_dict)
    db.add(db_voucher)
    
    # Generar factura pagada automáticamente
    service = db.query(models.Service).filter(models.Service.id == voucher.service_id).first()
    concept_str = f"Bono {voucher.total_sessions}x {service.name}" if service else "Bono Tratamiento Especial"
    
    settings = get_clinic_settings(db)
    
    db_invoice = models.Invoice(
        id=generate_invoice_id(db, voucher.purchase_date),
        client_id=voucher.client_id,
        amount=voucher.total_price,
        concept=concept_str,
        date=voucher.purchase_date,
        status="paid" if v_dict["payment_status"] == "paid" else "pending",
        tax_rate=settings.default_tax_rate
    )
    db.add(db_invoice)
    
    db.commit()
    db.refresh(db_voucher)
    return db_voucher

def update_voucher(db: Session, voucher_id: str, voucher: schemas.VoucherUpdate):
    db_voucher = db.query(models.Voucher).filter(models.Voucher.id == voucher_id).first()
    if db_voucher:
        update_data = voucher.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_voucher, key, value)
            
        # Re-calc payment status
        paid = db_voucher.amount_paid
        total = db_voucher.total_price
        if paid >= total:
            db_voucher.payment_status = "paid"
            
            # Auto-saldar factura asociada pendiente
            invoice = db.query(models.Invoice).filter(
                models.Invoice.client_id == db_voucher.client_id,
                models.Invoice.amount == total,
                models.Invoice.date == db_voucher.purchase_date,
                models.Invoice.status == "pending"
            ).first()
            if invoice:
                invoice.status = "paid"
                
        elif paid > 0:
            db_voucher.payment_status = "partial"
        else:
            db_voucher.payment_status = "pending"
            
        db.commit()
        db.refresh(db_voucher)
    return db_voucher

def delete_voucher(db: Session, voucher_id: str):
    db_voucher = db.query(models.Voucher).filter(models.Voucher.id == voucher_id).first()
    if db_voucher:
        db.delete(db_voucher)
        db.commit()
    return db_voucher

# Invoices
def get_invoice(db: Session, invoice_id: str):
    return db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()

def get_invoices(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Invoice).offset(skip).limit(limit).all()

def create_invoice(db: Session, invoice: schemas.InvoiceCreate):
    invoice_dict = invoice.model_dump()
    invoice_dict["id"] = generate_invoice_id(db, invoice.date)
    
    if "tax_rate" not in invoice_dict or invoice_dict["tax_rate"] is None or invoice_dict["tax_rate"] == 21.0:
        settings = get_clinic_settings(db)
        invoice_dict["tax_rate"] = settings.default_tax_rate
        
    db_invoice = models.Invoice(**invoice_dict)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice(db: Session, invoice_id: str, invoice: schemas.InvoiceUpdate):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if db_invoice:
        update_data = invoice.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_invoice, key, value)
        db.commit()
        db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: str):
    db_invoice = db.query(models.Invoice).filter(models.Invoice.id == invoice_id).first()
    if db_invoice:
        db.delete(db_invoice)
        db.commit()
    return db_invoice

# Consents
def get_consents_by_client(db: Session, client_id: str):
    return db.query(models.Consent).filter(models.Consent.client_id == client_id).order_by(models.Consent.signed_at.desc()).all()

def get_consent(db: Session, consent_id: str):
    return db.query(models.Consent).filter(models.Consent.id == consent_id).first()

def create_consent(db: Session, consent: schemas.ConsentCreate):
    db_consent = models.Consent(**consent.model_dump())
    db.add(db_consent)
    db.commit()
    db.refresh(db_consent)
    return db_consent

# Voucher Templates
def get_voucher_templates(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.VoucherTemplate).options(joinedload(models.VoucherTemplate.service)).offset(skip).limit(limit).all()

def get_voucher_template(db: Session, template_id: str):
    return db.query(models.VoucherTemplate).filter(models.VoucherTemplate.id == template_id).first()

def create_voucher_template(db: Session, template: schemas.VoucherTemplateCreate):
    db_template = models.VoucherTemplate(**template.model_dump())
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_voucher_template(db: Session, template_id: str):
    db_template = db.query(models.VoucherTemplate).filter(models.VoucherTemplate.id == template_id).first()
    if db_template:
        db.delete(db_template)
        db.commit()
    return db_template


# ──────────────────────────────────────────────────────────────
# PUBLIC BOOKING ENGINE
# ──────────────────────────────────────────────────────────────

# Clinic working blocks: 09:30-14:00 and 16:00-19:00
_SCHEDULE_BLOCKS = [
    (9, 30, 14, 0),   # morning: 09:30 → 14:00
    (16, 0, 19, 0),   # afternoon: 16:00 → 19:00
]
_SLOT_STEP_MINUTES = 15


def find_or_create_client(db: Session, name: str, email: str | None, phone: str | None):
    """Look up an existing client by email OR phone. Create a new one if not found."""
    is_new = False
    client = None

    # Build query filters
    conditions = []
    if email:
        conditions.append(models.Client.email == email.strip().lower())
    if phone:
        phone_clean = phone.strip()
        conditions.append(models.Client.phone == phone_clean)

    if conditions:
        client = db.query(models.Client).filter(or_(*conditions)).first()

    if not client:
        is_new = True
        client = models.Client(
            id=str(uuid.uuid4()),
            name=name,
            email=email.strip().lower() if email else f"web_{str(uuid.uuid4())[:8]}@web.local",
            phone=phone.strip() if phone else None,
        )
        db.add(client)
        db.flush()  # get the id without committing yet

    return client, is_new


def get_availability_slots(db: Session, target_date: date, service_id: str) -> List[str]:
    """Return available time slots (HH:MM strings) for a given date and service."""
    # 0. Weekend guard: clinic is closed Saturday (5) and Sunday (6)
    if target_date.weekday() in (5, 6):
        return []

    # Get settings for margin calculation
    settings = get_clinic_settings(db)
    margin_hours = float(settings.booking_margin_hours) if settings.booking_margin_hours else 0.0

    # 1. Get service duration
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service:
        return []
    duration = timedelta(minutes=int(service.duration_minutes))

    # 2. Fetch existing appointments for that day (excluding cancelled)
    day_start = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0)
    day_end   = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59)
    existing_appts = db.query(models.Appointment).filter(
        models.Appointment.start_time >= day_start,
        models.Appointment.start_time <= day_end,
        models.Appointment.status != "cancelled",
    ).all()

    # 2b. Fetch existing time blocks for that day
    existing_blocks = db.query(models.TimeBlock).filter(
        models.TimeBlock.start_time >= day_start,
        models.TimeBlock.start_time <= day_end,
    ).all()

    # 3. Generate candidate slots across both schedule blocks
    available = []
    step = timedelta(minutes=_SLOT_STEP_MINUTES)

    for (sh, sm, eh, em) in _SCHEDULE_BLOCKS:
        block_start = datetime(target_date.year, target_date.month, target_date.day, sh, sm)
        block_end   = datetime(target_date.year, target_date.month, target_date.day, eh, em)
        slot = block_start

        while slot + duration <= block_end:  # slot must finish inside the block
            slot_end = slot + duration

            # 4. Overlap check: max(slot_start, appt_start) < min(slot_end, appt_end)
            overlaps = False
            
            # Check appointments
            for appt in existing_appts:
                if max(slot, appt.start_time) < min(slot_end, appt.end_time):
                    overlaps = True
                    break
            
            # Check time blocks
            if not overlaps:
                for block in existing_blocks:
                    if max(slot, block.start_time) < min(slot_end, block.end_time):
                        overlaps = True
                        break

            # Check Margin Constraint
            if not overlaps:
                now_spain = get_spain_now()
                # If target date is today, check margin
                if slot.date() == now_spain.date():
                    if slot < now_spain + timedelta(hours=margin_hours):
                        overlaps = True

            if not overlaps:
                available.append(slot.strftime("%H:%M"))

            slot += step

    return available


def create_public_appointment(
    db: Session,
    booking: schemas.PublicBookingRequest,
    background_tasks: any = None
):
    """Idempotent public booking: find-or-create client, then create appointment."""
    # 1. Resolve client
    client, is_new = find_or_create_client(
        db,
        name=booking.client_name,
        email=booking.client_email,
        phone=booking.client_phone,
    )

    # 2. Calculate end_time using service duration
    service = db.query(models.Service).filter(models.Service.id == booking.service_id).first()
    if not service:
        raise ValueError(f"Service {booking.service_id} not found")
    end_time = booking.start_time + timedelta(minutes=int(service.duration_minutes))

    # 2b. Collision check for PUBLIC BOOKING
    collision_msg = check_appointment_collision(db, booking.start_time, end_time)
    if collision_msg:
        raise ValueError(collision_msg)

    # 3. Create appointment with 'pending_verification' status
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

    # Email de Verificación Doble Opt-in (en segundo plano si es posible)
    if background_tasks:
        background_tasks.add_task(mailer.send_appointment_notification, appt.id, 'verification_email')
    else:
        mailer.send_appointment_notification(appt.id, 'verification_email')

    return appt, client, is_new

# --- Time Blocks CRUD ---

def get_time_blocks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.TimeBlock).offset(skip).limit(limit).all()

def create_time_block(db: Session, block_in: schemas.TimeBlockCreate):
    db_block = models.TimeBlock(
        id=str(uuid.uuid4()),
        start_time=block_in.start_time,
        end_time=block_in.end_time,
        reason=block_in.reason
    )
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block

def delete_time_block(db: Session, block_id: str):
    db_block = db.query(models.TimeBlock).filter(models.TimeBlock.id == block_id).first()
    if db_block:
        db.delete(db_block)
        db.commit()
    return db_block

def create_direct_sale(db: Session, sale: schemas.DirectSaleRequest):
    # 1. Handle Simplified Mode (Ticket)
    effective_client_id = sale.client_id
    if sale.is_simplified:
        # Search or create "Cliente de Contado"
        anon_client = db.query(models.Client).filter(models.Client.email == "contado@clinica-mercedes.com").first()
        if not anon_client:
            anon_client = models.Client(
                id=str(uuid.uuid4()),
                name="Cliente de Contado",
                email="contado@clinica-mercedes.com",
                phone="000000000"
            )
            db.add(anon_client)
            db.commit()
            db.refresh(anon_client)
        effective_client_id = anon_client.id

    # 2. Fetch service to get original name/concept
    service = db.query(models.Service).filter(models.Service.id == sale.service_id).first()
    if not service:
        raise ValueError("Servicio no encontrado")
    
    # 3. Get global settings for tax rate
    settings = get_clinic_settings(db)
    
    # 4. Create invoice with status 'paid'
    today = date.today()
    invoice_id = generate_invoice_id(db, today)
    
    db_invoice = models.Invoice(
        id=invoice_id,
        client_id=effective_client_id,
        amount=sale.final_price,
        concept=f"Venta Directa: {service.name} ({sale.payment_method})",
        date=today,
        status="paid",
        tax_rate=settings.default_tax_rate,
        is_simplified=sale.is_simplified
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    return db_invoice
