import logging
import uuid
from typing import Optional, List, Dict, Any

from .... import models, schemas
from ....database import SessionLocal, current_tenant_var
from ....crud.site_content import get_site_content, update_site_content

logger = logging.getLogger("ai_agent_tools_landing")

def _normalize_slides(content: models.SiteContent) -> List[Dict[str, Any]]:
    """Devuelve la lista de diapositivas normalizada o genera la inicial a partir de las propiedades raíz."""
    if content.hero_slides and isinstance(content.hero_slides, list) and len(content.hero_slides) > 0:
        return [dict(s) for s in content.hero_slides]
    
    return [{
        "id": "slide-1",
        "hero_title": content.hero_title or "Descubre tu mejor versión",
        "hero_subtitle": content.hero_subtitle or "Tratamientos personalizados para tu bienestar.",
        "hero_image_url": content.hero_image_url,
        "hero_video_url": content.hero_video_url,
        "hero_title_size": content.hero_title_size or "large",
        "hero_subtitle_size": content.hero_subtitle_size or "medium",
        "hero_title_max_width": content.hero_title_max_width if content.hero_title_max_width is not None else 100,
        "hero_price_enabled": bool(content.hero_price_enabled),
        "hero_price_prefix": content.hero_price_prefix or "Desde",
        "hero_price_amount": content.hero_price_amount or "",
        "hero_price_suffix": content.hero_price_suffix or "€",
        "hero_price_period": content.hero_price_period or "",
        "hero_price_size": content.hero_price_size or "large",
        "hero_price_offset_y": content.hero_price_offset_y or 0,
        "hero_price_style": content.hero_price_style or "capsule_dark",
        "hero_show_button": content.hero_show_button if content.hero_show_button is not None else True,
        "hero_button_text": content.hero_button_text or "Reservar Cita",
        "hero_button_link": content.hero_button_link or "/reservar",
        "hero_button_style": content.hero_button_style or "glass",
        "hero_alignment": content.hero_alignment or "center",
        "hero_horizontal_alignment": content.hero_horizontal_alignment or "center",
        "hero_content_fullwidth": bool(content.hero_content_fullwidth)
    }]


