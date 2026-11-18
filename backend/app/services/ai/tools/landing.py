import logging
import uuid
import re
import unicodedata
from typing import Optional, List, Dict, Any
from sqlalchemy import func
from sqlalchemy.orm import attributes

from .... import models, schemas
from ....database import SessionLocal, current_tenant_var
from ....crud.site_content import get_site_content, update_site_content
from ....schemas.blocks_manifest import BLOCK_SCHEMAS, canonicalize_block_type, normalize_block_properties

logger = logging.getLogger("ai_agent_tools_landing")

VOICE_TAGS_REGEX = re.compile(r'\[(?:with enthusiasm|fast|fluent|short pause|slower|whispering|cheerful|calm|excited)[^\]]*\]', re.IGNORECASE)

def clean_clean_text(val: Optional[str]) -> Optional[str]:
    if not val:
        return val
    cleaned = VOICE_TAGS_REGEX.sub('', val)
    cleaned = re.sub(r'</p>\s*<p>', '\n\n', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'<[^>]+>', '', cleaned)
    return cleaned.strip()

def normalize_slug_str(s: str) -> str:
    norm = unicodedata.normalize('NFKD', s or '').encode('ASCII', 'ignore').decode('utf-8').lower()
    return re.sub(r'[^a-z0-9]+', '-', norm).strip('-')

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

        autoplay_val = content.hero_slider_autoplay if content.hero_slider_autoplay is not None else True
        autoplay = "Activado" if autoplay_val else "Pausado"
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
    about_image_url: Optional[str] = None,
    about_image: Optional[str] = None,
    cta_title: Optional[str] = None,
    cta_subtitle: Optional[str] = None,
    layout_style: Optional[str] = None,
    megamenu_layout: Optional[str] = None,
    megamenu_categories_json: Optional[List[str]] = None
) -> str:
    """
    Actualiza la configuración general, estilos y textos de la landing page pública del inquilino.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        # Limpieza estricta de HTML y corchetes de voz para evitar etiquetas <p> o [with enthusiasm]
        clean_about_text = clean_clean_text(about_text)
        clean_about_title = clean_clean_text(about_title)
        clean_hero_title = clean_clean_text(hero_title)
        clean_hero_subtitle = clean_clean_text(hero_subtitle)
        clean_cta_title = clean_clean_text(cta_title)
        clean_cta_subtitle = clean_clean_text(cta_subtitle)
        clean_hero_button_text = clean_clean_text(hero_button_text)
        resolved_about_image = (about_image_url or about_image or "").strip() or None
        if resolved_about_image:
            img_val_lower = resolved_about_image.lower()
            if any(k in img_val_lower for k in ["last", "ultima", "última", "reciente", "generada", "media"]):
                latest_media = db.query(models.Media).filter(
                    models.Media.tenant_id == tenant_id,
                    models.Media.file_type == 'image'
                ).order_by(models.Media.created_at.desc()).first()
                if latest_media and latest_media.url:
                    logger.info(f"Asignando última imagen de medios a 'Sobre Nosotros': {latest_media.url}")
                    resolved_about_image = latest_media.url
            elif resolved_about_image.startswith("http"):
                filename = resolved_about_image.split("/")[-1].split("?")[0]
                media_record = db.query(models.Media).filter(
                    models.Media.tenant_id == tenant_id,
                    models.Media.filename == filename
                ).first()
                if not media_record and filename.startswith("ai_"):
                    # Si el LLM alucinó un nombre UUID que no existe en la base de datos, recuperar la última imagen real
                    latest_media = db.query(models.Media).filter(
                        models.Media.tenant_id == tenant_id,
                        models.Media.file_type == 'image'
                    ).order_by(models.Media.created_at.desc()).first()
                    if latest_media and latest_media.url:
                        logger.info(f"Auto-corrección de imagen alucinada '{resolved_about_image}' a última imagen real '{latest_media.url}'")
                        resolved_about_image = latest_media.url

        raw_fields = {
            "hero_title": clean_hero_title,
            "hero_subtitle": clean_hero_subtitle,
            "hero_alignment": hero_alignment,
            "hero_horizontal_alignment": hero_horizontal_alignment,
            "hero_content_fullwidth": hero_content_fullwidth,
            "hero_title_size": hero_title_size,
            "hero_subtitle_size": hero_subtitle_size,
            "hero_title_max_width": hero_title_max_width,
            "hero_price_enabled": hero_price_enabled,
            "hero_price_prefix": hero_price_prefix,
            "hero_price_amount": hero_price_amount,
            "hero_price_suffix": hero_price_suffix,
            "hero_price_period": hero_price_period,
            "hero_price_size": hero_price_size,
            "hero_price_offset_y": hero_price_offset_y,
            "hero_price_style": hero_price_style,
            "hero_show_button": hero_show_button,
            "hero_button_text": clean_hero_button_text,
            "hero_button_link": hero_button_link,
            "hero_button_style": hero_button_style,
            "hero_slider_autoplay": hero_slider_autoplay,
            "hero_slider_interval": hero_slider_interval,
            "hero_slider_effect": hero_slider_effect,
            "about_title": clean_about_title,
            "about_text": clean_about_text,
            "about_image_url": resolved_about_image,
            "cta_title": clean_cta_title,
            "cta_subtitle": clean_cta_subtitle,
            "layout_style": layout_style,
            "megamenu_layout": megamenu_layout,
            "megamenu_categories_json": megamenu_categories_json
        }

        # Filtrar estrictamente solo los campos que fueron provistos (distintos de None)
        # Esto previene que actualizar el título sobrescriba el texto existente con None
        provided_fields = {k: v for k, v in raw_fields.items() if v is not None}
        if not provided_fields:
            return "Aviso: No se proporcionó ningún campo para actualizar en la landing page."

        update_payload = schemas.SiteContentUpdate(**provided_fields)

        update_site_content(db, update_payload)
        return "Éxito: La configuración de la landing page ha sido actualizada correctamente en la base de datos."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al actualizar landing page para tenant {current_tenant_var.get()}: {e}")
        return f"Error al actualizar la landing page: {str(e)}"
    finally:
        db.close()


def set_storefront_layout(
    layout_style: Optional[str] = None,
    megamenu_layout: Optional[str] = None
) -> str:
    """
    Configura y cambia en vivo el estilo visual del escaparate público de la clínica:
    - layout_style: 'cards_slider' (Carrusel cinemático horizontal) o 'bento_grid' (Bento Grid asimétrico modular moderno).
    - megamenu_layout: 'bento' (Mosaico con imágenes), 'columns' (Columnas limpias) o 'minimal' (Listado sutil).
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        valid_layouts = ["cards_slider", "bento_grid"]
        valid_megas = ["bento", "columns", "minimal"]

        resolved_layout = layout_style.lower().strip() if layout_style else None
        if resolved_layout and resolved_layout not in valid_layouts:
            if "bento" in resolved_layout:
                resolved_layout = "bento_grid"
            elif any(k in resolved_layout for k in ["carrusel", "slider", "slide", "cards"]):
                resolved_layout = "cards_slider"
            else:
                resolved_layout = "cards_slider"

        resolved_mega = megamenu_layout.lower().strip() if megamenu_layout else None
        if resolved_mega and resolved_mega not in valid_megas:
            resolved_mega = "bento" if "bento" in resolved_mega else "columns"

        update_payload = schemas.SiteContentUpdate(
            layout_style=resolved_layout,
            megamenu_layout=resolved_mega
        )
        update_site_content(db, update_payload)

        details = []
        if resolved_layout:
            details.append(f"Layout de portada establecido en '{resolved_layout}'")
        if resolved_mega:
            details.append(f"Megamenú establecido en '{resolved_mega}'")

        return f"Éxito: {' y '.join(details)}. El escaparate público se actualizará en vivo."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al cambiar layout del escaparate: {e}")
        return f"Error al configurar layout: {str(e)}"
    finally:
        db.close()


