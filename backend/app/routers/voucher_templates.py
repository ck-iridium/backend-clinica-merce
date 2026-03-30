from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, database

router = APIRouter(
    prefix="/voucher_templates",
    tags=["voucher_templates"],
)

@router.get("/", response_model=List[schemas.VoucherTemplateResponse])
def read_voucher_templates(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_voucher_templates(db, skip=skip, limit=limit)

@router.get("/{template_id}", response_model=schemas.VoucherTemplateResponse)
def read_voucher_template(template_id: str, db: Session = Depends(database.get_db)):
    db_template = crud.get_voucher_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template

@router.post("/", response_model=schemas.VoucherTemplateResponse)
def create_voucher_template(template: schemas.VoucherTemplateCreate, db: Session = Depends(database.get_db)):
    # Verify service exists
    service = crud.get_service(db, service_id=template.service_id)
    if not service:
        raise HTTPException(status_code=404, detail="Service not found for this template")
    
    return crud.create_voucher_template(db=db, template=template)

@router.delete("/{template_id}", response_model=schemas.VoucherTemplateResponse)
def delete_voucher_template(template_id: str, db: Session = Depends(database.get_db)):
    db_template = crud.delete_voucher_template(db, template_id=template_id)
    if db_template is None:
        raise HTTPException(status_code=404, detail="Template not found")
    return db_template
