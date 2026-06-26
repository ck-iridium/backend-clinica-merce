import os
import re

# Directorios de origen y destino
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIGEN_DIR = os.path.join(BASE_DIR, "app", "docs", "ayuda")
DESTINO_BASE = os.path.join(BASE_DIR, "..", "frontend", "content", "docs")

TEMAS = ["agenda", "pos", "clientes", "facturas", "bonos", "ajustes", "cms", "gestion"]

def limpiar_md(contenido):
    # Buscar la sección de coordenadas y cortarla
    # Buscamos "## 3. Acciones" o "## 3. Coordenadas"
    pattern = re.compile(r"## 3\..*?$", re.MULTILINE | re.IGNORECASE)
    match = pattern.search(contenido)
    if match:
        contenido = contenido[:match.start()]
    return contenido.strip()

def main():
    print("[MIGRACIÓN] Iniciando limpieza de manuales de IA para el CMS de usuarios...")
    
    for tema in TEMAS:
        filename = f"{tema}.md"
        src_path = os.path.join(ORIGEN_DIR, filename)
        if not os.path.exists(src_path):
            print(f"[ADVERTENCIA] No existe el manual de origen: {src_path}")
            continue
            
        with open(src_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        # Añadir cabecera frontmatter para el CMS
        # El título lo podemos extraer del primer encabezado del archivo
        titulo_match = re.search(r"^# (.*?)$", content, re.MULTILINE)
        titulo = titulo_match.group(1) if titulo_match else f"Manual de {tema.capitalize()}"
        
        # Limpiar
        clean_content = limpiar_md(content)
        
        frontmatter = f"---\ntitle: {titulo}\ndescription: Guía completa y detallada para el uso del módulo de {tema}.\n---\n\n"
        final_content = frontmatter + clean_content
        
        # Escribir en cada idioma para evitar fallos de seed
        for lang in ["es", "en", "fr"]:
            dest_dir = os.path.join(DESTINO_BASE, lang)
            os.makedirs(dest_dir, exist_ok=True)
            
            dest_path = os.path.join(dest_dir, f"ayuda-{tema}.md")
            with open(dest_path, "w", encoding="utf-8") as f:
                f.write(final_content)
                
        print(f"[OK] Sincronizado y limpiado: ayuda-{tema}.md")
        
    print("[MIGRACIÓN] Sincronización de manuales completada con éxito.")

if __name__ == "__main__":
    main()