def create_custom_page_and_nav_link(
    title: str,
    slug: Optional[str] = None,
    show_in_navbar: bool = True,
    content_html: Optional[str] = None,
    seo_title: Optional[str] = None,
    seo_description: Optional[str] = None
) -> str:
    """
    Crea una nueva página web autónoma personalizada en el sitio público del inquilino (/slug)
    y opcionalmente la vincula de forma automática en la barra de navegación superior (Navbar).
    Permite redactar el contenido inicial en HTML semántico premium e inyectar metadatos SEO.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        clean_slug = (slug or title).lower().strip()
        clean_slug = re.sub(r'[^a-z0-9]+', '-', clean_slug).strip('-')
        if not clean_slug:
            clean_slug = f"pagina-{uuid.uuid4().hex[:6]}"

        # 1. Comprobar si ya existe en SiteNavigation
        existing_nav = db.query(models.SiteNavigation).filter(
            models.SiteNavigation.tenant_id == tenant_id,
            models.SiteNavigation.path == f"/{clean_slug}"
        ).first()

        if existing_nav:
            return f"Aviso: Ya existe una página o enlace en el menú con la ruta '/{clean_slug}'. Puedes pedirme editarla o usar otro nombre o slug."

        # 2. Calcular siguiente order_index
        max_order = db.query(func.max(models.SiteNavigation.order_index)).filter(
            models.SiteNavigation.tenant_id == tenant_id
        ).scalar() or 0

        # 3. Crear entrada en SiteNavigation
        nav_item = models.SiteNavigation(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            label=title.strip(),
            path=f"/{clean_slug}",
            order_index=max_order + 1,
            is_visible=bool(show_in_navbar),
            is_custom=True
        )
        db.add(nav_item)

        # 4. Crear estructura editorial completa de bloque (section) en SiteBlock
        initial_html = content_html or (
            f"<p class='text-lg font-serif italic text-stone-700 text-center mb-6'>Bienvenido al espacio exclusivo de <strong>{title.strip()}</strong>.</p>"
            f"<p class='mb-4 leading-relaxed'>Hemos concebido este espacio para ofrecerte una experiencia distinguida, donde la serenidad, la privacidad y la más alta dedicación técnica se fusionan para responder a tus más altas expectativas.</p>"
            f"<p class='leading-relaxed'>Ponemos a tu entera disposición nuestro conocimiento, nuestras instalaciones de vanguardia y un protocolo de atención totalmente adaptado a tu estilo de vida.</p>"
        )

        section_id = f"sec-{uuid.uuid4().hex[:8]}"
        col_id = f"col-{uuid.uuid4().hex[:8]}"

        block = models.SiteBlock(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            page_slug=clean_slug,
            block_type="section",
            order_index=0,
            content_data={
                "id": section_id,
                "columns_count": 1,
                "py_spacing": "py-20",
                "bg_color": "white",
                "vertical_alignment": "items-start",
                "columns": [
                    {
                        "id": col_id,
                        "width": "w-full",
                        "blocks": [
                            {
                                "id": f"title-{uuid.uuid4().hex[:6]}",
                                "block_type": "atomic_title",
                                "content_data": {
                                    "title": title.strip(),
                                    "title_tag": "h1",
                                    "alignment": "center",
                                    "show_divider": True,
                                    "subtitle": seo_description or "Excelencia, serenidad y exclusividad en cada detalle."
                                }
                            },
                            {
                                "id": f"text-{uuid.uuid4().hex[:6]}",
                                "block_type": "atomic_text",
                                "content_data": {
                                    "html": initial_html,
                                    "alignment": "left"
                                }
                            },
                            {
                                "id": f"btn-{uuid.uuid4().hex[:6]}",
                                "block_type": "atomic_button",
                                "content_data": {
                                    "text": "Reservar Experiencia",
                                    "url": "/reservar",
                                    "style": "gold_solid",
                                    "alignment": "center"
                                }
                            }
                        ]
                    }
                ]
            }
        )
        db.add(block)
        db.commit()

        menu_status = "y se ha vinculado a la barra de menú superior (Navbar)" if show_in_navbar else "y queda como página independiente (sin enlace en el menú)"
        return f"Éxito: Se ha creado y maquetado con éxito la página '/{clean_slug}' con título '{title.strip()}' {menu_status}. La vista previa se cargará automáticamente en /{clean_slug}."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al crear página y enlace de navegación: {e}")
        return f"Error al crear la página personalizada: {str(e)}"
    finally:
        db.close()


def update_featured_categories(
    category_slugs: List[str]
) -> str:
    """
    Configura qué categorías de tratamientos se destacan en la portada y en el megamenú del escaparate público.
    Recibe una lista de slugs o nombres de categorías registradas en el catálogo.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        if not category_slugs:
            return "Aviso: Debes indicar al menos una categoría para destacar."

        # Resolver categorías existentes del tenant
        all_cats = db.query(models.ServiceCategory).filter(
            models.ServiceCategory.tenant_id == tenant_id
        ).all()

        matched_slugs = []
        for input_cat in category_slugs:
            clean = input_cat.strip().lower()
            for c in all_cats:
                if c.slug.lower() == clean or c.name.lower() == clean or clean in c.name.lower():
                    if c.slug not in matched_slugs:
                        matched_slugs.append(c.slug)
                    break

        if not matched_slugs:
            matched_slugs = [s.strip().lower() for s in category_slugs]

        update_payload = schemas.SiteContentUpdate(
            megamenu_categories_json=matched_slugs
        )
        update_site_content(db, update_payload)

        return f"Éxito: Se han configurado {len(matched_slugs)} categorías destacadas ({', '.join(matched_slugs)}) para la portada y megamenú."
    except Exception as e:
        db.rollback()
        logger.error(f"Error al configurar categorías destacadas: {e}")
        return f"Error al actualizar categorías destacadas: {str(e)}"
    finally:
        db.close()


