import os
import sys
import uuid
from sqlalchemy import text
from datetime import datetime

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal

DEFAULT_TEMPLATES = [
    {
        "title": "Tratamiento de Datos Personales (Ley General RGPD)",
        "body_text": "Don/Doña {name} manifiesto que he sido debidamente informado/a y he comprendido la naturaleza y propósito del tratamiento seleccionado, así como las posibles complicaciones, riesgos generales e infrecuentes asociados al mismo.\n\nAdicionalmente, presto mi consentimiento EXPRESO, de acuerdo a la Ley Orgánica 3/2018 de Protección de Datos Personales y garantía de los derechos digitales (LOPDGDD) y el Reglamento (UE) 2016/679 (RGPD), para el uso, tratamiento y archivo de mis datos personales, historial clínico y fotografías con fines de diagnóstico y evolución médica.\n\nCon la firma del presente documento, asumo que he tenido la oportunidad de aclarar dudas y realizo la aceptación del tratamiento propuesto de forma libre y voluntaria."
    },
    {
        "title": "Consentimiento Informado: Depilación Láser",
        "body_text": "Don/Doña {name} autorizo la realización del tratamiento de depilación láser. He sido informado/a de que el procedimiento consiste en la eliminación del vello mediante energía lumínica y que requiere varias sesiones.\n\nComprendo los riesgos potenciales, incluyendo enrojecimiento temporal, irritación cutánea o leves quemaduras superficiales. Me comprometo a seguir las pautas post-tratamiento indicadas por el especialista, especialmente evitar la exposición solar directa.\n\nManifiesto no estar embarazada ni bajo medicación fotosensible incompatible con el tratamiento."
    },
    {
        "title": "Consentimiento Informado: Toxina Botulínica",
        "body_text": "Don/Doña {name} presto mi consentimiento para la infiltración de Toxina Botulínica con fines estéticos para la atenuación de arrugas de expresión.\n\nHe sido informado/a de los posibles efectos secundarios, tales como pequeños hematomas, asimetrías transitorias o dolor en la zona de inyección. Comprendo que los resultados son temporales (de 4 a 6 meses de duración aproximada) y que los cuidados posteriores inmediatos incluyen evitar tumbarse o masajear la zona en las 4 horas siguientes al tratamiento."
    },
    {
        "title": "Consentimiento Informado: Rellenos Faciales",
        "body_text": "Don/Doña {name} autorizo el tratamiento de relleno facial mediante infiltración de Ácido Hialurónico.\n\nComprendo que el objetivo es aportar volumen o rellenar surcos faciales y que es un material reabsorbible. He sido informado/a de los efectos adversos frecuentes (inflamación superficial, sensibilidad o pequeños hematomas) e infrecuentes (nódulos o asimetrías). Acepto de forma libre y voluntaria el procedimiento."
    }
]

def apply_migration():
    sql_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "migrations", "03_create_consent_templates.sql")
    if not os.path.exists(sql_path):
        print(f"Error: SQL file not found at {sql_path}")
        sys.exit(1)
        
    with open(sql_path, "r", encoding="utf-8") as f:
        sql_content = f.read()

    is_sqlite = engine.url.drivername.startswith("sqlite")
    statements = []
    
    for statement in sql_content.split(";"):
        stmt = statement.strip()
        if not stmt:
            continue
        
        if is_sqlite:
            lower_stmt = stmt.lower()
            if "row level security" in lower_stmt or "policy" in lower_stmt or "current_setting" in lower_stmt:
                print(f"Skipping PG-only statement on SQLite: {stmt[:60]}...")
                continue
                
        statements.append(stmt)

    print("Connecting and applying consent templates database migration...")
    try:
        with engine.begin() as connection:
            for stmt in statements:
                try:
                    # If column already exists in SQLite/PG, ignore error
                    if "add column enable_consents" in stmt.lower():
                        try:
                            connection.execute(text(stmt + ";"))
                        except Exception as col_ex:
                            print(f"Column enable_consents already exists or couldn't be added directly: {col_ex}")
                    else:
                        connection.execute(text(stmt + ";"))
                except Exception as ex:
                    if is_sqlite:
                        print(f"Non-critical warning on SQLite: {stmt[:40]}... (Reason: {ex})")
                    else:
                        # In Postgres we do ADD COLUMN IF NOT EXISTS or handle gracefully
                        if "enable_consents" in stmt.lower() and "already exists" in str(ex).lower():
                            print("Column enable_consents already exists.")
                        else:
                            raise ex
                            
        print("SQL Migration completed successfully in the database.")
        
        # Now seed default templates for all existing tenants
        seed_default_templates()
        
    except Exception as e:
        import traceback
        error_log = f"ERROR: {str(e)}\n\n{traceback.format_exc()}"
        with open("migration_consent_templates_error.txt", "w", encoding="utf-8") as err_file:
            err_file.write(error_log)
        print("ERROR: Failed to apply consent templates migration. See migration_consent_templates_error.txt for details.")
        sys.exit(1)

def seed_default_templates():
    print("Seeding default templates for all existing tenants...")
    db = SessionLocal()
    try:
        # Fetch all tenants
        tenants = db.execute(text("SELECT id FROM tenants")).fetchall()
        for tenant in tenants:
            tenant_id = tenant[0]
            # Check if tenant already has templates
            res = db.execute(
                text("SELECT COUNT(*) FROM consent_templates WHERE tenant_id = :tenant_id"),
                {"tenant_id": tenant_id}
            ).scalar()
            
            if res == 0:
                print(f"Seeding templates for tenant {tenant_id}...")
                for template in DEFAULT_TEMPLATES:
                    db.execute(
                        text("INSERT INTO consent_templates (id, tenant_id, title, body_text, created_at, updated_at) VALUES (:id, :tenant_id, :title, :body_text, :created_at, :updated_at)"),
                        {
                            "id": str(uuid.uuid4()),
                            "tenant_id": tenant_id,
                            "title": template["title"],
                            "body_text": template["body_text"],
                            "created_at": datetime.utcnow(),
                            "updated_at": datetime.utcnow()
                        }
                    )
        db.commit()
        print("Seeding completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error seeding templates: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    apply_migration()
