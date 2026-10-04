import { NextRequest, NextResponse } from 'next/server';
import { extractTenantEcosystem, optimizeEcosystemHolistic } from '@/lib/seo-engine';
import { resolveRequestTenant } from '@/lib/seo-engine/tenant-request-resolver';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = resolveRequestTenant(request, body);
    const entityIds: string[] | undefined = body.entityIds;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requerido para la optimización con IA.' }, { status: 400 });
    }

    // 1. Extraer el ecosistema completo del tenant (catálogo, categorías, descripciones y sedes)
    const ecosystem = await extractTenantEcosystem(tenantId);

    // 2. Ejecutar el Agente Estratega SEO Holístico con visión de negocio y sin canibalización
    const proposals = await optimizeEcosystemHolistic(ecosystem, entityIds);

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
