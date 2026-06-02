from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from .. import schemas, database
from ..crud import consent_templates as crud

router = APIRouter(
    prefix="/consent-templates",
    tags=["consent-templates"],
)

@router.get("/", response_model=List[schemas.ConsentTemplateResponse])
def read_consent_templates(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_consent_templates(db, skip=skip, limit=limit)

@router.get("/{template_id}", response_model=schemas.ConsentTemplateResponse)
def read_consent_template(template_id: str, db: Session = Depends(database.get_db)):
    db_template = crud.get_consent_template(db, template_id=template_id)
    if not db_template:
        raise HTTPException(status_code=404, detail="Consent template not found")
    return db_template

@router.post("/", response_model=schemas.ConsentTemplateResponse, status_code=status.HTTP_201_CREATED)
def create_consent_template(template: schemas.ConsentTemplateCreate, db: Session = Depends(database.get_db)):
    return crud.create_consent_template(db, template=template)

@router.put("/{template_id}", response_model=schemas.ConsentTemplateResponse)
def update_consent_template(template_id: str, template_update: schemas.ConsentTemplateUpdate, db: Session = Depends(database.get_db)):
    db_template = crud.update_consent_template(db, template_id=template_id, template_update=template_update)
    if not db_template:
        raise HTTPException(status_code=404, detail="Consent template not found")
    return db_template

@router.delete("/{template_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_consent_template(template_id: str, db: Session = Depends(database.get_db)):
    success = crud.delete_consent_template(db, template_id=template_id)
    if not success:
        raise HTTPException(status_code=404, detail="Consent template not found")
    return None
