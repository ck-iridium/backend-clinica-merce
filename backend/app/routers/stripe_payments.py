import os
import stripe
import logging
import uuid
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from .. import models, database
from ..crud.settings import get_clinic_settings

router = APIRouter(
    prefix="/stripe",
    tags=["stripe"],
)

def get_stripe_key():
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Falta STRIPE_SECRET_KEY")
    return key

class OnboardingSessionRequest(BaseModel):
    tenant_name: str = Field(..., min_length=2)
    tenant_slug: str = Field(..., min_length=2, pattern=r"^[a-z0-9-]+$")
    admin_email: str
    admin_name: str
    admin_password: str

@router.post("/create-onboarding-session")
def create_onboarding_session(request: OnboardingSessionRequest):
    stripe.api_key = get_stripe_key()
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    # 1. Validar colisión de subdominios
    db = database.SessionLocal()
    try:
        existing_tenant = db.query(models.Tenant).filter(models.Tenant.slug == request.tenant_slug).first()
        if existing_tenant:
            raise HTTPException(status_code=400, detail="El subdominio ya está registrado. Por favor, elige otro.")
        
        existing_user = db.query(models.User).filter(models.User.email == request.admin_email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="El correo electrónico del administrador ya está registrado.")
    finally:
        db.close()

    try:
        # 2. Crear Checkout Session en Stripe con metadatos completos para aprovisionamiento
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": "Plan Platinum - Clínica Mercè SaaS",
                        "description": "Suscripción mensual de gestión clínica premium",
                    },
                    "unit_amount": 9900,  # 99.00 EUR
                    "recurring": {"interval": "month"}
                },
                "quantity": 1,
            }],
            mode="subscription",
            subscription_data={
                "metadata": {
                    "plan_type": "pro"
                }
            },
            success_url=f"{frontend_url}/onboarding/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{frontend_url}/marketing",
            metadata={
                "type": "saas_onboarding",
                "tenant_name": request.tenant_name,
                "tenant_slug": request.tenant_slug,
                "admin_email": request.admin_email,
                "admin_name": request.admin_name,
                "admin_password": request.admin_password,
            }
        )
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

class CreateSubscriptionSessionRequest(BaseModel):
    tenant_id: str
    plan_type: str  # "basic", "pro", "gold"

