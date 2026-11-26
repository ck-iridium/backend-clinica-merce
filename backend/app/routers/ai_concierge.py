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
    locations_desc_lines = []
    for loc in active_locations:
        addr_part = f" - Dirección: {loc.address}" if loc.address else ""
        locations_desc_lines.append(f"- Sede: {loc.name} [ID: {loc.id}]{addr_part}")
    locations_info_str = "\n".join(locations_desc_lines) if locations_desc_lines else "Sede central"

    # Modalidad de trabajo y reservas online
    allow_online_booking = getattr(settings, "allow_online_booking", True) is not False
    whatsapp_number = getattr(settings, "whatsapp_number", None) or clinic_phone
    work_modality = getattr(settings, "work_modality", "clinic_only") or "clinic_only"
    has_home_service = work_modality in ("both", "home_only")

    location_option_names = [loc.name for loc in active_locations]
    if has_home_service:
        location_option_names.insert(0, "Servicio a Domicilio")
    locations_names_options = " | ".join(location_option_names)

    if has_home_service:
        modality_instruction = """
MODALIDAD DE ATENCIÓN (A DOMICILIO Y EN SEDES):
- Este negocio ofrece atención en sus sedes físicas y también SERVICIO A DOMICILIO (el profesional se desplaza hasta el cliente).
- Si el visitante aún no ha especificado si prefiere acudir a una sede o que le atiendan a domicilio, ofrécele siempre la opción "Servicio a Domicilio" junto con las sedes disponibles.
"""
    else:
        modality_instruction = ""

    if has_multiple_locations:
        multi_location_instruction = f"""
SEDES FÍSICAS DISPONIBLES (El negocio dispone de {len(active_locations)} sedes):
{locations_info_str}
{modality_instruction}

DIRECTIVAS MULTI-SEDE Y MODALIDAD (CRÍTICO):
1. Si el visitante consulta disponibilidad de citas o quiere reservar y todavía no ha indicado en cuál sede prefiere atenderse (o si prefiere a domicilio), pregúntale amablemente dónde prefiere su cita.
2. Añade SIEMPRE la etiqueta interactiva para que la pantalla dibuje tarjetas clicables con dirección completa:
   [OPCIONES: {locations_names_options}]
   Ejemplo: "¿En cuál de nuestras sedes te gustaría agendar tu cita?" [OPCIONES: {locations_names_options}]
3. En cuanto el cliente te indique o pulse su sede preferida, usa su ID en la herramienta `consultar_huecos_disponibles(service_id, date, location_id="...")` y al generar la tarjeta de reserva añade `location_id`:
   [RESERVA: service_id=UUID, date=YYYY-MM-DD, time=HH:MM, location_id=UUID_DE_LA_SEDE]
"""
    else:
        single_loc_id = str(active_locations[0].id) if len(active_locations) == 1 else None
        single_loc_name = active_locations[0].name if len(active_locations) == 1 else clinic_name
        single_loc_addr = active_locations[0].address if len(active_locations) == 1 and active_locations[0].address else clinic_address
        single_loc_options = "Servicio a Domicilio | " + single_loc_name if has_home_service else single_loc_name
        multi_location_instruction = f"""
SEDE PRINCIPAL:
- Nombre: {single_loc_name}
- Dirección: {single_loc_addr}
{modality_instruction}
(Si hay servicio a domicilio y el usuario no ha elegido modalidad, puedes ofrecer: [OPCIONES: {single_loc_options}]).
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

    if not allow_online_booking:
        system_instruction = f"""Eres el Asistente Virtual 24/7 de "{clinic_name}".
Tu tono es {sector_tonality} (estilo Quiet Luxury: sofisticado, educado, claro y conciso).
Tu misión es orientar al visitante de la web, responder sus dudas sobre servicios, precios y horarios, e invitarle a concertar su cita por teléfono o WhatsApp.

INFORMACIÓN DEL NEGOCIO:
- Nombre: {clinic_name}
- Dirección: {clinic_address}
- Teléfono de contacto: {clinic_phone}
- WhatsApp: {whatsapp_number}
- Horario de apertura habitual: {open_time} a {close_time}
- Fecha actual del sistema: {today_str} ({weekday_es})
{multi_location_instruction}

CATÁLOGO DE SERVICIOS ACTIVOS:
{catalog_str}

