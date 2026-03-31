from fastapi import APIRouter, Depends, HTTPException, Query, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List
from datetime import date as DateType
from .. import crud, schemas, database

router = APIRouter(
    prefix="/appointments",
    tags=["appointments"],
)

# ─── Public endpoints (must be defined BEFORE /{appointment_id} catch-all) ───

@router.get("/availability", response_model=schemas.AvailabilityResponse)
def get_availability(
    date: str = Query(..., description="Target date in YYYY-MM-DD format"),
    service_id: str = Query(..., description="Service UUID"),
    db: Session = Depends(database.get_db),
):
    """
    Returns the list of available time slots for a given date and service.
    Used by the public landing booking widget.
    """
    try:
        target = DateType.fromisoformat(date)
    except ValueError:
        raise HTTPException(status_code=422, detail="date must be YYYY-MM-DD")

    slots = crud.get_availability_slots(db, target_date=target, service_id=service_id)
    return schemas.AvailabilityResponse(
        date=date,
        service_id=service_id,
        available_slots=slots,
    )


@router.post("/public", response_model=schemas.PublicBookingResponse, status_code=201)
def public_booking(booking: schemas.PublicBookingRequest, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    """
    Landing page booking endpoint.
    - Finds or creates the client (deduplication by email / phone).
    - Creates the appointment with status='web_pending'.
    """
    if not booking.client_email and not booking.client_phone:
        raise HTTPException(
            status_code=422,
            detail="Provide at least one of: client_email, client_phone"
        )
    try:
        appt, client, is_new = crud.create_public_appointment(db, booking, background_tasks=background_tasks)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    return schemas.PublicBookingResponse(
        appointment_id=appt.id,
        client_id=client.id,
        is_new_client=is_new,
        start_time=appt.start_time,
        end_time=appt.end_time,
        status=appt.status,
    )


# ─── Internal CRUD endpoints ────────────────────────────────────────────────

@router.post("/", response_model=schemas.AppointmentResponse)
def create_appointment(appointment: schemas.AppointmentCreate, db: Session = Depends(database.get_db)):
    try:
        return crud.create_appointment(db=db, appointment=appointment)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[schemas.AppointmentResponse])
def read_appointments(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_appointments(db, skip=skip, limit=limit)

@router.patch("/{appointment_id}", response_model=schemas.AppointmentResponse)
def update_appointment(appointment_id: str, appointment_update: schemas.AppointmentUpdate, background_tasks: BackgroundTasks, db: Session = Depends(database.get_db)):
    try:
        db_appointment = crud.update_appointment(db, appointment_id=appointment_id, appointment=appointment_update, background_tasks=background_tasks)
        if db_appointment is None:
            raise HTTPException(status_code=404, detail="Appointment not found")
        return db_appointment
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{appointment_id}")
def delete_appointment(appointment_id: str, db: Session = Depends(database.get_db)):
    db_appointment = crud.delete_appointment(db, appointment_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return {"ok": True}
