import os
import json
import logging
from sqlalchemy.orm import Session
from .. import models

# Configurar logging
logger = logging.getLogger("translator")

def translate_fields(fields: dict, db: Session) -> dict:
    """
    Traduce genéricamente un diccionario de campos en español a inglés (en) y francés (fr)
    utilizando el proveedor de IA configurado en la clínica (Gemini o OpenAI).
    Devuelve un diccionario estructurado:
    {
      "en": { "campo1": "traducción", ... },
      "fr": { "campo1": "traducción", ... }
    }
    """
    # Filtrar solo valores que sean strings y no estén vacíos
    to_translate = {k: v for k, v in fields.items() if isinstance(v, str) and v.strip()}
    if not to_translate:
        return {}

    # Obtener configuración de la clínica
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        logger.warning("No se encontró la configuración de la clínica para la API Key de IA.")
        return {}

    ai_provider = settings.ai_provider or "gemini"
    
    # Construir Prompt de Lujo
    prompt = (
        "You are a professional luxury translator for a high-end wellness & aesthetic clinic. "
        "Translate the following Spanish dictionary of text values into English (en) and French (fr).\n"
        "Maintain a sophisticated, elegant, and sutil tone ('Quiet Luxury').\n"
        "If any value contains HTML tags (such as <p>, <h2>, <strong>, etc.), keep the HTML tags and structure EXACTLY as they are in the input, translating only the actual text content inside them.\n"
        "Return STRICTLY a JSON object containing two keys: 'en' and 'fr', each with the exact same keys as the input.\n"
        "Do not include any intro, explanation, or markdown code block markers (like ```json). Just the raw JSON object.\n\n"
        f"Input: {json.dumps(to_translate, ensure_ascii=False)}"
    )

    result_text = None

    try:
        if ai_provider == "gemini":
            import google.generativeai as genai
            api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
            if not api_key:
                logger.warning("Gemini API Key no configurada.")
                return {}
            
            genai.configure(api_key=api_key)
            # Usamos gemini-2.5-flash para compatibilidad de última generación activa en 2026
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            result_text = response.text
            
        elif ai_provider == "openai":
            from openai import OpenAI
            api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                logger.warning("OpenAI API Key no configurada.")
                return {}
                
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=settings.openai_model_text or "gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a precise JSON assistant for translations."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            result_text = response.choices[0].message.content

        if not result_text:
            logger.error("No se recibió respuesta del proveedor de IA.")
            return {}

        # Limpiar posibles marcadores de markdown si la IA no obedeció
        cleaned_text = result_text.strip()
        if cleaned_text.startswith("```"):
            # Quitar primera línea (ej. ```json)
            lines = cleaned_text.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()

        # Parsear JSON
        translations = json.loads(cleaned_text)
        logger.info("✅ Traducciones generadas con éxito por la IA.")
        return translations

    except Exception as e:
        logger.error(f"❌ Error durante la auto-traducción por IA: {e}")
        return {}

def translate_html_content(html_text: str, target_lang: str, db: Session) -> str:
    """
    Traduce contenido HTML manteniendo intactas todas las etiquetas, clases y estructuras de diseño
    utilizando el proveedor de IA configurado en la clínica (Gemini o OpenAI).
    """
    if not html_text or not html_text.strip():
        return html_text

    # Obtener configuración de la clínica
    settings = db.query(models.ClinicSettings).first()
    if not settings:
        return html_text

    ai_provider = settings.ai_provider or "gemini"
    lang_name = "English" if target_lang == "en" else "French"
    
    prompt = (
        f"You are a professional luxury translator for a high-end wellness & aesthetic clinic.\n"
        f"Translate the following Spanish HTML content into {lang_name}.\n"
        f"Maintain a sophisticated, elegant, and subtle tone ('Quiet Luxury').\n"
        f"Keep all HTML tags, structure, classes, and attributes EXACTLY as they are in the input. Translate ONLY the actual text content inside the HTML elements.\n"
        f"Do not translate or alter HTML attribute names or values.\n"
        f"Return ONLY the translated HTML content without any markdown blocks, intro, explanation, or code indicators. Just the raw HTML.\n\n"
        f"Input HTML:\n{html_text}"
    )

    try:
        result_text = None
        if ai_provider == "gemini":
            import google.generativeai as genai
            api_key = settings.gemini_api_key or os.getenv("GEMINI_API_KEY")
            if not api_key:
                return html_text
            
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel('gemini-2.5-flash')
            response = model.generate_content(prompt)
            result_text = response.text
            
        elif ai_provider == "openai":
            from openai import OpenAI
            api_key = settings.openai_api_key or os.getenv("OPENAI_API_KEY")
            if not api_key:
                return html_text
                
            client = OpenAI(api_key=api_key)
            response = client.chat.completions.create(
                model=settings.openai_model_text or "gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "You are a professional HTML translator."},
                    {"role": "user", "content": prompt}
                ]
            )
            result_text = response.choices[0].message.content

        if result_text:
            cleaned = result_text.strip()
            if cleaned.startswith("```"):
                lines = cleaned.splitlines()
                if lines[0].startswith("```"):
                    lines = lines[1:]
                if lines and lines[-1].startswith("```"):
                    lines = lines[:-1]
                cleaned = "\n".join(lines).strip()
            return cleaned
            
    except Exception as e:
        logger.error(f"❌ Error al traducir HTML a {target_lang}: {e}")
        
    return html_text