def get_page_blocks(page_slug: str) -> str:
    """
    Obtiene la lista de secciones y bloques de contenido maquetados en una página personalizada (o en la portada 'home').
    Permite al Asistente saber qué contenido existe ya en la página antes de añadir nuevos bloques.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        clean_slug = (page_slug or "home").lower().strip().lstrip("/")
        blocks = db.query(models.SiteBlock).filter(
            models.SiteBlock.tenant_id == tenant_id,
            models.SiteBlock.page_slug == clean_slug
        ).order_by(models.SiteBlock.order_index.asc()).all()

        if not blocks:
            return f"La página '{clean_slug}' no tiene bloques creados actualmente."

        lines = [f"Bloques existentes en la página '{clean_slug}':"]
        for idx, b in enumerate(blocks):
            b_type = b.block_type
            data = b.content_data or {}
            if b_type == 'section':
                cols = data.get('columns', [])
                col_blocks = []
                for col in cols:
                    for ab in col.get('blocks', []):
                        col_blocks.append(f"{ab.get('block_type')}: '{ab.get('content_data', {}).get('title') or ab.get('content_data', {}).get('heading') or ab.get('id')}'")
                lines.append(f"- Sección {idx + 1} ({len(cols)} columnas): {', '.join(col_blocks) if col_blocks else 'Vacía'}")
            else:
                lines.append(f"- Bloque {idx + 1}: {b_type} (Título: '{data.get('title') or data.get('heading') or 'Sin título'}')")

        return "\n".join(lines)
    except Exception as e:
        logger.error(f"Error en get_page_blocks: {e}")
        return f"Error al consultar bloques de la página: {str(e)}"
    finally:
        db.close()


def add_block_to_page(
    page_slug: str,
    block_type: str,
    title: Optional[str] = None,
    text_content: Optional[str] = None,
    image_url: Optional[str] = None,
    button_text: Optional[str] = None,
    button_url: Optional[str] = None,
    layout: Optional[str] = "cards_slider",
    properties: Optional[Dict[str, Any]] = None,
    section_id: Optional[str] = None,
    column_index: Optional[int] = None
) -> str:
    """
    Inserta un nuevo bloque modular en una página personalizada o en la portada del escaparate.
    Basado en el Manifiesto Canónico de Bloques (SSOT).
    
    Tipos de bloques disponibles:
    - 'hero': Diapositiva o banner completo con título, subtítulo e imagen de fondo con CTA.
    - 'title_heading': Título elegante en serif con divisor dorado de acento.
    - 'atomic_text': Párrafo de redacción editorial rica en formato HTML estilizado.
    - 'atomic_image': Multimedia de alta gama con marco y sombra de lujo.
    - 'text_image_cta': Distribución en dos columnas con imagen a un lado y texto con botón al otro.
    - 'atomic_category': Módulo interactivo de tratamientos en formato carrusel ('cards_slider') o bento grid ('bento_grid').
    - 'atomic_button': Botón de llamada a la acción (CTA) hacia /reservar o catálogo.

    Args:
        page_slug: Slug de la página (ej: 'instalaciones', 'filosofia-y-espacio', o 'home').
        block_type: Tipo de bloque ('hero', 'title_heading', 'atomic_text', 'atomic_image', 'text_image_cta', 'atomic_category', 'atomic_button').
        title: Título principal o encabezado del bloque.
        text_content: Texto descriptivo, párrafo o redacción del bloque.
        image_url: URL de la imagen o fotografía comercial.
        button_text: Texto del botón de acción (ej: 'Reservar Tratamiento', 'Ver Servicios').
        button_url: Enlace del botón (ej: '/reservar', '/tratamientos').
        layout: Disposición ('cards_slider' para carrusel desplazable, 'bento_grid' para mosaico modular 2026, 'traditional_grid' para cuadrícula, 'minimalist_list' para lista).
        properties: Diccionario opcional con propiedades canónicas adicionales.
        section_id: ID opcional de la sección a la que añadir el bloque. Si se omite y se indica column_index, se utiliza la última sección.
        column_index: Índice de columna (0, 1, 2, 3) dentro de la sección donde insertar el bloque.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        clean_slug = (page_slug or "home").lower().strip().lstrip("/")

        # Normalizar tipo de bloque canónico
        b_type = canonicalize_block_type(block_type)

        cat_id = ""
        if b_type == "atomic_category":
            first_cat = db.query(models.ServiceCategory).filter(
                models.ServiceCategory.tenant_id == tenant_id
            ).first()
            if first_cat:
                cat_id = first_cat.id

        # Fallback de imagen real de la clínica si no se especifica una
        resolved_img = image_url or ""
        if not resolved_img and b_type in ["atomic_image", "text_image_cta", "hero"]:
            media_item = db.query(models.MediaItem).filter(
                models.MediaItem.tenant_id == tenant_id,
                models.MediaItem.media_type == "image"
            ).first()
            if media_item and media_item.url:
                resolved_img = media_item.url
            else:
                site_content = db.query(models.SiteContent).filter(
                    models.SiteContent.tenant_id == tenant_id
                ).first()
                if site_content:
                    resolved_img = site_content.about_image_url or site_content.hero_image_url or ""

        block_id = f"atomic-{uuid.uuid4().hex[:6]}"
        content_data = {}

        if b_type == "hero":
            content_data = {
                "image_url": resolved_img,
                "heading": title or "Experiencia Exclusiva",
                "subheading": text_content or "Tratamientos de alta gama adaptados a ti.",
                "cta_text": button_text or "Reservar Cita",
                "cta_url": button_url or "/reservar"
            }
        elif b_type == "title_heading":
            content_data = {
                "title": title or "Título de Prestigio",
                "title_tag": "h2",
                "alignment": "center",
                "show_divider": True,
                "subtitle": text_content or ""
            }
        elif b_type == "atomic_text":
            formatted_html = text_content or "<p>Redacción editorial personalizada.</p>"
            if not formatted_html.strip().startswith("<"):
                formatted_html = f"<p class='leading-relaxed'>{formatted_html}</p>"
            content_data = {
                "html": formatted_html,
                "alignment": "left"
            }
        elif b_type == "atomic_image":
            content_data = {
                "image_url": resolved_img,
                "caption": title or "",
                "alignment": "center",
                "max_width": "100%",
                "height_preset": "auto",
                "object_fit": "cover"
            }
        elif b_type == "text_image_cta":
            content_data = {
                "heading": title or "Nuestra Esencia",
                "subheading": text_content or "Un entorno diseñado para revitalizar cuerpo y mente.",
                "image_url": resolved_img,
                "alignment": "left",
                "cta_text": button_text or "Descubrir Más",
                "cta_url": button_url or "/reservar",
                "height_preset": "medium",
                "object_fit": "cover"
            }
        elif b_type == "atomic_category":
            raw_layout = (layout or "cards_slider").lower().strip()
            layout_mapped = "cards_slider" if raw_layout in ["slider", "cards_slider", "carrusel"] else ("bento_grid" if raw_layout in ["bento", "bento_grid", "mosaico"] else ("minimalist_list" if raw_layout in ["list", "minimalist_list", "lista"] else "traditional_grid"))
            content_data = {
                "category_id": cat_id,
                "selected_treatment_ids": [],
                "layout": layout_mapped,
                "max_items": 6,
                "link_text": "Ver tratamiento"
            }
        elif b_type == "atomic_button":
            content_data = {
                "text": button_text or title or "Reservar Cita",
                "url": button_url or "/reservar",
                "style": "gold_solid",
                "alignment": "center"
            }
        else:
            b_type = "atomic_text"
            content_data = {"html": f"<p>{text_content or title or ''}</p>", "alignment": "left"}

        # Fusionar propiedades canónicas adicionales si se proporcionaron
        if properties and isinstance(properties, dict):
            extra_norm = normalize_block_properties(b_type, properties)
            content_data.update(extra_norm)

        # Buscar sección objetivo si se especificó section_id o column_index
        target_section = None
        if section_id:
            sec_blocks = db.query(models.SiteBlock).filter(
                models.SiteBlock.tenant_id == tenant_id,
                models.SiteBlock.page_slug == clean_slug,
                models.SiteBlock.block_type == "section"
            ).all()
            for b in sec_blocks:
                b_data = b.content_data or {}
                if b.id == section_id or b_data.get("id") == section_id:
                    target_section = b
                    break
        elif column_index is not None:
            target_section = db.query(models.SiteBlock).filter(
                models.SiteBlock.tenant_id == tenant_id,
                models.SiteBlock.page_slug == clean_slug,
                models.SiteBlock.block_type == "section"
            ).order_by(models.SiteBlock.order_index.desc()).first()

        if target_section:
            sec_data = dict(target_section.content_data or {})
            cols = list(sec_data.get("columns", []))
            if not cols:
                cols = [{"id": f"col-{target_section.id[:8]}-0", "width": "w-full", "blocks": []}]

            c_idx = column_index if column_index is not None else 0
            if c_idx < 0:
                c_idx = 0
            if c_idx >= len(cols):
                # Expandir columnas si el índice supera la cantidad actual
                new_count = c_idx + 1
                col_w = "w-1/2" if new_count == 2 else ("w-1/3" if new_count == 3 else ("w-1/4" if new_count >= 4 else "w-full"))
                for i in range(len(cols), new_count):
                    cols.append({"id": f"col-{target_section.id[:8]}-{i}", "width": col_w, "blocks": []})
                for c_item in cols:
                    c_item["width"] = col_w
                sec_data["columns_count"] = min(4, new_count)

            target_col = dict(cols[c_idx])
            col_blocks = list(target_col.get("blocks", []))
            col_blocks.append({
                "id": block_id,
                "block_type": b_type,
                "content_data": content_data
            })
            target_col["blocks"] = col_blocks
            cols[c_idx] = target_col
            sec_data["columns"] = cols
            target_section.content_data = sec_data
            attributes.flag_modified(target_section, "content_data")
            db.commit()

            sec_display_id = sec_data.get("id") or target_section.id
            return f"Éxito: Se ha añadido el bloque '{b_type}' en la columna {c_idx + 1} de la sección (ID: '{sec_display_id}') en la página '/{clean_slug}'. La vista previa interactiva se ha actualizado."

        # Si no había sección objetivo, crear una nueva sección con 1 columna
        max_order = db.query(func.max(models.SiteBlock.order_index)).filter(
            models.SiteBlock.tenant_id == tenant_id,
            models.SiteBlock.page_slug == clean_slug
        ).scalar() or 0

        new_sec_id = f"sec-{uuid.uuid4().hex[:8]}"
        col_id = f"col-{uuid.uuid4().hex[:8]}"

        new_section_block = models.SiteBlock(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            page_slug=clean_slug,
            block_type="section",
            order_index=max_order + 1,
            content_data={
                "id": new_sec_id,
                "columns_count": 1,
                "py_spacing": "py-12",
                "bg_color": "white",
                "vertical_alignment": "items-start",
                "columns": [
                    {
                        "id": col_id,
                        "width": "w-full",
                        "blocks": [
                            {
                                "id": block_id,
                                "block_type": b_type,
                                "content_data": content_data
                            }
                        ]
                    }
                ]
            }
        )
        db.add(new_section_block)
        db.commit()

        return f"Éxito: Se ha añadido el bloque '{b_type}' en una nueva sección (ID: '{new_sec_id}') de la página '/{clean_slug}'. La vista previa interactiva se ha actualizado."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en add_block_to_page: {e}")
        return f"Error al añadir bloque a la página: {str(e)}"
    finally:
        db.close()


