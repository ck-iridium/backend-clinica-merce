"use client";
import Link from 'next/link';
import ServiceCard from '@/components/ServiceCard';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';
import { useLanguage } from '@/app/contexts/LanguageContext';

// ─── Componente de Bento Grid por categoría ───────────────────────────────────
function BentoCategoryGrid({ services }: { services: any[] }) {
  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  if (services.length === 0) return null;

  // Layouts adaptativos según nº de servicios
  const gridClass =
    services.length === 1 ? 'grid-cols-1' :
    services.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
    services.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
    'grid-cols-2 md:grid-cols-4';

  return (
    <div className={`grid ${gridClass} gap-4 md:gap-6 w-full max-w-7xl mx-auto px-6`}>
      {services.map((svc: any, idx: number) => {
        // Primera card: más grande si hay 4+
        const isLarge = services.length >= 4 && idx === 0;
        return (
          <Link
            key={svc.id}
            href={`/tratamientos/${svc.category_slug || 'general'}/${svc.slug || svc.id}`}
            className={`group relative rounded-3xl overflow-hidden bg-stone-100 shadow-sm hover:shadow-xl transition-all duration-500 ${
              isLarge ? 'md:col-span-2 md:row-span-2' : ''
            }`}
            style={{ aspectRatio: isLarge ? '4/3' : '3/4' }}
          >
            {svc.image_url ? (
              <img
                src={getFullUrl(svc.image_url)}
                alt={svc.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-stone-200 flex items-center justify-center">
                <span className="font-serif text-stone-400 text-xs italic">Sin Imagen</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent z-10" />
            <div className="absolute bottom-0 left-0 w-full p-6 z-20">
              <p className="text-[#d4af37] text-[10px] font-black uppercase tracking-widest mb-1">
                {svc.duration_minutes} min · {svc.price} €
              </p>
              <h4 className="text-white font-serif font-bold text-lg leading-tight line-clamp-2">
                {svc.name}
              </h4>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRADUCCIONES INLINE
// ─────────────────────────────────────────────────────────────────────────────
const homeTranslations: Record<string, Record<string, string>> = {
  es: {
    'home.discover_treatments': 'Descubre nuestros tratamientos exclusivos diseñados para resaltar tu belleza natural.',
    'home.see_catalog': 'Ver Catálogo',
    'home.see_all': 'Ver todo',
    'home.loading': 'Cargando la web...'
  },
  en: {
    'home.discover_treatments': 'Discover our exclusive treatments designed to highlight your natural beauty.',
    'home.see_catalog': 'View Catalog',
    'home.see_all': 'See all',
    'home.loading': 'Loading website...'
  },
  fr: {
    'home.discover_treatments': 'Découvrez nos soins exclusifs conçus para sublimer votre beauté naturelle.',
    'home.see_catalog': 'Voir le Catalogue',
    'home.see_all': 'Voir tout',
    'home.loading': 'Chargement du site...'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ClientHome({ content, settings, services, categories }: any) {
  const { translate, language } = useLanguage();
  const lang = language || 'es';

  const t = (key: string, fallback: string) =>
    homeTranslations[lang]?.[key] || fallback;

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen text-stone-500 font-bold">
        {t('home.loading', 'Cargando la web...')}
      </div>
    );
  }

  // Layout global elegido en el CMS
  const layoutStyle: 'cards_slider' | 'bento_grid' = content.layout_style || 'cards_slider';

  // Traducir servicios y categorías
  const translatedServices = services.map((s: any) => ({
    ...s,
    name: translate(s.name, s.translations, 'name'),
    description: translate(s.description, s.translations, 'description'),
  }));

  const translatedCategories = categories.map((c: any) => ({
    ...c,
    name: translate(c.name, c.translations, 'name'),
    description: translate(c.description, c.translations, 'description'),
  }));

  // Solo categorías activas, respetando su order_index
  const activeCategories = translatedCategories
    .filter((c: any) => c.is_active)
    .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));

  // Calcular orden final de secciones desde el JSON guardado
  const baseSections = [
    { id: 'hero', type: 'hero' },
    { id: 'about', type: 'about' },
    { id: 'cta', type: 'cta' },
  ];

  const catSections = activeCategories.map((c: any) => ({
    id: c.id,
    type: 'category',
    data: c,
  }));

  const allAvailable = [...baseSections, ...catSections];
  let orderedSections: any[] = [];

  if (content.home_sections_order) {
    try {
      const savedOrder = JSON.parse(content.home_sections_order);
      savedOrder.forEach((id: string) => {
        const found = allAvailable.find(s => s.id === id);
        if (found) orderedSections.push(found);
      });
      allAvailable.forEach(s => {
        if (!orderedSections.find(o => o.id === s.id)) orderedSections.push(s);
      });
    } catch {
      orderedSections = [...baseSections.slice(0, 2), ...catSections, baseSections[2]];
    }
  } else {
    orderedSections = [...baseSections.slice(0, 2), ...catSections, baseSections[2]];
  }

  // Hero siempre primero
  const hero = orderedSections.find(s => s.type === 'hero') || baseSections[0];
  const middle = orderedSections.filter(s => s.type !== 'hero' && s.type !== 'seo');
  const finalOrder = [hero, ...middle];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <main className="w-full h-[100dvh] overflow-y-auto snap-y-mandatory md:h-auto md:overflow-visible md:snap-none scroll-smooth relative">

        {finalOrder.map((section, index) => {

          // ── HERO ──────────────────────────────────────────────────────────
          if (section.type === 'hero') {
            return (
              <section
                key="hero"
                className={`relative h-[100dvh] min-h-[600px] w-full flex snap-start snap-stop-always md:snap-none
                  ${content.hero_alignment === 'top' ? 'items-start pt-48' : content.hero_alignment === 'bottom' ? 'items-end pb-32' : 'items-center'}
                  ${content.hero_horizontal_alignment === 'left' ? 'justify-start' : content.hero_horizontal_alignment === 'right' ? 'justify-end' : 'justify-center'}
                  p-6 md:p-12 overflow-hidden mt-0`}
              >
                {/* Único Navbar — montado en este Hero para la home pública */}
                <div className="absolute top-0 left-0 w-full z-[100]">
                  <PublicNavbar />
                </div>

                {content.hero_video_url ? (
                  <div className="absolute inset-0 z-0 bg-stone-900">
                    <video autoPlay loop muted playsInline className="w-full h-full object-cover">
                      <source src={content.hero_video_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${content.hero_video_url}` : content.hero_video_url} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply" />
                  </div>
                ) : content.hero_image_url ? (
                  <div className="absolute inset-0 z-0 bg-stone-900">
                    <img src={content.hero_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${content.hero_image_url}` : content.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply" />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 bg-stone-900" />
                )}

                <div className={`relative z-10 max-w-7xl w-full animate-in slide-in-from-bottom-8 fade-in duration-1000 ${
                  content.hero_horizontal_alignment === 'left' ? 'text-left px-6 md:px-12 lg:px-24 ml-0 mr-auto' :
                  content.hero_horizontal_alignment === 'right' ? 'text-right px-6 md:px-12 lg:px-24 mr-0 ml-auto' :
                  'text-center px-6 mx-auto'
                }`}>
                  <h1 className="text-6xl md:text-8xl lg:text-[7rem] leading-none font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                    {translate(content.hero_title, content.translations, 'hero_title')}
                  </h1>
                  <p className={`text-xl md:text-3xl text-white/90 font-medium font-sans tracking-wide leading-relaxed drop-shadow-md mt-6 ${
                    content.hero_horizontal_alignment === 'center' ? 'max-w-3xl mx-auto' : 'max-w-3xl'
                  } ${content.hero_horizontal_alignment === 'right' ? 'ml-auto' : ''}`}>
                    {translate(content.hero_subtitle, content.translations, 'hero_subtitle')}
                  </p>
                  {content.hero_show_button !== false && (
                    <div className="pt-8">
                      <Link href={content.hero_button_link || '#'} className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-stone-900 transition-all duration-500 shadow-2xl hover:scale-105 active:scale-95 group">
                        {translate(content.hero_button_text, content.translations, 'hero_button_text')} <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            );
          }

          // ── ABOUT ─────────────────────────────────────────────────────────
          if (section.type === 'about') {
            return (
              <section key="about" className="bg-[#F5F2EE] relative flex items-start h-[100dvh] snap-start snap-stop-always md:h-auto md:snap-none pt-20 md:pt-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:grid md:grid-cols-2 gap-10 md:gap-16 items-center w-full h-full pb-16">
                  <div className="space-y-4 md:space-y-8 flex flex-col items-center text-center md:items-start md:text-left flex-shrink-0">
                    <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-stone-900 leading-tight">
                      {translate(content.about_title, content.translations, 'about_title')}
                    </h2>
                    <div className="text-base md:text-xl text-stone-600 leading-relaxed whitespace-pre-wrap font-medium max-w-md">
                      {translate(content.about_text, content.translations, 'about_text')}
                    </div>
                    {content.about_show_button && (
                      <div className="pt-4">
                        <Link href={content.about_button_link || '#'} className="inline-block border-2 border-stone-200 text-stone-800 px-8 py-3.5 md:px-12 md:py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-500">
                          {translate(content.about_button_text, content.translations, 'about_button_text')}
                        </Link>
                      </div>
                    )}
                  </div>
                  <div className="rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl relative group w-full flex-1 min-h-0 md:h-[600px] max-w-[340px] md:max-w-none">
                    {content.about_image_url ? (
                      <img src={content.about_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${content.about_image_url}` : content.about_image_url} alt="Sobre Mí" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">📷</div>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          // ── CATEGORÍA ACTIVA ───────────────────────────────────────────────
          if (section.type === 'category') {
            const category = section.data;
            const categoryServices = translatedServices.filter(
              (s: any) => s.category_id === category.id && s.is_active
            );
            if (categoryServices.length === 0) return null;

            const isEven = index % 2 === 0;

            return (
              <section
                key={`cat-${category.id}`}
                className={`w-full pt-10 pb-[10vh] md:py-24 overflow-hidden flex flex-col h-[100dvh] snap-start snap-stop-always md:h-auto md:snap-none ${isEven ? 'bg-white' : 'bg-[#F5F2EE]'}`}
              >
                {/* Cabecera de la categoría */}
                <div className="w-full max-w-7xl mx-auto px-6 mb-6 flex-shrink-0 flex flex-col md:flex-row md:justify-between md:items-end gap-3 md:gap-8">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-stone-900 leading-tight">
                      {category.name}
                    </h2>
                    <p className="hidden md:block text-lg md:text-xl text-stone-500 mt-2">
                      {category.description || t('home.discover_treatments', 'Descubre nuestros tratamientos exclusivos.')}
                    </p>
                  </div>
                  <Link
                    href={`/tratamientos/${category.slug || category.id}`}
                    className="self-end md:self-auto inline-flex items-center gap-2 font-bold text-[#d4af37] hover:text-stone-900 transition-colors uppercase tracking-widest text-[10px] md:text-sm"
                  >
                    <span className="hidden md:inline">{t('home.see_catalog', 'Ver Catálogo')}</span>
                    <span className="md:hidden">{t('home.see_all', 'Ver todo')}</span>
                    <span className="text-xl">→</span>
                  </Link>
                </div>

                {/* ── RENDERIZADO CONDICIONAL POR layout_style ─────────────── */}
                {layoutStyle === 'cards_slider' ? (
                  <>
                    {/* DESKTOP: carrusel con TreatmentCarousel (3+) o cards directas */}
                    <div className="hidden md:block w-full max-w-7xl mx-auto px-6 mb-8 flex-1 flex flex-col justify-center">
                      {categoryServices.length === 1 && (
                        <div className="w-full">
                          <ServiceCard service={categoryServices[0]} className="!w-full !md:w-full !h-[600px] !md:h-[600px]" />
                        </div>
                      )}
                      {categoryServices.length === 2 && (
                        <div className="flex justify-center gap-8">
                          {categoryServices.map((svc: any) => (
                            <ServiceCard key={svc.id} service={svc} className="!w-[420px] !h-[700px]" />
                          ))}
                        </div>
                      )}
                    </div>
                    {categoryServices.length >= 3 && (
                      <div className="hidden md:block">
                        <TreatmentCarousel servicios={categoryServices} />
                      </div>
                    )}
                    {/* MOBILE: scroll horizontal nativo con ServiceCard */}
                    <div className={`md:hidden flex overflow-x-auto snap-x-mandatory hide-scroll gap-4 px-6 items-center flex-1 min-h-0 w-full ${categoryServices.length <= 1 ? 'justify-center' : 'justify-start'}`}>
                      {categoryServices.map((svc: any) => (
                        <ServiceCard key={svc.id} service={svc} className="w-[85vw] h-full snap-center snap-stop-always" />
                      ))}
                    </div>
                  </>
                ) : (
                  // BENTO GRID
                  <div className="flex-1 flex items-center w-full py-4">
                    <BentoCategoryGrid services={categoryServices.slice(0, 5)} />
                  </div>
                )}
              </section>
            );
          }

          // ── CTA ───────────────────────────────────────────────────────────
          if (section.type === 'cta') {
            return (
              <section key="cta" className="flex flex-col justify-center w-full py-24 bg-[#d4af37] text-stone-900 text-center px-6 h-[100dvh] snap-start snap-stop-always md:h-auto md:snap-none">
                <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-700 w-full">
                  <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                    {translate(content.cta_title, content.translations, 'cta_title')}
                  </h2>
                  <p className="text-xl md:text-2xl font-medium opacity-90">
                    {translate(content.cta_subtitle, content.translations, 'cta_subtitle')}
                  </p>
                  <div className="pt-6">
                    <a href={content.cta_button_link} className="inline-block bg-stone-900 text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-stone-800 transition-all shadow-xl hover:scale-105">
                      {translate(content.cta_button_text, content.translations, 'cta_button_text')}
                    </a>
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })}

        <div className="snap-start snap-stop-always md:snap-none w-full">
          <Footer />
        </div>
      </main>
    </div>
  );
}
