import os
import stripe
from fastapi import HTTPException

def get_stripe_key() -> str:
    """
    Recupera la clave secreta de Stripe desde las variables de entorno.
    """
    key = os.environ.get("STRIPE_SECRET_KEY")
    if not key:
        raise HTTPException(status_code=500, detail="Falta STRIPE_SECRET_KEY")
    return key

class StripeService:
    """
    Servicio de integración para la API oficial de Stripe.
    Aísla por completo el SDK de Stripe del resto del backend.
    """

    @staticmethod
    def create_onboarding_session(
        tenant_name: str,
        tenant_slug: str,
        admin_email: str,
        admin_name: str,
        admin_password: str,
        frontend_url: str,
        plan_type: str = "gold"
    ) -> str:
        """
        Crea una Checkout Onboarding Session en Stripe para nuevos suscriptores con plan dinámico.
        """
        stripe.api_key = get_stripe_key()
        
        plan_details = {
            "basic": {
                "name": "Plan Básico - ProBookia SaaS",
                "description": "Suscripción mensual de gestión estándar y agenda",
                "amount": 2900,
            },
            "pro": {
                "name": "Plan Pro - ProBookia SaaS",
                "description": "Suscripción mensual de gestión avanzada de reservas",
                "amount": 5900,
            },
            "gold": {
                "name": "Plan Elite Gold - ProBookia SaaS",
                "description": "Suscripción mensual de reservas premium con IA ilimitada",
                "amount": 9900,
            }
        }
        
        selected_plan = plan_type.lower()
        if selected_plan not in plan_details:
            selected_plan = "gold"  # Fallback a gold por defecto
            
        details = plan_details[selected_plan]
        
        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=[{
                    "price_data": {
                        "currency": "eur",
                        "product_data": {
                            "name": details["name"],
                            "description": details["description"],
                        },
                        "unit_amount": details["amount"],
                        "recurring": {"interval": "month"}
                    },
                    "quantity": 1,
                }],
                mode="subscription",
                subscription_data={
                    "metadata": {
                        "plan_type": selected_plan,
                        "is_platform_onboarding": "true"
                    }
                },
                success_url=f"{frontend_url}/onboarding/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{frontend_url}/marketing",
                metadata={
                    "type": "saas_onboarding",
                    "plan_type": selected_plan,
                    "is_platform_onboarding": "true",
                    "tenant_name": tenant_name,
                    "tenant_slug": tenant_slug,
                    "admin_email": admin_email,
                    "admin_name": admin_name,
                    "admin_password": admin_password,
                }
            )
            return session.url
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_subscription_session(
        tenant_id: str,
        plan_type: str,
        stripe_customer_id: str | None,
        frontend_url: str
    ) -> str:
        """
        Crea una Checkout Session para actualizaciones de suscripción de inquilinos existentes.
        """
        stripe.api_key = get_stripe_key()
        
        plan_details = {
            "basic": {
                "name": "Plan Básico - ProBookia SaaS",
                "description": "Acceso estándar y agenda para equipos pequeños",
                "amount": 2900,
            },
            "pro": {
                "name": "Plan Pro - ProBookia SaaS",
                "description": "Suscripción mensual de gestión avanzada",
                "amount": 5900,
            },
            "gold": {
                "name": "Plan Elite Gold - ProBookia SaaS",
                "description": "Acceso premium total con asistentes de Inteligencia Artificial",
                "amount": 9900,
            }
        }
        
        selected_plan = plan_type.lower()
        if selected_plan not in plan_details:
            raise HTTPException(status_code=400, detail="Tipo de plan no válido. Debe ser basic, pro o gold")
            
        details = plan_details[selected_plan]
        
        session_params = {
            "payment_method_types": ["card"],
            "line_items": [{
                "price_data": {
                    "currency": "eur",
                    "product_data": {
                        "name": details["name"],
                        "description": details["description"],
                    },
                    "unit_amount": details["amount"],
                    "recurring": {"interval": "month"}
                },
                "quantity": 1,
            }],
            "mode": "subscription",
            "subscription_data": {
                "metadata": {
                    "plan_type": selected_plan,
                    "tenant_id": tenant_id
                }
            },
            "success_url": f"{frontend_url}/super-admin?session_id={{CHECKOUT_SESSION_ID}}&tenant_id={tenant_id}&billing_success=true",
            "cancel_url": f"{frontend_url}/super-admin?tenant_id={tenant_id}&billing_cancel=true",
            "metadata": {
                "type": "saas_subscription_update",
                "tenant_id": tenant_id,
                "plan_type": selected_plan
            }
        }
        
        if stripe_customer_id:
            session_params["customer"] = stripe_customer_id
            
        try:
            session = stripe.checkout.Session.create(**session_params)
            return session.url
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_connect_account(email: str | None) -> str:
        """
        Crea una cuenta Stripe Connect Standard para el negocio.
        """
        stripe.api_key = get_stripe_key()
        try:
            account = stripe.Account.create(type="standard", country="ES", email=email)
            return account.id
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def create_connect_account_link(account_id: str, frontend_url: str) -> str:
        """
        Crea un enlace para el flujo de onboarding de Stripe Connect.
        """
        stripe.api_key = get_stripe_key()
        try:
            account_link = stripe.AccountLink.create(
                account=account_id,
                refresh_url=f"{frontend_url}/dashboard/settings?stripe_refresh=true",
                return_url=f"{frontend_url}/dashboard/settings?stripe_return=true",
                type="account_onboarding",
            )
            return account_link.url
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def retrieve_connect_account_charges_enabled(account_id: str) -> bool:
        """
        Recupera el estado de cargas habilitadas de una cuenta de Stripe Connect.
        """
        stripe.api_key = get_stripe_key()
        try:
            account = stripe.Account.retrieve(account_id)
            return account.charges_enabled
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))

    @staticmethod
    def construct_event(payload: bytes, sig_header: str | None) -> dict:
        """
        Verifica y construye un evento de webhook de Stripe de forma segura utilizando
        las firmas correspondientes.
        """
        stripe.api_key = get_stripe_key()
        webhook_secret = os.environ.get("STRIPE_WEBHOOK_SECRET")
        
        if not sig_header or not webhook_secret:
            return {"status": "ignored"}
            
        try:
            event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
            return event
        except stripe.error.SignatureVerificationError:
            connect_secret = os.environ.get("STRIPE_CONNECT_WEBHOOK_SECRET")
            if connect_secret:
                try:
                    event = stripe.Webhook.construct_event(payload, sig_header, connect_secret)
                    return event
                except:
                    raise HTTPException(status_code=400, detail="Invalid signature")
            else:
                raise HTTPException(status_code=400, detail="Invalid signature")

    @staticmethod
    def retrieve_checkout_session(session_id: str):
        """
        Recupera una sesión de checkout específica de Stripe por su ID.
        """
        stripe.api_key = get_stripe_key()
        try:
            return stripe.checkout.Session.retrieve(session_id)
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
