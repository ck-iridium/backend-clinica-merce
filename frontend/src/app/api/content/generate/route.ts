export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { extractTenantEcosystem } from '@/lib/seo-engine/ecosystem-extractor';
import { generateContentBatch } from '@/lib/content-engine/content-orchestrator';
import { resolveRequestTenant } from '@/lib/seo-engine/tenant-request-resolver';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = resolveRequestTenant(request, body);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId requerido en el cuerpo, cabeceras o cookies de soporte.' },
        { status: 400 }
      );
    }

    const entityIds = body.entityIds as string[] | undefined;
    const geminiKey = body.geminiKey as string | undefined;

    // 1. Extraer ecosistema completo
    const ecosystem = await extractTenantEcosystem(tenantId);

    // 2. Generar redacción comercial y contenido HTML en 3 idiomas concurrentes
    const proposals = await generateContentBatch(ecosystem, entityIds, geminiKey);

    return NextResponse.json({
      success: true,
      count: proposals.length,
      proposals,
    });
  } catch (error: any) {
    console.error('[API /api/content/generate Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al generar contenidos con el orquestador IA.' },
      { status: 500 }
    );
  }
}
