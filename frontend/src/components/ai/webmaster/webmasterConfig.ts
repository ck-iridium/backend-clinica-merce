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
    id: 'palette',
    title: 'Paleta & Estilo Visual',
    subtitle: 'Combinaciones de alta gama',
    icon: Palette,
    prompt: 'Quiero renovar la paleta de colores y la estética de la web. ¿Qué combinaciones de lujo me recomiendas según mi sector?'
  },
  {
    id: 'seo_hero',
    title: 'Optimizar Portada & SEO',
    subtitle: 'Análisis y conversión de textos',
    icon: Sparkles,
    prompt: 'Analiza el titular actual y los textos SEO de la portada y recomiéndame mejoras de conversión.'
  },
  {
    id: 'layout',
    title: 'Layout de Catálogo',
    subtitle: 'Bento Grid frente a Carrusel',
    icon: LayoutGrid,
    prompt: 'Quiero evaluar el formato de presentación de tratamientos en portada (Bento Grid frente a Carrusel). ¿Cómo luciría cada uno y cuál me recomiendas?'
  },
  {
    id: 'hero_slide',
    title: 'Nueva Diapositiva Hero',
    subtitle: 'Proponer promoción o servicio',
    icon: SlidersHorizontal,
    prompt: 'Quiero añadir una nueva diapositiva destacada a la portada. ¿Qué tratamiento, novedad o servicio me sugieres destacar y qué datos necesitas?'
  },
  {
    id: 'new_page',
    title: 'Crear Nueva Página',
    subtitle: 'Asesoría y maquetación a medida',
    icon: PlusCircle,
    prompt: 'Quiero crear una nueva página para mi web. ¿Qué temáticas me recomiendas para mi clínica y qué estructura inicial le damos?'
  },
  {
    id: 'photo',
    title: 'Fotografía Editorial IA',
    subtitle: 'Generación con tu API Key',
    icon: Wand2,
    prompt: 'Quiero generar una fotografía editorial con mi clave de API para mi escaparate. ¿Qué escena o servicio me recomiendas fotografiar?'
  },
];

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
