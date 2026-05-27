import os
import logging
import uuid
import traceback
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from .. import models, database
from ..crud.settings import get_clinic_settings
from ..services.tenant_provisioner import provision_tenant
from ..services.stripe_service import StripeService

router = APIRouter(
    prefix="/stripe",
    tags=["stripe"],
)

def extract_and_fallback_onboarding_data(session, metadata):
    import re
    
    def get_val(obj, key, default=None):
        if isinstance(obj, dict):
            return obj.get(key, default)
        return getattr(obj, key, default)

    # 1. Email del administrador
    admin_email = get_val(metadata, "admin_email") or getattr(session, "customer_email", None) or get_val(session, "customer_email", None)
    if not admin_email and getattr(session, "customer_details", None):
        admin_email = getattr(session.customer_details, "email", None)
    if not admin_email and get_val(session, "customer_details", None):
        admin_email = get_val(get_val(session, "customer_details"), "email", None)
    if not admin_email:
        admin_email = "admin@probookia.com"
    
    # 2. Nombre del negocio
    tenant_name = get_val(metadata, "tenant_name")
    if not tenant_name or str(tenant_name).strip() == "":
        if getattr(session, "customer_details", None) and getattr(session.customer_details, "name", None):
            tenant_name = session.customer_details.name
        elif get_val(session, "customer_details", None) and get_val(get_val(session, "customer_details"), "name", None):
            tenant_name = get_val(get_val(session, "customer_details"), "name")
        else:
            tenant_name = admin_email.split("@")[0].replace(".", " ").replace("-", " ").title()
            if not tenant_name or str(tenant_name).strip() == "":
                tenant_name = "Mi Negocio ProBookia"

    # 3. Slug único
    tenant_slug = get_val(metadata, "tenant_slug")
    if not tenant_slug or str(tenant_slug).strip() == "":
        clean_name = re.sub(r'[^a-z0-9]+', '-', str(tenant_name).lower()).strip('-')
        if not clean_name:
            clean_name = "negocio"
        tenant_slug = f"{clean_name}-{uuid.uuid4().hex[:6]}"
    else:
        tenant_slug = re.sub(r'[^a-z0-9-]+', '-', str(tenant_slug).lower()).strip('-')

    # 4. Nombre del administrador
    admin_name = get_val(metadata, "admin_name")
    if not admin_name or str(admin_name).strip() == "":
        if getattr(session, "customer_details", None) and getattr(session.customer_details, "name", None):
            admin_name = session.customer_details.name
        elif get_val(session, "customer_details", None) and get_val(get_val(session, "customer_details"), "name", None):
            admin_name = get_val(get_val(session, "customer_details"), "name")
        else:
            admin_name = admin_email.split("@")[0].title()

    # 5. Contraseña
    admin_password = get_val(metadata, "admin_password")
    if not admin_password or str(admin_password).strip() == "":
        admin_password = f"ProBookia-{uuid.uuid4().hex[:8]}!"

    return {
        "tenant_name": str(tenant_name),
        "tenant_slug": str(tenant_slug),
        "admin_email": str(admin_email),
        "admin_name": str(admin_name),
        "admin_password": str(admin_password)
    }

class OnboardingSessionRequest(BaseModel):
    tenant_name: str = Field(..., min_length=2)
    tenant_slug: str = Field(..., min_length=2, pattern=r"^[a-z0-9-]+$")
    admin_email: str
    admin_name: str
    admin_password: str
    plan_type: str = "gold"  # free, basic, pro, gold

