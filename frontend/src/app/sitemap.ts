import { MetadataRoute } from 'next';
import { resolveTenantContext } from '@/lib/tenant-resolver';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { tenantId, isMarketing, baseUrl, apiUrl } = await resolveTenantContext();
  const now = new Date();

  // 1. Si es la Web Matriz de ProBookia (SaaS B2B)
  if (isMarketing) {
    return [
      {
        url: `${baseUrl}/`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/marketing`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/aviso-legal`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/privacidad`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
      {
        url: `${baseUrl}/cookies`,
        lastModified: now,
        changeFrequency: 'yearly',
        priority: 0.3,
      },
    ];
  }

  // 2. Si es un Tenant (Clínica / Centro)
  const tenantRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/reservar`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tratamientos`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacidad`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookies`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Si tenemos tenantId, consultar servicios activos para indexar páginas de reserva específicas
  if (tenantId) {
    try {
      const res = await fetch(`${apiUrl}/services/public`, {
        headers: { 'X-Tenant-ID': tenantId },
        next: { revalidate: 3600 }
      });
      if (res.ok) {
        const services = await res.json();
        if (Array.isArray(services)) {
          services.forEach((s: any) => {
            if (s.id && s.is_active !== false) {
              tenantRoutes.push({
                url: `${baseUrl}/reservar?service=${s.id}`,
                lastModified: now,
                changeFrequency: 'weekly',
                priority: 0.7,
              });
            }
          });
        }
      }
    } catch (e) {
      console.error('[SITEMAP SERVICES FETCH ERROR]', e);
    }
  }

  return tenantRoutes;
}
