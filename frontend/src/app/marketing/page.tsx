import MarketingClientPage, { Sector } from './MarketingClientPage';

export const revalidate = 60; // Revalidar la página cada minuto en producción para caché eficiente

export default async function Page() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 1. Valores por defecto (fallback)
  const defaultSettings = {
    hero_title: 'La elegancia de tu negocio traducida en un SaaS de Lujo',
    hero_subtitle: 'Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes. Agendas fluidas, expedientes médicos asimétricos y reservas de doble opt-in integradas en una experiencia sublime.',
    hero_image_1: null as string | null,
    hero_image_2: null as string | null,
    hero_image_3: null as string | null,
    logo_svg: null as string | null,
    primary_color: '#3b82f6',
    secondary_color: '#1c1917',
    tertiary_color: '#d4af37',
    font_family: 'playfair_inter',
    font_weight_headings: 'semibold',
    favicon_url: null as string | null,
  };

  const fallbackSectors: Sector[] = [
    {
      id: 'clinicas',
      badge: 'Clínicas Estéticas',
      title: 'Clínicas & Wellness',
      copy: 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patients-face-with-magnifier-40545-large.mp4',
      placeholderGradient: 'from-blue-50 to-blue-100/30'
    },
    {
      id: 'barberias',
      badge: 'Barberías Selectas',
      title: 'Barberías Premium',
      copy: 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-man-with-a-razor-41223-large.mp4',
      placeholderGradient: 'from-amber-50 to-amber-100/30'
    },
    {
      id: 'dentistas',
      badge: 'Odontología Avanzada',
      title: 'Consultorios Dentales',
      copy: 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dentist-adjusting-a-surgical-light-in-clinic-40549-large.mp4',
      placeholderGradient: 'from-emerald-50 to-emerald-100/30'
    },
    {
      id: 'peluquerias',
      badge: 'Salones de Alta Costura',
      title: 'Salones de Belleza',
      copy: 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
      placeholderGradient: 'from-purple-50 to-purple-100/30'
    }
  ];

  let settings = { ...defaultSettings };
  let sectors: Sector[] = [];

  // 2. Fetch de datos en el servidor
  try {
    const response = await fetch(`${API_URL}/super-admin/marketing/public`, {
      next: { revalidate: 60 }
    });
    if (response.ok) {
      const data = await response.json();
      if (data.settings) {
        settings = {
          hero_title: data.settings.hero_title || defaultSettings.hero_title,
          hero_subtitle: data.settings.hero_subtitle || defaultSettings.hero_subtitle,
          hero_image_1: data.settings.hero_image_1 || null,
          hero_image_2: data.settings.hero_image_2 || null,
          hero_image_3: data.settings.hero_image_3 || null,
          logo_svg: data.settings.logo_svg || null,
          primary_color: data.settings.primary_color || defaultSettings.primary_color,
          secondary_color: data.settings.secondary_color || defaultSettings.secondary_color,
          tertiary_color: data.settings.tertiary_color || defaultSettings.tertiary_color,
          font_family: data.settings.font_family || defaultSettings.font_family,
          font_weight_headings: data.settings.font_weight_headings || defaultSettings.font_weight_headings,
          favicon_url: data.settings.favicon_url || null,
        };
      }

      if (data.sectors && data.sectors.length > 0) {
        sectors = data.sectors.map((s: any) => {
          let gradient = 'from-blue-50 to-blue-100/30';
          if (s.slug === 'barberias' || s.order_index === 1) gradient = 'from-amber-50 to-amber-100/30';
          else if (s.slug === 'dentistas' || s.order_index === 2) gradient = 'from-emerald-50 to-emerald-100/30';
          else if (s.slug === 'peluquerias' || s.order_index === 3) gradient = 'from-purple-50 to-purple-100/30';
          
          let copy = 'Configura tu plataforma en marca blanca de alta gama con subdominio exclusivo y RLS a nivel de base de datos.';
          if (s.slug === 'clinicas') copy = 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.';
          else if (s.slug === 'barberias') copy = 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.';
          else if (s.slug === 'dentistas') copy = 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.';
          else if (s.slug === 'peluquerias') copy = 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.';
          
          return {
            id: s.id,
            badge: s.badge_text || 'Especialidad',
            title: s.title,
            copy: copy,
            videoUrl: s.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
            imageUrl: s.image_url || '',
            placeholderGradient: gradient
          };
        });
      }
    }
  } catch (err) {
    console.error('Error fetching CMS content in Server Component:', err);
  }

  // Si no se cargaron sectores del servidor, usar los de fallback
  if (sectors.length === 0) {
    sectors = fallbackSectors;
  }

  return (
    <MarketingClientPage 
      initialSettings={settings} 
      initialSectors={sectors} 
    />
  );
}
