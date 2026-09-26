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
    locations_count = db.query(models.Location).filter(
        models.Location.tenant_id == tenant_id,
        models.Location.is_active == True
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

    admin_user = db.query(models.User).filter(models.User.tenant_id == tenant_id, models.User.role == "admin").first()
    email_verified = admin_user.email_verified if admin_user else True

    return {
        "tenant_id": tenant_id,
        "tenant_slug": tenant.slug,
        "custom_domain": tenant.custom_domain,
        "plan_type": plan,
        "subscription_status": tenant.subscription_status,
        "subscription_expires_at": tenant.subscription_expires_at.isoformat() if tenant.subscription_expires_at else None,
        "created_at": tenant.created_at.isoformat() if tenant.created_at else None,
        "email_verified": email_verified,
        "has_own_key": has_own_key,
        "ai_trial_queries_used": tenant.ai_trial_queries_used if hasattr(tenant, "ai_trial_queries_used") else 0,
        "ai_daily_actions_used": tenant.ai_daily_actions_used if hasattr(tenant, "ai_daily_actions_used") else 0,
        "limits": {
            "specialists": limits["specialists"],
            "services": limits["services"],
            "locations": limits.get("locations", 1),
            "ai_smart_actions_daily": limits.get("ai_smart_actions_daily", 0),
            "ai_allowed": ai_allowed,
            "ai_requires_byok": ai_requires_byok
        },
        "usage": {
            "specialists": specialists_count,
            "services": services_count,
            "locations": locations_count
        }
    }

@router.patch("/", response_model=schemas.ClinicSettingsResponse)
def update_settings(settings_update: schemas.ClinicSettingsUpdate, db: Session = Depends(database.get_db)):
    updated = crud.update_clinic_settings(db, update_data=settings_update)
    from ..database import current_tenant_var
    from ..crud.appointments import rebuild_blocked_days_cache
    rebuild_blocked_days_cache(db, current_tenant_var.get())
    return updated

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
async def restore_database():
    """
    Endpoint deshabilitado en entornos SaaS multi-tenant.
    La restauración de datos la realiza el equipo de soporte técnico/superadmin para garantizar la integridad referencial y legal (facturación/RGPD).
    """
    raise HTTPException(
        status_code=403, 
        detail="La restauración manual directa de base de datos está deshabilitada por integridad legal y seguridad del sistema. Contacte con soporte técnico para recuperaciones asistidas."
    )

