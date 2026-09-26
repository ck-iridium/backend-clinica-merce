"""
Módulo Facade de Stripe Payments.
Agrupa y re-exporta los submódulos de dominio especializados de Stripe:
- stripe.onboarding: Aprovisionamiento y configuración de tenants SaaS.
- stripe.billing: Suscripciones y facturación de la plataforma.
- stripe.connect: Cuentas conectadas de Stripe Connect para clínicas.
- stripe.appointments: Verificación y consulta de pagos de citas.
- stripe.webhooks: Despachador de eventos y validación criptográfica de webhooks.
"""

from .stripe import router
from .stripe.utils import extract_and_fallback_onboarding_data
from .stripe.schemas import (
    OnboardingSessionRequest,
    CreateSubscriptionSessionRequest,
    OnboardingCompleteSetupRequest,
)

__all__ = [
    "router",
    "extract_and_fallback_onboarding_data",
    "OnboardingSessionRequest",
    "CreateSubscriptionSessionRequest",
    "OnboardingCompleteSetupRequest",
]
