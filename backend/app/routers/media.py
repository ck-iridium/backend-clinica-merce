from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
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
    Scans all tables that may reference images and returns a dict:
    { "filename.webp": ["label1", "label2"] }
    """
    usage_map: dict = {}

    def add_usage(url: str, label: str):
        if not url:
            return
        filename = url.split("/")[-1]
        if filename not in usage_map:
            usage_map[filename] = []
        usage_map[filename].append(label)

    # Services
    services = db.query(models.Service).filter(models.Service.image_url.isnot(None)).all()
    for s in services:
        add_usage(s.image_url, f"Servicio: {s.name}")

    # Service Categories
    cats = db.query(models.ServiceCategory).filter(models.ServiceCategory.image_url.isnot(None)).all()
    for c in cats:
        add_usage(c.image_url, f"Categoría: {c.name}")

    # Site Content (CMS)
    site = db.query(models.SiteContent).first()
    if site:
        if site.hero_image_url:
            add_usage(site.hero_image_url, "CMS: Imagen Hero (Portada)")
        if site.about_image_url:
            add_usage(site.about_image_url, "CMS: Foto Sobre Mí")

    return usage_map


@router.get("/all")
async def list_all_media(db: Session = Depends(get_db)):
    """Lists all files in the Supabase media bucket with usage status."""
    supabase = get_supabase()

    try:
        files = supabase.storage.from_("media").list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al conectar con Supabase Storage: {e}")

    usage_map = build_used_urls_map(db)
    supabase_url = os.environ.get("SUPABASE_URL")

    result = []
    for f in files:
        name = f.get("name")
        if not name or name == ".emptyFolderPlaceholder":
            continue

        metadata = f.get("metadata") or {}
        usages = usage_map.get(name, [])

        public_url = supabase.storage.from_("media").get_public_url(name)

        result.append({
            "name": name,
            "url": public_url,
            "size": metadata.get("size", 0),
            "content_type": metadata.get("mimetype", "image/webp"),
            "created_at": f.get("created_at"),
            "status": "in_use" if usages else "orphan",
            "usages": usages,
        })

    # Sort: in_use first, then by name
    result.sort(key=lambda x: (0 if x["status"] == "in_use" else 1, x["name"]))
    return result


@router.get("/quota")
async def get_media_quota():
    """Returns the total used storage in the media bucket."""
    supabase = get_supabase()

    try:
        files = supabase.storage.from_("media").list()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al conectar con Supabase Storage: {e}")

    total_bytes = 0
    file_count = 0
    for f in files:
        name = f.get("name")
        if not name or name == ".emptyFolderPlaceholder":
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
    """Safely deletes a media file ONLY if it is orphaned (not referenced anywhere in the DB)."""
    usage_map = build_used_urls_map(db)

    if filename in usage_map:
        labels = ", ".join(usage_map[filename])
        raise HTTPException(
            status_code=409,
            detail=f"No se puede eliminar. Esta imagen está EN USO en: {labels}."
        )

    supabase = get_supabase()
    try:
        supabase.storage.from_("media").remove([filename])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar el archivo en Supabase: {e}")

    return {"message": f"Archivo '{filename}' eliminado correctamente."}
