import os
import uuid
import random
import string
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas

router = APIRouter(
    prefix="/subscription",
    tags=["subscription-bizum"],
)

PLAN_PRICES = {
    "basic": {"monthly": 29.00, "yearly": 290.00},
    "pro": {"monthly": 59.00, "yearly": 590.00},
    "gold": {"monthly": 99.00, "yearly": 990.00}
}

def generate_reference_code(db: Session) -> str:
    """Genera un código único alfanumérico de 5 caracteres con prefijo PB-."""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = "PB-" + "".join(random.choices(chars, k=5))
        # Comprobar unicidad
        existing = db.query(models.SubscriptionRequest).filter(
            models.SubscriptionRequest.reference_code == code
        ).first()
        if not existing:
            return code

@router.post("/request-bizum", response_model=schemas.SubscriptionRequestOut)
def request_bizum_payment(
    payload: schemas.SubscriptionRequestCreate,
    user_id: str = None, # Enviado por el frontend opcionalmente
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Contexto de inquilino no encontrado.")
        
    plan = payload.plan_type.lower()
    period = payload.billing_period.lower()
    
    if plan not in PLAN_PRICES:
        raise HTTPException(status_code=400, detail="Plan de suscripción no válido.")
    if period not in ["monthly", "yearly"]:
        raise HTTPException(status_code=400, detail="Periodo de facturación debe ser 'monthly' o 'yearly'.")
        
    # Obtener precio
    amount = PLAN_PRICES[plan][period]
    
    # Resolver user_id si no viene
    if not user_id:
        # Buscamos cualquier usuario del tenant
        user = db.query(models.User).filter(models.User.tenant_id == tenant_id).first()
        if not user:
            raise HTTPException(status_code=400, detail="No se encontró ningún usuario para este inquilino.")
        resolved_user_id = user.id
    else:
        resolved_user_id = user_id

    # Comprobar si ya hay una solicitud activa pendiente o enviada
    existing_active = db.query(models.SubscriptionRequest).filter(
        models.SubscriptionRequest.tenant_id == tenant_id,
        models.SubscriptionRequest.status.in_(["pending", "submitted"])
    ).first()
    if existing_active:
        return existing_active

    # Generar código de referencia
    ref_code = generate_reference_code(db)
    
    # Crear registro
    new_request = models.SubscriptionRequest(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        user_id=resolved_user_id,
        plan_type=plan,
        billing_period=period,
        amount=amount,
        reference_code=ref_code,
        status="pending"
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    return new_request

@router.post("/confirm-sent/{request_id}", response_model=schemas.SubscriptionRequestOut)
def confirm_payment_sent(
    request_id: str,
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Contexto de inquilino no encontrado.")
        
    request = db.query(models.SubscriptionRequest).filter(
        models.SubscriptionRequest.id == request_id,
        models.SubscriptionRequest.tenant_id == tenant_id
    ).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="Solicitud de suscripción no encontrada.")
        
    if request.status not in ["pending", "submitted"]:
        raise HTTPException(status_code=400, detail="La solicitud ya ha sido procesada o expirada.")
        
    # Cambiar estado de solicitud a submitted
    request.status = "submitted"
    request.updated_at = datetime.utcnow()
    
    # --- ACTIVACIÓN OPTIMISTA (Grace Period) ---
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if tenant:
        tenant.plan_type = request.plan_type
        tenant.subscription_status = "grace"
        tenant.subscription_expires_at = datetime.utcnow() + timedelta(hours=24)
        
    db.commit()
    db.refresh(request)
    return request

@router.get("/current-request", response_model=schemas.SubscriptionRequestOut)
def get_current_subscription_request(db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Contexto de inquilino no encontrado.")
        
    request = db.query(models.SubscriptionRequest).filter(
        models.SubscriptionRequest.tenant_id == tenant_id
    ).order_by(models.SubscriptionRequest.created_at.desc()).first()
    
    if not request:
        raise HTTPException(status_code=404, detail="No se encontraron solicitudes para este inquilino.")
    return request
