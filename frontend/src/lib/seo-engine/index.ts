import { extractTenantEcosystem } from './ecosystem-extractor';
import { buildSemanticHierarchy } from './semantic-graph';
import { buildAntiCannibalizationMatrix } from './anti-cannibalization';
import { SeoAuditReport } from './types';

export * from './types';
export * from './ecosystem-extractor';
export * from './semantic-graph';
export * from './anti-cannibalization';
export * from './ai-orchestrator';

/**
 * Orquestador principal de la Fase A:
 * Realiza la auditoría SEO completa del ecosistema del tenant de forma 100% determinista.
 */
export async function runSeoAudit(tenantId: string): Promise<SeoAuditReport> {
  // 1. Extraer catálogo y datos desde Supabase
  const ecosystem = await extractTenantEcosystem(tenantId);

  // 2. Construir jerarquía semántica
  const entities = buildSemanticHierarchy(ecosystem);

  // 3. Ejecutar algoritmo anti-canibalización y scoring
  const nodes = buildAntiCannibalizationMatrix(entities, ecosystem);

  // 4. Calcular métricas agregadas globales
  const total = nodes.length;
  let optimalCount = 0;
  let warningCount = 0;
  let conflictCount = 0;
  let missingMetaCount = 0;
  let cannibalizationCount = 0;
  let sumScore = 0;

  nodes.forEach((node) => {
    sumScore += node.seoScore;
    if (node.status === 'optimal') optimalCount++;
    if (node.status === 'warning') warningCount++;
    if (node.status === 'conflict') conflictCount++;

    if (!node.entity.currentTitle || !node.entity.currentDescription) {
      missingMetaCount++;
    }
    if (node.cannibalizationRisk.hasRisk) {
      cannibalizationCount++;
    }
  });

  const overallScore = total > 0 ? Math.round(sumScore / total) : 0;

  return {
    tenantId,
    overallScore,
    summary: {
      totalEntities: total,
      optimalCount,
      warningCount,
      conflictCount,
      missingMetaCount,
      cannibalizationCount,
    },
    nodes,
    timestamp: new Date().toISOString(),
  };
}
