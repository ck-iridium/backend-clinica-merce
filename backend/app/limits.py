from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models
from .database import current_tenant_var

PLAN_LIMITS = {
    "free": {
        "specialists": 1,
        "services": 3
    },
    "basic": {
        "specialists": 2,
        "services": 10
    },
    "pro": {
        "specialists": 5,
        "services": 25
    },
    "gold": {
        "specialists": 999999,
        "services": 999999
    }
}

def get_tenant_limits(plan_type: str):
    plan = (plan_type or "free").lower()
    return PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])

def check_service_limit(db: Session):
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        return
        
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        return
        
    limits = get_tenant_limits(tenant.plan_type)
    max_services = limits["services"]
    
    # Contar los servicios actuales para este tenant_id
    current_count = db.query(models.Service).filter(models.Service.tenant_id == tenant_id).count()
    
    if current_count >= max_services:
        raise HTTPException(
            status_code=403, 
            detail=f"Límite de servicios alcanzado para su plan '{tenant.plan_type.upper()}'. Máximo permitido: {max_services}. Por favor, mejore su plan de facturación."
        )

def check_specialist_limit(db: Session):
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        return
        
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        return
        
    limits = get_tenant_limits(tenant.plan_type)
    max_specialists = limits["specialists"]
    
    # Contar los perfiles de equipo para este tenant_id
    from sqlalchemy import func
    current_count = db.query(models.Profile).filter(
        models.Profile.tenant_id == tenant_id,
        func.lower(models.Profile.role).in_([
            "specialist", "receptionist", "admin",
            "especialista", "recepcionist", "recepción", "recepcion", "administrador"
        ])
    ).count()
    
    if current_count >= max_specialists:
        raise HTTPException(
            status_code=403, 
            detail=f"Límite de especialistas/personal alcanzado para su plan '{tenant.plan_type.upper()}'. Máximo permitido: {max_specialists}. Por favor, mejore su plan de facturación."
        )

def get_tenant_ai_key(db: Session, provider: str) -> str:
    import os
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Inquilino no identificado.")
        
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado.")
        
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración no encontrada.")
        
    plan = (tenant.plan_type or "free").lower()
    
    # Si es Gold, tiene acceso total y transparente usando la clave maestra por defecto
    if plan == "gold":
        master_key = os.getenv("GEMINI_API_KEY") if provider == "gemini" else os.getenv("OPENAI_API_KEY")
        tenant_key = settings.gemini_api_key if provider == "gemini" else settings.openai_api_key
        key = tenant_key or master_key
        if not key or not key.strip():
            raise HTTPException(status_code=400, detail="Clave de API no configurada en el sistema para Plan Premium.")
        return key
        
    # Si no es Gold, debe tener su propia clave de API configurada o estar en el Trial de cortesía (máximo 10 consultas)
    tenant_key = settings.gemini_api_key if provider == "gemini" else settings.openai_api_key
    if not tenant_key or not tenant_key.strip():
        queries_used = tenant.ai_trial_queries_used if hasattr(tenant, "ai_trial_queries_used") else 0
        if queries_used is None:
            queries_used = 0
            
        if queries_used < 10:
            # Devolver llave maestra para posibilitar el trial sin incrementar el contador todavía
            master_key = os.getenv("GEMINI_API_KEY") if provider == "gemini" else os.getenv("OPENAI_API_KEY")
            if master_key and master_key.strip():
                return master_key
            else:
                raise HTTPException(status_code=500, detail="Clave maestra de IA no disponible para el trial.")
        
        # Si se agotaron las consultas de trial, lanzamos error específico para la UI
        raise HTTPException(
            status_code=403, 
            detail="AI_TRIAL_EXHAUSTED"
        )
        
    return tenant_key
