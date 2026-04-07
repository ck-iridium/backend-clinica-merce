import os
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from supabase import create_client, Client
from ..database import get_db

router = APIRouter(
    prefix="/backups",
    tags=["backups"],
)

def get_supabase_client() -> Client:
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Supabase Storage no configurado en este entorno.")
    return create_client(supabase_url, supabase_key)

@router.get("/")
def list_backups():
    """
    Lista los backups disponibles en el bucket 'backups'.
    """
    try:
        supabase = get_supabase_client()
        files = supabase.storage.from_("backups").list()
        
        valid_files = [f for f in files if f.get('name', '').startswith('backup_')]
        valid_files.sort(key=lambda x: x['name'], reverse=True) # Más recientes primero
        
        return valid_files
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{filename}/download")
def get_backup_download_url(filename: str):
    """
    Genera una Signed URL válida por 60 segundos para descargar el backup solicitado.
    """
    try:
        supabase = get_supabase_client()
        # Generar una presigned URL temporal (60 segundos)
        res = supabase.storage.from_("backups").create_signed_url(filename, 60)
        
        if not res.get("signedURL"):
            raise HTTPException(status_code=404, detail="No se pudo generar el link.")
            
        return {"url": res["signedURL"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
