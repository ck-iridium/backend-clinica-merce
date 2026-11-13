import os
import io
import re
import uuid
import time
import base64
import logging
import unicodedata
from typing import Optional, Set

import requests
from PIL import Image
from supabase import create_client, Client
import google.generativeai as genai
from openai import OpenAI

from .... import models
from ....database import SessionLocal, current_tenant_var

logger = logging.getLogger("ai_agent_tools_images")


def _normalize_text(text: Optional[str]) -> str:
    """Normaliza texto eliminando acentos, puntuación y convirtiendo a minúsculas."""
    if not text:
        return ""
    text = unicodedata.normalize('NFD', text.lower())
    text = ''.join(c for c in text if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9\s]', ' ', text).strip()


STOP_WORDS = {
    'de', 'la', 'el', 'los', 'las', 'un', 'una', 'y', 'en', 'para', 'del', 'al', 
    'categoria', 'servicio', 'tratamiento', 'por', 'favor', 'como', 'con', 'sin', 'que'
}


def _get_tokens(text: Optional[str]) -> Set[str]:
    """Extrae palabras clave de un texto omitiendo conectores y unificando singulares/plurales."""
    norm = _normalize_text(text)
    tokens = set()
    for w in norm.split():
        if w not in STOP_WORDS and len(w) > 1:
            tokens.add(w)
            if w.endswith('s') and len(w) > 3:
                tokens.add(w[:-1])
    return tokens


def find_best_matching_service(db, tenant_id: str, query_str: str) -> Optional[models.Service]:
    """
    Busca de manera ultra inteligente y tolerante el servicio en el catálogo del tenant
    utilizando coincidencia por slug, nombre parcial y ponderación difusa de palabras clave.
    """
    if not query_str or not query_str.strip():
        return None

    clean_query = query_str.strip()
    norm_query = _normalize_text(clean_query)
    q_tokens = _get_tokens(clean_query)

    # 1. Coincidencia exacta por slug
    slug_candidate = re.sub(r'[^a-z0-9]+', '-', norm_query).strip('-')
    service = db.query(models.Service).filter(
        models.Service.tenant_id == tenant_id,
        models.Service.slug == slug_candidate
    ).first()
    if service:
        return service

    # 2. Coincidencia directa insensible a mayúsculas
    service = db.query(models.Service).filter(
        models.Service.tenant_id == tenant_id,
        models.Service.name.ilike(f"%{clean_query}%")
    ).first()
    if service:
        return service

    # 3. Ponderación difusa de tokens contra todos los servicios del inquilino
    all_services = db.query(models.Service).filter(
        models.Service.tenant_id == tenant_id
    ).all()

    if not all_services or not q_tokens:
        return None

    categories = {c.id: c.name for c in db.query(models.ServiceCategory).filter(
        models.ServiceCategory.tenant_id == tenant_id
    ).all()}

    best_service = None
    best_score = -999

    for s in all_services:
        s_norm = _normalize_text(s.name)
        s_tokens = _get_tokens(s.name) | _get_tokens(s.slug)
        cat_name = categories.get(s.category_id, "")
        cat_tokens = _get_tokens(cat_name)

        score = 0
        for qt in q_tokens:
            if qt in s_tokens:
                score += 3
            elif qt in cat_tokens:
                score += 1.5

        # Discriminadores de polaridad críticos: hombre vs mujer
        if 'mujer' in q_tokens:
            if 'mujer' in s_tokens:
                score += 6
            if 'hombre' in s_tokens:
                score -= 12
        if 'hombre' in q_tokens:
            if 'hombre' in s_tokens:
                score += 6
            if 'mujer' in s_tokens:
                score -= 12

        # Discriminadores de brazos: con brazos vs sin brazos
        if 'brazo' in q_tokens or 'brazos' in q_tokens:
            if 'con' in norm_query and 'sin' not in norm_query:
                if 'con' in s_norm:
                    score += 5
                if 'sin' in s_norm:
                    score -= 10
            elif 'sin' in norm_query:
                if 'sin' in s_norm:
                    score += 5
                if 'con' in s_norm:
                    score -= 10

        if score > best_score:
            best_score = score
            best_service = s

    if best_score >= 3:
        logger.info(f"Fuzzy match exitoso: '{query_str}' -> '{best_service.name}' (score: {best_score})")
        return best_service

    return None


