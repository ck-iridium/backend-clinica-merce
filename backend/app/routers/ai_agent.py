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


def update_service_fields(
    service_slug: str,
    new_price: Optional[float] = None,
    description: Optional[str] = None,
    content_html: Optional[str] = None
) -> str:
    """
    Modifica de forma segura los campos de un servicio o tratamiento específico (como el precio, descripción corta o contenido detallado) usando su slug único.

    Args:
        service_slug: Slug identificativo del servicio (ej. 'depilacion-laser', 'botox').
        new_price: El nuevo precio decimal para el servicio en Euros (opcional).
        description: La nueva descripción comercial corta del servicio (opcional).
        content_html: El contenido largo y detallado (HTML o texto enriquecido) de la página del tratamiento (opcional).
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

        updated_fields = []
        if new_price is not None:
            old_price = service.price
            service.price = new_price
            updated_fields.append(f"precio (de {old_price}€ a {new_price}€)")
        
        if description is not None:
            service.description = description
            updated_fields.append("descripción corta")

        if content_html is not None:
            service.content_html = content_html
            updated_fields.append("contenido detallado (largo)")

        if not updated_fields:
            return "No se ha modificado ningún campo porque no se enviaron nuevos valores."

        db.commit()
        return f"Éxito: El servicio '{service.name}' ha sido actualizado correctamente: se modificó [{', '.join(updated_fields)}]."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en update_service_fields para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar los campos del servicio: {str(e)}"
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


def move_service_to_category(
    service_slug: str,
    category_slug: str
) -> str:
    """
    Mueve un tratamiento o servicio a una categoría específica utilizando sus respectivos slugs.
    
    Args:
        service_slug: El slug único del tratamiento/servicio que deseas mover (ej. 'botox', 'masaje-relajante').
        category_slug: El slug único de la categoría de destino (ej. 'medicina-estetica', 'masajes').
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."
            
        # 1. Buscar el servicio
        service = db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.slug == service_slug
        ).first()
        
        if not service:
            return f"Error: No se encontró ningún servicio con el slug '{service_slug}' en esta clínica."
            
        # 2. Buscar la categoría de destino
        category = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id,
            models.ServiceCategory.slug == category_slug
        ).first()
        
        if not category:
            # Intentar búsqueda aproximada por nombre
            category = db.query(models.ServiceCategory).filter(
                models.ServiceCategory.tenant_id == tenant_id,
                models.ServiceCategory.name.ilike(f"%{category_slug}%")
            ).first()
            
        if not category:
            return f"Error: No se encontró la categoría '{category_slug}'. Pídele al usuario que cree la categoría primero o especifique una válida."
            
        # 3. Asignar la categoría al servicio
        service.category_id = category.id
        db.commit()
        
        return f"Éxito: El servicio '{service.name}' ha sido movido correctamente a la categoría '{category.name}'."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al mover servicio {service_slug} a categoría {category_slug}: {e}")
        return f"Error al mover el servicio: {str(e)}"
    finally:
        db.close()


