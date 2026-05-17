import os
import sys
import io
from app.database import SessionLocal
from app import models
from app.utils.translator import translate_fields

def force_content_translate():
    if sys.platform.startswith('win'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    db = SessionLocal()
    try:
        content = db.query(models.SiteContent).first()
        if content:
            print(f"Re-traduciendo CMS SiteContent...")
            translatable_keys = [
                "hero_title", "hero_subtitle", "hero_button_text",
                "about_title", "about_text", "about_button_text",
                "cta_title", "cta_subtitle", "cta_button_text"
            ]
            to_translate = {k: getattr(content, k) for k in translatable_keys if getattr(content, k)}
            
            res = translate_fields(to_translate, db)
            if res:
                content.translations = res
                db.add(content)
                db.commit()
                print(f"  [SUCCESS] CMS traducido: {res}")
            else:
                print("  [WARN] La IA devolvió un resultado vacío.")
    finally:
        db.close()

if __name__ == "__main__":
    force_content_translate()