def add_section_to_page(
    page_slug: str,
    columns_count: int = 1,
    bg_color: str = "white",
    content_width: str = "boxed",
    horizontal_alignment: str = "justify-center",
    py_spacing: str = "py-16"
) -> str:
    """
    Añade una nueva sección estructural a una página con 1, 2, 3 o 4 columnas.
    Permite configurar:
    - columns_count: 1, 2, 3 o 4
    - bg_color: "white" | "cream" | "dark" | "soft_gold" o hex
    - content_width: "boxed" (cuadrícula central max-w-7xl) | "fullwidth" (ancho completo w-full)
    - horizontal_alignment: "justify-start" | "justify-center" | "justify-end" | "justify-between"
    - py_spacing: "py-12" | "py-16" | "py-24"
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        clean_slug = (page_slug or "home").lower().strip().lstrip("/")
        c_count = max(1, min(4, int(columns_count)))
        col_width = "w-1/2" if c_count == 2 else ("w-1/3" if c_count == 3 else ("w-1/4" if c_count == 4 else "w-full"))

        columns = []
        for i in range(c_count):
            columns.append({
                "id": f"col-{uuid.uuid4().hex[:6]}-{i}",
                "width": col_width,
                "blocks": []
            })

        max_order = db.query(func.max(models.SiteBlock.order_index)).filter(
            models.SiteBlock.tenant_id == tenant_id,
            models.SiteBlock.page_slug == clean_slug
        ).scalar() or 0

        section_id = f"sec-{uuid.uuid4().hex[:8]}"
        new_section = models.SiteBlock(
            id=str(uuid.uuid4()),
            tenant_id=tenant_id,
            page_slug=clean_slug,
            block_type="section",
            order_index=max_order + 1,
            content_data={
                "id": section_id,
                "columns_count": c_count,
                "py_spacing": py_spacing or "py-16",
                "bg_color": bg_color or "white",
                "content_width": content_width or "boxed",
                "horizontal_alignment": horizontal_alignment or "justify-center",
                "vertical_alignment": "items-start",
                "columns": columns
            }
        )
        db.add(new_section)
        db.commit()

        return f"Éxito: Se ha creado una nueva sección con {c_count} columna(s) (ID: '{section_id}', {content_width}, fondo {bg_color}) en la página '/{clean_slug}'. Ahora puedes añadir bloques a cada una de sus columnas usando add_block_to_page con section_id='{section_id}' y column_index=0 o 1."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en add_section_to_page: {e}")
        return f"Error al crear sección: {str(e)}"
    finally:
        db.close()


def set_section_columns(
    page_slug: str,
    columns_count: int,
    section_id: Optional[str] = None
) -> str:
    """
    Divide o reconfigura el número de columnas (1, 2, 3 o 4) de una sección estructural existente en una página.
    Preserva intactos todos los bloques ya existentes en las columnas. Si se amplían columnas, crea nuevas columnas listas para recibir bloques. Si se reducen, unifica los bloques en la primera columna sin perder nada.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        clean_slug = (page_slug or "home").lower().strip().lstrip("/")
        c_count = max(1, min(4, int(columns_count)))

        query = db.query(models.SiteBlock).filter(
            models.SiteBlock.tenant_id == tenant_id,
            models.SiteBlock.page_slug == clean_slug,
            models.SiteBlock.block_type == "section"
        )

        target_block = None
        if section_id:
            all_sec = query.all()
            for b in all_sec:
                b_data = b.content_data or {}
                if b.id == section_id or b_data.get("id") == section_id:
                    target_block = b
                    break
        
        if not target_block:
            target_block = query.order_by(models.SiteBlock.order_index.desc()).first()

        if not target_block:
            return f"Aviso: No se encontró ninguna sección en la página '/{clean_slug}' para dividir en columnas. Puedes crear una nueva sección con add_section_to_page."

        sec_data = dict(target_block.content_data or {})
        current_cols = list(sec_data.get("columns", []))
        col_width = "w-1/2" if c_count == 2 else ("w-1/3" if c_count == 3 else ("w-1/4" if c_count == 4 else "w-full"))

        new_cols = []
        for i in range(c_count):
            if i < len(current_cols):
                col_item = dict(current_cols[i])
                col_item["width"] = col_width
                new_cols.append(col_item)
            else:
                new_cols.append({
                    "id": f"col-{target_block.id[:8]}-{i}-{uuid.uuid4().hex[:4]}",
                    "width": col_width,
                    "blocks": []
                })

        # Si reducimos columnas, rescatamos bloques de las columnas eliminadas a la primera columna
        if len(current_cols) > c_count:
            orphaned = []
            for col_removed in current_cols[c_count:]:
                orphaned.extend(col_removed.get("blocks", []))
            if orphaned and len(new_cols) > 0:
                first_blocks = list(new_cols[0].get("blocks", []))
                first_blocks.extend(orphaned)
                new_cols[0]["blocks"] = first_blocks

        sec_data["columns_count"] = c_count
        sec_data["columns"] = new_cols
        target_block.content_data = sec_data
        attributes.flag_modified(target_block, "content_data")
        db.commit()

        actual_id = sec_data.get("id") or target_block.id
        return f"Éxito: La sección (ID: '{actual_id}') en la página '/{clean_slug}' ha sido dividida en {c_count} columna(s). Ahora puedes colocar contenidos en cualquiera de sus columnas usando add_block_to_page(section_id='{actual_id}', column_index=0 o 1)."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en set_section_columns: {e}")
        return f"Error al reconfigurar columnas de la sección: {str(e)}"
    finally:
        db.close()


