from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    content = db.query(models.SiteContent).first()
    if content:
        print("=== SITE CONTENT ===")
        print(f"Hero Title: {content.hero_title}")
        print(f"About Title: {content.about_title}")
        print(f"CTA Title: {content.cta_title}")
        print(f"CTA Button Text: {content.cta_button_text}")
        print("\n=== TRANSLATIONS ===")
        import json
        translations = content.translations
        if isinstance(translations, str):
            translations = json.loads(translations)
        print(json.dumps(translations, indent=2, ensure_ascii=False))
finally:
    db.close()
