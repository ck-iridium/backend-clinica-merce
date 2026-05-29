from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..crud import locations as crud_locations
from ..database import get_db

router = APIRouter(
    prefix="/locations",
    tags=["locations"]
)

@router.get("/", response_model=List[schemas.LocationResponse])
def read_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_locations.get_locations(db, skip=skip, limit=limit)

@router.get("/{location_id}", response_model=schemas.LocationResponse)
def read_location(location_id: str, db: Session = Depends(get_db)):
    db_loc = crud_locations.get_location(db, location_id=location_id)
    if not db_loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_loc

@router.post("/", response_model=schemas.LocationResponse)
def create_location(location: schemas.LocationCreate, db: Session = Depends(get_db)):
    from ..limits import check_location_limit
    check_location_limit(db)
    return crud_locations.create_location(db=db, location_in=location)

@router.put("/{location_id}", response_model=schemas.LocationResponse)
def update_location(location_id: str, location: schemas.LocationUpdate, db: Session = Depends(get_db)):
    db_loc = crud_locations.update_location(db=db, location_id=location_id, location_in=location)
    if not db_loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return db_loc

@router.delete("/{location_id}")
def delete_location(location_id: str, db: Session = Depends(get_db)):
    db_loc = crud_locations.delete_location(db=db, location_id=location_id)
    if not db_loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return {"status": "success"}