def _detect_aspect_ratio_from_image(img_bytes: bytes) -> str:
    """Calcula la orientación y formato de aspecto de una imagen a partir de sus dimensiones binarias."""
    try:
        img = Image.open(io.BytesIO(img_bytes))
        w, h = img.size
        ratio = w / h
        logger.info(f"Dimensiones de imagen analizadas: {w}x{h} (ratio={ratio:.3f})")
        if ratio <= 0.82:
            return "9:16"
        elif ratio >= 1.22:
            return "16:9"
        else:
            return "1:1"
    except Exception as e:
        logger.warning(f"Error analizando aspect ratio de imagen: {e}")
        return "9:16"


def _enhance_prompt_for_luxury_beauty(
    user_prompt: str,
    api_key: str,
    visual_style: str = "luxury",
    shot_type: str = "commercial_photography",
    reference_image_bytes: Optional[bytes] = None
) -> str:
    """Refina el prompt para generar una fotografía comercial y estética de clínica de lujo."""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        instruct = (
            f"You are an elite commercial beauty photographer and art director for luxury aesthetic medical clinics and wellness spas.\n"
            f"Convert this user context into a breathtaking, photorealistic image generation prompt in ENGLISH.\n"
            f"Target style: {visual_style}, Shot type: {shot_type}.\n"
            f"Context: '{user_prompt}'.\n"
            f"MANDATORY RULES:\n"
            f"- If a reference image is provided, rigorously extract and preserve its key aesthetic elements (e.g. glove color, device style, clinical atmosphere, treatment zone, patient glasses, and lighting) while creating a fresh, distinct editorial photograph.\n"
            f"- Radiant high-key lighting, soft diffused glow, serene spa or medical boutique atmosphere.\n"
            f"- Quiet luxury aesthetic, warm ivory and gold undertones, ultra-high definition, 8k resolution.\n"
            f"- Strictly NO text, NO logos, NO watermarks, NO distorted limbs, NO surgical gore.\n"
            f"- Output ONLY the final detailed commercial prompt in English without any markdown or intro."
        )
        if reference_image_bytes:
            response = model.generate_content([
                instruct,
                {"mime_type": "image/webp", "data": reference_image_bytes}
            ])
        else:
            response = model.generate_content(instruct)
        refined = response.text.strip()
        return refined if refined else user_prompt
    except Exception as e:
        logger.error(f"Error refining image prompt with Gemini: {e}")
        return f"High-end luxury commercial beauty photography of {user_prompt}, soft natural warm lighting, editorial spa aesthetic, 8k, photorealistic."


