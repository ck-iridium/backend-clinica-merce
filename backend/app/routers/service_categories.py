from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/service-categories",
    tags=["service-categories"],
)

@router.post("/", response_model=schemas.ServiceCategoryResponse)
def create_service_category(category: schemas.ServiceCategoryCreate, db: Session = Depends(database.get_db)):
    return crud.create_service_category(db=db, category=category)

@router.patch("/{category_id}", response_model=schemas.ServiceCategoryResponse)
def update_service_category(category_id: str, category: schemas.ServiceCategoryUpdate, db: Session = Depends(database.get_db)):
    db_category = crud.update_service_category(db, category_id=category_id, category=category)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Service Category not found")
    return db_category

@router.get("/", response_model=List[schemas.ServiceCategoryResponse])
def read_service_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_service_categories(db, skip=skip, limit=limit)

@router.delete("/{category_id}", response_model=schemas.ServiceCategoryResponse)
def delete_service_category(category_id: str, db: Session = Depends(database.get_db)):
    db_category = crud.delete_service_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Service Category not found")
    return db_category
