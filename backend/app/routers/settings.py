from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from .. import crud, schemas, models, database
from typing import Dict, Any

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)

@router.get("/", response_model=schemas.ClinicSettingsResponse)
def read_settings(db: Session = Depends(database.get_db)):
    return crud.get_clinic_settings(db)

@router.patch("/", response_model=schemas.ClinicSettingsResponse)
def update_settings(settings_update: schemas.ClinicSettingsUpdate, db: Session = Depends(database.get_db)):
    return crud.update_clinic_settings(db, update_data=settings_update)

@router.get("/backup/export")
def export_database(db: Session = Depends(database.get_db)):
    # Export full DB to JSON
    data = {
        "settings": [s.__dict__ for s in db.query(models.ClinicSettings).all()],
        "clients": [c.__dict__ for c in db.query(models.Client).all()],
        "services": [s.__dict__ for s in db.query(models.Service).all()],
        "appointments": [a.__dict__ for a in db.query(models.Appointment).all()],
        "vouchers": [v.__dict__ for v in db.query(models.Voucher).all()],
        "invoices": [i.__dict__ for i in db.query(models.Invoice).all()],
    }
    # Clean up sqlalchemy state and dates
    for k in data.keys():
        for item in data[k]:
            item.pop('_sa_instance_state', None)
            for field, val in item.items():
                if hasattr(val, 'isoformat'):
                    item[field] = val.isoformat()
    return data

@router.post("/backup/restore")
async def restore_database(backup_data: Dict[str, Any], db: Session = Depends(database.get_db)):
    try:
        # Detectar el tipo de base de datos
        is_sqlite = db.bind.dialect.name == "sqlite"
        
        # Desactivar temporalmente las claves foráneas
        if is_sqlite:
            db.execute(text("PRAGMA foreign_keys = OFF;"))
        else:
            db.execute(text("SET session_replication_role = 'replica';"))
        
        db.query(models.Invoice).delete()
        db.query(models.Appointment).delete()
        db.query(models.Voucher).delete()
        
        # We must clear Client and Service after tables that depend on them
        db.query(models.Client).delete()
        db.query(models.Service).delete()
        db.query(models.ClinicSettings).delete()
        db.commit()

        # Insert items back. 
        from datetime import datetime, date
        def parse_dates(item):
            for k, v in item.items():
                if isinstance(v, str) and len(v) >= 10:
                    try:
                        if "T" in v:
                            item[k] = datetime.fromisoformat(v)
                        else:
                            item[k] = date.fromisoformat(v)
                    except ValueError:
                        pass
            return item
            
        for s in backup_data.get("settings", []): db.add(models.ClinicSettings(**parse_dates(s)))
        for c in backup_data.get("clients", []): db.add(models.Client(**parse_dates(c)))
        for s in backup_data.get("services", []): db.add(models.Service(**parse_dates(s)))
        db.commit()
        
        for a in backup_data.get("appointments", []): db.add(models.Appointment(**parse_dates(a)))
        for v in backup_data.get("vouchers", []): db.add(models.Voucher(**parse_dates(v)))
        for i in backup_data.get("invoices", []): db.add(models.Invoice(**parse_dates(i)))
        db.commit()
        
        # Volver al modo normal
        if is_sqlite:
            db.execute(text("PRAGMA foreign_keys = ON;"))
        else:
            db.execute(text("SET session_replication_role = 'origin';"))
        
        return {"ok": True, "message": "Database restored and repopulated"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
