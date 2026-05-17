from app.database import engine
from sqlalchemy import text

print("Connecting to database...")
is_sqlite = engine.url.drivername == "sqlite" or "sqlite" in str(engine.url)
json_column_type = "JSON" if is_sqlite else "JSONB"

with engine.connect() as conn:
    # 1. Columna translations en services
    try:
        conn.execute(text(f"ALTER TABLE services ADD COLUMN translations {json_column_type} DEFAULT '{{}}';"))
        print(f"✅ Añadida columna translations ({json_column_type}) a la tabla services")
    except Exception as e:
        print("Nota: services.translations ya existe o hubo un error.")

    # 2. Columna translations en service_categories
    try:
        conn.execute(text(f"ALTER TABLE service_categories ADD COLUMN translations {json_column_type} DEFAULT '{{}}';"))
        print(f"✅ Añadida columna translations ({json_column_type}) a la tabla service_categories")
    except Exception as e:
        print("Nota: service_categories.translations ya existe o hubo un error.")

    # 3. Columna preferred_language en clients
    try:
        conn.execute(text("ALTER TABLE clients ADD COLUMN preferred_language VARCHAR DEFAULT 'es';"))
        print("✅ Añadida columna preferred_language a la tabla clients")
    except Exception as e:
        print("Nota: clients.preferred_language ya existe o hubo un error.")

    conn.commit()
print("¡Migración multidioma (i18n) completada con éxito!")
