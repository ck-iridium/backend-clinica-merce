import os
import logging

logger = logging.getLogger("ai_agent_tools_help")

def consultar_manual_ayuda(tema: str) -> str:
    """
    Consulta los manuales técnicos paso a paso (RAG) de la clínica para obtener instrucciones 
    detalladas sobre el uso de la aplicación, coordenadas de selectores CSS (IDs) para guiar 
    al usuario, y restricciones de seguridad por rol (RBAC).

    Parámetros:
    - tema: Nombre del tema o módulo a consultar. Los valores válidos son:
      'agenda' (citas, minicalendario, bloqueos),
      'pos' (venta rápida, TPV, cobros),
      'clientes' (fichas clínicas, consentimiento informado, firma digital, bonos de cliente),
      'facturas' (visor de folio A4, exportaciones PDF/CSV, control de estado, sello digital),
      'bonos' (dirección de bonos, catálogo, deudas de bonos),
      'ajustes' (branding, Stripe, configuración general, plantilla de consentimiento, diseño de reservas),
      'cms' (editor web, páginas personalizadas, portada de inicio, menú de navegación),
      'gestion' (equipo, horarios, sedes, servicios y mi horario).
    """
    # Limpiamos el nombre del tema
    tema_clean = tema.lower().strip().replace(".md", "")
    
    # Mapeo de sinónimos comunes para robustez
    sinonimos = {
        "calendar": "agenda",
        "calendario": "agenda",
        "citas": "agenda",
        "venta": "pos",
        "tpv": "pos",
        "cobros": "pos",
        "cliente": "clientes",
        "ficha": "clientes",
        "factura": "facturas",
        "facturacion": "facturas",
        "facturación": "facturas",
        "bono": "bonos",
        "vouchers": "bonos",
        "settings": "ajustes",
        "configuracion": "ajustes",
        "configuración": "ajustes",
        "vacaciones": "ajustes",
        "festivos": "ajustes",
        "ausencias": "ajustes",
        "booking_ui": "ajustes",
        "diseno_reservas": "ajustes",
        "diseno-reservas": "ajustes",
        "diseño-reservas": "ajustes",
        "cms": "cms",
        "paginas": "cms",
        "páginas": "cms",
        "pagina": "cms",
        "página": "cms",
        "editor": "cms",
        "inicio": "cms",
        "portada": "cms",
        "web": "cms",
        "equipo": "gestion",
        "sedes": "gestion",
        "servicios": "gestion",
        "servicio": "gestion",
        "tratamiento": "gestion",
        "tratamientos": "gestion",
        "fianza-servicio": "gestion",
        "fianza_servicio": "gestion",
        "color-servicio": "gestion",
        "color_servicio": "gestion",
        "horarios": "gestion",
        "mi-horario": "gestion",
        "mi_horario": "gestion",
        # Perfil y Notificaciones Personales (Sinónimos Compuestos Específicos)
        "foto-perfil": "ajustes",
        "foto_perfil": "ajustes",
        "foto-de-perfil": "ajustes",
        "foto-de-mi-perfil": "ajustes",
        "avatar-personal": "ajustes",
        "notificaciones-personales": "ajustes",
        "notificaciones_personales": "ajustes",
        "mi-cuenta": "ajustes",
        "mi_cuenta": "ajustes",
        "mi-perfil": "ajustes",
        "mi_perfil": "ajustes",
        "perfil-digital": "ajustes",
        "perfil_digital": "ajustes",
        "email-personal": "ajustes",
        "email_personal": "ajustes",
        "correo-personal": "ajustes",
        "correo_personal": "ajustes",
        "cambiar-usuario": "ajustes",
        "cambiar_usuario": "ajustes",
    }
    
    if tema_clean in sinonimos:
        tema_clean = sinonimos[tema_clean]
 
    temas_validos = ["agenda", "pos", "clientes", "facturas", "bonos", "ajustes", "cms", "gestion"]
    if tema_clean not in temas_validos:
        return (
            f"El tema '{tema}' no es válido. Los temas disponibles en los manuales de ayuda son: "
            f"{', '.join(temas_validos)}."
        )

    # Determinar la ruta relativa al archivo actual
    current_dir = os.path.dirname(os.path.abspath(__file__))
    # La estructura es backend/app/services/ai/tools/help.py
    # La carpeta docs es backend/app/docs/ayuda/
    docs_path = os.path.abspath(os.path.join(current_dir, "..", "..", "..", "docs", "ayuda", f"{tema_clean}.md"))

    if not os.path.exists(docs_path):
        # Fallback alternativo buscando desde el directorio actual del proceso
        docs_path = os.path.abspath(os.path.join("app", "docs", "ayuda", f"{tema_clean}.md"))
        if not os.path.exists(docs_path):
            docs_path = os.path.abspath(os.path.join("backend", "app", "docs", "ayuda", f"{tema_clean}.md"))

    if not os.path.exists(docs_path):
        return f"Error: No se encontró el manual de ayuda para '{tema_clean}' en la ruta especificada."

    try:
        with open(docs_path, "r", encoding="utf-8") as f:
            content = f.read()
        return content
    except Exception as e:
        logger.error(f"Error al leer el manual de ayuda {tema_clean}: {e}")
        return f"Error al leer el manual de ayuda de {tema_clean}: {str(e)}"
