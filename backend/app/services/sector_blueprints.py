import os
from typing import Dict, Any, List

SUPABASE_URL = os.environ.get("SUPABASE_URL", "https://ypimdbkiuguiszaddzaj.supabase.co")
STORAGE_BASE = f"{SUPABASE_URL}/storage/v1/object/public/media/blueprints"

SECTOR_ALIASES = {
    # Nombres visuales del onboarding clásico
    "medicina estética": "clinical",
    "clínicas de salud": "clinical",
    "medicina y clínica de salud": "clinical",
    "estética y bienestar": "beauty",
    "estética, belleza y wellness": "beauty",
    "salones y barberías": "barber",
    "barbería y salón de peluquería": "barber",
    # Nuevos sectores
    "veterinaria y cuidados": "veterinary",
    "veterinaria": "veterinary",
    "automoción y mecánica": "automotive",
    "automoción": "automotive",
    "servicios a domicilio": "home_services",
    "consultoría y asesoría": "professional",
    "consultoría": "professional",
    "general / otros servicios": "general",
    "general": "general"
}

BLUEPRINTS: Dict[str, Dict[str, Any]] = {
    "clinical": {
        "id": "clinical",
        "display_name": "Medicina y Clínica de Salud",
        "badge": "Medicina de Alta Precisión",
        "branding": {
            "branding_font_headings": "Playfair Display",
            "branding_font_body": "Inter",
            "theme_palette": "clean-medical",
            "accent_color": "#D4AF37",
            "accent_color_primary": "#D4AF37",
            "accent_color_secondary": "#1C1917"
        },
        "category": {
            "name": "Protocolos Médicos y Diagnósticos",
            "slug": "protocolos-medicos",
            "description": "Procedimientos clínicos avanzados realizados bajo estrictos estándares de seguridad y rigor facultativo."
        },
        "site_content": {
            "hero_title": "Tu salud y bienestar en las mejores manos en {clinic_name}",
            "hero_subtitle": "Medicina personalizada, diagnósticos de precisión y tratamientos integrales diseñados para mejorar tu calidad de vida.",
            "hero_image_url": f"{STORAGE_BASE}/clinical/hero.jpg",
            "hero_button_text": "Reservar Cita",
            "hero_button_link": "/reservar",
            "about_title": "Sobre {clinic_name}",
            "about_text": "En {clinic_name} combinamos la experiencia de especialistas de primer nivel con aparatología médica de vanguardia. Nuestro compromiso es ofrecerte una atención cercana, honesta y guiada por la evidencia científica para que alcances tu bienestar óptimo.",
            "about_image_url": f"{STORAGE_BASE}/clinical/about.jpg",
            "cta_title": "¿Listo para cuidar de tu salud?",
            "cta_subtitle": "Pide tu cita médica o diagnóstica hoy mismo y descubre una atención hecha a tu medida.",
            "cta_button_text": "Pedir Cita Online",
            "cta_button_link": "/reservar"
        },
        "services": [
            {
                "name": "Valoración Médica Inicial & Diagnóstico Completo",
                "slug": "valoracion-medica-inicial",
                "duration_minutes": 45,
                "price": 60.00,
                "description": "Evaluación clínica exhaustiva, revisión de historial médico y diseño de un plan de tratamiento individualizado.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/clinical/service-1.jpg"
            },
            {
                "name": "Tratamiento Facial Médico de Precisión",
                "slug": "tratamiento-facial-medico",
                "duration_minutes": 40,
                "price": 120.00,
                "description": "Protocolo médico regenerativo para restaurar la densidad, luminosidad y elasticidad de la piel con técnicas micro-invasivas.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/clinical/service-2.jpg"
            },
            {
                "name": "Sesión de Fisioterapia y Terapia Manual Avanzada",
                "slug": "fisioterapia-avanzada",
                "duration_minutes": 50,
                "price": 55.00,
                "description": "Alivio y rehabilitación funcional de lesiones musculoesqueléticas mediante terapia biomecánica personalizada.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/clinical/service-3.jpg"
            },
            {
                "name": "Consulta de Nutrición Clínica y Bioimpedancia",
                "slug": "nutricion-clinica",
                "duration_minutes": 45,
                "price": 50.00,
                "description": "Estudio de composición corporal y pauta alimentaria estratégica orientada a la energía, longevidad y salud metabólica.",
                "is_featured": False,
                "image_url": f"{STORAGE_BASE}/clinical/service-4.jpg"
            }
        ]
    },
    "beauty": {
        "id": "beauty",
        "display_name": "Estética, Belleza y Wellness",
        "badge": "Quiet Luxury & Ritual Sensorial",
        "branding": {
            "branding_font_headings": "Playfair Display",
            "branding_font_body": "Inter",
            "theme_palette": "charcoal-gold",
            "accent_color": "#D4AF37",
            "accent_color_primary": "#D4AF37",
            "accent_color_secondary": "#1C1917"
        },
        "category": {
            "name": "Rituales de Estética y Bienestar",
            "slug": "rituales-estetica",
            "description": "Experiencias sensitivas de alta cosmética y aparatología no invasiva concebidas para restaurar tu armonía natural."
        },
        "site_content": {
            "hero_title": "El arte del cuidado personal en {clinic_name}",
            "hero_subtitle": "Tratamientos exclusivos, cosmética de alta gama y un santuario de relajación diseñado para realzar tu belleza auténtica.",
            "hero_image_url": f"{STORAGE_BASE}/beauty/hero.jpg",
            "hero_button_text": "Reservar Experiencia",
            "hero_button_link": "/reservar",
            "about_title": "Sobre {clinic_name}",
            "about_text": "Concebimos la belleza como una experiencia de calma y bienestar interior. En {clinic_name} cada protocolo está diseñado para desconectar del ritmo diario, mimar tu piel con activos puros y ofrecerte resultados visibles en un ambiente sofisticado.",
            "about_image_url": f"{STORAGE_BASE}/beauty/about.jpg",
            "cta_title": "Regálate un momento de pausa y mimo",
            "cta_subtitle": "Reserva tu ritual exclusivo hoy mismo y siente la diferencia desde el primer minuto.",
            "cta_button_text": "Reservar Cita",
            "cta_button_link": "/reservar"
        },
        "services": [
            {
                "name": "Higiene Facial Profunda Signature & Glow",
                "slug": "higiene-facial-signature",
                "duration_minutes": 60,
                "price": 65.00,
                "description": "Limpieza biológica, exfoliación ultrasónica y velo de ácido hialurónico puro para una luminosidad inmediata.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/beauty/service-1.jpg"
            },
            {
                "name": "Masaje Sensorial Holístico con Aceites Esenciales",
                "slug": "masaje-sensorial-holistico",
                "duration_minutes": 55,
                "price": 70.00,
                "description": "Terapia corporal envolvente con maniobras rítmicas y botánicos templados para disolver tensiones profundas.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/beauty/service-2.jpg"
            },
            {
                "name": "Tratamiento Corporal Reafirmante & Drenante",
                "slug": "corporal-reafirmante",
                "duration_minutes": 50,
                "price": 80.00,
                "description": "Estimulación tisular y remodelación localizada para tonificar la piel y aligerar la pesadez de piernas.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/beauty/service-3.jpg"
            },
            {
                "name": "Ritual de Relajación Antiestrés & Desconexión",
                "slug": "ritual-antiestres",
                "duration_minutes": 75,
                "price": 95.00,
                "description": "Combinación sublime de masaje cráneo-facial y reflexología podal para inducir una calma reparadora.",
                "is_featured": False,
                "image_url": f"{STORAGE_BASE}/beauty/service-4.jpg"
            }
        ]
    },
    "barber": {
        "id": "barber",
        "display_name": "Barbería y Salón de Peluquería",
        "badge": "Estilismo de Autor & Barbería Clásica",
        "branding": {
            "branding_font_headings": "Cormorant Garamond",
            "branding_font_body": "Inter",
            "theme_palette": "minimal-dark",
            "accent_color": "#D4AF37",
            "accent_color_primary": "#D4AF37",
            "accent_color_secondary": "#111827"
        },
        "category": {
            "name": "Cortes y Cuidado del Cabello",
            "slug": "cortes-barberia",
            "description": "Servicios de peluquería y afeitado tradicional con navaja japonesa, toallas calientes y productos de autor."
        },
        "site_content": {
            "hero_title": "Estilo de autor y precisión en {clinic_name}",
            "hero_subtitle": "La maestría de la barbería tradicional unida a las últimas tendencias en corte, peinado y cuidado masculino y femenino.",
            "hero_image_url": f"{STORAGE_BASE}/barber/hero.jpg",
            "hero_button_text": "Reservar Cita",
            "hero_button_link": "/reservar",
            "about_title": "Sobre {clinic_name}",
            "about_text": "Más que un corte, una experiencia de confianza. En {clinic_name} cuidamos cada detalle: desde el diagnóstico de tu cabello hasta el acabado impecable con navaja clásica y productos premium formulados sin sulfatos.",
            "about_image_url": f"{STORAGE_BASE}/barber/about.jpg",
            "cta_title": "¿Toca renovar tu estilo?",
            "cta_subtitle": "Reserva tu turno en un clic sin esperas en sala y disfruta de un servicio impecable.",
            "cta_button_text": "Elegir Hora",
            "cta_button_link": "/reservar"
        },
        "services": [
            {
                "name": "Corte de Cabello Signature & Asesoramiento",
                "slug": "corte-signature",
                "duration_minutes": 35,
                "price": 28.00,
                "description": "Corte personalizado según fisonomía craneal, lavado con masaje capilar y peinado con producto texturizante.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/barber/service-1.jpg"
            },
            {
                "name": "Ritual de Afeitado Tradicional a Navaja",
                "slug": "afeitado-tradicional-navaja",
                "duration_minutes": 30,
                "price": 24.00,
                "description": "Afeitado clásico con toalla caliente aromática, enjabonado con brocha de tejón y bálsamo hidratante calmante.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/barber/service-2.jpg"
            },
            {
                "name": "Lavado de Hidratación Profunda & Styling",
                "slug": "hidratacion-styling",
                "duration_minutes": 40,
                "price": 35.00,
                "description": "Terapia de nutrición con mascarilla reconstructora y acabado pulido con secador profesional.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/barber/service-3.jpg"
            },
            {
                "name": "Perfilado y Arreglo de Barba con Toalla Caliente",
                "slug": "arreglo-barba",
                "duration_minutes": 25,
                "price": 18.00,
                "description": "Definición geométrica de líneas de cuello y mejillas, rebajado de volumen y aceite nutritivo.",
                "is_featured": False,
                "image_url": f"{STORAGE_BASE}/barber/service-4.jpg"
            }
        ]
    },
    "veterinary": {
        "id": "veterinary",
        "display_name": "Veterinaria y Cuidados",
        "badge": "Medicina Veterinaria y Respeto Animal",
        "branding": {
            "branding_font_headings": "Playfair Display",
            "branding_font_body": "Inter",
            "theme_palette": "clean-medical",
            "accent_color": "#D4AF37",
            "accent_color_primary": "#D4AF37",
            "accent_color_secondary": "#1E293B"
        },
        "category": {
            "name": "Consultas y Medicina Veterinaria",
            "slug": "consultas-veterinarias",
            "description": "Servicios clínicos y preventivos con trato amable libre de estrés para perros, gatos y animales de compañía."
        },
        "site_content": {
            "hero_title": "Cuidado veterinario experto y cercano en {clinic_name}",
            "hero_subtitle": "La salud y felicidad de tus compañeros de vida en manos de un equipo médico dedicado y con vocación auténtica.",
            "hero_image_url": f"{STORAGE_BASE}/veterinary/hero.jpg",
            "hero_button_text": "Pedir Cita Veterinaria",
            "hero_button_link": "/reservar",
            "about_title": "Sobre {clinic_name}",
            "about_text": "Entendemos a tu mascota como parte de tu familia. En {clinic_name} aplicamos protocolos Fear Free (libres de estrés) en unas instalaciones modernas, luminosas y equipadas con diagnóstico rápido para que se sientan como en casa.",
            "about_image_url": f"{STORAGE_BASE}/veterinary/about.jpg",
            "cta_title": "La tranquilidad de saber que están bien atendidos",
            "cta_subtitle": "Reserva su revisión periódica o vacunación online de forma sencilla.",
            "cta_button_text": "Reservar Consulta",
            "cta_button_link": "/reservar"
        },
        "services": [
            {
                "name": "Chequeo Clínico Integral & Medicina Preventiva",
                "slug": "chequeo-clinico-veterinario",
                "duration_minutes": 30,
                "price": 38.00,
                "description": "Exploración física completa (cardiorrespiratoria, ocular, dental y articular) con informe de salud para el tutor.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/veterinary/service-1.jpg"
            },
            {
                "name": "Plan de Vacunación & Desparasitación Anual",
                "slug": "vacunacion-desparasitacion",
                "duration_minutes": 25,
                "price": 45.00,
                "description": "Administración de inmunizaciones esenciales y antiparasitario de amplio espectro adaptado a su edad y estilo de vida.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/veterinary/service-2.jpg"
            },
            {
                "name": "Revisión Dental Preventiva y Salud Bucal",
                "slug": "salud-dental-veterinaria",
                "duration_minutes": 30,
                "price": 35.00,
                "description": "Diagnóstico de sarro, encías y recomendaciones nutricionales para prevenir patologías periodontales.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/veterinary/service-3.jpg"
            },
            {
                "name": "Consulta Especializada de Dermatología y Nutrición",
                "slug": "dermatologia-nutricion-mascotas",
                "duration_minutes": 40,
                "price": 50.00,
                "description": "Manejo de alergias cutáneas, picores recurrentes y formulación de dietas naturales y balanceadas.",
                "is_featured": False,
                "image_url": f"{STORAGE_BASE}/veterinary/service-4.jpg"
            }
        ]
    },
    "automotive": {
        "id": "automotive",
        "display_name": "Automoción y Mecánica",
        "badge": "Mecánica de Precisión & Detailing",
        "branding": {
            "branding_font_headings": "Inter",
            "branding_font_body": "Inter",
            "theme_palette": "minimal-dark",
            "accent_color": "#D4AF37",
            "accent_color_primary": "#D4AF37",
            "accent_color_secondary": "#111827"
        },
        "category": {
            "name": "Servicios de Taller y Detailing",
            "slug": "servicios-automocion",
            "description": "Mantenimiento preventivo, diagnosis electrónica y estética automotriz con estándares de concesionario oficial."
        },
        "site_content": {
            "hero_title": "Máximo rendimiento y cuidado experto en {clinic_name}",
            "hero_subtitle": "Mecánica de alta precisión, diagnóstico avanzado y estética vehicular para quienes exigen lo mejor de su coche.",
            "hero_image_url": f"{STORAGE_BASE}/automotive/hero.jpg",
            "hero_button_text": "Reservar Cita de Taller",
            "hero_button_link": "/reservar",
            "about_title": "Sobre {clinic_name}",
            "about_text": "Pasión por los motores y rigor técnico absoluto. En {clinic_name} cuidamos de tu vehículo con maquinaria de última generación, piezas originales y total transparencia en cada presupuesto.",
            "about_image_url": f"{STORAGE_BASE}/automotive/about.jpg",
            "cta_title": "Mantén tu vehículo en perfecto estado",
            "cta_subtitle": "Elige tu servicio y agenda día y hora de entrega en menos de un minuto.",
            "cta_button_text": "Agendar Servicio",
            "cta_button_link": "/reservar"
        },
        "services": [
            {
                "name": "Tratamiento de Detailing & Protección Cerámica",
                "slug": "detailing-proteccion-ceramica",
                "duration_minutes": 90,
                "price": 140.00,
                "description": "Descontaminado de pintura, pulido fino y sellador cerámico de larga duración para un brillo espejo insuperable.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/automotive/service-1.jpg"
            },
            {
                "name": "Diagnosis Electrónica Computarizada",
                "slug": "diagnosis-electronica",
                "duration_minutes": 40,
                "price": 45.00,
                "description": "Escaneo de centralitas, detección precoz de anomalías y lectura de sensores con maquinaria oficial.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/automotive/service-2.jpg"
            },
            {
                "name": "Revisión Preventiva Oficial & Puesta a Punto",
                "slug": "revision-oficial-puesta-a-punto",
                "duration_minutes": 60,
                "price": 85.00,
                "description": "Inspección de 40 puntos críticos: frenos, neumáticos, suspensión, fluidos y niveles con informe técnico.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/automotive/service-3.jpg"
            },
            {
                "name": "Acondicionamiento y Nutrición de Cuero Interior",
                "slug": "cuidado-cuero-interior",
                "duration_minutes": 50,
                "price": 65.00,
                "description": "Limpieza a fondo con pH neutro e hidratación profunda de tapicería en piel para evitar grietas.",
                "is_featured": False,
                "image_url": f"{STORAGE_BASE}/automotive/service-4.jpg"
            }
        ]
    },
    "home_services": {
        "id": "home_services",
        "display_name": "Servicios a Domicilio",
        "badge": "Especialistas Cualificados en tu Hogar",
        "branding": {
            "branding_font_headings": "Playfair Display",
            "branding_font_body": "Inter",
            "theme_palette": "charcoal-gold",
            "accent_color": "#D4AF37",
            "accent_color_primary": "#D4AF37",
            "accent_color_secondary": "#1C1917"
        },
        "category": {
            "name": "Servicios Especializados en Domicilio",
            "slug": "servicios-domicilio",
            "description": "Atención técnica y profesional con puntualidad garantizada directamente en tu vivienda o espacio comercial."
        },
        "site_content": {
            "hero_title": "Servicios profesionales en la comodidad de tu hogar con {clinic_name}",
            "hero_subtitle": "Técnicos certificados, materiales de primera calidad y garantía por escrito sin que tengas que desplazarte.",
            "hero_image_url": f"{STORAGE_BASE}/home_services/hero.jpg",
            "hero_button_text": "Reservar Asistencia",
            "hero_button_link": "/reservar",
            "about_title": "Sobre {clinic_name}",
            "about_text": "Creemos que la excelencia técnica debe ir acompañada de puntualidad y limpieza. En {clinic_name} atendemos cada solicitud con personal propio cualificado, protocolos claros y presupuestos cerrados sin sorpresas.",
            "about_image_url": f"{STORAGE_BASE}/home_services/about.jpg",
            "cta_title": "¿Necesitas ayuda en tu casa o negocio?",
            "cta_subtitle": "Selecciona el servicio y la franja horaria que mejor te convenga.",
            "cta_button_text": "Pedir Cita en Domicilio",
            "cta_button_link": "/reservar"
        },
        "services": [
            {
                "name": "Diagnóstico Técnico & Reparación Especializada",
                "slug": "diagnostico-reparacion-domicilio",
                "duration_minutes": 60,
                "price": 60.00,
                "description": "Visita diagnóstica, localización de la incidencia y presupuesto de resolución inmediata in situ.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/home_services/service-1.jpg"
            },
            {
                "name": "Mantenimiento Preventivo de Instalaciones",
                "slug": "mantenimiento-preventivo-hogar",
                "duration_minutes": 50,
                "price": 55.00,
                "description": "Revisión completa de rendimiento energético, limpieza técnica y ajuste para evitar averías costosas.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/home_services/service-2.jpg"
            },
            {
                "name": "Instalación Certificada de Equipamiento",
                "slug": "instalacion-certificada",
                "duration_minutes": 75,
                "price": 85.00,
                "description": "Montaje profesional con fijación reforzada, pruebas de carga y certificado de garantía de servicio.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/home_services/service-3.jpg"
            },
            {
                "name": "Asesoría Técnica y Presupuesto para Proyecto",
                "slug": "asesoria-tecnica-proyecto",
                "duration_minutes": 45,
                "price": 40.00,
                "description": "Toma de medidas, asesoramiento sobre materiales idóneos y propuesta a medida para tu espacio.",
                "is_featured": False,
                "image_url": f"{STORAGE_BASE}/home_services/service-4.jpg"
            }
        ]
    },
    "professional": {
        "id": "professional",
        "display_name": "Consultoría y Asesoría",
        "badge": "Estrategia Legal & Financiera",
        "branding": {
            "branding_font_headings": "Playfair Display",
            "branding_font_body": "Inter",
            "theme_palette": "clean-medical",
            "accent_color": "#D4AF37",
            "accent_color_primary": "#D4AF37",
            "accent_color_secondary": "#0F172A"
        },
        "category": {
            "name": "Consultoría Estratégica y Profesional",
            "slug": "consultoria-estrategica",
            "description": "Sesiones de alto impacto orientadas a la optimización fiscal, seguridad legal y crecimiento patrimonial."
        },
        "site_content": {
            "hero_title": "Estrategia, claridad y resultados con {clinic_name}",
            "hero_subtitle": "Asesoramiento profesional de alto nivel diseñado para proteger tus intereses y potenciar tus decisiones clave.",
            "hero_image_url": f"{STORAGE_BASE}/professional/hero.jpg",
            "hero_button_text": "Agendar Sesión",
            "hero_button_link": "/reservar",
            "about_title": "Sobre {clinic_name}",
            "about_text": "Aportamos visión estratégica y soluciones prácticas en un entorno de máxima confidencialidad. En {clinic_name} analizamos tu contexto con minuciosidad para diseñar hojas de ruta claras y eficaces.",
            "about_image_url": f"{STORAGE_BASE}/professional/about.jpg",
            "cta_title": "Toma el control con el respaldo adecuado",
            "cta_subtitle": "Agenda una primera sesión diagnóstica y obtén respuestas concretas para tu negocio.",
            "cta_button_text": "Solicitar Sesión",
            "cta_button_link": "/reservar"
        },
        "services": [
            {
                "name": "Sesión Estratégica de Diagnóstico & Auditoría",
                "slug": "sesion-estrategica-diagnostico",
                "duration_minutes": 50,
                "price": 90.00,
                "description": "Análisis exhaustivo del estado actual de tu negocio, detección de cuellos de botella y matriz de prioridades.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/professional/service-1.jpg"
            },
            {
                "name": "Consultoría de Planificación Fiscal y Patrimonial",
                "slug": "planificacion-fiscal-patrimonial",
                "duration_minutes": 60,
                "price": 120.00,
                "description": "Estructuración tributaria eficiente para optimizar cargas impositivas conforme a la normativa vigente.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/professional/service-2.jpg"
            },
            {
                "name": "Asesoramiento Legal Corporativo y Contractual",
                "slug": "asesoramiento-legal-corporativo",
                "duration_minutes": 45,
                "price": 95.00,
                "description": "Revisión preventiva de acuerdos comerciales, protección de propiedad intelectual y blindaje societario.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/professional/service-3.jpg"
            },
            {
                "name": "Consultoría de Optimización Operativa de Procesos",
                "slug": "optimizacion-operativa",
                "duration_minutes": 55,
                "price": 85.00,
                "description": "Diseño de flujos de trabajo ágiles, reducción de costes operativos e implementación de herramientas digitales.",
                "is_featured": False,
                "image_url": f"{STORAGE_BASE}/professional/service-4.jpg"
            }
        ]
    },
    "general": {
        "id": "general",
        "display_name": "General / Otros Servicios",
        "badge": "Servicios Especializados Signature",
        "branding": {
            "branding_font_headings": "Playfair Display",
            "branding_font_body": "Inter",
            "theme_palette": "charcoal-gold",
            "accent_color": "#D4AF37",
            "accent_color_primary": "#D4AF37",
            "accent_color_secondary": "#1C1917"
        },
        "category": {
            "name": "Servicios Principales y Sesiones",
            "slug": "servicios-principales",
            "description": "Catálogo de servicios profesionales diseñados con el máximo estándar de calidad y atención al cliente."
        },
        "site_content": {
            "hero_title": "Experiencias de autor y dedicación en {clinic_name}",
            "hero_subtitle": "Servicios profesionales personalizados con pasión por el detalle, cercanía y resultados garantizados.",
            "hero_image_url": f"{STORAGE_BASE}/general/hero.jpg",
            "hero_button_text": "Reservar Cita",
            "hero_button_link": "/reservar",
            "about_title": "Sobre {clinic_name}",
            "about_text": "Creemos en el valor de lo bien hecho. En {clinic_name} combinamos dedicación artesanal y técnicas contemporáneas para superar tus expectativas en cada encuentro.",
            "about_image_url": f"{STORAGE_BASE}/general/about.jpg",
            "cta_title": "Descubre una experiencia diferente",
            "cta_subtitle": "Reserva tu cita hoy mismo de forma cómoda y sin esperas.",
            "cta_button_text": "Reservar Cita Online",
            "cta_button_link": "/reservar"
        },
        "services": [
            {
                "name": "Consulta Inicial & Conceptualización Personalizada",
                "slug": "consulta-conceptualizacion",
                "duration_minutes": 35,
                "price": 40.00,
                "description": "Puesta en común, definición de objetivos y asesoramiento a medida adaptado a tus necesidades.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/general/service-1.jpg"
            },
            {
                "name": "Sesión Especializada Signature",
                "slug": "sesion-signature",
                "duration_minutes": 60,
                "price": 75.00,
                "description": "Servicio insignia con dedicación exclusiva y aplicación de nuestros protocolos más reconocidos.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/general/service-2.jpg"
            },
            {
                "name": "Protocolo de Acabado y Perfeccionamiento",
                "slug": "protocolo-acabado",
                "duration_minutes": 45,
                "price": 55.00,
                "description": "Detalle meticuloso y tratamiento final para garantizar una durabilidad y resultado impecables.",
                "is_featured": True,
                "image_url": f"{STORAGE_BASE}/general/service-3.jpg"
            },
            {
                "name": "Sesión de Mantenimiento y Seguimiento",
                "slug": "sesion-seguimiento",
                "duration_minutes": 30,
                "price": 35.00,
                "description": "Revisión periódica y consejos profesionales para prolongar los beneficios obtenidos.",
                "is_featured": False,
                "image_url": f"{STORAGE_BASE}/general/service-4.jpg"
            }
        ]
    }
}


def normalize_sector(sector_input: str) -> str:
    """Normaliza cualquier input (nombre visual o clave técnica) a una clave de sector válida."""
    if not sector_input:
        return "beauty"
    cleaned = sector_input.strip().lower()
    if cleaned in BLUEPRINTS:
        return cleaned
    return SECTOR_ALIASES.get(cleaned, "beauty")


def get_sector_blueprint(sector_input: str) -> Dict[str, Any]:
    """Obtiene el Blueprint completo para un sector dado."""
    sector_key = normalize_sector(sector_input)
    return BLUEPRINTS.get(sector_key, BLUEPRINTS["beauty"])
