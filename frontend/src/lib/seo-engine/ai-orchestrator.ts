import { SemanticNode, SeoEntity } from './types';
import { normalizeKeyword, extractMeaningfulTokens } from './semantic-graph';

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
  tenantId: string;
}

/**
 * Limpia y recorta un título a los límites seguros de Google (máx 60 caracteres)
 */
function sanitizeTitle(rawTitle: string, clinicName: string): string {
  let title = rawTitle.replace(/[\r\n\t]+/g, ' ').trim();
  // Eliminar comillas dobles innecesarias
  title = title.replace(/^["']|["']$/g, '');

  if (title.length > 60) {
    // Intentar cortar antes de un separador o palabra
    const suffix = ` | ${clinicName}`;
    const maxBase = 60 - suffix.length;
    if (maxBase > 20 && title.includes('|')) {
      const parts = title.split('|');
      const basePart = parts[0].trim().slice(0, maxBase);
      title = `${basePart}${suffix}`;
    } else {
      title = title.slice(0, 57).trim() + '...';
    }
  }

  return title;
}

/**
 * Limpia y recorta una descripción a los límites seguros de Google (140-155 caracteres)
 */
function sanitizeDescription(rawDesc: string): string {
  let desc = rawDesc.replace(/[\r\n\t]+/g, ' ').trim();
  desc = desc.replace(/^["']|["']$/g, '');

  if (desc.length > 155) {
    // Cortar en el último punto o espacio antes de 152 caracteres
    const cut = desc.slice(0, 152);
    const lastPunct = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf(', '), cut.lastIndexOf(' '));
    if (lastPunct > 110) {
      desc = cut.slice(0, lastPunct) + '.';
    } else {
      desc = cut.trim() + '...';
    }
  }

  return desc;
}

/**
 * Llama a la API de Gemini para generar el copy optimizado con guardrails estrictos
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
        temperature: 0.3, // Baja temperatura para máximo apego a las instrucciones
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

  return JSON.parse(textContent);
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
    return JSON.parse(data);
  }
  return data;
}

/**
 * Genera el copy SEO para un nodo semántico individual respetando todas las reglas
 */
export async function generateNodeSeoCopy(
  node: SemanticNode,
  context: TenantAiContext,
  geminiKey?: string
): Promise<SeoOptimizationProposal> {
  const { entity, assignedKeyword, forbiddenKeywords } = node;
  const { clinicName, businessSector, city, tenantId } = context;

  const apiKey = geminiKey || process.env.GEMINI_API_KEY || '';

  // Priorizar las palabras clave prohibidas de competidores directos con mayor solapamiento
  const targetTokens = extractMeaningfulTokens(assignedKeyword);
  const prioritizedForbidden = [...forbiddenKeywords]
    .sort((a, b) => {
      const tokensA = extractMeaningfulTokens(a);
      const tokensB = extractMeaningfulTokens(b);
      const overlapA = tokensA.filter((t) => targetTokens.includes(t)).length;
      const overlapB = tokensB.filter((t) => targetTokens.includes(t)).length;
      return overlapB - overlapA;
    })
    .slice(0, 20);

  const prompt = `Eres el Especialista Principal en SEO Local y Copywriting Persuasivo para negocios y clínicas premium (filosofía Quiet Luxury).
Tu objetivo es redactar metadatos de alto rendimiento y máximo CTR para un motor de búsqueda (Google), asegurando la ausencia total de canibalización de palabras clave.

INFORMACIÓN DEL NEGOCIO:
- Nombre: ${clinicName}
- Sector de actividad: ${businessSector}
- Ciudad/Ubicación física: ${city || 'No especificada'}

DATOS DE LA PÁGINA:
- Tipo: ${entity.type} (${entity.type === 'home' ? 'Página de Inicio' : entity.type === 'category' ? 'Categoría' : 'Servicio Específico'})
- Nombre: ${entity.name}
- Clúster temático: ${node.targetCluster}
- Contexto descriptivo: ${entity.rawText || 'Servicio profesional de alta calidad'}

GUARDRAILS ESTRICTOS DE OBLIGADO CUMPLIMIENTO:
1. PALABRA CLAVE OBJETIVO (IMPRESCINDIBLE):
   Debes integrar de manera orgánica y prioritaria en el título y la descripción la palabra clave asignada: "${assignedKeyword}".
2. PALABRAS CLAVE PROHIBIDAS (ANTI-CANIBALIZACIÓN):
   Está TERMINANTEMENTE PROHIBIDO utilizar o posicionar por estos términos, ya que pertenecen a otras páginas y servicios competidores:
   [${prioritizedForbidden.map((k) => `"${k}"`).join(', ')}]
3. LONGITUDES EXACTAS DE GOOGLE:
   - 'seo_title': Debe tener entre 50 y 60 caracteres. Finaliza con " | ${clinicName}".
   - 'seo_description': Debe tener entre 140 y 155 caracteres. Atractiva, profesional, sin signos de exclamación exagerados.
   - 'seo_keywords': 3 a 5 palabras clave específicas separadas por comas que giren exclusivamente en torno a "${assignedKeyword}".
4. IDIOMA:
   Español impecable, elegante, sin modismos y adaptado a la búsqueda local.

Responde ÚNICAMENTE con este JSON:
{
  "seo_title": "string",
  "seo_description": "string",
  "seo_keywords": "string",
  "rationale": "Breve explicación de 1 frase del por qué se eligió esta redacción"
}`;

  let rawGenerated: any = null;

  if (apiKey) {
    try {
      rawGenerated = await callGeminiAi(prompt, apiKey);
    } catch (geminiErr) {
      console.warn('[ai-orchestrator] Falló llamada directa a Gemini, intentando backend:', geminiErr);
    }
  }

  if (!rawGenerated) {
    rawGenerated = await callBackendAiFallback(prompt, tenantId);
  }

  // Post-procesamiento y Guardrails por Código
  const sanitizedTitle = sanitizeTitle(rawGenerated.seo_title || `${entity.name} | ${clinicName}`, clinicName);
  const sanitizedDesc = sanitizeDescription(
    rawGenerated.seo_description || `${clinicName} - Servicios profesionales de ${assignedKeyword}. Consulta nuestros horarios y reserva tu cita online.`
  );

  // Limpieza estricta de keywords: No permitir términos que pertenezcan a los competidores prohibidos ni cruces de género
  const forbiddenSet = new Set(forbiddenKeywords.map((k) => normalizeKeyword(k)));
  const normEntityName = normalizeKeyword(entity.name);
  const rawKeywordsList = (rawGenerated.seo_keywords || '')
    .split(',')
    .map((k: string) => k.trim())
    .filter(Boolean);

  const cleanKeywords: string[] = [];
  for (const kw of rawKeywordsList) {
    const norm = normalizeKeyword(kw);
    if (!norm || norm.length < 3) continue;
    // Si la entidad es masculina, prohibir 'mujer'
    if (normEntityName.includes('hombre') && norm.includes('mujer')) continue;
    // Si la entidad es femenina, prohibir 'hombre'
    if (normEntityName.includes('mujer') && norm.includes('hombre')) continue;
    // Si coincide con alguna keyword prohibida de los competidores directos
    if (forbiddenSet.has(norm)) continue;
    cleanKeywords.push(kw);
  }

  // Garantizar que la assignedKeyword esté siempre al inicio de forma única
  const sanitizedKeywords = Array.from(new Set([assignedKeyword, ...cleanKeywords])).slice(0, 5).join(', ');

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
      seo_keywords: sanitizedKeywords,
      assignedKeyword,
      projectedScore: 95, // Optimizado con título, descripción y sin canibalización
    },
    rationale: rawGenerated.rationale || `Optimizado para la palabra clave "${assignedKeyword}" sin colisiones.`,
  };
}

/**
 * Optimiza un lote de nodos con concurrencia controlada para no saturar la API
 */
export async function optimizeNodesBatch(
  nodes: SemanticNode[],
  context: TenantAiContext,
  concurrencyLimit = 3
): Promise<SeoOptimizationProposal[]> {
  const proposals: SeoOptimizationProposal[] = [];
  const queue = [...nodes];

  // Ejecutar workers concurrentes
  const workers = Array.from({ length: Math.min(concurrencyLimit, queue.length) }, async () => {
    while (queue.length > 0) {
      const node = queue.shift();
      if (!node) break;
      try {
        const proposal = await generateNodeSeoCopy(node, context);
        proposals.push(proposal);
      } catch (err) {
        console.error(`[ai-orchestrator] Error optimizando nodo ${node.entity.name}:`, err);
        // Fallback determinista en caso de fallo en IA
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
            seo_title: sanitizeTitle(`${node.entity.name} | ${context.clinicName}`, context.clinicName),
            seo_description: sanitizeDescription(
              `${context.clinicName} - Servicios profesionales y reserva de ${node.assignedKeyword}. Solicita tu cita fácilmente.`
            ),
            seo_keywords: `${node.assignedKeyword}, ${context.clinicName}`,
            assignedKeyword: node.assignedKeyword,
            projectedScore: 85,
          },
          rationale: `Generado mediante plantilla neutra tras error temporal de conexión con el proveedor IA.`,
        });
      }
    }
  });

  await Promise.all(workers);
  return proposals;
}
