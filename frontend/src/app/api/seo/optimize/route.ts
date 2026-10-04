import { NextRequest, NextResponse } from 'next/server';
import { extractTenantEcosystem, optimizeEcosystemHolistic } from '@/lib/seo-engine';
import { resolveRequestTenant } from '@/lib/seo-engine/tenant-request-resolver';

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = resolveRequestTenant(request, body);
    const entityIds: string[] | undefined = body.entityIds;

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requerido para la optimización con IA.' }, { status: 400 });
    }

    // 1. Extraer el ecosistema completo del tenant (catálogo, categorías, descripciones, sedes y ajustes)
    const ecosystem = await extractTenantEcosystem(tenantId);

    // 2. Extraer gemini_api_key del payload, de clinic_settings o de variables de entorno
    const geminiKey = (body.geminiKey as string) || ecosystem.settings?.gemini_api_key || process.env.GEMINI_API_KEY;

    // 3. Extraer idioma objetivo
    const rawLang = body.targetLanguage || body.language || 'es';
    const targetLanguage = (rawLang === 'en' || rawLang === 'fr' ? rawLang : 'es') as 'es' | 'en' | 'fr';

    // 4. Ejecutar el Agente Estratega SEO Holístico con visión de negocio y sin canibalización
    const proposals = await optimizeEcosystemHolistic(ecosystem, entityIds, geminiKey, targetLanguage);

    return NextResponse.json({
      success: true,
      count: proposals.length,
      language: targetLanguage,
      proposals,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/seo/optimize Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al generar optimizaciones SEO.' }, { status: 500 });
  }
}
