import { 
  Palette, LayoutGrid, SlidersHorizontal, PlusCircle, Wand2, Sparkles, LucideIcon 
} from 'lucide-react';

export interface Message {
  role: 'user' | 'model';
  content: string;
}

export interface WebmasterCommand {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  prompt: string;
}

export interface ConfirmModalState {
  show: boolean;
  title: string;
  message: string;
  slug: string;
  target: string;
}

export const CHAT_STORAGE_KEY_PREFIX = 'probookia_webmaster_chat_';
export const MAX_SAVED_MESSAGES = 30; // Ventana rodante para no sobrecargar el almacenamiento
export const CHAT_TTL_MS = 24 * 60 * 60 * 1000; // 24 horas de caducidad por inactividad

export const WEBMASTER_WELCOME = '¡Hola! Soy tu AI Webmaster & Director Creativo. Estoy conectado directamente con el escaparate público de tu negocio (en la vista previa a tu derecha). Puedo rediseñar secciones, optimizar textos para SEO, cambiar tu paleta de marca o generar fotografías de alta gama con tu clave de API. ¿Qué cambio visual deseas aplicar a tu web hoy?';

export const WEBMASTER_COMMANDS: WebmasterCommand[] = [
  {
    id: 'hero_slide',
    title: 'Añadir Diapositiva',
    subtitle: 'Nueva imagen destacada en portada',
    icon: SlidersHorizontal,
    prompt: 'Quiero añadir una nueva diapositiva destacada a la portada.'
  },
  {
    id: 'seo_hero',
    title: 'Mejorar Textos',
    subtitle: 'Optimizar titular y redacción',
    icon: Sparkles,
    prompt: 'Analiza y mejora el titular y los textos principales de la portada.'
  },
  {
    id: 'palette',
    title: 'Colores de la Web',
    subtitle: 'Cambiar paleta y estilo visual',
    icon: Palette,
    prompt: 'Quiero cambiar los colores principales de la web.'
  },
  {
    id: 'layout',
    title: 'Diseño del Catálogo',
    subtitle: 'Cambiar entre cuadrícula o carrusel',
    icon: LayoutGrid,
    prompt: 'Quiero cambiar el diseño de tratamientos de la portada entre cuadrícula o carrusel.'
  },
  {
    id: 'new_page',
    title: 'Crear Nueva Página',
    subtitle: 'Añadir otra sección a la web',
    icon: PlusCircle,
    prompt: 'Quiero crear una nueva página para mi web.'
  },
  {
    id: 'photo',
    title: 'Crear Imagen con IA',
    subtitle: 'Generar foto para la web',
    icon: Wand2,
    prompt: 'Quiero generar una nueva fotografía para mi web con inteligencia artificial.'
  },
];

export function getWebmasterCommands(
  activePageSlug?: string,
  activePageTitle?: string
): { sectionTitle: string; sectionSubtitle: string; commands: WebmasterCommand[] } {
  const isCustomPage = Boolean(activePageSlug && activePageSlug !== 'home');
  const pageLabel = activePageTitle || (isCustomPage && activePageSlug ? activePageSlug.replace(/-/g, ' ') : 'Portada');

  if (isCustomPage) {
    return {
      sectionTitle: `Comandos Rápidos · ${pageLabel}`,
      sectionSubtitle: 'Acciones Rápidas con 1 Clic',
      commands: [
        {
          id: 'editorial_section',
          title: 'Añadir Texto',
          subtitle: 'Nueva sección de contenido',
          icon: Sparkles,
          prompt: `Quiero añadir una nueva sección de texto a la página "${pageLabel}".`
        },
        {
          id: 'insert_bento',
          title: 'Mostrar Tratamientos',
          subtitle: 'Insertar catálogo en esta página',
          icon: LayoutGrid,
          prompt: `Quiero mostrar tratamientos en la página "${pageLabel}".`
        },
        {
          id: 'space_photo',
          title: 'Añadir Imagen',
          subtitle: 'Subir o generar fotografía',
          icon: Wand2,
          prompt: `Quiero añadir una fotografía a la página "${pageLabel}".`
        },
        {
          id: 'cta_booking',
          title: 'Botón de Reserva',
          subtitle: 'Llamada a reservar cita',
          icon: SlidersHorizontal,
          prompt: `Quiero añadir un botón para reservar cita en la página "${pageLabel}".`
        },
        {
          id: 'rewrite_luxury',
          title: 'Mejorar Redacción',
          subtitle: 'Hacer los textos más profesionales',
          icon: Sparkles,
          prompt: `Mejora la redacción de la página "${pageLabel}" para que suene más profesional y atractiva.`
        },
        {
          id: 'seo_page',
          title: 'Cambiar Título',
          subtitle: 'Editar nombre o encabezado',
          icon: Palette,
          prompt: `Quiero cambiar el título y subtítulo de la página "${pageLabel}".`
        },
      ]
    };
  }

  return {
    sectionTitle: 'Comandos Rápidos · Portada',
    sectionSubtitle: 'Acciones Rápidas con 1 Clic',
    commands: WEBMASTER_COMMANDS,
  };
}

// Utilidad simple para leer cookies en el cliente
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Obtener tenantId activo considerando modo soporte (Super Admin) o sesión directa
export function getActiveTenantId(): string | null {
  if (typeof window === 'undefined') return null;
  const impersonated = getCookie('impersonate_tenant_id');
  if (impersonated) return impersonated;
  const directCookie = getCookie('tenant_id');
  if (directCookie) return directCookie;
  try {
    const session = localStorage.getItem('user');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.tenant_id || null;
    }
  } catch {
    // ignore
  }
  return null;
}

// Extraer chips de opción interactiva [OPTION: label | value] del texto del mensaje
export function parseOptionsAndText(content: string) {
  const raw = content || '';
  const options: { label: string; value: string }[] = [];
  const optionRegex = /\[OPTION:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
  let match;
  while ((match = optionRegex.exec(raw)) !== null) {
    options.push({ label: match[1].trim(), value: match[2].trim() });
  }
  const clean = raw.replace(optionRegex, '').trim();
  return { clean, options };
}
