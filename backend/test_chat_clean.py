import requests

url = "http://127.0.0.1:8000/api/tenant/ai/chat"
headers = {
    "X-Tenant-ID": "f5f9f6fd-0994-4bb0-be53-535c9f7d0d8d",
    "Content-Type": "application/json"
}
payload = {
    "message": "Hola, bienvenido",
    "history": [],
    "voice_gender": "female",
    "language": "es",
    "user_name": "barbero2"
}

try:
    print("Enviando petición HTTP POST...")
    response = requests.post(url, headers=headers, json=payload, timeout=12)
    print(f"Respuesta HTTP {response.status_code}")
    print("Cuerpo de la respuesta:")
    print(response.text)
except Exception as e:
    print(f"Error al enviar la petición: {e}")