@router.post("/create-onboarding-session")
def create_onboarding_session(request: OnboardingSessionRequest, req: Request):
    # Determinar base URL dinámicamente detectando origen de petición
    origin = req.headers.get("origin") or req.headers.get("referer")
    if not origin or "localhost" not in origin:
        frontend_url = "https://www.probookia.com"
    else:
        frontend_url = origin.rstrip("/")
    
    # 1. Validar colisión de subdominios
    db = database.SessionLocal()
    try:
        existing_tenant = db.query(models.Tenant).filter(models.Tenant.slug == request.tenant_slug).first()
        if existing_tenant:
            raise HTTPException(status_code=400, detail="El subdominio ya está registrado. Por favor, elige otro.")
        
        existing_user = db.query(models.User).filter(models.User.email == request.admin_email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="El correo electrónico del administrador ya está registrado.")
            
        selected_plan = request.plan_type.lower()
        
        # 2. Si el plan es gratuito (free), aprovisionamos inmediatamente al instante
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
            
    finally:
        db.close()

    # 3. Si es plan de pago, iniciamos Checkout Session en Stripe
    url = StripeService.create_onboarding_session(
        tenant_name=request.tenant_name,
        tenant_slug=request.tenant_slug,
        admin_email=request.admin_email,
        admin_name=request.admin_name,
        admin_password=request.admin_password,
        frontend_url=frontend_url,
        plan_type=request.plan_type
    )
    return {"url": url}

class CreateSubscriptionSessionRequest(BaseModel):
    tenant_id: str
    plan_type: str  # "basic", "pro", "gold"

@router.post("/create-subscription-session")
def create_subscription_session(
    request: CreateSubscriptionSessionRequest,
    req: Request,
    db: Session = Depends(database.get_db)
):
    # Determinar base URL dinámicamente detectando origen de petición para evitar bloqueos cross-domain
    origin = req.headers.get("origin") or req.headers.get("referer")
    if origin:
        from urllib.parse import urlparse
        parsed = urlparse(origin)
        frontend_url = f"{parsed.scheme}://{parsed.netloc}"
    else:
        frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    # 1. Buscar Tenant en DB
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

@router.post("/connect")
def connect_stripe_account(db: Session = Depends(database.get_db)):
    settings = get_clinic_settings(db)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    if not settings.stripe_account_id:
        account_id = StripeService.create_connect_account(settings.clinic_email or None)
        settings.stripe_account_id = account_id
        db.commit()

    url = StripeService.create_connect_account_link(settings.stripe_account_id, frontend_url)
    return {"url": url}

