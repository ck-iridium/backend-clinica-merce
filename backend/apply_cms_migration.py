import os
import sys
from sqlalchemy import text

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def apply_migration():
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "migration_cms_modular.sql")
    if not os.path.exists(sql_path):
        sql_path = "migration_cms_modular.sql"
    if not os.path.exists(sql_path):
        print(f"Error: No se encuentra el archivo SQL en {sql_path}")
        sys.exit(1)
        
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    print("Conectando y aplicando migración SQL del CMS en la base de datos...")
    try:
        with engine.begin() as connection:
            connection.execute(text(sql_content))
            print("Migración SQL del CMS aplicada con éxito en la base de datos.")
    except Exception as e:
        import traceback
        with open("migration_cms_error.txt", "w", encoding="utf-8") as err_file:
            err_file.write(str(e) + "\n" + traceback.format_exc())
        print("ERROR: Falló al aplicar la migración del CMS. Ver migration_cms_error.txt para más detalles.")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration()
