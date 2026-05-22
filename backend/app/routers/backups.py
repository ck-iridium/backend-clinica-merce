import os
from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
from supabase import create_client, Client
from ..database import get_db, current_tenant_var
from sqlalchemy.orm import Session
from .. import models

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
def list_backups(db: Session = Depends(get_db)):
    """
    Lista los backups disponibles en el bucket 'backups' pertenecientes al inquilino actual.
    """
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            import logging
            logging.error("Seguridad: Intento de listar backups sin tenant_id en el contexto")
            raise HTTPException(status_code=400, detail="No autorizado. Inquilino no identificado.")

        tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Inquilino no encontrado.")

        supabase = get_supabase_client()
        files = supabase.storage.from_("backups").list()
        
        prefix = f"backup_{tenant.slug}_"
        valid_files = [f for f in files if f.get('name', '').startswith(prefix)]
        valid_files.sort(key=lambda x: x['name'], reverse=True) # Más recientes primero
        
        return valid_files
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{filename}/download")
def get_backup_download_url(filename: str, db: Session = Depends(get_db)):
    """
    Genera una Signed URL válida por 60 segundos para descargar el backup solicitado.
    Valida de forma estricta que el archivo pertenezca al inquilino del contexto actual.
    """
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            import logging
            logging.error("Seguridad: Intento de descargar backup sin tenant_id en el contexto")
            raise HTTPException(status_code=400, detail="No autorizado. Inquilino no identificado.")

        tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
        if not tenant:
            raise HTTPException(status_code=404, detail="Inquilino no encontrado.")

        prefix = f"backup_{tenant.slug}_"
        if not filename.startswith(prefix):
            import logging
            logging.error(f"Seguridad: Intento de acceso cruzado por tenant_id={tenant_id} al archivo {filename}")
            raise HTTPException(status_code=403, detail="No autorizado para descargar este archivo.")

        supabase = get_supabase_client()
        # Generar una presigned URL temporal (60 segundos)
        res = supabase.storage.from_("backups").create_signed_url(filename, 60)
        
        if not res.get("signedURL"):
            raise HTTPException(status_code=404, detail="No se pudo generar el link.")
            
        return {"url": res["signedURL"]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
