from sqlalchemy.orm import Session
from datetime import datetime, date
from . import models, schemas
import uuid

# --- SETTINGS ---
def get_clinic_settings(db: Session):
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        settings = models.ClinicSettings(id=1)
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

# Services
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

# Appointments
def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).offset(skip).limit(limit).all()

def create_appointment(db: Session, appointment: schemas.AppointmentCreate):
    db_appointment = models.Appointment(**appointment.model_dump())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment

def update_appointment(db: Session, appointment_id: str, appointment: schemas.AppointmentUpdate):
    db_appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    if db_appointment:
        old_status = db_appointment.status
        update_data = appointment.model_dump(exclude_unset=True)
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
    db_voucher = models.Voucher(**voucher.model_dump())
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
        status="paid",
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
