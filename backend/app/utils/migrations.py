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
        is_sqlite = db.bind.dialect.name == "sqlite"
        json_type = "JSON" if is_sqlite else "JSONB"
        
        # Recrear la función trigger notify_appointment_changes en PostgreSQL para inyectar tenant_id
        if not is_sqlite:
            trigger_sql = """
CREATE OR REPLACE FUNCTION public.notify_appointment_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  client_name TEXT;
  service_name TEXT;
  notif_title TEXT;
  notif_desc TEXT;
  notif_type TEXT;
  appointment_date TEXT;
BEGIN
  -- 1. Buscamos datos para el mensaje humano
  SELECT name INTO client_name FROM public.clients WHERE id = NEW.client_id;
  SELECT name INTO service_name FROM public.services WHERE id = NEW.service_id;
  appointment_date := to_char(NEW.start_time, 'DD/MM/YYYY a las HH24:MI');
  -- CASO A: Cita NUEVA
  IF TG_OP = 'INSERT' THEN
    notif_title := 'Nueva Reserva: ' || COALESCE(client_name, 'Cliente');
    notif_desc := client_name || ' ha reservado ' || service_name || ' para el ' || appointment_date;
    notif_type := 'success';
  -- CASO B: ACTUALIZACIÓN (Cambiamos 'Cancelada' por 'cancelled' y 'Confirmada' por 'confirmed')
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    IF NEW.status = 'cancelled' THEN
      notif_title := 'Cita Cancelada ❌';
      notif_desc := client_name || ' ha CANCELADO su cita de ' || service_name || ' del ' || appointment_date;
      notif_type := 'error'; -- Esto activará el sonido alert.wav
    ELSIF NEW.status = 'confirmed' THEN
      notif_title := 'Cita Confirmada ✅';
      notif_desc := 'La cita de ' || service_name || ' para ' || client_name || ' ha sido confirmada.';
      notif_type := 'success'; -- Esto activará el sonido positive.wav
    ELSE
      notif_title := 'Estado actualizado: ' || NEW.status;
      notif_desc := 'La cita de ' || client_name || ' ha pasado a: ' || NEW.status;
      notif_type := 'info'; -- Sonido neutral.wav
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  -- 2. Insertamos la notificación
  INSERT INTO public.notifications (user_id, title, description, type, metadata, tenant_id)
  SELECT id, notif_title, notif_desc, notif_type,
    jsonb_build_object('appointment_id', NEW.id, 'date', NEW.start_time, 'type', 'appointment'),
    NEW.tenant_id
  FROM public.profiles WHERE role IN ('Administrador', 'Recepción');
  RETURN NEW;
END;
$function$;
            """
            try:
                db.execute(text(trigger_sql))
                db.commit()
                logger.info("✅ Función de trigger notify_appointment_changes actualizada en PostgreSQL.")
            except Exception as e:
                db.rollback()
                logger.error(f"❌ Error actualizando la función trigger: {e}")
            
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
            "ALTER TABLE site_content ADD COLUMN seo_keywords VARCHAR",
            "ALTER TABLE services ADD COLUMN image_url VARCHAR",
            "ALTER TABLE services ADD COLUMN seo_title VARCHAR",
            "ALTER TABLE services ADD COLUMN seo_description VARCHAR",
            "ALTER TABLE services ADD COLUMN seo_keywords VARCHAR",
            # ── Días laborables dinámicos ──────────────────────────────────────────
            "ALTER TABLE clinic_settings ADD COLUMN working_days VARCHAR DEFAULT '[1,2,3,4,5]'",
            # ── Modelos de IA específicos ─────────────────────────────────────────
            "ALTER TABLE clinic_settings ADD COLUMN gemini_model_text VARCHAR DEFAULT 'gemini-2.5-flash'",
            "ALTER TABLE clinic_settings ADD COLUMN gemini_model_image VARCHAR DEFAULT 'imagen-4.0-generate-001'",
            "ALTER TABLE clinic_settings ADD COLUMN openai_model_text VARCHAR DEFAULT 'gpt-4o-mini'",
            "ALTER TABLE clinic_settings ADD COLUMN openai_model_image VARCHAR DEFAULT 'dall-e-3'",
            "ALTER TABLE clinic_settings ADD COLUMN default_image_shot VARCHAR DEFAULT 'conceptual'",
            "ALTER TABLE clinic_settings ADD COLUMN default_image_style VARCHAR DEFAULT 'luxury'",
            # ── Grok Video Generation & Multimedia (ELIMINADO) ────────────────────
            "ALTER TABLE services ADD COLUMN video_url VARCHAR",
            # ── Tabla de Medios (Galería) ──────────────────────────────────────────
            "CREATE TABLE IF NOT EXISTS media (id VARCHAR(36) PRIMARY KEY, filename VARCHAR, url VARCHAR, file_type VARCHAR, mime_type VARCHAR, size INTEGER, service_id VARCHAR(36), created_at TIMESTAMP)",
            # ── Home Builder (Ordenamiento CMS) ──────────────────────────────────
            "ALTER TABLE service_categories ADD COLUMN order_index INTEGER DEFAULT 0",
            "ALTER TABLE service_categories ADD COLUMN description TEXT",
            "ALTER TABLE site_content ADD COLUMN home_sections_order TEXT",
            # ── CMS: Visibilidad de categorías en Home ─────────────────────────────
            "ALTER TABLE service_categories ADD COLUMN is_active BOOLEAN DEFAULT TRUE",
            # ── CMS: Personalización Hero & Sobre Mí ─────────────────────────────
            "ALTER TABLE site_content ADD COLUMN hero_show_button BOOLEAN DEFAULT TRUE",
            "ALTER TABLE site_content ADD COLUMN hero_horizontal_alignment VARCHAR DEFAULT 'center'",
            "ALTER TABLE site_content ADD COLUMN about_layout VARCHAR DEFAULT 'right'",
            "ALTER TABLE site_content ADD COLUMN about_show_button BOOLEAN DEFAULT FALSE",
            "ALTER TABLE site_content ADD COLUMN about_button_text VARCHAR DEFAULT 'Saber Más'",
            "ALTER TABLE site_content ADD COLUMN about_button_link VARCHAR DEFAULT '/contacto'",
            # ── Notificaciones en tiempo real ─────────────────────────────────────
            "CREATE TABLE IF NOT EXISTS notifications (id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(36), title VARCHAR, description VARCHAR, type VARCHAR, read BOOLEAN DEFAULT FALSE, metadata JSON, created_at TIMESTAMP)",
            # ── Margen de cancelación ──────────────────────────────────────────────
            "ALTER TABLE clinic_settings ADD COLUMN cancellation_margin_hours INTEGER DEFAULT 24",
            # ── Fianza global opcional ──────────────────────────────────────────────
            "ALTER TABLE clinic_settings ADD COLUMN global_deposit_required BOOLEAN DEFAULT FALSE",
            "ALTER TABLE clinic_settings ADD COLUMN global_deposit_amount DECIMAL(10, 2) DEFAULT 0.0",
            # ── CMS: Soporte multidioma en la Home ──────────────────────────────────
            "ALTER TABLE site_content ADD COLUMN translations JSONB DEFAULT '{}'",
            # ── Dominios personalizados de inquilinos ────────────────────────────────
            "ALTER TABLE tenants ADD COLUMN custom_domain VARCHAR",
            # ── Personalización visual de marca avanzada ──────────────────────────────
            "ALTER TABLE clinic_settings ADD COLUMN accent_color VARCHAR DEFAULT '#D4AF37'",
            "ALTER TABLE clinic_settings ADD COLUMN dark_mode_enabled BOOLEAN DEFAULT FALSE",
            "ALTER TABLE clinic_settings ADD COLUMN border_radius VARCHAR DEFAULT 'suave'",
            "ALTER TABLE clinic_settings ADD COLUMN favicon_b64 TEXT",
            "ALTER TABLE clinic_settings ADD COLUMN clinic_description VARCHAR DEFAULT 'Tu centro de confianza para servicios personalizados y bienestar de primer nivel.'",
            "ALTER TABLE clinic_settings ADD COLUMN branding_palette_id VARCHAR DEFAULT 'dorado-antracita'",
            "ALTER TABLE clinic_settings ADD COLUMN accent_color_primary VARCHAR DEFAULT '#D4AF37'",
            "ALTER TABLE clinic_settings ADD COLUMN accent_color_secondary VARCHAR DEFAULT '#1C1917'",
            # ── CMS: Imágenes rotativas de la portada hero ───────────────────────
            "ALTER TABLE landing_marketing_settings ADD COLUMN hero_image_1 VARCHAR",
            "ALTER TABLE landing_marketing_settings ADD COLUMN hero_image_2 VARCHAR",
            "ALTER TABLE landing_marketing_settings ADD COLUMN hero_image_3 VARCHAR",
            # ── Control de Cuotas Diarias de Copiloto de IA ─────────────────────────
            "ALTER TABLE tenants ADD COLUMN ai_daily_actions_used INTEGER DEFAULT 0",
            "ALTER TABLE tenants ADD COLUMN ai_last_action_date DATE",
            # ── Multi-Location & Rostering ──────────────────────────────────────────
            "ALTER TABLE appointments ADD COLUMN staff_id VARCHAR",
            "ALTER TABLE appointments ADD COLUMN location_id VARCHAR",
            "ALTER TABLE time_blocks ADD COLUMN staff_id VARCHAR",
            # ── Control de Sesiones Concurrentes (SaaS) ─────────────────────────────
            "ALTER TABLE users ADD COLUMN last_session_id VARCHAR",
            "ALTER TABLE users ADD COLUMN last_session_iat INTEGER",
            # ── Mobile Services & Hybrid Configuration (Geografía) ──────────────────
            "ALTER TABLE clinic_settings ADD COLUMN work_modality VARCHAR(50) DEFAULT 'clinic_only'",
            "ALTER TABLE clinic_settings ADD COLUMN operations_center_address VARCHAR(500) NULL",
            "ALTER TABLE clinic_settings ADD COLUMN operations_center_latitude DOUBLE PRECISION NULL",
            "ALTER TABLE clinic_settings ADD COLUMN operations_center_longitude DOUBLE PRECISION NULL",
            "ALTER TABLE clinic_settings ADD COLUMN max_coverage_radius_km DOUBLE PRECISION DEFAULT 10.0",
            "ALTER TABLE clinic_settings ADD COLUMN whitelist_zones TEXT NULL",
            "ALTER TABLE services ADD COLUMN allowed_modality VARCHAR(50) DEFAULT 'clinic'",
            "ALTER TABLE clients ADD COLUMN client_latitude DOUBLE PRECISION NULL",
            "ALTER TABLE clients ADD COLUMN client_longitude DOUBLE PRECISION NULL",
            "ALTER TABLE clients ADD COLUMN client_postal_code VARCHAR(20) NULL",
            "ALTER TABLE clients ADD COLUMN client_city VARCHAR(100) NULL",
            "ALTER TABLE appointments ADD COLUMN service_modality VARCHAR(50) DEFAULT 'clinic'",
            "ALTER TABLE appointments ADD COLUMN client_address VARCHAR(500) NULL",
            "ALTER TABLE appointments ADD COLUMN client_latitude DOUBLE PRECISION NULL",
            "ALTER TABLE appointments ADD COLUMN client_longitude DOUBLE PRECISION NULL",
            "ALTER TABLE appointments ADD COLUMN client_postal_code VARCHAR(20) NULL",
            "ALTER TABLE appointments ADD COLUMN client_city VARCHAR(100) NULL",
            # ── CRM Columns ─────────────────────────────────────────────────────────
            "ALTER TABLE clinic_settings ADD COLUMN business_sector VARCHAR DEFAULT 'general' NOT NULL",
            "ALTER TABLE clients ADD COLUMN name VARCHAR",
            "ALTER TABLE clients ADD COLUMN first_name VARCHAR",
            "ALTER TABLE clients ADD COLUMN last_name VARCHAR",
            "ALTER TABLE clients ADD COLUMN service_address VARCHAR",
            "ALTER TABLE clients ADD COLUMN service_postal_code VARCHAR",
            "ALTER TABLE clients ADD COLUMN service_city VARCHAR",
            "ALTER TABLE clients ADD COLUMN service_latitude FLOAT",
            "ALTER TABLE clients ADD COLUMN service_longitude FLOAT",
            "ALTER TABLE clients ADD COLUMN billing_name VARCHAR",
            "ALTER TABLE clients ADD COLUMN billing_nif VARCHAR",
            "ALTER TABLE clients ADD COLUMN billing_address VARCHAR",
            "ALTER TABLE clients ADD COLUMN billing_postal_code VARCHAR",
            "ALTER TABLE clients ADD COLUMN billing_city VARCHAR",
            f"ALTER TABLE clients ADD COLUMN sector_metadata {json_type}",
            "ALTER TABLE appointments ADD COLUMN stripe_payment_intent_id VARCHAR NULL",
            "ALTER TABLE appointments ADD COLUMN stripe_checkout_session_id VARCHAR NULL",
            "ALTER TABLE appointments ADD COLUMN payment_status VARCHAR DEFAULT 'pending'",
            f"ALTER TABLE clinic_settings ADD COLUMN blocked_days_cache {json_type} DEFAULT '{{}}'::jsonb"
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
