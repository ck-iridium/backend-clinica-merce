import os
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, database, models
import google.generativeai as genai
from openai import OpenAI

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
    else:
        task_instruction = (
            "Tu tarea es redactar una descripción persuasiva y detallada sobre el siguiente servicio/tratamiento. "
            "Devuelve el texto formateado en HTML limpio (usando <p>, <ul>, <li>, <strong>, <h2> si aplica), sin envolverlo en bloques markdown (no uses ```html).\n"
            f"El tratamiento a describir es:\n{request.prompt}"
        )

    full_prompt = system_prompt + "\n\n" + task_instruction

    try:
        if ai_provider == "gemini":
            api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=400, detail="Falta la API Key de Gemini. Configúrala en Ajustes > Avanzado.")
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash') # Default fast model
            
            response = model.generate_content(full_prompt)
            result_text = response.text

        elif ai_provider == "openai":
            api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                raise HTTPException(status_code=400, detail="Falta la API Key de OpenAI. Configúrala en Ajustes > Avanzado.")
            
            client = OpenAI(api_key=api_key)
            
            # OpenAI soporta response_format para JSON object
            response_format = {"type": "json_object"} if request.type == "seo" else None
            
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": task_instruction}
            ]

            # OpenAI expects response_format like {"type": "json_object"}, and setting this requires 'json' in prompt.
            # We already have it in the task_instruction for SEO.
            response = client.chat.completions.create(
                model="gpt-4o-mini",
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
