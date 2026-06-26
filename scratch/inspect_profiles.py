import os
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres.ypimdbkiuguiszaddzaj:Az0203836541@aws-1-eu-north-1.pooler.supabase.com:5432/postgres?sslmode=require"
engine = create_engine(DATABASE_URL)

def run_query(query, params=None):
    with engine.connect() as conn:
        result = conn.execute(text(query), params or {})
        if result.returns_rows:
            return [dict(row._mapping) for row in result]
        return None

print("--- PROFILES IN DB ---")
profiles = run_query("SELECT id, full_name, role, status FROM profiles")
for p in profiles:
    print(p)
