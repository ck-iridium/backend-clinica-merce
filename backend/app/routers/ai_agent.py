import os
import logging
from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import cast, Date

import google.generativeai as genai
from google.generativeai.types import content_types

from .. import schemas, database, models
from ..database import SessionLocal, current_tenant_var, get_db
from ..limits import get_tenant_ai_key

# Configurar logger
logger = logging.getLogger("ai_agent")

router = APIRouter(
    prefix="/api/tenant/ai",
    tags=["AI Webmaster Assistant & Voice Agent"],
)

# ---------------------------------------------------------------------
# DEFINICIÓN DE HERRAMIENTAS (TOOLS / FUNCTIONS FOR GEMINI)
# ---------------------------------------------------------------------

def update_landing_config(
    hero_title: Optional[str] = None,
    hero_subtitle: Optional[str] = None,
    about_title: Optional[str] = None,
    about_text: Optional[str] = None,
    cta_title: Optional[str] = None,
    cta_subtitle: Optional[str] = None
) -> str:
    """
    Actualiza la configuración y los textos principales de la landing page pública del inquilino.
    Solo se actualizarán los campos que no sean nulos (None).

    Args:
        hero_title: Nuevo título para la sección de bienvenida (Hero).
        hero_subtitle: Nuevo subtítulo para la sección de bienvenida.
        about_title: Título de la sección 'Sobre Nosotros'.
        about_text: Contenido textual descriptivo de la sección 'Sobre Nosotros'.
        cta_title: Título de la sección de llamada a la acción (CTA).
        cta_subtitle: Subtítulo explicativo de la sección de llamada a la acción.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        site_content = db.query(models.SiteContent).filter(
            models.SiteContent.tenant_id == tenant_id
        ).first()

        # Si no existe la fila inicial de contenido para este tenant, la creamos
        if not site_content:
            site_content = models.SiteContent(tenant_id=tenant_id)
            db.add(site_content)

        updated_fields = []
        if hero_title is not None:
            site_content.hero_title = hero_title
            updated_fields.append("hero_title")
        if hero_subtitle is not None:
            site_content.hero_subtitle = hero_subtitle
            updated_fields.append("hero_subtitle")
        if about_title is not None:
            site_content.about_title = about_title
            updated_fields.append("about_title")
        if about_text is not None:
            site_content.about_text = about_text
            updated_fields.append("about_text")
        if cta_title is not None:
            site_content.cta_title = cta_title
            updated_fields.append("cta_title")
        if cta_subtitle is not None:
            site_content.cta_subtitle = cta_subtitle
            updated_fields.append("cta_subtitle")

        if not updated_fields:
            return "No se ha modificado ningún campo porque no se enviaron nuevos valores."

        db.commit()
        return f"Éxito: Los campos [{', '.join(updated_fields)}] de la landing page se han actualizado correctamente."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en update_landing_config para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar la configuración de la landing page: {str(e)}"
    finally:
        db.close()


def update_service_price(service_slug: str, new_price: float) -> str:
    """
    Modifica el precio de venta de un servicio o tratamiento específico usando su slug único.

    Args:
        service_slug: Slug identificativo del servicio (ej. 'depilacion-laser', 'botox').
        new_price: El nuevo precio decimal para el servicio en Euros.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        # Doble verificación de seguridad multi-tenant por código además de RLS
        service = db.query(models.Service).filter(
            models.Service.slug == service_slug,
            models.Service.tenant_id == tenant_id
        ).first()

        if not service:
            return f"Error: No se ha encontrado ningún servicio con el slug '{service_slug}' en tu cuenta."

        old_price = service.price
        service.price = new_price
        db.commit()
        return f"Éxito: El precio del servicio '{service.name}' ha sido modificado de {old_price}€ a {new_price}€ correctamente."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en update_service_price para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar el precio del servicio: {str(e)}"
    finally:
        db.close()


