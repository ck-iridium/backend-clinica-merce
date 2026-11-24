from datetime import datetime, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from . import models
from .database import current_tenant_var

PLAN_LIMITS = {
    "free": {
        # 14 días de prueba completa (Reverse Trial de Plan Pro: 35 acciones/día, 5 imágenes en total)
        "specialists": 4,
        "services": 999999,
        "locations": 2,
        "ai_smart_actions_daily": 35,
        "ai_images_monthly": 5,  # 5 imágenes en total durante todo el trial
    },
    "basic": {
        # Plan Individual (39€/mes): 1 especialista único, 1 sede, servicios ilimitados, 15 acciones IA/día, 30 imágenes/mes
        "specialists": 1,
        "services": 999999,
        "locations": 1,
        "ai_smart_actions_daily": 15,
        "ai_images_monthly": 30,
    },
    "pro": {
        # Plan Pro (69€/mes): hasta 4 especialistas, hasta 2 sedes, servicios ilimitados, 35 acciones IA/día, 90 imágenes/mes
        "specialists": 4,
        "services": 999999,
        "locations": 2,
        "ai_smart_actions_daily": 35,
        "ai_images_monthly": 90,
    },
    "gold": {
        # Plan Elite (129€/mes): hasta 10 especialistas, hasta 5 sedes, servicios e IA texto ilimitada, 250 imágenes/mes
        "specialists": 10,
        "services": 999999,
        "locations": 5,
        "ai_smart_actions_daily": 999999,
        "ai_images_monthly": 250,
    }
}

def normalize_plan_type(plan_type: str | None) -> str:
    """Normaliza alias comerciales (individual/elite) a claves canónicas de límites (basic/pro/gold/free)."""
    plan = (plan_type or "free").lower().strip()
    if plan in ("individual", "autonomo", "basic"):
        return "basic"
    if plan in ("elite", "vip", "gold"):
        return "gold"
    if plan in ("free", "trial"):
        return "free"
    return "pro"

def get_tenant_limits(plan_type: str):
    plan = normalize_plan_type(plan_type)
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
    from dotenv import load_dotenv
    load_dotenv(override=True)
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

def check_and_reset_ai_quotas(db: Session, tenant: models.Tenant):
    """
    Gestiona el lazy reset de:
    1. Cuota diaria de texto/operativa (a las 00:00 UTC cada día).
    2. Bolsa mensual de imágenes (cada ciclo de 30 días).
    """
    now = datetime.utcnow()
    today = now.date()
    needs_commit = False

    # 1. Reset diario de acciones de texto
    if tenant.ai_last_action_date != today:
        tenant.ai_daily_actions_used = 0
        tenant.ai_last_action_date = today
        needs_commit = True

    # 2. Inicialización / Reset mensual de imágenes (solo para cuentas de pago activas, no en trial)
    status = (tenant.subscription_status or "").lower()
    is_trial = status in ["trial", "trialing"] or (tenant.plan_type or "free").lower() == "free"

    if not is_trial:
        if not tenant.ai_images_reset_at:
            tenant.ai_images_reset_at = now + timedelta(days=30)
            tenant.ai_monthly_images_used = 0
            needs_commit = True
        elif now >= tenant.ai_images_reset_at:
            tenant.ai_monthly_images_used = 0
            tenant.ai_images_reset_at = now + timedelta(days=30)
            needs_commit = True

    if needs_commit:
        db.commit()

