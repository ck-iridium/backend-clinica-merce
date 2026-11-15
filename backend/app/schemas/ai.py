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

class AIChatResponse(BaseModel):
    response: str
    updated_fields: Optional[List[str]] = None
    redirect_url: Optional[str] = None
    audio_response_base64: Optional[str] = None
    trial_remaining: Optional[int] = None

class ConciergeAction(BaseModel):
    type: str  # "booking" | "info" | "lead_capture"
    service_id: Optional[str] = None
    service_name: Optional[str] = None
    date: Optional[str] = None  # YYYY-MM-DD
    time: Optional[str] = None  # HH:MM
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
