from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database import get_db, current_tenant_var
from app import models
from pydantic import BaseModel
import os
from supabase import create_client, Client as SupabaseClient
from typing import List

router = APIRouter(
    prefix="/media",
    tags=["media"],
)

MAX_QUOTA_BYTES = 1 * 1024 * 1024 * 1024  # 1 GB


def get_supabase() -> SupabaseClient:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise HTTPException(status_code=500, detail="Configuración de Supabase no encontrada")
    return create_client(url, key)


def build_used_urls_map(db: Session) -> dict:
    """
    Scans all tables for the current tenant that may reference images and returns a dict:
    { "filename.webp": ["label1", "label2"] }
    """
    tenant_id = current_tenant_var.get()
    usage_map: dict = {}

    def add_usage(url: str, label: str):
        if not url:
            return
        filename = url.split("/")[-1]
        if filename not in usage_map:
            usage_map[filename] = []
        usage_map[filename].append(label)

    # Services
    services = db.query(models.Service).filter(models.Service.tenant_id == tenant_id).all()
    for s in services:
        if s.image_url: add_usage(s.image_url, f"Servicio: {s.name}")
        if s.video_url: add_usage(s.video_url, f"Servicio (Vídeo): {s.name}")

    # Service Categories
    cats = db.query(models.ServiceCategory).filter(
        models.ServiceCategory.tenant_id == tenant_id,
        models.ServiceCategory.image_url.isnot(None)
    ).all()
    for c in cats:
        add_usage(c.image_url, f"Categoría: {c.name}")

    # Site Content (CMS)
    site = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant_id).first()
    if site:
        if site.hero_image_url:
            add_usage(site.hero_image_url, "CMS: Imagen Hero (Portada)")
        if site.hero_video_url:
            add_usage(site.hero_video_url, "CMS: Vídeo Hero (Portada)")
        if site.about_image_url:
            add_usage(site.about_image_url, "CMS: Foto Sobre Mí")

    # User Profiles (Avatars)
    profiles = db.query(models.Profile).filter(
        models.Profile.tenant_id == tenant_id,
        models.Profile.avatar_url.isnot(None)
    ).all()
    for p in profiles:
        add_usage(p.avatar_url, f"Perfil: {p.full_name or p.email or 'Usuario'}")

    # Gallery Media
    gallery_items = db.query(models.Media.url).filter(models.Media.tenant_id == tenant_id).all()
    for item in gallery_items:
        if item[0]:
            add_usage(item[0], "Galería Multimedia")

    # Showcase Sectors (Solo para el tenant del sistema/marketing)
    if tenant_id == "00000000-0000-0000-0000-000000000000":
        sectors = db.query(models.LandingShowcaseSector).all()
        for s in sectors:
            if s.image_url:
                add_usage(s.image_url, f"Showcase: {s.title}")
            if s.video_url:
                add_usage(s.video_url, f"Showcase (Vídeo): {s.title}")

    return usage_map


def check_global_file_usage(filename: str, db: Session) -> bool:
    """
    Checks if a file is referenced by ANY tenant on the platform.
    This prevents cross-tenant file deletion.
    """
    search_pattern = f"%/{filename}"
    
    if db.query(models.Service).filter(
        or_(
            models.Service.image_url.like(search_pattern),
            models.Service.video_url.like(search_pattern)
        )
    ).first():
        return True
        
    if db.query(models.ServiceCategory).filter(
        models.ServiceCategory.image_url.like(search_pattern)
    ).first():
        return True
        
    if db.query(models.SiteContent).filter(
        or_(
            models.SiteContent.hero_image_url.like(search_pattern),
            models.SiteContent.hero_video_url.like(search_pattern),
            models.SiteContent.about_image_url.like(search_pattern)
        )
    ).first():
        return True
        
    if db.query(models.Profile).filter(
        models.Profile.avatar_url.like(search_pattern)
    ).first():
        return True
        
    if db.query(models.Media).filter(
        models.Media.url.like(search_pattern)
    ).first():
        return True
        
    if db.query(models.LandingShowcaseSector).filter(
        or_(
            models.LandingShowcaseSector.image_url.like(search_pattern),
            models.LandingShowcaseSector.video_url.like(search_pattern)
        )
    ).first():
        return True
        
    return False


