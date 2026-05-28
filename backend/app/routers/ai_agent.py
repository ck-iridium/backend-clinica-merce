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

    # Recuperar Tenant y ClinicSettings
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado")
        
    plan = (tenant.plan_type or "free").lower()
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    has_byok = settings and settings.gemini_api_key and settings.gemini_api_key.strip()

    # Lazy reset de la cuota diaria de Acciones Inteligentes
    from datetime import datetime
    today = datetime.utcnow().date()
    if tenant.ai_last_action_date != today:
        tenant.ai_daily_actions_used = 0
        tenant.ai_last_action_date = today
        db.commit()

    # Calcular límites de acciones inteligentes
    from ..limits import PLAN_LIMITS
    plan_limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    daily_limit = plan_limits["ai_smart_actions_daily"]
    
    is_trial_mode = (plan == "free") and not has_byok
    is_capped_mode = (plan in ["basic", "pro"]) and not has_byok
    
    actions_remaining = None
    if has_byok or plan == "gold":
        actions_remaining = 999999  # Sin límites
    elif is_trial_mode:
        actions_remaining = max(0, 10 - (tenant.ai_trial_queries_used or 0))
    elif is_capped_mode:
        actions_remaining = max(0, daily_limit - (tenant.ai_daily_actions_used or 0))

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

    if actions_remaining is not None and actions_remaining <= 0:
        limit_warning = ""
        if is_trial_mode:
            limit_warning = (
                "\n\n[DIRECTIVA DE CONTROL CRÍTICA: LÍMITE DE PRUEBA ALCANZADO]\n"
                "El cliente ha agotado su período de prueba único de 10 Acciones Inteligentes.\n"
                "Tienes terminantemente prohibido invocar o ejecutar cualquier herramienta o función que modifique la base de datos o navegue (por ejemplo: crear citas, actualizar servicios, editar landing o mover servicios).\n"
                "Si el usuario te solicita realizar alguna acción de escritura o cambio, debes responderle en un tono sumamente empático, profesional y distinguido (estilo 'Quiet Luxury'). "
                "Explícale que ha consumido sus 10 acciones de prueba de bienvenida del plan gratuito y que debe actualizar al Plan Profesional o Gold Elite para que sigas automatizando por él de forma instantánea. "
                "Recuérdale amablemente que el chat de consulta, preguntas y navegación es 100% gratuito e ilimitado, por lo que estarás encantado de seguir respondiendo cualquier duda que tenga sobre su negocio."
            )
        elif is_capped_mode:
            limit_warning = (
                f"\n\n[DIRECTIVA DE CONTROL CRÍTICA: LÍMITE DIARIO ALCANZADO]\n"
                f"El cliente ha agotado su límite diario de {daily_limit} Acciones Inteligentes permitido en su plan '{plan.upper()}'.\n"
                "Tienes terminantemente prohibido invocar o ejecutar cualquier herramienta o función que modifique la base de datos o navegue (por ejemplo: crear citas, actualizar servicios, editar landing o mover servicios).\n"
                "Si el usuario te solicita realizar alguna acción de escritura o cambio, debes responderle en un tono sumamente empático, profesional y distinguido (estilo 'Quiet Luxury'). "
                f"Explícale con mucha clase que ha alcanzado el límite diario de {daily_limit} acciones de su plan actual, y que si no quiere preocuparse por límites diarios puede pasarse al Plan Gold Elite (donde es ilimitado), o bien agregar su propia Gemini API Key en Ajustes. "
                "Recuérdale que el chat de consulta es totalmente ilimitado y gratis, por lo que estarás feliz de seguir respondiendo cualquier duda o consultando su agenda sin coste alguno."
            )
        system_instruction += limit_warning

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

        # 2.5. Lógica de cobro/incremento de Smart Actions ejecutadas
        if not has_byok and plan != "gold":
            if updated_fields or redirect_url:
                if is_trial_mode:
                    queries_used = tenant.ai_trial_queries_used if hasattr(tenant, "ai_trial_queries_used") else 0
                    if queries_used is None:
                        queries_used = 0
                    tenant.ai_trial_queries_used = queries_used + 1
                    db.commit()
                elif is_capped_mode:
                    actions_used = tenant.ai_daily_actions_used if hasattr(tenant, "ai_daily_actions_used") else 0
                    if actions_used is None:
                        actions_used = 0
                    tenant.ai_daily_actions_used = actions_used + 1
                    db.commit()

        # 3. LA VOZ (Gemini 2.5 Flash TTS): Convierte de forma secuencial el texto en voz hiperrealista
        voice_gender = getattr(request, 'voice_gender', 'female')
        lang = getattr(request, 'language', 'es')
        audio_response_base64 = ai_agent_service.generate_gemini_tts(brain_text, voice_gender, api_key, lang)

        # Limpiar las etiquetas de dirección de voz (como [warmly], [deliberate pause]) para el chat de texto de la UI
        clean_text = re.sub(r'\[.*?\]', '', brain_text).strip()
        clean_text = re.sub(r'\s+', ' ', clean_text)

        # Calcular acciones inteligentes restantes
        trial_remaining = None
        if has_byok or plan == "gold":
            trial_remaining = 999999  # Sin límite
        elif is_trial_mode:
            trial_remaining = max(0, 10 - (tenant.ai_trial_queries_used or 0))
        elif is_capped_mode:
            trial_remaining = max(0, daily_limit - (tenant.ai_daily_actions_used or 0))

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
