import { EcosystemData } from '../seo-engine/types';
import { formatSectorName } from '../seo-engine/semantic-graph';
import { ContentOptimizationProposal } from './types';

interface MasterContentPromptParams {
  clinicName: string;
  businessSector: string;
  clinicDescription?: string | null;
  toneDirective?: string;
  itemsToGenerate: Array<{
    id: string;
    type: 'service' | 'category';
    name: string;
    category?: string | null;
    currentDescription?: string | null;
    price?: number | null;
    duration?: number | null;
  }>;
}

function buildMasterContentPrompt(params: MasterContentPromptParams): string {
  const {
    clinicName,
    businessSector,
    clinicDescription,
    toneDirective,
    itemsToGenerate,
  } = params;

  const toneContext = toneDirective
    ? `- Directiva de tono de marca: "${toneDirective}"`
    : `- Tono de comunicación: Exclusivo, cercano, de alta solvencia y adaptado a los estándares de excelencia del sector "${businessSector}".`;

  return `Eres un Director Creativo y Copywriter Comercial Senior especializado en negocios y empresas del sector: ${businessSector}.
Tu misión es redactar el contenido comercial persuasivo de alta gama para los servicios y categorías de la empresa "${clinicName}".
Debes generar contenido simultáneo de nivel nativo para 3 idiomas: ESPAÑOL (ES), INGLÉS (EN) y FRANCÉS (FR).

==============================================
DOSSIER DE LA EMPRESA
==============================================
- Nombre comercial: "${clinicName}"
- Sector de actividad: "${businessSector}"
${clinicDescription ? `- Propuesta de valor: "${clinicDescription}"\n` : ''}${toneContext}

==============================================
DIRECTRICES CRÍTICAS DE REDACCIÓN Y FORMATO
==============================================
1. PARA SERVICIOS:
   A) 'description' (Extracto corto):
      - 1 o 2 frases directas, atractivas y memorables (35 a 50 palabras).
      - Diseñado para tarjetas del catálogo, vistas previas móviles y listados.
      - Enfocado en el beneficio principal y la sensación de satisfacción del cliente.
      - Texto plano, sin markdown, sin comillas envolventes.

   B) 'content_html' (Cuerpo detallado estructurado en HTML semántico):
      - Redacta una presentación completa y profesional estructurada en HTML limpio:
        * <p> introductorio: Experiencia sensorial, qué soluciona y por qué es una elección superior.
        * <ul> con 3-4 <li> acompañados de <strong> destacando beneficios clave (ej. <li><strong>Máxima precisión:</strong> ...</li>).
        * <p> de protocolo: Qué experimenta el cliente durante la sesión y sensación de confort.
        * <p> de recomendaciones: Cuidados posteriores o frecuencia sugerida para resultados duraderos.
      - PROHIBIDO TERMINANTEMENTE: NO incluyas <h1>, <h2> ni <h3> como título de la página (la web ya renderiza el título por su cuenta).
      - PROHIBIDO: NO uses markdown (\`\`\`) dentro del string HTML. Solo tags estándar (<p>, <ul>, <li>, <strong>, <em>).

2. PARA CATEGORÍAS:
   - 'description': 2 o 3 frases inspiradoras (40 a 60 palabras) que introduzcan la colección de tratamientos y la filosofía de bienestar.
   - 'content_html': null (las categorías solo requieren descripción editorial).

3. EXCELENCIA MULTI-IDIOMA CONCURRENTE (ES, EN, FR):
   - ES (Español): Español impecable de España, elegante y persuasivo.
   - EN (Inglés): Inglés de alta gama internacional/británico, natural y vendedor.
   - FR (Francés): Francés refinado, cuidado y seductor.
   - No hagas traducciones literales o robóticas; adapta los modismos a cada mercado.

==============================================
ENTIDADES A REDACTAR
==============================================
${JSON.stringify(itemsToGenerate, null, 2)}

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "proposals": [
    {
      "entityId": "string (el id exacto recibido)",
      "es": {
        "description": "string (extracto comercial en español)",
        "content_html": "string HTML o null"
      },
      "en": {
        "description": "string (extracto comercial en inglés)",
        "content_html": "string HTML o null"
      },
      "fr": {
        "description": "string (extracto comercial en francés)",
        "content_html": "string HTML o null"
      },
      "rationale": "string (breve justificación del enfoque editorial)"
    }
  ]
}`;
}

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
        temperature: 0.35,
        maxOutputTokens: 8192,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) {
    throw new Error('Respuesta vacía o formato desconocido devuelto por Gemini.');
  }

  return JSON.parse(rawText);
}

