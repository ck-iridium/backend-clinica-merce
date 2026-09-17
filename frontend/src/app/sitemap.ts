import { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const requestHeaders = headers();
  const host = requestHeaders.get('host') || '';
  const tenantSlug = requestHeaders.get('x-tenant-slug') || '';
  const tenantId = requestHeaders.get('x-tenant-id') || '';
  
  const cleanHost = host.split(':')[0].toLowerCase();
  const isMarketing = !tenantSlug || tenantSlug === 'www' || cleanHost === 'probookia.com' || cleanHost === 'www.probookia.com';

  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
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
    } catch (e) {}
  }

  return tenantRoutes;
}
