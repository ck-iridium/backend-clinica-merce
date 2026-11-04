import { HeroTabItem } from '../SaaSCMSHeroForm';
import { PainComparisonData } from '../SaaSCMSPainForm';
import { PillarsSectionData } from '../SaaSCMSPillarsForm';
import { MappedPreviewSector } from '../Showcase3DPreview';

export const DEFAULT_PAIN_COMPARISON: PainComparisonData = {
  badge: "El Dolor del Mercado",
  title: "¿Por qué pagar 5 programas si puedes tenerlo todo en uno?",
  subtitle: "La mayoría de clínicas sufren un caos de contraseñas, datos desincronizados y sobrecostes mensuales. ProBookia unifica todo el ecosistema.",
  old_model: {
    badge: "El Modelo Antiguo y Fragmentado",
    title: "Herramientas Dispersas",
    items: [
      { id: "old-1", concept: "Web + Hosting + Mantenimiento (WordPress)", cost: "~40€/mes" },
      { id: "old-2", concept: "Motor de reservas online (Fresha / Treatwell)", cost: "~50€/mes + comisiones" },
      { id: "old-3", concept: "Software médico LOPD & Consentimientos en papel", cost: "~70€/mes" },
      { id: "old-4", concept: "TPV de mostrador y facturación separada", cost: "~30€/mes" },
      { id: "old-5", concept: "Copiloto de IA o redacción externa", cost: "~30€/mes" }
    ],
    total_label: "Gasto Medio Mensual",
    total_amount: "220€/mes",
    footnote: "+ Pérdida de tiempo en 5 inicios de sesión distintos."
  },
  suite_model: {
    corner_badge: "Suite Todo-en-Uno",
    badge: "La Solución Unificada",
    title: "ProBookia Suite",
    features: [
      { id: "pro-1", title: "Web de Lujo con CMS:", description: "Edita fotos, vídeos y catálogo en minutos." },
      { id: "pro-2", title: "Reservas 24/7 sin comisiones:", description: "Fianza anti-plantones Stripe Connect." },
      { id: "pro-3", title: "Fichas LOPD & Consentimientos:", description: "Firma manuscrita en tablet/móvil." },
      { id: "pro-4", title: "Caja TPV & Facturas PDF:", description: "Cobro express por Bizum, tarjeta y bonos." },
      { id: "pro-5", title: "Copiloto IA Integrado:", description: "Asistente en tu base de datos para redactar y gestionar." }
    ],
    pricing_label: "Todo Incluido Desde",
    pricing_amount: "39€/mes",
    cta_text: "Probar Gratis"
  }
};

export const DEFAULT_PILLARS: PillarsSectionData = {
  badge: "Arquitectura de Producto",
  title: "Los 4 Pilares del Ecosistema",
  subtitle: "Todo lo que una clínicas de alta gama necesita para operar con la máxima sofisticación y cero fricción técnica.",
  items: [
    {
      id: "pillar-1",
      number_badge: "Pilar 01",
      title: "Presencia Web de Lujo",
      description: "CMS visual modular sin tocar código. Catálogo de tratamientos con fotos y tiempos de cabina, vídeos de alta definición, páginas personalizadas y SEO automático.",
      footer_highlight: "Tu marca propia en el centro",
      icon: "globe"
    },
    {
      id: "pillar-2",
      number_badge: "Pilar 02",
      title: "Motor de Reservas 24/7",
      description: "El paciente reserva desde su smartphone a cualquier hora en 3 pasos. Depósito o fianza anti-plantones obligatoria con Stripe Connect para erradicar las incomparecencias.",
      footer_highlight: "Cero ausencias no avisadas",
      icon: "calendar"
    },
    {
      id: "pillar-3",
      number_badge: "Pilar 03",
      title: "ERP, Legalidad & Caja",
      description: "Fichas médicas con firma manuscrita LOPD sin papel, TPV express de mostrador para cobros por Bizum/tarjeta, facturación correlativa y emisión de bonos multisesión.",
      footer_highlight: "100% Blindaje legal y fiscal",
      icon: "receipt"
    },
    {
      id: "pillar-4",
      number_badge: "Pilar 04",
      title: "AI Webmaster Copilot",
      description: "Tu asistente con inteligencia artificial integrado en tu base de datos. Redacta descripciones de tratamientos, traduce contenidos y ayuda a tu equipo en la operativa diaria.",
      footer_highlight: "Inteligencia sin esfuerzo",
      icon: "bot"
    }
  ]
};

export const DEFAULT_HERO_TABS: HeroTabItem[] = [
  {
    id: 'tab-agenda',
    label: 'Agenda & Reservas',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tab-emr',
    label: 'Fichas Clínicas LOPD',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tab-caja',
    label: 'Caja y Pagos',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tab-marketing',
    label: 'Marketing & Fidelización',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80'
  }
];

export const FALLBACK_SECTORS: MappedPreviewSector[] = [
  {
    id: 'clinicas',
    badge: 'Clínicas Estéticas',
    title: 'Clínicas & Wellness',
    copy: 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patients-face-with-magnifier-40545-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    placeholderGradient: 'from-blue-50 to-blue-100/30'
  },
  {
    id: 'barberias',
    badge: 'Barberías Selectas',
    title: 'Barberías Premium',
    copy: 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-man-with-a-razor-41223-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
    placeholderGradient: 'from-amber-50 to-amber-100/30'
  },
  {
    id: 'dentistas',
    badge: 'Odontología Avanzada',
    title: 'Consultorios Dentales',
    copy: 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dentist-adjusting-a-surgical-light-in-clinic-40549-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
    placeholderGradient: 'from-emerald-50 to-emerald-100/30'
  },
  {
    id: 'peluquerias',
    badge: 'Salones de Alta Costura',
    title: 'Salones de Belleza',
    copy: 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
    placeholderGradient: 'from-purple-50 to-purple-100/30'
  },
  {
    id: 'tattoos',
    badge: 'Tattoo & Piercing',
    title: 'Tattoo Studios',
    copy: 'Gestión de citas por artista, anticipos online y fichas de consentimiento informado sin papel.',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-tattoo-artist-working-on-a-design-41224-large.mp4',
    imageUrl: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
    placeholderGradient: 'from-stone-700 to-stone-900/40'
  }
];

export const DEFAULT_SECTOR_IMAGES: Record<string, string> = {
  clinicas: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  barberias: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  dentistas: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
  peluquerias: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  tattoos: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
};

export const DEFAULT_SECTOR_VIDEOS: Record<string, string> = {
  clinicas: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patients-face-with-magnifier-40545-large.mp4',
  barberias: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-man-with-a-razor-41223-large.mp4',
  dentistas: 'https://assets.mixkit.co/videos/preview/mixkit-dentist-adjusting-a-surgical-light-in-clinic-40549-large.mp4',
  peluquerias: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
  tattoos: 'https://assets.mixkit.co/videos/preview/mixkit-tattoo-artist-working-on-a-design-41224-large.mp4',
};

