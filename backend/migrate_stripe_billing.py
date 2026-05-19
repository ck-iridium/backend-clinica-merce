from app.database import engine
from sqlalchemy import text

print("Iniciando conexión a base de datos PostgreSQL (Supabase)...")
with engine.connect() as conn:
    # 1. stripe_subscription_id
    try:
        conn.execute(text("ALTER TABLE tenants ADD COLUMN stripe_subscription_id VARCHAR;"))
        print("Añadida columna stripe_subscription_id a la tabla tenants")
    except Exception as e:
        print("Nota: tenants.stripe_subscription_id ya existe o hubo un error.")

    # 2. plan_type
    try:
        conn.execute(text("ALTER TABLE tenants ADD COLUMN plan_type VARCHAR DEFAULT 'free' NOT NULL;"))
        print("Añadida columna plan_type a la tabla tenants")
    except Exception as e:
        print("Nota: tenants.plan_type ya existe o hubo un error.")

    # 3. subscription_expires_at
    try:
        conn.execute(text("ALTER TABLE tenants ADD COLUMN subscription_expires_at TIMESTAMP;"))
        print("Añadida columna subscription_expires_at a la tabla tenants")
    except Exception as e:
        print("Nota: tenants.subscription_expires_at ya existe o hubo un error.")

    conn.commit()
print("¡Migración (Stripe SaaS Billing) completada con éxito!")
