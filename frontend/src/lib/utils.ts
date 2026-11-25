import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Normaliza cualquier formato de Instagram ingresado por un tenant
 * (ej: "merce.estetica", "@merce.estetica", "instagram.com/merce.estetica" o "https://...")
 * a una URL absoluta válida para enlaces web.
 */
export function formatInstagramUrl(input?: string | null): string | null {
  if (!input || !input.trim()) return null;
  let clean = input.trim();
  if (clean.startsWith('@')) {
    clean = clean.substring(1);
  }
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    if (clean.includes('instagram.com/')) {
      return `https://${clean.replace(/^\/+/, '')}`;
    }
    return `https://www.instagram.com/${clean}`;
  }
  return clean;
}

/**
 * Normaliza el enlace de Google Maps para un tenant o sede.
 * - Si se especifican coordenadas GPS válidas, enlaza directamente a la ubicación exacta en Google Maps.
 * - Si se especificó una URL personalizada (ej. shortlink de Google My Business), asegura protocolo HTTPS.
 * - Si no es una URL pero es una dirección física (o se pasó como primer argumento por error),
 *   genera un enlace seguro de búsqueda en Google Maps evitando errores de dominio relativo.
 */
export function formatMapsUrl(
  mapsUrl?: string | null,
  address?: string | null,
  coords?: { lat?: number | string | null; lon?: number | string | null; latitude?: number | string | null; longitude?: number | string | null } | null
): string | null {
  // 1. Si hay coordenadas GPS válidas, prioridad absoluta para máxima precisión
  const lat = coords?.lat ?? coords?.latitude;
  const lon = coords?.lon ?? coords?.longitude;
  if (lat !== undefined && lat !== null && lon !== undefined && lon !== null) {
    const nLat = Number(lat);
    const nLon = Number(lon);
    if (!isNaN(nLat) && !isNaN(nLon) && (nLat !== 0 || nLon !== 0)) {
      return `https://www.google.com/maps/search/?api=1&query=${nLat},${nLon}`;
    }
  }

  // 2. Si se proporciona mapsUrl, verificar si es realmente una URL o una dirección física
  if (mapsUrl && mapsUrl.trim()) {
    const clean = mapsUrl.trim();
    const isUrl = /^https?:\/\//i.test(clean) ||
                  clean.includes('maps.google.') ||
                  clean.includes('google.com/maps') ||
                  clean.includes('goo.gl') ||
                  clean.includes('maps.app.goo.gl');

    if (isUrl) {
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        return `https://${clean}`;
      }
      return clean;
    }

    // Si no es una URL, fue una dirección física pasada como primer parámetro
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(clean)}`;
  }

  // 3. Dirección de respaldo
  if (address && address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
  }

  return null;
}
