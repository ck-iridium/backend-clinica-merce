import psycopg2

db_url = "postgresql://postgres.ypimdbkiuguiszaddzaj:Az0203836541@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Obtener los últimos 5 servicios creados
    cur.execute("SELECT id, name, slug, tenant_id, is_active, price, created_at FROM services ORDER BY created_at DESC LIMIT 5;")
    services = cur.fetchall()
    print("=== LATEST 5 CREATED SERVICES ===")
    for s in services:
        print(f"ID: {s[0]} | Name: {s[1]} | Slug: {s[2]} | Tenant: {s[3]} | Active: {s[4]} | Price: {s[5]} | Created At: {s[6]}")
        
    cur.close()
    conn.close()
except Exception as e:
    print("Database Error:", e)