def update_page_details(
    page_slug: str,
    new_title: Optional[str] = None,
    new_subtitle: Optional[str] = None,
    show_in_navbar: Optional[bool] = None
) -> str:
    """
    Actualiza el título, subtítulo o visibilidad en el menú de una página autónoma personalizada (/slug).
    Modifica tanto la etiqueta de navegación en la Navbar como los bloques de encabezado/título de la página.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        clean_slug = (page_slug or "").lower().strip().lstrip("/")
        if not clean_slug or clean_slug == "home":
            return "Aviso: Para modificar la portada principal, utiliza la herramienta 'update_landing_config'."

        target_norm = normalize_slug_str(clean_slug)

        # 1. Buscar en SiteNavigation (tolerante a acentos y diferencias de guiones)
        nav_items = db.query(models.SiteNavigation).filter(
            models.SiteNavigation.tenant_id == tenant_id
        ).all()

        nav_item = None
        for item in nav_items:
            item_slug = normalize_slug_str(item.path.lstrip("/"))
            if item_slug == target_norm or item_slug.replace('-', '') == target_norm.replace('-', ''):
                nav_item = item
                clean_slug = item.path.lstrip("/")
                break

        clean_new_title = clean_clean_text(new_title)
        clean_new_subtitle = clean_clean_text(new_subtitle)

        # Prevenir frases afirmativas genéricas como títulos de página
        if clean_new_title and clean_new_title.lower().strip() in ["si", "sí", "adelante", "aplica los cambios", "aplica", "ok", "confirmar", "confirmo", "cambiar título"]:
            return "Aviso: Por favor especifica el nombre o título que deseas poner en la página."

        if not any([clean_new_title, clean_new_subtitle, show_in_navbar is not None]):
            return "Aviso: No se proporcionó ningún título, subtítulo o visibilidad para actualizar."

        updated_parts = []
        if nav_item:
            if clean_new_title:
                nav_item.label = clean_new_title
                updated_parts.append(f"título a '{clean_new_title}'")
            if show_in_navbar is not None:
                nav_item.is_visible = bool(show_in_navbar)
                updated_parts.append(f"visibilidad a {'visible' if show_in_navbar else 'oculto'}")

        # 2. Buscar y actualizar el bloque de título de la página
        all_blocks = db.query(models.SiteBlock).filter(
            models.SiteBlock.tenant_id == tenant_id
        ).all()
        blocks = [
            b for b in all_blocks 
            if b.page_slug == clean_slug or normalize_slug_str(b.page_slug) == target_norm
        ]

        heading_updated = False
        for b in blocks:
            data = b.content_data or {}
            if b.block_type == "section":
                cols = data.get("columns", [])
                for col in cols:
                    for ab in col.get("blocks", []):
                        ab_type = ab.get("block_type")
                        if ab_type in ["title_heading", "atomic_title", "hero"]:
                            cdata = ab.get("content_data", {})
                            if clean_new_title:
                                cdata["title"] = clean_new_title
                                cdata["heading"] = clean_new_title
                            if clean_new_subtitle is not None:
                                cdata["subtitle"] = clean_new_subtitle
                                cdata["subheading"] = clean_new_subtitle
                            ab["content_data"] = cdata
                            heading_updated = True
                if heading_updated:
                    attributes.flag_modified(b, "content_data")
            elif b.block_type in ["title_heading", "atomic_title", "hero"]:
                if clean_new_title:
                    data["title"] = clean_new_title
                    data["heading"] = clean_new_title
                if clean_new_subtitle is not None:
                    data["subtitle"] = clean_new_subtitle
                    data["subheading"] = clean_new_subtitle
                b.content_data = data
                attributes.flag_modified(b, "content_data")
                heading_updated = True

        db.commit()
        if not nav_item and not heading_updated:
            return f"Aviso: No se encontró la página '/{clean_slug}'. Asegúrate de indicar el slug correcto."

        return f"Éxito: Se ha actualizado la página '/{clean_slug}' con los nuevos datos."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en update_page_details: {e}")
        return f"Error al actualizar página: {str(e)}"
    finally:
        db.close()


def delete_custom_page(page_slug: str) -> str:
    """
    Elimina permanentemente una página web autónoma (/slug) y su enlace del menú superior (Navbar).
    Elimina todos los bloques maquetados asociados a la página.
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        clean_slug = (page_slug or "").lower().strip().lstrip("/")
        if not clean_slug or clean_slug == "home":
            return "Error: La portada principal ('home') no puede ser eliminada."

        # 1. Eliminar bloques asociados
        blocks = db.query(models.SiteBlock).filter(
            models.SiteBlock.tenant_id == tenant_id,
            models.SiteBlock.page_slug == clean_slug
        ).all()
        for b in blocks:
            db.delete(b)

        # 2. Eliminar entrada en SiteNavigation
        nav_item = db.query(models.SiteNavigation).filter(
            models.SiteNavigation.tenant_id == tenant_id,
            models.SiteNavigation.path == f"/{clean_slug}"
        ).first()
        page_title = nav_item.label if nav_item else clean_slug
        if nav_item:
            db.delete(nav_item)

        db.commit()
        return f"Éxito: La página '{page_title}' (/{clean_slug}) ha sido eliminada permanentemente del sitio y del menú."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en delete_custom_page: {e}")
        return f"Error al eliminar la página: {str(e)}"
    finally:
        db.close()