@router.post("/create-subscription-session")
def create_subscription_session(request: CreateSubscriptionSessionRequest, db: Session = Depends(database.get_db)):
    stripe.api_key = get_stripe_key()
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    # 1. Buscar Tenant en DB
    tenant = db.query(models.Tenant).filter(models.Tenant.id == request.tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    # 2. Configurar detalles de precio e info del plan
    plan_details = {
        "basic": {
            "name": "Plan Básico - Clínica Mercè SaaS",
            "description": "Acceso estándar y agenda clínica para equipos pequeños",
            "amount": 2900,  # 29.00 EUR
        },
        "pro": {
            "name": "Plan Pro - Clínica Mercè SaaS",
            "description": "Suscripción mensual de gestión clínica avanzada",
            "amount": 5900,  # 59.00 EUR
        },
        "gold": {
            "name": "Plan Elite Gold - Clínica Mercè SaaS",
            "description": "Acceso premium total con asistentes de Inteligencia Artificial",
            "amount": 9900,  # 99.00 EUR
        }
    }
    
    selected_plan = request.plan_type.lower()
    if selected_plan not in plan_details:
        raise HTTPException(status_code=400, detail="Tipo de plan no válido. Debe ser basic, pro o gold")
        
    details = plan_details[selected_plan]
    
    # 3. Construir parámetros para la sesión
    session_params = {
        "payment_method_types": ["card"],
        "line_items": [{
            "price_data": {
                "currency": "eur",
                "product_data": {
                    "name": details["name"],
                    "description": details["description"],
                },
                "unit_amount": details["amount"],
                "recurring": {"interval": "month"}
            },
            "quantity": 1,
        }],
        "mode": "subscription",
        "subscription_data": {
            "metadata": {
                "plan_type": selected_plan,
                "tenant_id": request.tenant_id
            }
        },
        "success_url": f"{frontend_url}/super-admin?session_id={{CHECKOUT_SESSION_ID}}&tenant_id={request.tenant_id}&billing_success=true",
        "cancel_url": f"{frontend_url}/super-admin?tenant_id={request.tenant_id}&billing_cancel=true",
        "metadata": {
            "type": "saas_subscription_update",
            "tenant_id": request.tenant_id,
            "plan_type": selected_plan
        }
    }
    
    # Si el Tenant ya tiene un stripe_customer_id, lo enlazamos para evitar duplicados
    if tenant.stripe_customer_id:
        session_params["customer"] = tenant.stripe_customer_id
    
    try:
        session = stripe.checkout.Session.create(**session_params)
        return {"url": session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/connect")
def connect_stripe_account(db: Session = Depends(database.get_db)):
    stripe.api_key = get_stripe_key()
    settings = get_clinic_settings(db)
    frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    if not settings.stripe_account_id:
        try:
            account = stripe.Account.create(type="standard", country="ES", email=settings.clinic_email or None)
            settings.stripe_account_id = account.id
            db.commit()
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    try:
        account_link = stripe.AccountLink.create(
            account=settings.stripe_account_id,
            refresh_url=f"{frontend_url}/dashboard/settings?stripe_refresh=true",
            return_url=f"{frontend_url}/dashboard/settings?stripe_return=true",
            type="account_onboarding",
        )
        return {"url": account_link.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/refresh-status")
def refresh_stripe_status(db: Session = Depends(database.get_db)):
    stripe.api_key = get_stripe_key()
    settings = get_clinic_settings(db)
    if not settings.stripe_account_id: return {"status": "no_account"}
    try:
        account = stripe.Account.retrieve(settings.stripe_account_id)
        settings.stripe_charges_enabled = account.charges_enabled
        db.commit()
        return {"charges_enabled": settings.stripe_charges_enabled}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, db: Session = Depends(database.get_db)):
    """
    Webhook compatible con Stripe (Local y Producción). Blindado con getattr.
    """
    try:
        stripe.api_key = get_stripe_key()
        payload = await request.body()
        sig_header = request.headers.get("stripe-signature")
        webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")

        if not sig_header or not webhook_secret:
            return {"status": "ignored"}

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
        except stripe.error.SignatureVerificationError:
            connect_secret = os.environ.get("STRIPE_CONNECT_WEBHOOK_SECRET")
            if connect_secret:
                try:
                    event = stripe.Webhook.construct_event(payload, sig_header, connect_secret)
                except:
                    raise HTTPException(status_code=400, detail="Invalid signature")
            else:
                raise HTTPException(status_code=400, detail="Invalid signature")

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
                tenant_name = metadata.get("tenant_name")
                tenant_slug = metadata.get("tenant_slug")
                admin_email = metadata.get("admin_email")
                admin_name = metadata.get("admin_name")
                admin_password = metadata.get("admin_password")
                
                print(f"[PROVISIONING] Iniciando aprovisionamiento del Tenant SaaS: {tenant_slug} ({tenant_name})")
                
                # 1. Crear el Tenant en Base de Datos Relacional
                tenant_id = str(uuid.uuid4())
                
                # Sincronizar ContextVar y variable local de sesión de PostgreSQL para RLS
                from ..database import current_tenant_var
                from sqlalchemy import text
                current_tenant_var.set(tenant_id)
                db.execute(
                    text("SET LOCAL app.current_tenant_id = :tenant_id"),
                    {"tenant_id": tenant_id}
                )
                
                new_tenant = models.Tenant(
                    id=tenant_id,
                    name=tenant_name,
                    slug=tenant_slug,
                    stripe_customer_id=get_val(data_object, 'customer', None),
                    stripe_subscription_id=get_val(data_object, 'subscription', None),
                    plan_type="pro",
                    subscription_status="active"
                )
                db.add(new_tenant)
                db.flush()  # Para que el tenant_id exista para claves foráneas
                
                # 2. Inicializar Configuración por Defecto
                default_settings = models.ClinicSettings(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    clinic_name=tenant_name,
                    clinic_email=admin_email,
                    clinic_phone="",
                    clinic_address="",
                    maps_url="",
                    instagram_url="",
                    allow_search_engine_indexing=False
                )
                db.add(default_settings)
                
                default_content = models.SiteContent(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    hero_title=f"Bienvenidos a {tenant_name}",
                    hero_subtitle="Estética avanzada y cuidado personalizado.",
                    about_text="Nos dedicamos a ofrecer los mejores tratamientos de estética y salud para resaltar tu bienestar.",
                    about_title=f"Sobre {tenant_name}"
                )
                db.add(default_content)
                
                # 3. Crear el usuario en Supabase Auth
                supabase_user_id = None
                supabase_url = os.environ.get("SUPABASE_URL")
                supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
                
                if supabase_url and supabase_key:
                    try:
                        from supabase import create_client
                        supabase_client = create_client(supabase_url, supabase_key)
                        
                        # Crear el usuario administrador en Supabase con su tenant_id en app_metadata!
                        auth_user = supabase_client.auth.admin.create_user({
                            "email": admin_email,
                            "password": admin_password,
                            "email_confirm": True,
                            "user_metadata": {"full_name": admin_name},
                            "app_metadata": {"tenant_id": tenant_id, "role": "admin"}
                        })
                        
                        # Extraer el ID devuelto por Supabase Auth de forma segura
                        if hasattr(auth_user, 'user') and auth_user.user:
                            supabase_user_id = auth_user.user.id
                        elif isinstance(auth_user, dict) and 'user' in auth_user:
                            supabase_user_id = auth_user['user']['id']
                        elif hasattr(auth_user, 'id'):
                            supabase_user_id = auth_user.id
                        
                        print(f"[SUPABASE] Usuario creado en Supabase Auth. ID: {supabase_user_id}")
                    except Exception as sb_err:
                        print(f"[SUPABASE] [WARNING] Error al crear usuario en Supabase Auth: {sb_err}")
                
                # Fallback de ID si Supabase no está configurado o falla
                if not supabase_user_id:
                    supabase_user_id = str(uuid.uuid4())
                    print(f"[PROVISIONING] [WARNING] Usando UUID generado localmente para el usuario: {supabase_user_id}")
                
                # 4. Crear el usuario en la base de datos relacional
                from .users import pwd_context
                hashed_pw = pwd_context.hash(admin_password)
                
                new_user = models.User(
                    id=supabase_user_id,
                    email=admin_email,
                    hashed_password=hashed_pw,
                    role="admin",
                    tenant_id=tenant_id
                )
                db.add(new_user)
                db.flush()
                
                # 5. Crear el perfil correspondiente en base de datos
                new_profile = models.Profile(
                    id=supabase_user_id,
                    tenant_id=tenant_id,
                    full_name=admin_name,
                    role="admin",
                    email=admin_email,
                    status="active"
                )
                db.add(new_profile)
                
                db.commit()
                print(f"[PROVISIONING] [SUCCESS] Nuevo Tenant '{tenant_slug}' aprovisionado completamente con exito.")
                
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
    stripe.api_key = get_stripe_key()
    try:
        # 1. Intentar buscar directamente por stripe_checkout_session_id en DB
        appointment = db.query(models.Appointment).filter(
            models.Appointment.stripe_checkout_session_id == session_id
        ).first()
        
        # 2. Si no se encuentra, consultar a Stripe para obtener el client_reference_id (Appointment ID)
        if not appointment:
            try:
                session = stripe.checkout.Session.retrieve(session_id)
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
