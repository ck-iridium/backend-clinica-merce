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
        from ..database import current_tenant_var
        import uuid
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            tenant_id = "00000000-0000-0000-0000-000000000001"
            
        tenant_name = "Nuestra Clínica"
        tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
        if tenant:
            tenant_name = tenant.name

        content = models.SiteContent(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            hero_title=f"Bienvenidos a {tenant_name}",
            hero_subtitle="Tratamientos avanzados y cuidado personalizado para tu bienestar.",
            about_title=f"Sobre {tenant_name}",
            about_text="Nuestra pasión es cuidar de ti con los tratamientos más innovadores del sector."
        )
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
