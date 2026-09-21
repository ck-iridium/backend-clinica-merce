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
 * Normaliza el enlace de Google Maps para un tenant.
 * Si el tenant especificó una URL personalizada (ej. shortlink de Google My Business),
 * asegura que tenga el protocolo HTTPS.
 * Si no especificó URL pero tiene dirección física, genera el enlace directo de búsqueda/ruta de Google Maps.
 */
export function formatMapsUrl(mapsUrl?: string | null, address?: string | null): string | null {
  if (mapsUrl && mapsUrl.trim()) {
    let clean = mapsUrl.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
      return `https://${clean}`;
    }
    return clean;
  }
  if (address && address.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address.trim())}`;
  }
  return null;
}
