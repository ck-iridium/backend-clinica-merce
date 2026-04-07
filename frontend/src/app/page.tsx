import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Clínica de Estética Avanzada',
  description: 'Tratamientos estéticos avanzados y personalizados para resaltar tu belleza natural.',
};

async function getData() {
  const [contentRes, settingsRes, servicesRes] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/site-content/`, { next: { revalidate: 60 } }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, { next: { revalidate: 60 } }),
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/services/`, { next: { revalidate: 60 } })
  ]);
  
  const content = contentRes.ok ? await contentRes.json() : null;
  const settings = settingsRes.ok ? await settingsRes.json() : null;
  const services = servicesRes.ok ? await servicesRes.json() : [];
  
  return { content, settings, services };
}

export default async function Home() {
  const { content, settings, services } = await getData();
  const featuredServices = services.filter((s: any) => s.is_featured && s.is_active);

  if (!content) return <div className="flex items-center justify-center min-h-screen text-stone-500 font-bold">Cargando la web...</div>;

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans mt-16 md:mt-0">
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
      
      {/* HEADER / NAV (Eliminado en favor de PublicNavbar global) */}

      <main className="pt-0">
        {/* HERO SECTION */}
        <section className="relative min-h-[85vh] flex items-center justify-center p-6 md:p-12 lg:p-24 overflow-hidden mt-0">
          {content.hero_image_url && (
            <div className="absolute inset-0 z-0 bg-stone-900">
               <img src={content.hero_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${content.hero_image_url}` : content.hero_image_url} alt="Hero" className="w-full h-full object-cover opacity-80 mix-blend-overlay" />
               <div className="absolute inset-0 bg-gradient-to-t from-stone-50 via-transparent to-transparent"></div>
            </div>
          )}
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8 animate-in slide-in-from-bottom-8 fade-in duration-1000 mt-20">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg">{content.hero_title}</h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto font-medium drop-shadow-md">{content.hero_subtitle}</p>
            <div className="pt-4">
              <Link href={content.hero_button_link} className="inline-block bg-[#d4af37] text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-stone-900 transition-colors shadow-xl">
                {content.hero_button_text}
              </Link>
            </div>
          </div>
        </section>

        {/* ABOUT SECTION */}
        <section className="py-24 bg-white relative">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
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

        {/* FEATURED SERVICES / SLIDER SCROLL-SNAP */}
        {featuredServices.length > 0 && (
          <section className="py-24 bg-stone-900 text-white overflow-hidden">
             <div className="max-w-7xl mx-auto px-6 mb-12 flex justify-between items-end">
               <div>
                  <h2 className="text-4xl font-extrabold">Tratamientos Destacados</h2>
                  <p className="text-stone-400 mt-3 text-lg">Descubre nuestra selección para ti</p>
               </div>
               <Link href="/tratamientos" className="hidden md:inline-block text-[#d4af37] font-bold hover:underline">
                 Ver todo el catálogo →
               </Link>
             </div>
             
             {/* Componente clave: Slider horizontal con css scroll-snap */}
             <div className="flex flex-nowrap overflow-x-auto snap-x snap-mandatory hide-scroll pl-6 md:pl-[calc((100vw-[80rem])/2)] pr-6 gap-6 pb-12 items-stretch w-full scroll-smooth">
               {featuredServices.map((svc: any) => (
                 <div key={svc.id} className="snap-center shrink-0 w-[85vw] md:w-[350px] bg-stone-800 rounded-[2.5rem] p-8 border border-stone-700/50 flex flex-col hover:bg-stone-700 transition-colors shadow-2xl">
                    <div className="flex justify-between items-start mb-6 gap-4">
                      <h3 className="text-2xl font-bold leading-tight">{svc.name}</h3>
                      <span className="bg-[#d4af37]/10 text-[#d4af37] px-4 py-2 rounded-full font-bold text-sm shrink-0 border border-[#d4af37]/20">
                        {svc.price} €
                      </span>
                    </div>
                    <p className="text-stone-400 mb-8 min-h-[4.5rem] line-clamp-3 leading-relaxed">
                      {svc.description || 'Tratamiento especializado diseñado para conseguir los mejores resultados en tu piel.'}
                    </p>
                    <div className="mt-auto pt-6 border-t border-stone-700 flex justify-between items-center">
                      <span className="text-stone-500 font-semibold text-sm">⏱ {svc.duration_minutes} min</span>
                      <Link href={content.hero_button_link} className="text-white hover:text-[#d4af37] font-bold transition-colors">
                        Reservar cita →
                      </Link>
                    </div>
                 </div>
               ))}
               <div className="snap-start shrink-0 w-[10vw]"></div>
             </div>
             <div className="px-6 md:hidden text-center mt-4">
                <Link href="/tratamientos" className="inline-block text-[#d4af37] font-bold hover:underline text-lg">
                   Ver todo el catálogo →
                </Link>
             </div>
          </section>
        )}

        {/* CTA FINAL SECTION */}
        <section className="py-32 bg-[#d4af37] text-stone-900 text-center px-6">
          <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-700">
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
    </div>
  );
}
