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
      url: `${baseUrl}/contacto`,
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

  // Set para deduplicar rutas de forma segura
  const seenUrls = new Set<string>(tenantRoutes.map((r) => r.url));

  if (tenantId && apiUrl) {
    const headers = { 'X-Tenant-ID': tenantId };

    try {
      const [categoriesRes, servicesRes, navRes, locationsRes] = await Promise.all([
        fetch(`${apiUrl}/service-categories/`, {
          headers,
          next: { revalidate: 3600, tags: [`tenant-${tenantId}-sitemap-categories`] },
        }).catch((e) => {
          console.error('[SITEMAP CATEGORIES FETCH ERROR]', e);
          return null;
        }),
        fetch(`${apiUrl}/services/`, {
          headers,
          next: { revalidate: 3600, tags: [`tenant-${tenantId}-sitemap-services`] },
        }).catch((e) => {
          console.error('[SITEMAP SERVICES FETCH ERROR]', e);
          return null;
        }),
        fetch(`${apiUrl}/cms/navigation`, {
          headers,
          next: { revalidate: 3600, tags: [`tenant-${tenantId}-sitemap-nav`] },
        }).catch((e) => {
          console.error('[SITEMAP CMS NAV FETCH ERROR]', e);
          return null;
        }),
        fetch(`${apiUrl}/locations/`, {
          headers,
          next: { revalidate: 3600, tags: [`tenant-${tenantId}-sitemap-locations`] },
        }).catch((e) => {
          console.error('[SITEMAP LOCATIONS FETCH ERROR]', e);
          return null;
        }),
      ]);

      // Mapeo de categorías para lookup rápido de slugs
      const categoryMap = new Map<string, string>(); // categoryId -> slug

      // A. Inyectar Categorías de Tratamientos (/tratamientos/[category_slug])
      if (categoriesRes && categoriesRes.ok) {
        const categories = await categoriesRes.json();
        if (Array.isArray(categories)) {
          for (const cat of categories) {
            if (cat.id && cat.slug) {
              categoryMap.set(cat.id, cat.slug);
            }
            if (cat.slug && cat.is_active !== false) {
              const catUrl = `${baseUrl}/tratamientos/${cat.slug}`;
              if (!seenUrls.has(catUrl)) {
                seenUrls.add(catUrl);
                tenantRoutes.push({
                  url: catUrl,
                  lastModified: now,
                  changeFrequency: 'weekly',
                  priority: 0.8,
                });
              }
            }
          }
        }
      }

      // B. Inyectar Tratamientos Individuales (/tratamientos/[category_slug]/[service_slug])
      if (servicesRes && servicesRes.ok) {
        const services = await servicesRes.json();
        if (Array.isArray(services)) {
          for (const s of services) {
            if (s.slug && s.is_active !== false) {
              // Resolver category_slug
              const categorySlug =
                s.category_slug ||
                s.category?.slug ||
                (s.category_id ? categoryMap.get(s.category_id) : null) ||
                'general';

              const serviceUrl = `${baseUrl}/tratamientos/${categorySlug}/${s.slug}`;
              if (!seenUrls.has(serviceUrl)) {
                seenUrls.add(serviceUrl);
                tenantRoutes.push({
                  url: serviceUrl,
                  lastModified: now,
                  changeFrequency: 'weekly',
                  priority: 0.7,
                });
              }
            }
          }
        }
      }

      // C. Inyectar Páginas personalizadas del CMS (/[slug])
      if (navRes && navRes.ok) {
        const navItems = await navRes.json();
        if (Array.isArray(navItems)) {
          for (const item of navItems) {
            if (item.is_custom && item.is_visible !== false && item.path) {
              const normalizedPath = item.path.startsWith('/') ? item.path : `/${item.path}`;
              const customPageUrl = `${baseUrl}${normalizedPath}`;
              if (!seenUrls.has(customPageUrl)) {
                seenUrls.add(customPageUrl);
                tenantRoutes.push({
                  url: customPageUrl,
                  lastModified: now,
                  changeFrequency: 'monthly',
                  priority: 0.6,
                });
              }
            }
          }
        }
      }

      // D. Inyectar Sedes Activas (/sedes/[slug])
      if (locationsRes && locationsRes.ok) {
        const locations = await locationsRes.json();
        if (Array.isArray(locations)) {
          for (const loc of locations) {
            if (loc.slug && loc.is_active !== false) {
              const locationUrl = `${baseUrl}/sedes/${loc.slug}`;
              if (!seenUrls.has(locationUrl)) {
                seenUrls.add(locationUrl);
                tenantRoutes.push({
                  url: locationUrl,
                  lastModified: now,
                  changeFrequency: 'weekly',
                  priority: 0.9,
                });
              }
            }
          }
        }
      }
    } catch (e) {
      console.error('[SITEMAP GENERATION ERROR]', e);
    }
  }

  return tenantRoutes;
}