def get_uncategorized_services_and_categories() -> str:
    """
    Obtiene el listado de servicios que no tienen categoría asignada (o están en la categoría por defecto 'General')
    así como el listado de todas las categorías disponibles en la clínica para poder recomendar traslados.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."
            
        # 1. Obtener todas las categorías
        categories = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id,
            models.ServiceCategory.is_active == True
        ).all()
        
        cat_list = [f"- {c.name} (slug: {c.slug})" for c in categories]
        cat_str = "\n".join(cat_list) if cat_list else "Ninguna categoría creada aún."
        
        # 2. Obtener servicios sin categoría (category_id es None)
        uncategorized_services = db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.category_id == None
        ).all()
        
        # También buscar servicios en una categoría llamada 'general' o 'General'
        general_cat = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id,
            models.ServiceCategory.name.ilike("general")
        ).first()
        
        if general_cat:
            services_in_general = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.category_id == general_cat.id
            ).all()
            # Unir listas
            uncategorized_services.extend(services_in_general)
            
        # Quitar duplicados por ID
        seen = set()
        unique_services = []
        for s in uncategorized_services:
            if s.id not in seen:
                seen.add(s.id)
                unique_services.append(s)
                
        srv_list = [f"- {s.name} (slug: {s.slug})" for s in unique_services]
        srv_str = "\n".join(srv_list) if srv_list else "Todos los servicios ya están categorizados correctamente."
        
        return (
            f"--- CATEGORÍAS DISPONIBLES EN LA CLÍNICA ---\n{cat_str}\n\n"
            f"--- SERVICIOS EN CATEGORÍA GENERAL O SIN ASIGNAR ---\n{srv_str}"
        )
    except Exception as e:
        logger.error(f"Error en get_uncategorized_services_and_categories: {e}")
        return f"Error al consultar servicios y categorías: {str(e)}"
    finally:
        db.close()


def create_new_category(
    name: str,
    description: Optional[str] = None
) -> str:
    """
    Crea una nueva categoría de tratamientos/servicios en la base de datos de la clínica.
    
    Args:
        name: El nombre legible de la categoría (ej. 'Medicina Estética', 'Corporales').
        description: Una descripción opcional sobre qué tratamientos incluye esta categoría.
    """
    import uuid
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."
            
        import re
        # Generar slug único
        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
        
        # Verificar duplicado
        existing = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id,
            models.ServiceCategory.slug == slug
        ).first()
        
        if existing:
            return f"Error: Ya existe una categoría con el nombre o slug '{name}'."
            
        new_cat = models.ServiceCategory(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            name=name,
            slug=slug,
            description=description,
            is_active=True
        )
        db.add(new_cat)
        db.commit()
        return f"Éxito: Se ha creado correctamente la nueva categoría '{name}' con el slug '{slug}'."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear categoría {name}: {e}")
        return f"Error al crear la categoría: {str(e)}"
    finally:
        db.close()


def list_all_categories() -> str:
    """
    Obtiene la lista completa de todas las categorías de servicios/tratamientos registradas en la clínica.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."
            
        categories = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id,
            models.ServiceCategory.is_active == True
        ).order_by(models.ServiceCategory.order_index).all()
        
        if not categories:
            return "No hay ninguna categoría registrada en esta clínica todavía."
            
        result = ["Categorías registradas en la clínica:"]
        for c in categories:
            desc = f" - Desc: {c.description}" if c.description else ""
            result.append(f"- {c.name} (slug: '{c.slug}'){desc}")
            
        return "\n".join(result)
    except Exception as e:
        logger.error(f"Error en list_all_categories: {e}")
        return f"Error al listar las categorías: {str(e)}"
    finally:
        db.close()


