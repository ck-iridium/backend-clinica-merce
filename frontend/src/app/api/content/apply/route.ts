export const maxDuration = 60;
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { resolveRequestTenant } from '@/lib/seo-engine/tenant-request-resolver';
import { ContentOptimizationProposal } from '@/lib/content-engine/types';

function getClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    return supabase;
  }
}

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

    const proposals = body.proposals as ContentOptimizationProposal[] | undefined;
    if (!proposals || !Array.isArray(proposals) || proposals.length === 0) {
      return NextResponse.json(
        { error: 'La lista de propuestas (proposals) es obligatoria y no puede estar vacía.' },
        { status: 400 }
      );
    }

    const client = getClient();
    if (!client) {
      return NextResponse.json(
        { error: 'No se pudo inicializar la conexión con Supabase.' },
        { status: 500 }
      );
    }

    let updatedCount = 0;
    const errors: string[] = [];

    for (const proposal of proposals) {
      try {
        if (proposal.entityType === 'service') {
          const serviceId = proposal.entityId.replace('service-', '');

          // Obtener traducciones actuales para no sobreescribir otros campos (slug, seo, name, etc.)
          const { data: current } = await client
            .from('services')
            .select('translations')
            .eq('id', serviceId)
            .eq('tenant_id', tenantId)
            .maybeSingle();

          let trans = current?.translations || {};
          if (typeof trans === 'string') {
            try { trans = JSON.parse(trans); } catch { trans = {}; }
          }
          if (typeof trans !== 'object' || trans === null) trans = {};

          if (!trans.en) trans.en = {};
          if (!trans.fr) trans.fr = {};

          // Actualizar descripciones y content_html en inglés
          if (proposal.proposed.en?.description) {
            trans.en.description = proposal.proposed.en.description;
          }
          if (proposal.proposed.en?.content_html) {
            trans.en.content_html = proposal.proposed.en.content_html;
          }

          // Actualizar descripciones y content_html en francés
          if (proposal.proposed.fr?.description) {
            trans.fr.description = proposal.proposed.fr.description;
          }
          if (proposal.proposed.fr?.content_html) {
            trans.fr.content_html = proposal.proposed.fr.content_html;
          }

          // Actualizar en base de datos: Español nativo + JSONB de traducciones
          const updatePayload: Record<string, any> = {
            translations: trans,
          };
          if (proposal.proposed.es?.description) {
            updatePayload.description = proposal.proposed.es.description;
          }
          if (proposal.proposed.es?.content_html !== undefined) {
            updatePayload.content_html = proposal.proposed.es.content_html;
          }

          const { error: updateErr } = await client
            .from('services')
            .update(updatePayload)
            .eq('id', serviceId)
            .eq('tenant_id', tenantId);

          if (updateErr) throw updateErr;
          updatedCount++;

        } else if (proposal.entityType === 'category') {
          const categoryId = proposal.entityId.replace('category-', '');

          const { data: current } = await client
            .from('service_categories')
            .select('translations')
            .eq('id', categoryId)
            .eq('tenant_id', tenantId)
            .maybeSingle();

          let trans = current?.translations || {};
          if (typeof trans === 'string') {
            try { trans = JSON.parse(trans); } catch { trans = {}; }
          }
          if (typeof trans !== 'object' || trans === null) trans = {};

          if (!trans.en) trans.en = {};
          if (!trans.fr) trans.fr = {};

          if (proposal.proposed.en?.description) {
            trans.en.description = proposal.proposed.en.description;
          }
          if (proposal.proposed.fr?.description) {
            trans.fr.description = proposal.proposed.fr.description;
          }

          const updatePayload: Record<string, any> = {
            translations: trans,
          };
          if (proposal.proposed.es?.description) {
            updatePayload.description = proposal.proposed.es.description;
          }

          const { error: updateErr } = await client
            .from('service_categories')
            .update(updatePayload)
            .eq('id', categoryId)
            .eq('tenant_id', tenantId);

          if (updateErr) throw updateErr;
          updatedCount++;
        }
      } catch (itemErr: any) {
        console.error(`[apply] Error aplicando propuesta a ${proposal.entityId}:`, itemErr);
        errors.push(`${proposal.entityName}: ${itemErr.message || 'Error al guardar'}`);
      }
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      totalRequested: proposals.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error('[API /api/content/apply Error]:', error);
    return NextResponse.json(
      { error: error.message || 'Error al guardar el contenido en la base de datos.' },
      { status: 500 }
    );
  }
}
