from sqlalchemy.orm import Session
from .. import models, schemas
import uuid

# --- SITE CONTENT (CMS) ---
def get_site_content(db: Session):
    from ..database import current_tenant_var
    
    tenant_id = current_tenant_var.get()
    
    # 1. EL MURO: Si por algún motivo no hay tenant_id, devolvemos un cascarón vacío.
    # NO GUARDAMOS NADA para no corromper la base de datos.
    if not tenant_id:
        return models.SiteContent(
            hero_title="Bienvenidos",
            hero_subtitle="Configura tu negocio en el panel de control.",
            about_title="Sobre nosotros",
            about_text="Texto pendiente de configuración."
        )

    # 2. FILTRO ESTRICTO: Buscamos SOLAMENTE el contenido del tenant actual.
    try:
        content = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant_id).first()
    except Exception:
        db.rollback()
        from ..utils.migrations import run_auto_migrations
        run_auto_migrations()
        content = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant_id).first()

    # 3. ESTADO VACÍO DINÁMICO: Si el tenant es nuevo y no tiene contenido, se lo creamos a él.
    if not content:
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
    
    # Protección extra: No actualizar si es un cascarón vacío en memoria sin ID
    if not getattr(content, 'id', None):
        return content
    
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