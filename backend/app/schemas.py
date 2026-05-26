from pydantic import BaseModel, EmailStr, Field
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
    slug: Optional[str] = None
    description: Optional[str] = None
    seo_description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    order_index: Optional[int] = 0
    layout_preferences: Optional[Dict[str, Any]] = None

class CategoryReorderItem(BaseModel):
    id: str
    order_index: int

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    seo_description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None
    layout_preferences: Optional[Dict[str, Any]] = None

class ServiceCategoryResponse(ServiceCategoryBase):
    id: str
    created_at: datetime
    translations: Optional[Dict[str, Any]] = None
    layout_preferences: Optional[Dict[str, Any]] = None
    
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
    requires_deposit: bool = False
    deposit_amount: Optional[float] = None

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
    requires_deposit: Optional[bool] = None
    deposit_amount: Optional[float] = None

class ServiceResponse(ServiceBase):
    id: str
    created_at: datetime
    category: Optional['ServiceCategoryResponse'] = None
    category_slug: Optional[str] = None
    translations: Optional[Dict[str, Any]] = None
    
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
    clinic_description: Optional[str] = "Tu centro de confianza para servicios personalizados y bienestar de primer nivel."
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
    stripe_account_id: Optional[str] = None
    stripe_charges_enabled: bool = False
    whatsapp_number: Optional[str] = None
    booking_margin_hours: float = 2.0
    open_time: str = "09:00"
    close_time: str = "19:30"
    lunch_start: Optional[str] = None
    lunch_end: Optional[str] = None
    working_days: Optional[List[int]] = None
    booking_layout: Optional[str] = "grid"
    cancellation_margin_hours: int = 24
    global_deposit_required: Optional[bool] = False
    global_deposit_amount: Optional[float] = None

    # Design & Onboarding Tokens
    branding_font_headings: Optional[str] = "Playfair Display"
    branding_font_body: Optional[str] = "Inter"
    onboarding_completed: bool = False
    theme_palette: Optional[str] = "charcoal-gold"
    accent_color: Optional[str] = "#D4AF37"
    branding_palette_id: Optional[str] = "dorado-antracita"
    accent_color_primary: Optional[str] = "#D4AF37"
    accent_color_secondary: Optional[str] = "#1C1917"
    dark_mode_enabled: Optional[bool] = False
    border_radius: Optional[str] = "suave"
    favicon_b64: Optional[str] = None

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
    stripe_account_id: Optional[str] = None
    stripe_charges_enabled: Optional[bool] = None
    whatsapp_number: Optional[str] = None
    booking_margin_hours: Optional[float] = None
    open_time: Optional[str] = None
    close_time: Optional[str] = None
    lunch_start: Optional[str] = None
    lunch_end: Optional[str] = None
    working_days: Optional[List[int]] = None
    booking_layout: Optional[str] = None
    cancellation_margin_hours: Optional[int] = None
    global_deposit_required: Optional[bool] = None
    global_deposit_amount: Optional[float] = None
    ai_provider: Optional[str] = None
    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    gemini_model_text: Optional[str] = None
    gemini_model_image: Optional[str] = None
    openai_model_text: Optional[str] = None
    openai_model_image: Optional[str] = None
    default_image_shot: Optional[str] = None
    default_image_style: Optional[str] = None
    branding_font_headings: Optional[str] = None
    branding_font_body: Optional[str] = None
    onboarding_completed: Optional[bool] = None
    theme_palette: Optional[str] = None
    accent_color: Optional[str] = None
    branding_palette_id: Optional[str] = None
    accent_color_primary: Optional[str] = None
    accent_color_secondary: Optional[str] = None
    dark_mode_enabled: Optional[bool] = None
    border_radius: Optional[str] = None
    favicon_b64: Optional[str] = None


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
    id: str

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
    payment_status: str = "pending"
    stripe_payment_intent_id: Optional[str] = None
    stripe_checkout_session_id: Optional[str] = None
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
    payment_status: Optional[str] = None
    stripe_payment_intent_id: Optional[str] = None
    stripe_checkout_session_id: Optional[str] = None
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
    checkout_url: Optional[str] = None

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
    hero_show_button: Optional[bool] = True
    hero_button_text: Optional[str] = None
    hero_button_link: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_alignment: Optional[str] = "center"
    hero_horizontal_alignment: Optional[str] = "center"
    
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    about_layout: Optional[str] = "right"
    about_show_button: Optional[bool] = False
    about_button_text: Optional[str] = "Saber Más"
    about_button_link: Optional[str] = "/contacto"
    
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_link: Optional[str] = None
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

    home_sections_order: Optional[str] = None
    layout_style: Optional[str] = "cards_slider"  # 'cards_slider' | 'bento_grid'
    translations: Optional[Dict[str, Any]] = None

class SiteContentUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_show_button: Optional[bool] = None
    hero_button_text: Optional[str] = None
    hero_button_link: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_alignment: Optional[str] = None
    hero_horizontal_alignment: Optional[str] = None
    
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    about_layout: Optional[str] = None
    about_show_button: Optional[bool] = None
    about_button_text: Optional[str] = None
    about_button_link: Optional[str] = None
    
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_link: Optional[str] = None
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    
    home_sections_order: Optional[str] = None
    layout_style: Optional[str] = None  # 'cards_slider' | 'bento_grid'
    translations: Optional[Dict[str, Any]] = None

class SiteContentResponse(SiteContentBase):
    id: str
    
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
    reference_image: Optional[str] = None  # Base64 string
    exclude_text: bool = True
    reference_type: str = "style" # "style" o "composition"

class OptimizePromptRequest(BaseModel):
    service_name: str
    description: Optional[str] = ""
    content_html: Optional[str] = ""


# --- CMS Navigation ---
class NavigationItemBase(BaseModel):
    label: str
    path: str
    is_visible: bool = True
    order_index: int = 0
    is_custom: bool = False

class NavigationItemOut(NavigationItemBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True

class NavigationReorderRequest(BaseModel):
    ids: List[str]

class NavigationUpdateRequest(BaseModel):
    label: Optional[str] = None
    is_visible: Optional[bool] = None


# --- CMS Modular Blocks ---
class SiteBlockBase(BaseModel):
    page_slug: str = "home"
    block_type: str
    content_data: Dict[str, Any]
    order_index: int = 0

class SiteBlockOut(SiteBlockBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True

class SiteBlockCreate(BaseModel):
    page_slug: str
    block_type: str
    content_data: Dict[str, Any]
    order_index: Optional[int] = None

class SiteBlockUpdate(BaseModel):
    block_type: Optional[str] = None
    content_data: Optional[Dict[str, Any]] = None
    order_index: Optional[int] = None

class BlockReorderRequest(BaseModel):
    ids: List[str]


# --- CMS Custom Pages ---
class CustomPageCreate(BaseModel):
    title: str                   # Ej: "Política de Privacidad"
    slug: str                    # Ej: "politica-privacidad" → genera la ruta /politica-privacidad
    is_visible: bool = True      # Si aparece en el menú de navegación

class CustomPageOut(BaseModel):
    id: str
    tenant_id: str
    label: str                   # Mapeado desde label en SiteNavigation
    path: str                    # La ruta: /slug
    is_visible: bool
    order_index: int
    is_custom: bool

    class Config:
        from_attributes = True


# --- Onboarding Wizard ---
class OnboardingSetupRequest(BaseModel):
    clinic_name: str
    logo_app_b64: Optional[str] = None
    industry: str = Field(..., description="Estética y Bienestar, Medicina Estética, Clínicas de Salud, Salones y Barberías")
    open_time: str = "09:00"
    close_time: str = "19:00"
    working_days: List[int] = [1, 2, 3, 4, 5]
    load_demo_data: bool = True


# --- AI Webmaster Assistant & Voice Agent ---
class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    voice_gender: Optional[str] = "female"
    user_name: Optional[str] = None
    language: Optional[str] = "es"

class AIChatResponse(BaseModel):
    response: str
    updated_fields: Optional[List[str]] = None
    redirect_url: Optional[str] = None
    audio_response_base64: Optional[str] = None

class AIVoiceRequest(BaseModel):
    audio_base64: str
    mime_type: str = "audio/webm"
    history: List[ChatMessage] = []
    voice_gender: Optional[str] = "female"

class AIVoiceResponse(BaseModel):
    transcript: str
    response: str
    audio_response_base64: Optional[str] = None
    updated_fields: Optional[List[str]] = None


# --- BULK ACTIONS ---
class BulkActionPayload(BaseModel):
    ids: List[str]

class BulkStatusPayload(BaseModel):
    ids: List[str]
    is_active: bool



