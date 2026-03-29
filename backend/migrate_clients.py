from app.database import engine
from sqlalchemy import text

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE clients ADD COLUMN dni VARCHAR;"))
    except Exception as e:
        print("DNI col exists")
    try:
        conn.execute(text("ALTER TABLE clients ADD COLUMN address VARCHAR;"))
    except Exception as e:
        print("Address col exists")
    conn.commit()
print('Migración DNI/Address completada')
