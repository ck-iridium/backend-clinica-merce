import os
import sys

# Añadir el directorio actual al path para importar módulos de la app
sys.path.insert(0, os.path.abspath('.'))

from app.database import SessionLocal
from app.models import ClinicSettings
import google.generativeai as genai
import json

db = SessionLocal()
settings = db.query(ClinicSettings).first()

if not settings or not settings.gemini_api_key:
    from dotenv import load_dotenv
    load_dotenv()
    api_key = os.getenv("GEMINI_API_KEY")
else:
    api_key = settings.gemini_api_key

genai.configure(api_key=api_key)

model = genai.GenerativeModel('gemini-2.5-flash')

prompt = """
Tu tarea es devolver estrictamente un JSON válido con la siguiente estructura, sin texto adicional ni bloques markdown (no uses ```json):
{"seo_title": "[Nombre Exacto del Servicio] | [Beneficio max 3 palabras] - Merce Estética", "seo_description": "Meta descripción atractiva de max 155 caracteres que incluya la palabra clave principal de forma natural", "seo_keywords": "palabras, clave, separadas, por, comas"}
REGLAS ESTRICTAS PARA EL SEO:
1. El seo_title DEBE empezar exactamente con el nombre del servicio provisto en la información.
2. Luego del nombre, añade ' | ' seguido de un beneficio de máximo 3 palabras, seguido de ' - Merce Estética'.
3. La seo_description DEBE ser de máximo 155 caracteres.

La información para generar el SEO es:
Nombre del servicio: Depilación con Hilo
Descripción corta: Depilación facial de alta precisión con hilo orgánico.
Contenido detallado: Eliminamos el vello facial de raíz con una técnica milenaria, perfecta para pieles sensibles y para definir la mirada al máximo sin químicos.
"""

response = model.generate_content(prompt)
print(response.text)
