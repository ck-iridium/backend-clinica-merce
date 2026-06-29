from sqlalchemy.orm import Session
from .. import models, schemas

# --- SETTINGS ---
def get_clinic_settings(db: Session):
    from ..database import current_tenant_var
    tenant_id = current_tenant_var.get()
    try:
        settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    except Exception:
        # Si hay un error de esquema (columnas faltantes), intentamos corregir al vuelo
        db.rollback()
        from ..utils.migrations import run_auto_migrations
        run_auto_migrations()
        settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()

    if not settings:
        tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
        default_name = tenant.name if tenant else "Mi Clínica"
        # Create default singleton settings if not exists
        settings = models.ClinicSettings(
            clinic_name=default_name,
            invoice_prefix="FA-{YY}-",
            invoice_next_number=1,
            default_tax_rate=21.0,
            tenant_id=tenant_id
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

def update_clinic_settings(db: Session, update_data: schemas.ClinicSettingsUpdate):
    settings = get_clinic_settings(db)
    data = update_data.model_dump(exclude_unset=True)
    # Serializar working_days como JSON string para SQLite
    if 'working_days' in data and data['working_days'] is not None:
        import json
        data['working_days'] = json.dumps(data['working_days'])
        
    # Ignorar claves ofuscadas para evitar sobreescribir la clave real con asteriscos
    for key in ['gemini_api_key', 'openai_api_key']:
        if key in data and data[key] and '***' in data[key]:
            del data[key]
            
    for key, value in data.items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
