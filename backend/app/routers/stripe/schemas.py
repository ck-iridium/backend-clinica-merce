from pydantic import BaseModel, Field

class OnboardingSessionRequest(BaseModel):
    tenant_name: str = Field(..., min_length=2)
    tenant_slug: str = Field(..., min_length=2, pattern=r"^[a-z0-9-]+$")
    admin_email: str
    admin_name: str
    admin_password: str
    plan_type: str = "gold"  # free, basic, pro, gold

class CreateSubscriptionSessionRequest(BaseModel):
    tenant_id: str
    plan_type: str  # "basic", "pro", "gold"

class OnboardingCompleteSetupRequest(BaseModel):
    tenant_id: str
    clinic_name: str
    sector: str
    logo_app_b64: str | None = None
    open_time: str
    close_time: str
    working_days: str  # "[1,2,3,4,5]"
    initial_service: dict  # { name, price, duration_minutes }
