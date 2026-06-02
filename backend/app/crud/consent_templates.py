from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import current_tenant_var

def get_consent_templates(db: Session, skip: int = 0, limit: int = 100):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.ConsentTemplate)
        .filter(models.ConsentTemplate.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_consent_template(db: Session, template_id: str):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.ConsentTemplate)
        .filter(
            models.ConsentTemplate.id == template_id,
            models.ConsentTemplate.tenant_id == tenant_id
        )
        .first()
    )

def create_consent_template(db: Session, template: schemas.ConsentTemplateCreate):
    tenant_id = current_tenant_var.get()
    template_data = template.model_dump()
    template_data["tenant_id"] = tenant_id
    db_template = models.ConsentTemplate(**template_data)
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    return db_template

def update_consent_template(db: Session, template_id: str, template_update: schemas.ConsentTemplateUpdate):
    db_template = get_consent_template(db, template_id)
    if not db_template:
        return None
    data = template_update.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_template, key, value)
    db.commit()
    db.refresh(db_template)
    return db_template

def delete_consent_template(db: Session, template_id: str):
    db_template = get_consent_template(db, template_id)
    if not db_template:
        return False
    db.delete(db_template)
    db.commit()
    return True
