import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { getSupabaseAdmin, supabase } from '@/lib/supabase';
import { resolveRequestTenant } from '@/lib/seo-engine/tenant-request-resolver';

function getClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    return supabase;
  }
}

interface ProposalToApply {
  entityId: string;
  entityType: 'home' | 'category' | 'service' | 'location';
  seo_title?: string | null;
  seo_description: string;
  seo_keywords?: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const tenantId = resolveRequestTenant(request, body);
    const proposals: ProposalToApply[] = body.proposals || [];

    if (!tenantId) {
      return NextResponse.json({ error: 'tenantId requerido para aplicar los cambios SEO.' }, { status: 400 });
    }

    if (!Array.isArray(proposals) || proposals.length === 0) {
      return NextResponse.json({ error: 'Lista de propuestas vacía o inválida.' }, { status: 400 });
    }

    const client = getClient();
    if (!client) {
      return NextResponse.json({ error: 'Error al conectar con la base de datos de Supabase.' }, { status: 500 });
    }

    let updatedCount = 0;
    const errors: Array<{ entityId: string; error: string }> = [];

    // Ejecutar las actualizaciones en Supabase
    for (const item of proposals) {
      try {
        if (item.entityType === 'home') {
          const { error } = await client
            .from('site_content')
            .update({
              seo_title: item.seo_title || null,
              seo_description: item.seo_description,
              seo_keywords: item.seo_keywords || null,
            })
            .eq('tenant_id', tenantId);

          if (error) throw error;
          updatedCount++;
        } else if (item.entityType === 'category') {
          const rawCatId = item.entityId.replace('category-', '');
          const { error } = await client
            .from('service_categories')
            .update({
              seo_description: item.seo_description,
            })
            .eq('id', rawCatId)
            .eq('tenant_id', tenantId);

          if (error) throw error;
          updatedCount++;
        } else if (item.entityType === 'service') {
          const rawSvcId = item.entityId.replace('service-', '');
          const { error } = await client
            .from('services')
            .update({
              seo_title: item.seo_title || null,
              seo_description: item.seo_description,
              seo_keywords: item.seo_keywords || null,
            })
            .eq('id', rawSvcId)
            .eq('tenant_id', tenantId);

          if (error) throw error;
          updatedCount++;
        }
      } catch (err: any) {
        console.error(`[API /api/seo/apply] Error actualizando entidad ${item.entityId}:`, err);
        errors.push({ entityId: item.entityId, error: err.message || 'Error desconocido' });
      }
    }

    // Invalidar caché de Next.js para que los cambios se reflejen de inmediato en Google y el sitio
    try {
      revalidateTag(`tenant-${tenantId}`);
      revalidateTag(`tenant-content-${tenantId}`);
      revalidatePath('/', 'layout');
    } catch (e) {
      console.warn('[API /api/seo/apply] Warning invalidando caché:', e);
    }

    return NextResponse.json({
      success: true,
      updatedCount,
      totalRequested: proposals.length,
      errors: errors.length > 0 ? errors : undefined,
      appliedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[API /api/seo/apply Critical Error]:', error);
    return NextResponse.json({ error: error.message || 'Error al persistir cambios SEO en Supabase.' }, { status: 500 });
  }
}
