import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag } from 'lucide-react';

import ServiceCard from '@/components/ServiceCard';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import TreatmentActions from '@/components/TreatmentActions';
import TreatmentMedia from '@/components/TreatmentMedia';
import TreatmentScrollHandler from '@/components/TreatmentScrollHandler';
import ScrollIndicator from '@/components/ScrollIndicator';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';
import BotonReservaPro from '@/components/BotonReservaPro';

async function getServiceData(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/slug/${slug}`, {
    next: { revalidate: 60 }
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch service data');
  }

  return res.json();
}

async function getRelatedServices(currentServiceId: number) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) return [];
  const services = await res.json();
  return services.filter((s: any) => s.id !== currentServiceId && s.is_active).slice(0, 24);
}

export async function generateMetadata({ params }: { params: { treatment_slug: string } }): Promise<Metadata> {
  const service = await getServiceData(params.treatment_slug);
  if (!service) return { title: 'Tratamiento no encontrado' };

  return {
    title: service.seo_title || `${service.name} | Clínica de Estética`,
    description: service.seo_description || service.description || `Descubre más sobre nuestro tratamiento ${service.name}.`,
    keywords: service.seo_keywords || 'tratamiento, estética, clínica',
  };
}

export default async function TreatmentDynamicPage({ params }: { params: { treatment_slug: string } }) {
  const service = await getServiceData(params.treatment_slug);

  if (!service) {
    notFound();
  }

  const layoutPreferences = service.layout_preferences || {
    alignment: 'left',
    headerStyle: 'split',
    accentColor: '#d4af37'
  };

  const relatedServices = await getRelatedServices(service.id);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
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
        <div className="md:sticky md:top-0 z-[100] h-0 md:h-screen w-full pointer-events-none">
          <div className="pointer-events-auto">
            <PublicNavbar />
          </div>

          <div className={`w-full md:w-[42%] lg:w-[40%] h-[75vh] md:h-[calc(100vh-80px)] pointer-events-auto flex items-center justify-center md:justify-end px-6 md:px-0 ${layoutPreferences.headerStyle === 'split_video' ? 'md:py-[20px] md:pr-4' : ''} relative group`}>
            <TreatmentMedia
              imageUrl={getFullUrl(service.image_url)}
              videoUrl={service.video_url ? getFullUrl(service.video_url) : undefined}
              headerStyle={layoutPreferences.headerStyle}
            />
            <ScrollIndicator />
          </div>
        </div>

        {/* CONTENIDO SCROLLABLE (Texto) */}
        <div className="flex flex-col md:flex-row w-full relative z-0 md:-mt-[100vh]">
          {/* Espaciador invisible para dejar hueco a la columna sticky en desktop */}
          <div className="hidden md:block md:w-[42%] lg:w-[40%] shrink-0" />

          <div id="treatment-content" className="w-full md:w-[58%] lg:w-[60%] flex flex-col pt-12 md:pt-32 pb-24 px-6 md:pl-8 md:pr-12 lg:pl-16 lg:pr-24">
            <div className="max-w-3xl">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37] mb-4 block">
                {service.category_name || 'Tratamiento Especializado'}
              </span>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-stone-900 mb-10 leading-[1.1]">
                {service.name}
              </h1>

              {/* SECCIÓN META */}
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-8 mb-16 border-y border-stone-100 py-10">
                <div className="flex items-center gap-12">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Duración</p>
                      <p className="text-2xl md:text-3xl font-bold text-stone-800 whitespace-nowrap">{service.duration_minutes} min</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-50 flex items-center justify-center flex-shrink-0">
                      <Tag className="w-5 h-5 text-stone-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Precio</p>
                      <p className="text-2xl md:text-3xl font-bold text-stone-800 whitespace-nowrap">{service.price} €</p>
                    </div>
                  </div>
                </div>

                <div className="lg:ml-auto w-full lg:w-auto">
                  <BotonReservaPro 
                    texto="Reservar Ahora"
                    color={layoutPreferences.accentColor}
                    href={`/reservar?servicio=${service.id}&nombre=${encodeURIComponent(service.name)}`}
                    className="w-full lg:w-auto"
                  />
                </div>
              </div>

              <p className="text-xl md:text-2xl text-stone-500 font-sans leading-relaxed mb-16 italic">
                "{service.description}"
              </p>

              {service.content_html && (
                <div
                  className="prose prose-stone lg:prose-xl max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:leading-relaxed prose-a:text-[#d4af37] prose-img:rounded-3xl mb-16"
                  dangerouslySetInnerHTML={{ __html: service.content_html }}
                />
              )}

              <TreatmentActions serviceName={service.name} />
            </div>
          </div>
        </div>
      </section>

      {/* SECCIÓN 2: CROSS-SELLING */}
      {relatedServices.length > 0 && (
        <section className="w-full bg-stone-50 pt-16 pb-24 md:py-32 border-t border-stone-100 overflow-hidden snap-start snap-stop-always scroll-mt-0 flex flex-col min-h-screen">
          <div className="w-full max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row justify-between items-end gap-6 flex-shrink-0">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-serif text-stone-800 mb-4">Tratamientos Complementarios</h2>
              <p className="text-stone-500">Descubre otras experiencias diseñadas para potenciar tu bienestar y belleza natural en nuestra clínica.</p>
            </div>
            <Link href="/tratamientos" className="hidden md:inline-flex text-sm font-bold uppercase tracking-widest text-[#d4af37] border-b-2 border-[#d4af37]/20 pb-1 hover:border-[#d4af37] transition-all">
              Ver catálogo completo
            </Link>
          </div>

          <div className="w-full flex-1 min-h-0 flex flex-col justify-center">
            <div className="hidden md:block">
              {relatedServices.length === 1 && (
                <div className="max-w-7xl mx-auto px-6">
                  <div className="w-full aspect-[16/9] md:h-[500px]"><ServiceCard service={relatedServices[0]} className="w-full h-full" /></div>
                </div>
              )}
              {relatedServices.length === 2 && (
                <div className="max-w-7xl mx-auto px-6 flex justify-center gap-8">
                  <div className="w-[372px] h-[662px]"><ServiceCard service={relatedServices[0]} className="w-full h-full" /></div>
                  <div className="w-[372px] h-[662px]"><ServiceCard service={relatedServices[1]} className="w-full h-full" /></div>
                </div>
              )}
              {relatedServices.length >= 3 && (
                <TreatmentCarousel servicios={relatedServices} loop={true} />
              )}
            </div>
            <div className="md:hidden flex overflow-x-auto snap-x-mandatory hide-scroll gap-4 px-6 items-center flex-1">
              {relatedServices.map((svc: any) => (
                <ServiceCard key={svc.id} service={svc} className="w-[75vw] aspect-[9/16] snap-center snap-stop-always flex-shrink-0" />
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
