import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("DATABASE_URL")
try:
    print(f"Buscando conectar a: {url}")
    conn = psycopg2.connect(url, connect_timeout=3)
    print("Conexión exitosa a PostgreSQL!")
    conn.close()
except Exception as e:
    print(f"Error de conexión: {e}")
