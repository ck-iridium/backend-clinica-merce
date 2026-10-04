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
  language?: 'es' | 'en' | 'fr';
  seo_title?: string | null;
  seo_description: string;
  seo_keywords?: string | null;
  slug?: string | null;
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

    const globalLanguage = body.language || 'es';

    // Ejecutar las actualizaciones en Supabase
    for (const item of proposals) {
      const lang = item.language || globalLanguage || 'es';
      const isForeign = lang !== 'es';

      try {
        if (item.entityType === 'home') {
          if (isForeign) {
            const { data: current } = await client
              .from('site_content')
              .select('translations')
              .eq('tenant_id', tenantId)
              .maybeSingle();

            let trans = current?.translations || {};
            if (typeof trans === 'string') {
              try { trans = JSON.parse(trans); } catch { trans = {}; }
            }
            if (!trans[lang]) trans[lang] = {};
            trans[lang].seo_title = item.seo_title || trans[lang].seo_title;
            trans[lang].seo_description = item.seo_description;
            if (item.seo_keywords) trans[lang].seo_keywords = item.seo_keywords;

            const { error } = await client
              .from('site_content')
              .update({ translations: trans })
              .eq('tenant_id', tenantId);

            if (error) throw error;
          } else {
            const { error } = await client
              .from('site_content')
              .update({
                seo_title: item.seo_title || null,
                seo_description: item.seo_description,
                seo_keywords: item.seo_keywords || null,
              })
              .eq('tenant_id', tenantId);

            if (error) throw error;
          }
          updatedCount++;
        } else if (item.entityType === 'category') {
          const rawCatId = item.entityId.replace('category-', '');
          if (isForeign) {
            const { data: current } = await client
              .from('service_categories')
              .select('translations')
              .eq('id', rawCatId)
              .eq('tenant_id', tenantId)
              .maybeSingle();

            let trans = current?.translations || {};
            if (typeof trans === 'string') {
              try { trans = JSON.parse(trans); } catch { trans = {}; }
            }
            if (!trans[lang]) trans[lang] = {};
            trans[lang].seo_description = item.seo_description;
            if (item.slug) trans[lang].slug = item.slug;

            const { error } = await client
              .from('service_categories')
              .update({ translations: trans })
              .eq('id', rawCatId)
              .eq('tenant_id', tenantId);

            if (error) throw error;
          } else {
            const { error } = await client
              .from('service_categories')
              .update({
                seo_description: item.seo_description,
              })
              .eq('id', rawCatId)
              .eq('tenant_id', tenantId);

            if (error) throw error;
          }
          updatedCount++;
        } else if (item.entityType === 'service') {
          const rawSvcId = item.entityId.replace('service-', '');
          if (isForeign) {
            const { data: current } = await client
              .from('services')
              .select('translations')
              .eq('id', rawSvcId)
              .eq('tenant_id', tenantId)
              .maybeSingle();

            let trans = current?.translations || {};
            if (typeof trans === 'string') {
              try { trans = JSON.parse(trans); } catch { trans = {}; }
            }
            if (!trans[lang]) trans[lang] = {};
            trans[lang].seo_title = item.seo_title || trans[lang].seo_title;
            trans[lang].seo_description = item.seo_description;
            if (item.seo_keywords) trans[lang].seo_keywords = item.seo_keywords;
            if (item.slug) trans[lang].slug = item.slug;

            const { error } = await client
              .from('services')
              .update({ translations: trans })
              .eq('id', rawSvcId)
              .eq('tenant_id', tenantId);

            if (error) throw error;
          } else {
            const updatePayload: Record<string, any> = {
              seo_title: item.seo_title || null,
              seo_description: item.seo_description,
              seo_keywords: item.seo_keywords || null,
            };
            if (item.slug) updatePayload.slug = item.slug;

            const { error } = await client
              .from('services')
              .update(updatePayload)
              .eq('id', rawSvcId)
              .eq('tenant_id', tenantId);

            if (error) throw error;
          }
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
