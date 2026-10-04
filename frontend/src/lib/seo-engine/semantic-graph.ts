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

export function formatSectorName(sector: string): string {
  if (!sector || !sector.trim()) return 'Servicios Profesionales';
  const norm = sector.toLowerCase().trim();
  const mapping: Record<string, string> = {
    beauty: 'Estética y Belleza',
    estetica: 'Estética y Belleza',
    medicina_estetica: 'Medicina Estética',
    wellness: 'Bienestar y Spa',
    salud: 'Salud y Bienestar',
    fisioterapia: 'Fisioterapia y Rehabilitación',
    barberia: 'Barbería y Peluquería',
    peluqueria: 'Peluquería y Estilismo',
    spa: 'Spa y Masajes',
    unas: 'Manicura y Pedicura',
    taller: 'Taller Mecánico y Automoción',
    mecanica: 'Taller Mecánico y Automoción',
    automocion: 'Taller Mecánico y Automoción',
    abogados: 'Despacho de Abogados y Asesoría Legal',
    abogacia: 'Despacho de Abogados y Asesoría Legal',
    legal: 'Servicios Legales y Jurídicos',
    asesoria: 'Asesoría Fiscal y Laboral',
    gestoria: 'Gestoría y Asesoría',
    psicologia: 'Psicología y Terapia',
    psiquiatria: 'Psiquiatría y Salud Mental',
    odontologia: 'Clínica Dental y Odontología',
    dental: 'Clínica Dental y Odontología',
    veterinaria: 'Clínica Veterinaria',
    nutricion: 'Nutrición y Dietética',
    fitness: 'Entrenamiento y Fitness',
    yoga: 'Yoga y Pilates',
    tatuajes: 'Estudio de Tatuajes',
    fotografia: 'Estudio de Fotografía',
    reformas: 'Reformas y Construcción',
    inmobiliaria: 'Servicios Inmobiliarios',
    consultoria: 'Consultoría Profesional',
    general: 'Servicios Profesionales',
  };

  if (mapping[norm]) return mapping[norm];

  // Si es un sector nuevo no contemplado, capitalizar limpiamente
  return norm
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Construye la estructura jerárquica de 3 niveles del ecosistema del tenant
 */
export function buildSemanticHierarchy(data: EcosystemData, targetLanguage: 'es' | 'en' | 'fr' = 'es'): SeoEntity[] {
  const entities: SeoEntity[] = [];
  const clinicName = data.settings.clinic_name;
  const city = data.detectedCity;
  const sector = formatSectorName(data.businessSector);
  const isForeign = targetLanguage !== 'es';

  // ── NIVEL 1: Home / Root (Marca + Sector + Localidad) ──
  const homeTrans = isForeign && data.siteContent.translations?.[targetLanguage] ? data.siteContent.translations[targetLanguage] : null;
  const homeKeywords: string[] = [];

  if (homeTrans?.seo_keywords) {
    homeKeywords.push(...homeTrans.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean));
  } else if (data.siteContent.seo_keywords && !isForeign) {
    homeKeywords.push(...data.siteContent.seo_keywords.split(',').map((k) => k.trim()).filter(Boolean));
  } else {
    homeKeywords.push(clinicName.toLowerCase(), sector.toLowerCase(), city.toLowerCase());
  }

  entities.push({
    id: 'root-home',
    type: 'home',
    name: clinicName,
    urlPath: isForeign ? `/?lang=${targetLanguage}` : '/',
    level: 1,
    parentId: null,
    currentTitle: homeTrans?.seo_title || (isForeign ? null : data.siteContent.seo_title),
    currentDescription: homeTrans?.seo_description || (isForeign ? null : data.siteContent.seo_description),
    currentKeywords: homeKeywords.filter(Boolean),
    rawText: `${data.siteContent.hero_title || ''} ${data.siteContent.hero_subtitle || ''} ${data.settings.clinic_description || ''}`,
    language: targetLanguage,
    translations: data.siteContent.translations || null,
  });

  // ── NIVEL 2: Categorías Paraguas ──
  const categorySlugMap = new Map<string, string>();

  data.categories.forEach((cat) => {
    const catTrans = isForeign && cat.translations?.[targetLanguage] ? cat.translations[targetLanguage] : null;
    const catSlug = catTrans?.slug || cat.slug;
    categorySlugMap.set(cat.id, catSlug);

    const catName = catTrans?.name || cat.name;
    const catKeywords: string[] = [];
    if (catTrans?.seo_keywords) {
      catKeywords.push(...catTrans.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean));
    } else {
      catKeywords.push(catName.toLowerCase());
      if (city) catKeywords.push(`${catName.toLowerCase()} ${city.toLowerCase()}`);
    }

    const currentTitle = catTrans?.seo_title || (isForeign ? null : `${cat.name} | ${clinicName}`);
    const currentDescription = catTrans?.seo_description || catTrans?.description || (isForeign ? null : (cat.seo_description || cat.description));

    entities.push({
      id: `category-${cat.id}`,
      type: 'category',
      name: catName,
      slug: catSlug,
      urlPath: isForeign ? `/tratamientos/${catSlug}?lang=${targetLanguage}` : `/tratamientos/${cat.slug}`,
      level: 2,
      parentId: 'root-home',
      currentTitle,
      currentDescription,
      currentKeywords: catKeywords,
      rawText: `${catName} ${catTrans?.description || cat.description || ''}`,
      language: targetLanguage,
      translations: cat.translations || null,
    });
  });

  // ── NIVEL 2.5: Sedes Físicas / Sedes Locales ──
  data.locations.forEach((loc) => {
    entities.push({
      id: `location-${loc.id}`,
      type: 'location',
      name: loc.name,
      slug: loc.slug,
      urlPath: isForeign ? `/sedes/${loc.slug}?lang=${targetLanguage}` : `/sedes/${loc.slug}`,
      level: 2,
      parentId: 'root-home',
      currentTitle: `${loc.name} | ${clinicName}`,
      currentDescription: `Visita nuestra sede en ${loc.address || city}. Cita previa y atención personalizada.`,
      currentKeywords: [clinicName.toLowerCase(), loc.name.toLowerCase(), loc.city ? loc.city.toLowerCase() : ''].filter(Boolean),
      rawText: `${loc.name} ${loc.address || ''}`,
      language: targetLanguage,
    });
  });

  // ── NIVEL 3: Servicios / Tratamientos Específicos ──
  data.services.forEach((svc) => {
    const parentCatSlug = svc.category_id ? categorySlugMap.get(svc.category_id) || 'general' : 'general';
    const svcTrans = isForeign && svc.translations?.[targetLanguage] ? svc.translations[targetLanguage] : null;

    const svcName = svcTrans?.name || svc.name;
    const svcSlug = svcTrans?.slug || svc.slug;
    const svcKeywords: string[] = [];

    if (svcTrans?.seo_keywords) {
      svcKeywords.push(...svcTrans.seo_keywords.split(',').map((k: string) => k.trim()).filter(Boolean));
    } else if (svc.seo_keywords && !isForeign) {
      svcKeywords.push(...svc.seo_keywords.split(',').map((k) => k.trim()).filter(Boolean));
    } else {
      svcKeywords.push(svcName.toLowerCase());
      if (svc.category_name) {
        svcKeywords.push(`${svcName.toLowerCase()} ${svc.category_name.toLowerCase()}`);
      }
    }

    const currentTitle = svcTrans?.seo_title || (isForeign ? null : svc.seo_title);
    const currentDescription = svcTrans?.seo_description || svcTrans?.description || (isForeign ? null : (svc.seo_description || svc.description));

    entities.push({
      id: `service-${svc.id}`,
      type: 'service',
      name: svcName,
      slug: svcSlug,
      urlPath: isForeign ? `/tratamientos/${parentCatSlug}/${svcSlug}?lang=${targetLanguage}` : `/tratamientos/${parentCatSlug}/${svc.slug}`,
      level: 3,
      parentId: svc.category_id ? `category-${svc.category_id}` : 'root-home',
      categoryName: svc.category_name,
      currentTitle,
      currentDescription,
      currentKeywords: svcKeywords,
      rawText: `${svcName} ${svc.category_name || ''} ${svcTrans?.description || svc.description || ''}`,
      language: targetLanguage,
      translations: svc.translations || null,
    });
  });

  return entities;
}
