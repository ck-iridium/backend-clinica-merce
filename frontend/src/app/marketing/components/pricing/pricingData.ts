export interface PlanFeature {
  text: string;
  isSpecial?: boolean;
  isBold?: boolean;
}

export interface PricingPlan {
  id: 'individual' | 'pro' | 'elite';
  tagline: string;
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyEquiv: string;
  description: string;
  popular?: boolean;
  isDark?: boolean;
  features: PlanFeature[];
  buttonText: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'individual',
    tagline: 'Autónomos & Gabinetes',
    name: 'Plan Individual',
    monthlyPrice: 39,
    yearlyPrice: 390,
    monthlyEquiv: '32,5€/mes',
    description: 'Toda la potencia de ProBookia para profesionales independientes que gestionan su propia cabina con firma médica y bonos.',
    features: [
      { text: '1 especialista único' },
      { text: '1 sede o ubicación física' },
      { text: 'Control de fichaje legal para 1 usuario (/fichar)' },
      { text: 'Co-Piloto & Diseñador Web IA (15 acciones/día)', isBold: true },
      { text: '30 fotos/mes con IA incluidas (Ilimitadas con tu clave)', isSpecial: true },
      { text: 'Servicios y catálogo dual ilimitado (Web y TPV)' },
      { text: 'Agenda interactiva & turnos' },
      { text: 'Firma en tablet y consentimientos LOPD' },
      { text: 'Emisión y control de Bonos (/vouchers)' },
      { text: 'Facturación oficial correlativa e IVA (/invoices)' },
      { text: 'Caja rápida TPV con control de stock manual' },
      { text: 'Web con CMS + Subdominio (y dominio propio)' },
      { text: 'Fianza anti-plantones Stripe Connect' },
      { text: 'Soporte técnico por email' }
    ],
    buttonText: 'Comenzar con Plan Individual'
  },
  {
    id: 'pro',
    tagline: 'Clínicas con Equipo',
    name: 'Plan Pro Todo-en-Uno',
    monthlyPrice: 69,
    yearlyPrice: 690,
    monthlyEquiv: '57,5€/mes',
    popular: true,
    description: 'El estándar completo para centros con equipo que requieren permisos RBAC, facturación oficial e IVA y web corporativa.',
    features: [
      { text: 'Hasta 4 miembros de equipo (con RBAC)', isBold: true },
      { text: 'Hasta 2 sedes físicas', isBold: true },
      { text: 'Control de Fichaje legal con exportación a Excel (/fichar)', isBold: true },
      { text: 'Control de Stock automático en TPV con aviso de mínimos', isBold: true },
      { text: 'Co-Piloto & Diseñador Web IA (35 acciones/día)', isBold: true },
      { text: '90 fotos/mes con IA incluidas (Ilimitadas con tu clave)', isSpecial: true },
      { text: 'Firma digital LOPD para todo el equipo' },
      { text: 'Emisión y control de Bonos (/vouchers)' },
      { text: 'Facturación oficial correlativa e IVA (/invoices)' },
      { text: 'Web con CMS + Subdominio (y dominio propio)' },
      { text: 'Catálogo dual (servicios web y cobros solo TPV)' },
      { text: 'Soporte técnico por email' }
    ],
    buttonText: 'Comenzar Prueba Gratuita (14 Días)'
  },
  {
    id: 'elite',
    tagline: 'Multisede & Rendimiento Máximo',
    name: 'Plan Elite',
    monthlyPrice: 129,
    yearlyPrice: 1290,
    monthlyEquiv: '107,5€/mes',
    isDark: true,
    description: 'Para policlínicas, cadenas y centros de alta demanda que exigen IA conversacional y multisede.',
    features: [
      { text: 'Hasta 10 miembros (+15€/mes extra)', isBold: true },
      { text: 'Hasta 5 sedes (+20€/mes extra)', isBold: true },
      { text: 'Fichaje legal y Stock Multisede con trazabilidad', isBold: true },
      { text: 'Co-Piloto & Diseñador Web IA (Acciones ilimitadas ∞)', isBold: true },
      { text: '250 fotos/mes con IA incluidas (Ilimitadas con tu clave)', isSpecial: true },
      { text: 'Todo lo incluido en el Plan Pro' },
      { text: 'Web con CMS + Subdominio (y dominio propio)' },
      { text: 'Soporte técnico por email' }
    ],
    buttonText: 'Solicitar Plan Elite'
  }
];
