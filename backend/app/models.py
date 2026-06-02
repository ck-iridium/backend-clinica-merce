import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, Numeric, DateTime, Date, ForeignKey, Float, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class Tenant(Base):
    __tablename__ = "tenants"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True, nullable=False)
    stripe_customer_id = Column(String, nullable=True)
    subscription_status = Column(String, default="active")
    stripe_subscription_id = Column(String, nullable=True)
    plan_type = Column(String, default="free", nullable=False)
    subscription_expires_at = Column(DateTime, nullable=True)
    custom_domain = Column(String, nullable=True)
    ai_trial_queries_used = Column(Integer, default=0, nullable=False)
    ai_daily_actions_used = Column(Integer, default=0, nullable=False)
    ai_last_action_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="client")
    created_at = Column(DateTime, default=datetime.utcnow)

class Profile(Base):
    __tablename__ = "profiles"
    id = Column(String(36), primary_key=True)
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    full_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    role = Column(String, nullable=True)
    email = Column(String, nullable=True)
    status = Column(String, nullable=True)
    receive_email_appointments = Column(Boolean, default=True)
    receive_agenda_reminders = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Client(Base):
    __tablename__ = "clients"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    name = Column(String, index=True)
    first_name = Column(String, nullable=True, index=True)
    last_name = Column(String, nullable=True, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    dni = Column(String, nullable=True)
    address = Column(String, nullable=True)
    client_latitude = Column(Float, nullable=True)
    client_longitude = Column(Float, nullable=True)
    client_postal_code = Column(String, nullable=True)
    client_city = Column(String, nullable=True)
    
    # Service Address (Principal)
    service_address = Column(String, nullable=True)
    service_postal_code = Column(String, nullable=True)
    service_city = Column(String, nullable=True)
    service_latitude = Column(Float, nullable=True)
    service_longitude = Column(Float, nullable=True)
    
    # Billing Address (Optional)
    billing_name = Column(String, nullable=True)
    billing_nif = Column(String, nullable=True)
    billing_address = Column(String, nullable=True)
    billing_postal_code = Column(String, nullable=True)
    billing_city = Column(String, nullable=True)
    
    # Dynamic Sector-specific data
    sector_metadata = Column(JSONB, default=dict, nullable=True)
    
    medical_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    preferred_language = Column(String, default="es")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    appointments = relationship("Appointment", back_populates="client")
    vouchers = relationship("Voucher", back_populates="client")
    consents = relationship("Consent", back_populates="client")

class Consent(Base):
    __tablename__ = "consents"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    document_type = Column(String, nullable=False)
    document_title = Column(String, nullable=False)
    document_body = Column(Text, nullable=False)
    signature_b64 = Column(Text, nullable=False)
    signed_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="consents")

class ConsentTemplate(Base):
    __tablename__ = "consent_templates"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    body_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ServiceCategory(Base):
    __tablename__ = "service_categories"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    slug = Column(String(255), nullable=True, index=True)
    description = Column(Text, nullable=True)
    seo_description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    translations = Column(JSONB, default=dict, nullable=True)
    layout_preferences = Column(JSONB, default=dict, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('tenant_id', 'slug', name='uq_service_categories_tenant_slug'),
        UniqueConstraint('tenant_id', 'name', name='uq_service_categories_tenant_name'),
    )

    services = relationship("Service", back_populates="category")

class Service(Base):
    __tablename__ = "services"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    category_id = Column(String(36), ForeignKey("service_categories.id"), nullable=True)
    name = Column(String, nullable=False)
    slug = Column(String(255), nullable=True, index=True)
    description = Column(Text, nullable=True)
    content_html = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    image_url = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    seo_title = Column(String, nullable=True)
    seo_description = Column(Text, nullable=True)
    seo_keywords = Column(String, nullable=True)
    layout_preferences = Column(JSONB, default=dict, nullable=True)
    requires_deposit = Column(Boolean, default=False)
    deposit_amount = Column(Numeric(10, 2), nullable=True)
    translations = Column(JSONB, default=dict, nullable=True)
    allowed_modality = Column(String, default="clinic") # "clinic", "home", "both"
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('tenant_id', 'slug', name='uq_services_tenant_slug'),
    )

    # Relationships
    category = relationship("ServiceCategory", back_populates="services")
    voucher_templates = relationship("VoucherTemplate", back_populates="service")

