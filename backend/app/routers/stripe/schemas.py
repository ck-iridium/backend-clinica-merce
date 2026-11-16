from pydantic import BaseModel, Field
from typing import Optional

class OnboardingSessionRequest(BaseModel):
    tenant_name: str = Field(..., min_length=2)
    tenant_slug: str = Field(..., min_length=2, pattern=r"^[a-z0-9-]+$")
    admin_email: Optional[str] = None
    email: Optional[str] = None
    admin_name: str
    admin_password: str
    plan_type: Optional[str] = "pro"  # individual, pro, elite (compat: basic, gold)
    plan: Optional[str] = None        # individual, pro, elite
    interval: Optional[str] = "monthly"  # monthly, yearly

class CreateSubscriptionSessionRequest(BaseModel):
    tenant_id: str
    plan_type: Optional[str] = "pro"
    plan: Optional[str] = None
    interval: Optional[str] = "monthly"  # monthly, yearly
    email: Optional[str] = None

class OnboardingCompleteSetupRequest(BaseModel):
    tenant_id: str
    clinic_name: str
    sector: str
    logo_app_b64: str | None = None
    open_time: str
    close_time: str
    working_days: str  # "[1,2,3,4,5]"
    initial_service: dict  # { name, price, duration_minutes }
