from sqlalchemy.orm import Session
from sqlalchemy import or_, func
import math
import uuid
from datetime import datetime, date
from .. import models, schemas
from .settings import get_clinic_settings
from ..database import current_tenant_var

# --- INVOICES ---

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

def get_invoice(db: Session, invoice_id: str):
    return db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.tenant_id == current_tenant_var.get()
    ).first()

def get_invoices(db: Session, page: int = 1, limit: int = 10, status: str = "all", start_date: str = None, end_date: str = None, search: str = None):
    tenant_id = current_tenant_var.get()
    query = db.query(models.Invoice).filter(models.Invoice.tenant_id == tenant_id)
    
    if status and status.lower() != "all" and status.lower() != "todas":
        # Convert "pagadas" to "paid" and "pendientes" to "pending" if they come in Spanish
        mapped_status = status.lower()
        if mapped_status == "pagadas": mapped_status = "paid"
        if mapped_status == "pendientes": mapped_status = "pending"
        query = query.filter(models.Invoice.status == mapped_status)
        
    if start_date:
        query = query.filter(models.Invoice.date >= start_date)
    if end_date:
        query = query.filter(models.Invoice.date <= end_date)
        
    if search:
        search_term = f"%{search}%"
        query = query.join(models.Client, models.Invoice.client_id == models.Client.id, isouter=True)
        query = query.filter(models.Client.tenant_id == tenant_id)
        query = query.filter(
            or_(
                models.Invoice.concept.ilike(search_term),
                models.Client.name.ilike(search_term)
            )
        )
        
    total = query.count()
    
    total_gross_scalar = query.with_entities(func.sum(models.Invoice.amount)).scalar() or 0.0
    total_gross = float(total_gross_scalar)
    tax_base = total_gross / 1.21
    vat_quota = total_gross - tax_base
    
    offset = (page - 1) * limit
    invoices = query.order_by(models.Invoice.date.desc()).offset(offset).limit(limit).all()
    
    pages = math.ceil(total / limit) if limit > 0 else 0
    
    return {
        "total": total,
        "pages": pages,
        "page": page,
        "kpis": {
            "total_gross": round(total_gross, 2),
            "tax_base": round(tax_base, 2),
            "vat_quota": round(vat_quota, 2)
        },
        "data": invoices
    }

def create_invoice(db: Session, invoice: schemas.InvoiceCreate):
    tenant_id = current_tenant_var.get()
    invoice_dict = invoice.model_dump()
    invoice_dict["id"] = generate_invoice_id(db, invoice.date)
    invoice_dict["tenant_id"] = tenant_id
    
    if "tax_rate" not in invoice_dict or invoice_dict["tax_rate"] is None or invoice_dict["tax_rate"] == 21.0:
        settings = get_clinic_settings(db)
        invoice_dict["tax_rate"] = settings.default_tax_rate
        
    db_invoice = models.Invoice(**invoice_dict)
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    return db_invoice

def update_invoice(db: Session, invoice_id: str, invoice: schemas.InvoiceUpdate):
    tenant_id = current_tenant_var.get()
    db_invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.tenant_id == tenant_id
    ).first()
    if db_invoice:
        update_data = invoice.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_invoice, key, value)
        db.commit()
        db.refresh(db_invoice)
    return db_invoice

def delete_invoice(db: Session, invoice_id: str):
    tenant_id = current_tenant_var.get()
    db_invoice = db.query(models.Invoice).filter(
        models.Invoice.id == invoice_id,
        models.Invoice.tenant_id == tenant_id
    ).first()
    if db_invoice:
        db.delete(db_invoice)
        db.commit()
    return db_invoice

def create_direct_sale(db: Session, sale: schemas.DirectSaleRequest):
    tenant_id = current_tenant_var.get()
    # 1. Handle Simplified Mode (Ticket)
    effective_client_id = sale.client_id
    if sale.is_simplified:
        # Search or create "Cliente de Contado" per-tenant to respect unique email constraint
        anon_email = f"contado_{tenant_id}@generico.local"
        anon_client = db.query(models.Client).filter(
            models.Client.email == anon_email,
            models.Client.tenant_id == tenant_id
        ).first()
        if not anon_client:
            # Fallback check for old contado@generico.local for this tenant
            anon_client = db.query(models.Client).filter(
                models.Client.email == "contado@generico.local",
                models.Client.tenant_id == tenant_id
            ).first()
        if not anon_client:
            anon_client = models.Client(
                id=str(uuid.uuid4()),
                name="Cliente de Contado",
                email=anon_email,
                phone="000000000",
                tenant_id=tenant_id
            )
            db.add(anon_client)
            db.commit()
            db.refresh(anon_client)
        effective_client_id = anon_client.id

    # 2. Fetch services to get names / build concept
    concept_names = []
    if sale.services:
        for item in sale.services:
            srv_id = item.get("service_id") if isinstance(item, dict) else getattr(item, "service_id", None)
            service = db.query(models.Service).filter(
                models.Service.id == srv_id,
                models.Service.tenant_id == tenant_id
            ).first()
            if service:
                concept_names.append(service.name)
            else:
                concept_names.append("Servicio Especial")
    else:
        service = db.query(models.Service).filter(
            models.Service.id == sale.service_id,
            models.Service.tenant_id == tenant_id
        ).first()
        if not service:
            raise ValueError("Servicio no encontrado")
        concept_names.append(service.name)
        
    concept_str = ", ".join(concept_names)
    
    # 3. Get global settings for tax rate
    settings = get_clinic_settings(db)
    
    # 4. Resolve Date (use custom date if provided, fallback to today)
    sale_date = date.today()
    if sale.date:
        try:
            if "T" in sale.date:
                sale_date = datetime.fromisoformat(sale.date.replace("Z", "")).date()
            else:
                sale_date = datetime.strptime(sale.date, "%Y-%m-%d").date()
        except Exception as e:
            print(f"Error parsing sale date: {e}")
            sale_date = date.today()

    invoice_id = generate_invoice_id(db, sale_date)
    
    db_invoice = models.Invoice(
        id=invoice_id,
        client_id=effective_client_id,
        amount=sale.final_price,
        concept=f"Venta Directa: {concept_str} ({sale.payment_method})",
        date=sale_date,
        status="paid",
        tax_rate=settings.default_tax_rate,
        is_simplified=sale.is_simplified,
        tenant_id=tenant_id
    )
    db.add(db_invoice)
    db.commit()
    db.refresh(db_invoice)
    
    return db_invoice
