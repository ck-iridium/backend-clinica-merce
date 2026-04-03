import sqlite3

def check_schema():
    conn = sqlite3.connect('backend/clinica_v2.db')
    cursor = conn.cursor()
    
    tables = ['clinic_settings', 'appointments', 'services']
    
    for table in tables:
        print(f"\n--- Esquema de '{table}' ---")
        try:
            cursor.execute(f"PRAGMA table_info({table})")
            columns = cursor.fetchall()
            for col in columns:
                print(f"Colmuna: {col[1]} ({col[2]})")
        except Exception as e:
            print(f"Error al leer tabla {table}: {e}")
    
    conn.close()

if __name__ == "__main__":
    check_schema()
