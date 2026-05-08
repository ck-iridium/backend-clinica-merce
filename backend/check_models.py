import os
import sys

# Añadir el directorio actual al path para importar módulos de la app
sys.path.insert(0, os.path.abspath('.'))

from app.database import SessionLocal
from app.models import ClinicSettings
import google.generativeai as genai

db = SessionLocal()
settings = db.query(ClinicSettings).first()

if not settings or not settings.gemini_api_key:
    # Try .env
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
else:
    api_key = settings.gemini_api_key

if not api_key:
    print("No se encontró Gemini API Key en BD ni en .env")
    sys.exit(1)

genai.configure(api_key=api_key)

print("Modelos disponibles:")
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"Error al obtener modelos: {e}")
