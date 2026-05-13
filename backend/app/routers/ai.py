import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, database, models
import google.generativeai as genai
from openai import OpenAI
import urllib.request
import io
import uuid
import base64
import requests
from PIL import Image
from supabase import create_client, Client
import logging
import time

# Configurar log a archivo de forma explícita
log_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'ai_generation.log')
file_handler = logging.FileHandler(log_path, mode='a')
file_handler.setFormatter(logging.Formatter('%(asctime)s - %(levelname)s - %(message)s'))
logger = logging.getLogger("ai_generation")
logger.setLevel(logging.INFO)
logger.addHandler(file_handler)
logger.propagate = False # Evitar duplicados en consola si uvicorn ya lo captura

router = APIRouter(
    prefix="/ai",
    tags=["ai"],
)

SYSTEM_PROMPT_TEMPLATE = """
Eres un Asistente de Inteligencia Artificial experto en redacción corporativa y SEO para Clínicas de Medicina Estética de Alta Gama ("Quiet Luxury").
Instrucciones obligatorias:
- Lenguaje sugerente, profesional y sofisticado.
- Evita excesos de exclamaciones, emojis comerciales o promesas agresivas ("¡Compra ya!", "¡El mejor tratamiento!").
- Tono seleccionado: {tone} (premium = elegante y sutil; cercano = empático y claro; clinico = científico y preciso).
"""

@router.post("/optimize-prompt")
def optimize_prompt(request: schemas.OptimizePromptRequest, db: Session = Depends(database.get_db)):
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        raise HTTPException(status_code=500, detail="Configuración de la clínica no encontrada.")

    ai_provider = settings.ai_provider or "gemini"
    
    system_prompt = (
        "Eres un fotógrafo comercial de belleza editorial de élite para clínicas estéticas de lujo del año 2026. Tu objetivo es crear el prompt de imagen perfecto, fotorealista y premium.\n"
        "REGLAS DE ORO VISUALES:\n"
        "1. Escribe el prompt EN INGLÉS.\n"
        "2. ANCLAJE ANATÓMICO OBLIGATORIO: Describe un primer plano (macro shot) o plano medio centrado en una zona humana real y pulida (ej. 'A detailed macro shot of flawless, glowing skin on a client's arm/leg/forehead'). Prohibido descripciones abstractas de 'área de suavidad'.\n"
        "3. TRATAMIENTO DIRECTO: Describe visualmente la interacción o el resultado (ej. 'A high-end modern cosmetic device elegantly touching a smooth area of flawless skin').\n"
        "4. ESTÉTICA Y LUZ: '2026 premium aesthetic clinic, high-end commercial photography, radiant high-key studio lighting, soft diffused light, zero imperfections'. La imagen debe gritar LUJO.\n"
        "5. PROHIBICIONES: 'NO text, NO names, NO faces, NO full people' (para evitar el horror-cara y centrarnos en el resultado en la piel).\n"
        "Devuelve SOLO el texto del prompt."
    )
    
    user_context = (
        f"Service: {request.service_name}\n"
        f"Short Description: {request.description}\n"
        f"Full Content: {request.content_html}"
    )

    try:
        if ai_provider == "gemini":
            api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
            genai.configure(api_key=api_key)
            model_name = settings.gemini_model_text or 'gemini-2.5-flash'
            model = genai.GenerativeModel(model_name)
            response = model.generate_content(system_prompt + "\n\nContexto:\n" + user_context)
            return {"prompt": response.text.strip()}

        elif ai_provider == "openai":
            api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            client = OpenAI(api_key=api_key)
            model_name = settings.openai_model_text or "gpt-4o-mini"
            response = client.chat.completions.create(
                model=model_name,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_context}
                ]
            )
            return {"prompt": response.choices[0].message.content.strip()}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error optimizando prompt: {str(e)}")


