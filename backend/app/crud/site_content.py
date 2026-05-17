from sqlalchemy.orm import Session
from .. import models, schemas

# --- SITE CONTENT (CMS) ---
def get_site_content(db: Session):
    try:
        content = db.query(models.SiteContent).first()
    except Exception:
        db.rollback()
        from ..utils.migrations import run_auto_migrations
        run_auto_migrations()
        content = db.query(models.SiteContent).first()

    if not content:
        content = models.SiteContent(id=1)
        db.add(content)
        db.commit()
        db.refresh(content)
    return content

def update_site_content(db: Session, update_data: schemas.SiteContentUpdate):
    content = get_site_content(db)
    
    translatable_keys = [
        "hero_title", "hero_subtitle", "hero_button_text",
        "about_title", "about_text", "about_button_text",
        "cta_title", "cta_subtitle", "cta_button_text"
    ]
    changed_fields = {}
    
    for key, value in update_data.model_dump(exclude_unset=True).items():
        if key in translatable_keys and getattr(content, key) != value:
            changed_fields[key] = value
        setattr(content, key, value)
        
    if changed_fields or not content.translations:
        try:
            from ..utils.translator import translate_fields
            all_translatable = {k: getattr(content, k) for k in translatable_keys if getattr(content, k)}
            new_translations = translate_fields(all_translatable, db)
            if new_translations:
                content.translations = new_translations
        except Exception as e:
            print(f"Error in site content auto-translation: {e}")
            
    db.commit()
    db.refresh(content)
    return content
