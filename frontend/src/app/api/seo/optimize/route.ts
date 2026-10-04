import { NextRequest, NextResponse } from 'next/server';
import { runSeoAudit, optimizeNodesBatch, extractTenantEcosystem } from '@/lib/seo-engine';
import { resolveRequestTenant } from '@/lib/seo-engine/tenant-request-resolver';

// Caché en memoria de corta duración (60s) para acelerar los lotes concurrentes del cliente
interface OptimizeCacheEntry {
  report: any;
  ecosystem: any;
  timestamp: number;
}
const optimizeCache = new Map<string, OptimizeCacheEntry>();
const CACHE_TTL_MS = 60_000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = resolveRequestTenant(request, body);
    const entityIds: string[] | undefined = body.entityIds;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requerido para la optimización con IA.' }, { status: 400 });
    }

    // 1. Obtener o reusar auditoría y ecosistema desde caché de corta duración
    let cached = optimizeCache.get(tenantId);
    let report: any;
    let ecosystem: any;

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      report = cached.report;
      ecosystem = cached.ecosystem;
    } else {
      [report, ecosystem] = await Promise.all([
        runSeoAudit(tenantId),
        extractTenantEcosystem(tenantId),
      ]);
      optimizeCache.set(tenantId, { report, ecosystem, timestamp: Date.now() });
    }

    // 2. Determinar qué nodos optimizar
    let nodesToOptimize = report.nodes;
    if (Array.isArray(entityIds) && entityIds.length > 0) {
      nodesToOptimize = report.nodes.filter((n: any) => entityIds.includes(n.entity.id));
    } else {
      // Por defecto, optimizar aquellos que tengan conflictos o advertencias, o todos si están vacíos
      nodesToOptimize = report.nodes.filter(
        (n: any) => n.status === 'conflict' || n.status === 'warning' || !n.entity.currentDescription
      );
      if (nodesToOptimize.length === 0) {
        nodesToOptimize = report.nodes; // Si todos están bien, permitir re-optimizar todo el catálogo
      }
    }

    if (nodesToOptimize.length === 0) {
      return NextResponse.json({
        success: true,
        proposals: [],
        message: 'No se encontraron entidades que requieran optimización.',
      });
    }

    // 3. Ejecutar orquestador IA con Guardrails
    const context = {
      clinicName: ecosystem.settings.clinic_name,
      businessSector: ecosystem.businessSector,
      city: ecosystem.detectedCity,
      tenantId,
    };

    const proposals = await optimizeNodesBatch(nodesToOptimize, context, 3);

    return NextResponse.json({
      success: true,
      count: proposals.length,
      proposals,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/seo/optimize Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al generar optimizaciones SEO.' }, { status: 500 });
  }
}
