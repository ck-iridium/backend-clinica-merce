import sys

sys.path.append("c:\\Users\\Juan\\.gemini\antigravity-ide\\scratch\\backend-clinica-merce\\backend")

from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    tenants = db.query(models.Tenant).all()
    for t in tenants:
        settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == t.id).first()
        print(f"Tenant: {t.name} (slug: {t.slug}, id: {t.id})")
        if settings:
            print(f"  smtp_host: {settings.smtp_host}")
            print(f"  smtp_user: {settings.smtp_user}")
            print(f"  smtp_from_email: {settings.smtp_from_email}")
            print(f"  smtp_password exists: {bool(settings.smtp_password)}")
        else:
            print("  No settings found.")
finally:
    db.close()
