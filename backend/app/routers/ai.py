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

@router.post("/generate-image")
def generate_image(request: schemas.AIImageGenerationRequest, db: Session = Depends(database.get_db)):
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        raise HTTPException(status_code=500, detail="Configuración de la clínica no encontrada.")

    ai_provider = settings.ai_provider or "gemini"
    prompt = request.prompt + ". Fotografía realista premium, luz suave, colores neutros, aspecto de clínica de lujo, pieles reales, sin texto ni letras generadas."

    file_bytes = None

    if ai_provider == "openai":
        api_key = settings.openai_api_key
        if not api_key or '***' in api_key:
            api_key = os.getenv("OPENAI_API_KEY")
        
        # Validación estricta
        if not api_key or len(api_key) < 10 or '***' in api_key:
            raise HTTPException(status_code=400, detail="Clave API de OpenAI inválida o no configurada. Por favor, revísala en Ajustes.")
        
        print(f"DEBUG OPENAI KEY: {api_key[:5]}...{api_key[-4:]}")
        client = OpenAI(api_key=api_key)
        
        # Mapeo estricto de aspect ratio para OpenAI
        ar_input = request.aspect_ratio
        size_map = {
            "1:1": "1024x1024",
            "16:9": "1792x1024",
            "9:16": "1024x1792"
        }
        # Extraer el valor puro si viene con texto
        ar_pure = "1:1"
        if "16:9" in ar_input: ar_pure = "16:9"
        elif "9:16" in ar_input: ar_pure = "9:16"
        
        size = size_map.get(ar_pure, "1024x1024")
        model_name = settings.openai_model_image or "dall-e-3"
        
        try:
            response = client.images.generate(
                model=model_name,
                prompt=prompt,
                size=size,
                quality="standard",
                n=1,
            )
            image_url = response.data[0].url
            
            # Descargar imagen
            req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as r:
                file_bytes = r.read()
                
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en OpenAI {model_name}: {e}")
            
    elif ai_provider == "gemini":
        api_key = settings.gemini_api_key
        if not api_key or '***' in api_key:
            api_key = os.getenv("GEMINI_API_KEY")
            
        # Validación estricta
        if not api_key or len(api_key) < 10 or '***' in api_key:
            raise HTTPException(status_code=400, detail="Clave API de Gemini inválida o no configurada. Por favor, revísala en Ajustes.")

        print(f"DEBUG GEMINI KEY: {api_key[:5]}...{api_key[-4:]}")
        
        try:
            # Parseo estricto del Aspect Ratio para Google
            ar_input = request.aspect_ratio
            ar = "1:1"
            if "16:9" in ar_input: ar = "16:9"
            elif "9:16" in ar_input: ar = "9:16"
            elif "1:1" in ar_input: ar = "1:1"

            model_name = settings.gemini_model_image or "imagen-4.0-generate-001"
            # URL EXACTA REST
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:predict?key={api_key}"
            payload = {
                "instances": [
                    {"prompt": prompt}
                ],
                "parameters": {
                    "sampleCount": 1,
                    "aspectRatio": ar
                }
            }
            
            headers = {"Content-Type": "application/json"}
            resp = requests.post(url, json=payload, headers=headers)
            
            if not resp.ok:
                err_data = resp.json()
                print(f"DEBUG GOOGLE ERROR: {err_data}")
                raise ValueError(f"Google API Error: {err_data.get('error', {}).get('message', 'Unknown error')}")
            
            resp_data = resp.json()
            predictions = resp_data.get("predictions", [])
            if not predictions:
                raise ValueError("No se obtuvieron predicciones de Gemini")
                
            base64_img = predictions[0].get("bytesBase64Encoded")
            if not base64_img:
                raise ValueError("Gemini no devolvió la imagen en base64")
                
            file_bytes = base64.b64decode(base64_img)

        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error en Gemini Image Generation: {e}")

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
        image = Image.open(io.BytesIO(file_bytes))
        if image.mode not in ("RGB", "RGBA"):
            if 'transparency' in image.info or image.mode in ('P', 'LA'):
                image = image.convert("RGBA")
            else:
                image = image.convert("RGB")
        
        buffer = io.BytesIO()
        image.save(buffer, format="WEBP", quality=85)
        final_bytes = buffer.getvalue()
        filename = f"ai_{uuid.uuid4().hex}.webp"
        
        # Subir a Supabase Storage
        supabase.storage.from_("media").upload(
            file=final_bytes,
            path=filename,
            file_options={"content-type": "image/webp", "upsert": "true"}
        )
        
        public_url = supabase.storage.from_("media").get_public_url(filename)
        return {"url": public_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la imagen en Supabase: {e}")
