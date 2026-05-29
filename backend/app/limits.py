from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models
from .database import current_tenant_var

PLAN_LIMITS = {
    "free": {
        "specialists": 1,
        "services": 3,
        "locations": 1,
        "ai_smart_actions_daily": 0
    },
    "basic": {
        "specialists": 2,
        "services": 10,
        "locations": 1,
        "ai_smart_actions_daily": 5
    },
    "pro": {
        "specialists": 5,
        "services": 25,
        "locations": 3,
        "ai_smart_actions_daily": 15
    },
    "gold": {
        "specialists": 999999,
        "services": 999999,
        "locations": 5,
        "ai_smart_actions_daily": 999999
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

def check_location_limit(db: Session):
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        return
        
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        return
        
    limits = get_tenant_limits(tenant.plan_type)
    max_locations = limits.get("locations", 1)
    
    # Contar las sedes para este tenant_id
    current_count = db.query(models.Location).filter(
        models.Location.tenant_id == tenant_id,
        models.Location.is_active == True
    ).count()
    
    if current_count >= max_locations:
        raise HTTPException(
            status_code=403, 
            detail=f"Límite de sedes físicas alcanzado para su plan '{tenant.plan_type.upper()}'. Máximo permitido: {max_locations}. Por favor, mejore su plan de facturación para añadir más sucursales."
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
        
    # Si no es Gold, debe tener su propia clave de API configurada, o estar usando el Copiloto de IA
    # en plan de pago Básico/Pro (con la clave maestra con límites diarios), o el Trial de cortesía
    tenant_key = settings.gemini_api_key if provider == "gemini" else settings.openai_api_key
    if not tenant_key or not tenant_key.strip():
        # Para planes de pago basic y pro, facilitamos la llave maestra
        if plan in ["basic", "pro"]:
            master_key = os.getenv("GEMINI_API_KEY") if provider == "gemini" else os.getenv("OPENAI_API_KEY")
            if master_key and master_key.strip():
                return master_key
            else:
                raise HTTPException(status_code=500, detail="Clave maestra de IA no disponible.")
                
        # Para plan free (Trial de cortesía), permitimos el uso del chat global con clave maestra.
        # El control de límite se hará en el propio router de chat.
        master_key = os.getenv("GEMINI_API_KEY") if provider == "gemini" else os.getenv("OPENAI_API_KEY")
        if master_key and master_key.strip():
            return master_key
        else:
            raise HTTPException(status_code=500, detail="Clave maestra de IA no disponible para el trial.")
        
    return tenant_key