def get_hero_slides() -> str:
    """
    Consulta y lista todas las diapositivas (slides) configuradas en el carrusel de la cabecera (Hero) de la web.
    Permite conocer cuántas diapositivas hay, sus títulos, subtítulos, precios, botones, estado y orden.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        content = get_site_content(db)
        slides = _normalize_slides(content)
        total = len(slides)

        autoplay = "Activado" if (content.hero_slider_autoplay ?? True) else "Pausado"
        interval = content.hero_slider_interval or 5
        effect = content.hero_slider_effect or "fade"

        lines = [
            f"El Hero de la web tiene actualmente {total} diapositiva(s) configurada(s).",
            f"Configuración del carrusel: Reproducción automática: {autoplay}, Intervalo: {interval}s, Efecto de transición: {effect}.\n"
        ]

        for idx, s in enumerate(slides, 1):
            title = s.get("hero_title") or "(Sin título)"
            subtitle = s.get("hero_subtitle") or "(Sin subtítulo)"
            media = "Vídeo" if s.get("hero_video_url") else ("Imagen" if s.get("hero_image_url") else "Sin fondo")
            
            price_info = "Desactivado"
            if s.get("hero_price_enabled") and s.get("hero_price_amount"):
                prefix = s.get("hero_price_prefix", "")
                amount = s.get("hero_price_amount", "")
                suffix = s.get("hero_price_suffix", "€")
                period = f" {s.get('hero_price_period')}" if s.get("hero_price_period") else ""
                price_info = f"{prefix} {amount}{suffix}{period}".strip()

            button_info = "Oculto"
            if s.get("hero_show_button", True):
                btn_txt = s.get("hero_button_text") or "Reservar Cita"
                btn_link = s.get("hero_button_link") or "/reservar"
                button_info = f"'{btn_txt}' -> {btn_link}"

            lines.append(
                f"- Diapositiva {idx}: Título: \"{title}\" | Subtítulo: \"{subtitle}\" | Precio: {price_info} | Fondo: {media} | Botón CTA: {button_info}"
            )

        return "\n".join(lines)
    except Exception as e:
        logger.error(f"Error en get_hero_slides: {e}")
        return f"Error al consultar las diapositivas del Hero: {str(e)}"
    finally:
        db.close()


def add_hero_slide(
    title: str,
    subtitle: Optional[str] = "",
    price_amount: Optional[str] = None,
    price_prefix: Optional[str] = "Desde",
    price_suffix: Optional[str] = "€",
    price_period: Optional[str] = None,
    button_text: Optional[str] = "Reservar Cita",
    button_link: Optional[str] = "/reservar",
    image_url: Optional[str] = None,
    video_url: Optional[str] = None,
    alignment: Optional[str] = "center",
    horizontal_alignment: Optional[str] = "center"
) -> str:
    """
    Crea y añade una nueva diapositiva (slide) al carrusel Hero de la portada.

    Args:
        title: Título principal de la nueva diapositiva.
        subtitle: Subtítulo descriptivo opcional.
        price_amount: Importe numérico de oferta o precio destacado (ej: '45', '120'). Si se proporciona, el precio se activa automáticamente.
        price_prefix: Prefijo del precio (ej: 'Desde', 'Solo').
        price_suffix: Sufijo de moneda (ej: '€').
        price_period: Periodo del precio (ej: 'mes', 'sesión', 'año').
        button_text: Texto del botón de acción (ej: 'Ver Tratamiento', 'Reservar Cita').
        button_link: Enlace al que dirige el botón (ej: '/reservar', '#tratamientos').
        image_url: URL de la imagen de fondo.
        video_url: URL del vídeo de fondo.
        alignment: Alineación vertical ('top', 'center', 'bottom').
        horizontal_alignment: Alineación horizontal ('left', 'center', 'right').
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        content = get_site_content(db)
        slides = _normalize_slides(content)

        new_slide = {
            "id": f"slide-{uuid.uuid4().hex[:8]}",
            "hero_title": title,
            "hero_subtitle": subtitle or "",
            "hero_image_url": image_url,
            "hero_video_url": video_url,
            "hero_title_size": "large",
            "hero_subtitle_size": "medium",
            "hero_title_max_width": 100,
            "hero_price_enabled": bool(price_amount),
            "hero_price_prefix": price_prefix or "Desde",
            "hero_price_amount": price_amount or "",
            "hero_price_suffix": price_suffix or "€",
            "hero_price_period": price_period or "",
            "hero_price_size": "large",
            "hero_price_offset_y": 0,
            "hero_price_style": "capsule_dark",
            "hero_show_button": True,
            "hero_button_text": button_text or "Reservar Cita",
            "hero_button_link": button_link or "/reservar",
            "hero_button_style": "glass",
            "hero_alignment": alignment or "center",
            "hero_horizontal_alignment": horizontal_alignment or "center",
            "hero_content_fullwidth": False
        }

        slides.append(new_slide)
        update_site_content(db, schemas.SiteContentUpdate(hero_slides=slides))
        return f"Éxito: Se ha creado y añadido la diapositiva {len(slides)}: \"{title}\" con éxito al Hero."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en add_hero_slide: {e}")
        return f"Error al añadir la diapositiva: {str(e)}"
    finally:
        db.close()