def get_daily_appointments(date_str: Optional[str] = None) -> str:
    """
    Obtiene el listado detallado de citas agendadas para una fecha determinada (formato YYYY-MM-DD).
    Si no se indica la fecha, consulta por defecto el día de hoy.

    Args:
        date_str: Fecha en formato ISO YYYY-MM-DD (ej: '2026-05-22'). Si no se define, se usará la fecha de hoy.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        if not date_str:
            target_date = datetime.now().date()
        else:
            try:
                target_date = datetime.strptime(date_str, "%Y-%m-%d").date()
            except ValueError:
                return "Error: El formato de fecha suministrado es incorrecto. Debe ser YYYY-MM-DD."

        appointments = db.query(models.Appointment).filter(
            models.Appointment.tenant_id == tenant_id,
            cast(models.Appointment.start_time, Date) == target_date,
            models.Appointment.status != 'cancelled'
        ).order_by(models.Appointment.start_time.asc()).all()

        if not appointments:
            return f"No hay ninguna cita programada para el día {target_date.strftime('%Y-%m-%d')}."

        lines = [f"Citas agendadas para el día {target_date.strftime('%Y-%m-%d')}:"]
        for idx, appt in enumerate(appointments, 1):
            client = db.query(models.Client).filter(models.Client.id == appt.client_id).first()
            service = db.query(models.Service).filter(models.Service.id == appt.service_id).first()

            client_name = client.name if client else "Cliente Desconocido"
            service_name = service.name if service else "Tratamiento"
            price = service.price if service else 0.0

            start_hour = appt.start_time.strftime("%H:%M")
            end_hour = appt.end_time.strftime("%H:%M")

            lines.append(
                f"{idx}. [{start_hour} - {end_hour}] Cliente: {client_name} | "
                f"Servicio: {service_name} | Estado: {appt.status} | Precio: {price}€"
            )

        return "\n".join(lines)
    except Exception as e:
        logger.error(f"Error en get_daily_appointments para tenant {current_tenant_var.get()}: {e}")
        return f"Error al consultar la agenda de citas: {str(e)}"
    finally:
        db.close()


def create_new_service(name: str, price: float, duration_minutes: Optional[int] = 30) -> str:
    """
    Crea un nuevo servicio o tratamiento en la base de datos de la clínica de forma segura.

    Args:
        name: El nombre del servicio o tratamiento (ej. 'Masaje Relajante', 'Peeling Químico').
        price: El precio del servicio en Euros (ej. 75.0).
        duration_minutes: Duración estimada del servicio en minutos. Por defecto es 30.
    """
    import re
    import uuid
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        # Generar slug
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        
        # Unicidad del slug
        base_slug = slug
        counter = 1
        while db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.slug == slug
        ).first() is not None:
            slug = f"{base_slug}-{counter}"
            counter += 1

        new_service = models.Service(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            name=name,
            price=price,
            slug=slug,
            duration_minutes=duration_minutes if duration_minutes else 30,
            is_active=True
        )
        db.add(new_service)
        db.commit()
        return f"Éxito: Se ha creado el nuevo servicio '{name}' con precio de {price}€ y duración de {duration_minutes} minutos correctamente."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en create_new_service para tenant {current_tenant_var.get()}: {e}")
        return f"Error al crear el nuevo servicio: {str(e)}"
    finally:
        db.close()


# Lista de herramientas disponibles para Gemini
AGENT_TOOLS = [update_landing_config, update_service_price, get_daily_appointments, create_new_service]

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
            raise HTTPException(
                status_code=403, 
                detail="Se requiere Plan Gold o configuración de clave API de Gemini propia para usar el Co-Piloto de IA."
            )

    # 1. Recuperar la clave API de Gemini del inquilino de forma segura
    try:
        api_key = get_tenant_ai_key(db, "gemini")
    except HTTPException as e:
        # Re-lanzar la excepción si no está configurada o hay límites
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener credenciales de IA: {str(e)}")

    # 2. Configurar la API de Gemini
    genai.configure(api_key=api_key)

    system_instruction = (
        "Eres el 'AI Webmaster & Voice Agent' oficial de ProBookia, un asistente virtual premium "
        "diseñado para clínicas de medicina estética y alta gama. Tienes acceso a herramientas avanzadas "
        "para consultar citas de la agenda de hoy, cambiar precios de servicios, crear nuevos servicios (create_new_service) y modificar el diseño visual "
        "y los textos principales de la landing page pública del inquilino actual.\n\n"
        "Reglas obligatorias de comportamiento:\n"
        "1. Mantén siempre un tono profesional, elegante y sofisticado (estilo 'Quiet Luxury').\n"
        "2. REGLA CRÍTICA DE IDIOMA: DEBES DETECTAR Y RESPONDER SIEMPRE EN EL MISMO IDIOMA QUE UTILIZA EL USUARIO EN SU MENSAJE o comando de voz. Si el usuario te habla en francés, responde en francés nativo y elegante. Si te habla en inglés, responde en inglés nativo y elegante. Si te habla en español, responde en español.\n"
        "3. Llama a las herramientas adecuadas de forma automática cuando el usuario solicite acciones. "
        "Por ejemplo, si te dice 'Cambia el precio de botox a 190 euros', debes invocar 'update_service_price'. Si te dice 'Crea un servicio llamado Masaje Sueco a 80€', debes invocar 'create_new_service'.\n"
        "4. Siempre confirma el éxito o explica claramente cualquier error que devuelvan las herramientas.\n"
        "5. Tienes terminantemente prohibido acceder, mencionar o tratar de manipular datos de otros tenants.\n"
        "6. SÉ EXTREMADAMENTE BREVE, DIRECTO Y CONCISO. Evita explicaciones largas, rodeos o introducciones. "
        "Responde en 1 o 2 frases breves y sofisticadas como máximo. El verdadero lujo habla poco y actúa rápido.\n"
        "7. ESCUDO ANTI-DESTRUCCIÓN CRÍTICO: Si el usuario te pide borrar, eliminar o suprimir un servicio (ej: 'Borra el servicio de masajes' o 'Elimina botox'), "
        "NO tienes permitido realizar ninguna acción destructiva por ti mismo. En su lugar, DEBES responder OBLIGATORIAMENTE y ÚNICAMENTE "
        "con un objeto JSON de confirmación estructurado EXACTAMENTE así, sin ningún otro texto acompañante ni bloques de markdown (sin ```json ni nada):\n"
        "{\"action\": \"request_confirmation\", \"target\": \"service\", \"slug\": \"slug-del-servicio-a-borrar\", \"message\": \"¿Estás seguro de que deseas eliminar el servicio X? Esta acción no se puede deshacer.\"}\n"
        "Asegúrate de deducir o inferir el 'slug' correcto basado en el nombre del servicio que te ha pedido borrar.\n"
        "8. COPILOT DE NAVEGACIÓN GLOBAL: Si el usuario te solicita ir, ver, abrir, mostrar o navegar a una sección del panel administrativo, "
        "DEBES responder OBLIGATORIAMENTE y ÚNICAMENTE con un objeto JSON estructurado así, sin ningún otro texto ni bloques de markdown (sin ```json ni nada):\n"
        "{\"action\": \"navigate\", \"route\": \"/dashboard/calendar\", \"message\": \"Con gusto. Te dirijo a la agenda de la clínica de inmediato.\"}\n"
        "Rutas disponibles segun lo solicitado por el usuario:\n"
        "- Agenda, calendario o citas -> /dashboard/calendar\n"
        "- Clientes o Fichas -> /dashboard/clients\n"
        "- Facturas o ingresos -> /dashboard/invoices\n"
        "- Venta rápida, POS, TPV, cobrar o vender -> /dashboard/pos\n"
        "- Servicios, catálogo o tratamientos -> /dashboard/services\n"
        "- Equipo, especialistas o personal -> /dashboard/team\n"
        "- Ajustes, configuración o perfil -> /dashboard/settings\n"
        "- Galería de fotos o multimedia -> /dashboard/media\n"
        "- Editor Web, CMS o diseño -> /dashboard/cms\n"
        "- Copias de seguridad o backups -> /dashboard/backups\n"
        "- Inicio o dashboard -> /dashboard\n"
        "Asegúrate de asignar la propiedad 'route' y el 'message' en el idioma que corresponda al usuario."
    )

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            tools=AGENT_TOOLS,
            system_instruction=system_instruction
        )

        # 4. Formatear el historial de chat al formato del SDK de Google Gemini
        history_parts = []
        for msg in request.history:
            role = "user" if msg.role == "user" else "model"
            history_parts.append(
                content_types.to_content({
                    "role": role,
                    "parts": [msg.content]
                })
            )

        # 5. Iniciar sesión de chat con resolución automática de llamadas a funciones
        chat = model.start_chat(history=history_parts, enable_automatic_function_calling=True)

        # 6. Enviar mensaje del inquilino
        response = chat.send_message(request.message)

        # 7. Identificar qué campos/parámetros fueron modificados examinando los eventos de llamada a funciones
        updated_fields = []
        redirect_url = None
        for message in chat.history:
            for part in message.parts:
                fn_call = getattr(part, 'function_call', None)
                if fn_call:
                    name = fn_call.name
                    if name == "update_landing_config":
                        args = fn_call.args
                        # args es un diccionario-like
                        updated_fields.extend(args.keys())
                    elif name == "update_service_price":
                        updated_fields.append("price")
                    elif name == "create_new_service":
                        updated_fields.append("services")
                        args = fn_call.args
                        if args and 'name' in args:
                            import re
                            service_name = args['name']
                            slug = re.sub(r'[^a-z0-9]+', '-', service_name.lower()).strip('-')
                            redirect_url = f"/tratamientos/general/{slug}"

        # Quitar duplicados en campos actualizados si existen
        updated_fields = list(set(updated_fields))

        return schemas.AIChatResponse(
            response=response.text.strip(),
            updated_fields=updated_fields if updated_fields else None,
            redirect_url=redirect_url
        )

    except Exception as e:
        logger.error(f"Error crítico en ai_webmaster_chat para tenant {tenant_id}: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Error en el motor del Asistente IA: {str(e)}"
        )


# ---------------------------------------------------------------------
# ENDPOINT DE VOZ
# ---------------------------------------------------------------------



