import { headers } from 'next/headers';

export const customDomainMapping: Record<string, string> = {
  "esteticamerce.com": "merce",
  "www.esteticamerce.com": "merce",
};

export interface ResolvedTenantContext {
  host: string;
  cleanHost: string;
  tenantSlug: string;
  tenantId: string;
  isMarketing: boolean;
  baseUrl: string;
  apiUrl: string;
}

export async function resolveTenantContext(): Promise<ResolvedTenantContext> {
  const requestHeaders = headers();
  const host = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '';
  const cleanHost = host.split(':')[0].toLowerCase();
  
  let tenantSlug = requestHeaders.get('x-tenant-slug') || '';
  let tenantId = requestHeaders.get('x-tenant-id') || '';

  // 1. Fallback si el middleware no inyectó las cabeceras (rutas estáticas, sitemaps o caché)
  if (!tenantSlug) {
    if (customDomainMapping[cleanHost]) {
      tenantSlug = customDomainMapping[cleanHost];
    } else if (cleanHost.endsWith('.probookia.com') && cleanHost !== 'www.probookia.com' && cleanHost !== 'probookia.com') {
      tenantSlug = cleanHost.replace('.probookia.com', '');
    } else if (cleanHost.endsWith('.localhost')) {
      tenantSlug = cleanHost.replace('.localhost', '');
    }
  }

  // 2. Determinar si es contexto marketing SaaS o clínica
  const isMarketing = !tenantSlug || tenantSlug === 'www' || cleanHost === 'probookia.com' || cleanHost === 'www.probookia.com' || cleanHost === 'localhost';

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // 3. Si es un tenant pero aún no tenemos tenantId, resolverlo directamente con Supabase (ultrarrápido)
  if (!isMarketing && !tenantId) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (supabaseUrl && serviceKey) {
      try {
        const queryFilter = tenantSlug 
          ? `or=(custom_domain.eq.${cleanHost},slug.eq.${encodeURIComponent(tenantSlug)})`
          : `custom_domain.eq.${cleanHost}`;

        const supaRes = await fetch(`${supabaseUrl}/rest/v1/tenants?select=id,slug&${queryFilter}&limit=1`, {
          headers: {
            apikey: serviceKey,
            Authorization: `Bearer ${serviceKey}`,
          },
          next: { revalidate: 3600, tags: [`tenant-${tenantSlug || cleanHost}`, 'tenant-resolver'] }
        });
        if (supaRes.ok) {
          const data = await supaRes.json();
          if (Array.isArray(data) && data.length > 0 && data[0]?.id) {
            tenantId = data[0].id;
            if (!tenantSlug && data[0].slug) {
              tenantSlug = data[0].slug;
            }
          }
        }
      } catch (e) {
        console.warn('[TENANT SUPABASE RESOLVE WARN]', e);
      }
    }
  }

  // 4. Fallback secundario al backend FastAPI en Render
  if (!isMarketing && tenantSlug && !tenantId) {
    try {
      const res = await fetch(`${apiUrl}/stripe/resolve-tenant/${tenantSlug}`, {
        next: { revalidate: 3600, tags: [`tenant-${tenantSlug}`, 'tenant-resolver'] }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.tenant_id) {
          tenantId = data.tenant_id;
        }
      }
    } catch (e) {
      console.error('[TENANT RESOLVE ERROR]', e);
    }
  }

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = host ? `${protocol}://${host}` : 'https://probookia.com';

  return {
    host,
    cleanHost,
    tenantSlug,
    tenantId,
    isMarketing,
    baseUrl,
    apiUrl,
  };
}