@router.get("/refresh-status")
def refresh_stripe_status(db: Session = Depends(database.get_db)):
    settings = get_clinic_settings(db)
    if not settings.stripe_account_id:
        return {"status": "no_account"}
        
    charges_enabled = StripeService.retrieve_connect_account_charges_enabled(settings.stripe_account_id)
    settings.stripe_charges_enabled = charges_enabled
    db.commit()
    return {"charges_enabled": settings.stripe_charges_enabled}

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(database.get_db)):
    """
    Webhook compatible con Stripe (Local y Producción). Blindado con getattr.
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        
        event = StripeService.construct_event(payload, sig_header)
        if isinstance(event, dict) and event.get("status") == "ignored":
            return {"status": "ignored"}

        # Extraemos el objeto de datos
        if isinstance(event, dict):
            data_object = event.get('data', {}).get('object', {})
            event_type = event.get('type')
        else:
            try:
                data_object = event['data']['object']
                event_type = getattr(event, 'type', None)
            except Exception:
                data_object = getattr(event, 'data', {}).get('object', {}) or event.get('data', {}).get('object', {})
                event_type = getattr(event, 'type', None) or event.get('type')
        
        print(f"[STRIPE] Evento recibido: {event_type}")
        
        def get_val(obj, key, default=None):
            if isinstance(obj, dict):
                return obj.get(key, default)
            return getattr(obj, key, default)
        
        # --- PROCESAMIENTO ---
        if event_type == 'checkout.session.completed':
            metadata = get_val(data_object, 'metadata', {}) or {}
            
            # --- CASO A: ONBOARDING DE NUEVO TENANT SaaS B2B ---
            if metadata.get("type") == "saas_onboarding":
                # Extraer metadatos con lógica robusta de fallbacks automáticos para evitar errores de slug nulo
                onboarding_data = extract_and_fallback_onboarding_data(data_object, metadata)
                tenant_name = onboarding_data["tenant_name"]
                tenant_slug = onboarding_data["tenant_slug"]
                admin_email = onboarding_data["admin_email"]
                admin_name = onboarding_data["admin_name"]
                admin_password = onboarding_data["admin_password"]
                
                plan_type = metadata.get("plan_type", "pro")
                if not plan_type or plan_type == "":
                    plan_type = "pro"

                stripe_cust_id = get_val(data_object, 'customer', None)
                stripe_sub_id = get_val(data_object, 'subscription', None)

                # Delegar al provisionador atómico central
                provision_tenant(
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
                
            elif metadata.get("type") == "saas_subscription_update":
                tenant_id = metadata.get("tenant_id")
                plan_type = metadata.get("plan_type")
                customer_id = get_val(data_object, 'customer', None)
                subscription_id = get_val(data_object, 'subscription', None)
                
                print(f"[BILLING] Pago de suscripción completado para Tenant ID: {tenant_id} | Cust ID: {customer_id} | Sub ID: {subscription_id}")
                
                tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
                if tenant:
                    tenant.stripe_customer_id = customer_id
                    tenant.stripe_subscription_id = subscription_id
                    tenant.plan_type = plan_type
                    tenant.subscription_status = "active"
                    db.commit()
                    print(f"[BILLING] [SUCCESS] Inquilino '{tenant.name}' actualizado al plan {plan_type} de forma inmediata.")
                    
                    # Invalidador de caché en tiempo real
                    try:
                        from ..main import TENANT_STATUS_CACHE
                        if tenant.id in TENANT_STATUS_CACHE:
                            del TENANT_STATUS_CACHE[tenant.id]
                            print(f"[CACHE] Invalidador de caché activado para tenant: {tenant.id}")
                    except Exception as e:
                        print(f"[CACHE] [WARNING] Error al invalidar caché: {e}")

            # --- CASO C: CITA TRADICIONAL ---
            else:
                appointment_id = get_val(data_object, 'client_reference_id', None)
                print(f"[STRIPE] Pago recibido. Cita ID: {appointment_id}")
                
                if appointment_id:
                    try:
                        # Validar UUID antes de buscar
                        uuid.UUID(str(appointment_id))
                        appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
                        
                        if appointment:
                            appointment.payment_status = "deposit_paid"
                            appointment.status = "confirmed"
                            appointment.stripe_payment_intent_id = get_val(data_object, 'payment_intent', None)
                            appointment.stripe_checkout_session_id = get_val(data_object, 'id', None)
                            db.commit()
                            print(f"[DB] Cita {appointment_id} confirmada en base de datos.")

                            # Notificaciones y Emails (no bloqueantes)
                            try:
                                from ..utils.notifications import create_admin_notification
                                create_admin_notification(
                                    db,
                                    title="Pago Recibido",
                                    description=f"Cita confirmada: {appointment.client.name}",
                                    type="success",
                                    metadata={"appointment_id": appointment.id}
                                )
                            except: pass

                            try:
                                from ..utils.mailer import send_appointment_notification
                                send_appointment_notification(appointment.id, 'confirmation')
                            except: pass
                        else:
                            print(f"[DB] [ERROR] Cita {appointment_id} no encontrada.")
                    except ValueError:
                        print(f"[STRIPE] [INFO] ID {appointment_id} no es un UUID valido. Ignorando.")

        elif event_type == 'account.updated':
            acc_id = get_val(data_object, 'id', None)
            settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.stripe_account_id == acc_id).first()
            if settings:
                settings.stripe_charges_enabled = get_val(data_object, 'charges_enabled', False)
                db.commit()
                print(f"[STRIPE] [SUCCESS] Cuenta {acc_id} actualizada.")

        elif event_type in ['customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted']:
            sub_id = get_val(data_object, 'id', None)
            cust_id = get_val(data_object, 'customer', None)
            sub_status = get_val(data_object, 'status', 'active')
            expires_timestamp = get_val(data_object, 'current_period_end', None)
            metadata = get_val(data_object, 'metadata', {}) or {}
            
            # Extraer plan_type de metadata (por defecto 'pro')
            plan_type = metadata.get("plan_type", "pro")
            if not plan_type or plan_type == "":
                plan_type = "pro"

            print(f"[STRIPE] Webhook de Suscripción recibido: {event_type} | Sub ID: {sub_id} | Cust ID: {cust_id} | Status: {sub_status}")

            # Buscar inquilino
            tenant = db.query(models.Tenant).filter(
                (models.Tenant.stripe_subscription_id == sub_id) |
                (models.Tenant.stripe_customer_id == cust_id)
            ).first()

            if tenant:
                # Sincronizar campos
                tenant.stripe_subscription_id = sub_id
                
                # Stripe states: active, trialing -> active
                # past_due, unpaid, canceled, etc. -> suspended
                if sub_status in ['active', 'trialing']:
                    tenant.subscription_status = 'active'
                else:
                    tenant.subscription_status = 'suspended'
                
                tenant.plan_type = plan_type
                
                if expires_timestamp:
                    from datetime import datetime
                    tenant.subscription_expires_at = datetime.utcfromtimestamp(expires_timestamp)
                
                db.commit()
                print(f"[STRIPE] [SUCCESS] Inquilino '{tenant.name}' actualizado en DB. Status: {tenant.subscription_status} | Plan: {tenant.plan_type}")

                # Invalidar caché en memoria del middleware para que el cambio aplique en tiempo real
                try:
                    from ..main import TENANT_STATUS_CACHE
                    if tenant.id in TENANT_STATUS_CACHE:
                        del TENANT_STATUS_CACHE[tenant.id]
                        print(f"[CACHE] Invalidador de caché activado para tenant: {tenant.id}")
                except Exception as e:
                    print(f"[CACHE] [WARNING] Error al invalidar caché: {e}")
            else:
                print(f"[STRIPE] [WARNING] Inquilino no encontrado para Sub ID: {sub_id} o Cust ID: {cust_id}")

        return {"status": "success"}

    except Exception as e:
        print(f"[STRIPE] [FATAL ERROR] Webhook: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/session-appointment/{session_id}")
def get_appointment_by_stripe_session(session_id: str, db: Session = Depends(database.get_db)):
    """
    Recupera los detalles de la cita a partir de un session_id de Stripe.
    Resuelve condiciones de carrera si el webhook de Stripe aun no se ha procesado.
    """
    try:
        # 1. Intentar buscar directamente por stripe_checkout_session_id en DB
        appointment = db.query(models.Appointment).filter(
            models.Appointment.stripe_checkout_session_id == session_id
        ).first()
        
        # 2. Si no se encuentra, consultar a Stripe para obtener el client_reference_id (Appointment ID)
        if not appointment:
            try:
                session = StripeService.retrieve_checkout_session(session_id)
                appointment_id = getattr(session, 'client_reference_id', None)
                if appointment_id:
                    uuid.UUID(str(appointment_id))
                    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
                    if appointment:
                        # Cachear el ID de sesion
                        appointment.stripe_checkout_session_id = session_id
                        # Asegurar el estado de confirmacion
                        if appointment.status == "pending_payment":
                            appointment.status = "confirmed"
                            appointment.payment_status = "deposit_paid"
                        db.commit()
            except Exception as stripe_err:
                print(f"[STRIPE] [WARNING] Error al recuperar sesion: {stripe_err}")
                
        if not appointment:
            raise HTTPException(status_code=404, detail="Cita no encontrada para esta sesion")
            
        return {
            "date": appointment.start_time.date().isoformat(),
            "time": appointment.start_time.strftime("%H:%M"),
            "service_name": appointment.service.name,
            "service_price": appointment.service.price,
            "client_email": appointment.client.email,
            "client_name": appointment.client.name,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/onboarding-session-status/{session_id}")
def onboarding_session_status(session_id: str, db: Session = Depends(database.get_db)):
    try:
        session = StripeService.retrieve_checkout_session(session_id)
        if session.payment_status != "paid" and session.status != "complete":
            raise HTTPException(status_code=400, detail="El pago no ha sido completado todavía en Stripe")

        metadata = session.metadata or {}
        # Validar que es una sesión de onboarding válida
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

        # Usar extractor con lógica de fallbacks robustos
        onboarding_data = extract_and_fallback_onboarding_data(session, metadata)
        tenant_name = onboarding_data["tenant_name"]
        tenant_slug = onboarding_data["tenant_slug"]
        admin_email = onboarding_data["admin_email"]
        admin_name = onboarding_data["admin_name"]
        admin_password = onboarding_data["admin_password"]

        # Buscar si ya fue aprovisionado por el webhook
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
            
            # Delegar al provisionador atómico central
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

class OnboardingCompleteSetupRequest(BaseModel):
    tenant_id: str
    clinic_name: str
    sector: str
    logo_app_b64: str | None = None
    open_time: str
    close_time: str
    working_days: str # "[1,2,3,4,5]"
    initial_service: dict # { name, price, duration_minutes }

@router.post("/onboarding-complete-setup")
def onboarding_complete_setup(request: OnboardingCompleteSetupRequest, db: Session = Depends(database.get_db)):
    # Asegurar RLS pasándole el tenant_id
    from ..database import current_tenant_var
    from sqlalchemy import text
    current_tenant_var.set(request.tenant_id)
    db.execute(
        text("SET LOCAL app.current_tenant_id = :tenant_id"),
        {"tenant_id": request.tenant_id}
    )
    
    # 1. Recuperar ClinicSettings
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == request.tenant_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración del negocio no encontrada")
    
    settings.clinic_name = request.clinic_name
    settings.open_time = request.open_time
    settings.close_time = request.close_time
    settings.working_days = request.working_days
    settings.logo_app_b64 = request.logo_app_b64
    settings.onboarding_completed = True
    
    # 2. Crear categoría de servicio inicial
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
    
    # 3. Crear servicio inicial
    service_name = request.initial_service.get("name", "Servicio Inicial")
    service_price = request.initial_service.get("price", 50.0)
    service_duration = request.initial_service.get("duration_minutes", 60)
    
    import re
    service_slug = re.sub(r'[^a-z0-9]+', '-', service_name.lower()).strip('-')
    if not service_slug:
        service_slug = "servicio-inicial"
        
    # Evitar colisión de slug de servicio
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
    
    # Actualizar SiteContent también si existe
    content = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == request.tenant_id).first()
    if content:
        content.hero_title = f"Bienvenidos a {request.clinic_name}"
        content.about_title = f"Sobre {request.clinic_name}"
        
    db.commit()
    
    # Obtener el slug para redirigir
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


@router.get("/verify-checkout-session/{session_id}")
def verify_checkout_session(session_id: str, db: Session = Depends(database.get_db)):
    """
    Endpoint para verificación activa desde el frontend.
    Recupera la sesión de checkout de Stripe, comprueba el estado de pago,
    sincroniza en la base de datos el nuevo plan del tenant, e invalida la caché.
    """
    try:
        session = StripeService.retrieve_checkout_session(session_id)
        
        # Comprobar estado de pago usando getattr de forma 100% segura en StripeObject
        payment_status = getattr(session, "payment_status", None)
            
        if payment_status != "paid":
            raise HTTPException(status_code=400, detail="La sesión de Stripe no está pagada.")

        # Extraer metadatos usando getattr de forma 100% segura en StripeObject
        metadata = getattr(session, "metadata", None) or {}
            
        tenant_id = metadata.get("tenant_id") if isinstance(metadata, dict) else getattr(metadata, "tenant_id", None)
        plan_type = metadata.get("plan_type") if isinstance(metadata, dict) else getattr(metadata, "plan_type", None)

        if not tenant_id or not plan_type:
            raise HTTPException(status_code=400, detail="Metadatos incompletos en la sesión de Stripe.")

        # Realizar actualización en la base de datos
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
            from ..main import TENANT_STATUS_CACHE
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