def list_services_in_category(category_slug: str) -> str:
    """
    Lista todos los servicios o tratamientos que pertenecen a una categoría específica utilizando su slug o nombre aproximado.
    
    Args:
        category_slug: El slug de la categoría a consultar (ej. 'medicina-estetica', 'faciales').
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."
            
        # 1. Buscar la categoría
        category = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id,
            models.ServiceCategory.slug == category_slug
        ).first()
        
        if not category:
            # Búsqueda aproximada por nombre
            category = db.query(models.ServiceCategory).filter(
                models.ServiceCategory.tenant_id == tenant_id,
                models.ServiceCategory.name.ilike(f"%{category_slug}%")
            ).first()
            
        if not category:
            return f"Error: No se encontró la categoría '{category_slug}'."
            
        # 2. Buscar servicios asociados
        services = db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.category_id == category.id,
            models.Service.is_active == True
        ).all()
        
        if not services:
            return f"La categoría '{category.name}' no tiene ningún servicio o tratamiento activo asignado actualmente."
            
        result = [f"Servicios en la categoría '{category.name}':"]
        for s in services:
            result.append(f"- {s.name} (slug: '{s.slug}', precio: {s.price}€, duración: {s.duration_minutes} min)")
            
        return "\n".join(result)
    except Exception as e:
        logger.error(f"Error en list_services_in_category para {category_slug}: {e}")
        return f"Error al listar los servicios de la categoría: {str(e)}"
    finally:
        db.close()


# Lista de herramientas disponibles para Gemini
AGENT_TOOLS = [
    update_landing_config, 
    update_service_fields, 
    get_daily_appointments, 
    create_new_service, 
    move_service_to_category, 
    get_uncategorized_services_and_categories,
    create_new_category,
    list_all_categories,
    list_services_in_category
]

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

    user_name = getattr(request, 'user_name', None)
    greeting_instruction = ""
    if user_name and user_name.strip():
        greeting_instruction = f"El usuario actual con el que estás hablando en la sesión de administración se llama '{user_name.strip()}'. Dirígete a él o ella de manera cordial y educada directamente por su nombre '{user_name.strip()}' a lo largo de tu conversación.\n\n"

    system_instruction = (
        greeting_instruction +
        "Eres el 'AI Webmaster & Voice Agent' oficial de ProBookia, un asistente virtual premium "
        "diseñado para clínicas de medicina estética y alta gama. Tienes acceso a herramientas avanzadas "
        "para consultar citas de la agenda de hoy, modificar precios o descripciones de servicios (update_service_fields), crear nuevos servicios (create_new_service), mover servicios a categorías (move_service_to_category), recomendar reubicaciones de servicios sin categoría o en la categoría General (get_uncategorized_services_and_categories), y modificar el diseño visual "
        "y los textos principales de la landing page pública del inquilino actual.\n\n"
        "Reglas obligatorias de comportamiento:\n"
        "1. Mantén siempre un tono profesional, elegante y sofisticado (estilo 'Quiet Luxury').\n"
        "2. REGLA CRÍTICA DE IDIOMA: DEBES DETECTAR Y RESPONDER SIEMPRE EN EL MISMO IDIOMA QUE UTILIZA EL USUARIO EN SU MENSAJE o comando de voz. Si el usuario te habla en francés, responde en francés nativo y elegante. Si te habla en inglés, responde en inglés nativo y elegante. Si te habla en español, responde en español.\n"
        "3. Llama a las herramientas adecuadas de forma automática cuando el usuario solicite acciones. "
        "Por ejemplo, si te dice 'Cambia el precio de botox a 190 euros', debes invocar 'update_service_fields'. Si te dice 'Crea un servicio llamado Masaje Sueco a 80€', debes invocar 'create_new_service'.\n"
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
        "- Servicios, catálogo o tratamientos -> /dashboard/services (puedes añadir ?edit=slug-del-servicio como parámetro de consulta para abrir de forma directa y automática la ficha de edición de un servicio específico. Es OBLIGATORIO que deduzcas el 'slug-del-servicio' completo a partir de lo pedido por el usuario, convirtiendo espacios en guiones, quitando acentos y manteniéndolo en minúsculas. Por ejemplo, si te pide 'corte de pelo', el slug es 'corte-de-pelo'. Si te pide 'corte de pelo para niño', el slug DEBE ser 'corte-de-pelo-para-nino' o 'corte-de-pelo-nino'. ¡NUNCA trunques o acortes el slug ignorando palabras clave como 'niño' o 'niños', de lo contrario abrirás el servicio incorrecto!)\n"
        "- Equipo, especialistas o personal -> /dashboard/team\n"
        "- Ajustes, configuración o perfil -> /dashboard/settings\n"
        "- Galería de fotos o multimedia -> /dashboard/media\n"
        "- Editor Web, CMS o diseño -> /dashboard/cms\n"
        "- Copias de seguridad o backups -> /dashboard/backups\n"
        "- Inicio o dashboard -> /dashboard\n"
        "Asegúrate de asignar la propiedad 'route' and el 'message' en el idioma que corresponda al usuario.\n"
        "9. GENERACIÓN DE DESCRIPCIONES (CORTAS Y DETALLADAS): Tienes la capacidad de redactar y actualizar dos tipos de descripciones para los servicios de la clínica:\n"
        "   - DESCRIPCIÓN CORTA (campo 'description'): Es una presentación breve e inspiradora (1-2 párrafos sofisticados) que se muestra en las tarjetas generales del catálogo. Si el usuario pide 'una descripción', 'descripción corta' o similar, redáctala con un tono sofisticado (estilo Quiet Luxury) y guárdala en el argumento 'description'.\n"
        "   - CONTENIDO LARGO Y DETALLADO (campo 'content_html'): Es el contenido comercial principal, explicativo y rico de la página completa del tratamiento. Si el usuario te pide 'genera el contenido largo', 'redacta el contenido de la página', 'contenido detallado' o similar, debes utilizar tu capacidad creativa como LLM para redactar un texto extenso, completo, sumamente estructurado y elegante en formato HTML premium (utilizando etiquetas <p>, <ul>, <li>, <strong>, subsecciones con buen espaciado y un enfoque comercial de lujo), y guardarlo en el argumento 'content_html'.\n"
        "   - ACLARACIÓN DE BREVEDAD: La regla 6 (ser extremadamente breve) aplica UNICAMENTE al mensaje final de chat que el usuario ve/escucha en el globo de conversación (donde debes ser sofisticadamente conciso). Sin embargo, los textos que generas para guardar en la base de datos a través de 'update_service_fields' (tanto en 'description' como en 'content_html') DEBEN ser tan ricos, largos, persuasivos, descriptivos y extensos como sea necesario para lucir espectaculares en el catálogo público.\n"
        "   - Tienes la capacidad de redactar descripciones premium y sofisticadas (estilo Quiet Luxury) para los servicios. Si el usuario te pide generar una descripción, redáctala con elegancia en el idioma del usuario y guárdala inmediatamente invocando la herramienta correspondiente.\n"
        "10. ETIQUETAS DE DIRECCIÓN DE VOZ (TTS PROMPTING): Al redactar tu respuesta de texto final (nunca dentro de los JSON estructurados, solo cuando sea lenguaje natural directo), debes guiar la locución intercalando ocasionalmente etiquetas de dirección de voz encerradas entre corchetes para modular la entonación y el ritmo de la voz. Queremos lograr una voz sumamente energética, ágil, fluida y concisa. Utiliza obligatoriamente etiquetas dinámicas como [fast], [fluent], [short pause], o [with enthusiasm] antes de tus frases importantes (ejemplo: '[with enthusiasm] ¡Excelente! [short pause] [fast] Lo tengo listo de inmediato.'). Evita por completo usar etiquetas lentas o pausadas como [slower] o [deliberate pause]. Mantén tu texto corto y directo al grano.\n"
        "11. RECOMENDACIÓN Y TRASLADO DE CATEGORÍAS (SERVICIO PROACTIVO): Tienes la capacidad de organizar los tratamientos de la clínica. Si detectas o consultas que hay servicios en la categoría por defecto 'General' o sin categoría asignada, puedes proponerle proactivamente al usuario moverlos a una categoría más oportuna diciendo algo como: 'Si quieres, puedo mover este servicio a la categoría X'. Utiliza 'get_uncategorized_services_and_categories' para consultar el estado actual de las categorías y tratamientos sin asignar, y llama a 'move_service_to_category' de forma automática para moverlos de inmediato tras la confirmación o petición del usuario y dirigiéndote a él por su nombre si está disponible."
    )

    try:
        # 1. EL CEREBRO (Gemini 2.5 Flash): Mantiene la sesión de chat con herramientas y multiturnos (100% estable)
        model_brain = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            tools=AGENT_TOOLS,
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
                    elif name == "update_service_fields":
                        args = fn_call.args
                        if args:
                            updated_fields.extend(args.keys())
                    elif name == "create_new_service":
                        updated_fields.append("services")
                        args = fn_call.args
                        if args and 'name' in args:
                            import re
                            service_name = args['name']
                            slug = re.sub(r'[^a-z0-9]+', '-', service_name.lower()).strip('-')
                            redirect_url = f"/tratamientos/general/{slug}"
                    elif name == "move_service_to_category":
                        updated_fields.append("services")
                    elif name == "create_new_category":
                        updated_fields.append("categories")

        # Quitar duplicados en campos actualizados si existen
        updated_fields = list(set(updated_fields))

        # 3. LA VOZ (Gemini 3.1 Flash TTS): Convierte de forma secuencial el texto en voz hiperrealista (llamada single-turn)
        audio_response_base64 = None
        try:
            # Seleccionar voz según la preferencia enviada por el frontend
            voice_gender = getattr(request, 'voice_gender', 'female')
            voice_name = "Algieba" if voice_gender == "male" else "Zephyr"

            generation_config = {
                "response_modalities": ["TEXT", "AUDIO"],
                "speech_config": {
                    "voice_config": {
                        "prebuilt_voice_config": {
                            "voice_name": voice_name
                        }
                    }
                }
            }
            model_voice = genai.GenerativeModel(
                model_name="gemini-3.1-flash-tts-preview",
                generation_config=generation_config
            )

            # Formatear el prompt de locución estructurado (Director's Note + Audio Profile + Transcript)
            prompt_voice = (
                f"[Audio Profile]\n"
                f"A highly professional, elegant, elite, and energetic native speaker from Madrid, Spain. "
                f"Uses an authentic Peninsular Spanish accent with absolute naturalness, clarity, and sophistication. "
                f"The voice gender is {'male' if voice_gender == 'male' else 'female'}.\n\n"
                f"[Scene]\n"
                f"A premium, fast-paced, high-end medical-aesthetic clinic. The atmosphere is warm, positive, dynamic, and prestigious.\n\n"
                f"[Director's Note]\n"
                f"Deliver this script with a crisp, clear, and energetic Peninsular Castilian accent (no seseo, clear distinction, genuine Madrid cadence). "
                f"Speak very dynamically at a fast, fluent, active, and agile pace. Keep the delivery concise, lively, and highly convincing, avoiding any slow speech, artificial pauses, or sluggishness. "
                f"Execute all formatting brackets like [fast] or [with enthusiasm] with natural vocal energy.\n\n"
                f"[Transcript]\n"
                f"{brain_text}"
            )
            # Llamada de una sola vuelta (single-turn) que es la que el modelo de voz soporta perfectamente
            response_voice = model_voice.generate_content(prompt_voice)
            
            for candidate in response_voice.candidates:
                content = getattr(candidate, 'content', None)
                parts = getattr(content, 'parts', []) if content else []
                for part in parts:
                    inline_data = getattr(part, 'inline_data', None)
                    if inline_data:
                        mime_type = getattr(inline_data, 'mime_type', None)
                        data_bytes = getattr(inline_data, 'data', None)
                        if mime_type and data_bytes and mime_type.startswith("audio/"):
                            import base64
                            audio_bytes = data_bytes
                            # Si es PCM raw (audio/l16), le añadimos la cabecera WAV de 44 bytes para que el navegador lo reconozca
                            if "rate=24000" in mime_type or "l16" in mime_type or len(audio_bytes) > 1000:
                                import struct
                                # WAV header (44 bytes) for 24000Hz, 16-bit, Mono PCM
                                channels = 1
                                bit_depth = 16
                                sample_rate = 24000
                                header = b'RIFF'
                                header += struct.pack('<I', 36 + len(audio_bytes))
                                header += b'WAVEfmt '
                                header += struct.pack('<I', 16)
                                header += struct.pack('<H', 1)
                                header += struct.pack('<H', channels)
                                header += struct.pack('<I', sample_rate)
                                header += struct.pack('<I', sample_rate * channels * (bit_depth // 8))
                                header += struct.pack('<H', channels * (bit_depth // 8))
                                header += struct.pack('<H', bit_depth)
                                header += b'data'
                                header += struct.pack('<I', len(audio_bytes))
                                audio_bytes = header + audio_bytes
                            audio_response_base64 = base64.b64encode(audio_bytes).decode("utf-8")
                            break
                if audio_response_base64:
                    break
        except Exception as voice_err:
            logger.error(f"Error al generar audio en Gemini 3.1 TTS: {voice_err}")

        # Limpiar las etiquetas de dirección de voz (como [warmly], [deliberate pause]) para el chat de texto de la UI
        import re
        clean_text = re.sub(r'\[.*?\]', '', brain_text).strip()
        # Normalizar espacios duplicados que puedan haber quedado tras quitar las etiquetas
        clean_text = re.sub(r'\s+', ' ', clean_text)

        return schemas.AIChatResponse(
            response=clean_text,
            updated_fields=updated_fields if updated_fields else None,
            redirect_url=redirect_url,
            audio_response_base64=audio_response_base64
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



