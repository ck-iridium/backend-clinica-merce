import logging
import uuid
import re
from typing import Optional, List, Dict, Any
from sqlalchemy import func

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
            cta_subtitle=cta_subtitle,
            layout_style=layout_style,
            megamenu_layout=megamenu_layout,
            megamenu_categories_json=megamenu_categories_json
        )

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
