from pydantic import BaseModel, EmailStr
from typing import Optional, List
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

# --- Services ---
class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    duration_minutes: int
    price: float
    is_active: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None

class ServiceResponse(ServiceBase):
    id: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# --- SETTINGS ---
class ClinicSettingsBase(BaseModel):
    clinic_name: str
    clinic_nif: str
    clinic_address: str
    clinic_phone: str
    clinic_email: str
    logo_app_b64: Optional[str] = None
    logo_pdf_b64: Optional[str] = None
    signature_b64: Optional[str] = None
    invoice_prefix: str
    invoice_next_number: int
    default_tax_rate: float = 21.0

class ClinicSettingsUpdate(ClinicSettingsBase):
    pass

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

class ClinicSettingsResponse(ClinicSettingsBase):
    id: int

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
