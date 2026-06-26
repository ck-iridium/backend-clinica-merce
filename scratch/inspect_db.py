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

tenant_id = "00000000-0000-0000-0000-000000000001"

print("--- ALL STAFF SCHEDULES IN DB ---")
scheds = run_query("SELECT * FROM staff_schedules")
for s in scheds:
    print(s)

print("\n--- ALL USERS IN DB FOR THIS TENANT ---")
users = run_query("SELECT id, email, role FROM users WHERE tenant_id = :tid", {"tid": tenant_id})
for u in users:
    print(u)
