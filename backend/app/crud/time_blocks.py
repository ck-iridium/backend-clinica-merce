from sqlalchemy.orm import Session
import uuid
from .. import models, schemas
from ..database import current_tenant_var

# --- Time Blocks CRUD ---

def get_time_blocks(db: Session, skip: int = 0, limit: int = 100):
    tenant_id = current_tenant_var.get()
    return (
        db.query(models.TimeBlock)
        .filter(models.TimeBlock.tenant_id == tenant_id)
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_time_block(db: Session, block_in: schemas.TimeBlockCreate):
    tenant_id = current_tenant_var.get()
    db_block = models.TimeBlock(
        id=str(uuid.uuid4()),
        tenant_id=tenant_id,
        start_time=block_in.start_time,
        end_time=block_in.end_time,
        reason=block_in.reason
    )
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block

def delete_time_block(db: Session, block_id: str):
    tenant_id = current_tenant_var.get()
    db_block = db.query(models.TimeBlock).filter(
        models.TimeBlock.id == block_id,
        models.TimeBlock.tenant_id == tenant_id
    ).first()
    if db_block:
        db.delete(db_block)
        db.commit()
    return db_block
