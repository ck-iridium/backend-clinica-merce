import base64
import json
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
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

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
