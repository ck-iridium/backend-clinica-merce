from pydantic import BaseModel, field_validator
from typing import Optional, List, Dict, Any
import re
import json

class ClinicSettingsBase(BaseModel):
    clinic_name: Optional[str] = "Clínica"
    business_sector: Optional[str] = "general"
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
    logo_footer_b64: Optional[str] = None
    footer_logo_mode: Optional[str] = "white"
    logo_pdf_b64: Optional[str] = None
    signature_b64: Optional[str] = None
    invoice_prefix: str
    invoice_next_number: int
    default_tax_rate: float = 21.0
    instagram_url: Optional[str] = None
    maps_url: Optional[str] = None
    allow_search_engine_indexing: bool = True
    google_site_verification: Optional[str] = None
    gtm_container_id: Optional[str] = None
    google_ads_id: Optional[str] = None
    google_ads_conversion_label: Optional[str] = None
    integrations_config: Optional[Dict[str, Any]] = None
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

    # Mobile Services & Coverage
    work_modality: Optional[str] = "clinic_only"  # "clinic_only", "home_only", "both"
    operations_center_address: Optional[str] = None
    operations_center_latitude: Optional[float] = None
    operations_center_longitude: Optional[float] = None
    max_coverage_radius_km: float = 10.0
    whitelist_zones: Optional[str] = None

    # Design & Onboarding Tokens
    branding_font_headings: Optional[str] = "Playfair"
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
    header_logo_height: Optional[int] = 42
    header_logo_padding_y: Optional[int] = 0
    header_logo_margin_right: Optional[int] = 24
    header_logo_margin_left: Optional[int] = 0
    header_logo_mode: Optional[str] = "original"
    logo_mobile_b64: Optional[str] = None
    mobile_logo_mode: Optional[str] = "adaptive"
    mobile_logo_height: Optional[int] = 36
    enable_consents: Optional[bool] = True

    ai_provider: Optional[str] = "gemini"

    gemini_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None
    gemini_model_text: Optional[str] = None
    gemini_model_image: Optional[str] = None
    openai_model_text: Optional[str] = None
    openai_model_image: Optional[str] = None
    default_image_shot: Optional[str] = "conceptual"
    default_image_style: Optional[str] = "luxury"
    blocked_days_cache: Optional[Dict[str, Any]] = None

class ClinicSettingsUpdate(BaseModel):
    clinic_name: Optional[str] = None
    business_sector: Optional[str] = None
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
    logo_footer_b64: Optional[str] = None
    footer_logo_mode: Optional[str] = None
    logo_pdf_b64: Optional[str] = None
    signature_b64: Optional[str] = None
    invoice_prefix: Optional[str] = None
    invoice_next_number: Optional[int] = None
    default_tax_rate: Optional[float] = None
    instagram_url: Optional[str] = None
    maps_url: Optional[str] = None
    allow_search_engine_indexing: Optional[bool] = None
    google_site_verification: Optional[str] = None
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
    work_modality: Optional[str] = None
    operations_center_address: Optional[str] = None
    operations_center_latitude: Optional[float] = None
    operations_center_longitude: Optional[float] = None
    max_coverage_radius_km: Optional[float] = None
    whitelist_zones: Optional[str] = None
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
    header_logo_height: Optional[int] = None
    header_logo_padding_y: Optional[int] = None
    header_logo_margin_right: Optional[int] = None
    header_logo_margin_left: Optional[int] = None
    header_logo_mode: Optional[str] = None
    logo_mobile_b64: Optional[str] = None
    mobile_logo_mode: Optional[str] = None
    mobile_logo_height: Optional[int] = None
    enable_consents: Optional[bool] = None
    gtm_container_id: Optional[str] = None
    google_ads_id: Optional[str] = None
    google_ads_conversion_label: Optional[str] = None
    integrations_config: Optional[Dict[str, Any]] = None

    @field_validator('gtm_container_id')
    @classmethod
    def validate_gtm(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        v = v.strip().upper()
        if not re.match(r'^GTM-[A-Z0-9]+$', v):
            raise ValueError("Formato de Google Tag Manager inválido. Debe ser de la forma GTM-XXXXXXX")
        return v

    @field_validator('google_ads_id')
    @classmethod
    def validate_google_ads_id(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        v = v.strip().upper()
        if not v.startswith('AW-'):
            v = f"AW-{v}"
        if not re.match(r'^AW-[0-9]+$', v):
            raise ValueError("Formato de ID de Google Ads inválido. Debe ser de la forma AW-123456789")
        return v

    @field_validator('google_ads_conversion_label')
    @classmethod
    def validate_conversion_label(cls, v: Optional[str]) -> Optional[str]:
        if not v or not v.strip():
            return None
        v = v.strip()
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError("Etiqueta de conversión inválida. Solo caracteres alfanuméricos, guiones o barras bajas")
        return v

class ClinicSettingsResponse(ClinicSettingsBase):
    id: str

    @field_validator('working_days', mode='before')
    @classmethod
    def parse_working_days(cls, v):
        if isinstance(v, str):
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
