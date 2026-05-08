from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# --- Users ---
class UserBase(BaseModel):
    email: EmailStr
    role: str = "client"

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Clients ---
class ClientBase(BaseModel):
    name: str
    phone: Optional[str] = None
    email: EmailStr
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    dni: Optional[str] = None
    address: Optional[str] = None

class ClientCreate(ClientBase):
    user_id: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    dni: Optional[str] = None
    address: Optional[str] = None

class ClientResponse(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# --- Service Categories ---
class ServiceCategoryBase(BaseModel):
    name: str
    image_url: Optional[str] = None

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryUpdate(ServiceCategoryBase):
    pass

class ServiceCategoryResponse(ServiceCategoryBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- Services ---
class ServiceBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    content_html: Optional[str] = None
    duration_minutes: int
    price: float
    is_active: bool = True
    is_featured: bool = False
    category_id: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    layout_preferences: Optional[Dict[str, Any]] = None

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    content_html: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    category_id: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    layout_preferences: Optional[Dict[str, Any]] = None

class ServiceResponse(ServiceBase):
    id: str
    created_at: datetime
    category: Optional['ServiceCategoryResponse'] = None
    
    class Config:
        from_attributes = True

# --- SETTINGS ---
class ClinicSettingsBase(BaseModel):
    clinic_name: Optional[str] = "Clínica Merce"
    clinic_nif: Optional[str] = ""
    clinic_address: Optional[str] = ""
    clinic_phone: Optional[str] = ""
    clinic_email: Optional[str] = ""
    legal_name: str = ""
    sanitary_register: Optional[str] = None
    
    # SMTP Config
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    smtp_use_tls: bool = True

    logo_app_b64: Optional[str] = None
    logo_pdf_b64: Optional[str] = None
    signature_b64: Optional[str] = None
    invoice_prefix: str
    invoice_next_number: int
    default_tax_rate: float = 21.0
    instagram_url: Optional[str] = None
    maps_url: Optional[str] = None
    allow_search_engine_indexing: bool = False
    whatsapp_number: Optional[str] = None
    booking_margin_hours: float = 2.0
    open_time: str = "09:00"
    close_time: str = "19:30"
    lunch_start: Optional[str] = None
    lunch_end: Optional[str] = None
    working_days: Optional[List[int]] = None

    ai_provider: Optional[str] = "gemini"
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    gemini_model_text: Optional[str] = None
    gemini_model_image: Optional[str] = None
    openai_model_text: Optional[str] = None
    openai_model_image: Optional[str] = None
    default_image_shot: Optional[str] = "conceptual"
    default_image_style: Optional[str] = "luxury"

class ClinicSettingsUpdate(BaseModel):
    clinic_name: Optional[str] = None
    clinic_nif: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_phone: Optional[str] = None
    clinic_email: Optional[str] = None
    legal_name: Optional[str] = None
    sanitary_register: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_user: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    smtp_use_tls: Optional[bool] = None
    logo_app_b64: Optional[str] = None
    logo_pdf_b64: Optional[str] = None
    signature_b64: Optional[str] = None
    invoice_prefix: Optional[str] = None
    invoice_next_number: Optional[int] = None
    default_tax_rate: Optional[float] = None
    instagram_url: Optional[str] = None
    maps_url: Optional[str] = None
    allow_search_engine_indexing: Optional[bool] = None
    whatsapp_number: Optional[str] = None
    booking_margin_hours: Optional[float] = None
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    lunch_start: Optional[str] = None
    lunch_end: Optional[str] = None
    working_days: Optional[List[int]] = None
    ai_provider: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    gemini_model_text: Optional[str] = None
    gemini_model_image: Optional[str] = None
    openai_model_text: Optional[str] = None
    openai_model_image: Optional[str] = None
    default_image_shot: Optional[str] = None
    default_image_style: Optional[str] = None

# --- Consents ---
class ConsentBase(BaseModel):
    client_id: str
    document_type: str
    document_title: str
    document_body: str
    signature_b64: str

class ConsentCreate(ConsentBase):
    pass

class ConsentResponse(ConsentBase):
    id: str
    signed_at: datetime
    
    class Config:
        from_attributes = True

from pydantic import field_validator

class ClinicSettingsResponse(ClinicSettingsBase):
    id: int

    @field_validator('working_days', mode='before')
    @classmethod
    def parse_working_days(cls, v):
        if isinstance(v, str):
            import json
            try:
                return json.loads(v)
            except Exception:
                return [1, 2, 3, 4, 5]
        return v

    @field_validator('gemini_api_key', 'openai_api_key', mode='after')
    @classmethod
    def obfuscate_api_keys(cls, v):
        if v and len(v) > 8:
            return f"{v[:4]}***{v[-4:]}"
        elif v:
            return "***"
        return v

    class Config:
        from_attributes = True

# --- Appointments ---
class AppointmentBase(BaseModel):
    client_id: str
    service_id: str
    start_time: datetime
    end_time: datetime
    status: str = "pending"
    notes: Optional[str] = None
    reminder_sent: bool = False

class AppointmentCreate(AppointmentBase):
    pass

class AppointmentUpdate(BaseModel):
    client_id: Optional[str] = None
    service_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class AppointmentResponse(AppointmentBase):
    id: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# --- Vouchers ---
class VoucherBase(BaseModel):
    client_id: str
    service_id: str
    total_sessions: int
    used_sessions: int = 0
    total_price: float
    amount_paid: float = 0.0
    payment_status: str = "pending"
    purchase_date: date
    expiration_date: date

class VoucherCreate(VoucherBase):
    pass

class VoucherUpdate(BaseModel):
    client_id: Optional[str] = None
    service_id: Optional[str] = None
    total_sessions: Optional[int] = None
    used_sessions: Optional[int] = None
    total_price: Optional[float] = None
    amount_paid: Optional[float] = None
    payment_status: Optional[str] = None
    purchase_date: Optional[date] = None
    expiration_date: Optional[date] = None

class VoucherResponse(VoucherBase):
    id: str
    
    class Config:
        from_attributes = True

# --- Voucher Templates ---
class VoucherTemplateBase(BaseModel):
    name: str
    service_id: str
    total_sessions: int
    price: float

class VoucherTemplateCreate(VoucherTemplateBase):
    pass

class VoucherTemplateResponse(VoucherTemplateBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Invoices ---
class InvoiceBase(BaseModel):
    client_id: str
    amount: float
    concept: str
    date: date
    status: str = "pending"
    tax_rate: float = 21.0
    is_simplified: bool = False

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    client_id: Optional[str] = None
    amount: Optional[float] = None
    concept: Optional[str] = None
    date: Optional[date] = None
    status: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: str
    
    class Config:
        from_attributes = True

class InvoiceKPIs(BaseModel):
    total_gross: float
    tax_base: float
    vat_quota: float

class PaginatedInvoicesResponse(BaseModel):
    total: int
    pages: int
    page: int
    kpis: InvoiceKPIs
    data: List[InvoiceResponse]



# --- Public Booking (Landing) ---
class PublicBookingRequest(BaseModel):
    # Client identification (used to find-or-create)
    client_name: str
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    # Appointment details
    service_id: str
    start_time: datetime
    notes: Optional[str] = None

class PublicBookingResponse(BaseModel):
    appointment_id: str
    client_id: str
    is_new_client: bool
    start_time: datetime
    end_time: datetime
    status: str

class AvailabilityResponse(BaseModel):
    date: str
    service_id: str
    available_slots: List[str]  # e.g. ["09:30", "10:00", "16:30"]

# --- Time Blocks ---
class TimeBlockBase(BaseModel):
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = None
    is_annual_holiday: bool = False

class TimeBlockCreate(TimeBlockBase):
    pass

class TimeBlockUpdate(ModelMetaclass if 'ModelMetaclass' in globals() else BaseModel): # Standard Pydantic update pattern
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reason: Optional[str] = None
    is_annual_holiday: Optional[bool] = None

class TimeBlockResponse(TimeBlockBase):
    id: str
    class Config:
        from_attributes = True

# --- Direct Sale (POS) ---
class DirectSaleRequest(BaseModel):
    client_id: str
    service_id: str
    final_price: float
    payment_method: str  # e.g. "Efectivo", "Tarjeta"
    is_simplified: bool = False

# --- Site Content (CMS) ---
class SiteContentBase(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_button_text: Optional[str] = None
    hero_button_link: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_alignment: Optional[str] = "center"
    
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_link: Optional[str] = None
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

class SiteContentUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_button_text: Optional[str] = None
    hero_button_link: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_alignment: Optional[str] = None
    
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_link: Optional[str] = None
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

class SiteContentResponse(SiteContentBase):
    id: int
    
    class Config:
        from_attributes = True

# --- AI Integration ---
class AIGenerationRequest(BaseModel):
    prompt: str
    type: str  # "description" or "seo"
    tone: str = "premium" # "premium", "cercano", "clinico"

class AIImageGenerationRequest(BaseModel):
    prompt: str
    aspect_ratio: str  # "1:1", "16:9", "9:16"
    shot_type: str = "conceptual"
    visual_style: str = "luxury"

class OptimizePromptRequest(BaseModel):
    service_name: str
    description: Optional[str] = ""
    content_html: Optional[str] = ""
