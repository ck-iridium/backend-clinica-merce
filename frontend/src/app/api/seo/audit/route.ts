import { NextRequest, NextResponse } from 'next/server';
import { runSeoAudit } from '@/lib/seo-engine';

export async function GET(request: NextRequest) {
  const tenantId = request.headers.get('x-tenant-id');
  if (!tenantId) {
    return NextResponse.json({ error: 'Cabecera x-tenant-id requerida para auditar el tenant.' }, { status: 400 });
  }

  try {
    const report = await runSeoAudit(tenantId);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[API /api/seo/audit GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al ejecutar la auditoría SEO.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = body.tenantId || request.headers.get('x-tenant-id');
    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requerido en el cuerpo de la petición o en cabeceras.' }, { status: 400 });
    }

    const report = await runSeoAudit(tenantId);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[API /api/seo/audit POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al ejecutar la auditoría SEO.' }, { status: 500 });
  }
}
