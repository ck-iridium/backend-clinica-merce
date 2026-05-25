import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies, headers } from 'next/headers';

import PublicNavbar from '@/components/PublicNavbar';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import ServiceCard from '@/components/ServiceCard';
import Footer from '@/components/Footer';
import CategoryHero from '@/components/CategoryHero';

// Local static translations
const categoryPageTranslations: Record<string, Record<string, string>> = {
  es: {
    'page.catalog_of': 'Catálogo de',
    'page.options_available': 'opciones disponibles',
    'page.see_all_treatments': 'Ver todos los tratamientos',
    'page.see_all': 'Ver todos',
    'page.excellence_in': 'Excelencia en',
    'page.other_categories': 'Otras Categorías',
    'page.explore_more': 'Explora más servicios de medicina estética avanzada.',
    'page.see_full_catalog': 'Ver todo el catálogo',
    'page.explore': 'Explorar',
    'page.not_found': 'Categoría no encontrada'
  },
  en: {
    'page.catalog_of': 'Catalog of',
    'page.options_available': 'options available',
    'page.see_all_treatments': 'See all treatments',
    'page.see_all': 'See all',
    'page.excellence_in': 'Excellence in',
    'page.other_categories': 'Other Categories',
    'page.explore_more': 'Explore more advanced medical aesthetic services.',
    'page.see_full_catalog': 'See full catalog',
    'page.explore': 'Explore',
    'page.not_found': 'Category not found'
  },
  fr: {
    'page.catalog_of': 'Catalogue de',
    'page.options_available': 'options disponibles',
    'page.see_all_treatments': 'Voir tous los soins',
    'page.see_all': 'Voir tous',
    'page.excellence_in': 'Excellence en',
    'page.other_categories': 'Autres Catégories',
    'page.explore_more': 'Explorez d\'autres services d\'esthétique médicale avancée.',
    'page.see_full_catalog': 'Voir tout le catalogue',
    'page.explore': 'Explorer',
    'page.not_found': 'Catégorie non trouvée'
  }
};

