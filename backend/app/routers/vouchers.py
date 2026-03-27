from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/vouchers",
    tags=["vouchers"],
)

@router.post("/", response_model=schemas.VoucherResponse)
def create_voucher(voucher: schemas.VoucherCreate, db: Session = Depends(database.get_db)):
    return crud.create_voucher(db=db, voucher=voucher)

@router.get("/", response_model=List[schemas.VoucherResponse])
def read_vouchers(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_vouchers(db, skip=skip, limit=limit)
