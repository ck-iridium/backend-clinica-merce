import psycopg2

db_url = "postgresql://postgres.ypimdbkiuguiszaddzaj:Az0203836541@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require"

try:
    conn = psycopg2.connect(db_url)
    cur = conn.cursor()
    
    # Obtener las columnas de la tabla 'clients'
    cur.execute("""
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = 'clients';
    """)
    columns = cur.fetchall()
    print("=== CLIENTS TABLE COLUMNS ===")
    has_name = False
    for col in columns:
        print(f"Column: {col[0]} | Type: {col[1]}")
        if col[0] == 'name':
            has_name = True
            
    print(f"\nDoes 'name' column exist? {has_name}")
    
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error querying database: {e}")
