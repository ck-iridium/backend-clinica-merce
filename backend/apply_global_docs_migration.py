import os
import sys
from sqlalchemy import text

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine

def apply_migration():
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "migrations", "02_convert_docs_cms_global.sql")
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
            if "drop constraint" in lower_stmt:
                # SQLite doesn't support DROP CONSTRAINT directly, but it ignores it since the tables are empty/fresh
                print(f"Skipping drop constraint on SQLite: {stmt[:60]}...")
                continue
            if "drop column" in lower_stmt:
                # SQLite doesn't support DROP COLUMN on older versions or requires table reconstruction, but we can catch or skip
                print(f"Skipping drop column on SQLite: {stmt[:60]}...")
                continue
                
        statements.append(stmt)

    print("Connecting and applying global documentation CMS SQL migration in the database...")
    try:
        with engine.begin() as connection:
            for stmt in statements:
                # Catch exceptions on SQLite for drop columns since SQLite schemas in dev are dynamically recreated or cleaned
                try:
                    connection.execute(text(stmt + ";"))
                except Exception as ex:
                    if is_sqlite:
                        print(f"Non-critical warning on SQLite: {stmt[:40]}... (Reason: {ex})")
                    else:
                        raise ex
            print("SQL Migration completed successfully in the database.")
    except Exception as e:
        import traceback
        error_log = f"ERROR: {str(e)}\n\n{traceback.format_exc()}"
        with open("migration_global_docs_error.txt", "w", encoding="utf-8") as err_file:
            err_file.write(error_log)
        print("ERROR: Failed to apply global documentation CMS migration. See migration_global_docs_error.txt for details.")
        sys.exit(1)

if __name__ == "__main__":
    apply_migration()
