import os
import sys
import io
from app.database import SessionLocal
from app import models

def check_db():
    if sys.platform.startswith('win'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    db = SessionLocal()
    try:
        print("=== COMPROBANDO ESTADO DE TRADUCCIONES EN BASE DE DATOS ===")
        services = db.query(models.Service).all()
        for s in services:
            print(f"Servicio: '{s.name}'")
            if s.translations:
                import json
                t = s.translations
                if isinstance(t, str):
                    try: t = json.loads(t)
                    except: t = {}
                
                en_html = t.get("en", {}).get("content_html")
                fr_html = t.get("fr", {}).get("content_html")
                print(f"  Translations JSON keys: {list(t.keys())}")
                print(f"  EN content_html length: {len(en_html) if en_html else 0}")
                print(f"  FR content_html length: {len(fr_html) if fr_html else 0}")
            else:
                print("  No translations JSON found.")
    finally:
        db.close()

if __name__ == "__main__":
    check_db()
