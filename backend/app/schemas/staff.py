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

class LocationResponse(LocationBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True

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
