import sqlite3
import unicodedata
import re

def slugify(value):
    value = str(value)
    value = unicodedata.normalize('NFKD', value).encode('ascii', 'ignore').decode('ascii')
    value = re.sub(r'[^\w\s-]', '', value.lower())
    return re.sub(r'[-\s]+', '-', value).strip('-_')

def migrate():
    # Conectamos a la DB (usamos la que se llama clinica_v2.db por los otros scripts)
    conn = sqlite3.connect("clinica_v2.db")
    cursor = conn.cursor()
    
    try:
        # Añadir las columnas
        print("Añadiendo columnas...")
        try:
            cursor.execute("ALTER TABLE service_categories ADD COLUMN slug VARCHAR(255)")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("La columna slug ya existe.")
            else:
                raise e
                
        try:
            cursor.execute("ALTER TABLE service_categories ADD COLUMN seo_description TEXT")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print("La columna seo_description ya existe.")
            else:
                raise e
                
        # Crear indice en slug
        try:
            cursor.execute("CREATE UNIQUE INDEX ix_service_categories_slug ON service_categories (slug)")
        except sqlite3.OperationalError as e:
            print("El índice ix_service_categories_slug ya existe o no se pudo crear:", e)
            
        # Actualizar slugs para las categorías existentes
        print("Generando slugs...")
        cursor.execute("SELECT id, name FROM service_categories")
        categories = cursor.fetchall()
        
        for cat_id, name in categories:
            slug = slugify(name)
            # Para evitar colisiones en la DB si dos tienen el mismo nombre base (poco probable)
            cursor.execute("UPDATE service_categories SET slug = ? WHERE id = ?", (slug, cat_id))
            
        conn.commit()
        print("Migración completada con éxito.")
        
    except Exception as e:
        print("Error durante la migración:", e)
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