@router.get("/all")
async def list_all_media(db: Session = Depends(get_db)):
    """Lists files in the Supabase media bucket associated with the current tenant."""
    supabase = get_supabase()

    try:
        files = supabase.storage.from_("media").list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al conectar con Supabase Storage: {e}")

    usage_map = build_used_urls_map(db)

    result = []
    for f in files:
        name = f.get("name")
        if not name or name == ".emptyFolderPlaceholder":
            continue

        usages = usage_map.get(name, [])
        if not usages:
            # Hide files that do not belong to the current tenant
            continue

        metadata = f.get("metadata") or {}
        public_url = supabase.storage.from_("media").get_public_url(name)

        result.append({
            "name": name,
            "url": public_url,
            "size": metadata.get("size", 0),
            "content_type": metadata.get("mimetype", "image/webp"),
            "created_at": f.get("created_at"),
            "status": "in_use",
            "usages": usages,
        })

    result.sort(key=lambda x: x["name"])
    return result


@router.get("/quota")
async def get_media_quota(db: Session = Depends(get_db)):
    """Returns the total used storage in the media bucket for the current tenant."""
    supabase = get_supabase()

    try:
        files = supabase.storage.from_("media").list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al conectar con Supabase Storage: {e}")

    usage_map = build_used_urls_map(db)

    total_bytes = 0
    file_count = 0
    for f in files:
        name = f.get("name")
        if not name or name == ".emptyFolderPlaceholder":
            continue
        if name not in usage_map:
            continue
        metadata = f.get("metadata") or {}
        total_bytes += metadata.get("size", 0)
        file_count += 1

    return {
        "used_bytes": total_bytes,
        "max_bytes": MAX_QUOTA_BYTES,
        "file_count": file_count,
    }


@router.delete("/{filename}")
async def delete_media_file(filename: str, db: Session = Depends(get_db)):
    """Safely deletes a media file ONLY if it is orphaned and belongs to the current tenant."""
    # 1. Check global usage to prevent deleting other tenants' active files
    if check_global_file_usage(filename, db):
        raise HTTPException(
            status_code=409,
            detail="No se puede eliminar. Esta imagen está en uso."
        )

    # 2. Check ownership (must be registered in models.Media or once referenced by current tenant)
    media_record = db.query(models.Media).filter(
        models.Media.url.like(f"%/{filename}"),
        models.Media.tenant_id == current_tenant_var.get()
    ).first()
    
    supabase = get_supabase()
    try:
        supabase.storage.from_("media").remove([filename])
        if media_record:
            db.delete(media_record)
            db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar el archivo en Supabase: {e}")

    return {"message": f"Archivo '{filename}' eliminado correctamente."}


class BulkDeleteRequest(BaseModel):
    filenames: List[str]


@router.post("/bulk-delete")
async def bulk_delete_media_files(payload: BulkDeleteRequest, db: Session = Depends(get_db)):
    """Safely deletes multiple orphaned files in one operation."""
    if not payload.filenames:
        raise HTTPException(status_code=400, detail="La lista de archivos no puede estar vacía.")

    blocked = []
    for name in payload.filenames:
        if check_global_file_usage(name, db):
            blocked.append(name)

    if blocked:
        raise HTTPException(
            status_code=409,
            detail=f"Operación cancelada. Los siguientes archivos están en uso: {', '.join(blocked)}"
        )

    # Get media records to delete
    media_records = db.query(models.Media).filter(
        or_(*[models.Media.url.like(f"%/{name}") for name in payload.filenames]),
        models.Media.tenant_id == current_tenant_var.get()
    ).all()

    supabase = get_supabase()
    try:
        supabase.storage.from_("media").remove(payload.filenames)
        for record in media_records:
            db.delete(record)
        db.commit()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar archivos en Supabase: {e}")

    return {
        "message": f"{len(payload.filenames)} archivo(s) eliminados correctamente.",
        "deleted": payload.filenames,
    }

