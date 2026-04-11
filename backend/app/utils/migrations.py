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
            "ALTER TABLE clinic_settings ADD COLUMN smtp_use_tls BOOLEAN DEFAULT TRUE",
            "ALTER TABLE services ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
            "ALTER TABLE appointments ADD COLUMN created_at TIMESTAMP",
            "ALTER TABLE clinic_settings ADD COLUMN legal_name VARCHAR DEFAULT ''",
            "ALTER TABLE clinic_settings ADD COLUMN sanitary_register VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN instagram_url VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN maps_url VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN whatsapp_number VARCHAR",
            "ALTER TABLE appointments ADD COLUMN reminder_sent BOOLEAN DEFAULT FALSE",
            "ALTER TABLE clinic_settings ADD COLUMN booking_margin_hours FLOAT DEFAULT 2.0",
            "ALTER TABLE services ADD COLUMN category_id VARCHAR",
            "ALTER TABLE services ADD COLUMN is_featured BOOLEAN DEFAULT FALSE",
            "ALTER TABLE services ADD COLUMN created_at TIMESTAMP",
            "ALTER TABLE service_categories ADD COLUMN image_url VARCHAR",
            "ALTER TABLE clinic_settings ADD COLUMN allow_search_engine_indexing BOOLEAN DEFAULT FALSE",
            "ALTER TABLE site_content ADD COLUMN seo_title VARCHAR",
            "ALTER TABLE site_content ADD COLUMN seo_description VARCHAR",
            "ALTER TABLE site_content ADD COLUMN seo_keywords VARCHAR"
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
                if "already exists" in error_msg or "duplicate column" in error_msg or "already exists" in error_msg:
                    continue
                logger.warning(f"⚠️ Nota de migración '{m}': {e}")

        # --- Lógica de Protección de Datos (Categorías) ---
        from ..models import Service, ServiceCategory
        
        # 1. Asegurar que existe al menos la categoría 'General'
        general_cat = db.query(ServiceCategory).filter(ServiceCategory.name == "General").first()
        if not general_cat:
            general_cat = ServiceCategory(name="General")
            db.add(general_cat)
            db.commit()
            db.refresh(general_cat)
            logger.info("✅ Categoría 'General' auto-creada en migración.")

        # 2. Vincular servicios sin categoría a 'General'
        orphaned_services = db.query(Service).filter(Service.category_id == None).all()
        if orphaned_services:
            for s in orphaned_services:
                s.category_id = general_cat.id
            db.commit()
            logger.info(f"✅ Se han vinculado {len(orphaned_services)} servicios a la categoría 'General'.")
                
    except Exception as e:
        logger.error(f"❌ Error crítico en auto-migración: {e}")
    finally:
        db.close()
