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

def refine_image_prompt(user_prompt: str, shot_type: str, visual_style: str) -> str:
    """
    Refina el prompt del usuario para estética Commercial Beauty Editorial.
    """
    refined = user_prompt
    
    # 1. Prefijos de Toma
    if shot_type == 'closeup_beauty':
        refined = f"Commercial Beauty Editorial, extreme macro close-up of {refined}. High-end aesthetic clinic result, flawless skin texture, radiant glowing skin."
    elif shot_type == 'closeup':
        refined = f"Macro, detailed close-up shot of {refined}. Professional medical aesthetic, clean and precise."
    elif shot_type == 'scene':
        refined = f"Atmospheric scene of {refined} in a luxury clinic setting. High-key studio lighting, bright and radiant environment."

    # 2. Sufijos de Estilo
    style_suffixes = {
        'luxury': "Commercial Beauty style, dewy skin finish, soft diffused light, elimination of deep shadows, 8k resolution, elegant, high-key.",
        'clean': "Pristine clinic aesthetic, bright minimalist background, neutral high-end lighting, professional medical editorial look.",
        'zen': "Radiant spa atmosphere, soft glowing natural light, peaceful, dewy skin texture, harmonic color palette."
    }
    
    suffix = style_suffixes.get(visual_style, style_suffixes['luxury'])
    
    # 3. Prompt de Estilo Estricto (Inyectado siempre)
    strict_style = "High-key studio lighting, flawless skin texture, radiant glowing skin, NO faces, NO text, NO names, professional editorial photography."
    
    return f"{refined}, {suffix}, {strict_style}"

