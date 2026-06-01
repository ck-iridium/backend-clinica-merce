import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles
import os
from .database import engine, Base
from .routers import clients, services, appointments, vouchers, invoices, settings, users, voucher_templates, time_blocks, automation, service_categories, site_content, uploads, backups, media, ai, stripe_payments, super_admin, cms, onboarding, ai_agent, locations, staff_schedules, docs_cms
from .scheduler import scheduler

# Crear las tablas en la base de datos (Nota: en producción mejor usar Alembic)
Base.metadata.create_all(bind=engine)

def seed_admin_user():
    from .database import SessionLocal
    from .models import User, Tenant
    from .routers.users import pwd_context
    
    db = SessionLocal()
    try:
        # 1. Sembrar Inquilino de Sistema (ProBookia Core)
        system_tenant_id = "00000000-0000-0000-0000-000000000000"
        system_tenant = db.query(Tenant).filter(Tenant.id == system_tenant_id).first()
        if not system_tenant:
            system_tenant = Tenant(
                id=system_tenant_id,
                name="ProBookia Core",
                slug="probookia",
                subscription_status="active",
                plan_type="gold"
            )
            db.add(system_tenant)
            db.commit()
            print("Tenant del sistema (ProBookia Core) sembrado.")

        # 2. Sembrar Inquilino de Clínica Mercè
        merce_tenant_id = "00000000-0000-0000-0000-000000000001"
        merce_tenant = db.query(Tenant).filter(Tenant.id == merce_tenant_id).first()
        if not merce_tenant:
            merce_tenant = Tenant(
                id=merce_tenant_id,
                name="Clínica Mercè",
                slug="merce",
                subscription_status="active",
                plan_type="gold"
            )
            db.add(merce_tenant)
            db.commit()
            print("Tenant de Clínica Mercè sembrado.")

        # 3. Sembrar Usuario de Clínica Mercè
        admin_email = "merce@clinicamerce.com"
        user = db.query(User).filter(User.email == admin_email).first()
        if not user:
            # Importante: Hashear la contraseña antes de guardar
            hashed_pw = pwd_context.hash("merce123")
            new_user = User(
                email=admin_email,
                hashed_password=hashed_pw,
                role="admin",
                tenant_id=merce_tenant_id
            )
            db.add(new_user)
            db.commit()
            print(f"Usuario semilla '{admin_email}' creado.")
        else:
            print(f"Usuario '{admin_email}' ya existe.")
    except Exception as e:
        print(f"Error en semilla: {e}")
    finally:
        db.close()

def run_auto_migrations_wrapper():
    from .utils.migrations import run_auto_migrations
    run_auto_migrations()

# Ejecutar procesos de inicio se harán en startup_event

# Verificación de API Key de Resend (Solo primeros 4 caracteres)
resend_key = os.environ.get("RESEND_API_KEY", "").strip()
if resend_key:
    print(f"Resend API Key cargada: {resend_key[:4]}...")
else:
    print("ADVERTENCIA: RESEND_API_KEY no encontrada en el entorno.")

app = FastAPI(
    title="Clínica Médica API",
    description="Backend API para la gestión de Clínica de Estética",
    version="1.0.0"
)

# ---------------------------------------------------------------------
# MIDDLEWARE DE AISLAMIENTO MULTI-TENANT (RESOLUCIÓN DE CONTEXTO)
# ---------------------------------------------------------------------
import base64
import json
from .database import current_tenant_var

