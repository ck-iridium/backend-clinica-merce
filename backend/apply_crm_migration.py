import os
import sys
from sqlalchemy import text, inspect

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal
from app import models

def run_migration():
    inspector = inspect(engine)
    is_sqlite = engine.url.drivername.startswith("sqlite")
    
    # 1. Modify clinic_settings
    settings_cols = [c["name"] for c in inspector.get_columns("clinic_settings")]
    with engine.begin() as connection:
        if "business_sector" not in settings_cols:
            print("Adding business_sector to clinic_settings...")
            # For SQLite, we cannot easily ADD COLUMN with NOT NULL and without a DEFAULT unless it is nullable first or has a DEFAULT.
            # We add it as default 'general'
            connection.execute(text("ALTER TABLE clinic_settings ADD COLUMN business_sector VARCHAR DEFAULT 'general' NOT NULL;"))
            
    # 2. Modify clients
    client_cols = [c["name"] for c in inspector.get_columns("clients")]
    new_client_cols = {
        "first_name": "VARCHAR",
        "last_name": "VARCHAR",
        "service_address": "VARCHAR",
        "service_postal_code": "VARCHAR",
        "service_city": "VARCHAR",
        "service_latitude": "FLOAT",
        "service_longitude": "FLOAT",
        "billing_name": "VARCHAR",
        "billing_nif": "VARCHAR",
        "billing_address": "VARCHAR",
        "billing_postal_code": "VARCHAR",
        "billing_city": "VARCHAR",
        "sector_metadata": "JSON" if is_sqlite else "JSONB"
    }
    
    with engine.begin() as connection:
        for col, col_type in new_client_cols.items():
            if col not in client_cols:
                print(f"Adding {col} to clients...")
                connection.execute(text(f"ALTER TABLE clients ADD COLUMN {col} {col_type};"))
                
    # 3. Migrate data
    db = SessionLocal()
    try:
        # A. Populate first_name / last_name and addresses for existing clients
        clients = db.query(models.Client).all()
        print(f"Migrating data for {len(clients)} clients...")
        for client in clients:
            updated = False
            # If name exists but first_name is empty, split it
            if client.name and not client.first_name:
                parts = client.name.strip().split(" ", 1)
                client.first_name = parts[0]
                if len(parts) > 1:
                    client.last_name = parts[1]
                updated = True
                
            # If first_name is still null, set it to name or fallback
            if not client.first_name:
                client.first_name = client.name or "Cliente"
                updated = True
                
            # Populate service_address / billing_address from old address
            if client.address:
                if not client.service_address:
                    client.service_address = client.address
                    client.service_postal_code = client.client_postal_code
                    client.service_city = client.client_city
                    client.service_latitude = client.client_latitude
                    client.service_longitude = client.client_longitude
                    updated = True
                if not client.billing_address:
                    client.billing_name = client.name
                    client.billing_nif = client.dni
                    client.billing_address = client.address
                    client.billing_postal_code = client.client_postal_code
                    client.billing_city = client.client_city
                    updated = True
            
            # Initialize sector_metadata
            if client.sector_metadata is None:
                client.sector_metadata = {}
                updated = True
                
            # If clinic Merce has medical data, we can initialize clinical metadata
            if client.medical_history or client.allergies:
                if not client.sector_metadata:
                    client.sector_metadata = {
                        "allergies": client.allergies or "",
                        "clinical_notes": client.medical_history or "",
                        "injury_history": "",
                        "medications": "",
                        "has_consents": False
                    }
                    updated = True
                    
            if updated:
                db.add(client)
                
        # B. Set business_sector to 'clinical' for current tenants (Estética Mercè)
        settings = db.query(models.ClinicSettings).all()
        for setting in settings:
            if "merc" in setting.clinic_name.lower():
                setting.business_sector = "clinical"
            else:
                setting.business_sector = "general"
            db.add(setting)
            
        db.commit()
        print("Data migration completed successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error migrating data: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