@router.post("/generate")
def generate_content(request: schemas.AIGenerationRequest, db: Session = Depends(database.get_db)):
    # 1. Recuperar la configuración para saber qué proveedor y claves usar
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        raise HTTPException(status_code=500, detail="Configuración de la clínica no encontrada.")

    ai_provider = settings.ai_provider or "gemini"
    
    # Construir el System Prompt
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(tone=request.tone)
    
    if request.type == "seo":
        task_instruction = (
            "Tu tarea es devolver estrictamente un JSON válido con la siguiente estructura, sin texto adicional ni bloques markdown (no uses ```json):\n"
            '{"seo_title": "[Nombre Exacto del Servicio] | [Beneficio max 3 palabras] - Estética Merce", "seo_description": "Meta descripción atractiva de max 155 caracteres que incluya la palabra clave principal de forma natural", "seo_keywords": "palabras, clave, separadas, por, comas"}\n'
            "REGLAS ESTRICTAS PARA EL SEO:\n"
            "1. El seo_title DEBE empezar exactamente con el nombre del servicio provisto en la información.\n"
            "2. Luego del nombre, añade ' | ' seguido de un beneficio de máximo 3 palabras, seguido de ' - Estética Merce'.\n"
            "3. La seo_description DEBE ser de máximo 155 caracteres.\n\n"
            f"La información para generar el SEO es:\n{request.prompt}"
        )
    elif request.type == "short_description":
        task_instruction = (
            "Eres un copywriter premium. Tu tarea es redactar una Descripción Corta para este servicio. "
            "REGLAS ESTRICTAS:\n"
            "1. Resumen muy breve, atractivo y directo.\n"
            "2. MÁXIMO absoluto de 2 frases o 150 caracteres.\n"
            "3. No te andes con rodeos. Devuelve SOLO texto plano, sin viñetas, sin etiquetas HTML y sin markdown.\n\n"
            f"El tratamiento a describir es:\n{request.prompt}"
        )
    else: # rich_content o default
        task_instruction = (
            "Tu tarea es redactar un Contenido Enriquecido detallado y persuasivo sobre el siguiente tratamiento. "
            "REGLAS DE FORMATO:\n"
            "1. Usa etiquetas HTML limpias (<h3>, <p>, <ul>, <li>, <strong>) para estructurar el texto.\n"
            "2. Estructura recomendada: Introducción impactante, Metodología/Procedimiento y Lista de Beneficios.\n"
            "3. No devuelvas bloques de markdown (no uses ```html).\n\n"
            f"El tratamiento a describir es:\n{request.prompt}"
        )

    full_prompt = system_prompt + "\n\n" + task_instruction

    try:
        if ai_provider == "gemini":
            api_key = settings.gemini_api_key
            if not api_key or '***' in api_key:
                api_key = os.getenv("GEMINI_API_KEY")
            
            if not api_key or len(api_key) < 10 or '***' in api_key:
                raise HTTPException(status_code=400, detail="Clave API de Gemini inválida o no configurada. Por favor, revísala en Ajustes.")
            
            print(f"DEBUG GEMINI TEXT KEY: {api_key[:5]}...{api_key[-4:]}")
            genai.configure(api_key=api_key)
            model_name = settings.gemini_model_text or 'gemini-2.5-flash'
            model = genai.GenerativeModel(model_name)
            
            response = model.generate_content(full_prompt)
            result_text = response.text

        elif ai_provider == "openai":
            api_key = settings.openai_api_key
            if not api_key or '***' in api_key:
                api_key = os.getenv("OPENAI_API_KEY")
            
            if not api_key or len(api_key) < 10 or '***' in api_key:
                raise HTTPException(status_code=400, detail="Clave API de OpenAI inválida o no configurada. Por favor, revísala en Ajustes.")
            
            print(f"DEBUG OPENAI TEXT KEY: {api_key[:5]}...{api_key[-4:]}")
            client = OpenAI(api_key=api_key)
            
            # OpenAI soporta response_format para JSON object
            response_format = {"type": "json_object"} if request.type == "seo" else None
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": task_instruction}
            ]

            model_name = settings.openai_model_text or "gpt-4o-mini"

            # OpenAI expects response_format like {"type": "json_object"}, and setting this requires 'json' in prompt.
            # We already have it in the task_instruction for SEO.
            response = client.chat.completions.create(
                model=model_name,
                messages=messages,
                response_format=response_format if response_format else None
            )
            result_text = response.choices[0].message.content
        else:
            raise HTTPException(status_code=400, detail=f"Proveedor de IA no soportado: {ai_provider}")

        # Limpieza por si Gemini u OpenAI devuelven backticks de markdown:
        if result_text.startswith("```json"):
            result_text = result_text.replace("```json", "").replace("```", "").strip()
        if result_text.startswith("```html"):
            result_text = result_text.replace("```html", "").replace("```", "").strip()

        if request.type == "seo":
            # Validar que es JSON parseable
            try:
                json_data = json.loads(result_text)
                return json_data
            except json.JSONDecodeError:
                raise HTTPException(status_code=500, detail="La IA no devolvió un JSON válido para SEO.")
        else:
            return {"content": result_text}

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error en el proveedor de IA ({ai_provider}): {str(e)}")

