/**
 * Utilidad unificada para resolver la URL pública correcta del inquilino (Tenant)
 * garantizando que en desarrollo se use http://[slug].localhost:3000/[path]
 * y en producción su dominio personalizado o subdominio asignado.
 */

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function getTenantSlug(): string {
  if (typeof window === 'undefined') return 'merce';

  // 1. Cookies prioritarias (Modo Soporte / Impersonación / Sesión activa)
  const cookieSlug = 
    readCookie('impersonate_tenant_slug') || 
    readCookie('tenant_slug') || 
    readCookie('cached_tenant_slug');
  if (cookieSlug) return cookieSlug;

  // 2. Subdominio en el hostname del navegador
  const hostname = window.location.hostname.toLowerCase();
  if (hostname.endsWith('.localhost') && hostname !== 'localhost') {
    return hostname.replace('.localhost', '');
  }
  if (hostname.endsWith('.probookia.com') && hostname !== 'www.probookia.com' && hostname !== 'probookia.com') {
    return hostname.replace('.probookia.com', '');
  }

  // 3. Fallback de la clínica principal
  return 'merce';
}

export function getTenantPublicHost(): string {
  if (typeof window === 'undefined') return 'merce.localhost:3000';

  const slug = getTenantSlug();
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port ? `:${window.location.port}` : '';

  // Entorno de desarrollo local
  if (hostname.includes('localhost')) {
    return `${slug}.localhost${port}`;
  }

  // Dominio personalizado para merce
  if (slug === 'merce') {
    return 'www.esteticamerce.com';
  }

  // Subdominio SaaS en producción
  if (hostname.includes('probookia.com')) {
    return `${slug}.probookia.com`;
  }

  return hostname + port;
}

export function getTenantPublicUrl(path: string = '/'): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (typeof window === 'undefined') return cleanPath;

  const slug = getTenantSlug();
  const hostname = window.location.hostname.toLowerCase();
  const port = window.location.port ? `:${window.location.port}` : '';
  const protocol = window.location.protocol;

  // 1. Entorno de desarrollo (localhost)
  if (hostname.includes('localhost')) {
    return `${protocol}//${slug}.localhost${port}${cleanPath}`;
  }

  // 2. Dominio personalizado para clínica merce en producción
  if (slug === 'merce') {
    return `https://www.esteticamerce.com${cleanPath}`;
  }

  // 3. Subdominios de producción de la plataforma
  if (hostname.includes('probookia.com')) {
    return `https://${slug}.probookia.com${cleanPath}`;
  }

  return cleanPath;
}
