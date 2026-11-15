import logging
import re
import time
from datetime import datetime, date as DateType
from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
import google.generativeai as genai

from .. import schemas, database, models
from ..database import current_tenant_var, get_db
from ..limits import get_tenant_ai_key
from ..limiter import limiter
from ..crud import appointments as crud_appt
from ..services import ai as ai_agent_service

logger = logging.getLogger("ai_concierge")

router = APIRouter(
    prefix="/api/public/ai",
    tags=["Storefront AI Concierge (Public)"],
)

# Sesiones en memoria con límite de 8 mensajes para visitantes anónimos
_SESSION_DATA: Dict[str, Dict[str, Any]] = {}
MAX_SESSION_MESSAGES = 8

def _clean_expired_sessions():
    now = time.time()
    expired = [sid for sid, d in _SESSION_DATA.items() if now - d.get("last_active", 0) > 86400]
    for sid in expired:
        _SESSION_DATA.pop(sid, None)


@router.post("/concierge", response_model=schemas.AIConciergeResponse)
@limiter.limit("20/minute")
def public_concierge_chat(
    req: Request,
    request: schemas.AIConciergeRequest,
    db: Session = Depends(get_db)
):
    """
    Agente IA Concierge de cara al público para visitantes de la web del tenant.
    - Acceso 100% de Solo Lectura.
    - Cuota de 8 mensajes de cortesía por sesión anónima.
    - Consulta de huecos libres en tiempo real sin escribir en la agenda.
    - Emisión de acciones de reserva que abren el stepper de citas.
    """
    _clean_expired_sessions()

    tenant_id = current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Identificador de inquilino no resuelto.")

    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado.")

    if tenant.subscription_status in ("suspended", "inactive"):
        raise HTTPException(status_code=402, detail="Servicio temporalmente pausado.")

    # 1. Control de Cuota por Sesión Anónima (Token Bucket Anti-Abuso)
    session_id = request.session_id or "default_session"
    now_ts = time.time()
    session_info = _SESSION_DATA.get(session_id, {"count": 0, "last_active": now_ts})
    
    if session_info["count"] >= MAX_SESSION_MESSAGES:
        # Límite alcanzado de cortesía: redirigir a reserva o lead capture
        closing_msg = (
            "Me encanta conversar contigo, pero para asegurarme de que no pierdes tu hueco "
            "o para que nuestro equipo te confirme personalmente cualquier detalle específico, "
            "¿prefieres que te abramos la agenda ahora mismo o nos contactas directamente?"
        )
        return schemas.AIConciergeResponse(
            response=closing_msg,
            action=schemas.ConciergeAction(
                type="lead_capture",
                url="/reservar"
            ),
            remaining_messages=0
        )

    # 2. Obtener clave de Gemini
    try:
        api_key = get_tenant_ai_key(db, "gemini")
    except Exception as e:
        logger.error(f"Error recuperando clave de IA para concierge: {e}")
        raise HTTPException(status_code=500, detail="Servicio de asistente temporalmente no disponible.")

    genai.configure(api_key=api_key)

    # 3. Extraer información del negocio y catálogo activo
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    clinic_name = settings.clinic_name if settings and settings.clinic_name else tenant.name
    clinic_phone = settings.clinic_phone if settings and settings.clinic_phone else "No especificado"
    clinic_address = settings.clinic_address if settings and settings.clinic_address else "Consultar en web"
    open_time = settings.open_time if settings and settings.open_time else "09:00"
    close_time = settings.close_time if settings and settings.close_time else "20:00"
    sector = (tenant.business_sector or "estetica").lower()

    active_services = db.query(models.Service).filter(
        models.Service.tenant_id == tenant_id,
        models.Service.is_active == True
    ).all()

    services_catalog_txt = []
    service_id_map = {}
    for srv in active_services:
        service_id_map[str(srv.id)] = srv.name
        price_txt = f"{srv.price}€" if srv.price is not None else "Consultar"
        dur_txt = f"{srv.duration_minutes} min" if srv.duration_minutes else "Duración flexible"
        desc_txt = f": {srv.description}" if srv.description else ""
        services_catalog_txt.append(f"- [ID: {srv.id}] {srv.name} ({price_txt}, {dur_txt}){desc_txt}")

    catalog_str = "\n".join(services_catalog_txt) if services_catalog_txt else "Catálogo de servicios generales disponible en la web."

    today_str = datetime.now().strftime("%Y-%m-%d")
    weekday_es = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][datetime.now().weekday()]

    # 4. Construir System Instruction adaptado al sector (Quiet Luxury)
    sector_tonality = "cálido, distinguido, profesional y sereno"
    if "barber" in sector or "barberia" in sector or "peluqueria" in sector:
        sector_tonality = "cercano, contemporáneo, detallista y con energía de autor"
    elif "auto" in sector or "mecanic" in sector:
        sector_tonality = "técnico, transparente, profesional, ágil y de confianza"
    elif "dental" in sector or "salud" in sector or "medic" in sector:
        sector_tonality = "riguroso, empático, tranquilizador, clínico y de alta gama"

    system_instruction = f"""Eres el Concierge Digital y Asesor Virtual 24/7 de "{clinic_name}".
Tu tono es {sector_tonality} (estilo Quiet Luxury: sofisticado, educado, claro y conciso).
Tu misión es orientar al visitante de la web, responder sus dudas sobre servicios y horarios, y ayudarle a encontrar el mejor tratamiento para reservar su cita.

INFORMACIÓN DEL NEGOCIO:
- Nombre: {clinic_name}
- Dirección: {clinic_address}
- Teléfono de contacto: {clinic_phone}
- Horario de apertura habitual: {open_time} a {close_time}
- Fecha actual del sistema: {today_str} ({weekday_es})

CATÁLOGO DE SERVICIOS ACTIVOS:
{catalog_str}

HERRAMIENTAS DISPONIBLES:
Tienes la herramienta `consultar_huecos_disponibles(service_id, date)` para consultar la disponibilidad real de la agenda para un servicio y una fecha concreta (en formato YYYY-MM-DD).
- Si el usuario te pregunta por disponibilidad o días libres ("¿tenéis hueco el viernes?", "¿a qué hora puedo ir mañana?"), invoca `consultar_huecos_disponibles` con el ID del servicio más acorde y la fecha correspondiente.
- Si no menciona un servicio concreto, pregúntale amablemente qué tratamiento desea realizarse para consultar los huecos exactos.

DIRECTIVAS CRÍTICAS DE CONVERSIÓN Y RESERVA:
1. Siempre que recomiendes un servicio o confirmes un horario disponible, invita cordialmente a dar el paso hacia la reserva.
2. Cuando el usuario exprese que le interesa un servicio o un horario concreto (ej. "me va bien el viernes a las 17:00" o "quiero reservar el corte"), incluye SIEMPRE al final de tu respuesta la siguiente etiqueta especial para que la web le muestre el botón interactivo de reserva:
   [RESERVA: service_id=UUID_DEL_SERVICIO, date=YYYY-MM-DD, time=HH:MM]
   (Si aún no se ha acordado hora, puedes omitir time: [RESERVA: service_id=UUID_DEL_SERVICIO, date=YYYY-MM-DD]).
3. Nunca inventes precios que no figuren en el catálogo. Si preguntan por algo que no está listado, sugiere la opción más cercana o invítales a consultar con el especialista.
4. Jamás des diagnósticos médicos vinculantes; si preguntan por problemas de salud o contraindicaciones, orienta con prudencia e indica que el especialista lo valorará en cabina/consulta.
5. Mantén tus respuestas en un formato limpio, breve (máximo 2-3 párrafos) y sin rodeos innecesarios.
"""

    # 5. Definir la herramienta de consulta de disponibilidad para Gemini
    def consultar_huecos_disponibles(service_id: str, date: str) -> Dict[str, Any]:
        """
        Consulta los huecos horarios libres disponibles para un servicio y una fecha específica.
        Args:
            service_id: El ID exacto del servicio (obtenido del catálogo).
            date: La fecha en formato YYYY-MM-DD.
        """
        try:
            target_date = DateType.fromisoformat(date)
            slots = crud_appt.get_availability_slots(
                db, 
                target_date=target_date, 
                service_id=service_id
            )
            return {
                "date": date,
                "service_id": service_id,
                "available_slots": slots,
                "total_slots": len(slots)
            }
        except Exception as err:
            logger.warning(f"Error al consultar slots en concierge: {err}")
            return {
                "date": date,
                "service_id": service_id,
                "available_slots": [],
                "error": "Fecha no válida o no disponible"
            }

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            tools=[consultar_huecos_disponibles],
            system_instruction=system_instruction
        )

        history_parts = []
        for msg in request.history:
            history_parts.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })

        chat = model.start_chat(history=history_parts, enable_automatic_function_calling=True)
        response_brain = chat.send_message(request.message)
        raw_text = response_brain.text.strip()

        # Incrementar contador de sesión
        session_info["count"] += 1
        session_info["last_active"] = now_ts
        _SESSION_DATA[session_id] = session_info
        remaining_msgs = max(0, MAX_SESSION_MESSAGES - session_info["count"])

        # Detectar acción de reserva [RESERVA: service_id=..., date=..., time=...]
        action = None
        reserva_match = re.search(
            r'\[RESERVA:\s*service_id=([a-zA-Z0-9_-]+)(?:,\s*date=([0-9]{4}-[0-9]{2}-[0-9]{2}))?(?:,\s*time=([0-9]{2}:[0-9]{2}))?\]',
            raw_text,
            re.IGNORECASE
        )
        if reserva_match:
            srv_id = reserva_match.group(1).strip()
            res_date = reserva_match.group(2).strip() if reserva_match.group(2) else None
            res_time = reserva_match.group(3).strip() if reserva_match.group(3) else None
            
            srv_name = service_id_map.get(srv_id, "Servicio seleccionado")
            
            url_params = [f"service={srv_id}"]
            if res_date:
                url_params.append(f"date={res_date}")
            if res_time:
                url_params.append(f"time={res_time}")
            
            booking_url = f"/reservar?{'&'.join(url_params)}"

            action = schemas.ConciergeAction(
                type="booking",
                service_id=srv_id,
                service_name=srv_name,
                date=res_date,
                time=res_time,
                url=booking_url
            )

        # Limpiar etiquetas de la respuesta de texto visible
        clean_text = re.sub(r'\[RESERVA:[^\]]+\]', '', raw_text, flags=re.IGNORECASE).strip()
        clean_text = re.sub(r'\[(?!(?:RESERVA))\s*[^\]]+\]', '', clean_text, flags=re.IGNORECASE).strip()

        # Opcional: Generar audio TTS
        audio_response_base64 = None
        if request.voice_gender:
            try:
                voice_clean = re.sub(r'\[.*?\]', '', clean_text).strip()
                lang = getattr(request, 'language', 'es')
                audio_response_base64 = ai_agent_service.generate_gemini_tts(
                    voice_clean, request.voice_gender, api_key, lang
                )
            except Exception as e_tts:
                logger.warning(f"Concierge TTS error: {e_tts}")

        return schemas.AIConciergeResponse(
            response=clean_text,
            action=action,
            audio_response_base64=audio_response_base64,
            remaining_messages=remaining_msgs
        )

    except Exception as e:
        logger.error(f"Error procesando conversación de concierge: {e}", exc_info=True)
        fallback_msg = (
            f"Gracias por contactar con {clinic_name}. En este momento estoy actualizando "
            "la disponibilidad. Puedes ver todos nuestros servicios y reservar directamente tu cita "
            "haciendo clic en el botón de reserva."
        )
        return schemas.AIConciergeResponse(
            response=fallback_msg,
            action=schemas.ConciergeAction(type="booking", url="/reservar"),
            remaining_messages=MAX_SESSION_MESSAGES - session_info["count"]
        )
