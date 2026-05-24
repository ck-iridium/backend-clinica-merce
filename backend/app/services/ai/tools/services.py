import re
import uuid
import logging
from typing import Optional

from .... import models, schemas
from ....database import SessionLocal, current_tenant_var

logger = logging.getLogger("ai_agent_tools_services")

def update_service_fields(
    service_slug: str,
    price: Optional[float] = None,
    duration_minutes: Optional[int] = None,
    description: Optional[str] = None,
    content_html: Optional[str] = None
) -> str:
    """
    Actualiza campos específicos de un servicio o tratamiento existente en la clínica a partir de su slug.
    Solo se actualizarán los campos que se pasen con un valor no nulo.

    Args:
        service_slug: El identificador único en formato URL (slug) del servicio a modificar (ej. 'botox', 'masaje-relajante').
        price: El nuevo precio en euros (€).
        duration_minutes: Duración del tratamiento en minutos.
        description: Breve descripción inspiradora de 1 o 2 párrafos sofisticados en texto plano.
        content_html: Texto comercial largo y detallado formateado en HTML limpio (<p>, <ul>, <li>, <strong>) listo para la web.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        service = db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.slug == service_slug
        ).first()

        if not service:
            # Buscar por aproximación si no encuentra el slug exacto
            service = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.name.ilike(f"%{service_slug}%")
            ).first()

        if not service:
            return f"Error: No se encontró ningún servicio que coincida con '{service_slug}' en esta clínica."

        updated_parts = []
        if price is not None:
            service.price = price
            updated_parts.append(f"precio a {price}€")
        if duration_minutes is not None:
            service.duration_minutes = duration_minutes
            updated_parts.append(f"duración a {duration_minutes} min")
        if description is not None:
            service.description = description
            updated_parts.append("descripción corta actualizada")
        if content_html is not None:
            service.content_html = content_html
            updated_parts.append("contenido detallado HTML actualizado")

        if not updated_parts:
            return "No se ha proporcionado ningún campo válido para actualizar."

        db.commit()
        return f"Éxito: El servicio '{service.name}' ha sido actualizado correctamente ({', '.join(updated_parts)})."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar servicio {service_slug} para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar el servicio: {str(e)}"
    finally:
        db.close()


def create_new_service(
    name: str,
    price: float,
    duration_minutes: int,
    description: Optional[str] = None
) -> str:
    """
    Crea y registra un nuevo servicio o tratamiento en el catálogo oficial de la clínica.

    Args:
        name: El nombre legible del servicio (ej. 'Peeling Químico', 'Masaje Relajante').
        price: Precio base del tratamiento en euros (€).
        duration_minutes: Duración del tratamiento en minutos.
        description: Breve descripción inspiradora de la experiencia en la clínica.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')

        # Buscar duplicado
        existing = db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.slug == slug
        ).first()

        if existing:
            return f"Error: Ya existe un servicio en tu catálogo con el nombre o slug '{name}'."

        new_service = models.Service(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            name=name,
            slug=slug,
            price=price,
            duration_minutes=duration_minutes,
            description=description or "Tratamiento genérico en clínica. Sin especificaciones adicionales.",
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
    Mueve un tratamiento o servicio a una categoría específica utilizando sus respectivos slugs o nombres aproximados.
    
    Args:
        service_slug: El slug único o nombre del tratamiento/servicio que deseas mover (ej. 'botox', 'masaje-relajante').
        category_slug: El slug único o nombre de la categoría de destino (ej. 'medicina-estetica', 'masajes').
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."
            
        # 1. Buscar el servicio de forma ultra-robusta (slug, nombre exacto, o parcial)
        service = db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.slug == service_slug
        ).first()
        
        if not service:
            # Buscar por nombre exacto (case-insensitive)
            service = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.name.ilike(service_slug)
            ).first()
            
        if not service:
            # Búsqueda parcial por nombre
            service = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.name.ilike(f"%{service_slug}%")
            ).first()
            
        if not service:
            # Convertir espacios en guiones
            import re
            converted_slug = re.sub(r'[^a-z0-9]+', '-', service_slug.lower()).strip('-')
            service = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.slug == converted_slug
            ).first()
            
        if not service:
            return f"Error: No se encontró ningún servicio que coincida con '{service_slug}' en esta clínica."
            
        # 2. Buscar la categoría de destino de forma ultra-robusta
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
            # Convertir espacios en guiones
            import re
            converted_slug = re.sub(r'[^a-z0-9]+', '-', category_slug.lower()).strip('-')
            category = db.query(models.ServiceCategory).filter(
                models.ServiceCategory.tenant_id == tenant_id,
                models.ServiceCategory.slug == converted_slug
            ).first()
            
        if not category:
            return f"Error: No se encontró la categoría '{category_slug}'."
            
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


def list_all_services() -> str:
    """
    Obtiene el listado completo de todos los servicios o tratamientos de la clínica,
    con sus precios, duración y categoría asignada.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."
            
        services = db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.is_active == True
        ).all()
        
        if not services:
            return "No hay ningún servicio registrado en esta clínica todavía."
            
        result = ["Servicios registrados en la clínica:"]
        for s in services:
            cat_name = "Ninguna"
            if s.category_id:
                cat = db.query(models.ServiceCategory).filter(models.ServiceCategory.id == s.category_id).first()
                if cat:
                    cat_name = cat.name
            result.append(f"- {s.name} (slug: '{s.slug}', precio: {s.price}€, duración: {s.duration_minutes} min, categoría: '{cat_name}')")
            
        return "\n".join(result)
    except Exception as e:
        logger.error(f"Error en list_all_services: {e}")
        return f"Error al listar los servicios: {str(e)}"
    finally:
        db.close()
