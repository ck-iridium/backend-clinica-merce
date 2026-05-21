import os
import json
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
        "You are an elite beauty editorial commercial photographer. Create a professional image prompt in ENGLISH.\n"
        "Focus on high-end commercial photography, radiant high-key lighting, flawless skin textures.\n"
        "NO text, NO names, NO faces. Just the treatment area and luxurious vibe.\n"
        "Return ONLY the prompt text."
    )
    
    try:
        if ai_provider == "gemini":
            api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(system_prompt + f"\n\nContext: {request.service_name}, {request.description}")
            return {"prompt": response.text.strip()}
        elif ai_provider == "openai":
            api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=settings.openai_model_text or "gpt-4o-mini",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": request.service_name}]
            )
            return {"prompt": response.choices[0].message.content.strip()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate")
def generate_content(request: schemas.AIGenerationRequest, db: Session = Depends(database.get_db)):
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == database.current_tenant_var.get()).first()
    if not settings: raise HTTPException(status_code=500, detail="Configuración no encontrada.")

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

    try:
        if ai_provider == "gemini":
            api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(system_prompt + "\n\n" + request.prompt)
            result_text = response.text
        elif ai_provider == "openai":
            client = OpenAI(api_key=settings.openai_api_key or os.getenv("OPENAI_API_KEY"))
            response = client.chat.completions.create(
                model=settings.openai_model_text or "gpt-4o-mini",
                messages=[{"role": "system", "content": system_prompt}, {"role": "user", "content": request.prompt}]
            )
            result_text = response.choices[0].message.content
        
        if request.type == "seo":
            try:
                cleaned_text = result_text.strip()
                if cleaned_text.startswith("```json"):
                    cleaned_text = cleaned_text[7:]
                elif cleaned_text.startswith("```"):
                    cleaned_text = cleaned_text[3:]
                if cleaned_text.endswith("```"):
                    cleaned_text = cleaned_text[:-3]
                cleaned_text = cleaned_text.strip()
                
                seo_json = json.loads(cleaned_text)
                return {
                    "seo_title": seo_json.get("seo_title", ""),
                    "seo_description": seo_json.get("seo_description", ""),
                    "seo_keywords": seo_json.get("seo_keywords", "")
                }
            except Exception as json_err:
                logger.error(f"Error parsing SEO JSON: {json_err}. Text: {result_text}")
                # Fallback parser
                lines = result_text.split("\n")
                title = ""
                desc = ""
                keywords = ""
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def ai_enhance_image_prompt_sync(user_prompt: str, shot_type: str, visual_style: str, api_key: str, reference_image: Optional[str] = None) -> str:
    """Versión síncrona y simplificada para evitar errores 404 y bloqueos."""
    try:
        genai.configure(api_key=api_key)
        # Usamos pro o flash normal sin suffixes raros
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        instruct = (
            "You are a professional photography director. Refine the user prompt into a technical commercial photography prompt in English.\n"
            "Style: Luxury, high-key lighting, flawless skin. NO faces, NO text.\n"
            f"User Prompt: {user_prompt}\n"
            f"Shot Type: {shot_type}, Style: {visual_style}\n"
            "Return only the refined prompt."
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
    settings = db.query(models.ClinicSettings).filter(models.ClinicSettings.tenant_id == database.current_tenant_var.get()).first()
    if not settings: raise HTTPException(status_code=500, detail="Configuración no encontrada.")

    api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
    if not api_key: raise HTTPException(status_code=400, detail="API Key no configurada.")

    logger.info(f"START GENERATION: {request.prompt[:50]}...")
    
    # 1. Mejorar el prompt (Síncrono)
    refined_prompt = ai_enhance_image_prompt_sync(request.prompt, request.shot_type, request.visual_style, api_key, request.reference_image)
    
    file_bytes = None
    ai_provider = settings.ai_provider or "gemini"

    if ai_provider == "gemini":
        try:
            genai.configure(api_key=api_key)
            # Aseguramos el nombre del modelo de imagen correcto
            model_name = settings.gemini_model_image or "imagen-3.0-generate-001"
            model = genai.GenerativeModel(model_name)

            aspect_text = "9:16 aspect ratio" if request.aspect_ratio == "9:16" else "16:9 aspect ratio" if request.aspect_ratio == "16:9" else "1:1 aspect ratio"
            final_prompt = f"{refined_prompt}. {aspect_text}. Commercial beauty photography, 8k, ultra-detailed."

            start = time.time()
            response = model.generate_content(final_prompt)
            logger.info(f"Google Imagen finished in {time.time() - start:.2f}s")

            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data'): file_bytes = part.inline_data.data
                elif hasattr(part, 'blob'): file_bytes = part.blob.data
                break
        except Exception as e:
            logger.error(f"Imagen 3 error: {e}")
            raise HTTPException(status_code=500, detail=f"Error en Google Imagen: {str(e)}")

    elif ai_provider == "openai":
        try:
            client = OpenAI(api_key=settings.openai_api_key or os.getenv("OPENAI_API_KEY"))
            response = client.images.generate(model="dall-e-3", prompt=refined_prompt, n=1, quality="hd")
            file_bytes = requests.get(response.data[0].url).content
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    if not file_bytes:
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
        tenant_id = database.current_tenant_var.get()
        if not tenant_id:
            raise ValueError("Tenant ID is required but missing.")
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
        return {"url": public_url}
    except Exception as e:
        logger.error(f"Save error: {e}")
        raise HTTPException(status_code=500, detail=f"Error al guardar: {str(e)}")