DIRECTIVA CRÍTICA — MODO TELÉFONO / PRESENCIAL EXCLUSIVO ACTIVO:
- Este centro tiene pausado temporalmente el motor de reservas online en la web.
- Tienes TERMINANTEMENTE PROHIBIDO generar etiquetas `[RESERVA: ...]` o invitar a reservar online automáticamente.
- Si el visitante pregunta cómo reservar o pide cita para un día/hora, explícale con extrema elegancia que actualmente gestionamos nuestras citas de forma personalizada por teléfono o presencialmente, e indícale el teléfono `{clinic_phone}` (y WhatsApp `{whatsapp_number}` si está disponible) para que nuestro equipo le atienda de inmediato.
- Puedes mostrar tarjetas informativas de servicios si pregunta por tratamientos usando `[OPCIONES: Servicio A | Servicio B | Servicio C]`.
- Mantén tus respuestas breves, naturales y fluidas (máximo 25-35 palabras) ya que se sintetizan por voz."""
    else:
        system_instruction = f"""Eres el Asistente Virtual 24/7 de "{clinic_name}".
Tu tono es {sector_tonality} (estilo Quiet Luxury: sofisticado, educado, claro y conciso).
Tu misión es orientar al visitante de la web, responder sus dudas sobre servicios y horarios, y ayudarle a encontrar el mejor tratamiento para agendar su cita de forma ágil y natural.

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

DIRECTIVAS DE INTELIGENCIA CONVERSACIONAL (PASO A PASO - CERO VOLCADOS DE SERVICIOS AL AZAR):
1. REGLA DE ORO: SI FALTA EL SERVICIO, NUNCA ADIVINES NI VUELQUES SERVICIOS AL AZAR:
   - Si el visitante solicita cita para una fecha u hora pero NO ha especificado ningún tratamiento o servicio (ejemplo: "hola necesito hacer una reserva para mañana a las 5" o "quiero reservar"):
     * NUNCA ofrezcas una lista aleatoria de tratamientos del catálogo ni selecciones de sedes.
     * Responde de forma cordial y concisa preguntándole qué servicio desea realizarse:
       Ejemplo: "¡Con mucho gusto! Para mañana a las 17:00 podemos coordinarlo. ¿Qué servicio o tratamiento te gustaría realizarte?"
     * En este caso NO incluyas ninguna etiqueta de [OPCIONES] ni [OPCIONES_GRUPO]. Espera a que el cliente te responda qué desea.

2. OPCIONES INTERACTIVAS SOLO ANTE AMBIGÜEDAD O MÚLTIPLES VARIANTES:
   - Si el visitante menciona una palabra clave o tipo de servicio que tiene varias variantes en el catálogo (por ejemplo: dice "barba" y en el catálogo hay "Barbe seule" y "Coupe Homme + Barbe"; o dice "uñas", "coloración", "corte"):
     * Pregúntale amablemente cuál de las opciones prefiere.
     * Añade al final de tu mensaje la etiqueta [OPCIONES: ...] conteniendo EXCLUSIVAMENTE los 2 a 4 servicios que coincidan con su búsqueda:
       [OPCIONES: Coupe Homme | Barbe seule | Coupe Homme + Barbe]
     * ESTÁ PROHIBIDO listar nombres entre comillas en el texto redactado; las opciones aparecerán automáticamente como tarjetas clicables en pantalla.

3. PREGUNTAS SOBRE EL CATÁLOGO O RECOMENDACIONES:
   - Si el visitante pregunta explícitamente "¿qué tratamientos tenéis?", "¿cuáles son los más solicitados?" o pide recomendaciones:
     * Menciona brevemente 2 o 3 opciones destacadas y acompáñalas con sus opciones interactivas:
       [OPCIONES: Opción A | Opción B | Opción C]

4. ELECCIÓN DE SEDE O MODALIDAD:
   - Una vez que el tratamiento ya está claro (o si el usuario ya lo indicó desde el primer mensaje), y el negocio dispone de varias sedes o servicio a domicilio:
     * Pregúntale dónde prefiere su cita (o si prefiere a domicilio) y añade la etiqueta de sedes:
       [OPCIONES: {locations_names_options}]

