import psycopg2

db_url = "postgresql://postgres.ypimdbkiuguiszaddzaj:Az0203836541@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Obtener los bloqueos de tiempo
    cur.execute("""
        SELECT id, tenant_id, staff_id, start_time, end_time, reason, is_annual_holiday 
        FROM time_blocks;
    """)
    blocks = cur.fetchall()
    print("=== TIME BLOCKS ===")
    for b in blocks:
        print(f"ID: {b[0]} | Tenant: {b[1]} | Staff: {b[2]} | Start: {b[3]} | End: {b[4]} | Reason: {b[5]} | Holiday: {b[6]}")
        
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error querying database: {e}")
