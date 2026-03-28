from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/appointments",
    tags=["appointments"],
)

@router.post("/", response_model=schemas.AppointmentResponse)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(database.get_db)):
    return crud.create_appointment(db=db, appointment=appointment)

@router.get("/", response_model=List[schemas.AppointmentResponse])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_appointments(db, skip=skip, limit=limit)

@router.patch("/{appointment_id}", response_model=schemas.AppointmentResponse)
def update_appointment(appointment_id: str, appointment_update: schemas.AppointmentUpdate, db: Session = Depends(database.get_db)):
    db_appointment = crud.update_appointment(db, appointment_id=appointment_id, appointment=appointment_update)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return db_appointment

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: str, db: Session = Depends(database.get_db)):
    db_appointment = crud.delete_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"ok": True}
