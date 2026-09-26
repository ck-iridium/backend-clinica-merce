from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

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
