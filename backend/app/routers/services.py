from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

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
