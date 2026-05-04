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

from typing import List, Optional

@router.get("/", response_model=schemas.PaginatedInvoicesResponse)
def read_invoices(
    page: int = 1,
    limit: int = 10,
    status: str = "all",
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    return crud.get_invoices(
        db=db,
        page=page,
        limit=limit,
        status=status,
        start_date=start_date,
        end_date=end_date,
        search=search
    )

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
