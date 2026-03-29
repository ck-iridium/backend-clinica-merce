import uuid
from sqlalchemy import Column, String, Text, Boolean, Integer, Numeric, DateTime, Date, ForeignKey
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

class Service(Base):
    __tablename__ = "services"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    duration_minutes = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    service_id = Column(String(36), ForeignKey("services.id"), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    status = Column(String, default="pending") # pending, confirmed, completed, cancelled
    notes = Column(Text, nullable=True)
    
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
    purchase_date = Column(Date, nullable=False)
    expiration_date = Column(Date, nullable=False)

    client = relationship("Client", back_populates="vouchers")
    service = relationship("Service")

class ClinicSettings(Base):
    __tablename__ = "clinic_settings"

    id = Column(Integer, primary_key=True, default=1) # Singleton

    # Company Details
    clinic_name = Column(String, default="Clínica Mercè")
    clinic_nif = Column(String, default="")
    clinic_address = Column(String, default="")
    clinic_phone = Column(String, default="")
    clinic_email = Column(String, default="")

    # Base64 Images
    logo_app_b64 = Column(Text, nullable=True)
    logo_pdf_b64 = Column(Text, nullable=True)
    signature_b64 = Column(Text, nullable=True)

    # Numeration
    invoice_prefix = Column(String, default="FA-{YY}-")
    invoice_next_number = Column(Integer, default=1)
    default_tax_rate = Column(Numeric(5, 2), default=21.0)

class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    client_id = Column(String(36), ForeignKey("clients.id"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    concept = Column(String, nullable=False)
    date = Column(Date, nullable=False)
    status = Column(String, default="pending") # pending, paid
    tax_rate = Column(Numeric(5, 2), default=21.0)
    
    client = relationship("Client")
