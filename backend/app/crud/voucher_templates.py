from sqlalchemy.orm import Session, joinedload
from .. import models, schemas

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
