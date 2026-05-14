from app.database import engine
from sqlalchemy import text

print("Connecting to database...")
with engine.connect() as conn:
    # 1. ClinicSettings
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN stripe_account_id VARCHAR;"))
        print("Añadida columna stripe_account_id a clinic_settings")
    except Exception as e:
        print("Nota: clinic_settings.stripe_account_id ya existe o hubo un error.")
        
    try:
        conn.execute(text("ALTER TABLE clinic_settings ADD COLUMN stripe_charges_enabled BOOLEAN DEFAULT FALSE;"))
        print("Añadida columna stripe_charges_enabled a clinic_settings")
    except Exception as e:
        print("Nota: clinic_settings.stripe_charges_enabled ya existe o hubo un error.")

    # 2. Services
    try:
        conn.execute(text("ALTER TABLE services ADD COLUMN requires_deposit BOOLEAN DEFAULT FALSE;"))
        print("Añadida columna requires_deposit a services")
    except Exception as e:
        print("Nota: services.requires_deposit ya existe o hubo un error.")
        
    try:
        conn.execute(text("ALTER TABLE services ADD COLUMN deposit_amount NUMERIC(10, 2);"))
        print("Añadida columna deposit_amount a services")
    except Exception as e:
        print("Nota: services.deposit_amount ya existe o hubo un error.")

    # 3. Appointments
    try:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN payment_status VARCHAR DEFAULT 'pending';"))
        print("Añadida columna payment_status a appointments")
    except Exception as e:
        print("Nota: appointments.payment_status ya existe o hubo un error.")
        
    try:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN stripe_payment_intent_id VARCHAR;"))
        print("Añadida columna stripe_payment_intent_id a appointments")
    except Exception as e:
        print("Nota: appointments.stripe_payment_intent_id ya existe o hubo un error.")
        
    try:
        conn.execute(text("ALTER TABLE appointments ADD COLUMN stripe_checkout_session_id VARCHAR;"))
        print("Añadida columna stripe_checkout_session_id a appointments")
    except Exception as e:
        print("Nota: appointments.stripe_checkout_session_id ya existe o hubo un error.")

    conn.commit()
print("¡Migración (Stripe Connect) completada con éxito!")
