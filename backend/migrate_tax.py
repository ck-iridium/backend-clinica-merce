from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN default_tax_rate NUMERIC(5, 2) DEFAULT 21.0;"))
    except Exception as e:
        print("default_tax_rate col exists")
    
    try:
        conn.execute(text("ALTER TABLE invoices ADD COLUMN tax_rate NUMERIC(5, 2) DEFAULT 21.0;"))
    except Exception as e:
        print("tax_rate col exists")
    conn.commit()
print('Migración IMPUESTOS/IVA completada')