def update_page_block_properties(
    page_slug: str,
    block_type: str,
    properties: Dict[str, Any],
    block_id: Optional[str] = None
) -> str:
    """
    Actualiza de forma universal cualquier propiedad configurable de un bloque modular
    en una página personalizada o en la portada, basándose en el Manifiesto Canónico (SSOT).

    Permite modificar propiedades como:
    - layout: "traditional_grid" | "bento_grid" | "cards_slider" | "minimalist_list"
    - max_items: 2, 3, 4, 6, 8
    - heading / title: Texto del encabezado
    - subheading / subtitle: Texto complementario
    - html / text: Redacción enriquecida
    - image_url: Fotografía o vídeo
    - caption: Pie de foto
    - alignment: "left" | "center" | "right" | "justify" | "full_width"
    - height_preset: "auto" | "small" | "medium" | "large" | "screen"
    - object_fit: "cover" | "contain"
    - cta_text / cta_url: Texto y enlace de botón de acción
    - show_divider: True | False
    - category_id: ID de categoría para catálogos
    - style: "gold_solid" | "gold_outline" | "dark_solid"
    """
    db = SessionLocal()
    try:
        tenant_id = current_tenant_var.get()
        if not tenant_id:
            return "Error: No se ha podido resolver el identificador del inquilino (tenant_id)."

        clean_slug = (page_slug or "home").lower().strip().lstrip("/")
        target_norm = normalize_slug_str(clean_slug)
        canon_type = canonicalize_block_type(block_type)

        all_blocks = db.query(models.SiteBlock).filter(
            models.SiteBlock.tenant_id == tenant_id
        ).all()

        blocks = [
            b for b in all_blocks 
            if b.page_slug == clean_slug or normalize_slug_str(b.page_slug) == target_norm
        ]

        # Normalizar propiedades usando el Manifiesto SSOT
        normalized_props = normalize_block_properties(canon_type, properties or {})

        # Limpiar texto de voice tags y validar títulos genéricos
        for k, v in list(normalized_props.items()):
            if isinstance(v, str):
                cleaned_val = clean_clean_text(v)
                normalized_props[k] = cleaned_val
                if k in ["title", "heading"] and cleaned_val and cleaned_val.lower().strip() in [
                    "si", "sí", "adelante", "aplica los cambios", "aplica", "ok", "confirmar", "confirmo", "cambiar título"
                ]:
                    return "Aviso: Por favor especifica el nombre o título que deseas poner en el bloque."

        if not normalized_props:
            return "Aviso: No se proporcionó ninguna propiedad válida para actualizar en el bloque."

        def matches_block(b_obj_type: str, b_obj_id: Optional[str]) -> bool:
            if block_id and b_obj_id:
                return b_obj_id == block_id
            return canonicalize_block_type(b_obj_type) == canon_type

        updated = False
        for b in blocks:
            data = b.content_data or {}
            if canon_type == "section" and b.block_type == "section":
                if not block_id or block_id in [b.id, data.get("id")]:
                    if "columns_count" in normalized_props:
                        new_c_count = max(1, min(4, int(normalized_props["columns_count"])))
                        current_cols = list(data.get("columns", []))
                        col_w = "w-1/2" if new_c_count == 2 else ("w-1/3" if new_c_count == 3 else ("w-1/4" if new_c_count == 4 else "w-full"))
                        new_cols_arr = []
                        for i in range(new_c_count):
                            if i < len(current_cols):
                                c_item = dict(current_cols[i])
                                c_item["width"] = col_w
                                new_cols_arr.append(c_item)
                            else:
                                new_cols_arr.append({
                                    "id": f"col-{b.id[:8]}-{i}-{uuid.uuid4().hex[:4]}",
                                    "width": col_w,
                                    "blocks": []
                                })
                        if len(current_cols) > new_c_count:
                            orphaned = []
                            for c_rem in current_cols[new_c_count:]:
                                orphaned.extend(c_rem.get("blocks", []))
                            if orphaned and len(new_cols_arr) > 0:
                                first_b = list(new_cols_arr[0].get("blocks", []))
                                first_b.extend(orphaned)
                                new_cols_arr[0]["blocks"] = first_b
                        data["columns"] = new_cols_arr
                        normalized_props["columns_count"] = new_c_count

                    data.update(normalized_props)
                    b.content_data = data
                    attributes.flag_modified(b, "content_data")
                    updated = True
                    break
            elif b.block_type == "section":
                cols = data.get("columns", [])
                for col in cols:
                    for ab in col.get("blocks", []):
                        ab_t = ab.get("block_type", "")
                        ab_id = ab.get("id")
                        if matches_block(ab_t, ab_id):
                            cdata = ab.get("content_data", {})
                            cdata.update(normalized_props)
                            ab["content_data"] = cdata
                            updated = True
                if updated:
                    attributes.flag_modified(b, "content_data")
                    break
            elif matches_block(b.block_type, getattr(b, "id", None)):
                data.update(normalized_props)
                b.content_data = data
                attributes.flag_modified(b, "content_data")
                updated = True
                break

        if not updated:
            if clean_slug in ["contacto", "contact"] or canon_type == "contact_header":
                new_block = models.SiteBlock(
                    tenant_id=tenant_id,
                    page_slug="contacto",
                    block_type="contact_header",
                    order_index=0,
                    content_data=normalized_props
                )
                db.add(new_block)
                db.commit()
                return f"Éxito: Encabezado de la página de contacto actualizado correctamente."
            return f"Aviso: No se encontró ningún bloque del tipo '{canon_type}' en la página '{clean_slug}'."

        db.commit()
        updated_keys = ", ".join(normalized_props.keys())
        return f"Éxito: Propiedades [{updated_keys}] del bloque '{canon_type}' actualizadas correctamente en la página '{clean_slug}'."
    except Exception as e:
        db.rollback()
        logger.error(f"Error en update_page_block_properties: {e}")
        return f"Error al actualizar bloque: {str(e)}"
    finally:
        db.close()


