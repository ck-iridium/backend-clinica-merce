from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

# --- Service Categories ---
class ServiceCategoryBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    seo_description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: bool = True
    order_index: Optional[int] = 0
    layout_preferences: Optional[Dict[str, Any]] = None

class CategoryReorderItem(BaseModel):
    id: str
    order_index: int

class ServiceCategoryCreate(ServiceCategoryBase):
    pass

class ServiceCategoryUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    seo_description: Optional[str] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    order_index: Optional[int] = None
    layout_preferences: Optional[Dict[str, Any]] = None

class ServiceCategoryResponse(ServiceCategoryBase):
    id: str
    created_at: datetime
    translations: Optional[Dict[str, Any]] = None
    layout_preferences: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True

# --- Services ---
class ServiceBase(BaseModel):
    name: str
    slug: Optional[str] = None
    description: Optional[str] = None
    content_html: Optional[str] = None
    duration_minutes: int
    price: float
    is_active: bool = True
    is_featured: bool = False
    category_id: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    layout_preferences: Optional[Dict[str, Any]] = None
    requires_deposit: bool = False
    deposit_amount: Optional[float] = None
    allowed_modality: Optional[str] = "clinic"  # "clinic", "home", "both"

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    content_html: Optional[str] = None
    duration_minutes: Optional[int] = None
    price: Optional[float] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    category_id: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    layout_preferences: Optional[Dict[str, Any]] = None
    requires_deposit: Optional[bool] = None
    deposit_amount: Optional[float] = None
    allowed_modality: Optional[str] = None

class ServiceResponse(ServiceBase):
    id: str
    created_at: datetime
    category: Optional[ServiceCategoryResponse] = None
    category_slug: Optional[str] = None
    translations: Optional[Dict[str, Any]] = None
    
    class Config:
        from_attributes = True
