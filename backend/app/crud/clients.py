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
    existing = None
    if client.email and client.email.strip():
        existing = db.query(models.Client).filter(
            models.Client.email == client.email.strip(),
            models.Client.tenant_id == tenant_id
        ).first()
    elif client.phone and client.phone.strip():
        existing = db.query(models.Client).filter(
            models.Client.phone == client.phone.strip(),
            models.Client.tenant_id == tenant_id
        ).first()

    if existing:
        update_dict = client.model_dump(exclude_unset=True)
        if not update_dict.get("first_name") and update_dict.get("name"):
            update_dict["name"] = update_dict["name"].strip()
        elif update_dict.get("first_name"):
            update_dict["name"] = f"{update_dict.get('first_name', '')} {update_dict.get('last_name', '')}".strip()

        if update_dict.get("raw_history") and not update_dict.get("color_formulas"):
            from ..utils.formula_parser import parse_technical_history
            update_dict["color_formulas"] = parse_technical_history(update_dict["raw_history"])

        for k, v in update_dict.items():
            if v is not None and k not in ["id", "tenant_id", "user_id"]:
                setattr(existing, k, v)
        db.commit()
        db.refresh(existing)
        return existing

    client_dict = client.model_dump()
    client_dict["tenant_id"] = tenant_id
    if not client.first_name and client.name:
        client_dict["name"] = client.name.strip()
    else:
        client_dict["name"] = f"{client.first_name or ''} {client.last_name or ''}".strip() or (client.name or "")
    
    if client_dict.get("raw_history") and not client_dict.get("color_formulas"):
        from ..utils.formula_parser import parse_technical_history
        client_dict["color_formulas"] = parse_technical_history(client_dict["raw_history"])

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
            
        if update_data.get("raw_history") and not update_data.get("color_formulas"):
            from ..utils.formula_parser import parse_technical_history
            update_data["color_formulas"] = parse_technical_history(update_data["raw_history"])

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
