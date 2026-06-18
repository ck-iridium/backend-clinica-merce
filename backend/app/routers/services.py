from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, database, models
from ..crud import services as crud
import os
from supabase import create_client, Client

from ..limits import check_service_limit

router = APIRouter(
    prefix="/services",
    tags=["services"],
)

@router.post("/", response_model=schemas.ServiceResponse)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(database.get_db)):
    check_service_limit(db)
    return crud.create_service(db=db, service=service)

@router.get("/", response_model=List[schemas.ServiceResponse])
def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_services(db, skip=skip, limit=limit)

@router.get("/{service_id}", response_model=schemas.ServiceResponse)
def read_service(service_id: str, db: Session = Depends(database.get_db)):
    db_service = crud.get_service(db, service_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.get("/slug/{slug}", response_model=schemas.ServiceResponse)
def read_service_by_slug(slug: str, db: Session = Depends(database.get_db)):
    db_service = crud.get_service_by_slug(db, slug=slug)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.patch("/{service_id}", response_model=schemas.ServiceResponse)
def update_service(service_id: str, service_update: schemas.ServiceUpdate, db: Session = Depends(database.get_db)):
    db_service = crud.update_service(db, service_id=service_id, service=service_update)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.delete("/{service_id}")
def delete_service(service_id: str, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    service = db.query(models.Service).filter(
        models.Service.id == service_id,
        models.Service.tenant_id == tenant_id
    ).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
        
    has_appointments = db.query(models.Appointment).filter(models.Appointment.service_id == service_id).first()
    has_vouchers = db.query(models.Voucher).filter(models.Voucher.service_id == service_id).first()
    has_templates = db.query(models.VoucherTemplate).filter(models.VoucherTemplate.service_id == service_id).first()
    
    if has_appointments or has_vouchers or has_templates:
        raise HTTPException(
            status_code=409, 
            detail="No se puede eliminar porque tiene citas o bonos asociados. Apaga el interruptor 'Servicio Activo' para ocultarlo en su lugar."
        )
        
    if service.image_url:
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if supabase_url and supabase_key:
            try:
                supabase: Client = create_client(supabase_url, supabase_key)
                filename = service.image_url.split('/')[-1]
                supabase.storage.from_("media").remove([filename])
            except Exception as e:
                pass
                
    db.delete(service)
    db.commit()
    return {"message": "Servicio eliminado con éxito"}


@router.post("/bulk-delete")
def bulk_delete_services(payload: schemas.BulkActionPayload, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    service_ids = payload.ids
    
    # 1. Obtener los servicios que pertenecen a este tenant
    services = db.query(models.Service).filter(
        models.Service.id.in_(service_ids),
        models.Service.tenant_id == tenant_id
    ).all()
    
    if not services:
        return {"message": "No se encontraron servicios para eliminar"}
        
    actual_ids = [s.id for s in services]
    
    # 2. Comprobar referencias
    has_appointments = db.query(models.Appointment).filter(models.Appointment.service_id.in_(actual_ids)).first()
    has_vouchers = db.query(models.Voucher).filter(models.Voucher.service_id.in_(actual_ids)).first()
    has_templates = db.query(models.VoucherTemplate).filter(models.VoucherTemplate.service_id.in_(actual_ids)).first()
    
    if has_appointments or has_vouchers or has_templates:
        raise HTTPException(
            status_code=409, 
            detail="Uno o varios servicios no pueden eliminarse porque tienen citas o bonos asociados. Por favor, desactiva su interruptor 'Activo' en su lugar."
        )
        
    # 3. Eliminar imágenes de Supabase Storage en bulk si aplica
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if supabase_url and supabase_key:
        try:
            supabase: Client = create_client(supabase_url, supabase_key)
            filenames = []
            for service in services:
                if service.image_url:
                    filename = service.image_url.split('/')[-1]
                    filenames.append(filename)
            if filenames:
                supabase.storage.from_("media").remove(filenames)
        except Exception:
            pass
            
    # 4. Eliminar los servicios
    deleted_count = db.query(models.Service).filter(
        models.Service.id.in_(actual_ids),
        models.Service.tenant_id == tenant_id
    ).delete(synchronize_session=False)
    
    db.commit()
    return {"message": f"{deleted_count} servicios eliminados con éxito"}


@router.post("/bulk-status")
def bulk_status_services(payload: schemas.BulkStatusPayload, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    service_ids = payload.ids
    is_active = payload.is_active
    
    updated_count = db.query(models.Service).filter(
        models.Service.id.in_(service_ids),
        models.Service.tenant_id == tenant_id
    ).update({models.Service.is_active: is_active}, synchronize_session=False)
    
    db.commit()
    return {"message": f"Estado de {updated_count} servicios actualizado con éxito"}


@router.post("/export-to-media")
def export_services_to_media(db: Session = Depends(database.get_db)):
    """Exports the current tenant's services to a CSV file and saves it in their Media Gallery."""
    import csv
    import io
    import uuid
    import datetime
    
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context required")
        
    # Check plan limit for exporting/generating documents
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    plan = (tenant.plan_type or "free").lower() if tenant else "free"
    
    # Check BYOK (own API keys) in settings
    has_own_key = False
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    if settings and (settings.gemini_api_key or settings.openai_api_key):
        has_own_key = True
        
    if not (plan in ["pro", "gold"] or has_own_key):
        raise HTTPException(
            status_code=403, 
            detail="La exportación de servicios a la galería está reservada para los planes Pro y Gold. Por favor, actualice su plan."
        )

    # Get all services for current tenant
    services = db.query(models.Service).filter(models.Service.tenant_id == tenant_id).all()
    
    # Generate CSV in memory
    output = io.StringIO()
    # Add BOM for Excel compatibility in Spanish/European locales
    output.write('\ufeff')
    writer = csv.writer(output, delimiter=';', quotechar='"', quoting=csv.QUOTE_MINIMAL)
    
    # Header
    writer.writerow([
        "ID", "Nombre", "Categoría", "Descripción", "Duración (min)", 
        "Precio (€)", "Activo", "Destacado", "URL Imagen", "URL Vídeo",
        "Modo de Atención", "Requiere Depósito", "Monto Depósito"
    ])
    
    for s in services:
        category_name = s.category.name if s.category else ""
        writer.writerow([
            s.id,
            s.name,
            category_name,
            s.description or "",
            s.duration_minutes,
            s.price,
            "Sí" if s.is_active else "No",
            "Sí" if s.is_featured else "No",
            s.image_url or "",
            s.video_url or "",
            s.allowed_modality,
            "Sí" if s.requires_deposit else "No",
            s.deposit_amount or 0.00
        ])
        
    csv_content = output.getvalue()
    csv_bytes = csv_content.encode('utf-8-sig')
    
    # Upload to Supabase Storage in bucket 'media'
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Configuración de Supabase no encontrada")
        
    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        # Create a safe, unique filename
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"servicios_{timestamp}_{uuid.uuid4().hex[:6]}.csv"
        
        # Upload
        supabase.storage.from_("media").upload(
            file=csv_bytes,
            path=filename,
            file_options={"content-type": "text/csv", "upsert": "true"}
        )
        
        # Get public url
        public_url = supabase.storage.from_("media").get_public_url(filename)
        
        # Register in models.Media
        new_media = models.Media(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            filename=filename,
            url=public_url,
            file_type="document",
            mime_type="text/csv",
            size=len(csv_bytes)
        )
        db.add(new_media)
        db.commit()
        
        return {
            "success": True,
            "filename": filename,
            "url": public_url,
            "message": "Los servicios han sido exportados correctamente y guardados en la Galería de Medios."
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error al exportar servicios: {str(e)}")