def update_page_block(
    page_slug: str,
    block_type: str,
    new_text: Optional[str] = None,
    new_title: Optional[str] = None,
    new_subtitle: Optional[str] = None,
    new_image_url: Optional[str] = None,
    new_category_id: Optional[str] = None,
    layout: Optional[str] = None,
    max_items: Optional[int] = None,
    cta_text: Optional[str] = None,
    cta_url: Optional[str] = None,
    alignment: Optional[str] = None,
    show_divider: Optional[bool] = None,
    height_preset: Optional[str] = None,
    object_fit: Optional[str] = None,
    properties: Optional[Dict[str, Any]] = None,
    block_id: Optional[str] = None
) -> str:
    """
    Actualiza el contenido y diseño de un bloque modular existente.
    Soporta tanto argumentos directos como un diccionario universal de propiedades.
    """
    props = dict(properties or {})
    if new_text is not None:
        props["html"] = new_text
    if new_title is not None:
        props["title"] = new_title
    if new_subtitle is not None:
        props["subtitle"] = new_subtitle
    if new_image_url is not None:
        props["image_url"] = new_image_url
    if new_category_id is not None:
        props["category_id"] = new_category_id
    if layout is not None:
        props["layout"] = layout
    if max_items is not None:
        props["max_items"] = max_items
    if cta_text is not None:
        props["cta_text"] = cta_text
    if cta_url is not None:
        props["cta_url"] = cta_url
    if alignment is not None:
        props["alignment"] = alignment
    if show_divider is not None:
        props["show_divider"] = show_divider
    if height_preset is not None:
        props["height_preset"] = height_preset
    if object_fit is not None:
        props["object_fit"] = object_fit

    return update_page_block_properties(
        page_slug=page_slug,
        block_type=block_type,
        properties=props,
        block_id=block_id
    )
