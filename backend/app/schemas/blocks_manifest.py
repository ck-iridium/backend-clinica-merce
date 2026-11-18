"""
BLOCKS MANIFEST - SINGLE SOURCE OF TRUTH (SSOT)
Catálogo canónico de bloques modulares y propiedades configurables
para el Page Builder (Editor Manual) y el Copilot AI Webmaster.
"""
from typing import Dict, Any, List, Optional

BLOCK_SCHEMAS: Dict[str, Dict[str, Any]] = {
    "hero": {
        "id": "hero",
        "name": "Hero Principal",
        "description": "Cabecera de alto impacto visual a pantalla completa con imagen o vídeo de fondo y llamada a la acción.",
        "icon": "🖼️",
        "properties": {
            "image_url": {
                "type": "media",
                "label": "Imagen o Vídeo de fondo",
                "description": "URL de la fotografía comercial o vídeo en bucle."
            },
            "heading": {
                "type": "string",
                "label": "Título Principal",
                "default": "Experiencia Exclusiva",
                "description": "Titular de gran formato en tipografía serif."
            },
            "subheading": {
                "type": "string",
                "label": "Subtítulo",
                "default": "Tratamientos de alta gama adaptados a ti.",
                "description": "Texto descriptivo complementario debajo del título."
            },
            "cta_text": {
                "type": "string",
                "label": "Texto del Botón CTA",
                "default": "Reservar Cita",
                "description": "Llamada a la acción del botón principal."
            },
            "cta_url": {
                "type": "string",
                "label": "Enlace del Botón CTA",
                "default": "/reservar",
                "description": "Ruta o URL a la que dirige el botón (ej: /reservar, /tratamientos)."
            }
        }
    },
    "title_heading": {
        "id": "title_heading",
        "name": "Título Elegante",
        "aliases": ["atomic_title", "title", "heading"],
        "description": "Encabezado tipográfico refinado con divisor dorado y subtítulo opcional.",
        "icon": "📰",
        "properties": {
            "title": {
                "type": "string",
                "label": "Texto del Título",
                "default": "Título de la Sección",
                "description": "Encabezado principal de la sección."
            },
            "subtitle": {
                "type": "string",
                "label": "Subtítulo",
                "default": "",
                "description": "Texto complementario explicativo."
            },
            "title_tag": {
                "type": "select",
                "label": "Tag HTML",
                "options": ["h1", "h2", "h3", "h4", "h5", "h6"],
                "default": "h2",
                "description": "Jerarquía semántica del título."
            },
            "alignment": {
                "type": "select",
                "label": "Alineación",
                "options": ["left", "center", "right"],
                "default": "center",
                "description": "Alineación horizontal del título y subtítulo."
            },
            "show_divider": {
                "type": "boolean",
                "label": "Mostrar línea divisora dorada",
                "default": True,
                "description": "Activa o desactiva la sutil línea divisora dorada bajo el título."
            }
        }
    },
    "atomic_text": {
        "id": "atomic_text",
        "name": "Párrafo de Texto",
        "aliases": ["text", "paragraph", "editorial"],
        "description": "Párrafo o redacción editorial con formato HTML estilizado.",
        "icon": "📝",
        "properties": {
            "html": {
                "type": "html",
                "label": "Contenido del Párrafo",
                "default": "<p>Redacción editorial personalizada.</p>",
                "description": "Texto con soporte de formato HTML (negritas, cursivas, párrafos, enlaces)."
            },
            "alignment": {
                "type": "select",
                "label": "Alineación",
                "options": ["left", "center", "right", "justify"],
                "default": "left",
                "description": "Alineación del texto (izquierda, centro, derecha o justificado)."
            }
        }
    },
    "atomic_image": {
        "id": "atomic_image",
        "name": "Imagen o Vídeo",
        "aliases": ["image", "photo", "gallery", "video"],
        "description": "Elemento multimedia compatible con galería, ajuste de altura y encuadre.",
        "icon": "🖼️",
        "properties": {
            "image_url": {
                "type": "media",
                "label": "URL de Imagen o Vídeo",
                "description": "Enlace del archivo multimedia (JPG, WebP, PNG, MP4)."
            },
            "caption": {
                "type": "string",
                "label": "Pie de foto (caption)",
                "default": "",
                "description": "Descripción o pie de foto elegante centrado."
            },
            "alignment": {
                "type": "select",
                "label": "Alineación y Ancho",
                "options": ["left", "center", "right", "full_width"],
                "default": "center",
                "description": "Ubicación en el contenedor o 'full_width' para extender a los bordes."
            },
            "height_preset": {
                "type": "select",
                "label": "Altura del Contenedor",
                "options": ["auto", "small", "medium", "large", "screen"],
                "default": "auto",
                "description": "Altura visual: auto (original), small (250px), medium (400px), large (550px), screen (750px)."
            },
            "max_width": {
                "type": "select",
                "label": "Ancho Máximo",
                "options": ["25%", "50%", "75%", "100%"],
                "default": "100%",
                "description": "Ancho relativo dentro de su columna."
            },
            "object_fit": {
                "type": "select",
                "label": "Encuadre",
                "options": ["cover", "contain"],
                "default": "cover",
                "description": "cover (recortar y llenar el espacio) o contain (ajustar completa sin recorte)."
            }
        }
    },
    "text_image_cta": {
        "id": "text_image_cta",
        "name": "Imagen + Texto Editorial",
        "aliases": ["split", "imagen_texto", "texto_imagen"],
        "description": "Composición editorial en 2 columnas con imagen, titular, descripción y botón de acción.",
        "icon": "🗂️",
        "properties": {
            "image_url": {
                "type": "media",
                "label": "Imagen o Vídeo",
                "description": "Fotografía o vídeo en bucle."
            },
            "caption": {
                "type": "string",
                "label": "Pie de foto",
                "default": "",
                "description": "Pie de foto bajo la imagen."
            },
            "heading": {
                "type": "string",
                "label": "Título",
                "default": "Nuestra Esencia",
                "description": "Titular de la composición."
            },
            "subheading": {
                "type": "string",
                "label": "Texto descriptivo",
                "default": "Un entorno diseñado para revitalizar cuerpo y mente.",
                "description": "Párrafo o explicación editorial."
            },
            "cta_text": {
                "type": "string",
                "label": "Texto del Botón",
                "default": "Descubrir Más",
                "description": "Texto del botón de acción (dejar vacío si no se desea botón)."
            },
            "cta_url": {
                "type": "string",
                "label": "URL del Botón",
                "default": "/reservar",
                "description": "Destino del botón CTA."
            },
            "alignment": {
                "type": "select",
                "label": "Disposición de la Imagen",
                "options": ["left", "right", "center"],
                "default": "left",
                "description": "left (imagen a la izquierda), right (imagen a la derecha), center (imagen arriba)."
            },
            "height_preset": {
                "type": "select",
                "options": ["auto", "small", "medium", "large", "screen"],
                "default": "medium",
                "description": "Altura del marco de la imagen."
            },
            "object_fit": {
                "type": "select",
                "options": ["cover", "contain"],
                "default": "cover",
                "description": "Modo de recorte de la imagen."
            }
        }
    },
    "atomic_category": {
        "id": "atomic_category",
        "name": "Bento Catálogo de Tratamientos",
        "aliases": ["category", "catalogo", "servicios", "carrusel", "slider"],
        "description": "Módulo dinámico conectado al catálogo con selección de layout y número de tratamientos.",
        "icon": "⚙️",
        "properties": {
            "category_id": {
                "type": "category_id",
                "label": "Categoría de Tratamientos",
                "description": "ID de la categoría a mostrar. Si se omite, se usa la primera activa."
            },
            "layout": {
                "type": "select",
                "label": "Diseño / Disposición Visual",
                "options": ["traditional_grid", "bento_grid", "cards_slider", "minimalist_list"],
                "default": "cards_slider",
                "description": "cards_slider (carrusel deslizable), bento_grid (mosaico asimétrico 2026), traditional_grid (cuadrícula clásica), minimalist_list (lista minimalista)."
            },
            "max_items": {
                "type": "select",
                "label": "Máximo de Tratamientos Visibles",
                "options": [2, 3, 4, 6, 8],
                "default": 6,
                "description": "Número máximo de tarjetas de tratamientos a mostrar en la sección."
            },
            "link_text": {
                "type": "string",
                "label": "Texto del Enlace de Acción",
                "default": "Ver tratamiento",
                "description": "Etiqueta del botón en cada tarjeta (ej: 'Ver tratamiento', 'Reservar')."
            },
            "selected_treatment_ids": {
                "type": "array",
                "label": "Tratamientos Específicos",
                "default": [],
                "description": "Lista opcional de IDs de servicios específicos a filtrar. Vacío = todos los de la categoría."
            }
        }
    },
    "atomic_button": {
        "id": "atomic_button",
        "name": "Botón CTA",
        "aliases": ["button", "boton", "cta"],
        "description": "Botón de llamada a la acción personalizable.",
        "icon": "🔘",
        "properties": {
            "text": {
                "type": "string",
                "label": "Texto del Botón",
                "default": "Reservar Cita",
                "description": "Texto legible de la acción."
            },
            "url": {
                "type": "string",
                "label": "URL de Destino",
                "default": "/reservar",
                "description": "Enlace de navegación (ej: /reservar, /tratamientos, /contacto)."
            },
            "style": {
                "type": "select",
                "label": "Estilo Visual",
                "options": ["gold_solid", "gold_outline", "dark_solid"],
                "default": "gold_solid",
                "description": "gold_solid (dorado de lujo), gold_outline (borde dorado transparente), dark_solid (antracita sobrio)."
            },
            "alignment": {
                "type": "select",
                "label": "Alineación",
                "options": ["left", "center", "right"],
                "default": "center",
                "description": "Alineación horizontal del botón."
            }
        }
    },
    "contact_header": {
        "id": "contact_header",
        "name": "Encabezado de Contacto",
        "aliases": ["contact_title"],
        "description": "Titular editorial y subtítulo de bienvenida en la página de Contacto.",
        "icon": "📞",
        "properties": {
            "title": {
                "type": "string",
                "label": "Título Principal",
                "description": "Titular de gran formato (ej: 'We are with you', 'Estamos a tu lado')."
            },
            "title_italic": {
                "type": "string",
                "label": "Acento en Cursiva",
                "default": "",
                "description": "Segunda línea o palabra en cursiva dorada/suave."
            },
            "subtitle": {
                "type": "string",
                "label": "Subtítulo Editorial",
                "description": "Mensaje de bienvenida y atención al cliente."
            }
        }
    }
}


