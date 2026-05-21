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
            existing.name = client.name
            if client.phone:
                existing.phone = client.phone
            db.commit()
            db.refresh(existing)
            return existing

    client_dict = client.model_dump()
    client_dict["tenant_id"] = tenant_id
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
        client = models.Client(
            id=str(uuid.uuid4()),
            name=name,
            email=email.strip().lower() if email else f"web_{str(uuid.uuid4())[:8]}@web.local",
            phone=phone.strip() if phone else None,
            tenant_id=tenant_id
        )
        db.add(client)
        db.flush()  # get the id without committing yet

    return client, is_new
