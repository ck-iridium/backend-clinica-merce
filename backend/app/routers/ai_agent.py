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
    print(f"[DEBUG CHAT] message={request.message} user_role={request.user_role} language={request.language}")
    print(f"[DEBUG CHAT] history={[{'role': m.role, 'content': m.content} for m in request.history]}")
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
    mode = getattr(request, 'mode', 'ops') or 'ops'
    
    is_trial_mode = (plan == "free") and not has_byok
    is_capped_mode = (plan in ["basic", "pro"]) and not has_byok
    
    actions_remaining = None
    if has_byok or plan == "gold":
        actions_remaining = 999999  # Sin límites
    elif is_trial_mode or is_capped_mode:
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
    user_role = getattr(request, 'user_role', None)
    lang = getattr(request, 'language', 'es')

    # Obtener el nombre comercial del negocio y configuración de IA del inquilino
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    clinic_name = settings.clinic_name if settings and settings.clinic_name else None

    # Verificar si el inquilino tiene su propia clave de API configurada en Ajustes > Avanzado
    gemini_key = settings.gemini_api_key.strip() if settings and settings.gemini_api_key else None
    openai_key = settings.openai_api_key.strip() if settings and settings.openai_api_key else None
    has_custom_api_key = bool(gemini_key or openai_key)
    ai_provider = (settings.ai_provider or "gemini").lower() if settings else "gemini"
    image_model = settings.gemini_model_image if ai_provider == "gemini" else (settings.openai_model_image if settings else None)

    system_instruction = ai_agent_service.build_system_instruction(
        user_name=user_name,
        lang=lang,
        clinic_name=clinic_name,
        user_role=user_role,
        has_custom_api_key=has_custom_api_key,
        ai_provider=ai_provider,
        configured_image_model=image_model,
        mode=mode
    )

    if actions_remaining is not None and actions_remaining <= 0:
        limit_warning = ""
        if is_trial_mode:
            limit_warning = (
                f"\n\n[DIRECTIVA DE CONTROL CRÍTICA: LÍMITE DIARIO DE PRUEBA ALCANZADO]\n"
                f"El cliente ha agotado su cuota diaria de {daily_limit} Acciones Inteligentes de su período de prueba.\n"
                "Tienes terminantemente prohibido invocar o ejecutar cualquier herramienta o función que modifique la base de datos o navegue (por ejemplo: crear citas, actualizar servicios, editar landing o mover servicios).\n"
                "Si el usuario te solicita realizar alguna acción de escritura o cambio, debes responderle en un tono sumamente empático, profesional y distinguido (estilo 'Quiet Luxury'). "
                f"Explícale que ha consumido sus {daily_limit} acciones de prueba de hoy (que se renovarán mañana a las 00:00) o que puede actualizar al Plan Pro o Elite para continuar sin pausas. "
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

        # Enviar mensaje del inquilino al cerebro (con soporte multimodal para imágenes/capturas adjuntas)
        message_payload = request.message
        img_url = None
        is_from_history = False

        # 1. Buscar URL de imagen en el mensaje actual
        img_match = re.search(r"URL de la imagen:\s*(https?://[^\s\)]+)", request.message)
        if img_match:
            img_url = img_match.group(1).strip()
        elif request.history:
            # 2. Soporte multiturno: buscar imagen adjunta en los últimos mensajes de la conversación
            for past_msg in reversed(request.history[-6:]):
                past_match = re.search(r"URL de la imagen:\s*(https?://[^\s\)]+)", past_msg.content)
                if past_match:
                    img_url = past_match.group(1).strip()
                    is_from_history = True
                    break

        if img_url:
            pil_img = None
            try:
                import io
                import os
                import requests
                from PIL import Image

                # Intento 1: Cargar directamente desde el almacenamiento local si existe
                filename = img_url.split('/')[-1].split('?')[0]
                candidate_dirs = [
                    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads")),
                    os.path.abspath("uploads"),
                    os.path.abspath("backend/uploads"),
                ]
                for c_dir in candidate_dirs:
                    c_path = os.path.join(c_dir, filename)
                    if os.path.exists(c_path):
                        try:
                            pil_img = Image.open(c_path)
                            break
                        except Exception:
                            pass

                # Intento 2: Descargar de la URL pública de Supabase Storage
                if not pil_img:
                    resp = requests.get(img_url, timeout=10, headers={"User-Agent": "ProBookia-AI/1.0"})
                    if resp.status_code == 200:
                        pil_img = Image.open(io.BytesIO(resp.content))

                if pil_img:
                    prompt_text = request.message
                    if is_from_history:
                        prompt_text = f"{request.message}\n(Contexto visual: Se proporciona la captura/imagen compartida por el usuario en la conversación para tu análisis directo)"
                    message_payload = [prompt_text, pil_img]
            except Exception as e_img:
                logger.warning(f"No se pudo cargar la imagen para procesamiento multimodal en Gemini: {e_img}")
                message_payload = request.message

        response_brain = chat.send_message(message_payload)
        
        # Extracción segura de texto para evitar fallo 'response.text requires a valid Part'
        brain_text = ""
        try:
            brain_text = response_brain.text.strip()
        except Exception as e_text:
            logger.warning(f"Extracción directa de response.text falló ({e_text}). Buscando partes de texto manuales...")
            texts = []
            try:
                for candidate in getattr(response_brain, 'candidates', []):
                    for part in getattr(getattr(candidate, 'content', None), 'parts', []):
                        if hasattr(part, 'text') and part.text:
                            texts.append(part.text)
            except Exception:
                pass
            brain_text = " ".join(texts).strip() or "He procesado tu solicitud correctamente."

        # Escribir log local de auditoria de chat
        try:
            with open("chat_history.log", "a", encoding="utf-8") as hf:
                hf.write(f"\n--- CHAT TURN ---\n")
                hf.write(f"PROMPT: {request.message}\n")
                hf.write(f"ROLE: {request.user_role}\n")
                hf.write(f"RAW RESPONSE: {brain_text}\n")
                # Ver si se invocaron herramientas
                called_fns = []
                for message in chat.history:
                    for part in message.parts:
                        fn = getattr(part, 'function_call', None)
                        if fn:
                            called_fns.append(f"{fn.name}({fn.args})")
                hf.write(f"CALLED TOOLS: {', '.join(called_fns) if called_fns else 'None'}\n")
        except Exception as log_ex:
            logger.error(f"Error escribiendo a chat_history.log: {log_ex}")

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
                            s_slug = args.get('service_slug')
                            if s_slug:
                                clean_s = str(s_slug).strip().lower().lstrip('/')
                                if clean_s.startswith('tratamientos/'):
                                    redirect_url = f"/{clean_s}"
                                elif '/' in clean_s and not clean_s.startswith('svc-'):
                                    parts = clean_s.split('/')
                                    redirect_url = f"/tratamientos/{parts[0]}/{parts[-1]}"
                                else:
                                    try:
                                        clean_id = re.sub(r'^svc-(?:content|title|pricing|desc|media)-', '', clean_s, flags=re.IGNORECASE)
                                        srv_obj = db.query(models.Service).filter(
                                            models.Service.tenant_id == tenant_id,
                                            (models.Service.id == clean_id) | (models.Service.slug == clean_s)
                                        ).first()
                                        if srv_obj and srv_obj.category:
                                            redirect_url = f"/tratamientos/{srv_obj.category.slug}/{srv_obj.slug}"
                                    except Exception:
                                        pass
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
                    elif name in ["set_storefront_layout", "update_featured_categories", "update_landing_config", "add_hero_slide"]:
                        updated_fields.append("landing_config")
                        updated_fields.append("layout_style")
                        if mode == "webmaster":
                            redirect_url = "/"
                    elif name == "create_custom_page_and_nav_link":
                        updated_fields.append("navigation")
                        updated_fields.append("pages")
                        args = fn_call.args
                        if args:
                            p_title = args.get('title') or ''
                            p_slug = args.get('slug') or p_title
                            clean_p_slug = re.sub(r'[^a-z0-9]+', '-', p_slug.lower()).strip('-')
                            if clean_p_slug:
                                redirect_url = f"/{clean_p_slug}"
                    elif name in ["add_block_to_page", "add_section_to_page", "update_page_details", "update_page_block"]:
                        updated_fields.append("pages")
                        updated_fields.append("blocks")
                        args = fn_call.args
                        if args and 'page_slug' in args:
                            p_slug = args['page_slug'].lower().strip().lstrip('/')
                            if p_slug and p_slug != 'home':
                                redirect_url = f"/{p_slug}"
                            else:
                                redirect_url = "/"
                    elif name == "delete_custom_page":
                        updated_fields.append("pages")
                        updated_fields.append("navigation")
                        redirect_url = "/"
                    elif name in ["generar_imagen", "generar_imagen_servicio"]:
                        updated_fields.append("services")
                        updated_fields.append("image_url")
                        updated_fields.append("media")

        # Quitar duplicados en campos actualizados si existen
        updated_fields = list(set(updated_fields))

        # 2.5. Lógica de cobro/incremento de Smart Actions ejecutadas
        if not has_byok and plan != "gold":
            if updated_fields or redirect_url:
                actions_used = tenant.ai_daily_actions_used if hasattr(tenant, "ai_daily_actions_used") else 0
                if actions_used is None:
                    actions_used = 0
                tenant.ai_daily_actions_used = actions_used + 1
                db.commit()

        # Extraer dirección de navegación [NAVIGATE: ...] si existe
        navigate_match = re.search(r'\[NAVIGATE:\s*([^\]]+)\]', brain_text, re.IGNORECASE)
        if navigate_match:
            candidate_url = navigate_match.group(1).strip()
            if mode == "webmaster":
                # En modo webmaster, permitir navegar a cualquier página pública de la clínica (portada, páginas y tratamientos)
                if candidate_url.startswith("/") and not candidate_url.startswith("/dashboard"):
                    redirect_url = candidate_url
                else:
                    redirect_url = None
            else:
                redirect_url = candidate_url

        # 3. LA VOZ (Gemini 2.5 Flash TTS): Convierte de forma secuencial el texto en voz hiperrealista
        # Para síntesis de voz: removemos URLs largas, [NAVIGATE:...], [OPTION:...], y etiquetas de imagen para que no las lea mecánicamente
        voice_text = brain_text
        voice_text = re.sub(r'\[NAVIGATE:\s*[^\]]+\]', '', voice_text, flags=re.IGNORECASE)
        voice_text = re.sub(r'\[OPTION:\s*[^\]]+\]', '', voice_text, flags=re.IGNORECASE)
        voice_text = re.sub(r'\[(?:Imagen adjunta|Image jointe|Attached image):[^\]]+\]', '', voice_text, flags=re.IGNORECASE)
        voice_text = re.sub(r'URL de la imagen:\s*https?://\S+', '', voice_text, flags=re.IGNORECASE)
        voice_text = re.sub(r'\[.*?\]', '', voice_text)
        voice_text = re.sub(r'\s+', ' ', voice_text).strip()

        voice_gender = getattr(request, 'voice_gender', 'female')
        lang = getattr(request, 'language', 'es')
        audio_response_base64 = ai_agent_service.generate_gemini_tts(voice_text, voice_gender, api_key, lang)

        # Para el chat de texto de la UI:
        # Limpiar solamente las etiquetas de dirección de voz (como [warmly], [fast], [deliberate pause]),
        # pero PRESERVAR estrictamente [NAVIGATE:...], [OPTION:...], [Imagen adjunta: ...] y las URLs de imágenes
        clean_text = re.sub(r'\[(?!(?:NAVIGATE|OPTION|Imagen adjunta|Image jointe|Attached image))\s*[^\]]+\]', '', brain_text, flags=re.IGNORECASE).strip()
        clean_text = re.sub(r'[ \t]+', ' ', clean_text)
        if mode == "webmaster":
            # En modo webmaster, purgar cualquier etiqueta [NAVIGATE: ...] que pudiera haber emitido el LLM
            clean_text = re.sub(r'\[NAVIGATE:\s*[^\]]+\]', '', clean_text, flags=re.IGNORECASE).strip()

        # Calcular acciones inteligentes restantes
        trial_remaining = None
        if has_byok or plan == "gold":
            trial_remaining = 999999  # Sin límite
        elif is_trial_mode or is_capped_mode:
            trial_remaining = max(0, daily_limit - (tenant.ai_daily_actions_used or 0))

        return schemas.AIChatResponse(
            response=clean_text,
            updated_fields=updated_fields if updated_fields else None,
            redirect_url=redirect_url,
            audio_response_base64=audio_response_base64,
            trial_remaining=trial_remaining
        )

    except Exception as e:
        import traceback
        # Escribir el error y el historial detallado a un archivo log local
        try:
            with open("chat_debug.log", "w", encoding="utf-8") as lf:
                lf.write(f"ERROR: {str(e)}\n\n")
                lf.write("TRACEBACK:\n")
                traceback.print_exc(file=lf)
                lf.write(f"\n\nREQUEST MESSAGE: {request.message}\n")
                lf.write(f"REQUEST ROLE: {request.user_role}\n")
                lf.write(f"REQUEST HISTORY:\n")
                for m in request.history:
                    lf.write(f"- {m.role}: {m.content}\n")
        except Exception as log_ex:
            logger.error(f"Error escribiendo a chat_debug.log: {log_ex}")

        logger.error(f"Error crítico en ai_webmaster_chat para tenant {tenant_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en el motor del Asistente IA: {str(e)}"
        )
