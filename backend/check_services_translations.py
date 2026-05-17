from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    print("=== SERVICES ===")
    services = db.query(models.Service).all()
    for s in services:
        print(f"ID: {s.id}, Name: {s.name}")
        print(f"  Translations: {s.translations}")
        
    print("\n=== CATEGORIES ===")
    categories = db.query(models.ServiceCategory).all()
    for c in categories:
        print(f"ID: {c.id}, Name: {c.name}")
        print(f"  Translations: {c.translations}")
finally:
    db.close()
