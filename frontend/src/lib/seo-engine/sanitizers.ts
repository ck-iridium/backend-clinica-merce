const TRAILING_STOPWORDS = new Set([
  'y', 'e', 'o', 'u', 'un', 'una', 'unos', 'unas', 'el', 'la', 'los', 'las',
  'de', 'del', 'al', 'en', 'con', 'sin', 'por', 'para', 'a', 'su', 'sus',
  'tu', 'tus', 'que', 'como', 'se', 'mas', 'más', 'pero', 'un.', 'una.', 'el.', 'la.', 'y.'
]);

/**
 * Limpia y recorta un título a los límites seguros de Google (máx 60 caracteres),
 * asegurando que no corte palabras a medias y preservando el sufijo de marca.
 */
export function sanitizeTitle(rawTitle: string, clinicName: string): string {
  let title = (rawTitle || '').replace(/[\r\n\t]+/g, ' ').trim();
  title = title.replace(/^["']|["']$/g, '');

  const cleanClinic = (clinicName || '').trim();
  const suffix = cleanClinic ? ` | ${cleanClinic}` : '';

  // Limpiar separadores colgantes previos
  title = title.replace(/\s*\|\s*$/, '').trim();

  // Si no incluye el nombre de la clínica o empresa, añadírselo
  if (suffix && !title.toLowerCase().includes(cleanClinic.toLowerCase())) {
    title = `${title}${suffix}`;
  }

  if (title.length > 60) {
    if (suffix && title.endsWith(suffix)) {
      const maxBase = 60 - suffix.length;
      if (maxBase >= 20) {
        const base = title.slice(0, title.length - suffix.length).trim();
        const cut = base.slice(0, maxBase);
        const lastSpace = cut.lastIndexOf(' ');
        const cleanBase = (lastSpace > 15 ? cut.slice(0, lastSpace) : cut)
          .trim()
          .replace(/[,;:\-–—|]+$/, '');
        return `${cleanBase}${suffix}`;
      }
    }
    // Fallback sin sufijo
    const cut = title.slice(0, 57);
    const lastSpace = cut.lastIndexOf(' ');
    const cleanCut = (lastSpace > 25 ? cut.slice(0, lastSpace) : cut)
      .trim()
      .replace(/[,;:\-–—|]+$/, '');
    return `${cleanCut}...`;
  }

  return title;
}

/**
 * Limpia y formatea una meta descripción respetando las directrices de Google (135-155 caracteres).
 * Garantiza que la frase sea sintácticamente completa y NUNCA termine en un conector o artículo cortado.
 */
export function sanitizeDescription(rawDesc: string): string {
  let desc = (rawDesc || '').replace(/[\r\n\t]+/g, ' ').trim();
  desc = desc.replace(/^["']|["']$/g, '');

  if (desc.length > 155) {
    // 1. Si hay una oración completa terminada en '.' dentro del rango óptimo 120-155
    const candidate = desc.slice(0, 155);
    const lastPeriod = candidate.lastIndexOf('. ');
    if (lastPeriod >= 115) {
      return candidate.slice(0, lastPeriod + 1).trim();
    }

    // 2. Si no hay oración completa, recortar por la última palabra entera antes de 152
    const cut = desc.slice(0, 152);
    const lastSpace = cut.lastIndexOf(' ');
    let words = (lastSpace > 80 ? cut.slice(0, lastSpace) : cut)
      .trim()
      .replace(/[.,;:!\-–—]+$/, '')
      .split(/\s+/);

    // 3. Eliminar preposiciones, artículos o conjunciones que hayan quedado colgadas al final
    while (words.length > 0 && TRAILING_STOPWORDS.has(words[words.length - 1].toLowerCase())) {
      words.pop();
    }

    desc = words.join(' ').trim();
    if (desc && !desc.endsWith('.')) {
      desc += '.';
    }
  }

  // Asegurar punto final
  if (desc && !/[.!?]$/.test(desc)) {
    desc += '.';
  }

  return desc;
}

/**
 * Helper para normalizar slugs en el frontend/orquestador SEO
 */
export function slugifyText(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}
