from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

# --- Locations ---
class LocationBase(BaseModel):
    name: str
    slug: Optional[str] = None
    address: str
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: bool = True
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_concurrent_appointments: Optional[int] = None

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    is_active: Optional[bool] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_concurrent_appointments: Optional[int] = None

# --- Location Resources (Cabinas / Equipamiento Físico) ---
class LocationResourceBase(BaseModel):
    name: str
    quantity: int = 1
    is_active: bool = True

class LocationResourceCreate(LocationResourceBase):
    pass

class LocationResourceUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[int] = None
    is_active: Optional[bool] = None

class LocationResourceResponse(LocationResourceBase):
    id: str
    tenant_id: str
    location_id: str
    created_at: datetime

    class Config:
        from_attributes = True

class LocationResponse(LocationBase):
    id: str
    created_at: datetime
    resources: List[LocationResourceResponse] = []

    class Config:
        from_attributes = True

# --- Staff Schedules ---
class StaffScheduleBase(BaseModel):
    staff_id: str
    location_id: str
    day_of_week: Optional[int] = None
    specific_date: Optional[date] = None
    start_time: str
    end_time: str
    is_active: bool = True

class StaffScheduleCreate(StaffScheduleBase):
    pass

class StaffScheduleUpdate(BaseModel):
    staff_id: Optional[str] = None
    location_id: Optional[str] = None
    day_of_week: Optional[int] = None
    specific_date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    is_active: Optional[bool] = None

class StaffScheduleResponse(StaffScheduleBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True


# --- Operador Mostrador TPV con PIN ---
class CounterOperatorCreate(BaseModel):
    full_name: str
    role: str = "Especialista" # "Especialista", "Recepción", "Administrador"
    pin: str # PIN de 4 dígitos
    avatar_url: Optional[str] = None
    email: Optional[str] = None

class CounterOperatorResponse(BaseModel):
    id: str
    tenant_id: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    auth_mode: str = "pin_only"
    is_counter_operator: bool = True
    bound_device_id: Optional[str] = None
    has_bound_device: bool = False
    has_pin: bool = False

class CounterPinVerify(BaseModel):
    staff_id: str
    pin: str
    device_id: Optional[str] = None # Identificador del móvil para fichajes vinculados

class CounterPinUpdate(BaseModel):
    staff_id: str
    current_pin: Optional[str] = None
    new_pin: str

class DeviceUnbindRequest(BaseModel):
    staff_id: str


# --- Fichaje de Jornada Laboral (Time Clock) ---
class TimeClockEventCreate(BaseModel):
    staff_id: str
    pin: Optional[str] = None
    event_type: str # "clock_in", "break_start", "break_end", "clock_out", "auto"
    device_label: Optional[str] = "Terminal Mostrador"
    device_id: Optional[str] = None
    qr_token: Optional[str] = None # Token rotativo de 20s
    notes: Optional[str] = None

class TimeClockRecordResponse(BaseModel):
    id: str
    tenant_id: str
    staff_id: str
    event_type: str
    timestamp: datetime
    device_label: Optional[str] = None
    device_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class TimeClockStatusResponse(BaseModel):
    staff_id: str
    staff_name: str
    current_status: str # "out", "in_shift", "on_break"
    last_event_type: Optional[str] = None
    last_event_time: Optional[datetime] = None
    today_total_minutes: int = 0
    has_bound_device: bool = False

class QRRotateTokenResponse(BaseModel):
    token: str
    expires_in_seconds: int = 20
    qr_payload: str
