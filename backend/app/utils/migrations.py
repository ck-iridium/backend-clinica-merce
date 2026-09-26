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
  -- 2. Insertamos la notificación únicamente para los usuarios/perfiles pertenecientes AL MISMO TENANT
  INSERT INTO public.notifications (user_id, title, description, type, metadata, tenant_id)
  SELECT id, notif_title, notif_desc, notif_type,
    jsonb_build_object('appointment_id', NEW.id, 'date', NEW.start_time, 'type', 'appointment'),
    NEW.tenant_id
  FROM public.profiles 
  WHERE tenant_id = NEW.tenant_id 
    AND (role IN ('Administrador', 'Recepción', 'admin', 'recepcion') OR role IS NULL);
  RETURN NEW;
END;
$function$;
            """
            try:
                db.execute(text(trigger_sql))
                db.commit()
                logger.info("✅ Función de trigger notify_appointment_changes actualizada en PostgreSQL con aislamiento por tenant_id.")
            except Exception as e:
                db.rollback()
                logger.error(f"❌ Error actualizando la función trigger: {e}")

            # Limpieza de notificaciones cruzadas preexistentes (donde tenant_id de notificación != tenant_id del usuario)
            cleanup_sql = """
            DELETE FROM public.notifications
            WHERE id IN (
                SELECT n.id
                FROM public.notifications n
                JOIN public.users u ON n.user_id = u.id
                WHERE n.tenant_id IS NOT NULL AND u.tenant_id IS NOT NULL AND n.tenant_id != u.tenant_id
            );
            """
            try:
                db.execute(text(cleanup_sql))
                db.commit()
                logger.info("✅ Limpieza de notificaciones cruzadas entre tenants completada.")
            except Exception as e:
                db.rollback()
                logger.error(f"⚠️ Error limpiando notificaciones cruzadas (omitido): {e}")
            
        # Lista de migraciones: ALTER TABLE es soportado por SQLite y PostgreSQL
        migrations = [
            "ALTER TABLE clients ADD COLUMN is_verified BOOLEAN DEFAULT FALSE",
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
            "ALTER TABLE site_content ADD COLUMN hero_content_fullwidth BOOLEAN DEFAULT FALSE",
            "ALTER TABLE site_content ADD COLUMN hero_title_size VARCHAR DEFAULT 'large'",
            "ALTER TABLE site_content ADD COLUMN hero_subtitle_size VARCHAR DEFAULT 'medium'",
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
            "ALTER TABLE clinic_settings ADD COLUMN header_logo_height INTEGER DEFAULT 42",
            "ALTER TABLE clinic_settings ADD COLUMN header_logo_padding_y INTEGER DEFAULT 0",
            "ALTER TABLE clinic_settings ADD COLUMN header_logo_margin_right INTEGER DEFAULT 24",
            "ALTER TABLE clinic_settings ADD COLUMN header_logo_margin_left INTEGER DEFAULT 0",
            "ALTER TABLE clinic_settings ADD COLUMN header_logo_mode VARCHAR DEFAULT 'original'",
            "ALTER TABLE clinic_settings ADD COLUMN logo_mobile_b64 TEXT",
            "ALTER TABLE clinic_settings ADD COLUMN mobile_logo_mode VARCHAR DEFAULT 'adaptive'",
            "ALTER TABLE clinic_settings ADD COLUMN mobile_logo_height INTEGER DEFAULT 36",
            "ALTER TABLE clinic_settings ADD COLUMN logo_footer_b64 TEXT",
            "ALTER TABLE clinic_settings ADD COLUMN footer_logo_mode VARCHAR DEFAULT 'white'",
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
            f"ALTER TABLE clinic_settings ADD COLUMN blocked_days_cache {json_type} DEFAULT '{{}}'::jsonb",
            "ALTER TABLE locations ADD COLUMN latitude DOUBLE PRECISION NULL",
            "ALTER TABLE locations ADD COLUMN longitude DOUBLE PRECISION NULL",
            "ALTER TABLE invoices ADD COLUMN number VARCHAR",
            "UPDATE invoices SET number = id WHERE number IS NULL",
            "ALTER TABLE clients DROP CONSTRAINT IF EXISTS clients_email_key",
            "ALTER TABLE clients DROP CONSTRAINT IF EXISTS uq_clients_email",
            "ALTER TABLE clients ADD CONSTRAINT uq_clients_tenant_email UNIQUE (tenant_id, email)",
            "ALTER TABLE clinic_settings ADD COLUMN google_site_verification VARCHAR(255) NULL",
            "ALTER TABLE clinic_settings ADD COLUMN gtm_container_id VARCHAR(50) NULL",
            "ALTER TABLE clinic_settings ADD COLUMN google_ads_id VARCHAR(50) NULL",
            "ALTER TABLE clinic_settings ADD COLUMN google_ads_conversion_label VARCHAR(100) NULL",
            f"ALTER TABLE clinic_settings ADD COLUMN integrations_config {json_type} DEFAULT '{{}}'",
            "ALTER TABLE locations ADD COLUMN slug VARCHAR(100) NULL",
            "ALTER TABLE site_content ADD COLUMN hero_title_size VARCHAR DEFAULT 'large'",
            "ALTER TABLE site_content ADD COLUMN hero_subtitle_size VARCHAR DEFAULT 'medium'",
            "ALTER TABLE site_content ADD COLUMN hero_content_fullwidth BOOLEAN DEFAULT FALSE",
            "ALTER TABLE site_content ADD COLUMN hero_title_max_width INTEGER DEFAULT 100",
            "ALTER TABLE site_content ADD COLUMN hero_price_enabled BOOLEAN DEFAULT FALSE",
            "ALTER TABLE site_content ADD COLUMN hero_price_prefix VARCHAR DEFAULT 'Desde'",
            "ALTER TABLE site_content ADD COLUMN hero_price_amount VARCHAR DEFAULT ''",
            "ALTER TABLE site_content ADD COLUMN hero_price_suffix VARCHAR DEFAULT '€'",
            "ALTER TABLE site_content ADD COLUMN hero_price_period VARCHAR DEFAULT ''",
            "ALTER TABLE site_content ADD COLUMN hero_price_period_size INTEGER DEFAULT 100",
            "ALTER TABLE site_content ADD COLUMN hero_price_period_offset_y INTEGER DEFAULT 0",
            "ALTER TABLE site_content ADD COLUMN hero_price_size VARCHAR DEFAULT 'large'",
            "ALTER TABLE site_content ADD COLUMN hero_price_offset_y INTEGER DEFAULT 0",
            "ALTER TABLE site_content ADD COLUMN hero_price_style VARCHAR DEFAULT 'capsule_dark'",
            "ALTER TABLE site_content ADD COLUMN hero_button_style VARCHAR DEFAULT 'glass'",
            f"ALTER TABLE site_content ADD COLUMN hero_responsive_config {json_type} DEFAULT '{{}}'",
            f"ALTER TABLE site_content ADD COLUMN hero_slides {json_type} DEFAULT '[]'",
            "ALTER TABLE site_content ADD COLUMN hero_slider_autoplay BOOLEAN DEFAULT TRUE",
            "ALTER TABLE site_content ADD COLUMN hero_slider_interval INTEGER DEFAULT 5",
            "ALTER TABLE site_content ADD COLUMN hero_slider_effect VARCHAR DEFAULT 'fade'",
            "ALTER TABLE site_content ADD COLUMN hero_slider_show_arrows BOOLEAN DEFAULT TRUE",
            "ALTER TABLE site_content ADD COLUMN hero_slider_show_dots BOOLEAN DEFAULT TRUE"
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

        # 3. Limpieza de citas pendientes obsoletas (> 10 min) para liberar huecos bloqueados
        try:
            from ..tasks import cleanup_expired_appointments
            purged = cleanup_expired_appointments()
            logger.info(f"✅ Limpieza inicial de citas pendientes ejecutada: {purged} citas liberadas.")
        except Exception as e:
            logger.warning(f"⚠️ Nota al ejecutar cleanup_expired_appointments en migración: {e}")

        # 4. Auto-asignación de staff_id y location_id para citas huérfanas
        try:
            from ..models import Appointment, Profile, Location, Tenant
            from sqlalchemy import func
            tenants = db.query(Tenant).all()
            total_fixed = 0
            for t in tenants:
                specs = db.query(Profile).filter(
                    Profile.tenant_id == t.id,
                    func.lower(Profile.role).in_(["specialist", "especialista", "admin", "administrador"])
                ).all()
                loc = db.query(Location).filter(Location.tenant_id == t.id, Location.is_active == True).first()
                if specs:
                    default_staff_id = specs[0].id
                    orphan_appts = db.query(Appointment).filter(
                        Appointment.tenant_id == t.id,
                        Appointment.staff_id == None
                    ).all()
                    for o in orphan_appts:
                        o.staff_id = default_staff_id
                        if not o.location_id and loc:
                            o.location_id = loc.id
                        total_fixed += 1
            if total_fixed > 0:
                db.commit()
                logger.info(f"✅ Auto-reparación: Se han asignado especialista y sede a {total_fixed} citas sin staff_id.")
        except Exception as e:
            logger.warning(f"⚠️ Nota al auto-asignar staff_id a citas huérfanas: {e}")

        # 5. Auto-asignación de slug para sedes existentes sin slug
        try:
            from ..models import Location
            from ..crud.locations import slugify
            all_locs = db.query(Location).all()
            locs_updated = 0
            for l in all_locs:
                if not l.slug and l.name:
                    base_slug = slugify(l.name) or "sede"
                    slug = base_slug
                    counter = 1
                    while db.query(Location).filter(Location.tenant_id == l.tenant_id, Location.slug == slug, Location.id != l.id).first():
                        counter += 1
                        slug = f"{base_slug}-{counter}"
                    l.slug = slug
                    locs_updated += 1
            if locs_updated > 0:
                db.commit()
                logger.info(f"✅ Auto-migración: Se asignaron slugs SEO a {locs_updated} sedes.")
        except Exception as e:
            logger.warning(f"⚠️ Nota al auto-asignar slug a sedes: {e}")

        # 6. Migración Multi-Tenant: Clave Primaria Compuesta en profiles (id, tenant_id)
        if not is_sqlite:
            try:
                pk_check = db.execute(text("""
                    SELECT kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu 
                      ON tc.constraint_name = kcu.constraint_name 
                      AND tc.table_schema = kcu.table_schema
                    WHERE tc.table_name = 'profiles' 
                      AND tc.constraint_type = 'PRIMARY KEY';
                """)).fetchall()
                pk_columns = [row[0] for row in pk_check]

                if "tenant_id" not in pk_columns:
                    logger.info("Iniciando migración de clave primaria compuesta en public.profiles...")
                    db.execute(text("UPDATE public.profiles SET tenant_id = '00000000-0000-0000-0000-000000000001' WHERE tenant_id IS NULL;"))
                    db.execute(text("""
                        DO $$
                        BEGIN
                            IF EXISTS (
                                SELECT 1 FROM information_schema.table_constraints 
                                WHERE table_name = 'notifications' AND constraint_name = 'notifications_user_id_fkey'
                            ) THEN
                                ALTER TABLE public.notifications DROP CONSTRAINT notifications_user_id_fkey;
                                ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey 
                                    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
                            END IF;
                        END $$;
                    """))
                    db.execute(text("ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;"))
                    db.execute(text("ALTER TABLE public.profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id, tenant_id);"))
                    db.execute(text("CREATE INDEX IF NOT EXISTS idx_profiles_email_tenant ON public.profiles(email, tenant_id);"))
                    db.commit()
                    logger.info("✅ Migración Multi-Tenant: profiles_pkey actualizada a (id, tenant_id) con éxito.")
            except Exception as e:
                db.rollback()
                logger.warning(f"⚠️ Nota al actualizar clave primaria compuesta en profiles: {e}")
                
    except Exception as e:
        logger.error(f"❌ Error crítico en auto-migración: {e}")
    finally:
        db.close()
