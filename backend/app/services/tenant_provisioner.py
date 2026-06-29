import os
import uuid
import logging
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import text
from fastapi import HTTPException
from .. import models
from ..database import current_tenant_var
from ..routers.users import pwd_context

logger = logging.getLogger(__name__)

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
    subscription_expires_at: datetime | None = None
) -> models.Tenant:
    """
    Aprovisiona de forma atómica y aislada un nuevo inquilino (Tenant) en la base de datos,
    junto con su configuración inicial, contenido de sitio público y cuenta de administrador.
    
    Establece de forma estricta las variables de contexto RLS para evitar fugas de información.
    """
    # 1. Cortafuegos de identidad: Validar que el usuario no exista
    existing_user = db.query(models.User).filter(models.User.email == admin_email).first()
    if existing_user:
        logger.error(f"[PROVISIONER ERROR] El correo {admin_email} ya está en uso. Abortando.")
        raise HTTPException(
            status_code=400,
            detail="Este correo ya está en uso. Por favor, utiliza un correo diferente para registrar un nuevo negocio."
        )

    # 2. Generar UUID atómico para el Tenant
    tenant_id = str(uuid.uuid4())
    logger.info(f"[PROVISIONER] Iniciando aprovisionamiento del Tenant SaaS: {tenant_slug} | ID: {tenant_id}")

    try:
        # 3. Sincronizar ContextVar y PostgreSQL para RLS
        current_tenant_var.set(tenant_id)
        db.execute(
            text("SET LOCAL app.current_tenant_id = :tenant_id"),
            {"tenant_id": tenant_id}
        )

        # 4. Crear el Tenant
        if not plan_type or plan_type.strip() == "":
            plan_type = "pro"

        new_tenant = models.Tenant(
            id=tenant_id,
            name=tenant_name,
            slug=tenant_slug,
            stripe_customer_id=stripe_customer_id,
            stripe_subscription_id=stripe_subscription_id,
            plan_type=plan_type,
            subscription_status=subscription_status,
            subscription_expires_at=subscription_expires_at
        )
        db.add(new_tenant)
        db.flush()  # Hace persistente el tenant_id para las relaciones/claves foráneas

        # 5. Configuración Base por Defecto (ClinicSettings)
        default_settings = models.ClinicSettings(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            clinic_name=tenant_name,
            clinic_email=admin_email,
            clinic_phone="",
            clinic_address="",
            maps_url="",
            instagram_url="",
            allow_search_engine_indexing=False,
            onboarding_completed=False
        )
        db.add(default_settings)

        # 6. Contenido del Sitio por Defecto
        default_content = models.SiteContent(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            hero_title=f"Bienvenidos a {tenant_name}",
            hero_subtitle="Servicios profesionales y cuidado personalizado.",
            about_text="Nos dedicamos a ofrecer los mejores servicios para resaltar tu bienestar.",
            about_title=f"Sobre {tenant_name}"
        )
        db.add(default_content)

        # 7. Crear el usuario en Supabase Auth
        supabase_user_id = None
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

        if supabase_url and supabase_key:
            try:
                from supabase import create_client
                supabase_client = create_client(supabase_url, supabase_key)

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
                if "already exists" in err_msg or "already registered" in err_msg or "email_exists" in err_msg or "email already" in err_msg:
                    raise HTTPException(
                        status_code=400,
                        detail="Este correo electrónico ya está en uso. Por favor, utiliza uno diferente."
                    )
                logger.warning(f"[PROVISIONER] [WARNING] Error al crear usuario en Supabase Auth: {sb_err}")

        # Fallback de ID local si Supabase falla o no está configurado
        if not supabase_user_id:
            supabase_user_id = str(uuid.uuid4())
            logger.warning(f"[PROVISIONER] Usando UUID generado localmente para el usuario: {supabase_user_id}")

        # 8. Guardar Usuario Relacional
        hashed_pw = pwd_context.hash(admin_password)
        new_user = models.User(
            id=supabase_user_id,
            email=admin_email,
            hashed_password=hashed_pw,
            role="admin",
            tenant_id=tenant_id,
            email_verified=False
        )
        db.add(new_user)
        db.flush()

        # 9. Crear el Perfil
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
        logger.info(f"[PROVISIONER] [SUCCESS] Nuevo Tenant '{tenant_slug}' aprovisionado completamente con éxito.")
        return new_tenant

    except Exception as e:
        logger.error(f"[PROVISIONER ERROR] Fallo crítico al aprovisionar tenant en base de datos. Ejecutando rollback.")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Error interno durante el aprovisionamiento: {str(e)}"
        )
