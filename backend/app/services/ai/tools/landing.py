import logging
from typing import Optional

from .... import models, schemas
from ....database import SessionLocal, current_tenant_var
from ....crud.site_content import update_site_content

logger = logging.getLogger("ai_agent_tools_landing")

def update_landing_config(
    hero_title: Optional[str] = None,
    hero_subtitle: Optional[str] = None,
    hero_alignment: Optional[str] = None,
    hero_horizontal_alignment: Optional[str] = None,
    hero_content_fullwidth: Optional[bool] = None,
    hero_title_size: Optional[str] = None,
    hero_subtitle_size: Optional[str] = None,
    hero_show_button: Optional[bool] = None,
    hero_button_text: Optional[str] = None,
    hero_button_link: Optional[str] = None,
    about_title: Optional[str] = None,
    about_text: Optional[str] = None,
    cta_title: Optional[str] = None,
    cta_subtitle: Optional[str] = None
) -> str:
    """
    Actualiza la configuración, estilos de alineación, tamaños tipográficos y textos principales de la landing page pública del inquilino.
    Solo se actualizarán los campos que no sean nulos (None).

    Args:
        hero_title: Nuevo título para la sección de bienvenida (Hero).
        hero_subtitle: Nuevo subtítulo para la sección de bienvenida.
        hero_alignment: Alineación vertical del Hero ('top' = superior, 'center' = centrado, 'bottom' = inferior).
        hero_horizontal_alignment: Alineación horizontal del Hero ('left' = izquierda, 'center' = centrado, 'right' = derecha).
        hero_content_fullwidth: Booleano que define el ancho del contenido. False = alineado a la cuadrícula de la web y el logotipo (recomendado); True = ancho completo hasta el borde de la pantalla.
        hero_title_size: Escala tipográfica del título ('medium' = mediano, 'large' = grande por defecto, 'xl' = monumental).
        hero_subtitle_size: Escala tipográfica del subtítulo ('small' = discreto, 'medium' = equilibrado por defecto, 'large' = destacado).
        hero_show_button: Mostrar u ocultar el botón de acción principal del Hero.
        hero_button_text: Texto del botón de acción del Hero (ej: 'Reservar Cita').
        hero_button_link: Enlace de destino del botón del Hero (ej: '/reservar').
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
            hero_alignment=hero_alignment,
            hero_horizontal_alignment=hero_horizontal_alignment,
            hero_content_fullwidth=hero_content_fullwidth,
            hero_title_size=hero_title_size,
            hero_subtitle_size=hero_subtitle_size,
            hero_show_button=hero_show_button,
            hero_button_text=hero_button_text,
            hero_button_link=hero_button_link,
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
