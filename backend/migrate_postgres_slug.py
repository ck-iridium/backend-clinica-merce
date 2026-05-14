import os
import psycopg2
import unicodedata
import re
from dotenv import load_dotenv

load_dotenv()

def slugify(value):
    value = str(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')

def migrate():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL no encontrada en .env")
        return

    try:
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        print("Conectado a PostgreSQL. Aplicando cambios estructurales...")
        
        # Añadir columnas si no existen
        cursor.execute("""
            ALTER TABLE service_categories 
            ADD COLUMN IF NOT EXISTS slug VARCHAR(255),
            ADD COLUMN IF NOT EXISTS seo_description TEXT;
        """)
        
        # Crear índice único en slug
        try:
            cursor.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_service_categories_slug ON service_categories (slug);")
        except Exception as e:
            print(f"Nota: El índice ya podría existir: {e}")

        # Generar slugs para registros existentes
        print("Generando slugs para categorías existentes...")
        cursor.execute("SELECT id, name FROM service_categories WHERE slug IS NULL OR slug = '';")
        categories = cursor.fetchall()
        
        for cat_id, name in categories:
            slug = slugify(name)
            cursor.execute("UPDATE service_categories SET slug = %s WHERE id = %s", (slug, cat_id))
            print(f"Actualizado: {name} -> {slug}")
            
        conn.commit()
        print("Migración de PostgreSQL completada con éxito.")
        
    except Exception as e:
        print(f"Error durante la migración: {e}")
        if 'conn' in locals():
            conn.rollback()
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    migrate()
