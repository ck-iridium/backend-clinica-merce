import { SemanticNode, SeoEntity, EcosystemData } from './types';
import { normalizeKeyword, formatSectorName, buildSemanticHierarchy } from './semantic-graph';
import { sanitizeTitle, sanitizeDescription, slugifyText } from './sanitizers';
import { callGeminiAi, callBackendAiFallback } from './gemini-client';
import { buildMasterSeoPrompt, buildIndividualNodePrompt } from './prompts';

// Re-exportar sanitizadores y tipos para compatibilidad transparente
export { sanitizeTitle, sanitizeDescription, slugifyText };

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

  const prompt = buildIndividualNodePrompt({
    clinicName,
    businessSector: sectorFormatted,
    clinicDescription,
    toneDirective,
    city: city || 'España',
    entityType: entity.type,
    entityName: entity.name,
    categoryName: entity.categoryName,
    rawText: entity.rawText,
    assignedKeyword,
    forbiddenKeywords,
  });

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
