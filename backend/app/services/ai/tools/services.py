import re
import uuid
import logging
import unicodedata
from typing import Optional

from .... import models, schemas
from ....database import SessionLocal, current_tenant_var

logger = logging.getLogger("ai_agent_tools_services")

VOICE_TAGS_REGEX = re.compile(r'\[(?:with enthusiasm|fast|fluent|short pause|slower|whispering|cheerful|calm|excited)[^\]]*\]', re.IGNORECASE)

def _sanitize_service_text(val: Optional[str]) -> Optional[str]:
    if not val:
        return val
    cleaned = VOICE_TAGS_REGEX.sub('', val)
    cleaned = re.sub(r'<[^>]*>', '', cleaned)
    return cleaned.strip()

def _normalize_search_string(val: Optional[str]) -> str:
    if not val:
        return ""
    nfkd = unicodedata.normalize('NFKD', val)
    stripped = "".join([c for c in nfkd if not unicodedata.combining(c)])
    clean = re.sub(r'[^a-z0-9\s]', ' ', stripped.lower())
    return re.sub(r'\s+', ' ', clean).strip()

def update_service_fields(
    service_slug: str,
    name: Optional[str] = None,
    price: Optional[float] = None,
    duration_minutes: Optional[int] = None,
    description: Optional[str] = None,
    content_html: Optional[str] = None,
    category_name_or_slug: Optional[str] = None,
    image_url: Optional[str] = None
) -> str:
    """
    Actualiza campos específicos de un servicio o tratamiento existente en la clínica a partir de su slug, ID o nombre.
    Solo se actualizarán los campos que se pasen con un valor no nulo.

    Args:
        service_slug: El identificador único en formato URL (slug), ID o nombre del servicio a modificar (ej. 'botox', 'coupe-fille-et-garcon-moins-de-6-ans').
        name: Opcional. El nuevo nombre o título comercial para el servicio.
        price: El nuevo precio en euros (€).
        duration_minutes: Duración del tratamiento en minutos.
        description: Breve descripción inspiradora de 1 o 2 párrafos sofisticados en texto plano.
        content_html: Texto comercial largo y detallado formateado en HTML limpio (<p>, <ul>, <li>, <strong>) listo para la web.
        category_name_or_slug: Opcional. El nombre o slug de la nueva categoría a la cual reasignar este servicio.
        image_url: Opcional. La nueva dirección URL de la imagen del servicio.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        raw_search = service_slug.strip()
        service = None

        # 1. Búsqueda por ID (ej. si viene de DOM como svc-content-<UUID>)
        clean_id = re.sub(r'^svc-(?:content|title|pricing|desc|media)-', '', raw_search, flags=re.IGNORECASE).strip()
        try:
            uuid.UUID(clean_id)
            service = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.id == clean_id
            ).first()
        except (ValueError, TypeError):
            pass

        # 2. Si viene como URL (ej. /tratamientos/categoria/slug-tratamiento)
        url_slug_candidate = raw_search.lstrip('/')
        if 'tratamientos/' in url_slug_candidate or 'services/' in url_slug_candidate:
            url_slug_candidate = url_slug_candidate.split('/')[-1]

        if not service:
            service = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.slug == url_slug_candidate
            ).first()

        # 3. Búsqueda inteligente por tokens y normalización en memoria
        if not service:
            all_services = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id
            ).all()

            norm_target = _normalize_search_string(raw_search)
            norm_cand = _normalize_search_string(url_slug_candidate)
            target_tokens = set(norm_target.split())

            # A. Slug normalizado
            for s in all_services:
                s_norm_slug = _normalize_search_string(s.slug or "")
                if s_norm_slug and (s_norm_slug == norm_cand or s_norm_slug == norm_target):
                    service = s
                    break

            # B. Nombre normalizado exacto
            if not service:
                for s in all_services:
                    s_norm_name = _normalize_search_string(s.name)
                    if s_norm_name and s_norm_name == norm_target:
                        service = s
                        break

            # C. Puntuación de solapamiento de tokens (para nombres con signos como + o / o acentos)
            if not service and target_tokens:
                best_score = 0
                best_match = None
                meaningful_target = {t for t in target_tokens if len(t) > 1} or target_tokens
                for s in all_services:
                    s_tokens = set(_normalize_search_string(s.name).split())
                    meaningful_s = {t for t in s_tokens if len(t) > 1} or s_tokens
                    common = meaningful_target.intersection(meaningful_s)
                    score = len(common)
                    if score > best_score:
                        best_score = score
                        best_match = s

                if best_match and best_score >= 1:
                    service = best_match

        if not service:
            return f"Error: No se encontró ningún servicio que coincida con '{service_slug}' en esta clínica."

        updated_parts = []
        if name is not None:
            clean_name = _sanitize_service_text(name)
            if clean_name:
                old_name = service.name
                service.name = clean_name
                new_slug = re.sub(r'[^a-z0-9]+', '-', clean_name.lower()).strip('-')
                col = db.query(models.Service).filter(
                    models.Service.tenant_id == tenant_id,
                    models.Service.slug == new_slug,
                    models.Service.id != service.id
                ).first()
                if not col and new_slug:
                    service.slug = new_slug
                updated_parts.append(f"nombre de '{old_name}' a '{clean_name}'")

        if price is not None:
            service.price = price
            updated_parts.append(f"precio a {price}€")
        if duration_minutes is not None:
            service.duration_minutes = duration_minutes
            updated_parts.append(f"duración a {duration_minutes} min")
        if description is not None:
            clean_desc = _sanitize_service_text(description)
            service.description = clean_desc
            updated_parts.append("descripción corta actualizada")
        if content_html is not None:
            service.content_html = content_html
            updated_parts.append("contenido detallado HTML actualizado")
        if image_url is not None:
            service.image_url = image_url
            updated_parts.append("imagen del servicio actualizada")

        if category_name_or_slug is not None:
            # Buscar la categoría
            category = db.query(models.ServiceCategory).filter(
                models.ServiceCategory.tenant_id == tenant_id,
                models.ServiceCategory.slug == category_name_or_slug
            ).first()

            if not category:
                category = db.query(models.ServiceCategory).filter(
                    models.ServiceCategory.tenant_id == tenant_id,
                    models.ServiceCategory.name.ilike(f"%{category_name_or_slug}%")
                ).first()

            if not category:
                converted_slug = re.sub(r'[^a-z0-9]+', '-', category_name_or_slug.lower()).strip('-')
                category = db.query(models.ServiceCategory).filter(
                    models.ServiceCategory.tenant_id == tenant_id,
                    models.ServiceCategory.slug == converted_slug
                ).first()

            if category:
                service.category_id = category.id
                updated_parts.append(f"categoría cambiada a '{category.name}'")
            else:
                # Crear categoría al vuelo
                cat_slug = re.sub(r'[^a-z0-9]+', '-', category_name_or_slug.lower()).strip('-')
                new_cat = models.ServiceCategory(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    name=category_name_or_slug,
                    slug=cat_slug,
                    is_active=True
                )
                db.add(new_cat)
                db.flush()
                service.category_id = new_cat.id
                updated_parts.append(f"categoría al vuelo '{category_name_or_slug}' creada y asociada")

        if not updated_parts:
            return "No se ha proporcionado ningún campo válido para actualizar."

        db.commit()
        cat_slug = service.category.slug if service.category else 'general'
        service_url = f"/tratamientos/{cat_slug}/{service.slug}"
        return f"Éxito: El servicio '{service.name}' ha sido actualizado correctamente ({', '.join(updated_parts)}). [SERVICE_URL: {service_url}]"
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
    description: Optional[str] = None,
    category_name_or_slug: Optional[str] = None,
    image_url: Optional[str] = None
) -> str:
    """
    Crea y registra un nuevo servicio o tratamiento en el catálogo oficial de la clínica.
    Si se proporciona una categoría (por nombre o slug), se asociará directamente de forma robusta.

    Args:
        name: El nombre legible del servicio (ej. 'Peeling Químico', 'Masaje Relajante').
        price: Precio base del tratamiento en euros (€).
        duration_minutes: Duración del tratamiento en minutos.
        description: Breve descripción inspiradora de la experiencia en la clínica.
        category_name_or_slug: Opcional. El nombre o slug de la categoría a la cual asignar este servicio.
        image_url: Opcional. La dirección URL de la imagen principal del servicio.
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

        category_id = None
        category_msg = ""
        if category_name_or_slug:
            # Buscar categoría por slug
            category = db.query(models.ServiceCategory).filter(
                models.ServiceCategory.tenant_id == tenant_id,
                models.ServiceCategory.slug == category_name_or_slug
            ).first()

            if not category:
                # Buscar por coincidencia parcial de nombre
                category = db.query(models.ServiceCategory).filter(
                    models.ServiceCategory.tenant_id == tenant_id,
                    models.ServiceCategory.name.ilike(f"%{category_name_or_slug}%")
                ).first()

            if not category:
                # Convertir espacios en guiones y buscar
                converted_slug = re.sub(r'[^a-z0-9]+', '-', category_name_or_slug.lower()).strip('-')
                category = db.query(models.ServiceCategory).filter(
                    models.ServiceCategory.tenant_id == tenant_id,
                    models.ServiceCategory.slug == converted_slug
                ).first()

            if category:
                category_id = category.id
                category_msg = f" y asociado a la categoría '{category.name}'"
            else:
                # Crear categoría al vuelo para máxima fluidez de importación
                cat_slug = re.sub(r'[^a-z0-9]+', '-', category_name_or_slug.lower()).strip('-')
                new_cat = models.ServiceCategory(
                    id=str(uuid.uuid4()),
                    tenant_id=tenant_id,
                    name=category_name_or_slug,
                    slug=cat_slug,
                    is_active=True
                )
                db.add(new_cat)
                db.flush()
                category_id = new_cat.id
                category_msg = f" y asociado a la nueva categoría creada al vuelo '{category_name_or_slug}'"

        new_service = models.Service(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            category_id=category_id,
            name=name,
            slug=slug,
            price=price,
            duration_minutes=duration_minutes,
            description=description or "Tratamiento genérico en clínica. Sin especificaciones adicionales.",
            image_url=image_url,
            is_active=True
        )

        db.add(new_service)
        db.commit()
        return f"Éxito: Se ha creado el nuevo servicio '{name}' con precio de {price}€ y duración de {duration_minutes} minutos correctamente{category_msg}."
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
