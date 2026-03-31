import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .routers import clients, services, appointments, vouchers, invoices, settings, users, voucher_templates, time_blocks

# Reinicio total de Tablas (Solo para esta iteración de limpieza en producción)
Base.metadata.drop_all(bind=engine)
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
