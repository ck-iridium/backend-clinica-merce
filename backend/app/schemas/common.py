from pydantic import BaseModel, Field
from typing import Optional, List

# --- Onboarding Wizard ---
class OnboardingSetupRequest(BaseModel):
    clinic_name: str
    logo_app_b64: Optional[str] = None
    industry: str = Field(..., description="Estética y Bienestar, Medicina Estética, Clínicas de Salud, Salones y Barberías")
    open_time: str = "09:00"
    close_time: str = "19:00"
    working_days: List[int] = [1, 2, 3, 4, 5]
    load_demo_data: bool = True
    work_modality: Optional[str] = "clinic_only"  # "clinic_only", "home_only", "both"
    location_name: Optional[str] = None
    location_address: Optional[str] = None
    location_phone: Optional[str] = None
    operations_center_address: Optional[str] = None
    max_coverage_radius_km: Optional[float] = 10.0

# --- BULK ACTIONS ---
class BulkActionPayload(BaseModel):
    ids: List[str]

class BulkStatusPayload(BaseModel):
    ids: List[str]
    is_active: bool
