import uuid
import re
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import text

from ... import models, database
from ...services.tenant_provisioner import provision_tenant
from ...services.stripe_service import StripeService
from .schemas import OnboardingSessionRequest, OnboardingCompleteSetupRequest
from .utils import extract_and_fallback_onboarding_data

router = APIRouter()

@router.post("/create-onboarding-session")
def create_onboarding_session(request: OnboardingSessionRequest, req: Request):
    origin = req.headers.get("origin") or req.headers.get("referer")
    if not origin or "localhost" not in origin:
        frontend_url = "https://www.probookia.com"
    else:
        frontend_url = origin.rstrip("/")
    
    db = database.SessionLocal()
    try:
        existing_tenant = db.query(models.Tenant).filter(models.Tenant.slug == request.tenant_slug).first()
        if existing_tenant:
            raise HTTPException(status_code=400, detail="El subdominio ya está registrado. Por favor, elige otro.")
        
        existing_user = db.query(models.User).filter(models.User.email == request.admin_email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="El correo electrónico del administrador ya está registrado.")
            
        selected_plan = request.plan_type.lower()
        
        # 1. Plan gratuito: aprovisionamiento instantáneo
        if selected_plan == "free":
            print(f"[FREE REGISTRATION] Aprovisionando cuenta gratuita al instante para {request.tenant_slug}")
            tenant = provision_tenant(
                db=db,
                tenant_name=request.tenant_name,
                tenant_slug=request.tenant_slug,
                admin_email=request.admin_email,
                admin_name=request.admin_name,
                admin_password=request.admin_password,
                stripe_customer_id=None,
                stripe_subscription_id=None,
                plan_type="free"
            )
            redirect_url = f"{frontend_url}/onboarding/success?free_success=true&tenant_id={tenant.id}&tenant_slug={tenant.slug}&tenant_name={tenant.name}&admin_email={request.admin_email}&admin_name={request.admin_name}&admin_password={request.admin_password}"
            return {"url": redirect_url}

        # 2. Plan premium: aprovisionamiento con Periodo de Prueba (Trial) de 14 días
        print(f"[TRIAL ONBOARDING] Aprovisionando cuenta con Trial de 14 días para {request.tenant_slug}")
        tenant = provision_tenant(
            db=db,
            tenant_name=request.tenant_name,
            tenant_slug=request.tenant_slug,
            admin_email=request.admin_email,
            admin_name=request.admin_name,
            admin_password=request.admin_password,
            stripe_customer_id=None,
            stripe_subscription_id=None,
            plan_type=selected_plan,
            subscription_status="trial",
            subscription_expires_at=datetime.utcnow() + timedelta(days=14)
        )
        redirect_url = f"{frontend_url}/onboarding/success?free_success=true&tenant_id={tenant.id}&tenant_slug={tenant.slug}&tenant_name={tenant.name}&admin_email={request.admin_email}&admin_name={request.admin_name}&admin_password={request.admin_password}"
        return {"url": redirect_url}
            
    finally:
        db.close()


