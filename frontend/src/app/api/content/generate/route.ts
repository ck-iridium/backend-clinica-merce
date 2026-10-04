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

    // 1. Extraer ecosistema completo
    const ecosystem = await extractTenantEcosystem(tenantId);

    // 2. Extraer clave de API: del payload, de clinic_settings en Supabase o de process.env.GEMINI_API_KEY
    const geminiKey =
      (body.geminiKey as string)?.trim() ||
      ecosystem.settings?.gemini_api_key?.trim() ||
      process.env.GEMINI_API_KEY?.trim() ||
      '';

    if (!geminiKey) {
      return NextResponse.json(
        {
          error:
            'No se encontró ninguna clave de API de Gemini válida en el sistema (ni en la configuración de la clínica ni en variables de entorno). Por favor, introduce tu Gemini API Key en Ajustes > Avanzado.',
        },
        { status: 400 }
      );
    }

    // 3. Generar redacción comercial y contenido HTML en 3 idiomas concurrentes
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
