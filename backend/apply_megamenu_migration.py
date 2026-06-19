import os
import sys
from sqlalchemy import text

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def apply_migration():
    print("Conectando y aplicando migración SQL del Megamenú en la base de datos...")
    
    # SQL para añadir columnas si no existen
    sql_content = """
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS megamenu_layout VARCHAR(20) DEFAULT 'bento';
    ALTER TABLE site_content ADD COLUMN IF NOT EXISTS megamenu_categories_json JSONB DEFAULT NULL;
    """
    
    try:
        with engine.begin() as connection:
            connection.execute(text(sql_content))
            print("¡Éxito! Migración SQL del Megamenú aplicada con éxito en la base de datos.")
    except Exception as e:
        import traceback
        with open("migration_megamenu_error.txt", "w", encoding="utf-8") as err_file:
            err_file.write(str(e) + "\n" + traceback.format_exc())
        print("ERROR: Falló al aplicar la migración del Megamenú. Ver migration_megamenu_error.txt para más detalles.")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration()
