import os
import sys
from sqlalchemy import text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def apply_multitenant_profiles():
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "migrations", "04_multitenant_profiles.sql")
    if not os.path.exists(sql_path):
        print(f"Error: No se encuentra el archivo SQL en {sql_path}")
        sys.exit(1)
        
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    print("Conectando y aplicando migracion de clave primaria compuesta en Supabase...")
    try:
        with engine.begin() as connection:
            connection.execute(text(sql_content))
            print("OK: Migracion SQL aplicada con exito en la base de datos.")
    except Exception as e:
        import traceback
        print(f"ERROR: Fallo al aplicar la migracion: {e}")
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    apply_multitenant_profiles()
