import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import { cookies, headers } from 'next/headers';

import ServiceCard from '@/components/ServiceCard';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import TreatmentActions from '@/components/TreatmentActions';
import TreatmentMedia from '@/components/TreatmentMedia';
import TreatmentScrollHandler from '@/components/TreatmentScrollHandler';
import ScrollIndicator from '@/components/ScrollIndicator';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';
import BotonReservaPro from '@/components/BotonReservaPro';

async function getServiceData(slug: string, tenantId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos

    const res = await fetch(`${baseUrl}/services/slug/${slug}`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { "X-Tenant-ID": tenantId }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      if (res.status === 404) return null;
      console.warn(`[Service Fetch Warning] Service slug ${slug} returned status: ${res.status}`);
      return null;
    }
    return await res.json();
  } catch (error: any) {
    console.error(`[Service Fetch Error] Failed to fetch service details for ${slug}:`, error.message || error);
    return null;
  }
}

async function getRelatedServices(currentServiceId: number, tenantId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return [];
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${baseUrl}/services/`, {
      cache: 'no-store',
      signal: controller.signal,
      headers: { "X-Tenant-ID": tenantId }
    });
    clearTimeout(timeoutId);

    if (!res.ok) return [];
    const services = await res.json();
    return services.filter((s: any) => s.id !== currentServiceId && s.is_active).slice(0, 24);
  } catch (error: any) {
    console.error(`[Related Services Fetch Error] Failed to fetch services for cross-selling:`, error.message || error);
    return [];
  }
}

export async function generateMetadata({ params }: { params: { category_slug: string; treatment_slug: string } }): Promise<Metadata> {
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');
  if (!tenantId) return { title: 'Centro no resuelto' };
  
  const service = await getServiceData(params.treatment_slug, tenantId);
  if (!service) return { title: 'Tratamiento no encontrado' };

  const settings = await getSettings(tenantId);
  const clinicName = settings?.clinic_name || 'Clínica';

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

  const name = translateServer(service.name, service.translations, 'name');
  const description = translateServer(service.description, service.translations, 'description');

  const seoTranslations: Record<string, Record<string, string>> = {
    es: { suffix: `| ${clinicName}`, defaultDesc: `Descubre más sobre nuestro tratamiento ${name}.`, keywords: 'tratamiento, estética, clínica' },
    en: { suffix: `| ${clinicName}`, defaultDesc: `Discover more about our ${name} treatment.`, keywords: 'treatment, aesthetics, clinic' },
    fr: { suffix: `| ${clinicName}`, defaultDesc: `Découvrez-en plus sur notre soin ${name}.`, keywords: 'soin, esthétique, clinique' }
  };
  const seoT = seoTranslations[lang] || seoTranslations.es;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://clinicamerce.com';
  const rawImageUrl = service.image_url || '';
  const imageUrl = rawImageUrl.startsWith('http') 
    ? rawImageUrl 
    : rawImageUrl.startsWith('/') 
      ? `${siteUrl}${rawImageUrl}` 
      : `${siteUrl}/${rawImageUrl}`;

  const shareUrl = `${siteUrl}/tratamientos/${params.category_slug}/${params.treatment_slug}`;
  const finalTitle = service.seo_title || `${name} ${seoT.suffix}`;
  const finalDesc = service.seo_description || description || seoT.defaultDesc;

  return {
    title: finalTitle,
    description: finalDesc,
    keywords: service.seo_keywords || seoT.keywords,
    openGraph: {
      title: finalTitle,
      description: finalDesc,
      url: shareUrl,
      siteName: clinicName,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: name,
        },
      ],
      locale: lang === 'es' ? 'es_ES' : lang === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDesc,
      images: [imageUrl],
    }
  };
}

async function getSettings(tenantId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) return null;
  try {
    const res = await fetch(`${baseUrl}/settings/`, {
      cache: 'no-store',
      headers: { "X-Tenant-ID": tenantId }
    });
    if (res.ok) return await res.json();
  } catch (e) {
    console.error("Error fetching settings in TreatmentDynamicPage:", e);
  }
  return null;
}

export default async function TreatmentDynamicPage({ params }: { params: { treatment_slug: string } }) {
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');
  if (!tenantId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDFCFB] text-stone-500 font-serif font-bold text-lg">
        Contexto del Centro No Resuelto
      </div>
    );
  }
  const [service, settings] = await Promise.all([
    getServiceData(params.treatment_slug, tenantId),
    getSettings(tenantId)
  ]);

  if (!service) {
    notFound();
  }

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

  const translatedName = translateServer(service.name, service.translations, 'name');
  const translatedDescription = translateServer(service.description, service.translations, 'description');
  const translatedContentHtml = translateServer(service.content_html, service.translations, 'content_html');
  
  const categoryName = service.category 
    ? translateServer(service.category.name, service.category.translations, 'name') 
    : (service.category_name || 'Tratamiento Especializado');

  const pageTranslations: Record<string, Record<string, string>> = {
    es: { duration: 'Duración', price: 'Precio', book_now: 'Reservar Ahora', complementary: 'Tratamientos Complementarios', discover: 'Descubre otras experiencias diseñadas para potenciar tu bienestar.', see_catalog: 'Ver catálogo completo' },
    en: { duration: 'Duration', price: 'Price', book_now: 'Book Now', complementary: 'Complementary Treatments', discover: 'Discover other experiences designed to enhance your well-being.', see_catalog: 'See full catalog' },
    fr: { duration: 'Durée', price: 'Prix', book_now: 'Réserver Maintenant', complementary: 'Soins Complémentaires', discover: 'Découvrez d\'autres expériences conçues pour améliorer votre bien-être.', see_catalog: 'Voir le catalogue complet' }
  };
  const pageT = pageTranslations[lang] || pageTranslations.es;

  const layoutPreferences = service.layout_preferences || {
    alignment: 'left',
    headerStyle: 'split',
    accentColor: '#d4af37'
  };

  const relatedServices = await getRelatedServices(service.id, tenantId);
  const translatedRelated = relatedServices.map((s: any) => ({
    ...s,
    name: translateServer(s.name, s.translations, 'name'),
    description: translateServer(s.description, s.translations, 'description')
  }));

  const getFullUrl = (url: string) => {
    if (!url) return '';
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return url.startsWith('/') && baseUrl ? `${baseUrl}${url}` : url;
  };

  return (
    <TreatmentScrollHandler>
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        
        @keyframes shine {
          0% { transform: translateX(-100%) skewX(-15deg); }
          50%, 100% { transform: translateX(250%) skewX(-15deg); }
        }
        .animate-shine {
          position: relative;
          overflow: hidden;
        }
        .animate-shine::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 40%;
          height: 100%;
          background: linear-gradient(
            to right,
            transparent,
            rgba(255, 255, 255, 0.4),
            transparent
          );
          animation: shine 4s infinite linear;
        }
      `}} />

      <section className="relative w-full snap-start snap-stop-always">
        {/* BLOQUE STICKY SINCRONIZADO: Header + Media */}
        <div className="md:sticky md:top-0 z-[100] h-auto md:h-screen w-full pointer-events-none">
          <div className="pointer-events-auto">
            <PublicNavbar />
          </div>

          <div className={`w-full md:w-[42%] lg:w-[40%] h-[75vh] md:h-[calc(100vh-80px)] -mt-10 md:mt-0 pointer-events-auto flex items-center justify-center md:justify-end px-[20px] md:px-0 ${layoutPreferences.headerStyle === 'split_video' ? 'md:py-[20px] md:pr-4' : ''} relative group`}>
            <TreatmentMedia
              imageUrl={getFullUrl(service.image_url)}
              videoUrl={service.video_url ? getFullUrl(service.video_url) : undefined}
              headerStyle={layoutPreferences.headerStyle}
              clinicName={settings?.clinic_name || 'ProBookia'}
            />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-12 z-50 md:hidden">
              <ScrollIndicator />
            </div>
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE (Texto) */}
        <div className="flex flex-col md:flex-row w-full relative z-0 md:-mt-[100vh] bg-white dark:bg-stone-950">
          {/* Espaciador invisible para dejar hueco a la columna sticky en desktop */}
          <div className="hidden md:block md:w-[42%] lg:w-[40%] shrink-0" />

          <div id="treatment-content" className="w-full md:w-[58%] lg:w-[60%] flex flex-col pt-12 md:pt-32 pb-24 px-6 md:pl-8 md:pr-12 lg:pl-16 lg:pr-24 bg-white dark:bg-stone-950 min-h-[65vh] md:min-h-[100vh]">
            <div className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-primary mb-4 block">
                {categoryName}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-stone-900 dark:text-stone-100 mb-10 leading-[1.1]">
                {translatedName}
              </h1>

              {/* SECCIÓN META */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-8 mb-16 border-y border-stone-100 dark:border-stone-800 py-10">
                <div className="flex items-center gap-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-0.5">{pageT.duration}</p>
                      <p className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 whitespace-nowrap">{service.duration_minutes} min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-50 dark:bg-stone-900 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-0.5">{pageT.price}</p>
                      <p className="text-2xl md:text-3xl font-bold text-stone-800 dark:text-stone-100 whitespace-nowrap">{service.price} €</p>
                    </div>
                  </div>
                </div>

                <div className="lg:ml-auto w-full lg:w-auto">
                  <BotonReservaPro
                    texto={pageT.book_now}
                    color={layoutPreferences.accentColor}
                    href={`/reservar?servicio=${service.id}&nombre=${encodeURIComponent(translatedName)}`}
                    className="w-full lg:w-auto"
                  />
                </div>
              </div>

              <p className="text-xl md:text-2xl text-stone-500 dark:text-stone-400 font-sans leading-relaxed mb-16 italic">
                "{translatedDescription}"
              </p>

              {translatedContentHtml && (
                <div
                  className="prose prose-stone lg:prose-xl dark:prose-invert max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:leading-relaxed prose-a:text-primary prose-img:rounded-3xl mb-16 text-stone-700 dark:text-stone-300"
                  dangerouslySetInnerHTML={{ __html: translatedContentHtml }}
                />
              )}

              <TreatmentActions serviceName={translatedName} />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: CROSS-SELLING */}
      {translatedRelated.length > 0 && (
        <section className="w-full bg-stone-50 dark:bg-stone-900/60 h-[100dvh] snap-start snap-stop-always md:h-auto md:snap-none flex flex-col pt-16 md:pt-32 border-t border-stone-100 dark:border-stone-800 overflow-hidden">
          <style dangerouslySetInnerHTML={{ __html: '.hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }' }} />
          <div className="w-full max-w-7xl mx-auto px-6 mb-8 flex flex-col md:flex-row justify-between items-end gap-4 flex-shrink-0">
            <div className="max-w-xl">
              <h2 className="text-2xl md:text-5xl font-serif text-stone-800 dark:text-stone-100 mb-2">{pageT.complementary}</h2>
              <p className="text-stone-400 dark:text-stone-400 text-xs md:text-base">{pageT.discover}</p>
            </div>
            <Link href="/tratamientos" className="hidden md:inline-flex text-sm font-bold uppercase tracking-widest text-primary border-b-2 border-primary/20 pb-1 hover:border-primary transition-all">
              {pageT.see_catalog}
            </Link>
          </div>

          <div className="w-full flex-1 min-h-0 flex flex-col justify-center pb-8">
            <div className="hidden md:block">
              {translatedRelated.length === 1 && (
                <div className="max-w-7xl mx-auto px-6">
                  <div className="w-full aspect-[16/9] md:h-[500px]"><ServiceCard service={translatedRelated[0]} className="w-full h-full" /></div>
                </div>
              )}
              {translatedRelated.length === 2 && (
                <div className="max-w-7xl mx-auto px-6 flex justify-center gap-8">
                  <div className="w-[372px] h-[662px]"><ServiceCard service={translatedRelated[0]} className="w-full h-full" /></div>
                  <div className="w-[372px] h-[662px]"><ServiceCard service={translatedRelated[1]} className="w-full h-full" /></div>
                </div>
              )}
              {translatedRelated.length >= 3 && (
                <TreatmentCarousel servicios={translatedRelated} loop={true} />
              )}
            </div>

            {/* MOBILE VIEW — INFALIBLE & SMART */}
            <div id="mobile-slider-related" className="md:hidden flex overflow-x-auto snap-x-mandatory hide-scroll gap-4 px-6 items-center w-full flex-1 min-h-0 pb-8">
              {translatedRelated.map((svc: any) => (
                <ServiceCard key={svc.id} service={svc} className="snap-stop-always" />
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="snap-start snap-stop-always">
        <Footer />
      </div>
    </TreatmentScrollHandler>
  );
}
