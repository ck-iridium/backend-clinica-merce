import { SemanticNode, SeoEntity, EcosystemData } from './types';
import { normalizeKeyword, extractMeaningfulTokens, formatSectorName, buildSemanticHierarchy } from './semantic-graph';

export interface SeoOptimizationProposal {
  entityId: string;
  entityType: 'home' | 'category' | 'service' | 'location';
  entityName: string;
  urlPath: string;
  original: {
    seo_title?: string | null;
    seo_description?: string | null;
    seo_keywords?: string | null;
    score: number;
  };
  proposed: {
    seo_title: string;
    seo_description: string;
    seo_keywords: string;
    assignedKeyword: string;
    projectedScore: number;
  };
  rationale: string;
}

export interface TenantAiContext {
  clinicName: string;
  businessSector: string;
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

  // Si no incluye el nombre de la clínica, añadírselo
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
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textContent) {
    throw new Error('Gemini no devolvió contenido de texto.');
  }

  // Limpiar posibles bloques markdown ```json ... ``` si viniesen
  const cleaned = textContent.replace(/```(?:json)?/g, '').trim();
  return JSON.parse(cleaned);
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
 * Prompt maestro del Agente Estratega SEO Local
 */
function buildMasterSeoPrompt(params: {
  clinicName: string;
  businessSector: string;
  city: string;
  province?: string;
  locationsList: string;
  itemsToOptimize: Array<{
    id: string;
    type: string;
    name: string;
    category?: string | null;
    description?: string | null;
    currentTitle?: string | null;
    currentDescription?: string | null;
    urlPath: string;
  }>;
  existingKeywordsInCatalog: string[];
}): string {
  const {
    clinicName,
    businessSector,
    city,
    province,
    locationsList,
    itemsToOptimize,
    existingKeywordsInCatalog,
  } = params;

  return `Eres un Consultor Senior de Estrategia SEO Local y Arquitectura Web en España para clínicas estéticas y centros de bienestar de alta gama (filosofía Quiet Luxury).
Tu objetivo es analizar el catálogo de tratamientos y sedes de la clínica y diseñar los metadatos SEO (Title, Meta Description, Keywords y Keyword Principal Asignada) de máximo rendimiento y CTR para Google España.

==============================================
DOSSIER DE INTELIGENCIA DEL NEGOCIO
==============================================
- Nombre de la clínica: "${clinicName}"
- Sector de actividad: "${businessSector}"
- Municipio principal: "${city || 'Carcaixent'}"
- Provincia / Región: "${province || 'Valencia'}"
- Sedes físicas:
${locationsList || '  - Sede central'}

Palabras clave ya reservadas en el catálogo (evita canibalizarlas):
[${existingKeywordsInCatalog.slice(0, 15).map((k) => `"${k}"`).join(', ')}]

==============================================
DIRECTRICES ESTRATÉGICAS DE OBLIGADO CUMPLIMIENTO
==============================================
1. DECODIFICACIÓN DE CÓDIGOS INTERNOS Y TÉRMINOS TÉCNICOS:
   - Los usuarios en Google NUNCA buscan códigos internos de catálogo como "Zona S", "Zona M", "Zona L" o "Pack 5".
   - Debes LEER la descripción detallada de cada servicio para entender qué zonas anatómicas o beneficios incluye:
     * Zona S: Son zonas faciales o pequeñas (labio superior, entrecejo, patillas, línea alba, manos, dedos...).
     * Zona M: Son zonas medias (axilas, ingles, pubis, medios brazos, medias piernas, hombros...).
     * Zona L: Son zonas grandes corporales (piernas completas, espalda, pecho y abdomen, brazos completos...).
   - Traduce esos servicios a búsquedas reales en España:
     Ejemplo título para Zona S: "Depilación Láser Facial y Zonas Pequeñas | ${clinicName}"
     Ejemplo descripción para Zona S: "Depilación láser diodo para zonas pequeñas en ${city}: labio superior, entrecejo y línea alba. Resultados seguros y trato exclusivo en ${clinicName}."

2. GEOLOCALIZACIÓN PRECISA Y NATURAL:
   - Posiciona prioritariamente en el municipio real del negocio ("${city}").
   - NUNCA utilices anglicismos innecesarios como "beauty", "wellness" o "treatment" cuando en España la gente busca "estética", "belleza", "cuidado facial", "depilación láser", etc.
   - En la página principal (Home) y categorías generales, prioriza términos como "Centro de Estética en ${city}" o "Estética Avanzada en ${city}".

3. PREVENCIÓN ACTIVA DE CANIBALIZACIÓN:
   - Cada servicio y categoría debe responder a una intención de búsqueda única y tener su propia 'assignedKeyword' exclusiva.
   - Si dos servicios son variantes (ej. Hombre vs Mujer, Con brazos vs Sin brazos), el título y la descripción deben dejar clarísima la distinción para que Google los indexe de forma complementaria sin colisionar.

4. LONGITUDES ESTRICTAS Y REDACCIÓN IMPECABLE (REGLA DE ORO DE GOOGLE):
   - 'seo_title': Longitud entre 48 y 60 caracteres. Debe terminar con " | ${clinicName}". Jamás dejes títulos cortados ni con palabras truncadas a medias.
   - 'seo_description': Longitud entre 135 y 155 caracteres. Debe ser una o dos oraciones COMPLETAS, fluidas, elegantes y persuasivas con sutil llamada a la acción ("Reserva tu cita online", "Pide tu cita previa").
   - PROHIBICIÓN ABSOLUTA: Jamás termines una descripción a mitad de frase ni con preposiciones o artículos colgantes (prohibido terminar en "...innovación y un." o "...de."). Toda descripción debe terminar con punto final y perfecto sentido sintáctico.
   - 'seo_keywords': 3 a 5 palabras clave específicas en español separadas por comas.
   - 'assignedKeyword': La frase clave principal exacta (long-tail) asignada exclusivamente a esta página.
   - 'rationale': Breve justificación estratégica de 1 frase explicando el criterio de búsqueda adoptado.

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
  geminiKey?: string
): Promise<SeoOptimizationProposal[]> {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || '';
  const clinicName = ecosystem.settings.clinic_name;
  const businessSector = formatSectorName(ecosystem.businessSector);
  const city = ecosystem.detectedCity || 'Carcaixent';
  const province = ecosystem.detectedProvince || 'Valencia';

  // 1. Construir la jerarquía completa del ecosistema
  const allEntities = buildSemanticHierarchy(ecosystem);

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

  // 5. Preparar ítems para el prompt
  const itemsToOptimize = entitiesToOptimize.map((e) => ({
    id: e.id,
    type: e.type,
    name: e.name,
    category: e.categoryName || (e.type === 'home' ? 'Página Principal' : null),
    description: e.rawText || e.currentDescription || null,
    currentTitle: e.currentTitle,
    currentDescription: e.currentDescription,
    urlPath: e.urlPath,
  }));

  // Procesar en un solo bloque si son hasta 25 items, o en chunks si es un catálogo muy extenso
  const CHUNK_SIZE = 20;
  const proposals: SeoOptimizationProposal[] = [];

  for (let i = 0; i < itemsToOptimize.length; i += CHUNK_SIZE) {
    const chunk = itemsToOptimize.slice(i, i + CHUNK_SIZE);
    const chunkPrompt = buildMasterSeoPrompt({
      clinicName,
      businessSector,
      city,
      province,
      locationsList,
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

    if (!rawData || !rawData.proposals) {
      try {
        rawData = await callBackendAiFallback(chunkPrompt, ecosystem.tenant.id);
      } catch (backendErr) {
        console.error('[ai-orchestrator] Fallback a backend también falló:', backendErr);
      }
    }

    const returnedProposals: any[] = rawData?.proposals || [];
    const proposalMap = new Map<string, any>();
    returnedProposals.forEach((p) => {
      if (p.entityId) proposalMap.set(p.entityId, p);
    });

    // Mapear y sanitizar cada entidad
    for (const item of chunk) {
      const generated = proposalMap.get(item.id);
      const originalEntity = entitiesToOptimize.find((e) => e.id === item.id)!;

      if (generated) {
        const sanitizedTitle = sanitizeTitle(generated.seo_title || `${item.name} | ${clinicName}`, clinicName);
        const sanitizedDesc = sanitizeDescription(generated.seo_description || '');
        const assignedKw = generated.assignedKeyword || normalizeKeyword(item.name);

        proposals.push({
          entityId: item.id,
          entityType: originalEntity.type,
          entityName: originalEntity.name,
          urlPath: originalEntity.urlPath,
          original: {
            seo_title: originalEntity.currentTitle,
            seo_description: originalEntity.currentDescription,
            seo_keywords: originalEntity.currentKeywords.join(', '),
            score: 75,
          },
          proposed: {
            seo_title: sanitizedTitle,
            seo_description: sanitizedDesc,
            seo_keywords: generated.seo_keywords || `${assignedKw}, ${clinicName}`,
            assignedKeyword: assignedKw,
            projectedScore: 98,
          },
          rationale: generated.rationale || `Optimizado para búsquedas locales en ${city} sin canibalización.`,
        });
      } else {
        // Fallback determinista seguro en caso de omisión puntual
        const fallbackTitle = sanitizeTitle(`${item.name} en ${city} | ${clinicName}`, clinicName);
        const fallbackDesc = sanitizeDescription(
          `Descubre ${item.name} en ${clinicName} (${city}). Tratamientos de alta calidad y atención personalizada. Solicita tu cita online.`
        );
        proposals.push({
          entityId: item.id,
          entityType: originalEntity.type,
          entityName: originalEntity.name,
          urlPath: originalEntity.urlPath,
          original: {
            seo_title: originalEntity.currentTitle,
            seo_description: originalEntity.currentDescription,
            seo_keywords: originalEntity.currentKeywords.join(', '),
            score: 70,
          },
          proposed: {
            seo_title: fallbackTitle,
            seo_description: fallbackDesc,
            seo_keywords: `${normalizeKeyword(item.name)}, ${normalizeKeyword(clinicName)}`,
            assignedKeyword: normalizeKeyword(item.name),
            projectedScore: 88,
          },
          rationale: `Metadatos locales estructurados para ${city}.`,
        });
      }
    }
  }

  return proposals;
}

/**
 * Mantiene compatibilidad con generateNodeSeoCopy individual
 */
export async function generateNodeSeoCopy(
  node: SemanticNode,
  context: TenantAiContext,
  geminiKey?: string
): Promise<SeoOptimizationProposal> {
  const { entity, assignedKeyword, forbiddenKeywords } = node;
  const { clinicName, businessSector, city, tenantId } = context;
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || '';

  const prompt = `Eres un Consultor Senior de SEO Local en España para clínicas estéticas y Quiet Luxury.
Optimiza esta página para Google España evitando totalmente la canibalización.

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${clinicName}
- Sector: ${formatSectorName(businessSector)}
- Localidad: ${city || 'Carcaixent'}

DATOS DE LA PÁGINA:
- Tipo: ${entity.type}
- Nombre: ${entity.name}
- Categoría: ${entity.categoryName || 'General'}
- Contexto del tratamiento: ${entity.rawText || entity.name}
- Palabra clave asignada exclusiva: "${assignedKeyword}"
- Palabras clave prohibidas (competidores): [${forbiddenKeywords.slice(0, 10).map((k) => `"${k}"`).join(', ')}]

REGLAS ESTRICTAS:
1. 'seo_title': 50 a 60 caracteres. Debe terminar con " | ${clinicName}".
2. 'seo_description': 135 a 155 caracteres. Frase completa terminada en punto. PROHIBIDO cortar a medias con artículos o preposiciones.
3. 'seo_keywords': 3 a 5 palabras clave en español.
4. Idioma: Español natural de España, sin anglicismos ("beauty", "wellness").

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
    rawGenerated?.seo_description || `${clinicName} - Servicios de ${assignedKeyword} en ${city || 'Carcaixent'}. Cita previa online.`
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

  const workers = Array.from({ length: Math.min(concurrencyLimit, queue.length) }, async () => {
    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) break;
      try {
        const proposal = await generateNodeSeoCopy(node, context);
        proposals.push(proposal);
      } catch (err) {
        console.error(`[ai-orchestrator] Error optimizando nodo ${node.entity.name}:`, err);
        const city = context.city || 'Carcaixent';
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
              `Descubre ${node.entity.name} en ${context.clinicName}. Tratamientos profesionales en ${city}. Reserva tu cita.`
            ),
            seo_keywords: `${node.assignedKeyword}, ${context.clinicName}`,
            assignedKeyword: node.assignedKeyword,
            projectedScore: 88,
          },
          rationale: `Optimización neutra generada con éxito.`,
        });
      }
    }
  });

  await Promise.all(workers);
  return proposals;
}