def get_tenant_id_from_token(auth_header: str) -> str:
    if not auth_header or not auth_header.startswith("Bearer "):
        return None
    token = auth_header.split(" ")[1]
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        payload_b64 = parts[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload_json = base64.b64decode(payload_b64).decode("utf-8")
        payload = json.loads(payload_json)
        
        # Intentar extraer del JWT de Supabase
        app_metadata = payload.get("app_metadata", {})
        tenant_id = app_metadata.get("tenant_id")
        if not tenant_id:
            tenant_id = payload.get("tenant_id")
        return tenant_id
    except Exception:
        return None

# Caché en memoria para evitar consultas reiteradas a la base de datos en peticiones concurrentes
import time
TENANT_STATUS_CACHE = {} # {tenant_id: {"status": str, "name": str, "timestamp": float}}

@app.middleware("http")
async def resolve_tenant_middleware(request, call_next):
    # 1. Intentar cabecera personalizada X-Tenant-ID
    tenant_id = request.headers.get("X-Tenant-ID")
    
    # 2. Intentar cabecera Authorization (Bearer Token JWT)
    if not tenant_id:
        auth_header = request.headers.get("Authorization")
        if auth_header:
            tenant_id = get_tenant_id_from_token(auth_header)
            
    # 3. Intentar parámetro en URL query
    if not tenant_id:
        tenant_id = request.query_params.get("tenant_id")
        
    # 5. Comprobar si el inquilino está suspendido (excepto para rutas globales de control o públicas)
    path = request.url.path
    is_global_path = any(path.startswith(prefix) for prefix in [
        "/stripe",
        "/super-admin",
        "/docs",
        "/openapi.json",
        "/redoc"
    ])
    
    if not is_global_path:
        from fastapi.responses import JSONResponse
        if not tenant_id:
            return JSONResponse(
                status_code=400,
                content={"detail": "Tenant ID missing or invalid"}
            )
            
        from .database import SessionLocal
        from .models import Tenant
        
        now = time.time()
        cached = TENANT_STATUS_CACHE.get(tenant_id)
        
        if cached and (now - cached["timestamp"] < 60):
            status = cached["status"]
            name = cached["name"]
        else:
            db = SessionLocal()
            try:
                tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
                if tenant:
                    status = tenant.subscription_status
                    name = tenant.name
                    TENANT_STATUS_CACHE[tenant_id] = {
                        "status": status,
                        "name": name,
                        "timestamp": now
                    }
                else:
                    status = "active"
                    name = "Clínica"
            except Exception:
                status = "active"
                name = "Clínica"
            finally:
                db.close()
        
        if status in ("suspended", "inactive"):
            return JSONResponse(
                status_code=402,
                content={
                    "detail": f"Acceso Restringido: La suscripción de la clínica '{name}' ha sido suspendida. Por favor, regularice su pago."
                }
            )
        
    # Asignar variable de contexto de manera segura contra peticiones concurrentes
    token = current_tenant_var.set(tenant_id)
    try:
        response = await call_next(request)
        if tenant_id:
            response.headers["X-Resolved-Tenant"] = tenant_id
        return response
    finally:
        current_tenant_var.reset(token)

# Configurar Rate Limiter Global
from .limiter import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configuración CORS para el Frontend (Next.js)
origins = [
    "http://localhost:3000",
    "http://merce.localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://backend-clinica-merce.vercel.app",
    "https://clinica-merce.vercel.app",
    "https://www.esteticamerce.com",
    "https://esteticamerce.com",
    "http://probookia.com",
    "https://probookia.com",
    "http://www.probookia.com",
    "https://www.probookia.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https?://([a-zA-Z0-9_-]+\.)?localhost:3000|https?://([a-zA-Z0-9_-]+\.)?probookia\.com|https?://([a-zA-Z0-9_-]+\.)?esteticamerce\.com",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registrar los routers
app.include_router(users.router)
app.include_router(clients.router)
app.include_router(services.router)
app.include_router(appointments.router)
app.include_router(vouchers.router)
app.include_router(invoices.router)
app.include_router(settings.router)
app.include_router(voucher_templates.router)
app.include_router(time_blocks.router)
app.include_router(automation.router)
app.include_router(service_categories.router)
app.include_router(site_content.router)
app.include_router(uploads.router)
app.include_router(backups.router)
app.include_router(media.router)
app.include_router(ai.router)
app.include_router(ai_agent.router)
app.include_router(stripe_payments.router)
app.include_router(super_admin.router)
app.include_router(cms.router)
app.include_router(onboarding.router)
app.include_router(locations.router)
app.include_router(staff_schedules.router)
app.include_router(docs_cms.router)


@app.on_event("startup")
async def startup_event():
    # La semilla y migraciones se ejecutarán para asegurar la integridad de la DB
    seed_admin_user()
    run_auto_migrations_wrapper()
    
    from .tasks import cleanup_expired_appointments
    # Añadimos la tarea de limpieza cada 5 minutos
    scheduler.add_job(cleanup_expired_appointments, 'interval', minutes=5, id='cleanup_expired_appts')
    scheduler.start()
    print("APScheduler iniciado con tarea de limpieza (cada 5 min).")

@app.on_event("shutdown")
async def shutdown_event():
    scheduler.shutdown()
    print("APScheduler detenido.")
# Serve static files for uploads
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def read_root():
    return {
        "message": "Bienvenido a la API de la Clínica Estética. Visita /docs para probar los endpoints.",
        "deployed_at": "2026-03-31T22:00:00Z"
    }

@app.get("/force-seed-merce")
def force_seed():
    from .database import SessionLocal
    from .models import User
    from .routers.users import pwd_context
    
    db = SessionLocal()
    try:
        email = "merce@clinicamerce.com"
        user = db.query(User).filter(User.email == email).first()
        hashed_pw = pwd_context.hash("merce123")
        
        if not user:
            new_user = User(
                email=email,
                hashed_password=hashed_pw,
                role="admin",
                tenant_id="00000000-0000-0000-0000-000000000001"
            )
            db.add(new_user)
            db.commit()
            return {"status": "success", "message": f"Usuario {email} creado correctamente."}
        else:
            user.hashed_password = hashed_pw
            db.commit()
            return {"status": "success", "message": f"Contraseña de {email} actualizada correctamente."}
    except Exception as e:
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
