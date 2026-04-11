from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database, models
import os
from supabase import create_client, Client

router = APIRouter(
    prefix="/services",
    tags=["services"],
)

@router.post("/", response_model=schemas.ServiceResponse)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(database.get_db)):
    return crud.create_service(db=db, service=service)

@router.get("/", response_model=List[schemas.ServiceResponse])
def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_services(db, skip=skip, limit=limit)

@router.patch("/{service_id}", response_model=schemas.ServiceResponse)
def update_service(service_id: str, service_update: schemas.ServiceUpdate, db: Session = Depends(database.get_db)):
    db_service = crud.update_service(db, service_id=service_id, service=service_update)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service

@router.delete("/{service_id}")
def delete_service(service_id: str, db: Session = Depends(database.get_db)):
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
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
