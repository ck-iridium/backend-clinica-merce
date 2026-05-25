import logging
from typing import Optional

from .... import models, schemas
from ....database import SessionLocal, current_tenant_var

logger = logging.getLogger("ai_agent_tools_branding")

def update_tenant_branding(
    accent_color: Optional[str] = None,
    dark_mode_enabled: Optional[bool] = None,
    border_radius: Optional[str] = None,
    branding_font_headings: Optional[str] = None,
    branding_font_body: Optional[str] = None
) -> str:
    """
    Actualiza la configuración visual de marca (Branding) e identidad corporativa de la clínica.
    Permite modificar de forma conversacional el color de acento, tipografías, geometría de bordes y modo oscuro.
    Solo se actualizarán los campos que no sean nulos (None).

    Args:
        accent_color: Código de color hexadecimal para el acento dinámico (ej: '#D4AF37', '#1E3A8A', '#000000').
        dark_mode_enabled: Indica si se debe activar el modo oscuro global (True) o el modo claro (False).
        border_radius: Geometría global de bordes del software. Opciones: 'recto', 'suave', 'organico'.
        branding_font_headings: Fuente tipográfica premium para los títulos (ej: 'Playfair Display', 'Cormorant Garamond', 'Montserrat', 'Inter', 'Outfit').
        branding_font_body: Fuente tipográfica premium para el cuerpo de texto (ej: 'Inter', 'Outfit', 'Montserrat').
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        settings = db.query(models.ClinicSettings).filter(
            models.ClinicSettings.tenant_id == tenant_id
        ).first()

        if not settings:
            settings = models.ClinicSettings(tenant_id=tenant_id)
            db.add(settings)

        if accent_color is not None:
            settings.accent_color = accent_color
        if dark_mode_enabled is not None:
            settings.dark_mode_enabled = dark_mode_enabled
        if border_radius is not None:
            # Normalizar a minúsculas
            settings.border_radius = border_radius.lower()
        if branding_font_headings is not None:
            settings.branding_font_headings = branding_font_headings
        if branding_font_body is not None:
            settings.branding_font_body = branding_font_body

        db.commit()
        return "Éxito: La identidad de marca y branding visual ha sido actualizada correctamente en la base de datos."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar branding para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar el branding visual: {str(e)}"
    finally:
        db.close()
