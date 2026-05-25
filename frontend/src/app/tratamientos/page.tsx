import Link from 'next/link';
import { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import CategoryImage from '@/components/CategoryImage';

export const metadata: Metadata = {
  title: 'Catálogo de Servicios y Experiencias',
  description: 'Explora nuestro catálogo completo de servicios y tratamientos personalizados.',
};

async function getData(tenantId: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    console.error("[tratamientos/page.tsx] process.env.NEXT_PUBLIC_API_URL is not defined.");
    return { categories: [], services: [], settings: null };
  }

  const [categoriesRes, servicesRes, settingsRes] = await Promise.all([
    fetch(`${apiUrl}/service-categories/`, {
      cache: 'no-store',
      headers: { "X-Tenant-ID": tenantId }
    }),
    fetch(`${apiUrl}/services/`, {
      cache: 'no-store',
      headers: { "X-Tenant-ID": tenantId }
    }),
    fetch(`${apiUrl}/settings/`, {
      cache: 'no-store',
      headers: { "X-Tenant-ID": tenantId }
    })
  ]);

  const categories = categoriesRes.ok ? await categoriesRes.json() : [];
  const services = servicesRes.ok ? await servicesRes.json() : [];
  const settings = settingsRes.ok ? await settingsRes.json() : null;

  return { categories, services, settings };
}

