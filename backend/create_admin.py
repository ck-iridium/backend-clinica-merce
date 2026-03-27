import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import User

db = SessionLocal()
existing = db.query(User).filter(User.email == "merce@clinicamerce.com").first()
if not existing:
    admin = User(email="merce@clinicamerce.com", hashed_password="admin", role="admin")
    db.add(admin)
    db.commit()
    print("Administrador creado: merce@clinicamerce.com / admin")
else:
    print("El administrador ya existe en la base de datos.")
db.close()
