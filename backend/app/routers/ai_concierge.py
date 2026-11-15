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
# Desactivado temporalmente el tope para pruebas del propietario (consultas ilimitadas)
MAX_SESSION_MESSAGES = 999999

def _clean_expired_sessions():
    now = time.time()
    expired = [sid for sid, d in _SESSION_DATA.items() if now - d.get("last_active", 0) > 86400]
    for sid in expired:
        _SESSION_DATA.pop(sid, None)


@router.post("/concierge", response_model=schemas.AIConciergeResponse)
@limiter.limit("20/minute")
def public_concierge_chat(
    request: Request,
    payload: schemas.AIConciergeRequest,
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
        tenant_id = request.headers.get("X-Tenant-ID") or request.cookies.get("tenant_id")
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Identificador de inquilino no resuelto.")

    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Inquilino no encontrado.")

    if tenant.subscription_status in ("suspended", "inactive"):
        raise HTTPException(status_code=402, detail="Servicio temporalmente pausado.")

    # 1. Control de Cuota por Sesión Anónima (Token Bucket Anti-Abuso)
    session_id = payload.session_id or "default_session"
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

    # 3. Extraer información del negocio, catálogo y sedes físicas activas
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    clinic_name = settings.clinic_name if settings and settings.clinic_name else tenant.name
    clinic_phone = settings.clinic_phone if settings and settings.clinic_phone else "No especificado"
    clinic_address = settings.clinic_address if settings and settings.clinic_address else "Consultar en web"
    open_time = settings.open_time if settings and settings.open_time else "09:00"
    close_time = settings.close_time if settings and settings.close_time else "20:00"
    sector = (getattr(settings, "business_sector", None) or "estetica").lower()

    # Sedes físicas activas
    active_locations = db.query(models.Location).filter(
        models.Location.tenant_id == tenant_id,
        models.Location.is_active == True
    ).all()
    locations_map = {str(loc.id): loc.name for loc in active_locations}
    has_multiple_locations = len(active_locations) > 1

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

    # Multi-sede context and rules
    if has_multiple_locations:
        locations_desc_lines = []
        for loc in active_locations:
            addr_part = f" - Dirección: {loc.address}" if loc.address else ""
            locations_desc_lines.append(f"- Sede: {loc.name} [ID: {loc.id}]{addr_part}")
        locations_info_str = "\n".join(locations_desc_lines)
        locations_names_options = " | ".join(loc.name for loc in active_locations)

        multi_location_instruction = f"""
SEDES FÍSICAS DISPONIBLES (El negocio dispone de {len(active_locations)} sedes):
{locations_info_str}

DIRECTIVAS MULTI-SEDE (CRÍTICO):
1. Como el negocio tiene varias sedes, si el visitante consulta disponibilidad de citas o quiere reservar y todavía no ha indicado en cuál sede prefiere atenderse, pregúntale amablemente en qué sede prefiere su cita.
2. Para ponérselo facilísimo con botones clicables en el chat, añade SIEMPRE al final de tu mensaje la etiqueta de opciones interactivas:
   [OPCIONES: {locations_names_options}]
   Ejemplo: "¿En cuál de nuestras sedes te gustaría reservar tu cita?" [OPCIONES: {locations_names_options}]
3. En cuanto el cliente te indique o pulse su sede preferida, usa su ID en la herramienta `consultar_huecos_disponibles(service_id, date, location_id="...")` y al generar la tarjeta de reserva añade `location_id`:
   [RESERVA: service_id=UUID, date=YYYY-MM-DD, time=HH:MM, location_id=UUID_DE_LA_SEDE]
"""
    else:
        single_loc_id = str(active_locations[0].id) if len(active_locations) == 1 else None
        single_loc_name = active_locations[0].name if len(active_locations) == 1 else clinic_name
        single_loc_addr = active_locations[0].address if len(active_locations) == 1 and active_locations[0].address else clinic_address
        multi_location_instruction = f"""
SEDE PRINCIPAL:
- Nombre: {single_loc_name}
- Dirección: {single_loc_addr}
(Al sugerir reserva incluye location_id={single_loc_id if single_loc_id else ''}).
"""

    # 4. Construir System Instruction adaptado al sector (Quiet Luxury)
    sector_tonality = "cálido, distinguido, profesional y sereno"
    if "barber" in sector or "barberia" in sector or "peluqueria" in sector:
        sector_tonality = "cercano, contemporáneo, detallista y con energía de autor"
    elif "auto" in sector or "mecanic" in sector:
        sector_tonality = "técnico, transparente, profesional, ágil y de confianza"
    elif "dental" in sector or "salud" in sector or "medic" in sector:
        sector_tonality = "riguroso, empático, tranquilizador, clínico y de alta gama"

    system_instruction = f"""Eres el Asistente Virtual 24/7 de "{clinic_name}".
Tu tono es {sector_tonality} (estilo Quiet Luxury: sofisticado, educado, claro y conciso).
Tu misión es orientar al visitante de la web, responder sus dudas sobre servicios y horarios, y ayudarle a encontrar el mejor tratamiento para reservar su cita.

INFORMACIÓN DEL NEGOCIO:
- Nombre: {clinic_name}
- Dirección: {clinic_address}
- Teléfono de contacto: {clinic_phone}
- Horario de apertura habitual: {open_time} a {close_time}
- Fecha actual del sistema: {today_str} ({weekday_es})
{multi_location_instruction}

CATÁLOGO DE SERVICIOS ACTIVOS:
{catalog_str}

HERRAMIENTAS DISPONIBLES:
Tienes la herramienta `consultar_huecos_disponibles(service_id, date, location_id)` para consultar la disponibilidad real de la agenda para un servicio, fecha concreta (en formato YYYY-MM-DD) y sede (si aplica).
- Si el usuario te pregunta por disponibilidad o días libres ("¿tenéis hueco el viernes?", "¿a qué hora puedo ir mañana?"), invoca `consultar_huecos_disponibles` con el ID del servicio más acorde y la fecha correspondiente.
- Si no menciona un servicio concreto, pregúntale amablemente qué tratamiento desea realizarse para consultar los huecos exactos.

DIRECTIVAS CRÍTICAS DE CONVERSIÓN Y RESUMEN DE HORARIOS (VOICE-FIRST):
1. REGLA DE ORO PARA HORARIOS:
   - Al consultar disponibilidad, ESTÁ TERMINANTEMENTE PROHIBIDO recitar una por una todas las horas devueltas por la herramienta (resulta tedioso y pesado al escucharlo por voz).
   - Agrupa SIEMPRE y menciona como máximo 2 o 3 opciones representativas:
     Ejemplo: "Para mañana tenemos disponibilidad por la mañana (por ejemplo a las 10:30) y por la tarde (a las 16:30 y 18:00). ¿Prefieres mañana o tarde?"
   - Si el usuario ya especificó su preferencia (ej. "por la tarde", "después de comer" o "a las 5"), confirma directamente el hueco más exacto:
     "¡Perfecto! Te encaja estupendamente a las 17:00." y genera la tarjeta de reserva.
2. Cada vez que sugieras un horario o servicio, incluye SIEMPRE al final de tu respuesta la etiqueta para desplegar la tarjeta de reserva interactiva:
   [RESERVA: service_id=UUID_DEL_SERVICIO, date=YYYY-MM-DD, time=HH:MM, location_id=UUID_SEDE]
   (Si aún no se ha acordado hora: [RESERVA: service_id=UUID_DEL_SERVICIO, date=YYYY-MM-DD, location_id=UUID_SEDE]).
3. Nunca inventes precios que no figuren en el catálogo. Si preguntan por algo no listado, sugiere la opción más cercana o invítales a consulta presencial.
4. Jamás des diagnósticos médicos vinculantes; si preguntan por problemas de salud o contraindicaciones, orienta con prudencia e indica que el especialista lo valorará en cabina/consulta.
5. SÉ CONCISO: Respuestas de 1 a 2 párrafos breves (máximo 30-40 palabras). Todo tu texto se reproduce por voz real al usuario, por lo que debe ser ágil, fluido y muy agradable de escuchar.
"""

    # 5. Definir la herramienta de consulta de disponibilidad para Gemini
    def consultar_huecos_disponibles(service_id: str, date: str, location_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Consulta los huecos horarios libres disponibles para un servicio, fecha y sede física específica.
        Args:
            service_id: El ID exacto del servicio (obtenido del catálogo).
            date: La fecha en formato YYYY-MM-DD.
            location_id: (Opcional) El ID exacto de la sede física si hay más de una disponible.
        """
        try:
            target_date = DateType.fromisoformat(date)
            eff_loc_id = location_id
            if not eff_loc_id and len(active_locations) == 1:
                eff_loc_id = str(active_locations[0].id)

            slots = crud_appt.get_availability_slots(
                db, 
                target_date=target_date, 
                service_id=service_id,
                location_id=eff_loc_id
            )
            return {
                "date": date,
                "service_id": service_id,
                "location_id": eff_loc_id,
                "available_slots": slots,
                "total_slots": len(slots)
            }
        except Exception as err:
            logger.warning(f"Error al consultar slots en concierge: {err}")
            return {
                "date": date,
                "service_id": service_id,
                "available_slots": [],
                "error": "Fecha o sede no válida o no disponible"
            }

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            tools=[consultar_huecos_disponibles],
            system_instruction=system_instruction
        )

        history_parts = []
        for msg in payload.history:
            history_parts.append({
                "role": "user" if msg.role == "user" else "model",
                "parts": [msg.content]
            })

        chat = model.start_chat(history=history_parts, enable_automatic_function_calling=True)
        response_brain = chat.send_message(payload.message)
        raw_text = response_brain.text.strip()

        # Incrementar contador de sesión
        session_info["count"] += 1
        session_info["last_active"] = now_ts
        _SESSION_DATA[session_id] = session_info
        remaining_msgs = max(0, MAX_SESSION_MESSAGES - session_info["count"])

        # 1. Detectar acción de opciones interactivas [OPCIONES: Opción 1 | Opción 2 | ...]
        options_list = None
        opciones_match = re.search(r'\[OPCIONES:\s*([^\]]+)\]', raw_text, re.IGNORECASE)
        if opciones_match:
            raw_opts = opciones_match.group(1).strip()
            options_list = [opt.strip() for opt in raw_opts.split('|') if opt.strip()]

        # 2. Detectar acción de reserva [RESERVA: service_id=..., date=..., time=..., location_id=...]
        action = None
        reserva_match = re.search(r'\[RESERVA:\s*([^\]]+)\]', raw_text, re.IGNORECASE)
        if reserva_match:
            params_str = reserva_match.group(1)
            kv_pairs = dict(re.findall(r'(\w+)=([^\s,]+)', params_str))
            srv_id = kv_pairs.get("service_id")
            res_date = kv_pairs.get("date")
            res_time = kv_pairs.get("time")
            res_loc = kv_pairs.get("location_id") or kv_pairs.get("location")

            # Fallback si no viene location_id pero solo hay 1 sede
            if not res_loc and len(active_locations) == 1:
                res_loc = str(active_locations[0].id)

            if srv_id:
                srv_name = service_id_map.get(srv_id, "Servicio seleccionado")
                loc_name = locations_map.get(res_loc) if res_loc else None

                url_params = [f"service={srv_id}"]
                if res_loc:
                    url_params.append(f"location={res_loc}")
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
                    location_id=res_loc,
                    location_name=loc_name,
                    options=options_list,
                    url=booking_url
                )
        elif options_list:
            action = schemas.ConciergeAction(
                type="options",
                options=options_list
            )

        # Limpiar etiquetas de la respuesta de texto visible
        clean_text = re.sub(r'\[RESERVA:[^\]]+\]', '', raw_text, flags=re.IGNORECASE).strip()
        clean_text = re.sub(r'\[OPCIONES:[^\]]+\]', '', clean_text, flags=re.IGNORECASE).strip()
        clean_text = re.sub(r'\[(?!(?:RESERVA|OPCIONES))\s*[^\]]+\]', '', clean_text, flags=re.IGNORECASE).strip()

        # Opcional: Generar audio TTS
        audio_response_base64 = None
        if payload.voice_gender:
            try:
                voice_clean = re.sub(r'\[.*?\]', '', clean_text).strip()
                lang = getattr(payload, 'language', 'es')
                audio_response_base64 = ai_agent_service.generate_gemini_tts(
                    voice_clean, payload.voice_gender, api_key, lang
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
