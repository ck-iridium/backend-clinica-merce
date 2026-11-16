export interface Sector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl?: string;
  video_url?: string;
  imageUrl?: string;
  image_url?: string;
  placeholderGradient?: string;
}

export interface Showcase3DRingProps {
  sectorsToRender: Sector[];
  activeIndex?: number;
  animating?: boolean;
  handleNavigate?: (newIndex: number) => void;
  onConfigureEntorno: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
  isPreview?: boolean;
}

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

export function resolveSectorImage(s: Sector, idx: number): string {
  const customImg = s.imageUrl || s.image_url;
  if (customImg && typeof customImg === 'string' && customImg.trim() !== '') {
    return customImg;
  }
  const text = `${s.id || ''} ${s.title || ''} ${s.badge || ''}`.toLowerCase();
  if (text.includes('barber') || idx % 5 === 1) return DEFAULT_SECTOR_IMAGES.barberias;
  if (text.includes('dent') || text.includes('odont') || idx % 5 === 2) return DEFAULT_SECTOR_IMAGES.dentistas;
  if (text.includes('peluquer') || text.includes('salon') || idx % 5 === 3) return DEFAULT_SECTOR_IMAGES.peluquerias;
  if (text.includes('tattoo') || text.includes('tatuad') || idx % 5 === 4) return DEFAULT_SECTOR_IMAGES.tattoos;
  return DEFAULT_SECTOR_IMAGES.clinicas;
}

export function resolveSectorVideo(s: Sector, idx: number): string {
  const customVid = s.videoUrl || s.video_url;
  if (customVid && typeof customVid === 'string' && customVid.trim() !== '') {
    return customVid;
  }
  const text = `${s.id || ''} ${s.title || ''} ${s.badge || ''}`.toLowerCase();
  if (text.includes('barber') || idx % 5 === 1) return DEFAULT_SECTOR_VIDEOS.barberias;
  if (text.includes('dent') || text.includes('odont') || idx % 5 === 2) return DEFAULT_SECTOR_VIDEOS.dentistas;
  if (text.includes('peluquer') || text.includes('salon') || idx % 5 === 3) return DEFAULT_SECTOR_VIDEOS.peluquerias;
  if (text.includes('tattoo') || text.includes('tatuad') || idx % 5 === 4) return DEFAULT_SECTOR_VIDEOS.tattoos;
  return DEFAULT_SECTOR_VIDEOS.clinicas;
}

export const FALLBACK_SECTORS: Sector[] = [
  {
    id: 'clinicas',
    badge: 'Clínicas Estéticas',
    title: 'Clínicas & Wellness',
    copy: 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.clinicas,
    imageUrl: DEFAULT_SECTOR_IMAGES.clinicas,
  },
  {
    id: 'barberias',
    badge: 'Barberías Selectas',
    title: 'Barberías Premium',
    copy: 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.barberias,
    imageUrl: DEFAULT_SECTOR_IMAGES.barberias,
  },
  {
    id: 'dentistas',
    badge: 'Odontología Avanzada',
    title: 'Consultorios Dentales',
    copy: 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.dentistas,
    imageUrl: DEFAULT_SECTOR_IMAGES.dentistas,
  },
  {
    id: 'peluquerias',
    badge: 'Salones de Alta Costura',
    title: 'Salones de Belleza',
    copy: 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.peluquerias,
    imageUrl: DEFAULT_SECTOR_IMAGES.peluquerias,
  },
  {
    id: 'tattoos',
    badge: 'Tattoo & Piercing',
    title: 'Tattoo Studios',
    copy: 'Gestión de citas por artista, anticipos online y fichas de consentimiento informado sin papel.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.tattoos,
    imageUrl: DEFAULT_SECTOR_IMAGES.tattoos,
  }
];
