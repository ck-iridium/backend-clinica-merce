from sqlalchemy.orm import Session
from .. import models, schemas
from .settings import get_clinic_settings
from .invoices import generate_invoice_id

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
