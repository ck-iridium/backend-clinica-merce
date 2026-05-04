from sqlalchemy.orm import Session
from .. import models, schemas

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
