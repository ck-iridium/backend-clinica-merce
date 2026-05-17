from app.database import SessionLocal
from app import models

db = SessionLocal()
try:
    print("=== CLINIC SETTINGS ===")
    settings = db.query(models.ClinicSettings).first()
    if settings:
        print(f"Clinic Name: {settings.clinic_name}")
        print(f"AI Provider: {settings.ai_provider}")
        print(f"Gemini API Key exists? {bool(settings.gemini_api_key)}")
        print(f"OpenAI API Key exists? {bool(settings.openai_api_key)}")
        if settings.gemini_api_key:
            print(f"Gemini API Key Length: {len(settings.gemini_api_key)}")
            print(f"Gemini API Key Prefix: {settings.gemini_api_key[:10]}...")
    else:
        print("No settings found in the database.")
finally:
    db.close()
