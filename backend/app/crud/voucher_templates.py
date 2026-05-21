from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import current_tenant_var

# Voucher Templates
def get_voucher_templates(db: Session, skip: int = 0, limit: int = 100):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.VoucherTemplate)
        .options(joinedload(models.VoucherTemplate.service))
        .filter(models.VoucherTemplate.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_voucher_template(db: Session, template_id: str):
    tenant_id = current_tenant_var.get()
    return db.query(models.VoucherTemplate).filter(
        models.VoucherTemplate.id == template_id,
        models.VoucherTemplate.tenant_id == tenant_id
    ).first()

def create_voucher_template(db: Session, template: schemas.VoucherTemplateCreate):
    tenant_id = current_tenant_var.get()
    template_data = template.model_dump()
    template_data["tenant_id"] = tenant_id
    db_template = models.VoucherTemplate(**template_data)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_voucher_template(db: Session, template_id: str):
    tenant_id = current_tenant_var.get()
    db_template = db.query(models.VoucherTemplate).filter(
        models.VoucherTemplate.id == template_id,
        models.VoucherTemplate.tenant_id == tenant_id
    ).first()
    if db_template:
        db.delete(db_template)
        db.commit()
    return db_template