export async function generateContentBatch(
  ecosystem: EcosystemData,
  targetEntityIds?: string[],
  geminiKey?: string
): Promise<ContentOptimizationProposal[]> {
  const apiKey = geminiKey || process.env.GEMINI_API_KEY || '';
  const clinicName = ecosystem.settings.clinic_name;
  const businessSector = formatSectorName(ecosystem.businessSector);

  // 1. Filtrar las entidades que se deben generar
  const allCandidates: Array<{
    id: string;
    rawId: string;
    type: 'service' | 'category';
    name: string;
    category?: string | null;
    currentDescription?: string | null;
    currentContentHtml?: string | null;
    price?: number | null;
    duration?: number | null;
    translations?: Record<string, any> | null;
  }> = [];

  for (const cat of ecosystem.categories) {
    const prefixedId = `category-${cat.id}`;
    if (!targetEntityIds || targetEntityIds.includes(prefixedId)) {
      allCandidates.push({
        id: prefixedId,
        rawId: cat.id,
        type: 'category',
        name: cat.name,
        category: null,
        currentDescription: cat.description,
        currentContentHtml: null,
        translations: cat.translations,
      });
    }
  }

  for (const svc of ecosystem.services) {
    const prefixedId = `service-${svc.id}`;
    if (!targetEntityIds || targetEntityIds.includes(prefixedId)) {
      allCandidates.push({
        id: prefixedId,
        rawId: svc.id,
        type: 'service',
        name: svc.name,
        category: svc.category_name,
        currentDescription: svc.description,
        currentContentHtml: svc.content_html,
        price: svc.price,
        duration: svc.duration_minutes,
        translations: svc.translations,
      });
    }
  }

  if (allCandidates.length === 0) {
    return [];
  }

  // 2. Procesar en lotes (chunks) de 3 entidades para garantizar máxima calidad en 3 idiomas
  const CHUNK_SIZE = 3;
  const chunks: typeof allCandidates[] = [];
  for (let i = 0; i < allCandidates.length; i += CHUNK_SIZE) {
    chunks.push(allCandidates.slice(i, i + CHUNK_SIZE));
  }

  const proposals: ContentOptimizationProposal[] = [];

  for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
    const chunk = chunks[cIdx];

    const chunkPrompt = buildMasterContentPrompt({
      clinicName,
      businessSector,
      clinicDescription: ecosystem.settings.clinic_description,
      toneDirective: undefined,
      itemsToGenerate: chunk.map((item) => ({
        id: item.id,
        type: item.type,
        name: item.name,
        category: item.category,
        currentDescription: item.currentDescription,
        price: item.price,
        duration: item.duration,
      })),
    });

    let rawData: any = null;
    if (apiKey) {
      try {
        rawData = await callGeminiAi(chunkPrompt, apiKey);
      } catch (geminiErr) {
        console.error(`[content-orchestrator] Error en llamada a Gemini (Lote ${cIdx + 1}):`, geminiErr);
      }
    }

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
      }
    }

    const proposalMap = new Map<string, any>();
    returnedProposals.forEach((p, idx) => {
      if (!p) return;
      const key = p.entityId || p.id;
      if (key) proposalMap.set(key, p);
      if (chunk[idx]) {
        proposalMap.set(`idx:${idx}`, p);
      }
    });

    for (let i = 0; i < chunk.length; i++) {
      const item = chunk[i];
      const generated = proposalMap.get(item.id) || proposalMap.get(`idx:${i}`);

      if (generated) {
        proposals.push({
          entityId: item.id,
          entityType: item.type,
          entityName: item.name,
          categoryName: item.category,
          original: {
            description: item.currentDescription,
            content_html: item.currentContentHtml,
            translations: item.translations,
          },
          proposed: {
            es: {
              description: generated.es?.description?.trim() || item.currentDescription || '',
              content_html: item.type === 'service' ? (generated.es?.content_html?.trim() || item.currentContentHtml || null) : null,
            },
            en: {
              description: generated.en?.description?.trim() || '',
              content_html: item.type === 'service' ? (generated.en?.content_html?.trim() || null) : null,
            },
            fr: {
              description: generated.fr?.description?.trim() || '',
              content_html: item.type === 'service' ? (generated.fr?.content_html?.trim() || null) : null,
            },
          },
          rationale: generated.rationale || `Redacción comercial adaptada al sector ${businessSector}`,
        });
      }
    }
  }

  return proposals;
}
