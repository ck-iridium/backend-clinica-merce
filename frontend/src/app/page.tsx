import Link from 'next/link';
import { Metadata } from 'next';
import ServiceCard from '@/components/ServiceCard';
import BooksyFAB from '@/components/BooksyFAB';
import TreatmentCarousel from '@/components/TreatmentCarousel';

export const metadata: Metadata = {
  title: 'Clínica de Estética Avanzada',
  description: 'Tratamientos estéticos avanzados y personalizados para resaltar tu belleza natural.',
};

async function getData() {
  const [contentRes, settingsRes, servicesRes, categoriesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/site-content/`, { next: { revalidate: 60 } }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, { next: { revalidate: 60 } }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`, { next: { revalidate: 60 } }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/service-categories/`, { next: { revalidate: 60 } })
  ]);

  const content = contentRes.ok ? await contentRes.json() : null;
  const settings = settingsRes.ok ? await settingsRes.json() : null;
  const services = servicesRes.ok ? await servicesRes.json() : [];
  const categories = categoriesRes.ok ? await categoriesRes.json() : [];

  return { content, settings, services, categories };
}

export default async function Home() {
  const { content, settings, services, categories } = await getData();

  if (!content) return <div className="flex items-center justify-center min-h-screen text-stone-500 font-bold">Cargando la web...</div>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans">
      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* HEADER / NAV (Eliminado en favor de PublicNavbar global) */}

      <main id="main-scroll-container" className="pt-0 md:pt-0 h-screen overflow-y-auto snap-y snap-mandatory md:h-auto md:overflow-visible md:snap-none">
        {/* HERO SECTION */}
        <section className={`relative h-screen w-full flex snap-start ${content.hero_alignment === 'top' ? 'items-start pt-48' : content.hero_alignment === 'bottom' ? 'items-end pb-32' : 'items-center'} justify-center p-6 md:p-12 overflow-hidden mt-0`}>
          {content.hero_video_url ? (
            <div className="absolute inset-0 z-0 bg-stone-900">
              <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
              >
                <source src={content.hero_video_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${content.hero_video_url}` : content.hero_video_url} type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
            </div>
          ) : content.hero_image_url ? (
            <div className="absolute inset-0 z-0 bg-stone-900">
              <img src={content.hero_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${content.hero_image_url}` : content.hero_image_url} alt="Hero" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-stone-900"></div>
          )}

          <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6 animate-in slide-in-from-bottom-8 fade-in duration-1000">
            <h1 className="text-6xl md:text-8xl lg:text-[7rem] leading-none font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
              {content.hero_title}
            </h1>
            <p className="text-xl md:text-3xl text-white/90 max-w-3xl mx-auto font-medium font-sans tracking-wide leading-relaxed drop-shadow-md">
              {content.hero_subtitle}
            </p>
            <div className="pt-8">
              <Link href={content.hero_button_link} className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-white hover:text-stone-900 transition-all duration-500 shadow-2xl hover:scale-105 active:scale-95 group">
                {content.hero_button_text} <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="h-screen snap-start md:h-auto py-24 bg-white relative flex items-center">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center w-full">
            <div className="space-y-6">
              <h2 className="text-4xl font-extrabold text-stone-900">{content.about_title}</h2>
              <div className="text-lg text-stone-600 leading-relaxed whitespace-pre-wrap font-medium">
                {content.about_text}
              </div>
            </div>
            {content.about_image_url ? (
              <div className="rounded-[3rem] overflow-hidden shadow-2xl aspect-[4/5] md:aspect-auto md:h-[600px] relative">
                <img src={content.about_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${content.about_image_url}` : content.about_image_url} alt="Sobre Mí" className="w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-[3rem] bg-stone-100 aspect-[4/5] md:aspect-auto md:h-[600px] flex flex-col items-center justify-center text-stone-400 border-2 border-dashed border-stone-200">
                <span className="text-4xl mb-4">📷</span>
                <p className="font-bold">Añade tu foto desde el CMS</p>
              </div>
            )}
          </div>
        </section>

        {/* BENTO GRID POR CATEGORÍAS */}
        {categories.length > 0 && categories.map((category: any, index: number) => {
          const categoryServices = services.filter((s: any) => s.category_id === category.id && s.is_active);
          if (categoryServices.length === 0) return null;

          const isEven = index % 2 === 0;

          return (
            <section key={category.id} className={`w-full py-24 overflow-hidden h-screen snap-start flex flex-col justify-center md:h-auto md:block ${isEven ? 'bg-white' : 'bg-[#F7F7F5]'}`}>
              {/* 1. Título y descripción (Centrados y contenidos) */}
              <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 mb-10 flex justify-between items-end gap-8">
                <div className="max-w-2xl">
                  <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-stone-900 mb-4">{category.name}</h2>
                  <p className="text-lg md:text-xl text-stone-500">{category.description || 'Descubre nuestros tratamientos exclusivos diseñados para resaltar tu belleza natural.'}</p>
                </div>
                <Link href={`/tratamientos#${category.id}`} className="hidden md:inline-flex items-center gap-2 font-bold text-[#d4af37] hover:text-stone-900 transition-colors uppercase tracking-widest text-sm">
                  Ver Catálogo <span className="text-xl">→</span>
                </Link>
              </div>

              {/* Layout Desktop 1 y 2 */}
              <div className="hidden md:block w-full max-w-[1400px] mx-auto px-6 md:px-12 mb-8">
                {categoryServices.length === 1 && (
                  <div className="w-full">
                    <ServiceCard
                      service={categoryServices[0]}
                      isLarge={true}
                      className="w-full h-[500px]"
                    />
                  </div>
                )}

                {categoryServices.length === 2 && (
                  <div className="grid grid-cols-2 gap-8">
                    {categoryServices.map((svc: any) => (
                      <ServiceCard
                        key={svc.id}
                        service={svc}
                        isLarge={true}
                        className="w-full h-[450px]"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 2. El Carrusel Desktop 3+ (LIBRE, ocupando el 100% del ancho) */}
              {categoryServices.length >= 3 && (
                <div className="hidden md:block">
                  <TreatmentCarousel servicios={categoryServices} />
                </div>
              )}

              {/* Layout Móvil: Apple-Style Snap Carousel */}
              <div className="md:hidden flex overflow-x-auto snap-x snap-mandatory hide-scroll gap-4 px-6 pb-8 h-[65vh] items-center">
                {categoryServices.map((svc: any) => (
                  <ServiceCard key={svc.id} service={svc} className="w-[85vw] h-full snap-center" />
                ))}

                {/* Booksy End Card (Solo Móvil) */}
                <a
                  href="https://booksy.com/es-es/12345_clinica-merce_estetica_12345_madrid"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 w-[85vw] h-full snap-center rounded-[2.5rem] bg-stone-900 p-10 flex flex-col justify-between text-white shadow-xl"
                >
                  <div>
                    <span className="text-5xl">✨</span>
                    <h3 className="mt-8 text-4xl font-serif font-bold leading-tight">Vive la experiencia Merce</h3>
                  </div>
                  <div className="space-y-6">
                    <p className="font-medium text-white/70 text-lg">Reserva tu tratamiento favorito en menos de un minuto.</p>
                    <div className="bg-[#D4AF37] text-stone-900 py-4 px-8 rounded-full font-bold text-center text-xl shadow-luxury">
                      Reservar Cita
                    </div>
                  </div>
                </a>
              </div>

              <div className="mt-8 text-center md:hidden px-6">
                <Link href={`/tratamientos#${category.id}`} className="inline-block border border-stone-200 text-stone-600 px-8 py-4 rounded-full font-bold w-full">
                  Explorar toda la categoría
                </Link>
              </div>
            </section>
          );
        })}

        {/* CTA FINAL SECTION */}
        <section className="h-screen snap-start flex flex-col justify-center w-full py-24 bg-[#d4af37] text-stone-900 text-center px-6">
          <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-700 w-full">
            <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">{content.cta_title}</h2>
            <p className="text-xl md:text-2xl font-medium opacity-90">{content.cta_subtitle}</p>
            <div className="pt-6">
              <a href={content.cta_button_link} className="inline-block bg-stone-900 text-white px-12 py-6 rounded-full font-bold text-xl hover:bg-stone-800 transition-all shadow-xl hover:scale-105">
                {content.cta_button_text}
              </a>
            </div>

            {settings && (
              <div className="mt-16 pt-12 border-t border-stone-900/10 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm font-semibold">
                <div>
                  <span className="block opacity-60 mb-2 uppercase tracking-widest text-xs">Ubicación</span>
                  <span className="opacity-90">{settings.clinic_address || 'Dirección no configurada'}</span>
                </div>
                <div>
                  <span className="block opacity-60 mb-2 uppercase tracking-widest text-xs">Contacto Telefónico</span>
                  <span className="opacity-90">{settings.clinic_phone || 'Teléfono no configurado'}</span>
                </div>
                <div>
                  <span className="block opacity-60 mb-2 uppercase tracking-widest text-xs">WhatsApp Directo</span>
                  <span className="opacity-90">{settings.whatsapp_number || 'No configurado'}</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <BooksyFAB />
    </div>
  );
}
