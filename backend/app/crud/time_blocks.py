from sqlalchemy.orm import Session
import uuid
from .. import models, schemas

# --- Time Blocks CRUD ---

def get_time_blocks(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.TimeBlock).offset(skip).limit(limit).all()

def create_time_block(db: Session, block_in: schemas.TimeBlockCreate):
    db_block = models.TimeBlock(
        id=str(uuid.uuid4()),
        start_time=block_in.start_time,
        end_time=block_in.end_time,
        reason=block_in.reason
    )
    db.add(db_block)
    db.commit()
    db.refresh(db_block)
    return db_block

def delete_time_block(db: Session, block_id: str):
    db_block = db.query(models.TimeBlock).filter(models.TimeBlock.id == block_id).first()
    if db_block:
        db.delete(db_block)
        db.commit()
    return db_block
