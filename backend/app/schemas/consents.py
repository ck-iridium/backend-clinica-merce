from pydantic import BaseModel
from typing import Optional
from datetime import datetime

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

# --- Consent Templates ---
class ConsentTemplateBase(BaseModel):
    title: str
    body_text: str

class ConsentTemplateCreate(ConsentTemplateBase):
    pass

class ConsentTemplateUpdate(BaseModel):
    title: Optional[str] = None
    body_text: Optional[str] = None

class ConsentTemplateResponse(ConsentTemplateBase):
    id: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
