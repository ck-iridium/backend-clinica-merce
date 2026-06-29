import os
import sys
from sqlalchemy import text

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def apply_migration():
    print("Conectando y aplicando migración de Soft-Launch (email_verified)...")
    
    # Comprobar el motor de la base de datos
    is_postgres = not engine.url.drivername.startswith("sqlite")
    
    if not is_postgres:
        print("[MIGRACIÓN] Entorno de desarrollo local SQLite. Aplicando columnas básicas...")
        sql_sqlite = "ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT 0 NOT NULL;"
        try:
            with engine.begin() as connection:
                connection.execute(text(sql_sqlite))
                print("[MIGRACIÓN] Columna email_verified añadida en SQLite.")
        except Exception as e:
            # Si ya existe, ignoramos el fallo
            print(f"[MIGRACIÓN] [INFO] Posible columna ya existente en SQLite: {e}")
        return

    # SQL para PostgreSQL (Supabase)
    sql_add_column = "ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE NOT NULL;"
    
    sql_create_trigger_fn = """
    CREATE OR REPLACE FUNCTION public.handle_auth_user_confirmed()
    RETURNS TRIGGER AS $$
    BEGIN
        -- Si email_confirmed_at es no nulo, marcamos como verificado en public.users
        IF NEW.email_confirmed_at IS NOT NULL THEN
            UPDATE public.users
            SET email_verified = TRUE
            WHERE id = NEW.id::text;
        END IF;
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    """
    
    sql_create_trigger = """
    DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
    CREATE TRIGGER on_auth_user_confirmed
    AFTER UPDATE OR INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_auth_user_confirmed();
    """
    
    sql_retroactive_sync = """
    UPDATE public.users p
    SET email_verified = TRUE
    FROM auth.users a
    WHERE p.id = a.id::text AND a.email_confirmed_at IS NOT NULL;
    """
    
    try:
        with engine.begin() as connection:
            # 1. Añadir columna
            connection.execute(text(sql_add_column))
            print("[MIGRACIÓN] Columna email_verified añadida o verificada en public.users.")
            
            # 2. Crear función del trigger con SECURITY DEFINER
            connection.execute(text(sql_create_trigger_fn))
            print("[MIGRACIÓN] Función handle_auth_user_confirmed creada/actualizada.")
            
            # 3. Vincular el trigger a la tabla auth.users de Supabase Auth
            connection.execute(text(sql_create_trigger))
            print("[MIGRACIÓN] Trigger on_auth_user_confirmed vinculado a auth.users.")
            
            # 4. Ejecutar sincronización retroactiva
            connection.execute(text(sql_retroactive_sync))
            print("[MIGRACIÓN] Sincronización retroactiva de usuarios existentes realizada.")
            
            print("¡Éxito! Migración de Soft-Launch (email_verified) completada.")
            
    except Exception as e:
        import traceback
        with open("migration_soft_launch_error.txt", "w", encoding="utf-8") as err_file:
            err_file.write(str(e) + "\n" + traceback.format_exc())
        print("ERROR: Falló al aplicar la migración de Soft-Launch. Ver migration_soft_launch_error.txt.")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration()