def update_hero_slide(
    slide_index: int,
    title: Optional[str] = None,
    subtitle: Optional[str] = None,
    price_amount: Optional[str] = None,
    price_prefix: Optional[str] = None,
    price_suffix: Optional[str] = None,
    price_period: Optional[str] = None,
    price_enabled: Optional[bool] = None,
    price_style: Optional[str] = None,
    button_text: Optional[str] = None,
    button_link: Optional[str] = None,
    button_style: Optional[str] = None,
    show_button: Optional[bool] = None,
    image_url: Optional[str] = None,
    video_url: Optional[str] = None,
    alignment: Optional[str] = None,
    horizontal_alignment: Optional[str] = None,
    title_size: Optional[str] = None,
    subtitle_size: Optional[str] = None
) -> str:
    """
    Modifica los campos de una diapositiva específica existente en el Hero mediante su número de posición (1 para la primera, 2 para la segunda, etc.).

    Args:
        slide_index: Número de orden de la diapositiva a editar (1-indexed: 1, 2, 3...).
        title: Nuevo título de la diapositiva.
        subtitle: Nuevo subtítulo de la diapositiva.
        price_amount: Importe numérico destacado (ej: '50', '95').
        price_prefix: Texto superior del precio (ej: 'Desde', 'Promoción').
        price_suffix: Moneda (ej: '€').
        price_period: Periodo (ej: 'mes', 'sesión').
        price_enabled: True para activar el precio en esta diapositiva, False para ocultarlo.
        price_style: Estilo visual del precio ('capsule_dark', 'outline', 'minimal', 'solid_white').
        button_text: Texto del botón de acción.
        button_link: Enlace de destino del botón.
        button_style: Estilo del botón ('glass', 'gold_solid', 'outline', 'solid_white').
        show_button: True para mostrar el botón, False para ocultarlo.
        image_url: URL de imagen de fondo.
        video_url: URL de vídeo de fondo.
        alignment: Alineación vertical ('top', 'center', 'bottom').
        horizontal_alignment: Alineación horizontal ('left', 'center', 'right').
        title_size: Tamaño de fuente del título ('medium', 'large', 'xl').
        subtitle_size: Tamaño del subtítulo ('small', 'medium', 'large').
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        content = get_site_content(db)
        slides = _normalize_slides(content)

        idx = slide_index - 1
        if idx < 0 or idx >= len(slides):
            return f"Error: La diapositiva {slide_index} no existe. Actualmente hay {len(slides)} diapositiva(s) disponibles."

        target = slides[idx]

        if title is not None: target["hero_title"] = title
        if subtitle is not None: target["hero_subtitle"] = subtitle
        if price_amount is not None:
            target["hero_price_amount"] = price_amount
            target["hero_price_enabled"] = True
        if price_prefix is not None: target["hero_price_prefix"] = price_prefix
        if price_suffix is not None: target["hero_price_suffix"] = price_suffix
        if price_period is not None: target["hero_price_period"] = price_period
        if price_enabled is not None: target["hero_price_enabled"] = price_enabled
        if price_style is not None: target["hero_price_style"] = price_style
        if button_text is not None: target["hero_button_text"] = button_text
        if button_link is not None: target["hero_button_link"] = button_link
        if button_style is not None: target["hero_button_style"] = button_style
        if show_button is not None: target["hero_show_button"] = show_button
        if image_url is not None: target["hero_image_url"] = image_url
        if video_url is not None: target["hero_video_url"] = video_url
        if alignment is not None: target["hero_alignment"] = alignment
        if horizontal_alignment is not None: target["hero_horizontal_alignment"] = horizontal_alignment
        if title_size is not None: target["hero_title_size"] = title_size
        if subtitle_size is not None: target["hero_subtitle_size"] = subtitle_size

        slides[idx] = target

        # Si modificamos la primera slide, sincronizar también los campos raíz para compatibilidad total
        update_data = schemas.SiteContentUpdate(hero_slides=slides)
        if idx == 0:
            if title is not None: update_data.hero_title = title
            if subtitle is not None: update_data.hero_subtitle = subtitle
            if price_amount is not None: update_data.hero_price_amount = price_amount
            if price_enabled is not None: update_data.hero_price_enabled = price_enabled
            if button_text is not None: update_data.hero_button_text = button_text
            if button_link is not None: update_data.hero_button_link = button_link

        update_site_content(db, update_data)
        return f"Éxito: Diapositiva {slide_index} actualizada correctamente."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en update_hero_slide: {e}")
        return f"Error al actualizar la diapositiva {slide_index}: {str(e)}"
    finally:
        db.close()


def delete_hero_slide(slide_index: int) -> str:
    """
    Elimina una diapositiva del Hero según su número de orden (1-indexed: 1, 2, 3...).
    No se permite eliminar la última diapositiva existente para evitar dejar la cabecera vacía.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        content = get_site_content(db)
        slides = _normalize_slides(content)

        if len(slides) <= 1:
            return "Aviso: No es posible eliminar la única diapositiva del Hero. Debe haber al menos una diapositiva activa."

        idx = slide_index - 1
        if idx < 0 or idx >= len(slides):
            return f"Error: La diapositiva {slide_index} no existe. Actualmente hay {len(slides)} diapositiva(s)."

        deleted = slides.pop(idx)
        update_site_content(db, schemas.SiteContentUpdate(hero_slides=slides))
        return f"Éxito: Diapositiva {slide_index} (\"{deleted.get('hero_title')}\") eliminada correctamente. Quedan {len(slides)} diapositiva(s)."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en delete_hero_slide: {e}")
        return f"Error al eliminar la diapositiva: {str(e)}"
    finally:
        db.close()


