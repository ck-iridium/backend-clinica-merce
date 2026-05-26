from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
import os
import uuid
import io
from PIL import Image
from supabase import create_client, Client
from sqlalchemy.orm import Session
from app.database import get_db
from app import models

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

@router.post("/")
async def upload_image(file: UploadFile = File(...), db: Session = Depends(get_db)):
    is_image = file.content_type.startswith("image/")
    is_video = file.content_type.startswith("video/")

    if not is_image and not is_video:
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen o un vídeo")
    
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Configuración de Supabase no encontrada")
        
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        file_bytes = await file.read()
        
        filename = f"{uuid.uuid4().hex}"
        content_type = file.content_type
        final_bytes = file_bytes

        if is_image:
            if file.content_type == "image/svg+xml":
                filename += ".svg"
            else:
                try:
                    # Comprimir a WEBP preservando canal Alfa con Pillow
                    image = Image.open(io.BytesIO(file_bytes))
                    if image.mode not in ("RGB", "RGBA"):
                        if 'transparency' in image.info or image.mode in ('P', 'LA'):
                            image = image.convert("RGBA")
                        else:
                            image = image.convert("RGB")
                    
                    buffer = io.BytesIO()
                    image.save(buffer, format="WEBP", quality=85)
                    final_bytes = buffer.getvalue()
                    filename += ".webp"
                    content_type = "image/webp"
                except Exception:
                    # Fallback si falla PIL
                    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
                    filename += f".{ext}"
        else:
            # Es vídeo. El procesamiento se realiza en el cliente (frontend) con FFmpeg.wasm.
            # El servidor simplemente recibe el archivo ya optimizado.
            ext = file.filename.split('.')[-1] if '.' in file.filename else 'mp4'
            filename += f".{ext}"
            final_bytes = file_bytes
        
        # Subir a Supabase Storage (bucket 'media')
        supabase.storage.from_("media").upload(
            file=final_bytes,
            path=filename,
            file_options={"content-type": content_type, "upsert": "true"}
        )
        
        # Obtener url pública
        public_url = supabase.storage.from_("media").get_public_url(filename)

        # Registrar en la base de datos models.Media si hay un tenant resuelto
        from app.database import current_tenant_var
        tenant_id = current_tenant_var.get()
        if tenant_id:
            new_media = models.Media(
                id=str(uuid.uuid4()),
                tenant_id=tenant_id,
                filename=filename,
                url=public_url,
                file_type="video" if is_video else "image",
                mime_type=content_type,
                size=len(final_bytes)
            )
            db.add(new_media)
            db.commit()

        return {"url": public_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/cleanup")
async def cleanup_orphaned_media(db: Session = Depends(get_db)):
    """Cruza los datos de DB con los de Supabase media para el tenant actual, y borra los archivos huérfanos que el tenant posee."""
    from app.database import current_tenant_var
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context required")

    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Configuración de Supabase no encontrada")
        
    used_urls = set()
    
    # 1. URLs de Servicios del tenant
    services = db.query(models.Service.image_url, models.Service.video_url).filter(models.Service.tenant_id == tenant_id).all()
    for img, vid in services:
        if img: used_urls.add(img.split('/')[-1])
        if vid: used_urls.add(vid.split('/')[-1])
        
    # 2. URLs de Categorías del tenant
    cats = db.query(models.ServiceCategory.image_url).filter(
        models.ServiceCategory.tenant_id == tenant_id,
        models.ServiceCategory.image_url.isnot(None)
    ).all()
    for c in cats:
        used_urls.add(c[0].split('/')[-1])
        
    # 3. Contenido del Sitio del tenant
    site = db.query(models.SiteContent).filter(models.SiteContent.tenant_id == tenant_id).first()
    if site:
        if site.hero_image_url:
            used_urls.add(site.hero_image_url.split('/')[-1])
        if site.hero_video_url:
            used_urls.add(site.hero_video_url.split('/')[-1])
        if site.about_image_url:
            used_urls.add(site.about_image_url.split('/')[-1])

    # 4. Perfiles del tenant
    profiles = db.query(models.Profile).filter(
        models.Profile.tenant_id == tenant_id,
        models.Profile.avatar_url.isnot(None)
    ).all()
    for p in profiles:
        used_urls.add(p.avatar_url.split('/')[-1])

    # 5. Media del tenant
    # Solo podemos borrar archivos de Supabase si sabemos que pertenecen a este tenant.
    # Por lo tanto, el tenant solo puede limpiar archivos huérfanos que estén registrados en su tabla `models.Media`.
    tenant_media = db.query(models.Media).filter(models.Media.tenant_id == tenant_id).all()
    
    deleted_files = []
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        for media in tenant_media:
            filename = media.filename
            if filename not in used_urls:
                supabase.storage.from_("media").remove([filename])
                db.delete(media)
                deleted_files.append(filename)
                
        db.commit()
        return {"message": f"Limpieza completada. {len(deleted_files)} archivos huérfanos del inquilino eliminados.", "deleted": deleted_files}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
