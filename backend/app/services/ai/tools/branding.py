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
    branding_font_body: Optional[str] = None,
    header_logo_height: Optional[int] = None,
    header_logo_mode: Optional[str] = None,
    header_logo_padding_y: Optional[int] = None,
    header_logo_margin_right: Optional[int] = None,
    mobile_logo_height: Optional[int] = None,
    mobile_logo_mode: Optional[str] = None,
    footer_logo_mode: Optional[str] = None
) -> str:
    """
    Actualiza la configuración visual de marca (Branding) e identidad corporativa de la clínica.
    Permite modificar de forma conversacional el color de acento, tipografías, geometría de bordes, modo oscuro,
    y calibrar las dimensiones y modos de color del logotipo (cabecera, móvil y pie de página).
    Solo se actualizarán los campos que no sean nulos (None).

    Args:
        accent_color: Código de color hexadecimal para el acento dinámico (ej: '#D4AF37', '#1E3A8A', '#000000').
        dark_mode_enabled: Indica si se debe activar el modo oscuro global (True) o el modo claro (False).
        border_radius: Geometría global de bordes del software. Opciones: 'recto', 'suave', 'organico'.
        branding_font_headings: Fuente tipográfica premium para los títulos (ej: 'Playfair Display', 'Cormorant Garamond', 'Montserrat', 'Inter', 'Outfit').
        branding_font_body: Fuente tipográfica premium para el cuerpo de texto (ej: 'Inter', 'Outfit', 'Montserrat').
        header_logo_height: Altura del logotipo de cabecera en píxeles (ej: 42).
        header_logo_mode: Modo de color del logo de cabecera ('original', 'white', 'adaptive').
        header_logo_padding_y: Desplazamiento vertical del logo en píxeles para centrado fino (ej: -4, 0, 4).
        header_logo_margin_right: Margen derecho del logo hacia los enlaces de menú en píxeles (ej: 24).
        mobile_logo_height: Altura del logotipo móvil en píxeles (ej: 36).
        mobile_logo_mode: Modo de color del logo móvil ('original', 'white', 'adaptive').
        footer_logo_mode: Modo de color del logo del pie de página ('original', 'white').
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
            settings.border_radius = border_radius.lower()
        if branding_font_headings is not None:
            settings.branding_font_headings = branding_font_headings
        if branding_font_body is not None:
            settings.branding_font_body = branding_font_body

        # Nuevos calibradores de logotipo
        if header_logo_height is not None:
            settings.header_logo_height = header_logo_height
        if header_logo_mode is not None:
            settings.header_logo_mode = header_logo_mode.lower()
        if header_logo_padding_y is not None:
            settings.header_logo_padding_y = header_logo_padding_y
        if header_logo_margin_right is not None:
            settings.header_logo_margin_right = header_logo_margin_right
        if mobile_logo_height is not None:
            settings.mobile_logo_height = mobile_logo_height
        if mobile_logo_mode is not None:
            settings.mobile_logo_mode = mobile_logo_mode.lower()
        if footer_logo_mode is not None:
            settings.footer_logo_mode = footer_logo_mode.lower()

        db.commit()
        return "Éxito: La identidad de marca, calibración de logotipos y branding visual ha sido actualizada correctamente en la base de datos."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar branding para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar el branding visual: {str(e)}"
    finally:
        db.close()
