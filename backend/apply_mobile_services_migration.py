import os
import sys
from sqlalchemy import text

# Añadir el directorio actual al path para importar app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def apply_migration():
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "migration_mobile_services.sql")
    if not os.path.exists(sql_path):
        sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "migration_mobile_services.sql")
    if not os.path.exists(sql_path):
        sql_path = "migration_mobile_services.sql"
        
    if not os.path.exists(sql_path):
        print(f"Error: No se encuentra el archivo SQL en {sql_path}")
        sys.exit(1)
        
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # Separar las sentencias SQL por punto y coma, ignorando líneas vacías
    queries = [q.strip() for q in sql_content.split(";") if q.strip()]

    print("Conectando y aplicando migración SQL para Servicios a Domicilio...")
    
    with engine.begin() as connection:
        for query in queries:
            # Eliminar comentarios para mejor legibilidad en logs
            clean_query = "\n".join([line for line in query.splitlines() if not line.strip().startswith("--")])
            if not clean_query.strip():
                continue
                
            print(f"Ejecutando: {clean_query.strip().splitlines()[0]}...")
            try:
                connection.execute(text(clean_query))
                print(" -> OK")
            except Exception as e:
                err_msg = str(e).lower()
                # Errores comunes de columna duplicada:
                # - SQLite: "duplicate column name"
                # - PostgreSQL: "already exists"
                if "duplicate column" in err_msg or "already exists" in err_msg:
                    print(" -> Ignorado (la columna ya existe)")
                else:
                    print(f" -> ERROR: {e}")
                    # Registramos el error pero no frenamos la ejecución por si otras columnas pueden agregarse
                    pass
                    
    print("\nProceso de migración finalizado con éxito.")

if __name__ == "__main__":
    apply_migration()
