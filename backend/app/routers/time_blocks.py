from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, models
from ..database import get_db

router = APIRouter(
    prefix="/time-blocks",
    tags=["time-blocks"]
)

@router.get("/", response_model=List[schemas.TimeBlockResponse])
def read_time_blocks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_time_blocks(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.TimeBlockResponse)
def create_time_block(block: schemas.TimeBlockCreate, db: Session = Depends(get_db)):
    db_block = crud.create_time_block(db=db, block_in=block)
    from ..database import current_tenant_var
    from ..crud.appointments import rebuild_blocked_days_cache
    rebuild_blocked_days_cache(db, current_tenant_var.get())
    return db_block

@router.delete("/{block_id}")
def delete_time_block(block_id: str, db: Session = Depends(get_db)):
    db_block = crud.delete_time_block(db=db, block_id=block_id)
    if not db_block:
        raise HTTPException(status_code=404, detail="Time block not found")
    from ..database import current_tenant_var
    from ..crud.appointments import rebuild_blocked_days_cache
    rebuild_blocked_days_cache(db, current_tenant_var.get())
    return {"status": "success"}
