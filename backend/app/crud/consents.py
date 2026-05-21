from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import current_tenant_var

# Consents
def get_consents_by_client(db: Session, client_id: str):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.Consent)
        .filter(
            models.Consent.client_id == client_id,
            models.Consent.tenant_id == tenant_id,
        )
        .order_by(models.Consent.signed_at.desc())
        .all()
    )

def get_consent(db: Session, consent_id: str):
    tenant_id = current_tenant_var.get()
    return db.query(models.Consent).filter(
        models.Consent.id == consent_id,
        models.Consent.tenant_id == tenant_id,
    ).first()

def create_consent(db: Session, consent: schemas.ConsentCreate):
    tenant_id = current_tenant_var.get()
    consent_data = consent.model_dump()
    consent_data["tenant_id"] = tenant_id
    db_consent = models.Consent(**consent_data)
    db.add(db_consent)
    db.commit()
    db.refresh(db_consent)
    return db_consent
