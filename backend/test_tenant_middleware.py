import os
import sys

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_tenant_resolution():
    print("Iniciando pruebas de resolución de Tenant...")
    
    # Caso 1: Sin cabecera ni query -> Debe resolver al Tenant por defecto (Clínica Mercè)
    print("\n--- CASO 1: Sin parámetros (Debe usar Fallback de Clínica Mercè) ---")
    response = client.get("/")
    resolved_tenant = response.headers.get("X-Resolved-Tenant")
    print(f"Status Code: {response.status_code}")
    print(f"X-Resolved-Tenant: {resolved_tenant}")
    assert resolved_tenant == "00000000-0000-0000-0000-000000000001", f"Esperaba el tenant por defecto, pero se obtuvo {resolved_tenant}"
    print("SUCCESS: Caso 1 Exitoso!")

    # Caso 2: Cabecera personalizada X-Tenant-ID
    print("\n--- CASO 2: Cabecera personalizada X-Tenant-ID ---")
    custom_tenant_id = "11111111-2222-3333-4444-555555555555"
    response = client.get("/", headers={"X-Tenant-ID": custom_tenant_id})
    resolved_tenant = response.headers.get("X-Resolved-Tenant")
    print(f"Status Code: {response.status_code}")
    print(f"X-Resolved-Tenant: {resolved_tenant}")
    assert resolved_tenant == custom_tenant_id, f"Esperaba {custom_tenant_id}, pero se obtuvo {resolved_tenant}"
    print("SUCCESS: Caso 2 Exitoso!")

    # Caso 3: Query Parameter tenant_id
    print("\n--- CASO 3: Parámetro en URL query ---")
    query_tenant_id = "99999999-8888-7777-6666-555555555555"
    response = client.get(f"/?tenant_id={query_tenant_id}")
    resolved_tenant = response.headers.get("X-Resolved-Tenant")
    print(f"Status Code: {response.status_code}")
    print(f"X-Resolved-Tenant: {resolved_tenant}")
    assert resolved_tenant == query_tenant_id, f"Esperaba {query_tenant_id}, pero se obtuvo {resolved_tenant}"
    print("SUCCESS: Caso 3 Exitoso!")

    # Caso 4: Cabecera Authorization (JWT Base64 decoded tenant_id)
    print("\n--- CASO 4: JWT en cabecera Authorization (Bearer Token) ---")
    # Generamos un JWT simulado
    import base64
    import json
    
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": "user_id_123",
        "email": "test@tenant.com",
        "app_metadata": {
            "tenant_id": "77777777-7777-7777-7777-777777777777"
        }
    }
    
    def encode_jwt_part(d):
        return base64.urlsafe_b64encode(json.dumps(d).encode("utf-8")).decode("utf-8").rstrip("=")
        
    simulated_token = f"{encode_jwt_part(header)}.{encode_jwt_part(payload)}.signature_placeholder"
    
    response = client.get("/", headers={"Authorization": f"Bearer {simulated_token}"})
    resolved_tenant = response.headers.get("X-Resolved-Tenant")
    print(f"Status Code: {response.status_code}")
    print(f"X-Resolved-Tenant: {resolved_tenant}")
    assert resolved_tenant == "77777777-7777-7777-7777-777777777777", f"Esperaba el tenant del JWT, pero se obtuvo {resolved_tenant}"
    print("SUCCESS: Caso 4 Exitoso!")

    print("\n[SUCCESS] TODAS LAS PRUEBAS DE RESOLUCION DE TENANT PASARON CON EXITO!")

if __name__ == "__main__":
    test_tenant_resolution()
