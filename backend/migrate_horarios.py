from app.database import engine
from sqlalchemy import text

print("Iniciando migración manual de horarios y vacaciones...")
with engine.connect() as conn:
    # 1. Modificar ClinicSettings
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN open_time VARCHAR;"))
        conn.execute(text("UPDATE clinic_settings SET open_time = '09:00';"))
        print("Añadida columna open_time a clinic_settings")
    except Exception as e:
        print("Nota: clinic_settings.open_time ya existe o hubo un error.")

    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN close_time VARCHAR;"))
        conn.execute(text("UPDATE clinic_settings SET close_time = '19:30';"))
        print("Añadida columna close_time a clinic_settings")
    except Exception as e:
        print("Nota: clinic_settings.close_time ya existe o hubo un error.")

    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN lunch_start VARCHAR;"))
        print("Añadida columna lunch_start a clinic_settings")
    except Exception as e:
        print("Nota: clinic_settings.lunch_start ya existe o hubo un error.")
        
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN lunch_end VARCHAR;"))
        print("Añadida columna lunch_end a clinic_settings")
    except Exception as e:
        print("Nota: clinic_settings.lunch_end ya existe o hubo un error.")

    # 2. Modificar TimeBlock
    try:
        conn.execute(text("ALTER TABLE time_blocks ADD COLUMN is_annual_holiday BOOLEAN DEFAULT FALSE;"))
        print("Añadida columna is_annual_holiday a time_blocks")
    except Exception as e:
        print("Nota: time_blocks.is_annual_holiday ya existe o hubo un error:", e)
         
    conn.commit()
print("¡Migración de base de datos de horarios completada con éxito!")
