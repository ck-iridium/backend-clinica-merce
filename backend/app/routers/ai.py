import os
import json
import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, database, models
import google.generativeai as genai
from openai import OpenAI
import io
import uuid
import base64
import requests
from PIL import Image
from supabase import create_client, Client
import logging
import time
from typing import Optional
from fastapi.concurrency import run_in_threadpool
from ..limits import get_tenant_ai_key, check_and_deduct_image_quota, check_and_deduct_text_action

# Configurar log
log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ai_generation.log')
logger = logging.getLogger("ai_generation")
if not logger.handlers:
    file_handler = logging.FileHandler(log_path, mode='a')
    file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
    logger.setLevel(logging.INFO)
    logger.addHandler(file_handler)
    logger.propagate = False

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
)

SYSTEM_PROMPT_TEMPLATE = """
Eres un Asistente de Inteligencia Artificial experto en redacción corporativa y SEO para Clínicas de Medicina Estética de Alta Gama ("Quiet Luxury").
Instrucciones obligatorias:
- Tono seleccionado: {tone} (premium = elegante y sutil; cercano = empático y claro; clinico = científico y preciso).
"""

@router.post("/optimize-prompt")
def optimize_prompt(request: schemas.OptimizePromptRequest, db: Session = Depends(database.get_db)):
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == database.current_tenant_var.get()).first()
    if not settings:
        raise HTTPException(status_code=500, detail="Configuración no encontrada.")

    ai_provider = settings.ai_provider or "gemini"
    system_prompt = (
        "You are an elite beauty and aesthetic clinic commercial photographer and art director.\n"
        "Create a professional, highly aesthetic image generation prompt in ENGLISH for a luxury clinic, salon, or spa.\n"
        "Guidelines:\n"
        "- The photo must depict an authentic, elegant commercial editorial scene of the service or treatment.\n"
        "- Show an elegant, relaxed client in a serene luxury clinic atmosphere, receiving or experiencing the treatment (e.g., gentle hands applying luxurious serum with pipette, soothing facial relaxation, tranquil spa setting).\n"
        "- Soft radiant high-key lighting, clean minimalist clinic aesthetics (warm cream, soft marble, champagne gold, delicate botanicals).\n"
        "- Natural beauty, serene facial expressions, realistic proportions. NEVER create microscopic abstract skin pore closeups or flat flesh textures.\n"
        "- NO text, NO watermarks, NO brand names, NO logos.\n"
        "Return ONLY the refined prompt text in English."
    )
    
    try:
        if ai_provider == "gemini":
            api_key = get_tenant_ai_key(db, "gemini")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(system_prompt + f"\n\nContext: {request.service_name}, {request.description}")
            return {"prompt": response.text.strip()}
        elif ai_provider == "openai":
            api_key = get_tenant_ai_key(db, "openai")
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=settings.openai_model_text or "gpt-4o-mini",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": request.service_name}]
            )
            return {"prompt": response.choices[0].message.content.strip()}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
