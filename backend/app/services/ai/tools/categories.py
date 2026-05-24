import re
import uuid
import logging
from typing import Optional

from .... import models, schemas
from ....database import SessionLocal, current_tenant_var

logger = logging.getLogger("ai_agent_tools_categories")

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
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."
            
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