5. DIRECTIVAS DE DISPONIBILIDAD, HORARIOS Y CONVERSIÓN (VOICE-FIRST & PASTILLAS INTERACTIVAS):
   - Al consultar disponibilidad con `consultar_huecos_disponibles`, ESTÁ TERMINANTEMENTE PROHIBIDO enumerar o recitar las horas una a una en el texto redactado (la voz real lee todo el texto visible; listar "16:00, 16:15, 17:45..." satura al cliente y destruye la experiencia).
   - CASO A: Si el usuario solicitó una hora exacta y está disponible:
     * Confirma directamente ese hueco con elegancia y genera la reserva:
       "¡Perfecto! Tenemos disponibilidad para tu cita de [Servicio] el [Día] a las [Hora]."
       [RESERVA: service_id=UUID_DEL_SERVICIO, date=YYYY-MM-DD, time=HH:MM, location_id=UUID_SEDE]
   - CASO B: Si la hora solicitada NO está disponible o el usuario pregunta en general por disponibilidad:
     * Explícaselo con extrema cortesía y brevedad en 1 o 2 frases breves (pensadas para ser escuchadas por voz de forma fluida):
       "Para el [Día] a las [Hora solicitada] no nos queda disponibilidad para [Servicio], pero disponemos de varios huecos libres esa tarde. Puedes seleccionar directamente el que mejor te encaje:"
     * Y añade SIEMPRE al final de tu mensaje la etiqueta interactiva de horas libres (de 2 a 8 huecos en formato HH:MM):
       [OPCIONES: 16:00 | 16:15 | 17:45 | 18:00 | 18:15 | 18:30]
     * Si hay turnos de mañana y tarde, puedes usar grupos:
       [OPCIONES_GRUPO: Mañana | 10:00 | 10:30 | 11:15] [OPCIONES_GRUPO: Tarde | 16:00 | 17:30 | 18:15]
     * La pantalla del cliente dibujará automáticamente estos horarios como botones interactivos clicables con 1 toque.
   - CASO C: Cuando el cliente pulse una hora o te indique la hora elegida (ej. "A las 16:00"):
     * Confirma la cita con agrado:
       "¡Excelente elección! Te reservo [Servicio] para el [Día] a las [Hora]."
     * Y genera SIEMPRE la tarjeta de reserva para que formalice su cita:
       [RESERVA: service_id=UUID_DEL_SERVICIO, date=YYYY-MM-DD, time=HH:MM, location_id=UUID_SEDE]

