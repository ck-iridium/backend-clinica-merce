import os
import sys

# Add backend app directory to sys.path so we can import from app
sys.path.append("c:\\Users\\Juan\\MERCE\\CLINICA MERCE\\backend")
sys.path.append("c:\\Users\\Juan\\.gemini\\antigravity-ide\\scratch\\backend-clinica-merce\\backend")

from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    settings = db.query(models.ClinicSettings).first()
    if settings:
        print("Clinic Settings found:")
        print(f"clinic_name: {settings.clinic_name}")
        print(f"clinic_email: {settings.clinic_email}")
        print(f"smtp_host: {settings.smtp_host}")
        print(f"smtp_port: {settings.smtp_port}")
        print(f"smtp_user: {settings.smtp_user}")
        print(f"smtp_from_email: {settings.smtp_from_email}")
        print("smtp_password is set:", settings.smtp_password is not None and len(settings.smtp_password) > 0)
    else:
        print("No clinic settings found in database.")
finally:
    db.close()
