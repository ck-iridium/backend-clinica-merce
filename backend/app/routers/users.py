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

