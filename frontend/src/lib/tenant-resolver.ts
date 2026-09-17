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

  // 3. Si es un tenant pero aún no tenemos tenantId, resolverlo directamente con el backend
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
