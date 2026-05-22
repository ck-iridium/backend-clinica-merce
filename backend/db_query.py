import psycopg2
import time

db_url = "postgresql://postgres.ypimdbkiuguiszaddzaj:Az0203836541@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require"

for attempt in range(10):
    try:
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        
        # Obtener todos los servicios activos
        cur.execute("SELECT id, name, slug, tenant_id, price FROM services ORDER BY created_at DESC;")
        services = cur.fetchall()
        print("=== DATABASE SERVICES ===")
        for s in services:
            print(f"ID: {s[0]} | Name: {s[1]} | Slug: {s[2]} | Tenant: {s[3]} | Price: {s[4]}")
            
        cur.close()
        conn.close()
        break
    except Exception as e:
        print(f"Attempt {attempt+1} failed: {e}")
        time.sleep(2)
