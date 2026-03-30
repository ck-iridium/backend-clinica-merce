import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def run_migration():
    print(f"Conectando a {DATABASE_URL}")
    conn = psycopg2.connect(DATABASE_URL)
    cursor = conn.cursor()

    try:
        # Create voucher_templates table
        print("Creando tabla voucher_templates...")
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS voucher_templates (
                id VARCHAR(36) PRIMARY KEY,
                name VARCHAR NOT NULL,
                service_id VARCHAR(36) NOT NULL REFERENCES services(id),
                total_sessions INTEGER NOT NULL,
                price NUMERIC(10, 2) NOT NULL,
                created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        """)

        # Alter vouchers table to add financial fields
        print("Modificando tabla vouchers (Añadiendo amount_paid y payment_status)...")
        # Ensure idempotent execution
        cursor.execute("""
            ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS amount_paid NUMERIC(10, 2) DEFAULT 0.0;
            ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS payment_status VARCHAR DEFAULT 'pending';
        """)

        conn.commit()
        print("Migración de bonos completada con éxito.")

    except Exception as e:
        conn.rollback()
        print(f"Error durante la migración: {e}")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    run_migration()
