from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import io
import json
import openpyxl
from datetime import datetime
from .. import schemas, database, models, crud as monolithic_crud
from ..crud import clients as crud
from ..utils.excel_importer import extract_excel_headers_and_preview, clean_phone_number
from ..utils.formula_parser import parse_technical_history

router = APIRouter(
    prefix="/clients",
    tags=["clients"],
)

@router.post("/import-excel-preview")
async def preview_clients_excel(file: UploadFile = File(...)):
    try:
        content = await file.read()
        headers, preview = extract_excel_headers_and_preview(content, max_preview_rows=5)
        return {"headers": headers, "preview": preview}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error al leer el archivo Excel: {str(e)}")

@router.post("/import-excel")
async def import_clients_excel(
    file: UploadFile = File(...),
    mapping: str = Form(...),
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context required")

    try:
        mapping_dict = json.loads(mapping)
    except Exception:
        raise HTTPException(status_code=400, detail="Mapeo inválido (se esperaba JSON)")

    content = await file.read()
    wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
    ws = wb.active

    # Detect header row
    headers = []
    header_row_idx = 1
    for r in range(1, min(10, ws.max_row + 1)):
        row_vals = [ws.cell(r, c).value for c in range(1, ws.max_column + 1)]
        non_empty = [v for v in row_vals if v is not None and str(v).strip()]
        if len(non_empty) >= 2:
            headers = [str(v).strip() if v is not None else f"Col_{c}" for c, v in enumerate(row_vals, 1)]
            header_row_idx = r
            break

    col_index_map = {h: i + 1 for i, h in enumerate(headers)}

    def get_val(row_idx, field_key):
        mapped_col = mapping_dict.get(field_key)
        if not mapped_col or mapped_col not in col_index_map:
            return None
        c = col_index_map[mapped_col]
        return ws.cell(row_idx, c).value

    # Cache existing clients by phone and lowercase name
    existing_by_phone = {}
    existing_by_name = {}
    db_clients = db.query(models.Client).filter(models.Client.tenant_id == tenant_id).all()
    for c in db_clients:
        if c.phone:
            existing_by_phone[c.phone.strip()] = c
        if c.name:
            existing_by_name[c.name.strip().lower()] = c

    imported = 0
    updated = 0
    skipped = 0
    errors = []

    for r in range(header_row_idx + 1, ws.max_row + 1):
        try:
            name_val = get_val(r, "name")
            if not name_val or not str(name_val).strip():
                skipped += 1
                continue
            name_str = str(name_val).strip()

            phone_val = clean_phone_number(get_val(r, "phone"))
            phone2_val = clean_phone_number(get_val(r, "phone2"))
            raw_history_val = str(get_val(r, "raw_history") or "").strip()
            address_val = str(get_val(r, "address") or "").strip() or None
            gender_val = str(get_val(r, "gender") or "").strip() or None
            notes_val = str(get_val(r, "notes") or "").strip() or None
            email_val = str(get_val(r, "email") or "").strip() or None

            # Parse birth date if provided
            birth_val = get_val(r, "birth_date")
            birth_date_obj = None
            if birth_val:
                if isinstance(birth_val, datetime):
                    birth_date_obj = birth_val.date()
                else:
                    try:
                        birth_date_obj = datetime.strptime(str(birth_val).strip()[:10], "%Y-%m-%d").date()
                    except Exception:
                        try:
                            birth_date_obj = datetime.strptime(str(birth_val).strip()[:10], "%d/%m/%Y").date()
                        except Exception:
                            pass

            # Parse color formulas from raw_history
            parsed_formulas = parse_technical_history(raw_history_val) if raw_history_val else []

            # Check if client exists
            target_client = None
            if phone_val and phone_val in existing_by_phone:
                target_client = existing_by_phone[phone_val]
            elif name_str.lower() in existing_by_name:
                target_client = existing_by_name[name_str.lower()]

            if target_client:
                # Update existing
                if phone_val and not target_client.phone:
                    target_client.phone = phone_val
                if phone2_val and not target_client.secondary_phone:
                    target_client.secondary_phone = phone2_val
                if address_val and not target_client.address:
                    target_client.address = address_val
                if gender_val and not target_client.gender:
                    target_client.gender = gender_val
                if email_val and not target_client.email:
                    target_client.email = email_val
                if notes_val:
                    if target_client.notes:
                        target_client.notes = f"{target_client.notes}\n{notes_val}"
                    else:
                        target_client.notes = notes_val
                if raw_history_val:
                    target_client.raw_history = (target_client.raw_history or "") + "\n" + raw_history_val
                    # Append new parsed formulas
                    existing_formulas = list(target_client.color_formulas or [])
                    target_client.color_formulas = parsed_formulas + existing_formulas
                updated += 1
            else:
                new_client = models.Client(
                    tenant_id=tenant_id,
                    name=name_str,
                    phone=phone_val or None,
                    secondary_phone=phone2_val or None,
                    email=email_val,
                    address=address_val,
                    gender=gender_val,
                    birth_date=birth_date_obj,
                    notes=notes_val,
                    raw_history=raw_history_val or None,
                    color_formulas=parsed_formulas
                )
                db.add(new_client)
                if phone_val:
                    existing_by_phone[phone_val] = new_client
                existing_by_name[name_str.lower()] = new_client
                imported += 1

        except Exception as row_err:
            errors.append(f"Fila {r}: {str(row_err)}")

    db.commit()

    return {
        "total_rows": (ws.max_row - header_row_idx),
        "imported": imported,
        "updated": updated,
        "skipped": skipped,
        "errors": errors[:10]
    }

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

from pydantic import BaseModel
from typing import Optional

class FormulaCreate(BaseModel):
    date: Optional[str] = None
    formula: str
    notes: Optional[str] = ""

@router.post("/{client_id}/formulas")
def add_client_formula(client_id: str, formula_in: FormulaCreate, db: Session = Depends(database.get_db)):
    db_client = crud.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    from datetime import datetime
    new_date = formula_in.date or datetime.now().strftime("%d/%m/%Y")
    new_entry = {
        "date": new_date,
        "formula": formula_in.formula.strip(),
        "notes": (formula_in.notes or "").strip()
    }
    current_formulas = list(db_client.color_formulas or [])
    current_formulas.insert(0, new_entry)
    db_client.color_formulas = current_formulas
    db.commit()
    db.refresh(db_client)
    return {"status": "ok", "formulas": db_client.color_formulas}

@router.put("/{client_id}/formulas/{index}")
def update_client_formula(client_id: str, index: int, formula_in: FormulaCreate, db: Session = Depends(database.get_db)):
    db_client = crud.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    current_formulas = list(db_client.color_formulas or [])
    if index < 0 or index >= len(current_formulas):
        raise HTTPException(status_code=400, detail="Índice de histórico fuera de rango")

    current_formulas[index] = {
        "date": formula_in.date or current_formulas[index].get("date", datetime.now().strftime("%d/%m/%Y")),
        "formula": formula_in.formula.strip(),
        "notes": (formula_in.notes or "").strip()
    }
    db_client.color_formulas = current_formulas
    db.commit()
    db.refresh(db_client)
    return {"status": "ok", "formulas": db_client.color_formulas}

@router.delete("/{client_id}/formulas/{index}")
def delete_client_formula(client_id: str, index: int, db: Session = Depends(database.get_db)):
    db_client = crud.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    current_formulas = list(db_client.color_formulas or [])
    if index < 0 or index >= len(current_formulas):
        raise HTTPException(status_code=400, detail="Índice de histórico fuera de rango")

    current_formulas.pop(index)
    db_client.color_formulas = current_formulas
    db.commit()
    db.refresh(db_client)
    return {"status": "ok", "formulas": db_client.color_formulas}

@router.post("/{client_id}/reparse-history")
def reparse_client_history(client_id: str, db: Session = Depends(database.get_db)):
    db_client = crud.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")

    from ..utils.formula_parser import parse_technical_history
    if db_client.raw_history:
        db_client.color_formulas = parse_technical_history(db_client.raw_history)
        db.commit()
        db.refresh(db_client)
    return {"status": "ok", "formulas": db_client.color_formulas}

# Consents
@router.post("/{client_id}/consents", response_model=schemas.ConsentResponse)
def create_client_consent(client_id: str, consent: schemas.ConsentCreate, db: Session = Depends(database.get_db)):
    # Verify client exists
    db_client = crud.get_client(db, client_id=client_id)
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Force client_id to match path
    consent.client_id = client_id
    return monolithic_crud.create_consent(db=db, consent=consent)

@router.get("/{client_id}/consents", response_model=List[schemas.ConsentResponse])
def read_client_consents(client_id: str, db: Session = Depends(database.get_db)):
    return monolithic_crud.get_consents_by_client(db, client_id=client_id)

@router.get("/{client_id}/consents/{consent_id}", response_model=schemas.ConsentResponse)
def read_single_consent(client_id: str, consent_id: str, db: Session = Depends(database.get_db)):
    db_consent = monolithic_crud.get_consent(db, consent_id=consent_id)
    if not db_consent or db_consent.client_id != client_id:
        raise HTTPException(status_code=404, detail="Consent not found")
    return db_consent

@router.delete("/{client_id}/consents/{consent_id}")
def delete_client_consent(client_id: str, consent_id: str, db: Session = Depends(database.get_db)):
    success = monolithic_crud.delete_consent(db, consent_id=consent_id, client_id=client_id)
    if not success:
        raise HTTPException(status_code=404, detail="Consent not found or unauthorized")
    return {"message": "Consent deleted successfully", "id": consent_id}
