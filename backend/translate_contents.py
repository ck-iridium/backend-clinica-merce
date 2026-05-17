import os
import sys
import io
from app.database import SessionLocal
from app import models

def translate_html_content(html_text: str, target_lang: str, db) -> str:
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
        print(f"Error translating to {target_lang}: {e}")
        
    return html_text

def translate_service_content():
    if sys.platform.startswith('win'):
        sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
        sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

    db = SessionLocal()
    try:
        print("=== INICIANDO TRADUCCIÓN BULK DE CONTENT_HTML PARA SERVICIOS ===", flush=True)
        services = db.query(models.Service).all()
        for s in services:
            has_content = bool(s.content_html and s.content_html.strip())
            
            already_translated = False
            if s.translations:
                translations = s.translations
                if isinstance(translations, str):
                    import json
                    try: translations = json.loads(translations)
                    except: translations = {}
                
                en_content = translations.get("en", {}).get("content_html")
                fr_content = translations.get("fr", {}).get("content_html")
                if en_content and fr_content:
                    already_translated = True
            
            if has_content and not already_translated:
                print(f"Traduciendo content_html para el servicio: '{s.name}'...", flush=True)
                try:
                    # Traducir a inglés
                    print("  Traduciendo a Inglés...", flush=True)
                    en_html = translate_html_content(s.content_html, "en", db)
                    
                    # Traducir a francés
                    print("  Traduciendo a Francés...", flush=True)
                    fr_html = translate_html_content(s.content_html, "fr", db)
                    
                    # Fusionar
                    current = s.translations or {}
                    if isinstance(current, str):
                        import json
                        try: current = json.loads(current)
                        except: current = {}
                    
                    if "en" not in current: current["en"] = {}
                    if "fr" not in current: current["fr"] = {}
                    
                    current["en"]["content_html"] = en_html
                    current["fr"]["content_html"] = fr_html
                    
                    import copy
                    from sqlalchemy.orm.attributes import flag_modified
                    s.translations = copy.deepcopy(current)
                    flag_modified(s, "translations")
                    
                    db.add(s)
                    db.commit()
                    print(f"  [SUCCESS] content_html para '{s.name}' guardado correctamente!", flush=True)
                except Exception as e:
                    print(f"  [ERROR] Error al procesar '{s.name}': {e}", flush=True)
            else:
                if not has_content:
                    print(f"Servicio '{s.name}' no tiene content_html. Saltando.", flush=True)
                else:
                    print(f"Servicio '{s.name}' ya tiene traducido content_html. Saltando.", flush=True)
                    
        print("\n=== PROCESO DE TRADUCCIÓN DE CONTENIDOS FINALIZADO ===", flush=True)
    finally:
        db.close()

if __name__ == "__main__":
    translate_service_content()
