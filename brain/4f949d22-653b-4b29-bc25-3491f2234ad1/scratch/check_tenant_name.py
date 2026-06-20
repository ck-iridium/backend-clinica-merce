import sys

sys.path.append("c:\\Users\\Juan\\.gemini\\antigravity-ide\\scratch\\backend-clinica-merce\\backend")

from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    tenant = db.query(models.Tenant).filter(models.Tenant.id == "a8369e08-2844-42db-82d0-cf9f63f0b1d8").first()
    if tenant:
        print("Tenant found:")
        print(f"id: {tenant.id}")
        print(f"name: {tenant.name}")
        print(f"slug: {tenant.slug}")
    else:
        print("Tenant not found.")
finally:
    db.close()
