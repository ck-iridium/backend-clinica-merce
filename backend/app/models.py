import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, Numeric, DateTime, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="client")
    created_at = Column(DateTime, default=datetime.utcnow)

class Client(Base):
    __tablename__ = "clients"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    dni = Column(String, nullable=True)
    address = Column(String, nullable=True)
    medical_history = Column(Text, nullable=True)
    allergies = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User")
    appointments = relationship("Appointment", back_populates="client")
    vouchers = relationship("Voucher", back_populates="client")
    consents = relationship("Consent", back_populates="client")

class Consent(Base):
    __tablename__ = "consents"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    document_type = Column(String, nullable=False)
    document_title = Column(String, nullable=False)
    document_body = Column(Text, nullable=False)
    signature_b64 = Column(Text, nullable=False)
    signed_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="consents")

class ServiceCategory(Base):
    __tablename__ = "service_categories"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    services = relationship("Service", back_populates="category")

class Service(Base):
    __tablename__ = "services"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    category_id = Column(String(36), ForeignKey("service_categories.id"), nullable=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    category = relationship("ServiceCategory", back_populates="services")
    voucher_templates = relationship("VoucherTemplate", back_populates="service")

class VoucherTemplate(Base):
    __tablename__ = "voucher_templates"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False)
    total_sessions = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    service = relationship("Service", back_populates="voucher_templates")

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String, default="pending") # pending, confirmed, completed, cancelled
    notes = Column(Text, nullable=True)
    reminder_sent = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    client = relationship("Client", back_populates="appointments")
    service = relationship("Service")

class Voucher(Base):
    __tablename__ = "vouchers"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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

    id = Column(Integer, primary_key=True, default=1) # Singleton

    # Company Details
    clinic_name = Column(String, default="Clínica Merce")
    clinic_nif = Column(String, default="")
    clinic_address = Column(String, default="")
    clinic_phone = Column(String, default="")
    clinic_email = Column(String, default="")
    legal_name = Column(String, default="")
    sanitary_register = Column(String, nullable=True)

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
    # SEO
    allow_search_engine_indexing = Column(Boolean, default=False)
    whatsapp_number = Column(String, nullable=True)
    maps_url = Column(String, nullable=True)

    # Numeration
    invoice_prefix = Column(String, default="FA-{YY}-")
    invoice_next_number = Column(Integer, default=1)
    default_tax_rate = Column(Numeric(5, 2), default=21.0)
    booking_margin_hours = Column(Float, default=2.0)

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class SiteContent(Base):
    __tablename__ = "site_content"
    id = Column(Integer, primary_key=True, default=1)
    
    # Hero Section
    hero_title = Column(String, default="Descubre tu mejor versión")
    hero_subtitle = Column(String, default="Tratamientos estéticos avanzados y personalizados para resaltar tu belleza natural.")
    hero_button_text = Column(String, default="Reservar Cita")
    hero_button_link = Column(String, default="/reservar")
    hero_image_url = Column(String, nullable=True)
    
    # About Section
    about_title = Column(String, default="Sobre Merce Estética")
    about_text = Column(Text, default="Nuestra pasión es cuidar de ti y de tu piel con los tratamientos más innovadores.")
    about_image_url = Column(String, nullable=True)
    
    # CTA Section
    cta_title = Column(String, default="¿Lista para empezar a cuidarte?")
    cta_subtitle = Column(String, default="Pide cita hoy mismo o contáctanos para asesoramiento personalizado.")
    cta_button_text = Column(String, default="Contactar")
    cta_button_link = Column(String, default="/contacto")

