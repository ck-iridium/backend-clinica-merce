from sqlalchemy.orm import Session
from sqlalchemy import or_
import uuid
from .. import models, schemas
from ..database import current_tenant_var

# Clients
def get_client(db: Session, client_id: str):
    return db.query(models.Client).filter(
        models.Client.id == client_id,
        models.Client.tenant_id == current_tenant_var.get()
    ).first()

def create_client(db: Session, client: schemas.ClientCreate):
    tenant_id = current_tenant_var.get()
    if client.email:
        existing = db.query(models.Client).filter(
            models.Client.email == client.email,
            models.Client.tenant_id == tenant_id
        ).first()
        if existing:
            existing.first_name = client.first_name
            existing.last_name = client.last_name
            existing.name = f"{client.first_name} {client.last_name or ''}".strip()
            if client.phone:
                existing.phone = client.phone
            
            # Map addresses and metadata if passed
            if client.service_address:
                existing.service_address = client.service_address
                existing.service_postal_code = client.service_postal_code
                existing.service_city = client.service_city
                existing.service_latitude = client.service_latitude
                existing.service_longitude = client.service_longitude
            
            if client.billing_address:
                existing.billing_name = client.billing_name
                existing.billing_nif = client.billing_nif
                existing.billing_address = client.billing_address
                existing.billing_postal_code = client.billing_postal_code
                existing.billing_city = client.billing_city
                
            if client.sector_metadata is not None:
                existing.sector_metadata = client.sector_metadata
                
            db.commit()
            db.refresh(existing)
            return existing

    client_dict = client.model_dump()
    client_dict["tenant_id"] = tenant_id
    client_dict["name"] = f"{client.first_name} {client.last_name or ''}".strip()
    
    db_client = models.Client(**client_dict)
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

def update_client(db: Session, client_id: str, client: schemas.ClientUpdate):
    db_client = db.query(models.Client).filter(
        models.Client.id == client_id,
        models.Client.tenant_id == current_tenant_var.get()
    ).first()
    if db_client:
        update_data = client.model_dump(exclude_unset=True)
        
        # If first_name or last_name is updated, update name as well
        first_name = update_data.get("first_name", db_client.first_name)
        last_name = update_data.get("last_name", db_client.last_name)
        if "first_name" in update_data or "last_name" in update_data:
            update_data["name"] = f"{first_name or ''} {last_name or ''}".strip()
            
        for key, value in update_data.items():
            setattr(db_client, key, value)
        db.commit()
        db.refresh(db_client)
    return db_client

def get_clients(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Client).filter(
        models.Client.tenant_id == current_tenant_var.get()
    ).offset(skip).limit(limit).all()

def find_or_create_client(db: Session, name: str, email: str | None, phone: str | None):
    """Look up an existing client by email OR phone. Create a new one if not found."""
    is_new = False
    client = None
    tenant_id = current_tenant_var.get()

    # Build query filters
    conditions = []
    if email:
        conditions.append(models.Client.email == email.strip().lower())
    if phone:
        phone_clean = phone.strip()
        conditions.append(models.Client.phone == phone_clean)

    if conditions:
        client = db.query(models.Client).filter(
            models.Client.tenant_id == tenant_id
        ).filter(or_(*conditions)).first()

    if not client:
        is_new = True
        parts = name.strip().split(" ", 1)
        first_name = parts[0]
        last_name = parts[1] if len(parts) > 1 else None
        
        client = models.Client(
            id=str(uuid.uuid4()),
            name=name,
            first_name=first_name,
            last_name=last_name,
            email=email.strip().lower() if email else f"web_{str(uuid.uuid4())[:8]}@web.local",
            phone=phone.strip() if phone else None,
            tenant_id=tenant_id
        )
        db.add(client)
        db.flush()  # get the id without committing yet

    return client, is_new
