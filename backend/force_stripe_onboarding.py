import stripe
import os
import time

# Configuración manual con los datos del entorno
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY")
ACCOUNT_ID = "acct_1TX86LRnLyKVYmdm"

stripe.api_key = STRIPE_SECRET_KEY

print(f"Iniciando actualización forzosa para la cuenta: {ACCOUNT_ID}")

try:
    # Intentamos actualizar lo que Stripe nos permita vía API para una cuenta Express
    account = stripe.Account.modify(
        ACCOUNT_ID,
        business_profile={
            'url': 'https://merce-estetica.local',
            'mcc': '7230' 
        },
        capabilities={
            'card_payments': {'requested': True},
            'transfers': {'requested': True},
        }
        # tos_acceptance eliminado ya que Stripe lo bloquea vía API para Express
    )
    
    print("--- 200 OK ---")
    print(f"ID Cuenta: {account.id}")
    print(f"Charges Enabled: {account.charges_enabled}")
    print(f"Details Submitted: {account.details_submitted}")
    print(f"Capabilities: {account.capabilities}")
    
except Exception as e:
    print(f"--- ERROR STRIPE ---")
    print(str(e))
