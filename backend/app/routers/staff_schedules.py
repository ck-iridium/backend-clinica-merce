from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import schemas
from ..crud import staff_schedules as crud_staff_schedules
from ..database import get_db

router = APIRouter(
    prefix="/staff-schedules",
    tags=["staff-schedules"]
)

@router.get("/", response_model=List[schemas.StaffScheduleResponse])
def read_staff_schedules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_staff_schedules.get_staff_schedules(db, skip=skip, limit=limit)

@router.get("/{schedule_id}", response_model=schemas.StaffScheduleResponse)
def read_staff_schedule(schedule_id: str, db: Session = Depends(get_db)):
    db_sched = crud_staff_schedules.get_staff_schedule(db, schedule_id=schedule_id)
    if not db_sched:
        raise HTTPException(status_code=404, detail="Staff schedule not found")
    return db_sched

@router.post("/", response_model=schemas.StaffScheduleResponse)
def create_staff_schedule(schedule: schemas.StaffScheduleCreate, db: Session = Depends(get_db)):
    return crud_staff_schedules.create_staff_schedule(db=db, schedule_in=schedule)

@router.put("/{schedule_id}", response_model=schemas.StaffScheduleResponse)
def update_staff_schedule(schedule_id: str, schedule: schemas.StaffScheduleUpdate, db: Session = Depends(get_db)):
    db_sched = crud_staff_schedules.update_staff_schedule(db=db, schedule_id=schedule_id, schedule_in=schedule)
    if not db_sched:
        raise HTTPException(status_code=404, detail="Staff schedule not found")
    return db_sched

@router.delete("/{schedule_id}")
def delete_staff_schedule(schedule_id: str, db: Session = Depends(get_db)):
    db_sched = crud_staff_schedules.delete_staff_schedule(db=db, schedule_id=schedule_id)
    if not db_sched:
        raise HTTPException(status_code=404, detail="Staff schedule not found")
    return {"status": "success"}
