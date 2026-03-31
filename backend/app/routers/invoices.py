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

@router.get("/{invoice_id}", response_model=schemas.InvoiceResponse)
def read_invoice(invoice_id: str, db: Session = Depends(database.get_db)):
    db_invoice = crud.get_invoice(db, invoice_id=invoice_id)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@router.patch("/{invoice_id}", response_model=schemas.InvoiceResponse)
def update_invoice(invoice_id: str, invoice_update: schemas.InvoiceUpdate, db: Session = Depends(database.get_db)):
    db_invoice = crud.update_invoice(db, invoice_id=invoice_id, invoice=invoice_update)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return db_invoice

@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: str, db: Session = Depends(database.get_db)):
    db_invoice = crud.delete_invoice(db, invoice_id=invoice_id)
    if db_invoice is None:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return {"ok": True}

@router.post("/direct-sale", response_model=schemas.InvoiceResponse)
def create_direct_sale(sale: schemas.DirectSaleRequest, db: Session = Depends(database.get_db)):
    try:
        return crud.create_direct_sale(db=db, sale=sale)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
