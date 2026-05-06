from sqlalchemy.orm import Session
from .. import models, schemas

# Services
def get_service(db: Session, service_id: str):
    return db.query(models.Service).filter(models.Service.id == service_id).first()

def get_service_by_slug(db: Session, slug: str):
    service = db.query(models.Service).filter(models.Service.slug == slug).first()
    if not service:
        # Fallback para servicios antiguos sin slug (buscar por ID si es un UUID válido)
        service = db.query(models.Service).filter(models.Service.id == slug).first()
    return service

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