export default async function CatalogPage() {
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');
  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCFB] text-stone-500 font-serif font-bold text-lg">
        Contexto del Centro No Resuelto
      </div>
    );
  }
  const { categories, services, settings } = await getData(tenantId);

  const cookieStore = cookies();
  const lang = (cookieStore.get('preferred_language')?.value || 'es') as 'es' | 'en' | 'fr';

  const translateServer = (spanishText: string, translations: any, field: string) => {
    if (!translations) return spanishText;
    let parsed = translations;
    if (typeof translations === 'string') {
      try { parsed = JSON.parse(translations); } catch { return spanishText; }
    }
    return parsed?.[lang]?.[field] || spanishText;
  };

  // Traducción estática
  const contentMap = {
    es: {
      title: 'Catálogo de Tratamientos',
      subtitle: 'Explora todos nuestros servicios diseñados para realzar tu belleza. Selecciona una categoría para ver los detalles.',
      no_treatments: 'No hay tratamientos disponibles en este momento.',
      treatments_count: 'tratamientos disponibles',
      details: 'Ver detalles'
    },
    en: {
      title: 'Treatment Catalog',
      subtitle: 'Explore all our aesthetic services designed to enhance your natural beauty. Select a category to view details.',
      no_treatments: 'No treatments available at this moment.',
      treatments_count: 'treatments available',
      details: 'View details'
    },
    fr: {
      title: 'Catalogue de Soins',
      subtitle: 'Explorez tous nos soins esthétiques conçus pour sublimer votre beauté naturelle. Sélectionnez une catégorie pour voir les détails.',
      no_treatments: 'Aucun soin disponible pour le moment.',
      treatments_count: 'soins disponibles',
      details: 'Voir les détails'
    }
  };

  const t = contentMap[lang] || contentMap.es;

  // Traducir dinámicamente servicios y categorías
  const translatedCategories = categories.map((c: any) => ({
    ...c,
    name: translateServer(c.name, c.translations, 'name'),
    description: translateServer(c.description, c.translations, 'description')
  }));

  const translatedServices = services.map((s: any) => ({
    ...s,
    name: translateServer(s.name, s.translations, 'name'),
    description: translateServer(s.description, s.translations, 'description')
  }));

  // Filtrar solo activos
  const activeServices = translatedServices.filter((s: any) => s.is_active);

  // Agrupar servicios por categoría
  const groupedServices = activeServices.reduce((acc: Record<string, any[]>, svc: any) => {
    // Buscar la categoría completa o asignar "General" si no existe
    const category = translatedCategories.find((c: any) => c.id === svc.category_id);
    const catName = category ? category.name : (lang === 'fr' ? "Soins Généraux" : lang === 'en' ? "General Treatments" : "Tratamientos Generales");

    if (!acc[catName]) acc[catName] = [];
    acc[catName].push({ ...svc, categoryInfo: category });
    return acc;
  }, {});

  // Ordenar las categorías para que las que tienen img salgan antes o por orden alfabético
  const sortedCategoryNames = Object.keys(groupedServices).sort();

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans mt-16 md:mt-0">
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-6 mb-16 animate-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">{t.title}</h1>
          <p className="text-lg md:text-xl text-stone-500 dark:text-stone-400 mt-4 max-w-2xl font-medium">
            {t.subtitle}
          </p>
        </div>

        {sortedCategoryNames.length === 0 ? (
          <div className="max-w-7xl mx-auto px-6 py-20 text-center text-stone-400 dark:text-stone-500 font-bold border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-[3rem]">
            {t.no_treatments}
          </div>
        ) : (
          <div className="space-y-24">
            {sortedCategoryNames.map((catName) => {
              const svcs = groupedServices[catName];
              const categoryInfo = svcs[0]?.categoryInfo;

              return (
                <section key={catName} className="max-w-7xl mx-auto px-6">
                  {/* Category Header */}
                  <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-10 border-b border-stone-200 dark:border-stone-850 pb-8">
                    <Link href={`/tratamientos/${categoryInfo?.slug || categoryInfo?.id}`} className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-[1.5rem] overflow-hidden shadow-lg border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 group relative block">
                      <div className="absolute inset-0 bg-stone-900/10 group-hover:bg-stone-900/0 transition-colors z-10 pointer-events-none"></div>
                      <CategoryImage
                        src={categoryInfo?.image_url?.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${categoryInfo.image_url}` : categoryInfo?.image_url}
                        alt={catName}
                      />
                    </Link>
                    <div>
                      <Link href={`/tratamientos/${categoryInfo?.slug || categoryInfo?.id}`} className="hover:text-primary transition-colors">
                        <h2 className="text-3xl md:text-4xl font-extrabold text-stone-800 dark:text-stone-100 tracking-tight">{catName}</h2>
                      </Link>
                      <p className="text-stone-500 dark:text-stone-400 font-semibold mt-2">{svcs.length} {t.treatments_count}</p>
                    </div>
                  </div>

                  {/* Services Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {svcs.map((svc: any) => {
                      const catSlug = categoryInfo?.slug || categoryInfo?.id || 'general';
                      const serviceLink = `/tratamientos/${catSlug}/${svc.slug || svc.id}`;
                      return (
                        <Link href={serviceLink} key={svc.id} className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-stone-100 dark:border-stone-850/60 flex flex-col relative group overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-yellow-50/10 to-transparent rounded-bl-[4rem] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

                          <div className="flex justify-between items-start mb-6 gap-4 relative z-10">
                            <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary dark:text-stone-100 transition-colors">{svc.name}</h3>
                            <span className="bg-[#fcf8e5] dark:bg-yellow-950/20 text-[#b08e23] dark:text-yellow-450 px-3 py-1.5 rounded-xl font-bold text-sm shrink-0 whitespace-nowrap shadow-sm border border-yellow-100 dark:border-yellow-950/30">
                              {svc.price} €
                            </span>
                          </div>

                          <p className="text-stone-500 dark:text-stone-400 mb-8 font-medium leading-relaxed min-h-[4.5rem] relative z-10">
                            {svc.description || 'Servicio personalizado y de alta calidad.'}
                          </p>

                          <div className="mt-auto pt-6 border-t border-stone-100 dark:border-stone-800 flex justify-between items-center relative z-10">
                            <span className="text-stone-400 dark:text-stone-500 font-semibold text-sm flex items-center gap-1">
                              <span className="text-primary text-lg leading-none">⏱</span> {svc.duration_minutes} min
                            </span>
                            <span className="text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              {t.details} <span className="text-lg leading-none">→</span>
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