def canonicalize_block_type(raw_type: str) -> str:
    """Resuelve un tipo de bloque a su identificador oficial canónico."""
    clean = (raw_type or "").lower().strip()
    if clean in BLOCK_SCHEMAS:
        return clean
    for canon_id, schema in BLOCK_SCHEMAS.items():
        if clean in schema.get("aliases", []):
            return canon_id
    # Mapeos de conveniencia
    if clean in ["carrusel", "slider", "bento", "catalogo", "servicios"]:
        return "atomic_category"
    if clean in ["titulo", "heading", "title", "hero_title"]:
        return "title_heading"
    if clean in ["texto", "parrafo", "text", "body"]:
        return "atomic_text"
    if clean in ["imagen", "foto", "image", "foto_espacio"]:
        return "atomic_image"
    if clean in ["split", "imagen_texto", "texto_imagen"]:
        return "text_image_cta"
    if clean in ["boton", "cta", "button"]:
        return "atomic_button"
    return clean or "atomic_text"


def normalize_block_properties(block_type: str, props: Dict[str, Any]) -> Dict[str, Any]:
    """
    Normaliza alias de propiedades para garantizar compatibilidad total entre
    los argumentos que envíe el LLM y las claves canónicas que espera el frontend.
    """
    canon_type = canonicalize_block_type(block_type)
    normalized: Dict[str, Any] = dict(props or {})

    # Normalizaciones universales de títulos y subtítulos
    if canon_type in ["hero", "text_image_cta"]:
        if "title" in normalized and "heading" not in normalized:
            normalized["heading"] = normalized.pop("title")
        if "description" in normalized and "subheading" not in normalized:
            normalized["subheading"] = normalized.pop("description")
        if "text" in normalized and "subheading" not in normalized:
            normalized["subheading"] = normalized.pop("text")
        if "button_text" in normalized and "cta_text" not in normalized:
            normalized["cta_text"] = normalized.pop("button_text")
        if "button_url" in normalized and "cta_url" not in normalized:
            normalized["cta_url"] = normalized.pop("button_url")
        if "image_position" in normalized and "alignment" not in normalized:
            normalized["alignment"] = normalized.pop("image_position")

    elif canon_type in ["title_heading", "atomic_title"]:
        if "heading" in normalized and "title" not in normalized:
            normalized["title"] = normalized.pop("heading")
        if "text" in normalized and "subtitle" not in normalized:
            normalized["subtitle"] = normalized.pop("text")

    elif canon_type == "atomic_text":
        if "text" in normalized and "html" not in normalized:
            val = normalized.pop("text")
            if not str(val).strip().startswith("<"):
                val = f"<p class='leading-relaxed'>{val}</p>"
            normalized["html"] = val
        if "body" in normalized and "html" not in normalized:
            normalized["html"] = normalized.pop("body")

    elif canon_type == "atomic_button":
        if "button_text" in normalized and "text" not in normalized:
            normalized["text"] = normalized.pop("button_text")
        if "cta_text" in normalized and "text" not in normalized:
            normalized["text"] = normalized.pop("cta_text")
        if "link" in normalized and "url" not in normalized:
            normalized["url"] = normalized.pop("link")
        if "button_url" in normalized and "url" not in normalized:
            normalized["url"] = normalized.pop("button_url")

    elif canon_type == "atomic_category":
        # Normalizar sinónimos de layout
        if "layout" in normalized:
            raw_layout = str(normalized["layout"]).lower().strip()
            if raw_layout in ["slider", "carrusel", "cards_slider"]:
                normalized["layout"] = "cards_slider"
            elif raw_layout in ["bento", "bento_grid", "mosaico"]:
                normalized["layout"] = "bento_grid"
            elif raw_layout in ["grid", "cuadricula", "traditional_grid"]:
                normalized["layout"] = "traditional_grid"
            elif raw_layout in ["list", "lista", "minimalist_list"]:
                normalized["layout"] = "minimalist_list"

        # Normalizar max_items a entero
        if "max_items" in normalized:
            try:
                normalized["max_items"] = int(normalized["max_items"])
            except (ValueError, TypeError):
                pass

    return normalized


def get_blocks_prompt_summary() -> str:
    """
    Genera un resumen declarativo vivo y compacto del catálogo de bloques
    y todas sus propiedades configurables para inyectarlo en el System Prompt del Copilot.
    Si se modifica BLOCK_SCHEMAS, el Copilot se actualiza de inmediato sin tocar prompts.
    """
    lines: List[str] = [
        "CATÁLOGO DE BLOQUES Y AJUSTES CONFIGURABLES (MANIFIESTO SSOT):",
        "Cuando el usuario te pida crear o modificar un bloque en una página, utiliza `update_page_block_properties` o `add_block_to_page` pasando las propiedades correspondientes:"
    ]

    for b_id, schema in BLOCK_SCHEMAS.items():
        prop_strs: List[str] = []
        for p_name, p_meta in schema.get("properties", {}).items():
            if "options" in p_meta:
                opts = "|".join(str(o) for o in p_meta["options"])
                prop_strs.append(f"{p_name}: ({opts})")
            else:
                prop_strs.append(f"{p_name}: {p_meta.get('type', 'str')}")
        lines.append(f"- '{b_id}' ({schema.get('name')}): {schema.get('description')} -> Propiedades: [{', '.join(prop_strs)}]")

    return "\n".join(lines)
