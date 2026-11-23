from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime

class ClientBase(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    phone2: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    technical_notes: Optional[str] = None
    raw_history: Optional[str] = None
    color_formulas: Optional[List[Dict[str, Any]]] = None
    dni: Optional[str] = None
    address: Optional[str] = None
    
    # Service Address (Principal)
    service_address: Optional[str] = None
    service_postal_code: Optional[str] = None
    service_city: Optional[str] = None
    service_latitude: Optional[float] = None
    service_longitude: Optional[float] = None
    
    # Billing Address (Optional)
    billing_name: Optional[str] = None
    billing_nif: Optional[str] = None
    billing_address: Optional[str] = None
    billing_postal_code: Optional[str] = None
    billing_city: Optional[str] = None
    
    # Dynamic Sector-specific data
    sector_metadata: Optional[Dict[str, Any]] = None

class ClientCreate(ClientBase):
    user_id: Optional[str] = None

class ClientUpdate(BaseModel):
    name: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    phone2: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    birth_date: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    technical_notes: Optional[str] = None
    raw_history: Optional[str] = None
    color_formulas: Optional[List[Dict[str, Any]]] = None
    dni: Optional[str] = None
    address: Optional[str] = None
    
    service_address: Optional[str] = None
    service_postal_code: Optional[str] = None
    service_city: Optional[str] = None
    service_latitude: Optional[float] = None
    service_longitude: Optional[float] = None
    
    billing_name: Optional[str] = None
    billing_nif: Optional[str] = None
    billing_address: Optional[str] = None
    billing_postal_code: Optional[str] = None
    billing_city: Optional[str] = None
    
    sector_metadata: Optional[Dict[str, Any]] = None

class ClientResponse(ClientBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