def check_and_deduct_text_action(db: Session, tenant: models.Tenant, settings: models.ClinicSettings = None):
    """
    Verifica y descuenta 1 acción de texto/operativa diaria.
    Si el tenant tiene BYOK o es Plan Gold (Elite), es ilimitado.
    Si está en Basic, Pro o Free y supera el límite diario, lanza HTTPException 429.
    """
    check_and_reset_ai_quotas(db, tenant)

    plan = (tenant.plan_type or "free").lower()
    has_byok = bool(settings and (
        (settings.ai_provider == "gemini" and settings.gemini_api_key and settings.gemini_api_key.strip()) or
        (settings.ai_provider == "openai" and settings.openai_api_key and settings.openai_api_key.strip())
    ))

    if getattr(tenant, "ai_unlimited", False) or has_byok or plan == "gold":
        return {"unlimited": True, "remaining": 999999, "limit": 999999, "used": tenant.ai_daily_actions_used or 0}

    limits = get_tenant_limits(plan)
    bonus_actions = getattr(tenant, "ai_bonus_daily_actions", 0) or 0
    daily_limit = limits.get("ai_smart_actions_daily", 15) + bonus_actions
    used = tenant.ai_daily_actions_used or 0

    if used >= daily_limit:
        raise HTTPException(
            status_code=429,
            detail=f"Has alcanzado tu límite diario de {daily_limit} acciones de IA para hoy. Conecta tu propia API Key en Ajustes > Avanzado para uso ilimitado o actualiza tu plan."
        )

    tenant.ai_daily_actions_used = used + 1
    db.commit()
    remaining = max(0, daily_limit - tenant.ai_daily_actions_used)
    return {"unlimited": False, "remaining": remaining, "limit": daily_limit, "used": tenant.ai_daily_actions_used}

def check_and_deduct_image_quota(db: Session, tenant: models.Tenant, settings: models.ClinicSettings = None):
    """
    Verifica y descuenta 1 imagen de la bolsa mensual (o trial).
    Si el tenant tiene BYOK configurado o ai_unlimited activo, es ILIMITADO (no descuenta de la bolsa).
    Si usa la clave maestra de ProBookia, descuenta de su bolsa mensual (o de las 5 del trial + bonus).
    Si agota la bolsa, lanza HTTPException 429.
    """
    check_and_reset_ai_quotas(db, tenant)

    plan = (tenant.plan_type or "free").lower()
    status = (tenant.subscription_status or "").lower()
    is_trial = status in ["trial", "trialing"] or plan == "free"
    has_byok = bool(settings and (
        (settings.ai_provider == "gemini" and settings.gemini_api_key and settings.gemini_api_key.strip()) or
        (settings.ai_provider == "openai" and settings.openai_api_key and settings.openai_api_key.strip())
    ))

    if getattr(tenant, "ai_unlimited", False) or has_byok:
        return {
            "unlimited": True,
            "has_byok": has_byok,
            "remaining": 999999,
            "limit": 999999,
            "used": tenant.ai_monthly_images_used or 0,
            "reset_at": tenant.ai_images_reset_at.isoformat() if tenant.ai_images_reset_at else None
        }

    bonus_images = getattr(tenant, "ai_bonus_images", 0) or 0

    if is_trial:
        # En trial son 5 imágenes en total + bonus
        max_images = 5 + bonus_images
        used = tenant.ai_trial_images_used or 0
        if used >= max_images:
            raise HTTPException(
                status_code=429,
                detail=f"Has agotado las {max_images} imágenes disponibles de tu cuenta. Conecta tu propia API Key en Ajustes > Avanzado para generar sin límites o contacta con soporte."
            )
        tenant.ai_trial_images_used = used + 1
        db.commit()
        remaining = max(0, max_images - tenant.ai_trial_images_used)
        return {
            "unlimited": False,
            "has_byok": False,
            "remaining": remaining,
            "limit": max_images,
            "used": tenant.ai_trial_images_used,
            "is_trial": True
        }
    else:
        # En planes de pago activos (basic, pro, gold)
        limits = get_tenant_limits(plan)
        max_images = limits.get("ai_images_monthly", 30) + bonus_images
        used = tenant.ai_monthly_images_used or 0
        if used >= max_images:
            raise HTTPException(
                status_code=429,
                detail=f"Has alcanzado tu cupo de {max_images} imágenes incluidas para este ciclo. Conecta tu propia API Key en Ajustes > Avanzado para imágenes ilimitadas o mejora tu plan."
            )
        tenant.ai_monthly_images_used = used + 1
        db.commit()
        remaining = max(0, max_images - tenant.ai_monthly_images_used)
        return {
            "unlimited": False,
            "has_byok": False,
            "remaining": remaining,
            "limit": max_images,
            "used": tenant.ai_monthly_images_used,
            "reset_at": tenant.ai_images_reset_at.isoformat() if tenant.ai_images_reset_at else None,
            "is_trial": False
        }
