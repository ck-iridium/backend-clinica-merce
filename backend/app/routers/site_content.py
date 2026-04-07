from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import crud, schemas, database

router = APIRouter(
    prefix="/site-content",
    tags=["site-content"],
)

@router.get("/", response_model=schemas.SiteContentResponse)
def get_site_content(db: Session = Depends(database.get_db)):
    return crud.get_site_content(db)

@router.patch("/", response_model=schemas.SiteContentResponse)
def update_site_content(update_data: schemas.SiteContentUpdate, db: Session = Depends(database.get_db)):
    return crud.update_site_content(db, update_data)
