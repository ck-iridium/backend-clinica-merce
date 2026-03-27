from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import database, models
from pydantic import BaseModel

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
    if not user or user.hashed_password != request.password:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas")
    return {"id": user.id, "email": user.email, "role": user.role}

@router.get("/me")
def read_user_me():
    return {"email": "merce@clinicamerce.com", "role": "admin"}
