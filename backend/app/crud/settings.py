from sqlalchemy.orm import Session
from .. import models, schemas

# --- SETTINGS ---
def get_clinic_settings(db: Session):
    try:
        settings = db.query(models.ClinicSettings).first()
    except Exception:
        # Si hay un error de esquema (columnas faltantes), intentamos corregir al vuelo
        db.rollback()
        from ..utils.migrations import run_auto_migrations
        run_auto_migrations()
        settings = db.query(models.ClinicSettings).first()

    if not settings:
        # Create default singleton settings if not exists
        settings = models.ClinicSettings(
            id=1,
            clinic_name="Clínica Merce",
            invoice_prefix="FA-{YY}-",
            invoice_next_number=1,
            default_tax_rate=21.0
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
    for key, value in data.items():
        setattr(settings, key, value)
    db.commit()
    db.refresh(settings)
    return settings
