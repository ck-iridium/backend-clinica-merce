from sqlalchemy.orm import Session
import uuid
from .. import models, schemas
from ..database import current_tenant_var

def get_staff_schedules(db: Session, skip: int = 0, limit: int = 100):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.StaffSchedule)
        .filter(models.StaffSchedule.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_staff_schedule(db: Session, schedule_id: str):
    tenant_id = current_tenant_var.get()
    return db.query(models.StaffSchedule).filter(
        models.StaffSchedule.id == schedule_id,
        models.StaffSchedule.tenant_id == tenant_id
    ).first()

def create_staff_schedule(db: Session, schedule_in: schemas.StaffScheduleCreate):
    tenant_id = current_tenant_var.get()
    db_sched = models.StaffSchedule(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        staff_id=schedule_in.staff_id,
        location_id=schedule_in.location_id,
        day_of_week=schedule_in.day_of_week,
        specific_date=schedule_in.specific_date,
        start_time=schedule_in.start_time,
        end_time=schedule_in.end_time,
        is_active=schedule_in.is_active
    )
    db.add(db_sched)
    db.commit()
    db.refresh(db_sched)
    return db_sched

def update_staff_schedule(db: Session, schedule_id: str, schedule_in: schemas.StaffScheduleUpdate):
    tenant_id = current_tenant_var.get()
    db_sched = db.query(models.StaffSchedule).filter(
        models.StaffSchedule.id == schedule_id,
        models.StaffSchedule.tenant_id == tenant_id
    ).first()
    if db_sched:
        for k, v in schedule_in.model_dump(exclude_unset=True).items():
            setattr(db_sched, k, v)
        db.commit()
        db.refresh(db_sched)
    return db_sched

def delete_staff_schedule(db: Session, schedule_id: str):
    tenant_id = current_tenant_var.get()
    db_sched = db.query(models.StaffSchedule).filter(
        models.StaffSchedule.id == schedule_id,
        models.StaffSchedule.tenant_id == tenant_id
    ).first()
    if db_sched:
        db.delete(db_sched)
        db.commit()
    return db_sched
