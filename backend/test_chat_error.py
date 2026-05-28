import os
import sys
import requests
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(override=True)

from app.database import SessionLocal
from app.models import Tenant

def diagnose():
    db = SessionLocal()
    tenant = db.query(Tenant).filter(Tenant.slug == "barbero2").first()
    if not tenant:
        tenant = db.query(Tenant).first()
    tenant_id = str(tenant.id)
    db.close()

    print(f"Probando contra el backend local para el Tenant ID: {tenant_id} (Slug: {tenant.slug})")
    
    url = "http://localhost:8000/api/tenant/ai/chat"
    headers = {
        "X-Tenant-ID": tenant_id,
        "Content-Type": "application/json"
    }
    payload = {
        "message": "Hola, ¿qué tal?",
        "history": [],
        "voice_gender": "male",
        "language": "es",
        "user_name": "barbero2"
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        print(f"Respuesta HTTP {response.status_code}")
        print("Cuerpo de respuesta:")
        print(response.text)
    except Exception as e:
        print(f"Error al conectar con el backend: {e}")

if __name__ == "__main__":
    diagnose()