def refine_image_prompt(user_prompt: str, shot_type: str, visual_style: str, has_reference: bool = False) -> str:
    """
    Refina el prompt del usuario para estética Commercial Beauty Editorial (Fallback).
    """
    refined = user_prompt
    if shot_type == 'closeup_beauty':
        refined = f"Commercial Beauty Editorial, extreme macro close-up of {refined}. High-end result, flawless skin."
    elif shot_type == 'closeup':
        refined = f"Macro, detailed close-up shot of {refined}. Professional aesthetic."
    elif shot_type == 'scene':
        refined = f"Atmospheric scene of {refined} in a luxury clinic setting."

    style_suffixes = {
        'luxury': "Commercial Beauty style, soft diffused light, 8k resolution, elegant, high-key.",
        'clean': "Pristine clinic aesthetic, bright minimalist background, professional look.",
        'zen': "Radiant spa atmosphere, soft natural light, peaceful."
    }
    suffix = style_suffixes.get(visual_style, style_suffixes['luxury'])
    strict_style = "High-key studio lighting, flawless skin, NO text, NO names, professional editorial photography."
    
    return f"{refined}, {suffix}, {strict_style}"

async def ai_enhance_image_prompt(
    user_prompt: str, 
    shot_type: str, 
    visual_style: str, 
    api_key: str, 
    reference_image: Optional[str] = None,
    reference_type: str = "style"
) -> str:
    """
    Usa Gemini Flash para convertir un prompt básico en un guion técnico de fotografía profesional en inglés.
    """
    genai.configure(api_key=api_key)
    # Usamos Flash 1.5 para velocidad y bajo coste en esta fase de 'pensamiento'
    model = genai.GenerativeModel('gemini-1.5-flash-latest')
    
    system_instruction = (
        "You are an elite Commercial Beauty Photography Director. Your task is to write a highly detailed "
        "TECHNICAL IMAGE PROMPT in ENGLISH for a high-end AI image generator.\n"
        "RULES:\n"
        "1. OUTPUT ONLY THE ENGLISH PROMPT TEXT.\n"
        "2. DO NOT use conversational language. Start directly with the scene description.\n"
        "3. STYLE: 'Quiet Luxury', 2026 aesthetic, high-key studio lighting, flawless skin textures, editorial beauty.\n"
        "4. CAMERA: 'Phase One XF, 80mm lens, f/8, macro detail, sharp focus'.\n"
        "5. SUBJECT: Describe a young, beautiful model, but ensure she looks natural and sophisticated.\n"
    )

    if reference_image:
        if reference_type == "style":
            task = (
                f"Analyze the attached reference image for LIGHTING, COLOR PALETTE, and VIBE only. "
                f"Then, create a NEW scene for this treatment: '{user_prompt}'. "
                f"IMPORTANT: The model MUST be COMPLETELY DIFFERENT from the reference. DO NOT clone the person. "
                f"Describe the scene using the technical style found in the reference."
            )
        else:
            task = (
                f"Analyze the attached reference image for COMPOSITION, POSE, and PLACEMENT of tools/hands. "
                f"Create a NEW scene for this treatment: '{user_prompt}'. "
                f"IMPORTANT: Use the exact same composition and layout as the reference, but the MODEL'S FACE AND IDENTITY must be COMPLETELY NEW. "
                f"Maintain the professional technical setup seen in the image."
            )
        
        # Multimodal request
        b64_data = reference_image
        if "," in b64_data: b64_data = b64_data.split(",")[1]
        
        response = await model.generate_content_async([
            system_instruction + task,
            {"mime_type": "image/jpeg", "data": base64.b64decode(b64_data)}
        ])
    else:
        task = f"Create a technical photography prompt for: '{user_prompt}'. Style: {visual_style}, Shot: {shot_type}."
        response = await model.generate_content_async(system_instruction + task)

    return response.text.strip()

