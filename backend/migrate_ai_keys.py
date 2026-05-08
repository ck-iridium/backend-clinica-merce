from app.database import engine
from sqlalchemy import text

print("Iniciando migración para añadir campos de IA a clinic_settings...")
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN ai_provider VARCHAR DEFAULT 'gemini';"))
        print("Añadida columna ai_provider")
    except Exception as e:
        print("Nota: ai_provider ya existe o hubo un error.")
        
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN gemini_api_key VARCHAR;"))
        print("Añadida columna gemini_api_key")
    except Exception as e:
        print("Nota: gemini_api_key ya existe o hubo un error.")
        
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN openai_api_key VARCHAR;"))
        print("Añadida columna openai_api_key")
    except Exception as e:
        print("Nota: openai_api_key ya existe o hubo un error.")
         
    conn.commit()
print("¡Migración de IA completada con éxito!")
