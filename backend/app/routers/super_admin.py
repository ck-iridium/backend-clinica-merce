import base64
import json
import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import database, models

router = APIRouter(
    prefix="/super-admin",
    tags=["super-admin"],
)

# ---------------------------------------------------------------------
# SCHEMAS DE ENTRADA Y SALIDA
# ---------------------------------------------------------------------
class TenantOut(BaseModel):
    id: str
    name: str
    slug: str
    stripe_customer_id: Optional[str] = None
    subscription_status: str
    stripe_subscription_id: Optional[str] = None
    plan_type: str
    subscription_expires_at: Optional[datetime] = None
    custom_domain: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

class PlanUpdate(BaseModel):
    plan_type: str

# ---------------------------------------------------------------------
# VERIFICACIÓN DE ROL DE SUPER ADMIN
# ---------------------------------------------------------------------
def verify_super_admin(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado: Falta token Bearer")
    
    token = authorization.split(" ")[1]
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise HTTPException(status_code=401, detail="Formato de token inválido")
        payload_b64 = parts[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload_json = base64.b64decode(payload_b64).decode("utf-8")
        payload = json.loads(payload_json)
        
        # Obtener rol
        app_metadata = payload.get("app_metadata", {})
        role = app_metadata.get("role")
        if not role:
            user_metadata = payload.get("user_metadata", {})
            role = user_metadata.get("role")
            
        if role != "super_admin":
            raise HTTPException(status_code=403, detail="Acceso denegado: Se requiere rol de Super Admin")
            
        return payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")

# ---------------------------------------------------------------------
# ENDPOINTS DEL BACKOFFICE
# ---------------------------------------------------------------------
@router.get("/tenants", response_model=List[TenantOut])
def get_tenants(
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Obtiene la lista de todos los inquilinos (Tenants) en el SaaS.
    """
    tenants = db.query(models.Tenant).order_by(models.Tenant.created_at.desc()).all()
    return tenants

@router.post("/tenants/{tenant_id}/status", response_model=TenantOut)
def update_tenant_status(
    tenant_id: str,
    payload: StatusUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Actualiza manualmente el estado de suscripción de un inquilino.
    """
    if payload.status not in ["active", "suspended", "canceled"]:
        raise HTTPException(status_code=400, detail="Estado no permitido. Debe ser 'active', 'suspended' o 'canceled'")
    
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    tenant.subscription_status = payload.status
    db.commit()
    db.refresh(tenant)
    return tenant

@router.put("/tenants/{tenant_id}/plan", response_model=TenantOut)
def update_tenant_plan(
    tenant_id: str,
    payload: PlanUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Actualiza manualmente el tipo de plan de un inquilino.
    """
    plan = payload.plan_type.lower()
    if plan not in ["free", "basic", "pro", "gold"]:
        raise HTTPException(status_code=400, detail="Plan no permitido. Debe ser 'free', 'basic', 'pro' o 'gold'")
    
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    tenant.plan_type = plan
    db.commit()
    db.refresh(tenant)
    return tenant

# ---------------------------------------------------------------------
# IMPERSONACIÓN (MODO SOPORTE)
# ---------------------------------------------------------------------
import hmac
import hashlib
import os
from datetime import timedelta

def generate_impersonation_token(tenant_id: str, slug: str, name: str) -> str:
    secret = os.environ.get("JWT_SECRET_KEY", "super-admin-secret-key-123")
    payload = {
        "impersonate": "true",
        "tenant_id": tenant_id,
        "slug": slug,
        "name": name,
        "exp": (datetime.utcnow() + timedelta(hours=2)).isoformat()
    }
    
    # Base64 encode header and payload
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    # Create signature
    message = f"{header_b64}.{payload_b64}"
    sig = hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    
    return f"{message}.{sig_b64}"

@router.post("/impersonate/{tenant_id}")
def impersonate_tenant(
    tenant_id: str,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Genera un token de impersonación firmado para un tenant específico (Modo Soporte).
    """
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    token = generate_impersonation_token(tenant.id, tenant.slug, tenant.name)
    return {
        "success": True,
        "token": token,
        "tenant_id": tenant.id,
        "slug": tenant.slug,
        "name": tenant.name
    }

class SaasSettingsUpdate(BaseModel):
    allow_search_engine_indexing: bool

@router.get("/settings")
def get_saas_settings(
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Obtiene los ajustes globales del SaaS (Tenant por defecto).
    """
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == "00000000-0000-0000-0000-000000000001").first()
    if not settings:
        settings = models.ClinicSettings(tenant_id="00000000-0000-0000-0000-000000000001")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return {
        "allow_search_engine_indexing": settings.allow_search_engine_indexing
    }

@router.patch("/settings")
def update_saas_settings(
    payload: SaasSettingsUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Actualiza los ajustes globales del SaaS.
    """
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == "00000000-0000-0000-0000-000000000001").first()
    if not settings:
        settings = models.ClinicSettings(tenant_id="00000000-0000-0000-0000-000000000001")
        db.add(settings)
    settings.allow_search_engine_indexing = payload.allow_search_engine_indexing
    db.commit()
    db.refresh(settings)
    return {
        "allow_search_engine_indexing": settings.allow_search_engine_indexing
    }

class TenantDomainUpdate(BaseModel):
    custom_domain: Optional[str] = None

@router.put("/tenants/{tenant_id}/domain", response_model=TenantOut)
def update_tenant_domain(
    tenant_id: str,
    payload: TenantDomainUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Actualiza el dominio personalizado de un inquilino de forma persistente.
    """
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
    
    # Limpiar espacios en blanco
    domain_value = payload.custom_domain.strip() if payload.custom_domain else None
    if domain_value == "":
        domain_value = None

    # Validar formato de dominio si no es None
    if domain_value is not None:
        DOMAIN_REGEX = re.compile(
            r'^(?:[a-zA-Z0-9]'
            r'(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+'
            r'[a-zA-Z]{2,18}$'
        )
        if not DOMAIN_REGEX.match(domain_value):
            raise HTTPException(
                status_code=400,
                detail=f"'{domain_value}' no es un formato de dominio válido. Debe incluir una extensión válida (ej: .com, .es)."
            )

    tenant.custom_domain = domain_value
    db.commit()
    db.refresh(tenant)
    return tenant
