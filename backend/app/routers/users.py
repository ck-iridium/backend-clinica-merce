from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models
from pydantic import BaseModel
from passlib.context import CryptContext
from typing import List

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

router = APIRouter(
    prefix="/users",
    tags=["users"],
)

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(database.get_db)):
    user = db.query(models.User).filter(models.User.email == request.email).first()
    if not user or not pwd_context.verify(request.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"id": user.id, "email": user.email, "role": user.role}

@router.get("/me")
def read_user_me():
    return {"email": "merce@clinicamerce.com", "role": "admin"}

@router.get("/specialists", response_model=List[dict])
def get_specialists(db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    profiles = db.query(models.Profile).filter(
        models.Profile.tenant_id == tenant_id,
        models.Profile.role.in_(["specialist", "especialista", "admin", "administrador", "Administrador", "Especialista"])
    ).all()
    return [{"id": p.id, "full_name": p.full_name or p.email, "email": p.email, "role": p.role, "avatar_url": p.avatar_url} for p in profiles]


class TeamInvitationRequest(BaseModel):
    email: str
    full_name: str
    role: str
    tenant_id: str
    invite_url: str


@router.post("/send-team-invitation")
def send_team_invitation(request: TeamInvitationRequest, db: Session = Depends(database.get_db)):
    from ..utils import mailer

    clinic_settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == request.tenant_id).first()
    tenant = db.query(models.Tenant).filter(models.Tenant.id == request.tenant_id).first()
    clinic_name = (clinic_settings.clinic_name if clinic_settings and clinic_settings.clinic_name else None) or (tenant.name if tenant else "ProBookia")

    sent = mailer.send_team_invitation_email(
        to_email=request.email.strip().lower(),
        full_name=request.full_name.strip(),
        role=request.role.strip(),
        clinic_name=clinic_name,
        invite_url=request.invite_url.strip(),
        settings=clinic_settings
    )
    return {"success": sent, "clinic_name": clinic_name}


