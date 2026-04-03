from sqlalchemy import text
import logging

# Configuración de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_auto_migrations():
    """
    Función de utilidad para añadir automáticamente columnas faltantes en la base de datos
    sin necesidad de usar Alembic. Útil para despliegues rápidos en Render.
    """
    from ..database import SessionLocal
    db = SessionLocal()
    try:
        # Lista de migraciones: ALTER TABLE es soportado por SQLite y PostgreSQL
        migrations = [
            "ALTER TABLE clinic_settings ADD COLUMN smtp_host VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN smtp_port INTEGER",
            "ALTER TABLE clinic_settings ADD COLUMN smtp_user VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN smtp_password VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN smtp_from_email VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN smtp_use_tls BOOLEAN DEFAULT 1",
            "ALTER TABLE services ADD COLUMN is_active BOOLEAN DEFAULT 1",
            "ALTER TABLE appointments ADD COLUMN created_at DATETIME",
            "ALTER TABLE clinic_settings ADD COLUMN legal_name VARCHAR DEFAULT ''",
            "ALTER TABLE clinic_settings ADD COLUMN sanitary_register VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN instagram_url VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN maps_url VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN whatsapp_number VARCHAR",
            "ALTER TABLE appointments ADD COLUMN reminder_sent BOOLEAN DEFAULT 0",
            "ALTER TABLE clinic_settings ADD COLUMN booking_margin_hours FLOAT DEFAULT 2.0"
        ]
        
        for m in migrations:
            try:
                db.execute(text(m))
                db.commit()
                logger.info(f"✅ Migración aplicada: {m}")
            except Exception as e:
                db.rollback()
                # Silenciamos errores si la columna ya existe
                error_msg = str(e).lower()
                if "already exists" in error_msg or "duplicate column" in error_msg:
                    continue
                logger.warning(f"⚠️ Nota de migración '{m}': {e}")
                
    except Exception as e:
        logger.error(f"❌ Error crítico en auto-migración: {e}")
    finally:
        db.close()
