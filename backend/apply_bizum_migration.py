import os
import sys
from sqlalchemy import text

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def apply_migration():
    print("Conectando y aplicando migración de la tabla subscription_requests...")
    
    # Comprobar el motor de la base de datos
    is_postgres = not engine.url.drivername.startswith("sqlite")
    
    # SQL base para creación de tabla
    sql_create_table = """
    CREATE TABLE IF NOT EXISTS subscription_requests (
        id VARCHAR(36) PRIMARY KEY,
        tenant_id VARCHAR(36) NOT NULL REFERENCES tenants(id),
        user_id VARCHAR(36) NOT NULL REFERENCES users(id),
        plan_type VARCHAR(20) NOT NULL,
        billing_period VARCHAR(20) NOT NULL,
        amount NUMERIC(10, 2) NOT NULL,
        reference_code VARCHAR(10) NOT NULL UNIQUE,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        notes TEXT,
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now()),
        updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT timezone('utc', now())
    );
    """
    
    try:
        with engine.begin() as connection:
            connection.execute(text(sql_create_table))
            print("[MIGRACIÓN] Tabla subscription_requests creada o ya existente.")
            
            if is_postgres:
                print("[MIGRACIÓN] Detectado PostgreSQL. Habilitando RLS y políticas...")
                # Habilitar RLS
                connection.execute(text("ALTER TABLE subscription_requests ENABLE ROW LEVEL SECURITY;"))
                
                # Crear política de aislamiento por tenant si no existe
                # Para evitar errores si ya existe, la borramos primero
                connection.execute(text("DROP POLICY IF EXISTS tenant_isolation_subscription_requests ON subscription_requests;"))
                connection.execute(text("""
                    CREATE POLICY tenant_isolation_subscription_requests ON subscription_requests
                    FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true));
                """))
                print("[MIGRACIÓN] RLS y políticas de aislamiento configuradas con éxito.")
                
            print("¡Éxito! Migración de suscripciones Bizum completada de forma segura.")
            
    except Exception as e:
        import traceback
        with open("migration_bizum_error.txt", "w", encoding="utf-8") as err_file:
            err_file.write(str(e) + "\n" + traceback.format_exc())
        print("ERROR: Falló al aplicar la migración de Bizum. Ver migration_bizum_error.txt para más detalles.")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration()