def generar_imagen(
    prompt: str,
    service_name_or_slug: Optional[str] = None,
    aspect_ratio: Optional[str] = None
) -> str:
    """
    Genera una imagen artística y comercial mediante Inteligencia Artificial (Google Imagen o OpenAI DALL-E)
    y la muestra inmediatamente en el chat de ProBookia con miniatura interactiva y visor de zoom.

    Analiza de forma inteligente las dimensiones de la imagen de referencia si el usuario adjuntó una,
    o utiliza el formato vertical estándar (9:16) óptimo para fichas de servicios y catálogo de la clínica.

    Args:
        prompt: La descripción visual de lo que se desea generar (ej: 'mujer en camilla recibiendo depilación láser con guante rosa', 'primer plano estético de piel radiante', 'portada de estética de lujo').
        service_name_or_slug: Opcional. Nombre o slug del tratamiento del catálogo al que vincular la imagen. Si el usuario no menciona ningún servicio, déjalo vacío o None.
        aspect_ratio: Opcional. Proporción de la imagen: '9:16' (vertical móvil / catálogo), '16:9' (panorámica horizontal / portada) o '1:1' (cuadrada). Si se omite, el sistema analiza la imagen de referencia o aplica el formato idóneo automáticamente.
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
            return "Error: No se ha encontrado la configuración de la clínica."

        gemini_key = settings.gemini_api_key.strip() if settings.gemini_api_key else None
        openai_key = settings.openai_api_key.strip() if settings.openai_api_key else None

        # Verificar si el centro tiene al menos una clave propia de API configurada
        if not gemini_key and not openai_key:
            return (
                "Para generar imágenes con Inteligencia Artificial, es necesario que la clínica configure su propia Clave de API de Google Gemini o de OpenAI en Ajustes > Avanzado. "
                "Actualmente no se ha detectado ninguna clave propia introducida en los ajustes de tu clínica.\n\n"
                "[NAVIGATE: /dashboard/settings?tab=advanced&hint=advanced-gemini-api-key]\n"
                "[OPTION: 1. Ir a Ajustes Avanzados para poner mi clave | ir a ajustes avanzados]"
            )

        ai_provider = (settings.ai_provider or "gemini").lower()
        if ai_provider == "gemini" and not gemini_key:
            if openai_key:
                ai_provider = "openai"
            else:
                return (
                    "Para generar imágenes con Inteligencia Artificial mediante Google Gemini, es necesario configurar tu Clave de API en Ajustes > Avanzado.\n\n"
                    "[NAVIGATE: /dashboard/settings?tab=advanced&hint=advanced-gemini-api-key]\n"
                    "[OPTION: 1. Configurar Clave de API de Gemini | ir a ajustes avanzados]"
                )
        elif ai_provider == "openai" and not openai_key:
            if gemini_key:
                ai_provider = "gemini"
            else:
                return (
                    "Para generar imágenes con Inteligencia Artificial mediante OpenAI, es necesario configurar tu Clave de API en Ajustes > Avanzado.\n\n"
                    "[NAVIGATE: /dashboard/settings?tab=advanced&hint=advanced-openai-api-key]\n"
                    "[OPTION: 1. Configurar Clave de API de OpenAI | ir a ajustes avanzados]"
                )

        # 1. Intentar resolver el servicio si fue mencionado
        matched_service = None
        if service_name_or_slug and service_name_or_slug.strip():
            matched_service = find_best_matching_service(db, tenant_id, service_name_or_slug)

        # 2. Detectar si hay una imagen de referencia en el prompt o en el contexto
        ref_image_url = None
        url_match = re.search(r"https?://[^\s\)\"']+\.(?:png|jpe?g|webp|gif)", prompt, re.IGNORECASE)
        if url_match:
            ref_image_url = url_match.group(0).strip()
        elif "URL de la imagen:" in prompt:
            m = re.search(r"URL de la imagen:\s*(https?://[^\s\)\"']+)", prompt, re.IGNORECASE)
            if m:
                ref_image_url = m.group(1).strip()

        ref_image_bytes = None
        detected_ar_from_ref = None
        if ref_image_url:
            try:
                res = requests.get(ref_image_url, timeout=6)
                if res.ok:
                    ref_image_bytes = res.content
                    detected_ar_from_ref = _detect_aspect_ratio_from_image(ref_image_bytes)
                    logger.info(f"Formato detectado de la imagen de referencia: {detected_ar_from_ref}")
            except Exception as ref_err:
                logger.warning(f"No se pudo descargar imagen de referencia {ref_image_url}: {ref_err}")

        # 3. Determinación inteligente del formato de aspecto (Aspect Ratio)
        p_lower = prompt.lower()
        if any(k in p_lower for k in ["16:9", "16 novenos", "16-9", "panoramica", "horizontal", "portada", "banner"]):
            resolved_ar = "16:9"
        elif any(k in p_lower for k in ["9:16", "9-16", "vertical", "story", "movil"]):
            resolved_ar = "9:16"
        elif any(k in p_lower for k in ["1:1", "cuadrada"]):
            resolved_ar = "1:1"
        elif aspect_ratio and aspect_ratio.strip().lower() in ["16:9", "9:16", "1:1"]:
            resolved_ar = aspect_ratio.strip().lower()
        elif detected_ar_from_ref:
            # Adoptar exactamente la misma orientación que la imagen que proporcionó el usuario
            resolved_ar = detected_ar_from_ref
        elif matched_service or (service_name_or_slug and service_name_or_slug.strip()):
            # Los servicios y tratamientos en ProBookia tienen diseño vertical 9:16 de catálogo
            resolved_ar = "9:16"
        else:
            resolved_ar = "9:16"

        if resolved_ar == "16:9":
            ratio_label = "16:9 aspect ratio, horizontal landscape orientation"
            openai_size = "1792x1024"
        elif resolved_ar == "9:16":
            ratio_label = "9:16 aspect ratio, vertical portrait orientation"
            openai_size = "1024x1792"
        else:
            ratio_label = "1:1 aspect ratio, square orientation"
            openai_size = "1024x1024"

        # 4. Refinar prompt visual con Gemini Flash (multimodal si hay referencia)
        prompt_enhancer_key = gemini_key or os.getenv("GEMINI_API_KEY")
        if prompt_enhancer_key:
            refined_prompt = _enhance_prompt_for_luxury_beauty(
                prompt, prompt_enhancer_key, reference_image_bytes=ref_image_bytes
            )
        else:
            refined_prompt = f"Luxury editorial commercial photography of {prompt}, soft radiant lighting, quiet luxury aesthetic, 8k."

        file_bytes = None

        # 5. Generación de la imagen según el proveedor activo
        if ai_provider == "gemini":
            genai.configure(api_key=gemini_key)
            model_name = settings.gemini_model_image or "imagen-3.0-generate-001"
            aspect_prompt = f"{refined_prompt}. {ratio_label}. Commercial luxury photography, 8k, ultra-detailed, photorealistic."

            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(aspect_prompt)
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data'):
                        file_bytes = part.inline_data.data
                        break
                    elif hasattr(part, 'blob'):
                        file_bytes = part.blob.data
                        break
            except Exception as gem_ex:
                logger.warning(f"Error generando con modelo '{model_name}': {gem_ex}. Probando fallback a 'imagen-3.0-generate-001'")
                try:
                    fallback_model = genai.GenerativeModel("imagen-3.0-generate-001")
                    response = fallback_model.generate_content(aspect_prompt)
                    for part in response.candidates[0].content.parts:
                        if hasattr(part, 'inline_data'):
                            file_bytes = part.inline_data.data
                            break
                        elif hasattr(part, 'blob'):
                            file_bytes = part.blob.data
                            break
                except Exception as fb_ex:
                    logger.error(f"Error en Google Imagen: {fb_ex}")
                    return f"Error al generar la imagen con Google Imagen: {str(fb_ex)}"

        elif ai_provider == "openai":
            try:
                client = OpenAI(api_key=openai_key)
                model_name = settings.openai_model_image or "dall-e-3"
                response = client.images.generate(
                    model=model_name,
                    prompt=refined_prompt,
                    n=1,
                    quality="hd",
                    size=openai_size if model_name == "dall-e-3" else "1024x1024"
                )
                file_bytes = requests.get(response.data[0].url, timeout=35).content
            except Exception as oai_ex:
                logger.error(f"Error en OpenAI DALL-E: {oai_ex}")
                return f"Error al generar la imagen con OpenAI: {str(oai_ex)}"

        if not file_bytes:
            return "Error: No se recibió ningún contenido binario de la imagen generada."

        # 6. Procesar a WebP y guardar en Supabase Storage
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if not supabase_url or not supabase_key:
            return "Error: Faltan credenciales de almacenamiento (Supabase) en el servidor."

        supabase: Client = create_client(supabase_url, supabase_key)

        img = Image.open(io.BytesIO(file_bytes))
        buffer = io.BytesIO()
        img.save(buffer, format="WEBP", quality=85)
        final_bytes = buffer.getvalue()

        filename = f"ai_{uuid.uuid4().hex}.webp"
        supabase.storage.from_("media").upload(
            file=final_bytes,
            path=filename,
            file_options={"content-type": "image/webp"}
        )

        public_url = supabase.storage.from_("media").get_public_url(filename)

        # 7. Registrar en la tabla Media
        new_media = models.Media(
            tenant_id=tenant_id,
            filename=filename,
            url=public_url,
            file_type="image",
            mime_type="image/webp",
            size=len(final_bytes)
        )
        db.add(new_media)

        # 8. Si se encontró un servicio coincidente, asociar la imagen
        if matched_service:
            matched_service.image_url = public_url
            db.commit()
            return (
                f"He generado con éxito la fotografía en formato {resolved_ar} y la he asociado oficialmente a la ficha de '{matched_service.name}'.\n\n"
                f"[Imagen adjunta: \"{matched_service.name}.webp\"]\n"
                f"URL de la imagen: {public_url}"
            )
        else:
            db.commit()
            preview_title = (prompt[:40] + '...') if len(prompt) > 40 else prompt
            return (
                f"He generado la fotografía de alta costura en formato {resolved_ar} con éxito y la he guardado en tu galería de Medios.\n\n"
                f"[Imagen adjunta: \"{preview_title}.webp\"]\n"
                f"URL de la imagen: {public_url}"
            )

    except Exception as e:
        db.rollback()
        logger.error(f"Error en generar_imagen para tenant {current_tenant_var.get()}: {e}")
        return f"Error al generar la imagen: {str(e)}"
    finally:
        db.close()


def generar_imagen_servicio(
    service_slug_or_name: str,
    visual_prompt: Optional[str] = None
) -> str:
    """
    Alias especializado para generar una imagen y asociarla a un servicio específico del catálogo.
    """
    full_prompt = visual_prompt or f"Tratamiento estético profesional de {service_slug_or_name}"
    return generar_imagen(prompt=full_prompt, service_name_or_slug=service_slug_or_name)
