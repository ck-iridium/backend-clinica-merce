import uuid
import unicodedata
import re
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import current_tenant_var

def slugify(value: str) -> str:
    if not value:
        return ""
    value = str(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')

def generate_unique_location_slug(db: Session, tenant_id: str, base_name: str, location_id: str = None) -> str:
    base_slug = slugify(base_name) or "sede"
    slug = base_slug
    counter = 1
    while True:
        q = db.query(models.Location).filter(
            models.Location.tenant_id == tenant_id,
            models.Location.slug == slug
        )
        if location_id:
            q = q.filter(models.Location.id != location_id)
        if not q.first():
            return slug
        counter += 1
        slug = f"{base_slug}-{counter}"

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

def get_location_by_slug(db: Session, slug: str):
    tenant_id = current_tenant_var.get()
    loc = db.query(models.Location).filter(
        models.Location.slug == slug,
        models.Location.tenant_id == tenant_id
    ).first()
    if not loc:
        # Fallback to ID for legacy links
        loc = db.query(models.Location).filter(
            models.Location.id == slug,
            models.Location.tenant_id == tenant_id
        ).first()
    return loc

def create_location(db: Session, location_in: schemas.LocationCreate):
    tenant_id = current_tenant_var.get()
    
    slug_source = location_in.slug if location_in.slug else location_in.name
    final_slug = generate_unique_location_slug(db, tenant_id, slug_source)

    db_loc = models.Location(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        name=location_in.name,
        slug=final_slug,
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
        update_dict = location_in.model_dump(exclude_unset=True)
        if "slug" in update_dict and update_dict["slug"]:
            update_dict["slug"] = generate_unique_location_slug(db, tenant_id, update_dict["slug"], location_id=location_id)
        elif "name" in update_dict and not db_loc.slug:
            update_dict["slug"] = generate_unique_location_slug(db, tenant_id, update_dict["name"], location_id=location_id)

        for k, v in update_dict.items():
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

# --- Recursos / Cabinas Físicas ---
def get_location_resources(db: Session, location_id: str):
    tenant_id = current_tenant_var.get()
    return db.query(models.LocationResource).filter(
        models.LocationResource.tenant_id == tenant_id,
        models.LocationResource.location_id == location_id
    ).order_by(models.LocationResource.name).all()

def get_all_tenant_resources(db: Session):
    tenant_id = current_tenant_var.get()
    return db.query(models.LocationResource).filter(
        models.LocationResource.tenant_id == tenant_id
    ).order_by(models.LocationResource.name).all()

def create_location_resource(db: Session, location_id: str, resource_in: schemas.LocationResourceCreate):
    tenant_id = current_tenant_var.get()
    db_res = models.LocationResource(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        location_id=location_id,
        name=resource_in.name,
        quantity=resource_in.quantity if resource_in.quantity and resource_in.quantity > 0 else 1,
        is_active=resource_in.is_active
    )
    db.add(db_res)
    db.commit()
    db.refresh(db_res)
    return db_res

def update_location_resource(db: Session, resource_id: str, resource_in: schemas.LocationResourceUpdate):
    tenant_id = current_tenant_var.get()
    db_res = db.query(models.LocationResource).filter(
        models.LocationResource.id == resource_id,
        models.LocationResource.tenant_id == tenant_id
    ).first()
    if db_res:
        update_dict = resource_in.model_dump(exclude_unset=True)
        for k, v in update_dict.items():
            setattr(db_res, k, v)
        db.commit()
        db.refresh(db_res)
    return db_res

def delete_location_resource(db: Session, resource_id: str):
    tenant_id = current_tenant_var.get()
    db_res = db.query(models.LocationResource).filter(
        models.LocationResource.id == resource_id,
        models.LocationResource.tenant_id == tenant_id
    ).first()
    if db_res:
        db.delete(db_res)
        db.commit()
        return True
    return False
