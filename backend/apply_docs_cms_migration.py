import os
import sys
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def apply_migration():
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "migrations", "01_create_doc_cms_tables.sql")
    if not os.path.exists(sql_path):
        print(f"Error: SQL file not found at {sql_path}")
        sys.exit(1)
        
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    # If database is SQLite, strip PostgreSQL-only statements
    is_sqlite = engine.url.drivername.startswith("sqlite")
    statements = []
    
    for statement in sql_content.split(";"):
        stmt = statement.strip()
        if not stmt:
            continue
        
        # Skip PostgreSQL-specific commands on SQLite
        if is_sqlite:
            lower_stmt = stmt.lower()
            if "row level security" in lower_stmt or "policy" in lower_stmt or "current_setting" in lower_stmt:
                print(f"Skipping PG-only statement on SQLite: {stmt[:60]}...")
                continue
                
        statements.append(stmt)

    print("Connecting and applying dynamic documentation CMS SQL migration in the database...")
    try:
        with engine.begin() as connection:
            for stmt in statements:
                connection.execute(text(stmt + ";"))
            print("SQL Migration applied successfully in the database.")
    except Exception as e:
        import traceback
        error_log = f"ERROR: {str(e)}\n\n{traceback.format_exc()}"
        with open("migration_docs_cms_error.txt", "w", encoding="utf-8") as err_file:
            err_file.write(error_log)
        print("ERROR: Failed to apply documentation CMS migration. See migration_docs_cms_error.txt for details.")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration()
