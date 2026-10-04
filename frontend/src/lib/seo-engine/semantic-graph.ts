import { EcosystemData, SeoEntity } from './types';

export const SPANISH_STOPWORDS = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'las', 'por', 'para',
  'un', 'una', 'unos', 'unas', 'al', 'se', 'lo', 'su', 'sus', 'o', 'e', 'u',
  'mas', 'más', 'pero', 'como', 'este', 'esta', 'estos', 'estas', 'sobre',
]);

/**
 * Normaliza un término para análisis fonético/semántico:
 * sin tildes, minúsculas y sin caracteres especiales.
 */
export function normalizeKeyword(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrae tokens significativos filtrando stopwords pero preservando modificadores críticos
 * de variantes (con/sin, hombre/mujer, l/m/s/xl).
 */
export function extractMeaningfulTokens(text: string): string[] {
  const normalized = normalizeKeyword(text);
  if (!normalized) return [];
  return normalized
    .split(' ')
    .filter((token) => (token.length > 2 || /^[lms]|xl|xs|\d+$/i.test(token)) && !SPANISH_STOPWORDS.has(token));
}

/**
 * Traduce el business_sector a un descriptor legible en español
 */
export function formatSectorName(sector: string): string {
  const mapping: Record<string, string> = {
    estetica: 'Estética y Cuidado Personal',
    salud: 'Salud y Fisioterapia',
    fisioterapia: 'Fisioterapia y Rehabilitación',
    barberia: 'Barbería y Peluquería',
    medicina_estetica: 'Medicina Estética',
    wellness: 'Bienestar y Masajes',
    general: 'Servicios Profesionales',
  };
  return mapping[sector.toLowerCase()] || sector;
}

/**
 * Construye la estructura jerárquica de 3 niveles del ecosistema del tenant
 */
export function buildSemanticHierarchy(data: EcosystemData): SeoEntity[] {
  const entities: SeoEntity[] = [];
  const clinicName = data.settings.clinic_name;
  const city = data.detectedCity;
  const sector = formatSectorName(data.businessSector);

  // ── NIVEL 1: Home / Root (Marca + Sector + Localidad) ──
  const homeKeywords: string[] = [];
  if (data.siteContent.seo_keywords) {
    homeKeywords.push(...data.siteContent.seo_keywords.split(',').map((k) => k.trim()).filter(Boolean));
  } else {
    homeKeywords.push(clinicName.toLowerCase(), sector.toLowerCase(), city.toLowerCase());
  }

  entities.push({
    id: 'root-home',
    type: 'home',
    name: clinicName,
    urlPath: '/',
    level: 1,
    parentId: null,
    currentTitle: data.siteContent.seo_title,
    currentDescription: data.siteContent.seo_description,
    currentKeywords: homeKeywords.filter(Boolean),
    rawText: `${data.siteContent.hero_title || ''} ${data.siteContent.hero_subtitle || ''} ${data.settings.clinic_description || ''}`,
  });

  // ── NIVEL 2: Categorías Paraguas ──
  const categorySlugMap = new Map<string, string>();

  data.categories.forEach((cat) => {
    categorySlugMap.set(cat.id, cat.slug);
    const catKeywords: string[] = [];
    catKeywords.push(cat.name.toLowerCase());
    if (city) catKeywords.push(`${cat.name.toLowerCase()} ${city.toLowerCase()}`);

    entities.push({
      id: `category-${cat.id}`,
      type: 'category',
      name: cat.name,
      urlPath: `/tratamientos/${cat.slug}`,
      level: 2,
      parentId: 'root-home',
      currentTitle: `${cat.name} | ${clinicName}`,
      currentDescription: cat.seo_description || cat.description,
      currentKeywords: catKeywords,
      rawText: `${cat.name} ${cat.description || ''}`,
    });
  });

  // ── NIVEL 2.5: Sedes Físicas / Sedes Locales ──
  data.locations.forEach((loc) => {
    entities.push({
      id: `location-${loc.id}`,
      type: 'location',
      name: loc.name,
      urlPath: `/sedes/${loc.slug}`,
      level: 2,
      parentId: 'root-home',
      currentTitle: `${loc.name} | ${clinicName}`,
      currentDescription: `Visita nuestra sede en ${loc.address || city}. Cita previa y atención personalizada.`,
      currentKeywords: [clinicName.toLowerCase(), loc.name.toLowerCase(), loc.city ? loc.city.toLowerCase() : ''].filter(Boolean),
      rawText: `${loc.name} ${loc.address || ''}`,
    });
  });

  // ── NIVEL 3: Servicios / Tratamientos Específicos ──
  data.services.forEach((svc) => {
    const parentCatSlug = svc.category_id ? categorySlugMap.get(svc.category_id) || 'general' : 'general';
    const svcKeywords: string[] = [];

    if (svc.seo_keywords) {
      svcKeywords.push(...svc.seo_keywords.split(',').map((k) => k.trim()).filter(Boolean));
    } else {
      svcKeywords.push(svc.name.toLowerCase());
      if (svc.category_name) {
        svcKeywords.push(`${svc.name.toLowerCase()} ${svc.category_name.toLowerCase()}`);
      }
    }

    entities.push({
      id: `service-${svc.id}`,
      type: 'service',
      name: svc.name,
      urlPath: `/tratamientos/${parentCatSlug}/${svc.slug}`,
      level: 3,
      parentId: svc.category_id ? `category-${svc.category_id}` : 'root-home',
      categoryName: svc.category_name,
      currentTitle: svc.seo_title,
      currentDescription: svc.seo_description || svc.description,
      currentKeywords: svcKeywords,
      rawText: `${svc.name} ${svc.category_name || ''} ${svc.description || ''}`,
    });
  });

  return entities;
}
