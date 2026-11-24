import os
import re
import uuid
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from .. import models
from ..database import current_tenant_var
from ..limits import normalize_plan_type
from ..routers.users import pwd_context
from .sector_blueprints import get_sector_blueprint

logger = logging.getLogger(__name__)

RESERVED_SLUGS = {
    "www", "app", "api", "admin", "super-admin", "superadmin",
    "mail", "smtp", "probookia", "static", "assets", "cdn", "docs"
}

def provision_tenant(
    db: Session,
    tenant_name: str,
    tenant_slug: str,
    admin_email: str,
    admin_name: str,
    admin_password: str,
    stripe_customer_id: str | None = None,
    stripe_subscription_id: str | None = None,
    plan_type: str = "pro",
    subscription_status: str = "active",
    subscription_expires_at: datetime | None = None,
    business_sector: str = "beauty",
    custom_monthly_price: float | None = None,
    billing_mode: str = "stripe",
    billing_interval: str = "monthly",
    billing_notes: str | None = None,
    seed_sector_services: bool = False,
    onboarding_completed: bool = False
) -> models.Tenant:
    """
    Aprovisiona de forma atómica y aislada un nuevo inquilino (Tenant) en la base de datos,
    junto con su configuración inicial, contenido de sitio público y cuenta de administrador.
    
    Establece de forma estricta las variables de contexto RLS para evitar fugas de información.
    """
    clean_slug = (tenant_slug or "").strip().lower()
    if not re.match(r"^[a-z0-9-]+$", clean_slug) or len(clean_slug) < 2:
        raise HTTPException(
            status_code=400,
            detail="El subdominio solo puede contener letras minúsculas, números y guiones (mínimo 2 caracteres)."
        )
    if clean_slug in RESERVED_SLUGS:
        raise HTTPException(status_code=400, detail=f"El subdominio '{clean_slug}' está reservado por el sistema.")

    existing_slug = db.query(models.Tenant).filter(models.Tenant.slug == clean_slug).first()
    if existing_slug:
        raise HTTPException(status_code=409, detail=f"El subdominio '{clean_slug}.probookia.com' ya está en uso.")

    # 1. Cortafuegos de identidad: impedir asignar un correo que ya pertenece a otro tenant
    existing_user = db.query(models.User).filter(models.User.email == admin_email).first()
    if existing_user:
        raise HTTPException(
            status_code=409,
            detail=f"El correo '{admin_email}' ya está registrado en otro negocio del sistema."
        )

    # 2. Generar UUID atómico para el Tenant
    tenant_id = str(uuid.uuid4())
    logger.info(f"[PROVISIONER] Iniciando aprovisionamiento del Tenant SaaS: {clean_slug} | ID: {tenant_id}")

    try:
        # 3. Sincronizar ContextVar y PostgreSQL para RLS
        current_tenant_var.set(tenant_id)
        db.execute(
            text("SET LOCAL app.current_tenant_id = :tenant_id"),
            {"tenant_id": tenant_id}
        )

        # 4. Crear el Tenant con plan normalizado y condiciones comerciales
        canonical_plan = normalize_plan_type(plan_type)
        blueprint = get_sector_blueprint(business_sector or "beauty")
        resolved_sector = blueprint.get("id", "general")
        branding = blueprint.get("branding", {})
        sc_bp = blueprint.get("site_content", {})

        new_tenant = models.Tenant(
            id=tenant_id,
            name=tenant_name.strip(),
            slug=clean_slug,
            stripe_customer_id=stripe_customer_id,
            stripe_subscription_id=stripe_subscription_id,
            plan_type=canonical_plan,
            subscription_status=subscription_status,
            subscription_expires_at=subscription_expires_at,
            custom_monthly_price=custom_monthly_price,
            billing_mode=billing_mode or "stripe",
            billing_interval=billing_interval or "monthly",
            billing_notes=billing_notes
        )
        db.add(new_tenant)
        db.flush()  # Hace persistente el tenant_id para las relaciones/claves foráneas

        # 5. Configuración Base por Defecto (ClinicSettings) alineada al sector
        default_settings = models.ClinicSettings(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            clinic_name=tenant_name.strip(),
            clinic_email=admin_email.strip(),
            clinic_phone="",
            clinic_address="",
            maps_url="",
            instagram_url="",
            business_sector=resolved_sector,
            branding_font_headings=branding.get("branding_font_headings", "Playfair Display"),
            branding_font_body=branding.get("branding_font_body", "Inter"),
            theme_palette=branding.get("theme_palette", "charcoal-gold"),
            accent_color_primary=branding.get("accent_color_primary", "#D4AF37"),
            accent_color_secondary=branding.get("accent_color_secondary", "#1C1917"),
            allow_search_engine_indexing=True,
            onboarding_completed=onboarding_completed
        )
        db.add(default_settings)

        # 6. Contenido del Sitio por Defecto adaptado al sector
        c_name = tenant_name.strip()
        default_content = models.SiteContent(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            hero_title=(sc_bp.get("hero_title") or f"Bienvenidos a {c_name}").format(clinic_name=c_name),
            hero_subtitle=sc_bp.get("hero_subtitle") or "Servicios profesionales y cuidado personalizado.",
            hero_image_url=sc_bp.get("hero_image_url") or "https://ypimdbkiuguiszaddzaj.supabase.co/storage/v1/object/public/media/blueprints/beauty/hero.jpg",
            about_text=(sc_bp.get("about_text") or "Nos dedicamos a ofrecer los mejores servicios para resaltar tu bienestar.").format(clinic_name=c_name),
            about_title=(sc_bp.get("about_title") or f"Sobre {c_name}").format(clinic_name=c_name),
            about_image_url=sc_bp.get("about_image_url") or "https://ypimdbkiuguiszaddzaj.supabase.co/storage/v1/object/public/media/blueprints/beauty/about.jpg",
            cta_title=sc_bp.get("cta_title"),
            cta_subtitle=sc_bp.get("cta_subtitle")
        )
        db.add(default_content)

        # 6.1 Opcional: Precargar categoría y servicios base del sector (ej. Peluquería)
        if seed_sector_services:
            cat_info = blueprint.get("category")
            category_id = None
            if cat_info:
                cat = models.ServiceCategory(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    name=cat_info["name"],
                    slug=cat_info["slug"],
                    description=cat_info.get("description", ""),
                    is_active=True,
                    order_index=0
                )
                db.add(cat)
                db.flush()
                category_id = cat.id

            for s in blueprint.get("services", []):
                db_service = models.Service(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    category_id=category_id,
                    name=s["name"],
                    slug=s["slug"],
                    duration_minutes=s["duration_minutes"],
                    price=s["price"],
                    description=s.get("description", ""),
                    is_active=True,
                    is_featured=s.get("is_featured", False),
                    image_url=s.get("image_url")
                )
                db.add(db_service)

        # 7. Crear el usuario en Supabase Auth
        supabase_user_id = None
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

        if supabase_url and supabase_key:
            try:
                from supabase import create_client
                supabase_client = create_client(supabase_url, supabase_key)

                try:
                    # Registrar administrador en Supabase con su tenant_id en app_metadata para RLS
                    auth_user = supabase_client.auth.admin.create_user({
                        "email": admin_email,
                        "password": admin_password,
                        "email_confirm": True,
                        "user_metadata": {"full_name": admin_name},
                        "app_metadata": {"tenant_id": tenant_id, "role": "admin"}
                    })

                    # Extraer el ID de usuario devuelto de forma segura
                    if hasattr(auth_user, 'user') and auth_user.user:
                        supabase_user_id = auth_user.user.id
                    elif isinstance(auth_user, dict) and 'user' in auth_user:
                        supabase_user_id = auth_user['user']['id']
                    elif hasattr(auth_user, 'id'):
                        supabase_user_id = auth_user.id

                    logger.info(f"[PROVISIONER] Usuario creado en Supabase Auth. ID: {supabase_user_id}")
                except Exception as sb_err:
                    err_msg = str(sb_err).lower()
                    if "already" in err_msg or "exists" in err_msg or "registered" in err_msg:
                        logger.info(f"[PROVISIONER] El usuario ya existe en Supabase Auth ({admin_email}). Recuperando ID para asociarlo...")
                        users_list = supabase_client.auth.admin.list_users()
                        for u in users_list:
                            if getattr(u, 'email', '').lower() == admin_email.lower():
                                supabase_user_id = u.id
                                try:
                                    supabase_client.auth.admin.update_user_by_id(u.id, {
                                        "password": admin_password,
                                        "app_metadata": {"tenant_id": tenant_id, "role": "admin"}
                                    })
                                except Exception as upd_err:
                                    logger.warning(f"[PROVISIONER] Aviso actualizando metadatos del usuario: {upd_err}")
                                break
                    if not supabase_user_id:
                        logger.warning(f"[PROVISIONER] [WARNING] Error al crear usuario en Supabase Auth: {sb_err}")
            except Exception as outer_err:
                logger.warning(f"[PROVISIONER] Error conectando con Supabase: {outer_err}")

        # Fallback de ID local si Supabase falla o no está configurado
        if not supabase_user_id:
            supabase_user_id = str(uuid.uuid4())
            logger.warning(f"[PROVISIONER] Usando UUID generado localmente para el usuario: {supabase_user_id}")

        # 8. Guardar o Actualizar Usuario Relacional
        hashed_pw = pwd_context.hash(admin_password)
        existing_rel_user = db.query(models.User).filter(
            (models.User.id == supabase_user_id) | (models.User.email == admin_email)
        ).first()

        if existing_rel_user:
            existing_rel_user.tenant_id = tenant_id
            existing_rel_user.role = "admin"
            existing_rel_user.hashed_password = hashed_pw
            db.flush()
        else:
            new_user = models.User(
                id=supabase_user_id,
                email=admin_email,
                hashed_password=hashed_pw,
                role="admin",
                tenant_id=tenant_id,
                email_verified=True
            )
            db.add(new_user)
            db.flush()

        # 9. Crear o Actualizar el Perfil del Titular como Administrador y 1er Especialista
        existing_profile = db.query(models.Profile).filter(
            models.Profile.id == supabase_user_id,
            models.Profile.tenant_id == tenant_id
        ).first()

        if not existing_profile:
            existing_profile = db.query(models.Profile).filter(
                models.Profile.email == admin_email,
                models.Profile.tenant_id == tenant_id
            ).first()

        if existing_profile:
            existing_profile.full_name = admin_name
            existing_profile.role = "admin"
            existing_profile.status = "Activo"
            existing_profile.email = admin_email
        else:
            new_profile = models.Profile(
                id=supabase_user_id,
                tenant_id=tenant_id,
                full_name=admin_name,
                role="admin",
                email=admin_email,
                status="Activo"
            )
            db.add(new_profile)

        # Confirmar transacción atómica
        db.commit()
        logger.info(f"[PROVISIONER] [SUCCESS] Nuevo Tenant '{clean_slug}' aprovisionado completamente con éxito.")
        return new_tenant

    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"[PROVISIONER ERROR] Fallo crítico al aprovisionar tenant en base de datos. Ejecutando rollback.")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error interno durante el aprovisionamiento: {str(e)}"
        )
