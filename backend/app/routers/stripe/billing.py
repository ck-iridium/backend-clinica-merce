import os
import traceback
from urllib.parse import urlparse
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from ... import models, database
from ...services.stripe_service import StripeService
from .schemas import CreateSubscriptionSessionRequest

router = APIRouter()

@router.post("/create-subscription-session")
def create_subscription_session(
    request: CreateSubscriptionSessionRequest,
    req: Request,
    db: Session = Depends(database.get_db)
):
    origin = req.headers.get("origin") or req.headers.get("referer")
    if origin:
        parsed = urlparse(origin)
        frontend_url = f"{parsed.scheme}://{parsed.netloc}"
    else:
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    tenant = db.query(models.Tenant).filter(models.Tenant.id == request.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")

    url = StripeService.create_subscription_session(
        tenant_id=request.tenant_id,
        plan_type=request.plan_type,
        stripe_customer_id=tenant.stripe_customer_id,
        frontend_url=frontend_url
    )
    return {"url": url}


@router.get("/verify-checkout-session/{session_id}")
def verify_checkout_session(session_id: str, db: Session = Depends(database.get_db)):
    """
    Endpoint para verificación activa desde el frontend.
    Recupera la sesión de checkout de Stripe, comprueba el estado de pago,
    sincroniza en la base de datos el nuevo plan del tenant, e invalida la caché.
    """
    try:
        session = StripeService.retrieve_checkout_session(session_id)
        payment_status = getattr(session, "payment_status", None)
            
        if payment_status != "paid":
            raise HTTPException(status_code=400, detail="La sesión de Stripe no está pagada.")

        metadata = getattr(session, "metadata", None) or {}
        tenant_id = metadata.get("tenant_id") if isinstance(metadata, dict) else getattr(metadata, "tenant_id", None)
        plan_type = metadata.get("plan_type") if isinstance(metadata, dict) else getattr(metadata, "plan_type", None)

        if not tenant_id or not plan_type:
            raise HTTPException(status_code=400, detail="Metadatos incompletos en la sesión de Stripe.")

        tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Inquilino no encontrado")

        stripe_cust_id = getattr(session, "customer", None)
        stripe_sub_id = getattr(session, "subscription", None)

        tenant.stripe_customer_id = stripe_cust_id
        tenant.stripe_subscription_id = stripe_sub_id
        tenant.plan_type = plan_type
        tenant.subscription_status = "active"
        db.commit()

        # Invalidador de caché en tiempo real
        try:
            from ...main import TENANT_STATUS_CACHE
            if tenant.id in TENANT_STATUS_CACHE:
                del TENANT_STATUS_CACHE[tenant.id]
                print(f"[CACHE] Invalidador de caché activado para tenant: {tenant.id}")
        except Exception as e:
            print(f"[CACHE] [WARNING] Error al invalidar caché: {e}")

        return {
            "status": "success",
            "message": "Suscripción sincronizada correctamente",
            "tenant_id": tenant.id,
            "plan_type": tenant.plan_type,
            "subscription_status": tenant.subscription_status
        }
    except HTTPException:
        raise
    except Exception as e:
        error_trace = traceback.format_exc()
        raise HTTPException(
            status_code=500,
            detail=f"Error Crítico: {str(e)} | Traza: {error_trace}"
        )
