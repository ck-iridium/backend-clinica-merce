import os
import io
import re
import uuid
import time
import base64
import logging
from typing import Optional

import requests
from PIL import Image
from supabase import create_client, Client
import google.generativeai as genai
from openai import OpenAI

from .... import models
from ....database import SessionLocal, current_tenant_var

logger = logging.getLogger("ai_agent_tools_images")


def _enhance_prompt_for_luxury_beauty(
    user_prompt: str,
    api_key: str,
    visual_style: str = "luxury",
    shot_type: str = "closeup_beauty"
) -> str:
    """Refina el prompt para generar una fotografía comercial y estética de clínica de lujo."""
    try:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-2.5-flash')
        instruct = (
            f"You are an elite commercial beauty photographer and art director for luxury aesthetic medical clinics and wellness spas.\n"
            f"Convert this treatment context into a breathtaking, photorealistic image generation prompt in ENGLISH.\n"
            f"Target style: {visual_style}, Shot type: {shot_type}.\n"
            f"Treatment context: '{user_prompt}'.\n"
            f"MANDATORY RULES:\n"
            f"- Radiant high-key lighting, soft diffused glow, impeccable skin texture or elegant serene spa environment.\n"
            f"- Quiet luxury aesthetic, warm ivory and gold undertones, ultra-high definition, 8k resolution.\n"
            f"- Strictly NO text, NO logos, NO watermarks, NO distorted limbs, NO surgical gore.\n"
            f"- Output ONLY the final detailed commercial prompt in English without any markdown or intro."
        )
        response = model.generate_content(instruct)
        refined = response.text.strip()
        return refined if refined else user_prompt
    except Exception as e:
        logger.error(f"Error refining image prompt with Gemini: {e}")
        return f"High-end luxury commercial beauty photography of {user_prompt}, soft natural warm lighting, editorial spa aesthetic, 8k, photorealistic."


def generar_imagen_servicio(
    service_slug_or_name: str,
    visual_prompt: Optional[str] = None
) -> str:
    """
    Genera una imagen artística y comercial de alta costura mediante Inteligencia Artificial para un tratamiento
    o servicio del catálogo oficial de la clínica, y la asocia automáticamente a la ficha del tratamiento.

    IMPORTANTE: Requiere estrictamente que la clínica tenga configurada su propia clave de API (Google Gemini u OpenAI)
    en Ajustes > Avanzado.

    Args:
        service_slug_or_name: El nombre o slug del tratamiento/servicio para el cual generar la imagen (ej: 'botox', 'masaje-relajante', 'Peeling Químico', 'Lifting Facial').
        visual_prompt: Opcional. Descripción visual específica del ambiente o tratamiento deseado. Si se omite, se generará una fotografía publicitaria de lujo adaptada automáticamente al tratamiento.
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

        # 1. Localizar el servicio en la base de datos
        service = db.query(models.Service).filter(
            models.Service.tenant_id == tenant_id,
            models.Service.slug == service_slug_or_name
        ).first()

        if not service:
            service = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.name.ilike(f"%{service_slug_or_name}%")
            ).first()

        if not service:
            clean_slug = re.sub(r'[^a-z0-9]+', '-', service_slug_or_name.lower()).strip('-')
            service = db.query(models.Service).filter(
                models.Service.tenant_id == tenant_id,
                models.Service.slug == clean_slug
            ).first()

        service_display_name = service.name if service else service_slug_or_name
        service_desc = (service.description or "") if service else ""

        # 2. Construir y refinar el prompt
        base_prompt = visual_prompt or f"Tratamiento estético profesional: {service_display_name}. {service_desc}. Ambiente de clínica y bienestar exclusivo."
        
        prompt_enhancer_key = gemini_key or os.getenv("GEMINI_API_KEY")
        if prompt_enhancer_key:
            refined_prompt = _enhance_prompt_for_luxury_beauty(base_prompt, prompt_enhancer_key)
        else:
            refined_prompt = f"Luxury editorial commercial beauty photography of {service_display_name}, soft radiant lighting, quiet luxury aesthetic, 8k."

        file_bytes = None

        # 3. Generación con el proveedor configurado
        if ai_provider == "gemini":
            genai.configure(api_key=gemini_key)
            model_name = settings.gemini_model_image or "imagen-3.0-generate-001"
            aspect_prompt = f"{refined_prompt}. 9:16 aspect ratio. Commercial beauty photography, 8k, ultra-detailed, photorealistic."

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
                logger.warning(f"Error generando con modelo '{model_name}': {gem_ex}. Intentando fallback a 'imagen-3.0-generate-001'")
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
                    size="1024x1792" if model_name == "dall-e-3" else "1024x1024"
                )
                file_bytes = requests.get(response.data[0].url, timeout=30).content
            except Exception as oai_ex:
                logger.error(f"Error en OpenAI DALL-E: {oai_ex}")
                return f"Error al generar la imagen con OpenAI: {str(oai_ex)}"

        if not file_bytes:
            return "Error: No se recibió ningún contenido binario de la imagen generada."

        # 4. Procesamiento a WebP y guardado en Supabase Storage
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

        # 5. Registrar en la tabla Media
        new_media = models.Media(
            tenant_id=tenant_id,
            filename=filename,
            url=public_url,
            file_type="image",
            mime_type="image/webp",
            size=len(final_bytes)
        )
        db.add(new_media)

        # 6. Si el servicio existe, asociar la imagen al servicio
        if service:
            service.image_url = public_url
            db.commit()
            return (
                f"He generado con éxito una fotografía de alta costura para '{service.name}' y la he asignado a su ficha oficial en el catálogo.\n\n"
                f"[Imagen adjunta: \"{service.name}.webp\"]\n"
                f"URL de la imagen: {public_url}\n\n"
                f"[OPTION: 1. Ver catálogo de tratamientos | ver tratamientos]\n"
                f"[OPTION: 2. Generar otra imagen | generar imagen servicio]"
            )
        else:
            db.commit()
            return (
                f"He generado con éxito la imagen inspirada en '{service_display_name}' y la he guardado en tu galería de Medios.\n\n"
                f"[Imagen adjunta: \"{service_display_name}.webp\"]\n"
                f"URL de la imagen: {public_url}\n\n"
                f"[OPTION: 1. Ver galería multimedia | ver galeria]"
            )

    except Exception as e:
        db.rollback()
        logger.error(f"Error en generar_imagen_servicio para tenant {current_tenant_var.get()}: {e}")
        return f"Error al generar la imagen: {str(e)}"
    finally:
        db.close()

