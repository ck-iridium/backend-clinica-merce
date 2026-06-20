import sys

sys.path.append("c:\\Users\\Juan\\.gemini\\antigravity-ide\\scratch\\backend-clinica-merce\\backend")

from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    profiles = db.query(models.Profile).all()
    print(f"Total profiles found: {len(profiles)}")
    for p in profiles:
        tenant = db.query(models.Tenant).filter(models.Tenant.id == p.tenant_id).first()
        t_name = tenant.name if tenant else "Unknown Tenant"
        print(f"Profile: {p.full_name} | Email: {p.email} | Role: {p.role} | Status: {p.status} | Tenant: {t_name} (id: {p.tenant_id})")
finally:
    db.close()
