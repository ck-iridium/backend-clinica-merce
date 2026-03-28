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

@router.patch("/{voucher_id}", response_model=schemas.VoucherResponse)
def update_voucher(voucher_id: str, voucher_update: schemas.VoucherUpdate, db: Session = Depends(database.get_db)):
    db_voucher = crud.update_voucher(db, voucher_id=voucher_id, voucher=voucher_update)
    if db_voucher is None:
        raise HTTPException(status_code=404, detail="Voucher not found")
    return db_voucher

@router.delete("/{voucher_id}")
def delete_voucher(voucher_id: str, db: Session = Depends(database.get_db)):
    db_voucher = crud.delete_voucher(db, voucher_id=voucher_id)
    if db_voucher is None:
        raise HTTPException(status_code=404, detail="Voucher not found")
    return {"ok": True}