class VoucherTemplate(Base):
    __tablename__ = "voucher_templates"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False)
    total_sessions = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    service = relationship("Service", back_populates="voucher_templates")

class Location(Base):
    __tablename__ = "locations"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant")

class StaffSchedule(Base):
    __tablename__ = "staff_schedules"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    staff_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=False, index=True)
    day_of_week = Column(Integer, nullable=True) # 1 = Monday ... 7 = Sunday
    specific_date = Column(Date, nullable=True)
    start_time = Column(String(5), nullable=False) # e.g. "09:00"
    end_time = Column(String(5), nullable=False) # e.g. "19:30"
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant")
    staff = relationship("User", foreign_keys=[staff_id])
    location = relationship("Location", foreign_keys=[location_id])

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False)
    staff_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    location_id = Column(String(36), ForeignKey("locations.id"), nullable=True, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String, default="pending") # pending, confirmed, completed, cancelled, awaiting_payment
    payment_status = Column(String, default="pending") # pending, awaiting_payment, deposit_paid, fully_paid, refunded
    stripe_payment_intent_id = Column(String, nullable=True)
    stripe_checkout_session_id = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    reminder_sent = Column(Boolean, default=False)
    service_modality = Column(String, default="clinic") # "clinic", "home"
    client_address = Column(String, nullable=True)
    client_latitude = Column(Float, nullable=True)
    client_longitude = Column(Float, nullable=True)
    client_postal_code = Column(String, nullable=True)
    client_city = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="appointments")
    service = relationship("Service")
    staff = relationship("User", foreign_keys=[staff_id])
    location = relationship("Location")

class Voucher(Base):
    __tablename__ = "vouchers"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False)
    total_sessions = Column(Integer, nullable=False)
    used_sessions = Column(Integer, default=0)
    total_price = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), default=0.0)
    payment_status = Column(String, default="pending") # pending, partial, paid
    purchase_date = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=False)

    client = relationship("Client", back_populates="vouchers")
    service = relationship("Service")

