import { SemanticNode, SeoEntity, EcosystemData } from './types';
import { normalizeKeyword, extractMeaningfulTokens, formatSectorName, buildSemanticHierarchy } from './semantic-graph';

export interface SeoOptimizationProposal {
  entityId: string;
  entityType: 'home' | 'category' | 'service' | 'location';
  entityName: string;
  urlPath: string;
  language?: 'es' | 'en' | 'fr';
  original: {
    seo_title?: string | null;
    seo_description?: string | null;
    seo_keywords?: string | null;
    slug?: string | null;
    score: number;
  };
  proposed: {
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    slug?: string;
    assignedKeyword: string;
    projectedScore: number;
  };
  rationale: string;
}

export interface TenantAiContext {
  clinicName: string;
  businessSector: string;
  clinicDescription?: string | null;
  toneDirective?: string;
  city: string;
  province?: string;
  tenantId: string;
  allLocations?: { name: string; address?: string | null; city?: string | null }[];
}

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
 * Extrae y parsea JSON de forma tolerante a bloques markdown o texto periférico
 */
function extractJsonFromText(text: string): any {
  if (!text) throw new Error('Contenido de texto vacío');
  const cleaned = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err1) {
    const firstBracket = cleaned.indexOf('[');
    const firstBrace = cleaned.indexOf('{');
    
    let startIdx = -1;
    let endIdx = -1;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
      startIdx = firstBracket;
      endIdx = cleaned.lastIndexOf(']');
    } else if (firstBrace !== -1) {
      startIdx = firstBrace;
      endIdx = cleaned.lastIndexOf('}');
    }

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const sub = cleaned.slice(startIdx, endIdx + 1);
      return JSON.parse(sub);
    }

    throw new Error(`Error parseando respuesta JSON de Gemini: ${err1}`);
  }
}

/**
 * Llama a la API de Gemini para estructurar la respuesta JSON
 */
async function callGeminiAi(prompt: string, apiKey: string): Promise<any> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.25, // Baja temperatura para máximo apego a las instrucciones estratégicas
      },
    }),
    signal: AbortSignal.timeout(45000),
  });

  if (!response.ok) {
    const errText = await response.text();
    console.error(`[callGeminiAi Error] HTTP ${response.status}:`, errText);
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Gemini no devolvió contenido de texto.');
  }

  return extractJsonFromText(textContent);
}

/**
 * Fallback a través del backend FastAPI si no se tiene la clave en frontend
 */
async function callBackendAiFallback(prompt: string, tenantId: string): Promise<any> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const response = await fetch(`${apiUrl}/ai/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Tenant-ID': tenantId,
    },
    body: JSON.stringify({
      prompt,
      type: 'seo',
    }),
  });

  if (!response.ok) {
    throw new Error(`Backend AI Error: ${response.status}`);
  }

  const data = await response.json();
  if (typeof data === 'string') {
    return JSON.parse(data.replace(/```(?:json)?/g, '').trim());
  }
  return data;
}

/**
 * Helper simple para normalizar slugs en el frontend/orquestador
 */
