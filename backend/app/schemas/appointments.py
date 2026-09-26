from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

# --- Appointments ---
class AppointmentBase(BaseModel):
    client_id: str
    service_id: str
    staff_id: Optional[str] = None
    location_id: Optional[str] = None
    start_time: datetime
    end_time: datetime
    status: str = "pending"
    payment_status: str = "pending"
    stripe_payment_intent_id: Optional[str] = None
    stripe_checkout_session_id: Optional[str] = None
    notes: Optional[str] = None
    reminder_sent: bool = False
    duration_minutes: Optional[int] = None
    custom_duration: Optional[int] = None

class AppointmentCreate(AppointmentBase):
    end_time: Optional[datetime] = None

class AppointmentUpdate(BaseModel):
    client_id: Optional[str] = None
    service_id: Optional[str] = None
    staff_id: Optional[str] = None
    location_id: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    duration_minutes: Optional[int] = None
    custom_duration: Optional[int] = None
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

# --- Public Booking (Landing) ---
class PublicBookingRequest(BaseModel):
    # Client identification (used to find-or-create)
    client_name: str
    client_email: Optional[str] = None
    client_phone: Optional[str] = None
    # Appointment details
    service_id: str
    staff_id: Optional[str] = None
    location_id: Optional[str] = None
    start_time: datetime
    notes: Optional[str] = None
    # Mobile Services geocoding payload
    service_modality: Optional[str] = "clinic"  # "clinic" or "home"
    client_address: Optional[str] = None
    client_latitude: Optional[float] = None
    client_longitude: Optional[float] = None
    client_postal_code: Optional[str] = None
    client_city: Optional[str] = None
    save_address_to_crm: Optional[bool] = False
    # Invisible Bot & Spam Shield
    website_hp: Optional[str] = None  # Honeypot trap: must remain empty
    form_load_time: Optional[float] = None  # Time-trap: client timestamp in ms

class PublicBookingResponse(BaseModel):
    appointment_id: str
    client_id: str
    is_new_client: bool
    start_time: datetime
    end_time: datetime
    status: str
    checkout_url: Optional[str] = None
    requires_verification: Optional[bool] = False
    verification_email_masked: Optional[str] = None

class VerifyOtpRequest(BaseModel):
    appointment_id: str
    code: str

class ResendOtpRequest(BaseModel):
    appointment_id: str

class AvailabilityResponse(BaseModel):
    date: str
    service_id: str
    location_id: Optional[str] = None
    available_slots: List[str]  # e.g. ["09:30", "10:00", "16:30"]

# --- Time Blocks ---
class TimeBlockBase(BaseModel):
    start_time: datetime
    end_time: datetime
    reason: Optional[str] = None
    is_annual_holiday: bool = False
    staff_id: Optional[str] = None

class TimeBlockCreate(TimeBlockBase):
    pass

class TimeBlockUpdate(BaseModel):
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    reason: Optional[str] = None
    is_annual_holiday: Optional[bool] = None
    staff_id: Optional[str] = None

class TimeBlockResponse(TimeBlockBase):
    id: str
    class Config:
        from_attributes = True
