import os
import sys

# Añadir el directorio actual al path para importar módulos de la app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def run_alter_table():
    print("[MIGRATION] Modificando tabla landing_marketing_settings en PostgreSQL...")
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # PostgreSQL soporta ALTER TABLE ADD COLUMN IF NOT EXISTS
            conn.execute(text("ALTER TABLE landing_marketing_settings ADD COLUMN IF NOT EXISTS logo_svg TEXT;"))
            conn.execute(text("ALTER TABLE landing_marketing_settings ADD COLUMN IF NOT EXISTS primary_color VARCHAR(7) DEFAULT '#3b82f6';"))
            conn.execute(text("ALTER TABLE landing_marketing_settings ADD COLUMN IF NOT EXISTS seo_title VARCHAR;"))
            conn.execute(text("ALTER TABLE landing_marketing_settings ADD COLUMN IF NOT EXISTS seo_description VARCHAR;"))
            conn.execute(text("ALTER TABLE landing_marketing_settings ADD COLUMN IF NOT EXISTS seo_keywords VARCHAR;"))
            conn.execute(text("ALTER TABLE landing_marketing_settings ADD COLUMN IF NOT EXISTS font_weight_headings VARCHAR DEFAULT 'semibold';"))
            # Asegurar commit si es requerido en modo transaccional antiguo
            conn.execute(text("COMMIT;"))
        print("[SUCCESS] Tabla landing_marketing_settings actualizada exitosamente en PostgreSQL!")
    except Exception as e:
        print(f"[ERROR] No se pudo alterar la tabla: {e}")

if __name__ == "__main__":
    run_alter_table()