@router.post("/generate-image")
def generate_image(request: schemas.AIImageGenerationRequest, db: Session = Depends(database.get_db)):
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        raise HTTPException(status_code=500, detail="Configuración de la clínica no encontrada.")

    ai_provider = settings.ai_provider or "gemini"
    
    # Refinar el prompt base
    refined_prompt = refine_image_prompt(request.prompt, request.shot_type, request.visual_style)
    
    # Preparar sufijo de estilo y filtros adicionales
    style_suffix = f", {request.shot_type}, style: {request.visual_style}, luxury editorial photography, 8k, highly detailed."
    if request.exclude_text:
        style_suffix += " ZERO TEXT, NO letters, NO words, NO characters, NO logos, NO watermarks. Pure visual composition."
    
    # Añadir sufijo al prompt refinado para proveedores que no usan multimodal
    refined_prompt += style_suffix
    
    print(f"DEBUG REFINED PROMPT: {refined_prompt}")

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

        if not api_key or len(api_key) < 10 or '***' in api_key:
            raise HTTPException(status_code=400, detail="Clave API de OpenAI inválida o no configurada.")

        try:
            client = OpenAI(api_key=api_key)
            model_name = settings.openai_model_image or "dall-e-3"
            
            # OpenAI no soporta image-to-image nativo en DALL-E 3 vía API
            # Solo enviamos el texto refinado
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

    # --- PROVEEDOR: GEMINI ---
    elif ai_provider == "gemini":
        api_key = settings.gemini_api_key
        if not api_key or '***' in api_key:
            api_key = os.getenv("GEMINI_API_KEY")
            
        if not api_key or len(api_key) < 10 or '***' in api_key:
            raise HTTPException(status_code=400, detail="Clave API de Gemini inválida o no configurada.")

        try:
            # Configurar modelo multimodal (Nano Banana 2 / Gemini 3.1 Flash Image)
            genai.configure(api_key=api_key)
            model_name = settings.gemini_model_image or "gemini-3.1-flash-image-preview"
            model = genai.GenerativeModel(model_name)

            # Preparar partes del contenido
            prompt_parts = []
            
            # 1. Prompt de texto refinado
            base_prompt = refined_prompt
            if request.reference_image:
                if request.reference_type == "style":
                    # Instrucción de Estilo (Evitar clonación)
                    base_prompt = (
                        f"Crea una imagen comercial premium usando esta referencia ÚNICAMENTE para la iluminación, paleta de colores y 'vibe' estético. "
                        f"IMPORTANTE: Genera una modelo COMPLETAMENTE DIFERENTE a la de la foto. NO clones a la persona. "
                        f"El tratamiento a mostrar es: {request.prompt}. {style_suffix} Estética 'Quiet Luxury'."
                    )
                else:
                    # Instrucción de Composición (Fiel a la referencia)
                    base_prompt = (
                        f"Crea una imagen basada exactamente en la composición, pose y estructura de esta referencia. "
                        f"El tratamiento a mostrar es: {request.prompt}. {style_suffix} Mantén la fidelidad estructural."
                    )
            
            prompt_parts.append(base_prompt)

            # 2. Imagen de referencia (si existe)
            if request.reference_image:
                b64_data = request.reference_image
                if "," in b64_data:
                    b64_data = b64_data.split(",")[1]
                
                prompt_parts.append({
                    "mime_type": "image/jpeg",
                    "data": base64.b64decode(b64_data)
                })

            # Inyectar la proporción en el prompt final como instrucción de texto
            # ya que el SDK parece no reconocer 'aspect_ratio' en GenerationConfig aún
            final_prompt = f"{base_prompt}. Format: 9:16 aspect ratio, vertical mobile orientation."
            prompt_parts[0] = final_prompt

            # Generar contenido con timeout de seguridad ampliado (180s)
            response = model.generate_content(
                prompt_parts,
                request_options={"timeout": 180000} # En milisegundos
            )
            
            # DEBUG: Imprimir estructura para entender qué devuelve Nano Banana 2
            print(f"DEBUG NANO BANANA RESPONSE: {response}")
            
            if not response.candidates or not response.candidates[0].content.parts:
                # Verificar si hay un mensaje de error o bloqueo de seguridad
                if hasattr(response, 'prompt_feedback') and response.prompt_feedback:
                    print(f"DEBUG PROMPT FEEDBACK: {response.prompt_feedback}")
                raise ValueError("La IA no devolvió contenido. Posible bloqueo de seguridad o prompt inválido.")
            
            # Revisar todas las partes para depuración
            for i, part in enumerate(response.candidates[0].content.parts):
                print(f"PART {i} TYPE: {type(part)}")
                if hasattr(part, 'text'):
                    print(f"PART {i} TEXT: {part.text[:100]}...")

            # Buscar la parte que contiene los bytes de la imagen
            # En el SDK de Google, suele ser un objeto con 'inline_data' o directamente 'data' si es un Blob
            file_bytes = None
            for part in response.candidates[0].content.parts:
                # Caso 1: inline_data (estándar en SDK moderno)
                if hasattr(part, 'inline_data') and part.inline_data:
                    file_bytes = part.inline_data.data
                    break
                # Caso 2: blob (algunas versiones/modelos)
                if hasattr(part, 'blob') and part.blob:
                    file_bytes = part.blob.data
                    break
                # Caso 3: Atributo data directo (raro pero posible)
                if hasattr(part, 'data') and part.data:
                    file_bytes = part.data
                    break

            if not file_bytes:
                # Si no hay bytes pero hay texto, el modelo nos está hablando en lugar de generar
                if hasattr(response.candidates[0].content.parts[0], 'text'):
                    text_content = response.candidates[0].content.parts[0].text
                    raise ValueError(f"El modelo devolvió texto en lugar de una imagen: {text_content[:200]}")
                raise ValueError("No se encontraron datos binarios de imagen en la respuesta de Nano Banana 2.")

        except Exception as e:
            import traceback
            traceback.print_exc()
            raise HTTPException(status_code=500, detail=f"Error en Nano Banana 2 (Gemini 3.1): {str(e)}")

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
            print(f"✅ Imagen registrada en la galería: {public_url}")
        except Exception as e:
            print(f"⚠️ Error al registrar imagen en galería: {e}")

        return {"url": public_url}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al guardar la imagen en Supabase: {e}")


