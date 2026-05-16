from app.database import engine
from sqlalchemy import text

print("Connecting to database...")
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN booking_layout VARCHAR DEFAULT 'grid';"))
        print("Añadida columna booking_layout a clinic_settings")
    except Exception as e:
        print(f"Nota: clinic_settings.booking_layout ya existe o hubo un error. Error: {e}")
        
    conn.commit()
print("¡Migración completada con éxito!")
