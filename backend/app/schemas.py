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

class ClientCreate(ClientBase):
    user_id: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None

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
    purchase_date: date
    expiration_date: date

class VoucherCreate(VoucherBase):
    pass

class VoucherUpdate(BaseModel):
    client_id: Optional[str] = None
    service_id: Optional[str] = None
    total_sessions: Optional[int] = None
    used_sessions: Optional[int] = None
    purchase_date: Optional[date] = None
    expiration_date: Optional[date] = None

class VoucherResponse(VoucherBase):
    id: str
    
    class Config:
        from_attributes = True

# --- Invoices ---
class InvoiceBase(BaseModel):
    client_id: str
    amount: float
    date: date
    status: str = "pending"

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceResponse(InvoiceBase):
    id: str
    
    class Config:
        from_attributes = True
