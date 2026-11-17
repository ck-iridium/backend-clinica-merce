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
    title: 'Paleta Quiet Luxury',
    subtitle: 'Champagne, marfil y antracita',
    icon: Palette,
    prompt: 'Aplica una paleta de marca Quiet Luxury de alta gama a la web: color de acento dorado champagne #D4AF37, fondo marfil refinado, tipografía Playfair Display en títulos e Inter en cuerpo, y bordes redondeados.'
  },
  {
    id: 'seo_hero',
    title: 'Optimizar Hero & SEO',
    subtitle: 'Titular de alta conversión',
    icon: Sparkles,
    prompt: 'Optimiza el titular principal, subtítulo y botón de llamada a la acción del Hero para mejorar el posicionamiento SEO y la captación de reservas de alto poder adquisitivo.'
  },
  {
    id: 'bento',
    title: 'Layout Bento Grid',
    subtitle: 'Mosaico modular 2026',
    icon: LayoutGrid,
    prompt: 'Configura el estilo visual de la portada en formato Bento Grid modular asimétrico (layout_style="bento_grid") y ajusta el megamenú a formato bento con previsualización inmediata.'
  },
  {
    id: 'carousel',
    title: 'Carrusel Cinemático',
    subtitle: 'Diapositivas a pantalla completa',
    icon: SlidersHorizontal,
    prompt: 'Configura el escaparate en formato carrusel cinemático (layout_style="cards_slider") y revisa que las diapositivas del Hero tengan precios elegantes y llamadas a la acción directas.'
  },
  {
    id: 'new_page',
    title: 'Crear Página y Menú',
    subtitle: 'Nueva sección en la barra superior',
    icon: PlusCircle,
    prompt: 'Crea una nueva página web autónoma llamada "Filosofía y Espacio" con redacción editorial de alta costura y vincúlala de forma automática al menú superior de navegación (Navbar).'
  },
  {
    id: 'photo',
    title: 'Foto Editorial IA',
    subtitle: 'Generar con mi clave API',
    icon: Wand2,
    prompt: 'Genera una fotografía comercial editorial de alta costura para nuestro catálogo de tratamientos utilizando mi clave de API conectada en Ajustes.'
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
