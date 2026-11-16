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


def resolve_stripe_price_id(plan: str | None = None, interval: str | None = None) -> tuple[str | None, str, str]:
    """
    Selecciona dinámicamente la variable STRIPE_PRICE_* según plan ('individual', 'pro', 'elite')
    e interval ('monthly', 'yearly'). Si no se encuentra, usa STRIPE_PRICE_ID como fallback.
    """
    raw_plan = (plan or "pro").lower().strip()
    if raw_plan in ("basic", "individual", "autonomo"):
        canonical_plan = "individual"
    elif raw_plan in ("gold", "elite", "vip"):
        canonical_plan = "elite"
    else:
        canonical_plan = "pro"

    raw_interval = (interval or "monthly").lower().strip()
    canonical_interval = "yearly" if raw_interval in ("yearly", "year", "anual", "annual") else "monthly"

    env_var_name = f"STRIPE_PRICE_{canonical_plan.upper()}_{canonical_interval.upper()}"
    price_id = os.environ.get(env_var_name)

    # Fallback si no está configurada la variable específica
    if not price_id or price_id.strip() == "":
        price_id = os.environ.get("STRIPE_PRICE_ID")

    if price_id:
        price_id = price_id.strip()

    return price_id, canonical_plan, canonical_interval


def build_line_items(price_id: str | None, canonical_plan: str, canonical_interval: str):
    """
    Genera los line_items para Checkout Session. Si hay price_id configurado (Stripe Live),
    usa directamente el precio oficial de Stripe. De lo contrario, genera price_data dinámico.
    """
    if price_id and (price_id.startswith("price_") or price_id.startswith("plan_")):
        return [{
            "price": price_id,
            "quantity": 1,
        }]

    plan_amounts = {
        ("individual", "monthly"): 3900,
        ("individual", "yearly"): 39000,
        ("pro", "monthly"): 6900,
        ("pro", "yearly"): 69000,
        ("elite", "monthly"): 12900,
        ("elite", "yearly"): 129000,
    }
    plan_names = {
        "individual": "Plan Individual - ProBookia SaaS",
        "pro": "Plan Pro - ProBookia SaaS",
        "elite": "Plan Elite - ProBookia SaaS",
    }
    amount = plan_amounts.get((canonical_plan, canonical_interval), 6900)
    name = plan_names.get(canonical_plan, "Plan Pro - ProBookia SaaS")
    rec_interval = "year" if canonical_interval == "yearly" else "month"

    return [{
        "price_data": {
            "currency": "eur",
            "product_data": {
                "name": name,
                "description": f"Suscripción {canonical_interval} ProBookia SaaS",
            },
            "unit_amount": amount,
            "recurring": {"interval": rec_interval}
        },
        "quantity": 1,
    }]


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
        plan_type: str = "pro",
        interval: str = "monthly",
        plan: str | None = None
    ) -> str:
        """
        Crea una Checkout Onboarding Session en Stripe para nuevos suscriptores con plan dinámico.
        """
        stripe.api_key = get_stripe_key()

        target_plan = plan or plan_type or "pro"
        price_id, canonical_plan, canonical_interval = resolve_stripe_price_id(target_plan, interval)
        line_items = build_line_items(price_id, canonical_plan, canonical_interval)

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                line_items=line_items,
                mode="subscription",
                subscription_data={
                    "trial_period_days": 14,
                    "metadata": {
                        "plan": canonical_plan,
                        "plan_type": canonical_plan,
                        "interval": canonical_interval,
                        "is_platform_onboarding": "true"
                    }
                },
                payment_method_collection="always",
                success_url=f"{frontend_url}/onboarding/success?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{frontend_url}/#precios",
                metadata={
                    "type": "saas_onboarding",
                    "plan": canonical_plan,
                    "plan_type": canonical_plan,
                    "interval": canonical_interval,
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
        plan_type: str | None = "pro",
        stripe_customer_id: str | None = None,
        frontend_url: str = "https://www.probookia.com",
        interval: str = "monthly",
        plan: str | None = None
    ) -> str:
        """
        Crea una Checkout Session para actualizaciones de suscripción de inquilinos existentes.
        """
        stripe.api_key = get_stripe_key()

        target_plan = plan or plan_type or "pro"
        price_id, canonical_plan, canonical_interval = resolve_stripe_price_id(target_plan, interval)
        line_items = build_line_items(price_id, canonical_plan, canonical_interval)

        session_params = {
            "payment_method_types": ["card"],
            "line_items": line_items,
            "mode": "subscription",
            "subscription_data": {
                "metadata": {
                    "plan": canonical_plan,
                    "plan_type": canonical_plan,
                    "interval": canonical_interval,
                    "tenant_id": tenant_id
                }
            },
            "success_url": f"{frontend_url}/dashboard/settings?billing_success=true&session_id={{CHECKOUT_SESSION_ID}}",
            "cancel_url": f"{frontend_url}/dashboard/settings?billing_cancel=true",
            "metadata": {
                "type": "saas_subscription_update",
                "tenant_id": tenant_id,
                "plan": canonical_plan,
                "plan_type": canonical_plan,
                "interval": canonical_interval
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
    def retrieve_checkout_session(session_id: str, expand: list = None):
        """
        Recupera una sesión de checkout específica de Stripe por su ID,
        permitiendo expandir relaciones como ['subscription', 'customer'].
        """
        stripe.api_key = get_stripe_key()
        try:
            if expand:
                return stripe.checkout.Session.retrieve(session_id, expand=expand)
            return stripe.checkout.Session.retrieve(session_id)
        except Exception as e:
            # Fallback seguro sin expand por si la sesión no admite alguna expansión
            try:
                return stripe.checkout.Session.retrieve(session_id)
            except Exception as e2:
                raise HTTPException(status_code=400, detail=str(e2))
