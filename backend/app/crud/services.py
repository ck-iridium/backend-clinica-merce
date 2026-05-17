from sqlalchemy.orm import Session, joinedload
from .. import models, schemas

# Services
def get_service(db: Session, service_id: str):
    service = db.query(models.Service).options(joinedload(models.Service.category)).filter(models.Service.id == service_id).first()
    if service and service.category:
        service.category_slug = service.category.slug
    return service

def get_service_by_slug(db: Session, slug: str):
    service = db.query(models.Service).options(joinedload(models.Service.category)).filter(models.Service.slug == slug).first()
    if not service:
        # Fallback para servicios antiguos sin slug (buscar por ID si es un UUID válido)
        service = db.query(models.Service).options(joinedload(models.Service.category)).filter(models.Service.id == slug).first()
    
    if service and service.category:
        service.category_slug = service.category.slug
    return service

def get_services(db: Session, skip: int = 0, limit: int = 100):
    services = db.query(models.Service).options(joinedload(models.Service.category)).offset(skip).limit(limit).all()
    for s in services:
        if s.category:
            s.category_slug = s.category.slug
    return services

def create_service(db: Session, service: schemas.ServiceCreate):
    db_service = models.Service(**service.model_dump())
    
    try:
        from ..utils.translator import translate_fields
        to_translate = {}
        if db_service.name:
            to_translate["name"] = db_service.name
        if db_service.description:
            to_translate["description"] = db_service.description
            
        if to_translate:
            new_translations = translate_fields(to_translate, db)
            if new_translations:
                db_service.translations = new_translations
    except Exception as e:
        print(f"Error in service auto-translation: {e}")
        
    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: str, service: schemas.ServiceUpdate):
    db_service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if db_service:
        update_data = service.model_dump(exclude_unset=True)
        
        name_changed = "name" in update_data and update_data["name"] != db_service.name
        desc_changed = "description" in update_data and update_data["description"] != db_service.description
        
        for key, value in update_data.items():
            setattr(db_service, key, value)
            
        if name_changed or desc_changed or not db_service.translations:
            try:
                from ..utils.translator import translate_fields
                to_translate = {}
                if db_service.name:
                    to_translate["name"] = db_service.name
                if db_service.description:
                    to_translate["description"] = db_service.description
                    
                if to_translate:
                    new_translations = translate_fields(to_translate, db)
                    if new_translations:
                        db_service.translations = new_translations
            except Exception as e:
                print(f"Error in service auto-translation: {e}")
                
        db.commit()
        db.refresh(db_service)
    return db_service
