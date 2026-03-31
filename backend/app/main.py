import os
from sqlalchemy import inspect
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import clients, services, appointments, vouchers, invoices, settings, users, voucher_templates, time_blocks

# --- Lógica de Autocuración para Producción (Render / SQLite) ---
def check_and_reset_db():
    db_path = "clinica.db"
    if os.path.exists(db_path):
        try:
            inspector = inspect(engine)
            # Verificar si la tabla de facturas ya tiene la columna nueva
            columns = [c['name'] for c in inspector.get_columns('invoices')]
            if 'is_simplified' not in columns:
                print("⚠️ DB Desactualizada detectada. Reseteando para producción...")
                engine.dispose()
                os.remove(db_path)
            else:
                print("✅ Esquema de base de datos verificado y correcto.")
        except Exception as e:
            print(f"No se pudo verificar el esquema: {e}")

check_and_reset_db()

# Crear las tablas en la base de datos (Nota: en producción mejor usar Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Clínica Médica API",
    description="Backend API para la gestión de Clínica de Estética",
    version="1.0.0"
)

# Configuración CORS para el Frontend (Next.js)
origins = [
    "http://localhost:3000",
    "https://backend-clinica-merce.vercel.app",
    "https://clinica-merce.vercel.app",
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

@app.get("/")
def read_root():
    return {"message": "Bienvenido a la API de la Clínica Estética. Visita /docs para probar los endpoints."}
