import logging
from typing import Optional

from .... import models, schemas
from ....database import SessionLocal, current_tenant_var
from ....crud.site_content import update_site_content

logger = logging.getLogger("ai_agent_tools_landing")

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

        # Construir el esquema de actualización
        update_payload = schemas.SiteContentUpdate(
            hero_title=hero_title,
            hero_subtitle=hero_subtitle,
            about_title=about_title,
            about_text=about_text,
            cta_title=cta_title,
            cta_subtitle=cta_subtitle
        )

        # Actualizar SiteContent llamando al CRUD del CMS
        update_site_content(db, update_payload)

        return "Éxito: La configuración de la landing page ha sido actualizada correctamente en la base de datos."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar landing page para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar la landing page: {str(e)}"
    finally:
        db.close()
