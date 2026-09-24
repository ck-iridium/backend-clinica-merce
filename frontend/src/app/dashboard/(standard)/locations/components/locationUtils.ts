import { Location } from './types';

/**
 * Helper para obtener una cookie en cliente
 */
export const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

/**
 * Genera la URL pública SEO para una sede física
 */
export const getPublicLocationUrl = (
  loc: Location, 
  tenantSlug: string = '', 
  customDomain: string | null = null
): string => {
  const slug = loc.slug || loc.id;
  
  // 1. Dominio personalizado configurado en base de datos
  if (customDomain) {
    const clean = customDomain.trim().replace(/\/+$/, '');
    return `${clean.startsWith('http') ? clean : `https://${clean}`}/sedes/${slug}`;
  }
  
  // 2. Mapeo específico para tenant merce
  const currentSlug = tenantSlug || getCookie('impersonate_tenant_slug') || getCookie('tenant_slug');
  if (currentSlug === 'merce') {
    return `https://www.esteticamerce.com/sedes/${slug}`;
  }
  
  // 3. Modo Soporte en probookia.com
  if (typeof window !== 'undefined' && (window.location.hostname === 'probookia.com' || window.location.hostname === 'www.probookia.com')) {
    if (currentSlug) {
      return `https://${currentSlug}.probookia.com/sedes/${slug}`;
    }
  }

  // 4. Entorno de desarrollo localhost
  if (typeof window !== 'undefined' && window.location.hostname.includes('localhost')) {
    if (currentSlug) {
      return `http://${currentSlug}.localhost:${window.location.port || 3000}/sedes/${slug}`;
    }
  }
  
  // 5. En el dominio propio de la clínica
  return `/sedes/${slug}`;
};

/**
 * Extrae el número de calle evitando confundirlo con códigos postales
 */
export const extractHouseNumber = (query: string, rawPostcode?: string): string | null => {
  if (!query) return null;
  let text = query;
  if (rawPostcode) {
    text = text.replace(new RegExp(`\\b${rawPostcode}\\b`, 'g'), '');
  }
  // Eliminar códigos postales estándar españoles de 5 dígitos (01000 - 52999)
  text = text.replace(/\b[0-5][0-9]{4}\b/g, '');

  // Buscar número de calle: 57, nº 57, n. 57, num 57, 57A, 57-B, 57 bis
  const match = text.match(/(?:(?:n[º°.]?|n[uú]m(?:ero)?\.?|#)\s*)?(\b\d{1,4}(?:\s*[-/]\s*\d{1,4})?(?:\s*(?:bis|[a-zA-Z]))?\b)/i);
  return match ? match[1].trim() : null;
};

/**
 * Formatea una dirección limpia a partir de la respuesta de OpenStreetMap/Nominatim
 */
export const formatCleanAddress = (item: any, userQuery: string = ''): string => {
  if (!item) return '';
  const addr = item.address || {};

  const road =
    addr.road ||
    addr.pedestrian ||
    addr.street ||
    addr.footway ||
    addr.path ||
    addr.cycleway ||
    addr.square ||
    addr.avenue ||
    addr.place ||
    '';

  const postcode = addr.postcode || '';
  const userNum = extractHouseNumber(userQuery, postcode);
  const houseNumber = addr.house_number || userNum || '';

  const city =
    addr.city ||
    addr.town ||
    addr.village ||
    addr.municipality ||
    addr.hamlet ||
    '';

  const province =
    addr.province ||
    addr.state_district ||
    (addr.state && addr.state !== city && addr.state !== 'Comunidad Valenciana' ? addr.state : '') ||
    '';

  if (!road) {
    return [city, postcode, province].filter(Boolean).join(', ') || item.display_name || '';
  }

  const parts: string[] = [];

  // 1. Calle y número exacto
  if (houseNumber) {
    parts.push(`${road}, ${houseNumber}`);
  } else {
    parts.push(road);
  }

  // 2. Código postal y localidad
  if (city) {
    if (postcode) {
      parts.push(`${postcode} ${city}`);
    } else {
      parts.push(city);
    }
  } else if (postcode) {
    parts.push(postcode);
  }

  // 3. Provincia (solo si difiere del municipio)
  if (province && province.toLowerCase() !== city.toLowerCase()) {
    parts.push(province);
  }

  return parts.join(', ');
};
