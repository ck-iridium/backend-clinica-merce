import os
import re
import uuid
import markdown
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import backend modules
from app.database import SQLALCHEMY_DATABASE_URL
from app import models

# Define directories
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DOCS_DIR = os.path.join(BASE_DIR, "..", "frontend", "content", "docs")

# Define the exact navigation structure from Next.js content.ts
DOCS_NAVIGATION = [
  {
    "id": "fundamentos-seguridad",
    "title": {
      "es": "Sección 1: Primeros Pasos & Privacidad Blindada",
      "en": "Section 1: Getting Started & Bulletproof Privacy",
      "fr": "Section 1: Premiers Pas pour Votre Centre"
    },
    "subpages": [
      {
        "id": "que-es-probookia",
        "title": {
          "es": "¿Qué es ProBookia?",
          "en": "What is ProBookia?",
          "fr": "Qu'est-ce que ProBookia?"
        }
      },
      {
        "id": "aislamiento-multi-tenant",
        "title": {
          "es": "Seguridad y Privacidad de Datos",
          "en": "Data Security & Isolation",
          "fr": "Sécurité et Confidentialité"
        }
      },
      {
        "id": "vip-impersonation",
        "title": {
          "es": "Soporte Técnico Seguro (Modo Asistencia)",
          "en": "Secure Support (Impersonation Mode)",
          "fr": "Assistance Technique Sécurisée"
        }
      }
    ]
  },
  {
    "id": "gestion-catalogo",
    "title": {
      "es": "Sección 2: Catálogo de Servicios y Consentimientos",
      "en": "Section 2: Service Catalog & Legal Consents",
      "fr": "Section 2: Gestion des Soins & Consentements"
    },
    "subpages": [
      {
        "id": "estructura-catalogo",
        "title": {
          "es": "Organizar tus Categorías y Servicios",
          "en": "Organize Categories & Services",
          "fr": "Organiser Vos Catégories"
        }
      },
      {
        "id": "gestion-masiva",
        "title": {
          "es": "Edición Rápida de Servicios (Data Tables)",
          "en": "Quick Edit Services (Data Tables)",
          "fr": "Gestion Rapide des Soins"
        }
      },
      {
        "id": "consentimientos-base64",
        "title": {
          "es": "Consentimientos y Firmas Digitales",
          "en": "Consent Forms & Digital Signatures",
          "fr": "Formulaires & Signatures"
        }
      },
      {
        "id": "i18n-jsonb",
        "title": {
          "es": "Tu Catálogo en Varios Idiomas",
          "en": "Multi-Language Service Translation",
          "fr": "Traductions Multi-Langues"
        }
      }
    ]
  },
  {
    "id": "motor-reservas",
    "title": {
      "es": "Sección 3: Integración Web y Gestión de Citas",
      "en": "Section 3: Web Embedding & Appointment Rules",
      "fr": "Section 3: Intégration Web & Réservations"
    },
    "subpages": [
      {
        "id": "iframe-widget",
        "title": {
          "es": "Integrar Reservas en tu Página Web",
          "en": "Embed Booking Widget on Your Site",
          "fr": "Intégrer le Module Sur Votre Site"
        }
      },
      {
        "id": "fianzas-stripe",
        "title": {
          "es": "Cobrar Fianzas y Evitar Cancelaciones",
          "en": "Charge Booking Deposits & Escrow",
          "fr": "Acomptes de Garantie & Stripe"
        }
      },
      {
        "id": "cron-purga",
        "title": {
          "es": "Liberación de Citas No Confirmadas",
          "en": "Unconfirmed Booking Slot Cleanup",
          "fr": "Liberación des Créneaux Orphelins"
        }
      }
    ]
  },
  {
    "id": "configuracion-operativa",
    "title": {
      "es": "Sección 4: Ajustes del Negocio y Horarios",
      "en": "Section 4: Operating Hours & Business Setup",
      "fr": "Section 4: Horaires & Paramètres d'Établissement"
    },
    "subpages": [
      {
        "id": "plan-suscripcion",
        "title": {
          "es": "Planes de Suscripción",
          "en": "Subscription Tiers",
          "fr": "Forfaits & Abonnements"
        }
      },
      {
        "id": "perfil-empresa",
        "title": {
          "es": "Perfil de la Empresa",
          "en": "Company Profile Setup",
          "fr": "Profil de l'Établissement"
        }
      },
      {
        "id": "agenda-horarios",
        "title": {
          "es": "Configurar Horarios y Descansos",
          "en": "Configure Hours & Breaks",
          "fr": "Paramétrer Horaires & Pauses"
        }
      },
      {
        "id": "bloqueos-festivos",
        "title": {
          "es": "Bloqueo de Citas y Horario de Antelación",
          "en": "Booking Blockouts & Lead Time",
          "fr": "Blocages & Délai d'Anticipation"
        }
      }
    ]
  },
  {
    "id": "cobertura-pagos",
    "title": {
      "es": "Sección 5: Servicios a Domicilio y Cobros",
      "en": "Section 5: Home Services & Stripe Connect",
      "fr": "Section 5: Soins à Domicile & Stripe Connect"
    },
    "subpages": [
      {
        "id": "cobertura-domicilio",
        "title": {
          "es": "Servicios a Domicilio y Cobertura",
          "en": "Mobile & Home Visit Services",
          "fr": "Soins à Domicile & Déplacements"
        }
      },
      {
        "id": "pagos-stripe-connect",
        "title": {
          "es": "Configurar Cobros con Stripe Connect",
          "en": "Link Payments with Stripe Connect",
          "fr": "Configurer Stripe Connect"
        }
      }
    ]
  },
  {
    "id": "branding-experiencia",
    "title": {
      "es": "Sección 6: Personalizar tu Portal de Reservas",
      "en": "Section 6: Design & Branding Settings",
      "fr": "Section 6: Personnalisation de Votre Image"
    },
    "subpages": [
      {
        "id": "branding-favicon",
        "title": {
          "es": "Logotipos, Paletas de Colores y Fuentes",
          "en": "Logos, Colors & Premium Fonts",
          "fr": "Logos, Couleurs & Polices"
        }
      },
      {
        "id": "layouts-reserva",
        "title": {
          "es": "Diseños del Catálogo (Grilla vs Lista)",
          "en": "Booking Layouts (Grid vs Row List)",
          "fr": "Gabarits de Grille & Liste"
        }
      }
    ]
  },
  {
    "id": "seguridad-api-ia",
    "title": {
      "es": "Sección 7: Inteligencia Artificial y Visibilidad Web",
      "en": "Section 7: AI Assistants & SEO Settings",
      "fr": "Section 7: Assistants IA & SEO"
    },
    "subpages": [
      {
        "id": "api-keys-ia",
        "title": {
          "es": "Conectar tu propia Inteligencia Artificial",
          "en": "Link Your Private AI API Keys",
          "fr": "Connecter Votre Propre Clé IA"
        }
      },
      {
        "id": "seo-noindex",
        "title": {
          "es": "Ocultar tu Web de los Buscadores (Privacidad)",
          "en": "Hide Booking Site from Google (NoIndex)",
          "fr": "Masquer Votre Site du Référencement"
        }
      },
      {
        "id": "galeria-privada-sedes",
        "title": {
          "es": "Multi-Sede y Archivos Seguros",
          "en": "Multi-Location Centers & Secure Media",
          "fr": "Multi-Centres & Stockage Sécurisé"
        }
      },
      {
        "id": "agentes-ia-webmaster",
        "title": {
          "es": "Asistentes Inteligentes para Gestionar tu Web",
          "en": "Autonomous AI Webmaster & Global Copilot",
          "fr": "Assistants IA Autonomes Webmaster & Copilote"
        }
      }
    ]
  }
]