// Helpers to get data with crash protection and timeouts
async function getCategoryData(slug: string, tenantId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos

    const res = await fetch(`${baseUrl}/service-categories/slug/${slug}`, {
      next: { revalidate: 60 },
      signal: controller.signal,
      headers: { "X-Tenant-ID": tenantId }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn(`[Category Fetch Warning] Slug ${slug} returned status: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error: any) {
    console.error(`[Category Fetch Error] Failed to fetch category ${slug}:`, error.message || error);
    return null;
  }
}

async function getSettings(tenantId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;
  try {
    const res = await fetch(`${baseUrl}/settings/`, {
      next: { revalidate: 60 },
      headers: { "X-Tenant-ID": tenantId }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Error fetching settings:", e);
  }
  return null;
}

async function getAllCategories(tenantId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${baseUrl}/service-categories/`, {
      next: { revalidate: 60 },
      signal: controller.signal,
      headers: { "X-Tenant-ID": tenantId }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    return await res.json();
  } catch (error: any) {
    console.error(`[Categories List Fetch Error] Failed to fetch service categories:`, error.message || error);
    return [];
  }
}

async function getServices(tenantId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${baseUrl}/services/`, {
      next: { revalidate: 60 },
      signal: controller.signal,
      headers: { "X-Tenant-ID": tenantId }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    return await res.json();
  } catch (error: any) {
    console.error(`[Services List Fetch Error] Failed to fetch services:`, error.message || error);
    return [];
  }
}

const getFullUrl = (url: string) => {
  if (!url) return '';
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return url.startsWith('/') && baseUrl ? `${baseUrl}${url}` : url;
};

// Helper for translations on the server side
const translateField = (fieldVal: string, translations: any, fieldKey: string, lang: string) => {
  if (lang === 'es' || !translations) return fieldVal;
  
  let parsedTrans = translations;
  if (typeof translations === 'string') {
    try {
      parsedTrans = JSON.parse(translations);
    } catch {
      parsedTrans = {};
    }
  }
  
  const langTrans = parsedTrans[lang];
  if (langTrans && langTrans[fieldKey]) {
    return langTrans[fieldKey];
  }
  
  return fieldVal;
};

export async function generateMetadata({ params }: { params: { category_slug: string } }): Promise<Metadata> {
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');
  if (!tenantId) return { title: 'Centro no resuelto' };
  
  const [category, settings] = await Promise.all([
    getCategoryData(params.category_slug, tenantId),
    getSettings(tenantId)
  ]);
  if (!category) return { title: 'Categoría no encontrada' };

  const clinicName = settings?.clinic_name || 'Estética';

  const cookieStore = cookies();
  const lang = cookieStore.get('preferred_language')?.value || 'es';
  const translatedName = translateField(category.name, category.translations, 'name', lang);
  const translatedDesc = translateField(category.seo_description || category.description, category.translations, 'seo_description', lang) || `Descubre nuestra categoría de ${translatedName}.`;

  return {
    title: `${translatedName} | ${clinicName}`,
    description: translatedDesc,
  };
}

export default async function CategoryDynamicPage({ params }: { params: { category_slug: string } }) {
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');
  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCFB] text-stone-500 font-serif font-bold text-lg">
        Contexto del Centro No Resuelto
      </div>
    );
  }

  const category = await getCategoryData(params.category_slug, tenantId);
  if (!category) notFound();

  const [allCategories, allServices, settings] = await Promise.all([
    getAllCategories(tenantId),
    getServices(tenantId),
    getSettings(tenantId)
  ]);

  const cookieStore = cookies();
  const lang = cookieStore.get('preferred_language')?.value || 'es';

  const t = (key: string, defaultValue: string) => {
    return categoryPageTranslations[lang]?.[key] || defaultValue;
  };

  const translate = (fieldVal: string, translations: any, fieldKey: string) => {
    return translateField(fieldVal, translations, fieldKey, lang);
  };

  const translatedCategoryName = translate(category.name, category.translations, 'name');
  
  const categoryServices = allServices.filter((s: any) => s.category_id === category.id && s.is_active);
  // Máximo 4 categorías para el Bento Grid
  const otherCategories = allCategories.filter((c: any) => c.id !== category.id && c.is_active).slice(0, 4);

  // Translate services list
  const translatedCategoryServices = categoryServices.map((s: any) => ({
    ...s,
    name: translate(s.name, s.translations, 'name'),
    description: translate(s.description, s.translations, 'description')
  }));

  // Translate other categories list
  const translatedOtherCategories = otherCategories.map((c: any) => ({
    ...c,
    name: translate(c.name, c.translations, 'name'),
    description: translate(c.description, c.translations, 'description')
  }));

  // Fallback localized editorial text
  const host = requestHeaders.get('host') || '';
  const hostParts = host.split('.');
  let resolvedTenantName = 'nuestro centro';
  if (hostParts.length > 1 && hostParts[0] !== 'www') {
    resolvedTenantName = hostParts[0]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
  const clinicName = settings?.clinic_name || resolvedTenantName;
  
  const translatedEditorialText = translate(category.seo_description || category.description, category.translations, 'seo_description') || 
    (lang === 'fr' 
      ? `Découvrez les services et prestations personnalisés haut de gamme de ${translatedCategoryName.toLowerCase()} chez ${clinicName}. Nous vous accueillons dans un cadre élégant dédié à votre bien-être.`
      : lang === 'en'
        ? `Explore the high-end, customized ${translatedCategoryName.toLowerCase()} services and treatments at ${clinicName}. We welcome you to an elegant space dedicated to your wellness.`
        : `Explore los servicios y tratamientos personalizados de alta gama de ${translatedCategoryName.toLowerCase()} en ${clinicName}. Le damos la bienvenida a un espacio elegante dedicado a su bienestar.`);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-900 selection:bg-[#d4af37]/30">

      {/* CONTENEDOR MAESTRO DE SNAP (Móvil) */}
      <main className="w-full h-[100dvh] overflow-y-auto snap-y-mandatory md:h-auto md:overflow-visible md:snap-none scroll-smooth-premium relative">

        {/* 1. HERO DE CATEGORÍA CINEMATOGRÁFICO */}
        <section className="h-[100dvh] snap-start snap-stop-always md:h-[65vh] md:snap-none">
          <CategoryHero category={category} />
        </section>

        {/* 2. SLIDER DE TRATAMIENTOS */}
        {translatedCategoryServices.length > 0 && (
          <section id="treatment-content" className="relative z-20 w-full overflow-hidden h-[100dvh] snap-start snap-stop-always md:h-auto md:snap-none flex flex-col bg-[#F5F2EE] dark:bg-stone-900">
            <style dangerouslySetInnerHTML={{ __html: '.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }' }} />
            <div className="pt-16 md:pt-24 pb-8 flex-1 flex flex-col min-h-0">
              <div className="max-w-7xl mx-auto px-6 mb-4 flex flex-col md:flex-row md:justify-between md:items-end gap-2 md:gap-8 flex-shrink-0">
                <div>
                  <h2 className="text-2xl md:text-4xl font-serif font-bold text-stone-800 dark:text-stone-100">
                    {t('page.catalog_of', 'Catálogo de')} {translatedCategoryName}
                  </h2>
                  <p className="text-stone-400 font-medium text-xs md:text-base">{translatedCategoryServices.length} {t('page.options_available', 'opciones disponibles')}</p>
                </div>
                <Link href="/tratamientos" className="self-end md:self-auto inline-flex items-center gap-2 font-bold text-primary hover:text-stone-900 dark:hover:text-white transition-colors uppercase tracking-widest text-[10px] md:text-sm">
                  <span className="hidden md:inline">{t('page.see_all_treatments', 'Ver todos los tratamientos')}</span>
                  <span className="md:hidden">{t('page.see_all', 'Ver todos')}</span>
                  <span className="text-xl">→</span>
                </Link>
              </div>

              <div className="md:block hidden flex-1 min-h-0 flex flex-col justify-center">
                {translatedCategoryServices.length === 1 ? (
                  <div className="max-w-7xl mx-auto px-6 w-full">
                    <div className="w-full">
                      <ServiceCard
                        service={translatedCategoryServices[0]}
                        className="!w-full !md:w-full !h-[600px] !md:h-[600px]"
                      />
                    </div>
                  </div>
                ) : (
                  <TreatmentCarousel servicios={translatedCategoryServices} loop={false} />
                )}
              </div>

              {/* MOBILE VIEW */}
              <div id="mobile-slider-category" className="md:hidden flex overflow-x-auto snap-x-mandatory hide-scroll gap-4 px-6 items-center w-full flex-1 min-h-0 pb-8">
                {translatedCategoryServices.map((svc: any) => (
                  <ServiceCard key={svc.id} service={svc} className="snap-stop-always" />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 3. SECCIÓN SEO EDITORIAL (Imantada) */}
        <section className="pt-16 pb-24 md:py-32 bg-white dark:bg-stone-950 min-h-[100dvh] snap-start snap-stop-always md:min-h-0 md:snap-none flex flex-col justify-center">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24 items-start">
            <div className="md:col-span-4 md:sticky md:top-32">
              <div className="w-16 h-1 bg-primary mb-6 rounded-full"></div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                {t('page.excellence_in', 'Excelencia en')} <br /> <span className="text-primary">{translatedCategoryName}</span>
              </h2>
            </div>
            <div className="md:col-span-8">
              <div className="prose prose-stone lg:prose-lg max-w-none text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-line font-medium">
                {translatedEditorialText}
              </div>
            </div>
          </div>
        </section>

        {/* 4. DESCUBRE OTRAS CATEGORÍAS (Bento Grid) */}
        {translatedOtherCategories.length > 0 && (
          <section className="pt-16 pb-24 md:py-32 bg-[#F5F2EE] dark:bg-stone-900/60 min-h-[100dvh] snap-start snap-stop-always md:min-h-0 md:snap-none flex flex-col justify-center">
            <div className="w-full max-w-7xl mx-auto px-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-10">
                <div>
                  <h2 className="text-2xl md:text-5xl font-serif font-extrabold text-stone-900 dark:text-stone-100">{t('page.other_categories', 'Otras Categorías')}</h2>
                  <p className="text-stone-500 dark:text-stone-400 mt-2 text-sm md:text-lg">{t('page.explore_more', 'Explora más servicios y categorías de nuestro catálogo.')}</p>
                </div>
                <Link href="/tratamientos" className="text-primary font-bold uppercase tracking-widest text-[10px] md:text-sm hover:text-stone-900 dark:hover:text-white transition-colors">
                  {t('page.see_full_catalog', 'Ver todo el catálogo')} →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
                {translatedOtherCategories.map((other: any, idx: number) => {
                  let gridClasses = "";

                  if (translatedOtherCategories.length === 3) {
                    if (idx === 0) gridClasses = "md:col-span-2 md:row-span-2 h-[400px] md:h-full";
                    else gridClasses = "md:col-span-2 md:row-span-1 h-[300px] md:h-full";
                  } else if (translatedOtherCategories.length === 2) {
                    gridClasses = "md:col-span-2 md:row-span-2 h-[400px] md:h-full";
                  } else {
                    if (idx === 0) gridClasses = "md:col-span-2 md:row-span-2 h-[400px] md:h-full";
                    else if (idx === 1) gridClasses = "md:col-span-2 md:row-span-1 h-[300px] md:h-full";
                    else gridClasses = "md:col-span-1 md:row-span-1 h-[300px] md:h-full";
                  }

                  return (
                    <Link
                      key={other.id}
                      href={`/tratamientos/${other.slug || other.id}`}
                      className={`group relative rounded-[2.5rem] overflow-hidden shadow-luxury hover:shadow-2xl transition-all duration-700 block ${gridClasses}`}
                    >
                      {/* Imagen de Fondo */}
                      <div className="absolute inset-0 transition-transform duration-1000 group-hover:scale-110">
                        <img
                          src={other.image_url?.startsWith('/') && process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}${other.image_url}` : other.image_url}
                          alt={other.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/20 to-transparent transition-opacity duration-700 group-hover:opacity-60"></div>

                      {/* Contenido Sincronizado */}
                      <div className="absolute bottom-0 left-0 p-8 w-full z-10">
                        <div className="transform transition-transform duration-500 group-hover:-translate-y-6">
                          <h3 className={`${(translatedOtherCategories.length === 3 && idx === 0) || translatedOtherCategories.length === 2 ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'} font-serif font-bold text-white mb-2 leading-tight`}>
                            {other.name}
                          </h3>
                          <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 absolute top-full left-0 mt-2">
                            <span className="text-primary font-black uppercase text-[10px] tracking-[0.3em] flex items-center gap-2">
                              {t('page.explore', 'Explorar')} <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* 5. FOOTER */}
        <div className="snap-start snap-stop-always">
          <Footer />
        </div>

      </main>
    </div>
  );
}
