from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import crud, schemas, database

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
)

@router.post("/", response_model=schemas.ClientResponse)
def create_client(client: schemas.ClientCreate, db: Session = Depends(database.get_db)):
    return crud.create_client(db=db, client=client)

@router.get("/", response_model=List[schemas.ClientResponse])
def read_clients(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    clients = crud.get_clients(db, skip=skip, limit=limit)
    return clients

@router.get("/{client_id}", response_model=schemas.ClientResponse)
def read_client(client_id: str, db: Session = Depends(database.get_db)):
    db_client = crud.get_client(db, client_id=client_id)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

@router.patch("/{client_id}", response_model=schemas.ClientResponse)
def update_client(client_id: str, client_update: schemas.ClientUpdate, db: Session = Depends(database.get_db)):
    db_client = crud.update_client(db, client_id=client_id, client=client_update)
    if db_client is None:
        raise HTTPException(status_code=404, detail="Client not found")
    return db_client

# Consents
@router.post("/{client_id}/consents", response_model=schemas.ConsentResponse)
def create_client_consent(client_id: str, consent: schemas.ConsentCreate, db: Session = Depends(database.get_db)):
    # Verify client exists
    db_client = crud.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Force client_id to match path
    consent.client_id = client_id
    return crud.create_consent(db=db, consent=consent)

@router.get("/{client_id}/consents", response_model=List[schemas.ConsentResponse])
def read_client_consents(client_id: str, db: Session = Depends(database.get_db)):
    return crud.get_consents_by_client(db, client_id=client_id)

@router.get("/{client_id}/consents/{consent_id}", response_model=schemas.ConsentResponse)
def read_single_consent(client_id: str, consent_id: str, db: Session = Depends(database.get_db)):
    db_consent = crud.get_consent(db, consent_id=consent_id)
    if not db_consent or db_consent.client_id != client_id:
        raise HTTPException(status_code=404, detail="Consent not found")
    return db_consent