def update_hero_slider_settings(
    autoplay: Optional[bool] = None,
    interval: Optional[int] = None,
    effect: Optional[str] = None,
    show_arrows: Optional[bool] = None,
    show_dots: Optional[bool] = None
) -> str:
    """
    Configura el comportamiento global del carrusel de diapositivas del Hero.

    Args:
        autoplay: True para habilitar cambio automático de diapositivas, False para pausarlo.
        interval: Segundos que permanece cada diapositiva en pantalla (mínimo 3 segundos, ej: 5, 7).
        effect: Tipo de transición entre diapositivas ('fade' = desvanecimiento elegante, 'slide' = deslizamiento horizontal).
        show_arrows: True para mostrar flechas de navegación previa/siguiente, False para ocultarlas.
        show_dots: True para mostrar indicadores de puntos/paginación inferior, False para ocultarlos.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        update_payload = schemas.SiteContentUpdate(
            hero_slider_autoplay=autoplay,
            hero_slider_interval=interval,
            hero_slider_effect=effect,
            hero_slider_show_arrows=show_arrows,
            hero_slider_show_dots=show_dots
        )

        update_site_content(db, update_payload)
        return "Éxito: La configuración global del carrusel Hero ha sido actualizada correctamente."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en update_hero_slider_settings: {e}")
        return f"Error al actualizar la configuración del carrusel: {str(e)}"
    finally:
        db.close()


def update_landing_config(
    hero_title: Optional[str] = None,
    hero_subtitle: Optional[str] = None,
    hero_alignment: Optional[str] = None,
    hero_horizontal_alignment: Optional[str] = None,
    hero_content_fullwidth: Optional[bool] = None,
    hero_title_size: Optional[str] = None,
    hero_subtitle_size: Optional[str] = None,
    hero_title_max_width: Optional[int] = None,
    hero_price_enabled: Optional[bool] = None,
    hero_price_prefix: Optional[str] = None,
    hero_price_amount: Optional[str] = None,
    hero_price_suffix: Optional[str] = None,
    hero_price_period: Optional[str] = None,
    hero_price_size: Optional[str] = None,
    hero_price_offset_y: Optional[int] = None,
    hero_price_style: Optional[str] = None,
    hero_show_button: Optional[bool] = None,
    hero_button_text: Optional[str] = None,
    hero_button_link: Optional[str] = None,
    hero_button_style: Optional[str] = None,
    hero_slider_autoplay: Optional[bool] = None,
    hero_slider_interval: Optional[int] = None,
    hero_slider_effect: Optional[str] = None,
    about_title: Optional[str] = None,
    about_text: Optional[str] = None,
    cta_title: Optional[str] = None,
    cta_subtitle: Optional[str] = None
) -> str:
    """
    Actualiza la configuración general, estilos y textos de la landing page pública del inquilino.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        update_payload = schemas.SiteContentUpdate(
            hero_title=hero_title,
            hero_subtitle=hero_subtitle,
            hero_alignment=hero_alignment,
            hero_horizontal_alignment=hero_horizontal_alignment,
            hero_content_fullwidth=hero_content_fullwidth,
            hero_title_size=hero_title_size,
            hero_subtitle_size=hero_subtitle_size,
            hero_title_max_width=hero_title_max_width,
            hero_price_enabled=hero_price_enabled,
            hero_price_prefix=hero_price_prefix,
            hero_price_amount=hero_price_amount,
            hero_price_suffix=hero_price_suffix,
            hero_price_period=hero_price_period,
            hero_price_size=hero_price_size,
            hero_price_offset_y=hero_price_offset_y,
            hero_price_style=hero_price_style,
            hero_show_button=hero_show_button,
            hero_button_text=hero_button_text,
            hero_button_link=hero_button_link,
            hero_button_style=hero_button_style,
            hero_slider_autoplay=hero_slider_autoplay,
            hero_slider_interval=hero_slider_interval,
            hero_slider_effect=hero_slider_effect,
            about_title=about_title,
            about_text=about_text,
            cta_title=cta_title,
            cta_subtitle=cta_subtitle
        )

        update_site_content(db, update_payload)
        return "Éxito: La configuración de la landing page ha sido actualizada correctamente en la base de datos."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar landing page para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar la landing page: {str(e)}"
    finally:
        db.close()
