import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

import ServiceCard from '@/components/ServiceCard';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import TreatmentActions from '@/components/TreatmentActions';
import TreatmentMedia from '@/components/TreatmentMedia';
import TreatmentScrollHandler from '@/components/TreatmentScrollHandler';
import ScrollIndicator from '@/components/ScrollIndicator';
import Footer from '@/components/Footer';
import { ChevronDown } from 'lucide-react';

async function getServiceData(slug: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/slug/${slug}`, {
    next: { revalidate: 60 } // Revalidar cada 60s
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch service data');
  }
  
  return res.json();
}

async function getRelatedServices(categoryId: string, currentServiceId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`, {
    next: { revalidate: 60 }
  });
  if (!res.ok) return [];
  const services = await res.json();
  return services.filter((s: any) => s.category_id === categoryId && s.id !== currentServiceId && s.is_active).slice(0, 6); // Aumentamos límite para slider
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const service = await getServiceData(params.slug);
  
  if (!service) {
    return {
      title: 'Tratamiento no encontrado',
    };
  }

  return {
    title: service.seo_title || `${service.name} | Clínica de Estética`,
    description: service.seo_description || service.description || `Descubre más sobre nuestro tratamiento ${service.name}.`,
    keywords: service.seo_keywords || 'tratamiento, estética, clínica',
  };
}

export default async function TreatmentDynamicPage({ params }: { params: { slug: string } }) {
  const service = await getServiceData(params.slug);

  if (!service) {
    notFound();
  }

  // Fallback a preferencias por defecto si no existen
  const layoutPreferences = service.layout_preferences || {
    alignment: 'left',
    headerStyle: 'split',
    accentColor: '#d4af37'
  };

  const relatedServices = await getRelatedServices(service.category_id, service.id);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  return (
    <TreatmentScrollHandler>
      <div className="min-h-screen bg-white font-sans pt-20">
        <main className="w-full">
          <div className="flex flex-col md:flex-row min-h-screen relative">
            
            {/* Columna Izquierda: Visual (Sticky 9:16) */}
            <div className={`w-full md:w-[45%] lg:w-[43%] h-[75vh] md:h-[calc(100vh-80px)] md:sticky md:top-20 flex items-center justify-center md:justify-end px-6 md:px-0 ${layoutPreferences.headerStyle === 'split_video' ? 'md:py-[25px] md:pr-[25px]' : ''} relative group snap-start snap-stop-always`}>
              <TreatmentMedia 
                imageUrl={getFullUrl(service.image_url)} 
                videoUrl={service.video_url ? getFullUrl(service.video_url) : undefined}
                headerStyle={layoutPreferences.headerStyle}
              />
              
              <ScrollIndicator />
            </div>

            {/* Columna Derecha: Contenido (Scroll) */}
            <div id="treatment-content" className="w-full md:w-[55%] lg:w-[57%] flex flex-col pt-12 pb-24 px-6 md:pl-12 md:pr-16 lg:pl-20 lg:pr-32 snap-start snap-stop-always scroll-mt-20">
              <div className="max-w-3xl">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-[#d4af37] mb-4 block">
                  {service.category_name || 'Tratamiento Especializado'}
                </span>
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif text-stone-900 mb-8 leading-[1.1]">
                  {service.name}
                </h1>

                {/* Pricing & Time Card */}
                <div className="flex flex-wrap gap-4 items-center mb-12 p-6 bg-stone-50 rounded-3xl border border-stone-100 shadow-sm">
                  <div className="px-6 border-r border-stone-200">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1 text-center">Duración</p>
                    <p className="text-xl font-bold text-stone-800">{service.duration_minutes} min</p>
                  </div>
                  <div className="px-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1 text-center">Inversión desde</p>
                    <p className="text-xl font-bold text-stone-800">{service.price} €</p>
                  </div>
                  <div className="ml-auto">
                    <Link href={`/reservar?servicio=${service.id}&nombre=${encodeURIComponent(service.name)}`} className="inline-block px-8 py-4 rounded-2xl font-bold text-white shadow-xl transition-all hover:scale-105 active:scale-95 whitespace-nowrap" style={{ backgroundColor: layoutPreferences.accentColor || '#d4af37' }}>
                      Reservar Ahora
                    </Link>
                  </div>
                </div>

                {/* Short Description */}
                <p className="text-xl md:text-2xl text-stone-500 font-sans leading-relaxed mb-16 italic">
                  "{service.description}"
                </p>

                {/* Content Rich Text */}
                {service.content_html && (
                  <div 
                    className="prose prose-stone lg:prose-xl max-w-none prose-headings:font-serif prose-headings:font-normal prose-p:leading-relaxed prose-a:text-[#d4af37] prose-img:rounded-3xl mb-16"
                    dangerouslySetInnerHTML={{ __html: service.content_html }} 
                  />
                )}

                {/* Acciones Finales (Nueva Barra de Acciones) */}
                <TreatmentActions serviceName={service.name} />
              </div>
            </div>
          </div>

          {/* Bloque: Cross-Selling (Full Width) */}
          {relatedServices.length > 0 && (
            <section className="w-full bg-stone-50 py-24 md:py-32 border-t border-stone-100 overflow-hidden snap-start snap-stop-always scroll-mt-20">
              <div className="max-w-[1400px] mx-auto px-6 mb-16 flex flex-col md:flex-row justify-between items-end gap-6">
                <div className="max-w-xl">
                  <h2 className="text-3xl md:text-5xl font-serif text-stone-800 mb-4">Tratamientos Complementarios</h2>
                  <p className="text-stone-500">Descubre otras experiencias diseñadas para potenciar tu bienestar y belleza natural en nuestra clínica.</p>
                </div>
                <Link href="/tratamientos" className="text-sm font-bold uppercase tracking-widest text-[#d4af37] border-b-2 border-[#d4af37]/20 pb-1 hover:border-[#d4af37] transition-all">
                  Ver catálogo completo
                </Link>
              </div>

              {/* Lógica Dinámica de Visualización */}
              <div className="w-full">
                {relatedServices.length === 1 && (
                  <div className="max-w-sm mx-auto px-6">
                    <div className="h-[540px]">
                      <ServiceCard service={relatedServices[0]} className="w-full h-full" />
                    </div>
                  </div>
                )}

                {relatedServices.length === 2 && (
                  <div className="max-w-4xl mx-auto px-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="h-[540px]">
                        <ServiceCard service={relatedServices[0]} className="w-full h-full" />
                      </div>
                      <div className="h-[540px]">
                        <ServiceCard service={relatedServices[1]} className="w-full h-full" />
                      </div>
                    </div>
                  </div>
                )}

                {relatedServices.length >= 3 && (
                  <TreatmentCarousel servicios={relatedServices} />
                )}
              </div>
            </section>
          )}

          {/* Footer Local (Como sección snap) */}
          <div className="snap-start snap-stop-always scroll-mt-20">
            <Footer />
          </div>
        </main>
      </div>
    </TreatmentScrollHandler>
  );
}
