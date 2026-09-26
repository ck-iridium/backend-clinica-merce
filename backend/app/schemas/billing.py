from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, date

# --- Invoices ---
class InvoiceBase(BaseModel):
    client_id: str
    amount: float
    concept: str
    date: date
    status: str = "pending"
    tax_rate: float = 21.0
    is_simplified: bool = False
    number: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceUpdate(BaseModel):
    client_id: Optional[str] = None
    amount: Optional[float] = None
    concept: Optional[str] = None
    date: Optional[date] = None
    status: Optional[str] = None
    number: Optional[str] = None

class InvoiceResponse(InvoiceBase):
    id: str
    number: Optional[str] = None
    
    class Config:
        from_attributes = True

class InvoiceKPIs(BaseModel):
    total_gross: float
    tax_base: float
    vat_quota: float

class PaginatedInvoicesResponse(BaseModel):
    total: int
    pages: int
    page: int
    kpis: InvoiceKPIs
    data: List[InvoiceResponse]

# --- Direct Sale (POS) ---
class DirectSaleRequest(BaseModel):
    client_id: str
    service_id: Optional[str] = None
    services: Optional[List[Dict[str, Any]]] = None
    final_price: float
    payment_method: str  # e.g. "Efectivo", "Tarjeta"
    is_simplified: bool = False
    date: Optional[str] = None

# --- BIZUM SUBSCRIPTION SCHEMAS ---
class SubscriptionRequestBase(BaseModel):
    plan_type: str
    billing_period: str

class SubscriptionRequestCreate(SubscriptionRequestBase):
    pass

class SubscriptionRequestOut(BaseModel):
    id: str
    tenant_id: str
    user_id: str
    plan_type: str
    billing_period: str
    amount: float
    reference_code: str
    status: str
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SuperAdminSubscriptionRequestOut(SubscriptionRequestOut):
    tenant_name: Optional[str] = None
    user_email: Optional[str] = None

    class Config:
        from_attributes = True