class ClinicSettings(Base):
    __tablename__ = "clinic_settings"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, unique=True, index=True)
    business_sector = Column(String, default="general", nullable=False)
    enable_consents = Column(Boolean, default=True, nullable=False)

    # Company Details
    clinic_name = Column(String, default="Estética Mercè")
    clinic_nif = Column(String, default="")
    clinic_address = Column(String, default="")
    clinic_phone = Column(String, default="")
    clinic_email = Column(String, default="")
    legal_name = Column(String, default="")
    clinic_description = Column(String, default="Tu centro de confianza para servicios personalizados y bienestar de primer nivel.")
    sanitary_register = Column(String, nullable=True)

    # Mobile Services & Geographical Coverage
    work_modality = Column(String, default="clinic_only") # "clinic_only", "home_only", "both"
    operations_center_address = Column(String, nullable=True)
    operations_center_latitude = Column(Float, nullable=True)
    operations_center_longitude = Column(Float, nullable=True)
    max_coverage_radius_km = Column(Float, default=10.0)
    whitelist_zones = Column(Text, nullable=True) # JSON list stored as string e.g. '["08001", "08002", "Badalona"]'

    # SMTP Configuration
    smtp_host = Column(String, nullable=True)
    smtp_port = Column(Integer, nullable=True)
    smtp_user = Column(String, nullable=True)
    smtp_password = Column(String, nullable=True)
    smtp_from_email = Column(String, nullable=True)
    smtp_use_tls = Column(Boolean, default=True)

    # Base64 Images
    logo_app_b64 = Column(Text, nullable=True)
    logo_pdf_b64 = Column(Text, nullable=True)
    signature_b64 = Column(Text, nullable=True)

    # Enlaces y Redes Sociales
    instagram_url = Column(String, nullable=True)
    # SEO e integraciones
    allow_search_engine_indexing = Column(Boolean, default=False)
    whatsapp_number = Column(String, nullable=True)
    maps_url = Column(String, nullable=True)

    # Horario Base (Agenda)
    open_time = Column(String, default="09:00")
    
    # UI Preferences
    booking_layout = Column(String, default="grid")
    close_time = Column(String, default="19:30")
    lunch_start = Column(String, nullable=True)
    lunch_end = Column(String, nullable=True)

    # Numeration
    invoice_prefix = Column(String, default="FA-{YY}-")
    invoice_next_number = Column(Integer, default=1)
    default_tax_rate = Column(Numeric(5, 2), default=21.0)
    booking_margin_hours = Column(Float, default=2.0)

    # Working Days (JSON array stored as string: e.g. "[1,2,3,4,5]")
    working_days = Column(String, nullable=True)  # 1=Lun...7=Dom

    # AI Configuration
    ai_provider = Column(String, default="gemini") # "gemini" or "openai"
    gemini_api_key = Column(String, nullable=True)
    openai_api_key = Column(String, nullable=True)
    gemini_model_text = Column(String, default="gemini-2.5-flash")
    gemini_model_image = Column(String, default="imagen-4.0-generate-001")
    openai_model_text = Column(String, default="gpt-4o-mini")
    openai_model_image = Column(String, default="dall-e-3")
    
    default_image_shot = Column(String, default="conceptual")
    default_image_style = Column(String, default="luxury")

    # Stripe Connect Configuration
    stripe_account_id = Column(String, nullable=True)
    stripe_charges_enabled = Column(Boolean, default=False)
    cancellation_margin_hours = Column(Integer, default=24)

    # Global Deposit Configuration
    global_deposit_required = Column(Boolean, default=False)
    global_deposit_amount = Column(Numeric(10, 2), nullable=True, default=0.0)

    # Design & Onboarding Tokens
    branding_font_headings = Column(String, default="Playfair Display")
    branding_font_body = Column(String, default="Inter")
    onboarding_completed = Column(Boolean, default=False)
    theme_palette = Column(String, default="charcoal-gold")
    accent_color = Column(String, default="#D4AF37")
    branding_palette_id = Column(String, default="dorado-antracita")
    accent_color_primary = Column(String, default="#D4AF37")
    accent_color_secondary = Column(String, default="#1C1917")
    dark_mode_enabled = Column(Boolean, default=False)
    border_radius = Column(String, default="suave")
    favicon_b64 = Column(Text, nullable=True)


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    concept = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, default="pending") # pending, paid
    tax_rate = Column(Numeric(5, 2), default=21.0)
    is_simplified = Column(Boolean, default=False)
    
    client = relationship("Client")

class TimeBlock(Base):
    __tablename__ = "time_blocks"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    staff_id = Column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    reason = Column(String, nullable=True)
    is_annual_holiday = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    staff = relationship("User", foreign_keys=[staff_id])

class SiteContent(Base):
    __tablename__ = "site_content"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, unique=True, index=True)
    
    # Hero Section
    hero_title = Column(String, default="Descubre tu mejor versión")
    hero_subtitle = Column(String, default="Tratamientos estéticos avanzados y personalizados para resaltar tu belleza natural.")
    hero_show_button = Column(Boolean, default=True)
    hero_button_text = Column(String, default="Reservar Cita")
    hero_button_link = Column(String, default="/reservar")
    hero_image_url = Column(String, nullable=True)
    hero_video_url = Column(String, nullable=True)
    hero_alignment = Column(String, default="center") # top, center, bottom
    hero_horizontal_alignment = Column(String, default="center") # left, center, right
    
    # About Section
    about_title = Column(String, default="Sobre Estética Merce")
    about_text = Column(Text, default="Nuestra pasión es cuidar de ti y de tu piel con los tratamientos más innovadores.")
    about_image_url = Column(String, nullable=True)
    about_layout = Column(String, default="right") # left, right (imagen a la izq o der)
    about_show_button = Column(Boolean, default=False)
    about_button_text = Column(String, default="Saber Más")
    about_button_link = Column(String, default="/contacto")
    
    # CTA Section
    cta_title = Column(String, default="¿Lista para empezar a cuidarte?")
    cta_subtitle = Column(String, default="Pide cita hoy mismo o contáctanos para asesoramiento personalizado.")
    cta_button_text = Column(String, default="Contactar")
    cta_button_link = Column(String, default="/contacto")

    # Orden dinámico de la Home
    home_sections_order = Column(Text, nullable=True)
    # Diseño global de las secciones de categorías: 'cards_slider' | 'bento_grid'
    layout_style = Column(String(20), default="cards_slider", nullable=True)

    # SEO Dinámico
    seo_title = Column(String, nullable=True)
    seo_description = Column(Text, nullable=True)
    seo_keywords = Column(String, nullable=True)
    translations = Column(JSONB, default=dict, nullable=True)

