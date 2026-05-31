import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas
from ..database import current_tenant_var

router = APIRouter(
    prefix="/onboarding",
    tags=["SaaS Onboarding Engine"],
)

DEMO_SERVICES = {
    "Estética y Bienestar": [
        {
            "name": "Higiene Facial Profunda Premium",
            "slug": "higiene-facial",
            "duration_minutes": 60,
            "price": 65.00,
            "description": "Purificación y oxigenación celular con exfoliación ultrasónica y mascarilla calmante de alta gama.",
            "is_featured": True
        },
        {
            "name": "Masaje Relajante Sensorial",
            "slug": "masaje-relajante",
            "duration_minutes": 50,
            "price": 70.00,
            "description": "Terapia corporal relajante con aceites esenciales calientes para inducir un estado de calma absoluta.",
            "is_featured": True
        },
        {
            "name": "Tratamiento Reafirmante de Radiofrecuencia",
            "slug": "radiofrecuencia",
            "duration_minutes": 45,
            "price": 85.00,
            "description": "Estímulo activo de colágeno y elastina mediante calor intradérmico para atenuar la flacidez.",
            "is_featured": False
        }
    ],
    "Medicina Estética": [
        {
            "name": "Toxina Botulínica (Bótox)",
            "slug": "botox",
            "duration_minutes": 30,
            "price": 150.00,
            "description": "Atenuación elegante de arrugas y líneas de expresión mediante microinyecciones localizadas de bótox.",
            "is_featured": True
        },
        {
            "name": "Relleno con Ácido Hialurónico",
            "slug": "acido-hialuronico",
            "duration_minutes": 45,
            "price": 290.00,
            "description": "Hidratación y reposición de volumen en labios o pómulos con acabado natural, sutil y armónico.",
            "is_featured": True
        },
        {
            "name": "Peeling Químico de Alta Gama",
            "slug": "peeling-quimico",
            "duration_minutes": 40,
            "price": 95.00,
            "description": "Renovación celular profunda para aportar luminosidad extrema y homogeneizar el tono cutáneo.",
            "is_featured": False
        }
    ],
    "Clínicas de Salud": [
        {
            "name": "Consulta Nutricional y Bioimpedancia",
            "slug": "nutricion",
            "duration_minutes": 45,
            "price": 60.00,
            "description": "Estudio corporal completo y plan nutricional personalizado adaptado a tus necesidades biológicas.",
            "is_featured": True
        },
        {
            "name": "Sesión de Fisioterapia Personalizada",
            "slug": "fisioterapia",
            "duration_minutes": 55,
            "price": 50.00,
            "description": "Tratamiento de dolencias musculares y articulares mediante terapia manual y estiramientos dirigidos.",
            "is_featured": True
        },
        {
            "name": "Drenaje Linfático Manual",
            "slug": "drenaje-linfatico",
            "duration_minutes": 60,
            "price": 75.00,
            "description": "Terapia suave orientada a estimular el sistema linfático y reducir de forma activa la retención de líquidos.",
            "is_featured": False
        }
    ],
    "Salones y Barberías": [
        {
            "name": "Corte de Cabello Signature & Estilismo",
            "slug": "corte-signature",
            "duration_minutes": 40,
            "price": 35.00,
            "description": "Diseño personalizado de corte adaptado a tus rasgos faciales y asesoramiento de peinado profesional.",
            "is_featured": True
        },
        {
            "name": "Ritual de Afeitado a Navaja Tradicional",
            "slug": "afeitado-tradicional",
            "duration_minutes": 30,
            "price": 25.00,
            "description": "Afeitado clásico con toallas calientes aromáticas, espuma templada de brocha y bálsamo hidratante.",
            "is_featured": True
        },
        {
            "name": "Tratamiento de Hidratación Capilar Profunda",
            "slug": "hidratacion-capilar",
            "duration_minutes": 45,
            "price": 45.00,
            "description": "Nutrición intensiva con mascarilla de keratina y vaporizado para devolver el brillo y sedosidad al cabello.",
            "is_featured": False
        }
    ]
}