def parse_markdown_file(lang, slug):
    """
    Reads a physical markdown file, strips frontmatter, and converts it to HTML.
    """
    file_path = os.path.join(DOCS_DIR, lang, f"{slug}.md")
    if not os.path.exists(file_path):
        return None
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
    
    # Strip Frontmatter (text between first and second '---')
    pattern = re.compile(r"^---\s*\n(.*?)\n---\s*\n", re.DOTALL)
    match = pattern.match(content)
    if match:
        markdown_body = content[match.end():]
    else:
        markdown_body = content
        
    # Convert clean markdown to clean HTML
    html_content = markdown.markdown(markdown_body)
    return html_content

def seed_database():
    print("[SEED] Iniciando el sembrado de documentacion en la Base de Datos...")
    
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # 1. Limpiar tablas existentes para evitar duplicaciones
        print("[SEED] Limpiando tablas antiguas de doc_pages y doc_sections...")
        db.query(models.DocPage).delete()
        db.query(models.DocSection).delete()
        db.commit()
        
        # 2. Iterar secciones y sembrar
        for s_idx, sec_data in enumerate(DOCS_NAVIGATION):
            section_id = str(uuid.uuid4())
            db_section = models.DocSection(
                id=section_id,
                slug=sec_data["id"],
                title=sec_data["title"],
                position=s_idx
            )
            db.add(db_section)
            db.flush() # Guardar temporalmente para que esté disponible la sección
            
            print(f"[SEED] Seccion agregada: {sec_data['title']['es']} (Slug: {sec_data['id']})")
            
            # 3. Iterar y sembrar páginas de la sección
            for p_idx, page_data in enumerate(sec_data["subpages"]):
                page_id = str(uuid.uuid4())
                slug = page_data["id"]
                
                # Cargar el HTML traducido para cada idioma
                content_i18n = {}
                for lang in ["es", "en", "fr"]:
                    html = parse_markdown_file(lang, slug)
                    # Fallback al español si no existe archivo de traducción física
                    if not html:
                        html = parse_markdown_file("es", slug)
                    content_i18n[lang] = html or "<p>Contenido no disponible.</p>"
                
                db_page = models.DocPage(
                    id=page_id,
                    section_id=section_id,
                    slug=slug,
                    title=page_data["title"],
                    content=content_i18n,
                    position=p_idx
                )
                db.add(db_page)
                print(f"[SEED]   Pagina agregada: {page_data['title']['es']} (Slug: {slug})")
                
        db.commit()
        print("[SEED] Sembrado de documentacion completado exitosamente con 22 guias activas!")
        
    except Exception as e:
        db.rollback()
        print(f"[SEED] Error durante el sembrado de la base de datos: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