class Media(Base):
    __tablename__ = "media"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    filename = Column(String, nullable=False)
    url = Column(String, nullable=False)
    file_type = Column(String, nullable=False) # image, video
    mime_type = Column(String, nullable=True)
    size = Column(Integer, nullable=True)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    service = relationship("Service")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=False)
    type = Column(String, default="info") # success, error, warning, info
    read = Column(Boolean, default=False)
    extra_metadata = Column("metadata", JSONB, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", foreign_keys=[user_id])


class SiteNavigation(Base):
    __tablename__ = "site_navigation"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    label = Column(String(100), nullable=False)
    path = Column(String(255), nullable=False)
    is_visible = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    is_custom = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SiteBlock(Base):
    __tablename__ = "site_blocks"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tenant_id = Column(String(36), ForeignKey("tenants.id"), nullable=False, index=True)
    page_slug = Column(String(100), default="home")
    block_type = Column(String(50), nullable=False)
    content_data = Column(JSONB, nullable=False)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class LandingMarketingSettings(Base):
    __tablename__ = "landing_marketing_settings"
    id = Column(String(36), primary_key=True, default="global")
    hero_title = Column(String, default="La elegancia de tu negocio traducida en un SaaS de Lujo")
    hero_subtitle = Column(String, default="Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes.")
    hero_image_1 = Column(Text, nullable=True)
    hero_image_2 = Column(Text, nullable=True)
    hero_image_3 = Column(Text, nullable=True)
    logo_svg = Column(Text, nullable=True)
    primary_color = Column(String(7), default="#3b82f6")
    secondary_color = Column(String(7), default="#1c1917")
    tertiary_color = Column(String(7), default="#d4af37")
    font_family = Column(String(50), default="playfair_inter")
    font_weight_headings = Column(String(50), default="semibold")
    favicon_url = Column(Text, nullable=True)
    seo_title = Column(String, default="Probookia | El SaaS de Gestión para Centros de Estética y Salones Premium")
    seo_description = Column(String, default="La elegancia de tu negocio traducida en un SaaS de lujo. Agendas fluidas, expedientes médicos y cobros en una experiencia sublime.")
    seo_keywords = Column(String, default="saas, agenda online, centros de estetica, probookia")


class LandingShowcaseSector(Base):
    __tablename__ = "landing_showcase_sectors"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String, nullable=False)
    slug = Column(String, nullable=False, unique=True)
    badge_text = Column(String, nullable=True)
    video_url = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    order_index = Column(Integer, default=0)


class DocSection(Base):
    __tablename__ = "doc_sections"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    slug = Column(String(255), nullable=False)
    title = Column(JSONB, default=dict, nullable=False)
    position = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('slug', name='uq_doc_sections_slug'),
    )

    pages = relationship("DocPage", back_populates="section", cascade="all, delete-orphan", order_by="DocPage.position")


class DocPage(Base):
    __tablename__ = "doc_pages"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    section_id = Column(String(36), ForeignKey("doc_sections.id", ondelete="CASCADE"), nullable=False)
    slug = Column(String(255), nullable=False)
    title = Column(JSONB, default=dict, nullable=False)
    content = Column(JSONB, default=dict, nullable=False)
    position = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('slug', name='uq_doc_pages_slug'),
    )

    section = relationship("DocSection", back_populates="pages")




