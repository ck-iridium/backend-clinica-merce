import stripe
import os

stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
ACCOUNT_ID = 'acct_1TXIBmD72oOl6zOO'

print(f"--- DIAGNÓSTICO PARA {ACCOUNT_ID} ---")

try:
    # 1. Recuperar cuenta
    account = stripe.Account.retrieve(ACCOUNT_ID)
    print(f"Cargos habilitados: {account.charges_enabled}")
    print(f"Capacidades: {account.capabilities}")
    
    # 2. Intentar crear un pago
    pi = stripe.PaymentIntent.create(
        amount=100, 
        currency='eur', 
        stripe_account=ACCOUNT_ID,
        automatic_payment_methods={'enabled': True}
    )
    print(f"¡ÉXITO! PaymentIntent creado: {pi.id}")

except Exception as e:
    print(f"ERROR: {str(e)}")
