from app.database import SessionLocal
from app import models
import json

db = SessionLocal()
try:
    print("=== ESTADO DE TRADUCCIONES DE SERVICIOS ===")
    services = db.query(models.Service).all()
    for s in services:
        print(f"\nServicio: {s.name}")
        t = s.translations
        if t:
            if isinstance(t, str):
                try: t = json.loads(t)
                except: t = {}
            print(f"  Idiomas traducidos: {list(t.keys())}")
            for lang in ["en", "fr"]:
                if lang in t:
                    has_name = "name" in t[lang]
                    has_desc = "description" in t[lang]
                    has_html = "content_html" in t[lang]
                    print(f"    [{lang}] name={has_name}, desc={has_desc}, html={has_html} (len={len(t[lang].get('content_html') or '') if t[lang].get('content_html') else 0})")
                else:
                    print(f"    [{lang}] NO EXISTE")
        else:
            print("  No tiene traducciones en absoluto.")
finally:
    db.close()
