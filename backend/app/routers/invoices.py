from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/invoices",
    tags=["invoices"],
)

@router.post("/", response_model=schemas.InvoiceResponse)
def create_invoice(invoice: schemas.InvoiceCreate, db: Session = Depends(database.get_db)):
    return crud.create_invoice(db=db, invoice=invoice)

@router.get("/", response_model=List[schemas.InvoiceResponse])
def read_invoices(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_invoices(db, skip=skip, limit=limit)
