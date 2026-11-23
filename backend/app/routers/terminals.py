import secrets
import hashlib
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, Request, Cookie
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import desc

from .. import database, models

router = APIRouter(
    prefix="/terminals",
    tags=["terminals"],
)

class TerminalAuthorizeRequest(BaseModel):
    device_name: str
    browser_info: Optional[str] = None

class ToggleRestrictionRequest(BaseModel):
    enabled: bool

class TerminalItemResponse(BaseModel):
    id: str
    device_name: str
    ip_address: Optional[str] = None
    browser_info: Optional[str] = None
    is_active: bool
    last_seen_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


def get_terminal_token_from_request(
    request: Request,
    x_terminal_token: Optional[str] = Header(None, alias="X-Terminal-Token"),
    cookie_token: Optional[str] = Cookie(None, alias="probookia_terminal_token"),
) -> Optional[str]:
    if x_terminal_token and x_terminal_token.strip():
        return x_terminal_token.strip()
    if cookie_token and cookie_token.strip():
        return cookie_token.strip()
    return None


@router.get("/status")
def get_terminal_status(
    request: Request,
    db: Session = Depends(database.get_db),
    x_terminal_token: Optional[str] = Header(None, alias="X-Terminal-Token"),
    probookia_terminal_token: Optional[str] = Cookie(None)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        return {"restriction_enabled": False, "is_authorized": True, "terminal": None}

    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    restriction_enabled = bool(getattr(settings, "require_authorized_device", False))

    token = x_terminal_token or probookia_terminal_token
    is_authorized = False
    terminal_info = None

    if token:
        token_hash = hashlib.sha256(token.strip().encode("utf-8")).hexdigest()
        terminal = db.query(models.AuthorizedTerminal).filter(
            models.AuthorizedTerminal.tenant_id == tenant_id,
            models.AuthorizedTerminal.token_hash == token_hash,
            models.AuthorizedTerminal.is_active == True
        ).first()

        if terminal:
            is_authorized = True
            terminal.last_seen_at = datetime.utcnow()
            try:
                db.commit()
            except Exception:
                db.rollback()

            terminal_info = {
                "id": terminal.id,
                "device_name": terminal.device_name,
                "browser_info": terminal.browser_info,
                "last_seen_at": terminal.last_seen_at.isoformat() if terminal.last_seen_at else None
            }

    # Si la restricción no está activa, cualquier terminal opera normalmente
    # pero informamos si el equipo ya está o no homologado
    return {
        "restriction_enabled": restriction_enabled,
        "is_authorized": is_authorized if restriction_enabled else True,
        "is_device_registered": is_authorized,
        "terminal": terminal_info
    }


@router.get("/", response_model=List[TerminalItemResponse])
def list_terminals(db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    terminals = db.query(models.AuthorizedTerminal).filter(
        models.AuthorizedTerminal.tenant_id == tenant_id
    ).order_by(desc(models.AuthorizedTerminal.created_at)).all()

    return terminals


@router.post("/authorize")
def authorize_current_terminal(
    payload: TerminalAuthorizeRequest,
    request: Request,
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    device_name = payload.device_name.strip()
    if not device_name:
        device_name = "Terminal Mostrador"

    raw_token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(raw_token.encode("utf-8")).hexdigest()

    client_ip = request.headers.get("x-forwarded-for") or (request.client.host if request.client else None)
    if client_ip and "," in client_ip:
        client_ip = client_ip.split(",")[0].strip()

    terminal = models.AuthorizedTerminal(
        tenant_id=tenant_id,
        device_name=device_name,
        token_hash=token_hash,
        ip_address=client_ip,
        browser_info=payload.browser_info or request.headers.get("user-agent"),
        is_active=True,
        last_seen_at=datetime.utcnow()
    )

    db.add(terminal)
    db.commit()
    db.refresh(terminal)

    return {
        "status": "ok",
        "terminal_token": raw_token,
        "terminal": {
            "id": terminal.id,
            "device_name": terminal.device_name,
            "browser_info": terminal.browser_info,
            "created_at": terminal.created_at.isoformat() if terminal.created_at else None
        }
    }


@router.delete("/{terminal_id}")
def revoke_terminal(
    terminal_id: str,
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    terminal = db.query(models.AuthorizedTerminal).filter(
        models.AuthorizedTerminal.id == terminal_id,
        models.AuthorizedTerminal.tenant_id == tenant_id
    ).first()

    if not terminal:
        raise HTTPException(status_code=404, detail="Terminal no encontrado")

    db.delete(terminal)
    db.commit()

    return {"status": "ok", "deleted_id": terminal_id}


@router.post("/toggle-restriction")
def toggle_restriction(
    payload: ToggleRestrictionRequest,
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant context missing")

    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    if not settings:
        raise HTTPException(status_code=404, detail="Configuración no encontrada")

    # Si se va a activar la restricción, verificar que exista al menos un terminal autorizado
    if payload.enabled:
        active_count = db.query(models.AuthorizedTerminal).filter(
            models.AuthorizedTerminal.tenant_id == tenant_id,
            models.AuthorizedTerminal.is_active == True
        ).count()
        if active_count == 0:
            raise HTTPException(
                status_code=400,
                detail="Debes autorizar al menos un ordenador o terminal antes de activar el bloqueo obligatorio."
            )

    settings.require_authorized_device = payload.enabled
    db.commit()

    return {"status": "ok", "require_authorized_device": payload.enabled}
