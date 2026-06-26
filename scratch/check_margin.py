import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres.ypimdbkiuguiszaddzaj:Az0203836541@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require"
engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    res = conn.execute(text("SELECT id, tenant_id, booking_margin_hours FROM clinic_settings"))
    for row in res:
        print(row._mapping)
