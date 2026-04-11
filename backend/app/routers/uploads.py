from fastapi import APIRouter, UploadFile, File, HTTPException
import os
import uuid
from supabase import create_client, Client

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

@router.post("/")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen")
    
    ext = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
    filename = f"{uuid.uuid4().hex}.{ext}"
    
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Configuración de Supabase no encontrada")
        
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        file_bytes = await file.read()
        
        # Subir a Supabase Storage (bucket 'media')
        res = supabase.storage.from_("media").upload(
            file=file_bytes,
            path=filename,
            file_options={"content-type": file.content_type, "upsert": "true"}
        )
        
        # Obtener url pública
        public_url = supabase.storage.from_("media").get_public_url(filename)
        return {"url": public_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
