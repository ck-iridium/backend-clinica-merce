import { NextRequest, NextResponse } from 'next/server';
import { extractTenantEcosystem } from '@/lib/seo-engine/ecosystem-extractor';
import { auditTenantContent } from '@/lib/content-engine/content-auditor';
import { resolveRequestTenant } from '@/lib/seo-engine/tenant-request-resolver';

export async function GET(request: NextRequest) {
  const tenantId = resolveRequestTenant(request);
  if (!tenantId) {
    return NextResponse.json(
      { error: 'No se pudo identificar el tenant. Pasa x-tenant-id o ?tenantId=.' },
      { status: 400 }
    );
  }

  try {
    const ecosystem = await extractTenantEcosystem(tenantId);
    const report = auditTenantContent(ecosystem);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[API /api/content/audit GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al ejecutar la auditoría de contenidos.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = resolveRequestTenant(request, body);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId requerido en el cuerpo, parámetros o cabeceras.' },
        { status: 400 }
      );
    }

    const ecosystem = await extractTenantEcosystem(tenantId);
    const report = auditTenantContent(ecosystem);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[API /api/content/audit POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al ejecutar la auditoría de contenidos.' }, { status: 500 });
  }
}
