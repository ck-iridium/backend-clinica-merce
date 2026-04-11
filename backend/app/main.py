import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles
import os
from .database import engine, Base
from .routers import clients, services, appointments, vouchers, invoices, settings, users, voucher_templates, time_blocks, automation, service_categories, site_content, uploads, backups, media

# Crear las tablas en la base de datos (Nota: en producción mejor usar Alembic)
Base.metadata.create_all(bind=engine)

def seed_admin_user():
    from .database import SessionLocal
    from .models import User
    from .routers.users import pwd_context
    
    db = SessionLocal()
    try:
        admin_email = "merce@clinicamerce.com"
        user = db.query(User).filter(User.email == admin_email).first()
        if not user:
            # Importante: Hashear la contraseña antes de guardar
            hashed_pw = pwd_context.hash("merce123")
            new_user = User(
                email=admin_email,
                hashed_password=hashed_pw,
                role="admin"
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

# Ejecutar procesos de inicio
seed_admin_user()
run_auto_migrations_wrapper()

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

# Configurar Rate Limiter Global
from .limiter import limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configuración CORS para el Frontend (Next.js)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "https://backend-clinica-merce.vercel.app",
    "https://clinica-merce.vercel.app",
    "https://www.esteticamerce.com",
    "https://esteticamerce.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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
                role="admin"
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
