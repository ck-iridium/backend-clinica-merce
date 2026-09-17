import { MetadataRoute } from 'next';
import { resolveTenantContext } from '@/lib/tenant-resolver';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const { tenantId, isMarketing, baseUrl, apiUrl } = await resolveTenantContext();

  if (isMarketing) {
    let allowSaasIndexing = true;
    const systemTenantId = process.env.NEXT_PUBLIC_SYSTEM_TENANT_ID;
    if (systemTenantId) {
      try {
        const res = await fetch(`${apiUrl}/settings/`, {
          next: { revalidate: 300 },
          headers: { 'X-Tenant-ID': systemTenantId }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.allow_search_engine_indexing !== undefined) {
            allowSaasIndexing = data.allow_search_engine_indexing;
          }
        }
      } catch (e) {}
    }

    if (!allowSaasIndexing) {
      return {
        rules: {
          userAgent: '*',
          disallow: '/',
        },
      };
    }

    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/super-admin/',
          '/api/',
          '/onboarding/',
          '/login'
        ],
      },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }

  // Contexto Tenant
  let allowTenantIndexing = true;
  if (tenantId) {
    try {
      const res = await fetch(`${apiUrl}/settings/`, {
        next: { revalidate: 300 },
        headers: { 'X-Tenant-ID': tenantId }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.allow_search_engine_indexing !== undefined) {
          allowTenantIndexing = data.allow_search_engine_indexing;
        }
      }
    } catch (e) {}
  }

  if (!allowTenantIndexing) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/super-admin/',
        '/api/',
        '/pos/',
        '/calendar/',
        '/invoices/',
        '/settings/',
        '/backups/',
        '/reservar/verificar'
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