def generate_content(request: schemas.AIGenerationRequest, db: Session = Depends(database.get_db)):
    tenant_id = database.current_tenant_var.get()
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first() if tenant_id else None
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first() if tenant_id else None
    if not settings: raise HTTPException(status_code=500, detail="Configuración no encontrada.")

    if tenant:
        check_and_deduct_text_action(db, tenant, settings)

    ai_provider = settings.ai_provider or "gemini"
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(tone=request.tone)
    
    if request.type == "short_description":
        system_prompt += (
            "\nINSTRUCCIÓN CRÍTICA DE FORMATO:\n"
            "- Debes escribir únicamente una descripción corta de 1 o 2 frases (máximo 40 palabras).\n"
            "- El resultado debe ser texto plano directo y elegante.\n"
            "- NO incluyas introducciones como 'Aquí tienes...', NO incluyas saludos, NO incluyas títulos, NO incluyas subtítulos, NO incluyas listas de viñetas, NO incluyas formato Markdown, NO utilices negritas o cursivas, ni líneas horizontales, ni comillas iniciales/finales.\n"
            "- Enfócate en el beneficio premium y el confort de forma muy sintetizada.\n"
            "- Escribe SOLO la descripción, nada más."
        )
    elif request.type == "rich_content":
        system_prompt += (
            "\nINSTRUCCIÓN CRÍTICA DE FORMATO:\n"
            "- Debes escribir el contenido detallado del tratamiento en formato HTML semántico.\n"
            "- Utiliza párrafos (<p>), listas (<ul> y <li>) y énfasis sutiles (<strong>, <em>) para estructurar el texto de manera premium.\n"
            "- NO incluyas títulos principales (como <h1> o <h2>) ni títulos sugeridos de página, ya que la plataforma ya renderiza el título por su cuenta.\n"
            "- NO incluyas introducciones conversacionales ni comentarios iniciales o finales (como 'Aquí tienes una propuesta' o 'Este texto busca evocar...').\n"
            "- NO incluyas secciones de SEO ni listas de palabras clave al final.\n"
            "- Enfócate 100% en la experiencia sensorial, la tecnología de vanguardia y el bienestar del cliente.\n"
            "- El resultado debe ser únicamente el HTML limpio y pulido listo para insertar."
        )
    elif request.type == "seo":
        system_prompt += (
            "\nINSTRUCCIÓN CRÍTICA DE FORMATO:\n"
            "- Debes generar metadatos SEO premium para buscadores.\n"
            "- Es obligatorio que respondas únicamente con un objeto JSON válido con las siguientes claves: 'seo_title', 'seo_description', 'seo_keywords'.\n"
            "- 'seo_title': Un título optimizado de alta gama de entre 50 y 60 caracteres.\n"
            "- 'seo_description': Una meta descripción convincente e inspiradora de entre 150 y 160 caracteres.\n"
            "- 'seo_keywords': Una lista de palabras clave relevantes separadas por comas (ej. 'depilacion laser, clinica estetica, triple onda').\n"
            "- NO rodees el JSON con bloques de código markdown, responde SOLO el JSON directo."
        )
    elif request.type == "hero_copy":
        system_prompt += (
            "\nINSTRUCCIÓN CRÍTICA DE FORMATO:\n"
            "- Debes generar una propuesta de Titular Principal (H1) y Subtítulo para la portada de una clínica de estética de alta gama.\n"
            "- Responde ÚNICAMENTE un objeto JSON válido con las claves: 'hero_title' y 'hero_subtitle'.\n"
            "- 'hero_title': Titular elegante, sugerente y memorable de entre 5 y 10 palabras.\n"
            "- 'hero_subtitle': Subtítulo claro, aspiracional y cálido de entre 10 y 25 palabras.\n"
            "- NO incluyas markdown, responde SOLO el JSON directo."
        )
    elif request.type == "about_bio":
        system_prompt += (
            "\nINSTRUCCIÓN CRÍTICA DE FORMATO:\n"
            "- Debes generar el título de la sección y la biografía/filosofía corporativa para la portada.\n"
            "- Responde ÚNICAMENTE un objeto JSON válido con las claves: 'about_title' y 'about_text'.\n"
            "- 'about_title': Título refinado (ej. 'Nuestra Filosofía', 'El Arte del Cuidado Personalizado').\n"
            "- 'about_text': Narrativa de alta gama (2-3 párrafos cortos) transmitiendo experiencia, calma y exclusividad.\n"
            "- NO incluyas markdown, responde SOLO el JSON directo."
        )
    elif request.type == "cta_copy":
        system_prompt += (
            "\nINSTRUCCIÓN CRÍTICA DE FORMATO:\n"
            "- Debes generar la sección de Llamada a la Acción (CTA) de la portada.\n"
            "- Responde ÚNICAMENTE un objeto JSON válido con las claves: 'cta_title', 'cta_subtitle' y 'cta_button_text'.\n"
            "- 'cta_title': Frase directa y de alto valor (ej. 'Comienza tu viaje hacia una piel radiante').\n"
            "- 'cta_subtitle': Frase de apoyo que invite a reservar (ej. 'Agenda tu consulta de diagnóstico personalizada sin compromiso').\n"
            "- 'cta_button_text': Texto corto del botón (ej. 'Reservar Cita').\n"
            "- NO incluyas markdown, responde SOLO el JSON directo."
        )
    elif request.type == "category_copy":
        system_prompt += (
            "\nINSTRUCCIÓN CRÍTICA DE FORMATO:\n"
            "- Debes generar el nombre y la descripción para una categoría de servicios estéticos.\n"
            "- Responde ÚNICAMENTE un objeto JSON válido con las claves: 'name' y 'description'.\n"
            "- 'name': Nombre claro y sofisticado de la categoría.\n"
            "- 'description': Breve descripción de 1 o 2 frases presentando los tratamientos de esta área.\n"
            "- NO incluyas markdown, responde SOLO el JSON directo."
        )

    try:
        if ai_provider == "gemini":
            api_key = get_tenant_ai_key(db, "gemini")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(system_prompt + "\n\n" + request.prompt)
            result_text = response.text
        elif ai_provider == "openai":
            api_key = get_tenant_ai_key(db, "openai")
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=settings.openai_model_text or "gpt-4o-mini",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": request.prompt}]
            )
            result_text = response.choices[0].message.content
        
        if request.type in ["seo", "hero_copy", "about_bio", "cta_copy", "category_copy"]:
            try:
                cleaned_text = result_text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:]
                elif cleaned_text.startswith("```"):
                    cleaned_text = cleaned_text[3:]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]
                cleaned_text = cleaned_text.strip()
                
                parsed_json = json.loads(cleaned_text)
                return parsed_json
            except Exception as json_err:
                logger.error(f"Error parsing {request.type} JSON: {json_err}. Text: {result_text}")
                if request.type == "seo":
                    # Fallback parser
                    lines = result_text.split("\n")
                    title, desc, keywords = "", "", ""
                    for line in lines:
                        if "title" in line.lower() or "titulo" in line.lower():
                            title = line.split(":", 1)[-1].strip().strip('"').strip('{},')
                        elif "description" in line.lower() or "descripcion" in line.lower():
                            desc = line.split(":", 1)[-1].strip().strip('"').strip('{},')
                        elif "keywords" in line.lower() or "palabras" in line.lower():
                            keywords = line.split(":", 1)[-1].strip().strip('"').strip('{},')
                    return {
                        "seo_title": title or "Tratamiento Premium",
                        "seo_description": desc or "Descubre la experiencia exclusiva en nuestra clínica.",
                        "seo_keywords": keywords or "medicina estetica, lujo, cuidado facial"
                    }
                return {"content": result_text.strip()}

        return {"content": result_text.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def ai_enhance_image_prompt_sync(user_prompt: str, shot_type: str, visual_style: str, api_key: str, reference_image: Optional[str] = None) -> str:
    """Versión síncrona y simplificada para evitar errores 404 y bloqueos."""
    try:
        genai.configure(api_key=api_key)
        # Usamos pro o flash normal sin suffixes raros
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        instruct = (
            "You are an elite luxury beauty and aesthetic clinic creative director.\n"
            "Refine the user's prompt into a high-end commercial photography prompt in English for a quiet luxury beauty clinic or spa.\n"
            "Atmosphere: Serene, peaceful, soft diffused daylight, warm minimalist clinic interior with gentle treatment care.\n"
            "Depict a realistic, highly appealing beauty clinic scene with relaxed client and professional aesthetic touch. Do NOT generate abstract microscope skin textures or flat flesh zooms.\n"
            "NO text overlays, NO logos, NO watermarks.\n"
            f"User Prompt: {user_prompt}\n"
            f"Shot Type: {shot_type}, Visual Style: {visual_style}\n"
            "Return ONLY the refined English prompt text."
        )
        
        if reference_image:
            b64 = reference_image.split(",")[1] if "," in reference_image else reference_image
            response = model.generate_content([instruct, {"mime_type": "image/jpeg", "data": base64.b64decode(b64)}])
        else:
            response = model.generate_content(instruct)
        
        return response.text.strip()
    except Exception as e:
        logger.error(f"Error enhancing prompt: {e}")
        return user_prompt # Fallback al original

@router.post("/generate-image")
def generate_image(request: schemas.AIImageGenerationRequest, db: Session = Depends(database.get_db)):
    """Cambiado a síncrono (def) para que FastAPI lo gestione en threads separados."""
    tenant_id = database.current_tenant_var.get()
    if not tenant_id:
        raise HTTPException(status_code=400, detail="Tenant ID no encontrado.")

    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first()
    if not tenant:
        raise HTTPException(status_code=404, detail="Tenant no encontrado.")

    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first()
    if not settings:
        raise HTTPException(status_code=500, detail="Configuración no encontrada.")

    # Validar y descontar cuota de imágenes mensual / trial / BYOK
    quota_info = check_and_deduct_image_quota(db, tenant, settings)

    def _rollback_quota():
        try:
            if quota_info and not quota_info.get("has_byok") and not quota_info.get("unlimited"):
                if quota_info.get("is_trial") and (tenant.ai_trial_images_used or 0) > 0:
                    tenant.ai_trial_images_used -= 1
                    db.commit()
                elif not quota_info.get("is_trial") and (tenant.ai_monthly_images_used or 0) > 0:
                    tenant.ai_monthly_images_used -= 1
                    db.commit()
        except Exception as rb_ex:
            logger.error(f"Error revirtiendo cuota de imagen: {rb_ex}")

    ai_provider = settings.ai_provider or "gemini"
    
    try:
        gemini_key = get_tenant_ai_key(db, "gemini")
    except HTTPException:
        # Fallback a la clave maestra de Gemini si no se pudo resolver pero tenemos la variable de entorno
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key or not gemini_key.strip():
            _rollback_quota()
            raise HTTPException(status_code=400, detail="Clave de API de Gemini no configurada en el sistema.")
        
    logger.info(f"START GENERATION: {request.prompt[:50]}...")
    
    # 1. Mejorar el prompt (Síncrono)
    try:
        refined_prompt = ai_enhance_image_prompt_sync(request.prompt, request.shot_type, request.visual_style, gemini_key, request.reference_image)
    except Exception as enh_err:
        logger.warning(f"Error refinando prompt: {enh_err}. Usando original.")
        refined_prompt = request.prompt
    
    file_bytes = None

    # Lógica de fallback transparente si el proveedor es OpenAI pero no hay clave configurada
    if ai_provider == "openai":
        try:
            openai_key = get_tenant_ai_key(db, "openai")
        except Exception:
            logger.info("OpenAI API Key no configurada para el inquilino. Realizando fallback automático a Google Imagen/Gemini de la plataforma.")
            ai_provider = "gemini"

    if ai_provider == "gemini":
        try:
            genai.configure(api_key=gemini_key)
            preferred_model = settings.gemini_model_image
            if not preferred_model or preferred_model.startswith("imagen-"):
                preferred_model = "gemini-2.5-flash-image"

            models_to_try = [preferred_model]
            for m in ["gemini-2.5-flash-image", "gemini-3.1-flash-image", "gemini-3-pro-image"]:
                if m not in models_to_try:
                    models_to_try.append(m)

            aspect_text = "9:16 aspect ratio" if request.aspect_ratio == "9:16" else "16:9 aspect ratio" if request.aspect_ratio == "16:9" else "1:1 aspect ratio"
            final_prompt = f"{refined_prompt}. {aspect_text}. Commercial beauty photography, 8k, ultra-detailed."

            last_gemini_error = None
            for current_model_name in models_to_try:
                try:
                    logger.info(f"Intentando generar imagen con {current_model_name}...")
                    model = genai.GenerativeModel(current_model_name)
                    start = time.time()
                    response = model.generate_content(final_prompt)
                    logger.info(f"Google {current_model_name} finished in {time.time() - start:.2f}s")

                    if response and getattr(response, 'candidates', None):
                        for candidate in response.candidates:
                            content = getattr(candidate, 'content', None)
                            if not content: continue
                            for part in getattr(content, 'parts', []):
                                inline_data = getattr(part, 'inline_data', None)
                                if inline_data and getattr(inline_data, 'data', None):
                                    file_bytes = inline_data.data
                                    break
                                blob = getattr(part, 'blob', None)
                                if blob and getattr(blob, 'data', None):
                                    file_bytes = blob.data
                                    break
                            if file_bytes:
                                break
                    if file_bytes:
                        break
                except Exception as model_err:
                    last_gemini_error = model_err
                    logger.warning(f"Error generando con {current_model_name}: {model_err}. Probando siguiente modelo...")

            if not file_bytes:
                err_msg = str(last_gemini_error) if last_gemini_error else "No se generó contenido de imagen."
                logger.error(f"Gemini image error: {err_msg}")
                _rollback_quota()
                if "quota" in err_msg.lower() or "429" in err_msg or "resource_exhausted" in err_msg.lower():
                    raise HTTPException(
                        status_code=429,
                        detail="La cuota de generación de imágenes por minuto se ha agotado temporalmente en Google. Por favor, reintenta en unos instantes o conecta tu clave propia en Ajustes > Avanzado."
                    )
                raise HTTPException(
                    status_code=500,
                    detail="La generación fotorrealista con la clave de la plataforma está en preparación o sin cuota en este momento. Puedes conectar tu propia API Key de Google Gemini u OpenAI en Ajustes > Avanzado para generar sin interrupciones."
                )
        except HTTPException:
            _rollback_quota()
            raise
        except Exception as e:
            _rollback_quota()
            logger.error(f"Gemini generation error: {e}")
            raise HTTPException(status_code=500, detail=f"Error en Google Gemini: {str(e)}")

    elif ai_provider == "openai":
        try:
            openai_key = get_tenant_ai_key(db, "openai")
            client = OpenAI(api_key=openai_key)
            response = client.images.generate(model="dall-e-3", prompt=refined_prompt, n=1, quality="hd")
            file_bytes = requests.get(response.data[0].url).content
        except HTTPException:
            _rollback_quota()
            raise
        except Exception as e:
            _rollback_quota()
            raise HTTPException(status_code=500, detail=str(e))

    if not file_bytes:
        _rollback_quota()
        raise HTTPException(status_code=500, detail="No se generó contenido de imagen.")

    # Guardar en Supabase
    try:
        supabase: Client = create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_ROLE_KEY"])
        
        # Procesar imagen
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
        
        # Guardar en DB
        new_media = models.Media(
            tenant_id=tenant_id,
            filename=filename,
            url=public_url,
            file_type="image",
            mime_type="image/webp",
            size=len(final_bytes)
        )
        db.add(new_media)
        db.commit()
        
        logger.info(f"SUCCESS: Generated and saved: {public_url}")
        return {"url": public_url, "quota": quota_info}
    except Exception as e:
        _rollback_quota()
        logger.error(f"Save error: {e}")
        raise HTTPException(status_code=500, detail=f"Error al guardar: {str(e)}")

@router.post("/generate-block-content", response_model=schemas.BlockAIGenerateResponse)
def generate_block_content(
    request: schemas.BlockAIGenerateRequest,
    db: Session = Depends(database.get_db)
):
    tenant_id = database.current_tenant_var.get()
    tenant = db.query(models.Tenant).filter(models.Tenant.id == tenant_id).first() if tenant_id else None
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == tenant_id).first() if tenant_id else None
    if not settings:
        raise HTTPException(status_code=500, detail="Configuración no encontrada.")

    # Validar y descontar cuota diaria de texto inteligente
    if tenant:
        check_and_deduct_text_action(db, tenant, settings)

    clinic_name = settings.clinic_name if settings and settings.clinic_name else "Centro de Belleza y Bienestar"

    tone_str = "Quiet Luxury refinado y exclusivo"
    if request.tone == "cercano":
        tone_str = "cercano, fresco, directo y de tú a tú (TUTEO OBLIGATORIO: dirígete siempre al lector de 'tú', por ejemplo 'tu momento', 'disfruta', 'descubre lo que tu cabello y piel necesitan'. Prohibido hablar de 'usted'. No uses tecnicismos complejos; sé natural, acogedor y cercano)."
    elif request.tone in ["clinico", "profesional"]:
        tone_str = "profesional, técnico, riguroso y con autoridad"
    elif request.tone == "premium":
        tone_str = "Quiet Luxury refinado, elegante, minimalista y aspiracional"

    block_type = request.block_type
    current_data = request.current_data or {}

    prompt_instructions = f"""
Eres un redactor y copywriter creativo de primer nivel especializado en negocios de estética, belleza, peluquería, salones y clínicas ('{clinic_name}').
Estás generando contenido para un bloque web de tipo '{block_type}'.
Tono solicitado: {tone_str}.
Idioma: {request.language or 'es'}.

DIRECTRICES CLAVE:
1. ADAPTABILIDAD AL NEGOCIO: Adapta el contenido estrictamente a lo que el usuario pida (peluquería, corte de pelo a domicilio, estética, manicura, masajes, tratamientos faciales o medicina estética). Respeta el sector del usuario sin asumir medicina a menos que lo pida.
2. ENFOQUE DEL TONO: Si el tono es cercano, tutea siempre al lector con naturalidad y frescura, sin tecnicismos. Si es Quiet Luxury, aporta sobriedad y distinción. Si es profesional, rigor y técnica.

Petición del usuario:
\"\"\"{request.prompt}\"\"\"

Datos actuales del bloque:
{json.dumps(current_data, ensure_ascii=False)}

INSTRUCCIONES DE FORMATO:
Debes responder ÚNICAMENTE con un objeto JSON válido (sin explicaciones adicionales fuera del JSON).
"""

    if block_type in ["atomic_title", "title_heading"]:
        prompt_instructions += """
El JSON debe tener exactamente estos campos:
{
  "title": "Titular refinado, elegante y evocador (máximo 8-10 palabras)",
  "subtitle": "Subtítulo descriptivo o complementario (1-2 frases)"
}
"""
    elif block_type == "atomic_text":
        prompt_instructions += """
El JSON debe tener exactamente este campo con etiquetas HTML estándar (<p>, <strong>):
{
  "html": "<p>Primer párrafo editorial cercano...</p><p>Segundo párrafo con ventajas y propuesta de valor...</p>"
}
"""
    elif block_type == "accordion_faq":
        prompt_instructions += """
El JSON debe tener exactamente estos campos:
{
  "title": "Preguntas Frecuentes",
  "faqs": [
    {"id": "faq-1", "question": "¿Pregunta 1 relevante?", "answer": "Respuesta clara y tranquilizadora."},
    {"id": "faq-2", "question": "¿Pregunta 2 relevante?", "answer": "Respuesta clara y tranquilizadora."},
    {"id": "faq-3", "question": "¿Pregunta 3 relevante?", "answer": "Respuesta clara y tranquilizadora."},
    {"id": "faq-4", "question": "¿Pregunta 4 relevante?", "answer": "Respuesta clara y tranquilizadora."}
  ]
}
"""
    elif block_type == "features_grid":
        prompt_instructions += """
El JSON debe tener exactamente estos campos:
{
  "title": "Nuestros Pilares de Excelencia",
  "items": [
    {"id": "feat-1", "title": "Pilar 1", "description": "Breve explicación del beneficio o ventaja."},
    {"id": "feat-2", "title": "Pilar 2", "description": "Breve explicación del beneficio o ventaja."},
    {"id": "feat-3", "title": "Pilar 3", "description": "Breve explicación del beneficio o ventaja."}
  ]
}
"""
    elif block_type == "hero":
        prompt_instructions += """
El JSON debe tener exactamente estos campos:
{
  "heading": "Titular de alto impacto visual (máximo 7 palabras)",
  "subheading": "Subtítulo seductor y aspiracional (1 frase)",
  "cta_text": "Texto del botón de acción (ej: 'Descubre nuestros servicios' o 'Reservar Cita')"
}
"""
    elif block_type == "quote_testimonial":
        prompt_instructions += """
El JSON debe ser un único objeto JSON (NO un array) con exactamente estos campos:
{
  "quote": "Cita o testimonio en primera persona, inspirador, creíble y auténtico.",
  "author": "Nombre de la clienta o cliente",
  "role": "Clienta habitual / Rol",
  "rating": 5
}
"""
    elif block_type == "text_image_cta":
        prompt_instructions += """
El JSON debe tener exactamente estos campos:
{
  "heading": "Título principal atractivo",
  "title": "Título principal atractivo",
  "subheading": "Texto descriptivo que conecta el beneficio con el bienestar del cliente.",
  "description": "Texto descriptivo que conecta el beneficio con el bienestar del cliente.",
  "cta_text": "Texto del botón (ej: 'Reservar Cita' o 'Ver Más')",
  "button_text": "Texto del botón (ej: 'Reservar Cita' o 'Ver Más')"
}
"""
    else:
        prompt_instructions += """
Genera un objeto JSON con los campos clave apropiados para este bloque.
"""

    try:
        gemini_key = get_tenant_ai_key(db, "gemini")
    except Exception:
        gemini_key = os.getenv("GEMINI_API_KEY")
        if not gemini_key:
            raise HTTPException(status_code=400, detail="Clave de API de IA no configurada.")

    raw_text = ""
    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash",
            generation_config={"response_mime_type": "application/json"}
        )
        response = model.generate_content(prompt_instructions)
        raw_text = response.text.strip()
        parsed_data = json.loads(raw_text)

        # Normalización defensiva para garantizar compatibilidad total con los bloques del frontend
        if isinstance(parsed_data, list):
            if block_type == "accordion_faq":
                parsed_data = {"faqs": parsed_data}
            elif block_type == "features_grid":
                parsed_data = {"items": parsed_data}
            elif block_type == "quote_testimonial":
                first = parsed_data[0] if (len(parsed_data) > 0 and isinstance(parsed_data[0], dict)) else {}
                parsed_data = {
                    "quote": first.get("quote") or "Servicio excepcional y trato muy cercano.",
                    "author": first.get("author") or first.get("author_name") or "Cliente Satisfecho",
                    "role": first.get("role") or first.get("author_role") or "Clienta habitual",
                    "rating": first.get("rating", 5)
                }
            elif len(parsed_data) > 0 and isinstance(parsed_data[0], dict):
                parsed_data = parsed_data[0]
            else:
                parsed_data = {"items": parsed_data}

        if not isinstance(parsed_data, dict):
            parsed_data = {}

        # Normalización específica por bloque
        if block_type == "atomic_text":
            html_val = parsed_data.get("html") or parsed_data.get("content_html") or parsed_data.get("text") or ""
            if html_val and not html_val.strip().startswith("<"):
                html_val = f"<p>{html_val.strip()}</p>"
            parsed_data["html"] = html_val
            parsed_data["content_html"] = html_val

        elif block_type == "text_image_cta":
            h = parsed_data.get("heading") or parsed_data.get("title") or ""
            sub = parsed_data.get("subheading") or parsed_data.get("description") or parsed_data.get("text") or ""
            cta = parsed_data.get("cta_text") or parsed_data.get("button_text") or "Reservar Cita"
            parsed_data["heading"] = h
            parsed_data["title"] = h
            parsed_data["subheading"] = sub
            parsed_data["description"] = sub
            parsed_data["cta_text"] = cta
            parsed_data["button_text"] = cta

        elif block_type == "quote_testimonial":
            author_val = parsed_data.get("author") or parsed_data.get("author_name") or "Cliente Satisfecho"
            role_val = parsed_data.get("role") or parsed_data.get("author_role") or "Clienta habitual"
            parsed_data["author"] = author_val
            parsed_data["author_name"] = author_val
            parsed_data["role"] = role_val
            parsed_data["author_role"] = role_val
            if "rating" not in parsed_data:
                parsed_data["rating"] = 5

        return schemas.BlockAIGenerateResponse(
            block_type=block_type,
            content_data=parsed_data,
            explanation=f"Contenido generado con tono {tone_str}"
        )
    except Exception as e:
        logger.error(f"Error en generate_block_content: {e}")
        try:
            match = re.search(r'\{.*\}', raw_text, re.DOTALL)
            if match:
                parsed_data = json.loads(match.group(0))
                return schemas.BlockAIGenerateResponse(
                    block_type=block_type,
                    content_data=parsed_data,
                    explanation="Contenido generado con éxito"
                )
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=f"Error al generar contenido con IA: {str(e)}")
