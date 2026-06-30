from sqlalchemy.orm import Session
import uuid
from .. import models, schemas
from ..database import current_tenant_var

def get_locations(db: Session, skip: int = 0, limit: int = 100):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.Location)
        .filter(models.Location.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_location(db: Session, location_id: str):
    tenant_id = current_tenant_var.get()
    return db.query(models.Location).filter(
        models.Location.id == location_id,
        models.Location.tenant_id == tenant_id
    ).first()

def create_location(db: Session, location_in: schemas.LocationCreate):
    tenant_id = current_tenant_var.get()
    db_loc = models.Location(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        name=location_in.name,
        address=location_in.address,
        phone=location_in.phone,
        email=location_in.email,
        is_active=location_in.is_active,
        latitude=location_in.latitude,
        longitude=location_in.longitude
    )
    db.add(db_loc)
    db.commit()
    db.refresh(db_loc)
    return db_loc

def update_location(db: Session, location_id: str, location_in: schemas.LocationUpdate):
    tenant_id = current_tenant_var.get()
    db_loc = db.query(models.Location).filter(
        models.Location.id == location_id,
        models.Location.tenant_id == tenant_id
    ).first()
    if db_loc:
        for k, v in location_in.model_dump(exclude_unset=True).items():
            setattr(db_loc, k, v)
        db.commit()
        db.refresh(db_loc)
    return db_loc

def delete_location(db: Session, location_id: str):
    tenant_id = current_tenant_var.get()
    db_loc = db.query(models.Location).filter(
        models.Location.id == location_id,
        models.Location.tenant_id == tenant_id
    ).first()
    if db_loc:
        db.delete(db_loc)
        db.commit()
    return db_loc
