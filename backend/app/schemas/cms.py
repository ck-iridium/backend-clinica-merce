from pydantic import BaseModel
from typing import Optional, List, Dict, Any

# --- Site Content (CMS) ---
class SiteContentBase(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_show_button: Optional[bool] = True
    hero_button_text: Optional[str] = None
    hero_button_link: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_alignment: Optional[str] = "center"
    hero_horizontal_alignment: Optional[str] = "center"
    hero_content_fullwidth: Optional[bool] = False
    hero_title_size: Optional[str] = "large"
    hero_subtitle_size: Optional[str] = "medium"
    hero_title_max_width: Optional[int] = 100
    hero_price_enabled: Optional[bool] = False
    hero_price_prefix: Optional[str] = "Desde"
    hero_price_amount: Optional[str] = ""
    hero_price_suffix: Optional[str] = "€"
    hero_price_period: Optional[str] = ""
    hero_price_period_size: Optional[int] = 100
    hero_price_period_offset_y: Optional[int] = 0
    hero_price_size: Optional[str] = "large"
    hero_price_offset_y: Optional[int] = 0
    hero_price_style: Optional[str] = "capsule_dark"
    hero_button_style: Optional[str] = "glass"
    hero_responsive_config: Optional[Dict[str, Any]] = None
    hero_slides: Optional[List[Dict[str, Any]]] = None
    hero_slider_autoplay: Optional[bool] = True
    hero_slider_interval: Optional[int] = 5
    hero_slider_effect: Optional[str] = "fade"
    hero_slider_show_arrows: Optional[bool] = True
    hero_slider_show_dots: Optional[bool] = True
    
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    about_layout: Optional[str] = "right"
    about_show_button: Optional[bool] = False
    about_button_text: Optional[str] = "Saber Más"
    about_button_link: Optional[str] = "/contacto"
    
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_link: Optional[str] = None
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None

    home_sections_order: Optional[str] = None
    layout_style: Optional[str] = "cards_slider"  # 'cards_slider' | 'bento_grid'
    megamenu_layout: Optional[str] = "bento"
    megamenu_categories_json: Optional[List[str]] = None
    translations: Optional[Dict[str, Any]] = None

class SiteContentUpdate(BaseModel):
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_show_button: Optional[bool] = None
    hero_button_text: Optional[str] = None
    hero_button_link: Optional[str] = None
    hero_image_url: Optional[str] = None
    hero_video_url: Optional[str] = None
    hero_alignment: Optional[str] = None
    hero_horizontal_alignment: Optional[str] = None
    hero_content_fullwidth: Optional[bool] = None
    hero_title_size: Optional[str] = None
    hero_subtitle_size: Optional[str] = None
    hero_title_max_width: Optional[int] = None
    hero_price_enabled: Optional[bool] = None
    hero_price_prefix: Optional[str] = None
    hero_price_amount: Optional[str] = None
    hero_price_suffix: Optional[str] = None
    hero_price_period: Optional[str] = None
    hero_price_period_size: Optional[int] = None
    hero_price_period_offset_y: Optional[int] = None
    hero_price_size: Optional[str] = None
    hero_price_offset_y: Optional[int] = None
    hero_price_style: Optional[str] = None
    hero_button_style: Optional[str] = None
    hero_responsive_config: Optional[Dict[str, Any]] = None
    hero_slides: Optional[List[Dict[str, Any]]] = None
    hero_slider_autoplay: Optional[bool] = None
    hero_slider_interval: Optional[int] = None
    hero_slider_effect: Optional[str] = None
    hero_slider_show_arrows: Optional[bool] = None
    hero_slider_show_dots: Optional[bool] = None
    
    about_title: Optional[str] = None
    about_text: Optional[str] = None
    about_image_url: Optional[str] = None
    about_layout: Optional[str] = None
    about_show_button: Optional[bool] = None
    about_button_text: Optional[str] = None
    about_button_link: Optional[str] = None
    
    cta_title: Optional[str] = None
    cta_subtitle: Optional[str] = None
    cta_button_text: Optional[str] = None
    cta_button_link: Optional[str] = None
    
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None
    
    home_sections_order: Optional[str] = None
    layout_style: Optional[str] = None  # 'cards_slider' | 'bento_grid'
    megamenu_layout: Optional[str] = None
    megamenu_categories_json: Optional[List[str]] = None
    translations: Optional[Dict[str, Any]] = None

class SiteContentResponse(SiteContentBase):
    id: str
    
    class Config:
        from_attributes = True

# --- CMS Navigation ---
class NavigationItemBase(BaseModel):
    label: str
    path: str
    is_visible: bool = True
    order_index: int = 0
    is_custom: bool = False

class NavigationItemOut(NavigationItemBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True

class NavigationReorderRequest(BaseModel):
    ids: List[str]

class NavigationUpdateRequest(BaseModel):
    label: Optional[str] = None
    is_visible: Optional[bool] = None

# --- CMS Modular Blocks ---
class SiteBlockBase(BaseModel):
    page_slug: str = "home"
    block_type: str
    content_data: Dict[str, Any]
    order_index: int = 0

class SiteBlockOut(SiteBlockBase):
    id: str
    tenant_id: str

    class Config:
        from_attributes = True

class SiteBlockCreate(BaseModel):
    page_slug: str
    block_type: str
    content_data: Dict[str, Any]
    order_index: Optional[int] = None

class SiteBlockUpdate(BaseModel):
    block_type: Optional[str] = None
    content_data: Optional[Dict[str, Any]] = None
    order_index: Optional[int] = None

class BlockReorderRequest(BaseModel):
    ids: List[str]

# --- CMS Custom Pages ---
class CustomPageCreate(BaseModel):
    title: str                   # Ej: "Política de Privacidad"
    slug: str                    # Ej: "politica-privacidad" → genera la ruta /politica-privacidad
    is_visible: bool = True      # Si aparece en el menú de navegación

class CustomPageUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    is_visible: Optional[bool] = None

class CustomPageOut(BaseModel):
    id: str
    tenant_id: str
    label: str                   # Mapeado desde label en SiteNavigation
    path: str                    # La ruta: /slug
    is_visible: bool
    order_index: int
    is_custom: bool

    class Config:
        from_attributes = True

# --- CMS DOCS SYSTEM ---
class DocPageBase(BaseModel):
    section_id: str
    slug: str
    title: Dict[str, str]
    content: Dict[str, str]
    position: int = 0

class DocPageCreate(DocPageBase):
    pass

class DocPageUpdate(BaseModel):
    section_id: Optional[str] = None
    slug: Optional[str] = None
    title: Optional[Dict[str, str]] = None
    content: Optional[Dict[str, str]] = None
    position: Optional[int] = None

class DocPageOut(DocPageBase):
    id: str

    class Config:
        from_attributes = True

class DocSectionBase(BaseModel):
    slug: str
    title: Dict[str, str]
    position: int = 0

class DocSectionCreate(DocSectionBase):
    pass

class DocSectionUpdate(BaseModel):
    slug: Optional[str] = None
    title: Optional[Dict[str, str]] = None
    position: Optional[int] = None

class DocSectionOut(DocSectionBase):
    id: str
    pages: List[DocPageOut] = []

    class Config:
        from_attributes = True
