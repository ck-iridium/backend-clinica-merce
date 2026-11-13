import os
import uuid
import json
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models, schemas
from ..database import current_tenant_var
from ..limits import get_tenant_limits
from ..services.sector_blueprints import get_sector_blueprint
from .users import pwd_context

try:
    from supabase import create_client
except ImportError:
    create_client = None

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
    settings.lunch_start = payload.lunch_start
    settings.lunch_end = payload.lunch_end
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
    created_locations = []
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
            created_locations.append(default_location)
        else:
            if payload.location_name:
                existing_loc.name = payload.location_name
            if payload.location_address:
                existing_loc.address = payload.location_address
            if payload.location_phone:
                existing_loc.phone = payload.location_phone
            created_locations.append(existing_loc)

        # Sedes extra si el plan lo permite
        if payload.extra_locations:
            from ..limits import get_tenant_limits
            tenant_obj = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
            p_type = tenant_obj.plan_type if tenant_obj else "pro"
            limits = get_tenant_limits(p_type)
            max_locations = limits.get("locations", 1)

            for extra in payload.extra_locations:
                if len(created_locations) >= max_locations:
                    break
                if extra.name and extra.name.strip():
                    extra_loc = models.Location(
                        id=str(uuid.uuid4()),
                        tenant_id=tenant_id,
                        name=extra.name.strip(),
                        address=extra.address.strip() if extra.address else "Dirección por definir",
                        phone=extra.phone or settings.clinic_phone or "",
                        email=settings.clinic_email or "",
                        is_active=True
                    )
                    db.add(extra_loc)
                    db.flush()
                    created_locations.append(extra_loc)

        # Recursos / Cabinas físicas de las sedes
        if payload.initial_resources and created_locations:
            for res in payload.initial_resources:
                if res.name and res.name.strip():
                    target_loc = created_locations[0]
                    if 0 <= res.location_index < len(created_locations):
                        target_loc = created_locations[res.location_index]
                    new_resource = models.LocationResource(
                        id=str(uuid.uuid4()),
                        tenant_id=tenant_id,
                        location_id=target_loc.id,
                        name=res.name.strip(),
                        quantity=max(1, int(res.quantity or 1)),
                        is_active=True
                    )
                    db.add(new_resource)

    # Miembros de equipo / Especialistas iniciales
    if payload.initial_team_members:
        tenant_obj = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
        p_type = tenant_obj.plan_type if tenant_obj else "pro"
        limits = get_tenant_limits(p_type)
        max_specialists = limits.get("specialists", 1)

        existing_staff_count = db.query(models.Profile).filter(
            models.Profile.tenant_id == tenant_id
        ).count()

        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        supabase_client = None
        if supabase_url and supabase_key:
            try:
                from supabase import create_client
                supabase_client = create_client(supabase_url, supabase_key)
            except Exception as e:
                print(f"[ONBOARDING SETUP] Error al inicializar cliente Supabase: {e}")

        for member in payload.initial_team_members:
            if existing_staff_count >= max_specialists:
                break
            if member.full_name and member.full_name.strip():
                slug_val = tenant_obj.slug if tenant_obj else "probookia"
                temp_unique = str(uuid.uuid4())[:6]
                email_val = member.email.strip().lower() if member.email else f"especialista-{temp_unique}@{slug_val}.local"
                
                target_user_id = None
                if supabase_client:
                    try:
                        auth_user = supabase_client.auth.admin.create_user({
                            "email": email_val,
                            "password": str(uuid.uuid4()) + "Aa1!",
                            "email_confirm": True,
                            "user_metadata": {"full_name": member.full_name.strip()},
                            "app_metadata": {"tenant_id": tenant_id, "role": member.role or "specialist"}
                        })
                        if hasattr(auth_user, 'user') and auth_user.user:
                            target_user_id = auth_user.user.id
                        elif isinstance(auth_user, dict) and 'user' in auth_user:
                            target_user_id = auth_user['user']['id']
                        elif hasattr(auth_user, 'id'):
                            target_user_id = auth_user.id
                    except Exception as err:
                        print(f"[ONBOARDING SETUP] Aviso creando usuario en Supabase Auth: {err}")

                if target_user_id:
                    new_profile = models.Profile(
                        id=target_user_id,
                        tenant_id=tenant_id,
                        full_name=member.full_name.strip(),
                        email=email_val,
                        role=member.role or "specialist",
                        status="active"
                    )
                    db.add(new_profile)
                    existing_staff_count += 1

    # ── GARANTIZAR PERFIL DE TITULAR ADMINISTRADOR Y 1ER ESPECIALISTA EN LA AGENDA ──
    # El usuario titular DEBE existir en models.Profile para que el dashboard no dé "Acceso denegado"
    # y para que la agenda cuente con al menos 1 especialista operativo por defecto.
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    supabase_client = None
    if supabase_url and supabase_key:
        try:
            from supabase import create_client
            supabase_client = create_client(supabase_url, supabase_key)
        except Exception as e:
            print(f"[ONBOARDING SETUP] Error al inicializar cliente Supabase: {e}")

    admin_profile = db.query(models.Profile).filter(
        models.Profile.tenant_id == tenant_id,
        models.Profile.role.in_(["admin", "administrador", "Administrador"])
    ).first()

    admin_user = db.query(models.User).filter(
        models.User.tenant_id == tenant_id,
        models.User.role == "admin"
    ).first()

    if not admin_user and settings.clinic_email:
        admin_user = db.query(models.User).filter(models.User.email == settings.clinic_email).first()

    supabase_admin_id = admin_user.id if admin_user else None

    # Si tenemos cliente de Supabase, recuperar el ID real de Supabase Auth
    if settings.clinic_email and supabase_client:
        try:
            users_list = supabase_client.auth.admin.list_users()
            for u in users_list:
                if getattr(u, 'email', '').lower() == settings.clinic_email.lower():
                    supabase_admin_id = u.id
                    break
        except Exception as e:
            print(f"[ONBOARDING SETUP] Error recuperando usuario admin de Supabase: {e}")

    if not supabase_admin_id:
        supabase_admin_id = str(uuid.uuid4())

    titular_name = payload.clinic_name or settings.clinic_name or "Administrador"

    # Sincronizar o crear usuario en tabla users
    if admin_user:
        admin_user.tenant_id = tenant_id
        admin_user.role = "admin"
        if not admin_user.id:
            admin_user.id = supabase_admin_id
    else:
        new_adm = models.User(
            id=supabase_admin_id,
            email=settings.clinic_email or f"admin@{tenant_id[:8]}.com",
            hashed_password=pwd_context.hash("AdminInitPass123!"),
            role="admin",
            tenant_id=tenant_id,
            email_verified=True
        )
        db.add(new_adm)

    # Sincronizar o crear perfil de Titular en tabla profiles
    if admin_profile:
        admin_profile.full_name = titular_name
        admin_profile.role = "admin"
        admin_profile.status = "Activo"
        if settings.clinic_email:
            admin_profile.email = settings.clinic_email
    else:
        new_prof = models.Profile(
            id=supabase_admin_id,
            tenant_id=tenant_id,
            full_name=titular_name,
            email=settings.clinic_email or f"admin@{tenant_id[:8]}.com",
            role="admin",
            status="Activo"
        )
        db.add(new_prof)

    # Actualizar metadatos en Supabase Auth si está conectado
    if supabase_client and supabase_admin_id:
        try:
            supabase_client.auth.admin.update_user_by_id(supabase_admin_id, {
                "user_metadata": {"full_name": titular_name, "role": "admin"},
                "app_metadata": {"tenant_id": tenant_id, "role": "admin"}
            })
        except Exception as sb_meta_err:
            print(f"[ONBOARDING SETUP] Aviso sincronizando metadatos Supabase: {sb_meta_err}")

    db.flush()

    # Obtener el Blueprint del sector seleccionado
    blueprint = get_sector_blueprint(payload.industry)
    sector_key = blueprint["id"]
    settings.business_sector = sector_key
    settings.onboarding_completed = True

    # Asignar tokens de diseño de marca según el Blueprint
    branding = blueprint.get("branding", {})
    settings.branding_font_headings = branding.get("branding_font_headings", "Playfair Display")
    settings.branding_font_body = branding.get("branding_font_body", "Inter")
    settings.theme_palette = branding.get("theme_palette", "charcoal-gold")
    if branding.get("accent_color"):
        settings.accent_color = branding["accent_color"]
        settings.accent_color_primary = branding["accent_color"]
    if branding.get("accent_color_secondary"):
        settings.accent_color_secondary = branding["accent_color_secondary"]

    # Inyectar / Actualizar SiteContent con textos y fotografías reales del sector
    site_content = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant_id).first()
    if not site_content:
        site_content = models.SiteContent(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id
        )
        db.add(site_content)

    sc_blueprint = blueprint.get("site_content", {})
    clinic_display_name = payload.clinic_name or settings.clinic_name or "Tu Negocio"

    site_content.hero_title = sc_blueprint.get("hero_title", "Bienvenidos a {clinic_name}").replace("{clinic_name}", clinic_display_name)
    site_content.hero_subtitle = sc_blueprint.get("hero_subtitle", "Servicios profesionales y cuidado personalizado.")
    site_content.hero_image_url = sc_blueprint.get("hero_image_url")
    site_content.hero_button_text = sc_blueprint.get("hero_button_text", "Reservar Cita")
    site_content.hero_button_link = sc_blueprint.get("hero_button_link", "/reservar")
    site_content.hero_show_button = True

    site_content.about_title = sc_blueprint.get("about_title", "Sobre {clinic_name}").replace("{clinic_name}", clinic_display_name)
    site_content.about_text = sc_blueprint.get("about_text", "Nos dedicamos a ofrecer los mejores servicios.").replace("{clinic_name}", clinic_display_name)
    site_content.about_image_url = sc_blueprint.get("about_image_url")

    site_content.cta_title = sc_blueprint.get("cta_title", "¿Listo para empezar?")
    site_content.cta_subtitle = sc_blueprint.get("cta_subtitle", "Reserva tu cita hoy mismo.")
    site_content.cta_button_text = sc_blueprint.get("cta_button_text", "Contactar")
    site_content.cta_button_link = sc_blueprint.get("cta_button_link", "/reservar")
    db.flush()

    # 3. Inyectar tratamientos de demostración con fotografías si es requerido
    services_added = 0
    if payload.load_demo_data:
        cat_info = blueprint.get("category", {
            "name": f"Servicios de {blueprint['display_name']}",
            "slug": f"servicios-{sector_key}",
            "description": f"Catálogo sugerido para {blueprint['display_name']}."
        })

        category = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id,
            models.ServiceCategory.slug == cat_info["slug"]
        ).first()

        if not category:
            category = models.ServiceCategory(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                name=cat_info["name"],
                slug=cat_info["slug"],
                description=cat_info["description"],
                is_active=True,
                order_index=0
            )
            db.add(category)
            db.flush()

        for s in blueprint.get("services", []):
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
                    is_featured=s["is_featured"],
                    image_url=s.get("image_url")
                )
                db.add(db_service)
                services_added += 1

    db.commit()
    db.refresh(settings)

    # Enviar email de confirmación de alta e instrucciones de acceso
    try:
        from ..utils.mailer import send_onboarding_welcome_email
        tenant_obj = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
        admin_profile = db.query(models.Profile).filter(models.Profile.tenant_id == tenant_id, models.Profile.role == "admin").first()
        admin_email = (admin_profile.email if admin_profile else None) or settings.clinic_email
        admin_name = (admin_profile.full_name if admin_profile else None) or settings.clinic_name
        if admin_email:
            send_onboarding_welcome_email(
                to_email=admin_email,
                admin_name=admin_name,
                clinic_name=settings.clinic_name,
                tenant_slug=tenant_obj.slug if tenant_obj else "app",
                plan_type=tenant_obj.plan_type if tenant_obj else "pro",
                trial_days=14,
                settings=settings
            )
    except Exception as mail_err:
        print(f"[ONBOARDING SETUP EMAIL NOTICE] {mail_err}")

    return {
        "status": "success",
        "message": "Onboarding del Tenant configurado correctamente",
        "clinic_name": settings.clinic_name,
        "theme_palette": settings.theme_palette,
        "services_demo_added": services_added
    }
