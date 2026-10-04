import { NextRequest, NextResponse } from 'next/server';
import { runSeoAudit } from '@/lib/seo-engine';
import { resolveRequestTenant } from '@/lib/seo-engine/tenant-request-resolver';

export async function GET(request: NextRequest) {
  const tenantId = resolveRequestTenant(request);
  if (!tenantId) {
    return NextResponse.json(
      { error: 'No se pudo identificar el tenant. Asegúrate de pasar la cabecera x-tenant-id, el parámetro ?tenantId=... o tener la cookie de sesión/impersonación activa.' },
      { status: 400 }
    );
  }

  const rawLang = request.nextUrl.searchParams.get('lang') || 'es';
  const lang = (rawLang === 'en' || rawLang === 'fr' ? rawLang : 'es') as 'es' | 'en' | 'fr';

  try {
    const report = await runSeoAudit(tenantId, lang);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[API /api/seo/audit GET Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al ejecutar la auditoría SEO.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = resolveRequestTenant(request, body);
    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId requerido en el cuerpo, parámetros, cabeceras o cookies de impersonación.' },
        { status: 400 }
      );
    }

    const rawLang = body.lang || body.language || request.nextUrl.searchParams.get('lang') || 'es';
    const lang = (rawLang === 'en' || rawLang === 'fr' ? rawLang : 'es') as 'es' | 'en' | 'fr';

    const report = await runSeoAudit(tenantId, lang);
    return NextResponse.json(report);
  } catch (error: any) {
    console.error('[API /api/seo/audit POST Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al ejecutar la auditoría SEO.' }, { status: 500 });
  }
}

