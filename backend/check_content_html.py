from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    print("=== SERVICIOS CON CONTENT_HTML ===")
    services = db.query(models.Service).all()
    count = 0
    for s in services:
        has_content = bool(s.content_html and s.content_html.strip())
        print(f"Servicio: '{s.name}' -> Tiene content_html en DB? {has_content} (len={len(s.content_html) if s.content_html else 0})")
        if has_content:
            count += 1
            print(f"  Snippet de content_html: {s.content_html[:150]}...")
    print(f"\nTotal de servicios con content_html: {count}")
finally:
    db.close()