@router.post("/setup")
def setup_onboarding(payload: schemas.OnboardingSetupRequest, db: Session = Depends(database.get_db)):
    """
    Endpoint masivo que configura el negocio inicial. Actualiza ClinicSettings,
    marca onboarding_completed = true e inyecta opcionalmente datos de demostración del sector.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta cabecera X-Tenant-ID")

    # 1. Obtener o crear ClinicSettings del Tenant
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    if not settings:
        settings = models.ClinicSettings(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id
        )
        db.add(settings)

    # 2. Configurar perfiles y datos del asistente
    settings.clinic_name = payload.clinic_name
    if payload.logo_app_b64:
        settings.logo_app_b64 = payload.logo_app_b64
    settings.open_time = payload.open_time
    settings.close_time = payload.close_time
    settings.working_days = json.dumps(payload.working_days)
    
    # Configurar modalidad de trabajo y domicilio
    work_mod = payload.work_modality or "clinic_only"
    settings.work_modality = work_mod
    
    if work_mod in ["home_only", "both"]:
        settings.operations_center_address = payload.operations_center_address or payload.location_address
        settings.max_coverage_radius_km = payload.max_coverage_radius_km or 10.0
        # Coordenadas por defecto (Barcelona Centro) para evitar nulos y habilitar el mapa
        settings.operations_center_latitude = 41.3850639
        settings.operations_center_longitude = 2.1734035
        
    # Crear sede física por defecto para resolver dependencias duras si aplica
    if work_mod in ["clinic_only", "both"]:
        existing_loc = db.query(models.Location).filter(models.Location.tenant_id == tenant_id).first()
        if not existing_loc:
            default_location = models.Location(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name=payload.location_name or "Sede Principal",
                address=payload.location_address or "Calle de la Clínica 123",
                phone=payload.location_phone or settings.clinic_phone or "931234567",
                email=settings.clinic_email or "contacto@probookia.com",
                is_active=True
            )
            db.add(default_location)
            db.flush()
            
    settings.onboarding_completed = True

    # Asignar paleta tipográfica según el sector para coherencia de marca (Tokens de diseño)
    if payload.industry in ["Medicina Estética", "Estética y Bienestar"]:
        settings.branding_font_headings = "Playfair Display"
        settings.branding_font_body = "Inter"
        settings.theme_palette = "charcoal-gold"
    elif payload.industry == "Clínicas de Salud":
        settings.branding_font_headings = "Inter"
        settings.branding_font_body = "Inter"
        settings.theme_palette = "clean-medical"
    else:  # Barberías/Salones
        settings.branding_font_headings = "Cormorant Garamond"
        settings.branding_font_body = "Inter"
        settings.theme_palette = "minimal-dark"

    # 3. Inyectar tratamientos de demostración si es requerido
    services_added = 0
    if payload.load_demo_data:
        industry_services = DEMO_SERVICES.get(payload.industry, DEMO_SERVICES["Estética y Bienestar"])
        
        # Primero, inyectamos una categoría principal para el sector si no existe
        category = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id,
            models.ServiceCategory.slug == "tratamientos-demo"
        ).first()

        if not category:
            category = models.ServiceCategory(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name=f"Servicios de {payload.industry}",
                slug="tratamientos-demo",
                description=f"Catálogo inicial de tratamientos sugeridos para el sector {payload.industry}.",
                is_active=True,
                order_index=0
            )
            db.add(category)
            db.flush()

        # Inyectar los 3 servicios
        for s in industry_services:
            # Validar colisión local por slug
            existing = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.slug == s["slug"]
            ).first()

            if not existing:
                db_service = models.Service(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    category_id=category.id,
                    name=s["name"],
                    slug=s["slug"],
                    duration_minutes=s["duration_minutes"],
                    price=s["price"],
                    description=s["description"],
                    is_active=True,
                    is_featured=s["is_featured"]
                )
                db.add(db_service)
                services_added += 1

    db.commit()
    db.refresh(settings)

    return {
        "status": "success",
        "message": "Onboarding del Tenant configurado correctamente",
        "clinic_name": settings.clinic_name,
        "theme_palette": settings.theme_palette,
        "services_demo_added": services_added
    }
