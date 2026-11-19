from pydantic import BaseModel
from typing import Optional, List

# --- AI Integration ---
class AIGenerationRequest(BaseModel):
    prompt: str
    type: str  # "description" or "seo"
    tone: str = "premium"  # "premium", "cercano", "clinico"

class AIImageGenerationRequest(BaseModel):
    prompt: str
    aspect_ratio: str  # "1:1", "16:9", "9:16"
    shot_type: str = "conceptual"
    visual_style: str = "luxury"
    reference_image: Optional[str] = None  # Base64 string
    exclude_text: bool = True
    reference_type: str = "style"  # "style" o "composition"

class OptimizePromptRequest(BaseModel):
    service_name: str
    description: Optional[str] = ""
    content_html: Optional[str] = ""

# --- AI Webmaster Assistant & Voice Agent ---
class ChatMessage(BaseModel):
    role: str  # "user" or "model"
    content: str

class AIChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    voice_gender: Optional[str] = "female"
    user_name: Optional[str] = None
    user_role: Optional[str] = None
    language: Optional[str] = "es"
    mode: Optional[str] = "ops"  # "ops" (Co-Piloto Operativo) | "webmaster" (Estudio de Diseño Web)

class AIChatResponse(BaseModel):
    response: str
    updated_fields: Optional[List[str]] = None
    redirect_url: Optional[str] = None
    audio_response_base64: Optional[str] = None
    trial_remaining: Optional[int] = None

class ConciergeOptionItem(BaseModel):
    id: Optional[str] = None
    title: str
    subtitle: Optional[str] = None
    category: Optional[str] = "general"  # "location" | "service" | "modality" | "time" | "general"
    group: Optional[str] = None          # "Tratamiento", "Lugar de la cita", "Horarios disponibles", etc.

class BlockAIGenerateRequest(BaseModel):
    block_type: str
    prompt: str
    tone: Optional[str] = "premium"  # "premium", "clinico", "cercano"
    current_data: Optional[dict] = None
    language: Optional[str] = "es"

class BlockAIGenerateResponse(BaseModel):
    block_type: str
    content_data: dict
    explanation: Optional[str] = None
    badge: Optional[str] = None          # "17€", "Alzira", "A Domicilio"
    action_value: str

class ConciergeAction(BaseModel):
    type: str  # "booking" | "info" | "lead_capture" | "options"
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD
    time: Optional[str] = None  # HH:MM
    location_id: Optional[str] = None
    location_name: Optional[str] = None
    modality: Optional[str] = None  # "clinic" | "home"
    options: Optional[List[str]] = None
    rich_options: Optional[List[ConciergeOptionItem]] = None
    option_groups: Optional[List[str]] = None
    url: Optional[str] = None

class AIConciergeRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []
    session_id: str
    voice_gender: Optional[str] = "female"
    language: Optional[str] = "es"

class AIConciergeResponse(BaseModel):
    response: str
    action: Optional[ConciergeAction] = None
    audio_response_base64: Optional[str] = None
    remaining_messages: int = 8

class AIVoiceRequest(BaseModel):
    audio_base64: str
    mime_type: str = "audio/webm"
    history: List[ChatMessage] = []
    voice_gender: Optional[str] = "female"

class AIVoiceResponse(BaseModel):
    transcript: str
    response: str
    audio_response_base64: Optional[str] = None
    updated_fields: Optional[List[str]] = None
