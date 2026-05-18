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
        from ..utils.translator import translate_fields, translate_html_content
        to_translate = {}
        if db_service.name:
            to_translate["name"] = db_service.name
        if db_service.description:
            to_translate["description"] = db_service.description
            
        new_translations = {}
        if to_translate:
            new_translations = translate_fields(to_translate, db) or {}
            
        if db_service.content_html:
            en_html = translate_html_content(db_service.content_html, "en", db)
            fr_html = translate_html_content(db_service.content_html, "fr", db)
            if "en" not in new_translations: new_translations["en"] = {}
            if "fr" not in new_translations: new_translations["fr"] = {}
            new_translations["en"]["content_html"] = en_html
            new_translations["fr"]["content_html"] = fr_html
            
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
        content_html_changed = "content_html" in update_data and update_data["content_html"] != db_service.content_html
        
        for key, value in update_data.items():
            setattr(db_service, key, value)
            
        if name_changed or desc_changed or content_html_changed or not db_service.translations:
            try:
                from ..utils.translator import translate_fields, translate_html_content
                current_trans = db_service.translations or {}
                if isinstance(current_trans, str):
                    import json
                    try: current_trans = json.loads(current_trans)
                    except: current_trans = {}
                
                # Traducir nombre y descripción si es necesario
                if name_changed or desc_changed or not current_trans:
                    to_translate = {}
                    if db_service.name:
                        to_translate["name"] = db_service.name
                    if db_service.description:
                        to_translate["description"] = db_service.description
                        
                    if to_translate:
                        new_fields = translate_fields(to_translate, db)
                        if new_fields:
                            for lang in ["en", "fr"]:
                                if lang not in current_trans:
                                    current_trans[lang] = {}
                                if lang in new_fields:
                                    current_trans[lang].update(new_fields[lang])
                
                # Traducir content_html si cambió o si falta en las traducciones
                if content_html_changed or (db_service.content_html and (not current_trans.get("en", {}).get("content_html") or not current_trans.get("fr", {}).get("content_html"))):
                    if db_service.content_html:
                        en_html = translate_html_content(db_service.content_html, "en", db)
                        fr_html = translate_html_content(db_service.content_html, "fr", db)
                        
                        if "en" not in current_trans: current_trans["en"] = {}
                        if "fr" not in current_trans: current_trans["fr"] = {}
                        
                        current_trans["en"]["content_html"] = en_html
                        current_trans["fr"]["content_html"] = fr_html
                
                import copy
                from sqlalchemy.orm.attributes import flag_modified
                db_service.translations = copy.deepcopy(current_trans)
                flag_modified(db_service, "translations")
            except Exception as e:
                print(f"Error in service auto-translation: {e}")
                
        db.commit()
        db.refresh(db_service)
    return db_service
