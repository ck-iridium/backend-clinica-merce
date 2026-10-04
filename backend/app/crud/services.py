from sqlalchemy.orm import Session, joinedload
from .. import models, schemas
from ..database import current_tenant_var

import re
import unicodedata
import json

def slugify(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize('NFD', text).encode('ascii', 'ignore').decode('utf-8')
    text = re.sub(r'[^\w\s-]', '', text).strip().lower()
    return re.sub(r'[-\s]+', '-', text)

# Services
def get_service(db: Session, service_id: str):
    tenant_id = current_tenant_var.get()
    service = (
        db.query(models.Service)
        .options(joinedload(models.Service.category))
        .filter(models.Service.id == service_id, models.Service.tenant_id == tenant_id)
        .first()
    )
    if service and service.category:
        service.category_slug = service.category.slug
    return service

def get_service_by_slug(db: Session, slug: str):
    tenant_id = current_tenant_var.get()
    service = (
        db.query(models.Service)
        .options(joinedload(models.Service.category))
        .filter(models.Service.slug == slug, models.Service.tenant_id == tenant_id)
        .first()
    )
    if not service:
        # Fallback para servicios antiguos sin slug (buscar por ID si es un UUID válido)
        service = (
            db.query(models.Service)
            .options(joinedload(models.Service.category))
            .filter(models.Service.id == slug, models.Service.tenant_id == tenant_id)
            .first()
        )

    # Fallback multi-idioma: buscar si el slug coincide con translations.en.slug o translations.fr.slug
    if not service:
        all_tenant_services = (
            db.query(models.Service)
            .options(joinedload(models.Service.category))
            .filter(models.Service.tenant_id == tenant_id)
            .all()
        )
        for s in all_tenant_services:
            trans = s.translations or {}
            if isinstance(trans, str):
                try: trans = json.loads(trans)
                except: trans = {}
            for lang in ["en", "fr"]:
                if trans.get(lang, {}).get("slug") == slug:
                    service = s
                    break
            if service:
                break

    if service and service.category:
        service.category_slug = service.category.slug
    return service

def get_services(db: Session, skip: int = 0, limit: int = 100):
    tenant_id = current_tenant_var.get()
    services = (
        db.query(models.Service)
        .options(joinedload(models.Service.category))
        .filter(models.Service.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    for s in services:
        if s.category:
            s.category_slug = s.category.slug
    return services

def create_service(db: Session, service: schemas.ServiceCreate):
    tenant_id = current_tenant_var.get()
    service_data = service.model_dump()
    service_data["tenant_id"] = tenant_id
    db_service = models.Service(**service_data)

    try:
        from ..utils.translator import translate_fields, translate_html_content
        to_translate = {}
        if db_service.name:
            to_translate["name"] = db_service.name
        if db_service.description:
            to_translate["description"] = db_service.description
        if db_service.seo_title:
            to_translate["seo_title"] = db_service.seo_title
        if db_service.seo_description:
            to_translate["seo_description"] = db_service.seo_description
        if db_service.seo_keywords:
            to_translate["seo_keywords"] = db_service.seo_keywords

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

        # Si el usuario envió traducciones explícitas, fusionarlas
        user_translations = getattr(service, "translations", None) or {}
        if user_translations:
            for lang in ["en", "fr"]:
                if lang in user_translations:
                    if lang not in new_translations: new_translations[lang] = {}
                    new_translations[lang].update(user_translations[lang])

        for lang in ["en", "fr"]:
            if lang in new_translations:
                if new_translations[lang].get("slug"):
                    new_translations[lang]["slug"] = slugify(new_translations[lang]["slug"])
                else:
                    translated_name = new_translations[lang].get("name") or db_service.name
                    new_translations[lang]["slug"] = slugify(translated_name)

        if new_translations:
            db_service.translations = new_translations
    except Exception as e:
        print(f"Error in service auto-translation: {e}")

    db.add(db_service)
    db.commit()
    db.refresh(db_service)
    return db_service

def update_service(db: Session, service_id: str, service: schemas.ServiceUpdate):
    tenant_id = current_tenant_var.get()
    db_service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.tenant_id == tenant_id
    ).first()
    if db_service:
        update_data = service.model_dump(exclude_unset=True)

        name_changed = "name" in update_data and update_data["name"] != db_service.name
        desc_changed = "description" in update_data and update_data["description"] != db_service.description
        content_html_changed = "content_html" in update_data and update_data["content_html"] != db_service.content_html
        seo_title_changed = "seo_title" in update_data and update_data["seo_title"] != db_service.seo_title
        seo_desc_changed = "seo_description" in update_data and update_data["seo_description"] != db_service.seo_description
        seo_kw_changed = "seo_keywords" in update_data and update_data["seo_keywords"] != db_service.seo_keywords
        user_translations = update_data.get("translations")

        for key, value in update_data.items():
            setattr(db_service, key, value)

        needs_translation = (
            name_changed or desc_changed or content_html_changed or
            seo_title_changed or seo_desc_changed or seo_kw_changed or
            not db_service.translations or user_translations is not None
        )

        if needs_translation:
            try:
                from ..utils.translator import translate_fields, translate_html_content
                current_trans = db_service.translations or {}
                if isinstance(current_trans, str):
                    import json
                    try: current_trans = json.loads(current_trans)
                    except: current_trans = {}

                # Si el usuario suministró traducciones personalizadas, respetarlas prioritariamente
                if user_translations and isinstance(user_translations, dict):
                    for lang in ["en", "fr"]:
                        if lang in user_translations:
                            if lang not in current_trans:
                                current_trans[lang] = {}
                            current_trans[lang].update(user_translations[lang])

                # Identificar campos que necesitan auto-traducción (si cambiaron y no fueron provistos manualmente)
                to_translate = {}
                if (name_changed or not current_trans.get("en", {}).get("name")) and db_service.name:
                    to_translate["name"] = db_service.name
                if (desc_changed or not current_trans.get("en", {}).get("description")) and db_service.description:
                    to_translate["description"] = db_service.description
                if (seo_title_changed or not current_trans.get("en", {}).get("seo_title")) and db_service.seo_title:
                    to_translate["seo_title"] = db_service.seo_title
                if (seo_desc_changed or not current_trans.get("en", {}).get("seo_description")) and db_service.seo_description:
                    to_translate["seo_description"] = db_service.seo_description
                if (seo_kw_changed or not current_trans.get("en", {}).get("seo_keywords")) and db_service.seo_keywords:
                    to_translate["seo_keywords"] = db_service.seo_keywords

                if to_translate:
                    new_fields = translate_fields(to_translate, db)
                    if new_fields:
                        for lang in ["en", "fr"]:
                            if lang not in current_trans:
                                current_trans[lang] = {}
                            for k, v in new_fields.get(lang, {}).items():
                                # Solo sobreescribir si el usuario no pasó un valor explícito en esta petición
                                if not user_translations or not user_translations.get(lang, {}).get(k):
                                    current_trans[lang][k] = v

                # Traducir content_html si cambió o si falta en las traducciones
                if content_html_changed or (db_service.content_html and (not current_trans.get("en", {}).get("content_html") or not current_trans.get("fr", {}).get("content_html"))):
                    if db_service.content_html:
                        en_html = translate_html_content(db_service.content_html, "en", db)
                        fr_html = translate_html_content(db_service.content_html, "fr", db)

                        if "en" not in current_trans: current_trans["en"] = {}
                        if "fr" not in current_trans: current_trans["fr"] = {}

                        if not user_translations or not user_translations.get("en", {}).get("content_html"):
                            current_trans["en"]["content_html"] = en_html
                        if not user_translations or not user_translations.get("fr", {}).get("content_html"):
                            current_trans["fr"]["content_html"] = fr_html

                # Normalizar o auto-generar slug traducido
                for lang in ["en", "fr"]:
                    if lang in current_trans:
                        if current_trans[lang].get("slug"):
                            current_trans[lang]["slug"] = slugify(current_trans[lang]["slug"])
                        else:
                            translated_name = current_trans[lang].get("name") or db_service.name
                            current_trans[lang]["slug"] = slugify(translated_name)

                import copy
                from sqlalchemy.orm.attributes import flag_modified
                db_service.translations = copy.deepcopy(current_trans)
                flag_modified(db_service, "translations")
            except Exception as e:
                print(f"Error in service auto-translation: {e}")

        db.commit()
        db.refresh(db_service)
    return db_service
