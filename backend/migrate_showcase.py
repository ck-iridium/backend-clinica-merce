import os
import sys

# Añadir el directorio actual al path para importar módulos de la app
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, SessionLocal, Base
from app.models import LandingMarketingSettings, LandingShowcaseSector

def run_migration():
    print("[MIGRATION] Iniciando migracion para el modulo Showcase y Landing CMS...")
    
    # 1. Crear las tablas si no existen
    Base.metadata.create_all(bind=engine)
    print("[MIGRATION] Tablas landing_marketing_settings y landing_showcase_sectors verificadas/creadas.")

    # 2. Conectar sesión de Base de Datos para Pre-Seed
    db = SessionLocal()
    try:
        # Pre-seed de la configuración global de Marketing Hero
        settings = db.query(LandingMarketingSettings).filter(LandingMarketingSettings.id == "global").first()
        if not settings:
            print("[SEED] Creando configuracion global del Hero por defecto...")
            settings = LandingMarketingSettings(
                id="global",
                hero_title="La elegancia de tu negocio traducida en un SaaS de Lujo",
                hero_subtitle="Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes. Agendas fluidas, expedientes médicos asimétricos y reservas de doble opt-in integradas en una experiencia sublime."
            )
            db.add(settings)
            db.commit()
            print("[SEED] Configuracion del Hero inicializada.")
        else:
            print("[SEED] Configuracion del Hero ya existente en la base de datos.")

        # Pre-seed de los 4 sectores iniciales
        existing_sectors_count = db.query(LandingShowcaseSector).count()
        if existing_sectors_count == 0:
            print("[SEED] Sembrando sectores iniciales con videos conceptuales en bucle...")
            initial_sectors = [
                LandingShowcaseSector(
                    title="Clínicas & Wellness",
                    slug="clinicas",
                    badge_text="Clínicas Estéticas",
                    video_url="https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patients-face-with-magnifier-40545-large.mp4",
                    image_url="",
                    order_index=0
                ),
                LandingShowcaseSector(
                    title="Barberías Premium",
                    slug="barberias",
                    badge_text="Barberías Selectas",
                    video_url="https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-man-with-a-razor-41223-large.mp4",
                    image_url="",
                    order_index=1
                ),
                LandingShowcaseSector(
                    title="Consultorios Dentales",
                    slug="dentistas",
                    badge_text="Odontología Avanzada",
                    video_url="https://assets.mixkit.co/videos/preview/mixkit-dentist-adjusting-a-surgical-light-in-clinic-40549-large.mp4",
                    image_url="",
                    order_index=2
                ),
                LandingShowcaseSector(
                    title="Salones de Belleza",
                    slug="peluquerias",
                    badge_text="Salones de Alta Costura",
                    video_url="https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4",
                    image_url="",
                    order_index=3
                )
            ]
            db.add_all(initial_sectors)
            db.commit()
            print("[SEED] 4 sectores iniciales sembrados con exito.")
        else:
            print(f"[SEED] Ya existen {existing_sectors_count} sectores registrados en la base de datos.")
            
        print("[SUCCESS] Migracion y siembra completadas con exito!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Error al ejecutar el pre-seed: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    run_migration()
