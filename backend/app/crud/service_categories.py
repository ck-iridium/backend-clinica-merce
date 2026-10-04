from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import current_tenant_var
import unicodedata
import re

def slugify(value):
    if not value:
        return ""
    value = str(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')

# Service Categories
def get_service_category(db: Session, category_id: str):
    tenant_id = current_tenant_var.get()
    return db.query(models.ServiceCategory).filter(
        models.ServiceCategory.id == category_id,
        models.ServiceCategory.tenant_id == tenant_id
    ).first()

def get_service_category_by_slug(db: Session, slug: str):
    tenant_id = current_tenant_var.get()
    # 1. Búsqueda directa por slug en español
    cat = db.query(models.ServiceCategory).filter(
        models.ServiceCategory.slug == slug,
        models.ServiceCategory.tenant_id == tenant_id
    ).first()
    if cat:
        return cat

    # 2. Búsqueda por UUID si aplica
    import uuid
    try:
        uuid_obj = uuid.UUID(slug)
        cat = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.id == str(uuid_obj),
            models.ServiceCategory.tenant_id == tenant_id
        ).first()
        if cat:
            return cat
    except ValueError:
        pass

    # 3. Búsqueda en los slugs traducidos (translations -> en/fr -> slug)
    all_cats = db.query(models.ServiceCategory).filter(
        models.ServiceCategory.tenant_id == tenant_id
    ).all()
    import json
    for c in all_cats:
        trans = c.translations or {}
        if isinstance(trans, str):
            try: trans = json.loads(trans)
            except: trans = {}
        if isinstance(trans, dict):
            for lang_code, t_data in trans.items():
                if isinstance(t_data, dict) and t_data.get("slug") == slug:
                    return c

    return None

def get_service_categories(db: Session, skip: int = 0, limit: int = 100):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.ServiceCategory)
        .filter(models.ServiceCategory.tenant_id == tenant_id)
        .order_by(models.ServiceCategory.order_index)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_service_category(db: Session, category: schemas.ServiceCategoryCreate):
    tenant_id = current_tenant_var.get()
    category_data = category.model_dump()
    category_data["tenant_id"] = tenant_id
    if not category_data.get("slug") and category_data.get("name"):
        category_data["slug"] = slugify(category_data["name"])

    db_category = models.ServiceCategory(**category_data)

    try:
        from ..utils.translator import translate_fields
        to_translate = {}
        if db_category.name:
            to_translate["name"] = db_category.name
        if db_category.description:
            to_translate["description"] = db_category.description

        if to_translate:
            new_translations = translate_fields(to_translate, db)
            if new_translations:
                for lang in ["en", "fr"]:
                    if lang in new_translations:
                        translated_name = new_translations[lang].get("name") or db_category.name
                        new_translations[lang]["slug"] = slugify(translated_name)
                db_category.translations = new_translations
    except Exception as e:
        print(f"Error in category auto-translation: {e}")

    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_service_category(db: Session, category_id: str, category: schemas.ServiceCategoryUpdate):
    tenant_id = current_tenant_var.get()
    db_category = db.query(models.ServiceCategory).filter(
        models.ServiceCategory.id == category_id,
        models.ServiceCategory.tenant_id == tenant_id
    ).first()
    if db_category:
        update_data = category.model_dump(exclude_unset=True)

        name_changed = "name" in update_data and update_data["name"] != db_category.name
        desc_changed = "description" in update_data and update_data["description"] != db_category.description

        for key, value in update_data.items():
            setattr(db_category, key, value)

        if name_changed or desc_changed or not db_category.translations:
            try:
                from ..utils.translator import translate_fields
                to_translate = {}
                if db_category.name:
                    to_translate["name"] = db_category.name
                if db_category.description:
                    to_translate["description"] = db_category.description

                if to_translate:
                    new_translations = translate_fields(to_translate, db)
                    if new_translations:
                        current_trans = db_category.translations or {}
                        if isinstance(current_trans, str):
                            import json
                            try: current_trans = json.loads(current_trans)
                            except: current_trans = {}
                        for lang in ["en", "fr"]:
                            if lang in new_translations:
                                if lang not in current_trans: current_trans[lang] = {}
                                current_trans[lang].update(new_translations[lang])
                                if not current_trans[lang].get("slug"):
                                    translated_name = current_trans[lang].get("name") or db_category.name
                                    current_trans[lang]["slug"] = slugify(translated_name)
                        import copy
                        from sqlalchemy.orm.attributes import flag_modified
                        db_category.translations = copy.deepcopy(current_trans)
                        flag_modified(db_category, "translations")
            except Exception as e:
                print(f"Error in category auto-translation: {e}")

        db.commit()
        db.refresh(db_category)
    return db_category

def delete_service_category(db: Session, category_id: str):
    tenant_id = current_tenant_var.get()
    db_category = db.query(models.ServiceCategory).filter(
        models.ServiceCategory.id == category_id,
        models.ServiceCategory.tenant_id == tenant_id
    ).first()
    if db_category:
        # Prevent deletion if there are services attached, or alternatively set their category to null.
        # Let's set services category to null if the category is deleted
        for service in db_category.services:
            service.category_id = None
        db.delete(db_category)
        db.commit()
    return db_category