@router.get("/onboarding-session-status/{session_id}")
def onboarding_session_status(session_id: str, db: Session = Depends(database.get_db)):
    try:
        session = StripeService.retrieve_checkout_session(session_id)
        if session.payment_status != "paid" and session.status != "complete":
            raise HTTPException(status_code=400, detail="El pago no ha sido completado todavía en Stripe")

        metadata = session.metadata or {}
        metadata_type = None
        if isinstance(metadata, dict):
            metadata_type = metadata.get("type")
        else:
            metadata_type = getattr(metadata, "type", None)
            if not metadata_type:
                try:
                    metadata_type = metadata["type"]
                except Exception:
                    pass

        if metadata_type != "saas_onboarding":
            raise HTTPException(status_code=400, detail="Esta sesión de Stripe no corresponde a un onboarding de plataforma")

        onboarding_data = extract_and_fallback_onboarding_data(session, metadata)
        tenant_name = onboarding_data["tenant_name"]
        tenant_slug = onboarding_data["tenant_slug"]
        admin_email = onboarding_data["admin_email"]
        admin_name = onboarding_data["admin_name"]
        admin_password = onboarding_data["admin_password"]

        tenant = db.query(models.Tenant).filter(models.Tenant.slug == tenant_slug).first()

        if not tenant:
            stripe_cust_id = getattr(session, "customer", None)
            if not stripe_cust_id and isinstance(session, dict):
                stripe_cust_id = session.get("customer")

            stripe_sub_id = getattr(session, "subscription", None)
            if not stripe_sub_id and isinstance(session, dict):
                stripe_sub_id = session.get("subscription")

            plan_type = metadata.get("plan_type", "pro")
            if not plan_type or plan_type == "":
                plan_type = "pro"

            print(f"[ONBOARDING STATUS fallback] Realizando aprovisionamiento síncrono para {tenant_slug}")
            tenant = provision_tenant(
                db=db,
                tenant_name=tenant_name,
                tenant_slug=tenant_slug,
                admin_email=admin_email,
                admin_name=admin_name,
                admin_password=admin_password,
                stripe_customer_id=stripe_cust_id,
                stripe_subscription_id=stripe_sub_id,
                plan_type=plan_type
            )
        
        return {
            "status": "complete",
            "tenant_id": tenant.id,
            "tenant_slug": tenant.slug,
            "tenant_name": tenant.name,
            "admin_email": admin_email,
            "admin_name": admin_name,
            "admin_password": admin_password
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/onboarding-complete-setup")
def onboarding_complete_setup(request: OnboardingCompleteSetupRequest, db: Session = Depends(database.get_db)):
    from ...database import current_tenant_var
    current_tenant_var.set(request.tenant_id)
    db.execute(
        text("SET LOCAL app.current_tenant_id = :tenant_id"),
        {"tenant_id": request.tenant_id}
    )
    
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == request.tenant_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración del negocio no encontrada")
    
    settings.clinic_name = request.clinic_name
    settings.business_sector = request.sector
    settings.open_time = request.open_time
    settings.close_time = request.close_time
    settings.working_days = request.working_days
    settings.logo_app_b64 = request.logo_app_b64
    settings.onboarding_completed = True
    
    category_slug = "general"
    category = db.query(models.ServiceCategory).filter(
        models.ServiceCategory.tenant_id == request.tenant_id,
        models.ServiceCategory.slug == category_slug
    ).first()
    
    if not category:
        category = models.ServiceCategory(
            id=str(uuid.uuid4()),
            tenant_id=request.tenant_id,
            name="General",
            slug=category_slug,
            description="Tratamientos generales iniciales",
            is_active=True
        )
        db.add(category)
        db.flush()
    
    service_name = request.initial_service.get("name", "Servicio Inicial")
    service_price = request.initial_service.get("price", 50.0)
    service_duration = request.initial_service.get("duration_minutes", 60)
    
    service_slug = re.sub(r'[^a-z0-9]+', '-', service_name.lower()).strip('-')
    if not service_slug:
        service_slug = "servicio-inicial"
        
    existing_svc = db.query(models.Service).filter(
        models.Service.tenant_id == request.tenant_id,
        models.Service.slug == service_slug
    ).first()
    if existing_svc:
        service_slug = f"{service_slug}-{uuid.uuid4().hex[:4]}"
        
    initial_service = models.Service(
        id=str(uuid.uuid4()),
        tenant_id=request.tenant_id,
        category_id=category.id,
        name=service_name,
        slug=service_slug,
        description=f"Nuestros tratamientos de {service_name} con dedicación exclusiva y técnicas avanzadas.",
        duration_minutes=service_duration,
        price=service_price,
        is_active=True,
        is_featured=True
    )
    db.add(initial_service)
    
    content = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == request.tenant_id).first()
    if content:
        content.hero_title = f"Bienvenidos a {request.clinic_name}"
        content.about_title = f"Sobre {request.clinic_name}"
        
    db.commit()
    
    tenant = db.query(models.Tenant).filter(models.Tenant.id == request.tenant_id).first()
    return {"status": "success", "tenant_slug": tenant.slug if tenant else "general"}


@router.get("/resolve-tenant/{slug}")
def resolve_tenant(slug: str, db: Session = Depends(database.get_db)):
    tenant = db.query(models.Tenant).filter(models.Tenant.slug == slug.lower()).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant not found")
    return {
        "tenant_id": tenant.id,
        "tenant_name": tenant.name,
        "tenant_slug": tenant.slug,
        "subscription_status": tenant.subscription_status
    }