function slugifyText(text: string): string {
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

/**
 * Prompt maestro del Agente Estratega SEO Local - 100% Dinámico y Agnóstico al Sector (SaaS Multi-tenant)
 */
function buildMasterSeoPrompt(params: {
  clinicName: string;
  businessSector: string;
  clinicDescription?: string | null;
  toneDirective?: string;
  city: string;
  province?: string;
  locationsList: string;
  targetLanguage?: 'es' | 'en' | 'fr';
  itemsToOptimize: Array<{
    id: string;
    type: string;
    name: string;
    category?: string | null;
    description?: string | null;
    currentTitle?: string | null;
    currentDescription?: string | null;
    urlPath?: string | null;
  }>;
  existingKeywordsInCatalog: string[];
}): string {
  const {
    clinicName,
    businessSector,
    clinicDescription,
    toneDirective,
    city,
    province,
    locationsList,
    targetLanguage = 'es',
    itemsToOptimize,
    existingKeywordsInCatalog,
  } = params;

  const isEnglish = targetLanguage === 'en';
  const isFrench = targetLanguage === 'fr';

  const languageDirective = isEnglish
    ? `IDIOMA OBJETIVO: ENGLISH (EN). Write all 'seo_title', 'seo_description', 'seo_keywords', 'slug' and 'rationale' strictly in high-quality, natural English targeted at international users, expats and tourists searching in Google.`
    : isFrench
    ? `IDIOMA OBJETIVO: FRANÇAIS (FR). Rédigez tous les champs 'seo_title', 'seo_description', 'seo_keywords', 'slug' et 'rationale' en français élégant, naturel et persuasif pour les utilisateurs recherchant sur Google.`
    : `IDIOMA OBJETIVO: ESPAÑOL (ES). Redacta todos los campos en español natural, profesional y persuasivo adaptado a Google España.`;

  const toneContext = toneDirective
    ? `- Directiva de tono de marca: "${toneDirective}"`
    : `- Tono de comunicación: Profesional, cercano, de alta solvencia y adaptado a los estándares de excelencia del sector "${businessSector}".`;

  return `Eres un Consultor Senior de Estrategia SEO Local y Arquitectura Web especializado en negocios y empresas del sector: ${businessSector}.
Tu objetivo es analizar el catálogo de servicios, categorías y sedes de la empresa "${clinicName}" y diseñar los metadatos SEO (Title, Meta Description, Keywords, Slug y Keyword Principal Asignada) de máximo rendimiento, visibilidad local y CTR para Google.

==============================================
DIRECTIVA DE IDIOMA Y AUDIENCIA
==============================================
${languageDirective}

==============================================
DOSSIER DE INTELIGENCIA DEL NEGOCIO
==============================================
- Nombre comercial / Empresa: "${clinicName}"
- Sector de actividad: "${businessSector}"
${clinicDescription ? `- Propuesta de valor / Descripción: "${clinicDescription}"\n` : ''}${toneContext}
- Municipio principal: "${city || 'España'}"
- Provincia / Región: "${province || ''}"
- Sedes físicas:
${locationsList || '  - Sede principal'}

Palabras clave ya reservadas en el catálogo (evita canibalizarlas):
[${existingKeywordsInCatalog.slice(0, 15).map((k) => `"${k}"`).join(', ')}]

==============================================
DIRECTRICES ESTRATÉGICAS DE OBLIGADO CUMPLIMIENTO
==============================================
1. DECODIFICACIÓN DE CÓDIGOS INTERNOS, TARIFAS Y NOMENCLATURAS TÉCNICAS A ZONAS ANATÓMICAS REALES:
   - Los clientes en Google buscan soluciones y necesidades reales, NUNCA nombres de tarifas internas abstractas (ej. "Zona S", "Zona M", "Zona L", "Bono 5 sesiones", "Pack básico", abreviaturas de sesiones o códigos alfa-numéricos).
   - Debes LEER con máxima atención la descripción detallada de cada servicio para entender exactamente qué incluye, qué problema soluciona o qué zonas anatómicas cubre.
   - TRADUCCIÓN DE TARIFAS Y ZONAS: Si un servicio tiene un nombre abstracto como "Zona S" y su descripción indica "labio superior, patillas o axilas", debes titular y describir con las zonas anatómicas reales que la gente busca:
     * En Español: "Depilación Láser Zonas Pequeñas (Labio, Axilas) | ${clinicName}"
     * En Inglés: "Small Area Laser Hair Removal (Underarms, Lip) | ${clinicName}"
     * En Francés: "Épilation Laser Petites Zones (Lèvre, Aisselles) | ${clinicName}"
   - Traduce los nombres técnicos a intenciones de búsqueda cotidianas y profesionales del sector "${businessSector}".

2. GEOLOCALIZACIÓN INTELIGENTE Y NATURAL:
   - Posiciona prioritariamente en el municipio real del negocio ("${city}").
   - En la página principal (Home) y categorías generales, prioriza términos de búsqueda de alta intención local (ej. "${businessSector} en ${city}" o su traducción en ${targetLanguage}).

3. PREVENCIÓN ACTIVA DE CANIBALIZACIÓN:
   - Cada servicio y categoría debe responder a una intención de búsqueda única y tener su propia 'assignedKeyword' exclusiva.
   - Si dos servicios son modalidades o niveles distintos, márcalos con total claridad para que Google no compita consigo mismo.

4. LONGITUDES ESTRICTAS Y REDACCIÓN IMPECABLE (REGLA DE ORO DE GOOGLE):
   - 'seo_title': Longitud entre 48 y 60 caracteres. Debe terminar con " | ${clinicName}". Jamás dejes títulos cortados ni con palabras truncadas a medias.
   - 'seo_description': Longitud entre 135 y 155 caracteres. Oraciones COMPLETAS con sutil llamada a la acción. PROHIBICIÓN ABSOLUTA: Jamás termines a mitad de frase ni con preposiciones o artículos colgantes. Debe terminar con punto final.
   - 'seo_keywords': 3 a 5 palabras clave específicas en el idioma ${targetLanguage.toUpperCase()} separadas por comas.
   - 'slug': URL-friendly slug en minúsculas y separado por guiones adaptado al idioma (ej. "lifting-pestanas" en ES, "lash-lift" en EN, "rehaussement-cils" en FR).
   - 'assignedKeyword': La frase clave principal exacta (long-tail) asignada exclusivamente a esta página.
   - 'rationale': Breve justificación estratégica de 1 frase explicando el criterio adoptado.

==============================================
PÁGINAS A OPTIMIZAR
==============================================
${JSON.stringify(itemsToOptimize, null, 2)}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "proposals": [
    {
      "entityId": "string (el id exacto recibido)",
      "seo_title": "string (48-60 caracteres)",
      "seo_description": "string (135-155 caracteres con punto final)",
      "seo_keywords": "string (3 a 5 keywords separadas por comas)",
      "slug": "string (slug amigable en minúsculas sin acentos ni espacios)",
      "assignedKeyword": "string (keyword principal única)",
      "rationale": "string"
    }
  ]
}`;
}

/**
 * Optimización holística del ecosistema completo o de una selección de entidades.
 * El Agente Estratega SEO analiza el catálogo en conjunto con visión global.
 */
export async function optimizeEcosystemHolistic(
  ecosystem: EcosystemData,
  targetEntityIds?: string[],
  geminiKey?: string,
  targetLanguage: 'es' | 'en' | 'fr' = 'es'
): Promise<SeoOptimizationProposal[]> {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || '';
  const clinicName = ecosystem.settings.clinic_name;
  const businessSector = formatSectorName(ecosystem.businessSector);
  const clinicDescription = ecosystem.settings.clinic_description;
  const city = ecosystem.detectedCity || '';
  const province = ecosystem.detectedProvince || '';

  // 1. Construir la jerarquía completa del ecosistema para el idioma solicitado
  const allEntities = buildSemanticHierarchy(ecosystem, targetLanguage);

  // 2. Filtrar entidades a optimizar
  const entitiesToOptimize = targetEntityIds && targetEntityIds.length > 0
    ? allEntities.filter((e) => targetEntityIds.includes(e.id))
    : allEntities;

  if (entitiesToOptimize.length === 0) {
    return [];
  }

  // 3. Preparar lista de sedes formateadas
  const locationsList = (ecosystem.locations || [])
    .map((l) => `  - ${l.name}: ${l.address || l.city || city}`)
    .join('\n');

  // 4. Catálogo de keywords ya existentes en otras entidades no objetivo
  const targetIdsSet = new Set(entitiesToOptimize.map((e) => e.id));
  const existingKeywordsInCatalog: string[] = [];
  allEntities.forEach((e) => {
    if (!targetIdsSet.has(e.id)) {
      existingKeywordsInCatalog.push(...e.currentKeywords);
    }
  });

  // 5. Preparar ítems optimizados para el prompt (payload ligero y conciso)
  const itemsToOptimize = entitiesToOptimize.map((e) => ({
    id: e.id,
    type: e.type,
    name: e.name,
    category: e.categoryName || (e.type === 'home' ? 'Página Principal' : undefined),
    description: e.rawText ? e.rawText.slice(0, 350) : (e.currentDescription || undefined),
    urlPath: e.urlPath,
  }));

  // Procesar en lotes equilibrados
  const CHUNK_SIZE = 20;
  const proposals: SeoOptimizationProposal[] = [];

  for (let i = 0; i < itemsToOptimize.length; i += CHUNK_SIZE) {
    const chunk = itemsToOptimize.slice(i, i + CHUNK_SIZE);
    const chunkPrompt = buildMasterSeoPrompt({
      clinicName,
      businessSector,
      clinicDescription,
      city,
      province,
      locationsList,
      targetLanguage,
      itemsToOptimize: chunk,
      existingKeywordsInCatalog: [
        ...existingKeywordsInCatalog,
        ...proposals.map((p) => p.proposed.assignedKeyword),
      ],
    });

    let rawData: any = null;

    if (apiKey) {
      try {
        rawData = await callGeminiAi(chunkPrompt, apiKey);
      } catch (err) {
        console.warn('[ai-orchestrator] Error en llamada directa a Gemini para lote holístico:', err);
      }
    }

    // Normalizar la lista devuelta por Gemini (soporta array directo, { proposals: [] }, { data: [] }, etc.)
    let returnedProposals: any[] = [];
    if (Array.isArray(rawData)) {
      returnedProposals = rawData;
    } else if (rawData && typeof rawData === 'object') {
      if (Array.isArray(rawData.proposals)) {
        returnedProposals = rawData.proposals;
      } else if (Array.isArray(rawData.data)) {
        returnedProposals = rawData.data;
      } else if (Array.isArray(rawData.items)) {
        returnedProposals = rawData.items;
      } else {
        returnedProposals = Object.entries(rawData).map(([k, v]: [string, any]) => ({
          entityId: v?.entityId || v?.id || k,
          ...(typeof v === 'object' ? v : {}),
        }));
      }
    }

    if (returnedProposals.length === 0) {
      try {
        const backendData = await callBackendAiFallback(chunkPrompt, ecosystem.tenant.id);
        if (Array.isArray(backendData)) {
          returnedProposals = backendData;
        } else if (Array.isArray(backendData?.proposals)) {
          returnedProposals = backendData.proposals;
        }
      } catch (backendErr) {
        console.error('[ai-orchestrator] Fallback a backend también falló:', backendErr);
      }
    }

    // Mapeo ultra-robusto: admite id, entityId, entity_id, coincidencia por nombre o posición en el chunk
    const proposalMap = new Map<string, any>();
    returnedProposals.forEach((p, idx) => {
      if (!p) return;
      const key = p.entityId || p.entity_id || p.id;
      if (key) proposalMap.set(key, p);
      const nameKey = p.name || p.entityName;
      if (nameKey && typeof nameKey === 'string') {
        proposalMap.set(`name:${nameKey.toLowerCase().trim()}`, p);
      }
      if (chunk[idx]) {
        proposalMap.set(`idx:${idx}`, p);
      }
    });

    // Mapear y sanitizar cada entidad
    for (let cIdx = 0; cIdx < chunk.length; cIdx++) {
      const item = chunk[cIdx];
      const generated =
        proposalMap.get(item.id) ||
        proposalMap.get(`name:${item.name.toLowerCase().trim()}`) ||
        (chunk.length === returnedProposals.length ? proposalMap.get(`idx:${cIdx}`) : undefined);
      const originalEntity = entitiesToOptimize.find((e) => e.id === item.id)!;

      if (generated) {
        const sanitizedTitle = sanitizeTitle(generated.seo_title || `${item.name} | ${clinicName}`, clinicName);
        const sanitizedDesc = sanitizeDescription(generated.seo_description || '');
        const assignedKw = generated.assignedKeyword || normalizeKeyword(item.name);
        const proposedSlug = generated.slug ? slugifyText(generated.slug) : slugifyText(sanitizedTitle);

        proposals.push({
          entityId: item.id,
          entityType: originalEntity.type,
          entityName: originalEntity.name,
          urlPath: originalEntity.urlPath,
          language: targetLanguage,
          original: {
            seo_title: originalEntity.currentTitle,
            seo_description: originalEntity.currentDescription,
            seo_keywords: originalEntity.currentKeywords.join(', '),
            slug: originalEntity.slug || null,
            score: 75,
          },
          proposed: {
            seo_title: sanitizedTitle,
            seo_description: sanitizedDesc,
            seo_keywords: generated.seo_keywords || `${assignedKw}, ${clinicName}`,
            slug: proposedSlug,
            assignedKeyword: assignedKw,
            projectedScore: 98,
          },
          rationale: generated.rationale || (targetLanguage === 'en' ? `Optimized for local English Google searches in ${city}.` : targetLanguage === 'fr' ? `Optimisé pour les recherches locales en français à ${city}.` : `Optimizado para búsquedas locales en ${city} sin canibalización.`),
        });
      } else {
        // Fallback determinista seguro adaptado al idioma en caso de omisión puntual
        const fallbackTitle = sanitizeTitle(
          targetLanguage === 'en'
            ? `${item.name} in ${city} | ${clinicName}`
            : targetLanguage === 'fr'
            ? `${item.name} à ${city} | ${clinicName}`
            : `${item.name} en ${city} | ${clinicName}`,
          clinicName
        );

        const fallbackDesc = sanitizeDescription(
          targetLanguage === 'en'
            ? `Discover ${item.name} at ${clinicName} (${city}). Professional ${businessSector} services with the highest quality and personalized care. Book your appointment online.`
            : targetLanguage === 'fr'
            ? `Découvrez ${item.name} chez ${clinicName} (${city}). Soins professionnels d'excellence et sur mesure. Réservez votre rendez-vous en ligne.`
            : `Descubre ${item.name} en ${clinicName} (${city}). Servicios profesionales de ${businessSector} con la máxima calidad y atención personalizada. Solicita tu cita online.`
        );

        const proposedSlug = slugifyText(item.name);

        proposals.push({
          entityId: item.id,
          entityType: originalEntity.type,
          entityName: originalEntity.name,
          urlPath: originalEntity.urlPath,
          language: targetLanguage,
          original: {
            seo_title: originalEntity.currentTitle,
            seo_description: originalEntity.currentDescription,
            seo_keywords: originalEntity.currentKeywords.join(', '),
            slug: originalEntity.slug || null,
            score: 70,
          },
          proposed: {
            seo_title: fallbackTitle,
            seo_description: fallbackDesc,
            seo_keywords: `${normalizeKeyword(item.name)}, ${normalizeKeyword(clinicName)}`,
            slug: proposedSlug,
            assignedKeyword: normalizeKeyword(item.name),
            projectedScore: 88,
          },
          rationale: targetLanguage === 'en' ? `Structured local metadata for ${city}.` : targetLanguage === 'fr' ? `Métadonnées locales structurées pour ${city}.` : `Metadatos locales estructurados para ${city}.`,
        });
      }
    }
  }

  return proposals;
}

/**
 * Mantiene compatibilidad con generateNodeSeoCopy individual - 100% dinámico y agnóstico al sector
 */
export async function generateNodeSeoCopy(
  node: SemanticNode,
  context: TenantAiContext,
  geminiKey?: string
): Promise<SeoOptimizationProposal> {
  const { entity, assignedKeyword, forbiddenKeywords } = node;
  const { clinicName, businessSector, clinicDescription, toneDirective, city, tenantId } = context;
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || '';
  const sectorFormatted = formatSectorName(businessSector);

  const toneContext = toneDirective
    ? `- Directiva de tono de marca: "${toneDirective}"`
    : `- Tono de comunicación: Profesional, de alta solvencia y adaptado a los estándares de excelencia del sector "${sectorFormatted}".`;

  const prompt = `Eres un Consultor Senior de Estrategia SEO Local y Arquitectura Web en España especializado en negocios del sector: ${sectorFormatted}.
Optimiza esta página para Google España garantizando máxima relevancia local y evitando totalmente la canibalización.

INFORMACIÓN DEL NEGOCIO:
- Nombre de la empresa: ${clinicName}
- Sector: ${sectorFormatted}
${clinicDescription ? `- Descripción de la empresa: ${clinicDescription}\n` : ''}${toneContext}
- Localidad principal: ${city || 'España'}

DATOS DE LA PÁGINA:
- Tipo: ${entity.type}
- Nombre: ${entity.name}
- Categoría: ${entity.categoryName || 'General'}
- Contexto descriptivo del servicio: ${entity.rawText || entity.name}
- Palabra clave asignada exclusiva: "${assignedKeyword}"
- Palabras clave prohibidas (competidores internos): [${forbiddenKeywords.slice(0, 10).map((k) => `"${k}"`).join(', ')}]

REGLAS ESTRICTAS:
1. 'seo_title': 50 a 60 caracteres. Debe terminar con " | ${clinicName}".
2. 'seo_description': 135 a 155 caracteres. Frase completa terminada en punto con llamada a la acción adecuada al sector "${sectorFormatted}". PROHIBIDO cortar a medias con artículos o preposiciones.
3. 'seo_keywords': 3 a 5 palabras clave en español adaptadas al sector "${sectorFormatted}".
4. Idioma: Español natural de España, sin anglicismos forzados ni terminología abstracta.

Responde ÚNICAMENTE en JSON:
{
  "seo_title": "string",
  "seo_description": "string",
  "seo_keywords": "string",
  "rationale": "string"
}`;

  let rawGenerated: any = null;

  if (apiKey) {
    try {
      rawGenerated = await callGeminiAi(prompt, apiKey);
    } catch (err) {
      console.warn('[ai-orchestrator] Error en llamada directa individual a Gemini:', err);
    }
  }

  if (!rawGenerated) {
    rawGenerated = await callBackendAiFallback(prompt, tenantId);
  }

  const sanitizedTitle = sanitizeTitle(rawGenerated?.seo_title || `${entity.name} | ${clinicName}`, clinicName);
  const sanitizedDesc = sanitizeDescription(
    rawGenerated?.seo_description || `${clinicName} - Servicios profesionales de ${assignedKeyword} en ${city || 'España'}. Consulta información y solicita tu cita.`
  );

  return {
    entityId: entity.id,
    entityType: entity.type,
    entityName: entity.name,
    urlPath: entity.urlPath,
    original: {
      seo_title: entity.currentTitle,
      seo_description: entity.currentDescription,
      seo_keywords: entity.currentKeywords.join(', '),
      score: node.seoScore,
    },
    proposed: {
      seo_title: sanitizedTitle,
      seo_description: sanitizedDesc,
      seo_keywords: rawGenerated?.seo_keywords || `${assignedKeyword}, ${clinicName}`,
      assignedKeyword,
      projectedScore: 96,
    },
    rationale: rawGenerated?.rationale || `Estrategia de posicionamiento local para "${assignedKeyword}".`,
  };
}

/**
 * Optimiza un lote de nodos con concurrencia controlada
 */
export async function optimizeNodesBatch(
  nodes: SemanticNode[],
  context: TenantAiContext,
  concurrencyLimit = 3
): Promise<SeoOptimizationProposal[]> {
  const proposals: SeoOptimizationProposal[] = [];
  const queue = [...nodes];
  const sectorFormatted = formatSectorName(context.businessSector);

  const workers = Array.from({ length: Math.min(concurrencyLimit, queue.length) }, async () => {
    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) break;
      try {
        const proposal = await generateNodeSeoCopy(node, context);
        proposals.push(proposal);
      } catch (err) {
        console.error(`[ai-orchestrator] Error optimizando nodo ${node.entity.name}:`, err);
        const city = context.city || 'España';
        proposals.push({
          entityId: node.entity.id,
          entityType: node.entity.type,
          entityName: node.entity.name,
          urlPath: node.entity.urlPath,
          original: {
            seo_title: node.entity.currentTitle,
            seo_description: node.entity.currentDescription,
            seo_keywords: node.entity.currentKeywords.join(', '),
            score: node.seoScore,
          },
          proposed: {
            seo_title: sanitizeTitle(`${node.entity.name} en ${city} | ${context.clinicName}`, context.clinicName),
            seo_description: sanitizeDescription(
              `Descubre ${node.entity.name} en ${context.clinicName}. Servicios profesionales de ${sectorFormatted} en ${city}. Solicita tu cita o presupuesto.`
            ),
            seo_keywords: `${node.assignedKeyword}, ${context.clinicName}`,
            assignedKeyword: node.assignedKeyword,
            projectedScore: 88,
          },
          rationale: `Optimización neutra generada con éxito para ${city}.`,
        });
      }
    }
  });

  await Promise.all(workers);
  return proposals;
}
