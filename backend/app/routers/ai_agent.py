import logging
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import google.generativeai as genai

from .. import schemas, database, models
from ..database import current_tenant_var, get_db
from ..limits import get_tenant_ai_key
from ..services import ai as ai_agent_service

logger = logging.getLogger("ai_agent")

router = APIRouter(
    prefix="/api/tenant/ai",
    tags=["AI Webmaster Assistant & Voice Agent"],
)

# ---------------------------------------------------------------------
# ENDPOINT DE CHAT
# ---------------------------------------------------------------------

@router.post("/chat", response_model=schemas.AIChatResponse)
def ai_webmaster_chat(request: schemas.AIChatRequest, db: Session = Depends(get_db)):
    """
    Endpoint del Asistente Web IA (Webmaster). Recibe el mensaje actual y el historial,
    utiliza el SDK de Gemini 2.5 Flash configurado con herramientas y ejecuta las llamadas a funciones
    de forma segura antes de devolver la respuesta final en lenguaje natural.
    """
    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Falta la cabecera del identificador de inquilino (tenant_id)")

    # Blindaje de Seguridad: Doble Verificación del Plan Gold o BYOK
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    plan = (tenant.plan_type or "free").lower()
    if plan != "gold":
        settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
        if not settings or not settings.gemini_api_key or not settings.gemini_api_key.strip():
            # Permitir consultas de Trial si no han excedido las 10
            queries_used = tenant.ai_trial_queries_used if hasattr(tenant, "ai_trial_queries_used") else 0
            if queries_used is None:
                queries_used = 0
            if queries_used >= 10:
                raise HTTPException(
                    status_code=403, 
                    detail="AI_TRIAL_EXHAUSTED"
                )

    # 1. Recuperar la clave API de Gemini del inquilino de forma segura
    try:
        api_key = get_tenant_ai_key(db, "gemini")
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener credenciales de IA: {str(e)}")

    # 2. Configurar la API de Gemini
    genai.configure(api_key=api_key)

    user_name = getattr(request, 'user_name', None)
    lang = getattr(request, 'language', 'es')

    # Obtener el nombre comercial del negocio configurado en los ajustes del inquilino
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    clinic_name = settings.clinic_name if settings and settings.clinic_name else None

    system_instruction = ai_agent_service.build_system_instruction(user_name, lang, clinic_name)

    try:
        # 1. EL CEREBRO (Gemini 2.5 Flash): Mantiene la sesión de chat con herramientas y multiturnos
        model_brain = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            tools=ai_agent_service.AGENT_TOOLS,
            system_instruction=system_instruction
        )

        # Formatear el historial de chat al formato del SDK de Google Gemini
        history_parts = []
        for msg in request.history:
            history_parts.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })

        # Iniciar sesión de chat con resolución automática de llamadas a funciones
        chat = model_brain.start_chat(history=history_parts, enable_automatic_function_calling=True)

        # Enviar mensaje del inquilino al cerebro
        response_brain = chat.send_message(request.message)
        brain_text = response_brain.text.strip()

        # 2. Identificar qué campos/parámetros fueron modificados examinando los eventos de llamada a funciones
        updated_fields = []
        redirect_url = None
        for message in chat.history:
            for part in message.parts:
                fn_call = getattr(part, 'function_call', None)
                if fn_call:
                    name = fn_call.name
                    if name == "update_landing_config":
                        args = fn_call.args
                        updated_fields.extend(args.keys())
                    elif name == "update_tenant_branding":
                        args = fn_call.args
                        if args:
                            updated_fields.extend(args.keys())
                    elif name == "update_service_fields":
                        args = fn_call.args
                        if args:
                            updated_fields.extend(args.keys())
                    elif name == "create_new_service":
                        updated_fields.append("services")
                        args = fn_call.args
                        if args and 'name' in args:
                            service_name = args['name']
                            slug = re.sub(r'[^a-z0-9]+', '-', service_name.lower()).strip('-')
                            redirect_url = f"/tratamientos/general/{slug}"
                    elif name == "move_service_to_category":
                        updated_fields.append("services")
                    elif name == "create_new_category":
                        updated_fields.append("categories")

        # Quitar duplicados en campos actualizados si existen
        updated_fields = list(set(updated_fields))

        # 3. LA VOZ (Gemini 3.1 Flash TTS): Convierte de forma secuencial el texto en voz hiperrealista
        voice_gender = getattr(request, 'voice_gender', 'female')
        lang = getattr(request, 'language', 'es')
        audio_response_base64 = ai_agent_service.generate_gemini_tts(brain_text, voice_gender, api_key, lang)

        # Limpiar las etiquetas de dirección de voz (como [warmly], [deliberate pause]) para el chat de texto de la UI
        clean_text = re.sub(r'\[.*?\]', '', brain_text).strip()
        clean_text = re.sub(r'\s+', ' ', clean_text)

        # Calcular consultas de trial restantes
        trial_remaining = None
        if plan != "gold" and (not settings or not settings.gemini_api_key or not settings.gemini_api_key.strip()):
            trial_remaining = max(0, 10 - (tenant.ai_trial_queries_used or 0))

        return schemas.AIChatResponse(
            response=clean_text,
            updated_fields=updated_fields if updated_fields else None,
            redirect_url=redirect_url,
            audio_response_base64=audio_response_base64,
            trial_remaining=trial_remaining
        )

    except Exception as e:
        logger.error(f"Error crítico en ai_webmaster_chat para tenant {tenant_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en el motor del Asistente IA: {str(e)}"
        )
