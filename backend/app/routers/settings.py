from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session
from .. import schemas, models, database
from ..crud import settings as crud
from typing import Dict, Any

router = APIRouter(
    prefix="/settings",
    tags=["settings"],
)

@router.get("/", response_model=schemas.ClinicSettingsResponse)
def read_settings(db: Session = Depends(database.get_db)):
    return crud.get_clinic_settings(db)

@router.get("/limits")
def read_tenant_limits(db: Session = Depends(database.get_db)):
    from ..database import current_tenant_var
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context not found")
        
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
        
    plan = tenant.plan_type or "free"
    from ..limits import get_tenant_limits
    limits = get_tenant_limits(plan)
    
    # Contar uso actual
    from sqlalchemy import func
    services_count = db.query(models.Service).filter(models.Service.tenant_id == tenant_id).count()
    specialists_count = db.query(models.Profile).filter(
        models.Profile.tenant_id == tenant_id,
        func.lower(models.Profile.role).in_([
            "specialist", "receptionist", "admin",
            "especialista", "recepcionist", "recepción", "recepcion", "administrador"
        ])
    ).count()
    
    clinic_settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    has_own_key = False
    if clinic_settings:
        provider = clinic_settings.ai_provider or "gemini"
        key = clinic_settings.gemini_api_key if provider == "gemini" else clinic_settings.openai_api_key
        has_own_key = bool(key and key.strip())
        
    is_gold = plan.lower() == "gold"
    ai_allowed = is_gold or has_own_key
    ai_requires_byok = not is_gold

    return {
        "tenant_id": tenant_id,
        "plan_type": plan,
        "ai_trial_queries_used": tenant.ai_trial_queries_used if hasattr(tenant, "ai_trial_queries_used") else 0,
        "ai_daily_actions_used": tenant.ai_daily_actions_used if hasattr(tenant, "ai_daily_actions_used") else 0,
        "limits": {
            "specialists": limits["specialists"],
            "services": limits["services"],
            "ai_smart_actions_daily": limits.get("ai_smart_actions_daily", 0),
            "ai_allowed": ai_allowed,
            "ai_requires_byok": ai_requires_byok
        },
        "usage": {
            "specialists": specialists_count,
            "services": services_count
        }
    }

@router.patch("/", response_model=schemas.ClinicSettingsResponse)
def update_settings(settings_update: schemas.ClinicSettingsUpdate, db: Session = Depends(database.get_db)):
    return crud.update_clinic_settings(db, update_data=settings_update)

@router.get("/backup/export")
def export_database(db: Session = Depends(database.get_db)):
    # Export only current tenant data
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        import logging
        logging.error("Seguridad: Intento de exportar base de datos sin tenant_id en el contexto")
        raise HTTPException(status_code=400, detail="No autorizado. Inquilino no identificado.")

    data = {
        "settings": [s.__dict__ for s in db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).all()],
        "clients": [c.__dict__ for c in db.query(models.Client).filter(models.Client.tenant_id == tenant_id).all()],
        "services": [s.__dict__ for s in db.query(models.Service).filter(models.Service.tenant_id == tenant_id).all()],
        "appointments": [a.__dict__ for a in db.query(models.Appointment).filter(models.Appointment.tenant_id == tenant_id).all()],
        "vouchers": [v.__dict__ for v in db.query(models.Voucher).filter(models.Voucher.tenant_id == tenant_id).all()],
        "invoices": [i.__dict__ for i in db.query(models.Invoice).filter(models.Invoice.tenant_id == tenant_id).all()],
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
        tenant_id = database.current_tenant_var.get()
        if not tenant_id:
            import logging
            logging.error("Seguridad: Intento de restaurar base de datos sin tenant_id en el contexto")
            raise HTTPException(status_code=400, detail="No autorizado. Inquilino no identificado.")

        # Detectar el tipo de base de datos
        is_sqlite = db.bind.dialect.name == "sqlite"
        
        # Desactivar temporalmente las claves foráneas
        if is_sqlite:
            db.execute(text("PRAGMA foreign_keys = OFF;"))
        else:
            db.execute(text("SET session_replication_role = 'replica';"))
        
        db.query(models.Invoice).filter(models.Invoice.tenant_id == tenant_id).delete()
        db.query(models.Appointment).filter(models.Appointment.tenant_id == tenant_id).delete()
        db.query(models.Voucher).filter(models.Voucher.tenant_id == tenant_id).delete()
        
        # We must clear Client and Service after tables that depend on them
        db.query(models.Client).filter(models.Client.tenant_id == tenant_id).delete()
        db.query(models.Service).filter(models.Service.tenant_id == tenant_id).delete()
        db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).delete()
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
            
        for s in backup_data.get("settings", []):
            item = parse_dates(s)
            item["tenant_id"] = tenant_id
            db.add(models.ClinicSettings(**item))
            
        for c in backup_data.get("clients", []):
            item = parse_dates(c)
            item["tenant_id"] = tenant_id
            db.add(models.Client(**item))
            
        for s in backup_data.get("services", []):
            item = parse_dates(s)
            item["tenant_id"] = tenant_id
            db.add(models.Service(**item))
        db.commit()
        
        for a in backup_data.get("appointments", []):
            item = parse_dates(a)
            item["tenant_id"] = tenant_id
            db.add(models.Appointment(**item))
            
        for v in backup_data.get("vouchers", []):
            item = parse_dates(v)
            item["tenant_id"] = tenant_id
            db.add(models.Voucher(**item))
            
        for i in backup_data.get("invoices", []):
            item = parse_dates(i)
            item["tenant_id"] = tenant_id
            db.add(models.Invoice(**item))
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
