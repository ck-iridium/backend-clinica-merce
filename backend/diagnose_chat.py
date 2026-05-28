import os
import sys
import requests
from dotenv import load_dotenv

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
load_dotenv(override=True)

print("1. Conectando a la base de datos local...")
from app.database import SessionLocal
from app.models import Tenant

try:
    db = SessionLocal()
    print("2. Buscando tenant 'barbero2'...")
    tenant = db.query(Tenant).filter(Tenant.slug == "barbero2").first()
    if tenant:
        tenant_id = str(tenant.id)
        print(f"3. Tenant encontrado: {tenant_id} (Slug: {tenant.slug})")
    else:
        print("3. Tenant 'barbero2' no encontrado. Buscando primer tenant...")
        tenant = db.query(Tenant).first()
        tenant_id = str(tenant.id)
        print(f"3. Primer Tenant ID: {tenant_id} (Slug: {tenant.slug})")
    db.close()
except Exception as ex:
    print(f"Error en paso DB: {ex}")
    tenant_id = "00000000-0000-0000-0000-000000000002"
    print(f"Usando ID de fallback: {tenant_id}")

print("4. Enviando POST request a http://localhost:8000/api/tenant/ai/chat...")
url = "http://localhost:8000/api/tenant/ai/chat"
headers = {
    "X-Tenant-ID": tenant_id,
    "Content-Type": "application/json"
}
payload = {
    "message": "Hola",
    "history": [],
    "voice_gender": "female",
    "language": "es",
    "user_name": "barbero2"
}

try:
    response = requests.post(url, headers=headers, json=payload, timeout=10)
    print(f"5. Código HTTP recibido: {response.status_code}")
    print("Cuerpo de la respuesta:")
    print(response.text)
except Exception as ex:
    print(f"Error al enviar la petición HTTP: {ex}")
