import base64
import json
import re
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from .. import database, models

router = APIRouter(
    prefix="/super-admin",
    tags=["super-admin"],
)

# ---------------------------------------------------------------------
# SCHEMAS DE ENTRADA Y SALIDA
# ---------------------------------------------------------------------
class TenantOut(BaseModel):
    id: str
    name: str
    slug: str
    stripe_customer_id: Optional[str] = None
    subscription_status: str
    stripe_subscription_id: Optional[str] = None
    plan_type: str
    subscription_expires_at: Optional[datetime] = None
    custom_domain: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class StatusUpdate(BaseModel):
    status: str

class PlanUpdate(BaseModel):
    plan_type: str

# ---------------------------------------------------------------------
# VERIFICACIÓN DE ROL DE SUPER ADMIN
# ---------------------------------------------------------------------
def verify_super_admin(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autorizado: Falta token Bearer")
    
    token = authorization.split(" ")[1]
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise HTTPException(status_code=401, detail="Formato de token inválido")
        payload_b64 = parts[1]
        payload_b64 += "=" * ((4 - len(payload_b64) % 4) % 4)
        payload_json = base64.b64decode(payload_b64).decode("utf-8")
        payload = json.loads(payload_json)
        
        # Obtener rol
        app_metadata = payload.get("app_metadata", {})
        role = app_metadata.get("role")
        if not role:
            user_metadata = payload.get("user_metadata", {})
            role = user_metadata.get("role")
            
        if role != "super_admin":
            raise HTTPException(status_code=403, detail="Acceso denegado: Se requiere rol de Super Admin")
            
        return payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Token inválido: {str(e)}")

# ---------------------------------------------------------------------
# ENDPOINTS DEL BACKOFFICE
# ---------------------------------------------------------------------
@router.get("/tenants", response_model=List[TenantOut])
def get_tenants(
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Obtiene la lista de todos los inquilinos (Tenants) en el SaaS.
    """
    tenants = db.query(models.Tenant).order_by(models.Tenant.created_at.desc()).all()
    return tenants

@router.post("/tenants/{tenant_id}/status", response_model=TenantOut)
def update_tenant_status(
    tenant_id: str,
    payload: StatusUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Actualiza manualmente el estado de suscripción de un inquilino.
    """
    if payload.status not in ["active", "suspended", "canceled"]:
        raise HTTPException(status_code=400, detail="Estado no permitido. Debe ser 'active', 'suspended' o 'canceled'")
    
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    tenant.subscription_status = payload.status
    db.commit()
    db.refresh(tenant)
    return tenant

@router.put("/tenants/{tenant_id}/plan", response_model=TenantOut)
def update_tenant_plan(
    tenant_id: str,
    payload: PlanUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Actualiza manualmente el tipo de plan de un inquilino.
    """
    plan = payload.plan_type.lower()
    if plan not in ["free", "basic", "pro", "gold"]:
        raise HTTPException(status_code=400, detail="Plan no permitido. Debe ser 'free', 'basic', 'pro' o 'gold'")
    
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    tenant.plan_type = plan
    db.commit()
    db.refresh(tenant)
    return tenant

# ---------------------------------------------------------------------
# IMPERSONACIÓN (MODO SOPORTE)
# ---------------------------------------------------------------------
import hmac
import hashlib
import os
from datetime import timedelta

def generate_impersonation_token(tenant_id: str, slug: str, name: str) -> str:
    secret = os.environ.get("JWT_SECRET_KEY", "super-admin-secret-key-123")
    payload = {
        "impersonate": "true",
        "tenant_id": tenant_id,
        "slug": slug,
        "name": name,
        "exp": (datetime.utcnow() + timedelta(hours=2)).isoformat()
    }
    
    # Base64 encode header and payload
    header = {"alg": "HS256", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    
    # Create signature
    message = f"{header_b64}.{payload_b64}"
    sig = hmac.new(secret.encode(), message.encode(), hashlib.sha256).digest()
    sig_b64 = base64.urlsafe_b64encode(sig).decode().rstrip("=")
    
    return f"{message}.{sig_b64}"

@router.post("/impersonate/{tenant_id}")
def impersonate_tenant(
    tenant_id: str,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Genera un token de impersonación firmado para un tenant específico (Modo Soporte).
    """
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    token = generate_impersonation_token(tenant.id, tenant.slug, tenant.name)
    return {
        "success": True,
        "token": token,
        "tenant_id": tenant.id,
        "slug": tenant.slug,
        "name": tenant.name
    }

class SaasSettingsUpdate(BaseModel):
    allow_search_engine_indexing: bool

@router.get("/settings")
def get_saas_settings(
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Obtiene los ajustes globales del SaaS (Tenant por defecto).
    """
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == "00000000-0000-0000-0000-000000000000").first()
    if not settings:
        settings = models.ClinicSettings(tenant_id="00000000-0000-0000-0000-000000000000")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return {
        "allow_search_engine_indexing": settings.allow_search_engine_indexing
    }

@router.patch("/settings")
def update_saas_settings(
    payload: SaasSettingsUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Actualiza los ajustes globales del SaaS.
    """
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == "00000000-0000-0000-0000-000000000000").first()
    if not settings:
        settings = models.ClinicSettings(tenant_id="00000000-0000-0000-0000-000000000000")
        db.add(settings)
    settings.allow_search_engine_indexing = payload.allow_search_engine_indexing
    db.commit()
    db.refresh(settings)
    return {
        "allow_search_engine_indexing": settings.allow_search_engine_indexing
    }

class TenantDomainUpdate(BaseModel):
    custom_domain: Optional[str] = None

@router.put("/tenants/{tenant_id}/domain", response_model=TenantOut)
def update_tenant_domain(
    tenant_id: str,
    payload: TenantDomainUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Actualiza el dominio personalizado de un inquilino de forma persistente.
    """
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
    
    # Limpiar espacios en blanco
    domain_value = payload.custom_domain.strip() if payload.custom_domain else None
    if domain_value == "":
        domain_value = None

    # Validar formato de dominio si no es None
    if domain_value is not None:
        DOMAIN_REGEX = re.compile(
            r'^(?:[a-zA-Z0-9]'
            r'(?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+'
            r'[a-zA-Z]{2,18}$'
        )
        if not DOMAIN_REGEX.match(domain_value):
            raise HTTPException(
                status_code=400,
                detail=f"'{domain_value}' no es un formato de dominio válido. Debe incluir una extensión válida (ej: .com, .es)."
            )

    tenant.custom_domain = domain_value
    db.commit()
    db.refresh(tenant)
    return tenant


# ---------------------------------------------------------------------
# CMS MARKETING & SHOWCASE ENDPOINTS
# ---------------------------------------------------------------------
class LandingMarketingSettingsOut(BaseModel):
    id: str
    hero_title: str
    hero_subtitle: str
    logo_svg: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    tertiary_color: Optional[str] = None
    font_family: Optional[str] = None
    favicon_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

    class Config:
        from_attributes = True


class LandingMarketingSettingsUpdate(BaseModel):
    hero_title: str
    hero_subtitle: str
    logo_svg: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    tertiary_color: Optional[str] = None
    font_family: Optional[str] = None
    favicon_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None


class LandingShowcaseSectorOut(BaseModel):
    id: str
    title: str
    slug: str
    badge_text: Optional[str] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    order_index: int

    class Config:
        from_attributes = True


class LandingShowcaseSectorCreateUpdate(BaseModel):
    title: str
    slug: str
    badge_text: Optional[str] = None
    video_url: Optional[str] = None
    image_url: Optional[str] = None
    order_index: int = 0


# 1. PUBLIC ENDPOINT (No authentication required)
@router.get("/marketing/public")
def get_public_marketing_content(db: Session = Depends(database.get_db)):
    """
    Endpoint público para que la landing consuma textos de portada y sectores ordenados.
    """
    settings = db.query(models.LandingMarketingSettings).filter(models.LandingMarketingSettings.id == "global").first()
    if not settings:
        settings = models.LandingMarketingSettings(
            id="global",
            hero_title="La elegancia de tu negocio traducida en un SaaS de Lujo",
            hero_subtitle="Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes. Agendas fluidas, expedientes médicos asimétricos y reservas de doble opt-in integradas en una experiencia sublime."
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
        
    sectors = db.query(models.LandingShowcaseSector).order_by(models.LandingShowcaseSector.order_index.asc()).all()
    return {
        "settings": {
            "hero_title": settings.hero_title,
            "hero_subtitle": settings.hero_subtitle,
            "logo_svg": settings.logo_svg,
            "primary_color": settings.primary_color,
            "secondary_color": settings.secondary_color,
            "tertiary_color": settings.tertiary_color,
            "font_family": settings.font_family,
            "favicon_url": settings.favicon_url,
            "seo_title": settings.seo_title,
            "seo_description": settings.seo_description,
            "seo_keywords": settings.seo_keywords
        },
        "sectors": [
            {
                "id": s.id,
                "title": s.title,
                "slug": s.slug,
                "badge_text": s.badge_text,
                "video_url": s.video_url,
                "image_url": s.image_url,
                "order_index": s.order_index
            } for s in sectors
        ]
    }


# 2. PROTECTED ENDPOINTS (Requiere rol de Super Admin)
@router.get("/marketing/settings", response_model=LandingMarketingSettingsOut)
def get_marketing_settings(
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    settings = db.query(models.LandingMarketingSettings).filter(models.LandingMarketingSettings.id == "global").first()
    if not settings:
        settings = models.LandingMarketingSettings(id="global")
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings


@router.put("/marketing/settings", response_model=LandingMarketingSettingsOut)
def update_marketing_settings(
    payload: LandingMarketingSettingsUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    settings = db.query(models.LandingMarketingSettings).filter(models.LandingMarketingSettings.id == "global").first()
    if not settings:
        settings = models.LandingMarketingSettings(id="global")
        db.add(settings)
    settings.hero_title = payload.hero_title
    settings.hero_subtitle = payload.hero_subtitle
    settings.logo_svg = payload.logo_svg
    settings.primary_color = payload.primary_color
    settings.secondary_color = payload.secondary_color
    settings.tertiary_color = payload.tertiary_color
    settings.font_family = payload.font_family
    settings.favicon_url = payload.favicon_url
    settings.seo_title = payload.seo_title
    settings.seo_description = payload.seo_description
    settings.seo_keywords = payload.seo_keywords
    db.commit()
    db.refresh(settings)
    return settings


@router.get("/marketing/sectors", response_model=List[LandingShowcaseSectorOut])
def get_marketing_sectors(
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    return db.query(models.LandingShowcaseSector).order_by(models.LandingShowcaseSector.order_index.asc()).all()


@router.post("/marketing/sectors", response_model=LandingShowcaseSectorOut)
def create_marketing_sector(
    payload: LandingShowcaseSectorCreateUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    # Validar slug único
    existing = db.query(models.LandingShowcaseSector).filter(models.LandingShowcaseSector.slug == payload.slug.strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail=f"El slug '{payload.slug}' ya está en uso por otro sector.")
        
    sector = models.LandingShowcaseSector(
        title=payload.title.strip(),
        slug=payload.slug.strip(),
        badge_text=payload.badge_text.strip() if payload.badge_text else None,
        video_url=payload.video_url.strip() if payload.video_url else None,
        image_url=payload.image_url.strip() if payload.image_url else None,
        order_index=payload.order_index
    )
    db.add(sector)
    db.commit()
    db.refresh(sector)
    return sector


@router.put("/marketing/sectors/{sector_id}", response_model=LandingShowcaseSectorOut)
def update_marketing_sector(
    sector_id: str,
    payload: LandingShowcaseSectorCreateUpdate,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    sector = db.query(models.LandingShowcaseSector).filter(models.LandingShowcaseSector.id == sector_id).first()
    if not sector:
        raise HTTPException(status_code=404, detail="Sector no encontrado")
        
    # Validar slug único si cambia
    if sector.slug != payload.slug.strip():
        existing = db.query(models.LandingShowcaseSector).filter(models.LandingShowcaseSector.slug == payload.slug.strip()).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"El slug '{payload.slug}' ya está en uso por otro sector.")
            
    sector.title = payload.title.strip()
    sector.slug = payload.slug.strip()
    sector.badge_text = payload.badge_text.strip() if payload.badge_text else None
    sector.video_url = payload.video_url.strip() if payload.video_url else None
    sector.image_url = payload.image_url.strip() if payload.image_url else None
    sector.order_index = payload.order_index
    
    db.commit()
    db.refresh(sector)
    return sector


@router.delete("/marketing/sectors/{sector_id}")
def delete_marketing_sector(
    sector_id: str,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    sector = db.query(models.LandingShowcaseSector).filter(models.LandingShowcaseSector.id == sector_id).first()
    if not sector:
        raise HTTPException(status_code=404, detail="Sector no encontrado")
    db.delete(sector)
    db.commit()
    return {"success": True, "message": f"Sector '{sector.title}' eliminado correctamente."}


@router.delete("/tenants/{tenant_id}")
def hard_delete_tenant(
    tenant_id: str,
    db: Session = Depends(database.get_db),
    admin_payload: dict = Depends(verify_super_admin)
):
    """
    Realiza un borrado físico en cascada (Hard Delete) de un inquilino,
    eliminando todas sus dependencias y borrando sus archivos de Supabase Storage.
    """
    import os
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")

    tenant_name = tenant.name

    # 1. Obtener y eliminar físicamente los archivos del inquilino en Supabase Storage
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    deleted_files = []

    if supabase_url and supabase_key:
        try:
            from supabase import create_client, Client
            supabase: Client = create_client(supabase_url, supabase_key)
            
            # Obtener nombres de archivos registrados para este tenant
            tenant_media = db.query(models.Media).filter(models.Media.tenant_id == tenant_id).all()
            filenames_to_delete = [media.filename for media in tenant_media if media.filename]
            
            if filenames_to_delete:
                supabase.storage.from_("media").remove(filenames_to_delete)
                deleted_files = filenames_to_delete
        except Exception as e:
            # Registramos el error de almacenamiento pero permitimos continuar con la DB para evitar bloqueos
            print(f"Advertencia: No se pudieron borrar archivos del Storage: {str(e)}")

    # 2. Ejecutar eliminación en cascada quirúrgica y atómica en DB
    try:
        # Oleada 1: Hojas con múltiples dependencias cruzadas
        db.query(models.Appointment).filter(models.Appointment.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.Consent).filter(models.Consent.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.Voucher).filter(models.Voucher.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.Invoice).filter(models.Invoice.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.Notification).filter(models.Notification.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.Media).filter(models.Media.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.VoucherTemplate).filter(models.VoucherTemplate.tenant_id == tenant_id).delete(synchronize_session=False)
        
        # Oleada 2: Entidades primarias referenciadas
        db.query(models.Client).filter(models.Client.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.Service).filter(models.Service.tenant_id == tenant_id).delete(synchronize_session=False)
        
        # Oleada 3: Parametrización e infraestructura del inquilino
        db.query(models.ServiceCategory).filter(models.ServiceCategory.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.TimeBlock).filter(models.TimeBlock.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.SiteNavigation).filter(models.SiteNavigation.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.SiteBlock).filter(models.SiteBlock.tenant_id == tenant_id).delete(synchronize_session=False)
        db.query(models.Profile).filter(models.Profile.tenant_id == tenant_id).delete(synchronize_session=False)
        
        # Oleada 4: Credenciales y cuentas de acceso
        db.query(models.User).filter(models.User.tenant_id == tenant_id).delete(synchronize_session=False)
        
        # Oleada 5: Inquilino Raíz
        db.query(models.Tenant).filter(models.Tenant.id == tenant_id).delete(synchronize_session=False)
        
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Fallo en la base de datos al realizar el borrado en cascada: {str(e)}"
        )

    return {
        "success": True,
        "message": f"Inquilino '{tenant_name}' y todas sus dependencias eliminados permanentemente.",
        "deleted_files_count": len(deleted_files)
    }