@router.post("/generate-image")
async def generate_image(request: schemas.AIImageGenerationRequest, db: Session = Depends(database.get_db)):
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        raise HTTPException(status_code=500, detail="Configuración de la clínica no encontrada.")

    ai_provider = settings.ai_provider or "gemini"
    api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")

    if not api_key or '***' in api_key:
        api_key = os.getenv("GEMINI_API_KEY")

    if not api_key or len(api_key) < 10:
        raise HTTPException(status_code=400, detail="Clave API no configurada correctamente.")

    logger.info(f"START GENERATION: prompt='{request.prompt[:50]}...', provider='{ai_provider}'")
    
    # PASO 1: El Cerebro (Mejorar y Traducir el prompt usando IA)
    try:
        logger.info("Enhancing prompt with Gemini Flash...")
        refined_prompt = await ai_enhance_image_prompt(
            user_prompt=request.prompt,
            shot_type=request.shot_type,
            visual_style=request.visual_style,
            api_key=api_key,
            reference_image=request.reference_image,
            reference_type=request.reference_type
        )
        logger.info(f"REFINED PROMPT: {refined_prompt[:150]}...")
    except Exception as e:
        logger.error(f"Error in prompt enhancement: {e}")
        # Fallback al refinado manual si la IA de texto falla
        refined_prompt = refine_image_prompt(request.prompt, request.shot_type, request.visual_style, bool(request.reference_image))

    file_bytes = None

    # --- PROVEEDOR: GEMINI (Imagen 3) ---
    if ai_provider == "gemini":
        try:
            genai.configure(api_key=api_key)
            model_name = settings.gemini_model_image or "gemini-3.1-flash-image-preview"
            model = genai.GenerativeModel(model_name)

            # Configuramos filtros de seguridad relajados para contexto estético/médico
            from google.generativeai.types import HarmCategory, HarmBlockThreshold
            safety_settings = {
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_ONLY_HIGH,
            }

            # Preparamos el prompt final inyectando el aspect ratio como instrucción técnica
            aspect_ratio_text = "9:16 aspect ratio, vertical portrait orientation"
            if request.aspect_ratio == "16:9": aspect_ratio_text = "16:9 aspect ratio, cinematic horizontal orientation"
            elif request.aspect_ratio == "1:1": aspect_ratio_text = "1:1 square aspect ratio"

            final_instruction = f"{refined_prompt}. {aspect_ratio_text}. High-end commercial quality, 8k resolution, no text, no logos."

            # PASO 2: Las Manos (Generación de Imagen)
            # IMPORTANTE: NO enviamos la imagen de referencia aquí para evitar clones.
            # El modelo de imagen solo recibe la descripción técnica perfecta en inglés.
            start_time = time.time()
            response = model.generate_content(
                final_instruction,
                safety_settings=safety_settings,
                request_options={"timeout": 600} # Aumentamos a 10 min por si hay cola en Google
            )
            
            gen_duration = time.time() - start_time
            logger.info(f"Gemini Image generated in {gen_duration:.2f}s")

            if not response.candidates or not response.candidates[0].content.parts:
                raise ValueError("La IA bloqueó la generación o devolvió contenido vacío. Revisa el prompt.")

            # Extraer bytes
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data'):
                    file_bytes = part.inline_data.data
                    break
                elif hasattr(part, 'blob'):
                    file_bytes = part.blob.data
                    break

        except Exception as e:
            logger.error(f"Error in Gemini Image Generation: {e}")
            raise HTTPException(status_code=500, detail=f"Error en Nano Banana 2: {str(e)}")

    # --- PROVEEDOR: OPENAI (DALL-E 3) ---
    elif ai_provider == "openai":
        try:
            client = OpenAI(api_key=settings.openai_api_key or os.getenv("OPENAI_API_KEY"))
            model_name = settings.openai_model_image or "dall-e-3"
            response = client.images.generate(
                model=model_name,
                prompt=refined_prompt,
                size="1024x1024",
                quality="hd",
                n=1,
            )
            image_url = response.data[0].url
            resp = requests.get(image_url)
            file_bytes = resp.content
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en OpenAI Image Generation: {e}")

    if not file_bytes:
        raise HTTPException(status_code=500, detail="No se pudo obtener la imagen generada.")

    # Guardado y compresión
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Configuración de Supabase no encontrada")

    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Comprimir a WEBP
        print("DEBUG: Procesando imagen y convirtiendo a WEBP...")
        img_start = time.time()
        image = Image.open(io.BytesIO(file_bytes))
        if image.mode not in ("RGB", "RGBA"):
            if 'transparency' in image.info or image.mode in ('P', 'LA'):
                image = image.convert("RGBA")
            else:
                image = image.convert("RGB")
        
        buffer = io.BytesIO()
        image.save(buffer, format="WEBP", quality=85)
        final_bytes = buffer.getvalue()
        print(f"DEBUG: Imagen comprimida en {time.time() - img_start:.2f}s (Tamaño: {len(final_bytes)} bytes)")
        filename = f"ai_{uuid.uuid4().hex}.webp"
        
        # Subir a Supabase Storage
        upload_start = time.time()
        supabase.storage.from_("media").upload(
            file=final_bytes,
            path=filename,
            file_options={"content-type": "image/webp", "upsert": "true"}
        )
        
        public_url = supabase.storage.from_("media").get_public_url(filename)
        
        # Registrar en la tabla Media
        new_media = models.Media(
            filename=filename,
            url=public_url,
            file_type="image",
            mime_type="image/webp",
            size=len(final_bytes)
        )
        db.add(new_media)
        db.commit()
        
        return {"url": public_url}
        
    except Exception as e:
        logger.error(f"Error saving to Supabase: {e}")
        raise HTTPException(status_code=500, detail=f"Error al guardar la imagen: {e}")

    # Guardado y compresión
    supabase_url = os.environ.get("SUPABASE_URL")
    supabase_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    
    if not supabase_url or not supabase_key:
        raise HTTPException(status_code=500, detail="Configuración de Supabase no encontrada")

    try:
        supabase: Client = create_client(supabase_url, supabase_key)
        
        # Comprimir a WEBP
        print("DEBUG: Procesando imagen y convirtiendo a WEBP...")
        img_start = time.time()
        image = Image.open(io.BytesIO(file_bytes))
        if image.mode not in ("RGB", "RGBA"):
            if 'transparency' in image.info or image.mode in ('P', 'LA'):
                image = image.convert("RGBA")
            else:
                image = image.convert("RGB")
        
        buffer = io.BytesIO()
        image.save(buffer, format="WEBP", quality=85)
        final_bytes = buffer.getvalue()
        print(f"DEBUG: Imagen comprimida en {time.time() - img_start:.2f}s (Tamaño: {len(final_bytes)} bytes)")
        filename = f"ai_{uuid.uuid4().hex}.webp"
        
        # Subir a Supabase Storage
        print(f"DEBUG: Subiendo a Supabase Storage: {filename}...")
        upload_start = time.time()
        supabase.storage.from_("media").upload(
            file=final_bytes,
            path=filename,
            file_options={"content-type": "image/webp", "upsert": "true"}
        )
        
        public_url = supabase.storage.from_("media").get_public_url(filename)
        print(f"DEBUG: Subida completada en {time.time() - upload_start:.2f}s. URL: {public_url}")
        
        # Registrar en la tabla Media (Galería)
        try:
            new_media = models.Media(
                filename=filename,
                url=public_url,
                file_type="image",
                mime_type="image/webp",
                size=len(final_bytes)
            )
            db.add(new_media)
            db.commit()
            logger.info(f"SUCCESS: Image registered in gallery: {public_url}")
        except Exception as e:
            logger.error(f"DB Error: {e}")

        return {"url": public_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la imagen en Supabase: {e}")