6. SÉ CONCISO Y NATURAL:
   - Respuestas de 1 a 2 párrafos breves (máximo 25-35 palabras). Todo tu texto se sintetiza por voz real, por lo que debe ser fluido, elegante y muy ágil de escuchar.
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
            tools=[consultar_huecos_disponibles] if allow_online_booking else [],
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

        # 1. Detectar y enriquecer opciones interactivas (Tarjetas visuales ricas Quiet Luxury)
        rich_options_list: List[schemas.ConciergeOptionItem] = []
        option_groups_list: List[str] = []
        simple_options_list: List[str] = []

        def _enrich_single_option(opt_text: str, group_label: Optional[str] = None) -> schemas.ConciergeOptionItem:
            clean_val = opt_text.strip()
            clean_val_lower = clean_val.lower()

            # 0. Horas / Huecos horarios (ej. "16:00", "16:15", "09:30", "17:45 h")
            time_match = re.match(r'^(\d{1,2}:\d{2})(?:\s*(?:h|hrs|am|pm))?$', clean_val, re.IGNORECASE)
            if time_match:
                formatted_time = time_match.group(1)
                return schemas.ConciergeOptionItem(
                    id=f"slot_{formatted_time.replace(':', '')}",
                    title=formatted_time,
                    subtitle="Hueco disponible",
                    category="time",
                    group=group_label or "Horarios disponibles",
                    action_value=f"A las {formatted_time}"
                )

            # A. Modalidad a Domicilio
            if "domicilio" in clean_val_lower or "a casa" in clean_val_lower:
                return schemas.ConciergeOptionItem(
                    id="home_modality",
                    title="Servicio a Domicilio",
                    subtitle="El profesional se desplaza directamente a tu ubicación",
                    category="modality",
                    group=group_label or "Lugar de la cita",
                    badge="A Domicilio",
                    action_value=clean_val
                )

            # B. Sede física
            for loc in active_locations:
                if (loc.name.lower() in clean_val_lower) or (clean_val_lower in loc.name.lower()) or (str(loc.id) in clean_val):
                    city_part = None
                    if loc.address:
                        addr_tokens = [t.strip() for t in loc.address.split(',') if t.strip()]
                        if len(addr_tokens) >= 2:
                            city_part = addr_tokens[-1]
                    return schemas.ConciergeOptionItem(
                        id=str(loc.id),
                        title=loc.name,
                        subtitle=loc.address or clinic_address or "Consultar ubicación",
                        category="location",
                        group=group_label or "Lugar de la cita",
                        badge=city_part or "Sede",
                        action_value=loc.name
                    )

            # C. Servicio / Tratamiento
            for srv in active_services:
                if (srv.name.lower() in clean_val_lower) or (clean_val_lower in srv.name.lower()) or (str(srv.id) in clean_val):
                    sub_parts = []
                    if srv.duration_minutes:
                        sub_parts.append(f"{srv.duration_minutes} min")
                    if srv.description:
                        short_desc = srv.description[:60] + "..." if len(srv.description) > 60 else srv.description
                        sub_parts.append(short_desc)
                    price_badge = f"{srv.price}€" if srv.price is not None else None
                    return schemas.ConciergeOptionItem(
                        id=str(srv.id),
                        title=srv.name,
                        subtitle=" • ".join(sub_parts) if sub_parts else "Tratamiento personalizado",
                        category="service",
                        group=group_label or "Tratamiento",
                        badge=price_badge,
                        action_value=srv.name
                    )

            # D. Genérica
            return schemas.ConciergeOptionItem(
                title=clean_val,
                category="general",
                group=group_label or "Opciones",
                action_value=clean_val
            )

        # Detectar [OPCIONES_GRUPO: NombreGrupo | Opción 1 | Opción 2 ...]
        grupo_matches = re.findall(r'\[OPCIONES_GRUPO:\s*([^\]]+)\]', raw_text, re.IGNORECASE)
        for g_match in grupo_matches:
            parts = [p.strip() for p in g_match.split('|') if p.strip()]
            if len(parts) >= 2:
                grp_name = parts[0]
                if grp_name not in option_groups_list:
                    option_groups_list.append(grp_name)
                for item in parts[1:]:
                    simple_options_list.append(item)
                    rich_options_list.append(_enrich_single_option(item, grp_name))

        # Detectar [OPCIONES: Opción 1 | Opción 2 ...]
        opciones_matches = re.findall(r'\[OPCIONES:\s*([^\]]+)\]', raw_text, re.IGNORECASE)
        for o_match in opciones_matches:
            parts = [p.strip() for p in o_match.split('|') if p.strip()]
            for item in parts:
                simple_options_list.append(item)
                rich_item = _enrich_single_option(item, None)
                if rich_item.group and rich_item.group not in option_groups_list:
                    option_groups_list.append(rich_item.group)
                rich_options_list.append(rich_item)

        # Detectar [HORAS: 16:00 | 16:15 | ...]
        horas_matches = re.findall(r'\[HORAS:\s*([^\]]+)\]', raw_text, re.IGNORECASE)
        for h_match in horas_matches:
            parts = [p.strip() for p in h_match.split('|') if p.strip()]
            for item in parts:
                simple_options_list.append(item)
                rich_item = _enrich_single_option(item, "Horarios disponibles")
                if rich_item.group and rich_item.group not in option_groups_list:
                    option_groups_list.append(rich_item.group)
                rich_options_list.append(rich_item)

        # 2. Detectar acción de reserva [RESERVA: service_id=..., date=..., time=..., location_id=...]
        action = None
        reserva_match = re.search(r'\[RESERVA:\s*([^\]]+)\]', raw_text, re.IGNORECASE)
        if allow_online_booking and reserva_match:
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
                    options=simple_options_list if simple_options_list else None,
                    rich_options=rich_options_list if rich_options_list else None,
                    option_groups=option_groups_list if option_groups_list else None,
                    url=booking_url
                )
        elif rich_options_list or simple_options_list:
            action = schemas.ConciergeAction(
                type="options",
                options=simple_options_list if simple_options_list else None,
                rich_options=rich_options_list if rich_options_list else None,
                option_groups=option_groups_list if option_groups_list else None
            )

        # Limpiar etiquetas de la respuesta de texto visible
        clean_text = re.sub(r'\[RESERVA:[^\]]+\]', '', raw_text, flags=re.IGNORECASE).strip()
        clean_text = re.sub(r'\[OPCIONES_GRUPO:[^\]]+\]', '', clean_text, flags=re.IGNORECASE).strip()
        clean_text = re.sub(r'\[OPCIONES:[^\]]+\]', '', clean_text, flags=re.IGNORECASE).strip()
        clean_text = re.sub(r'\[HORAS:[^\]]+\]', '', clean_text, flags=re.IGNORECASE).strip()
        clean_text = re.sub(r'\[(?!(?:RESERVA|OPCIONES|OPCIONES_GRUPO|HORAS))\s*[^\]]+\]', '', clean_text, flags=re.IGNORECASE).strip()

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
            + ("la disponibilidad. Puedes ver todos nuestros servicios y reservar directamente tu cita haciendo clic en el botón de reserva."
               if allow_online_booking else
               f"la información. Puedes llamarnos directamente al {clinic_phone} para reservar tu cita.")
        )
        return schemas.AIConciergeResponse(
            response=fallback_msg,
            action=schemas.ConciergeAction(type="booking", url="/reservar") if allow_online_booking else None,
            remaining_messages=MAX_SESSION_MESSAGES - session_info["count"]
        )
