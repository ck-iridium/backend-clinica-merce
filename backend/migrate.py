from app.database import engine
from sqlalchemy import text

print("Connecting to database...")
with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE vouchers ADD COLUMN total_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00;"))
        print("Añadida columna total_price a vouchers")
    except Exception as e:
        print("Nota: vouchers.total_price ya existe o hubo un error.")
        
    try:
        conn.execute(text("ALTER TABLE invoices ADD COLUMN concept VARCHAR NOT NULL DEFAULT 'Bono';"))
        print("Añadida columna concept a invoices")
    except Exception as e:
         print("Nota: invoices.concept ya existe o hubo un error.")
         
    conn.commit()
print("¡Migración (ALTER TABLE) completada con éxito!")
