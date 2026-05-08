import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

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
  return services.filter((s: any) => s.category_id === categoryId && s.id !== currentServiceId && s.is_active).slice(0, 3);
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

  return (
    <div className="min-h-screen bg-stone-50 font-sans pt-20">
      {/* Botón flotante para volver (Opcional, pero da buena UX en móvil si el usuario viene del catálogo) */}
      <div className="fixed top-24 left-6 z-50 hidden md:block">
        <Link href="/tratamientos" className="w-10 h-10 rounded-full bg-white shadow-md border border-stone-100 flex items-center justify-center text-stone-500 hover:text-stone-800 hover:scale-105 transition-all">
          <ArrowLeft size={20} />
        </Link>
      </div>

      <main className="w-full bg-white min-h-screen pb-24 shadow-sm">
        
        {/* Bloque 1: Hero Section */}
        <section className={`relative w-full ${layoutPreferences.headerStyle === 'full' ? 'h-[60vh] flex items-center justify-center text-white text-center' : 'min-h-[50vh] flex flex-col md:flex-row'}`}>
          
          {/* Background Image para modo FULL */}
          {layoutPreferences.headerStyle === 'full' && (
            <>
              <div className="absolute inset-0 bg-stone-900 z-0">
                {service.image_url && (
                  <img src={service.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${service.image_url}` : service.image_url} alt={service.name} className="w-full h-full object-cover opacity-50" />
                )}
              </div>
              <div className="relative z-10 p-8 max-w-4xl mx-auto flex flex-col items-center">
                <span className="text-sm font-bold uppercase tracking-widest mb-4 opacity-90" style={{ color: layoutPreferences.accentColor }}>Tratamiento Especializado</span>
                <h1 className="text-5xl md:text-7xl font-serif mb-6">{service.name}</h1>
                <p className="text-lg md:text-xl opacity-90 max-w-2xl mb-8 leading-relaxed">{service.description}</p>
                <div className="flex gap-4 items-center justify-center mb-8 bg-white/10 backdrop-blur-sm p-4 rounded-2xl">
                  <div className="text-center px-6 border-r border-white/20">
                    <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Duración</p>
                    <p className="text-xl font-bold">{service.duration_minutes} min</p>
                  </div>
                  <div className="text-center px-6">
                    <p className="text-[10px] uppercase tracking-widest opacity-70 mb-1">Precio desde</p>
                    <p className="text-xl font-bold">{service.price} €</p>
                  </div>
                </div>
                <Link href={`/reservar?servicio=${service.id}&nombre=${encodeURIComponent(service.name)}`} className="px-8 py-4 rounded-xl font-bold text-white shadow-xl transition-transform hover:scale-105" style={{ backgroundColor: layoutPreferences.accentColor }}>
                  Reservar Cita Ahora
                </Link>
              </div>
            </>
          )}

          {/* Layout para modo SPLIT */}
          {layoutPreferences.headerStyle === 'split' && (
            <div className="w-full flex flex-col md:flex-row">
              <div className={`w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center ${layoutPreferences.alignment === 'right' ? 'md:order-1' : 'md:order-2'}`}>
                <span className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: layoutPreferences.accentColor }}>Tratamiento Especializado</span>
                <h1 className="text-4xl md:text-6xl font-serif text-stone-900 mb-6 leading-tight">{service.name}</h1>
                <p className="text-stone-500 text-lg mb-8 leading-relaxed">{service.description}</p>
                
                <div className="flex flex-wrap gap-4 items-center mb-10">
                  <div className="bg-stone-50 border border-stone-100 px-6 py-3 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Duración</p>
                    <p className="text-lg font-bold text-stone-800">{service.duration_minutes} min</p>
                  </div>
                  <div className="bg-stone-50 border border-stone-100 px-6 py-3 rounded-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 mb-1">Precio desde</p>
                    <p className="text-lg font-bold text-stone-800">{service.price} €</p>
                  </div>
                </div>

                <Link href={`/reservar?servicio=${service.id}&nombre=${encodeURIComponent(service.name)}`} className="w-fit px-8 py-4 rounded-xl font-bold text-white shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: layoutPreferences.accentColor }}>
                  Reservar Cita Ahora
                </Link>
              </div>
              <div className={`w-full md:w-1/2 min-h-[400px] bg-stone-100 relative ${layoutPreferences.alignment === 'right' ? 'md:order-2' : 'md:order-1'}`}>
                {service.image_url ? (
                  <img src={service.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${service.image_url}` : service.image_url} alt={service.name} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-stone-300">
                     {/* Placeholder vacío si no hay imagen */}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Bloque 2: Contenido Enriquecido (Prose) */}
        {service.content_html && (
          <section className="max-w-3xl mx-auto px-8 py-24">
            <div 
              className="prose prose-stone prose-lg max-w-none prose-headings:font-serif prose-a:text-[#d4af37] marker:text-[#d4af37]"
              dangerouslySetInnerHTML={{ __html: service.content_html }} 
            />
          </section>
        )}

        {/* Bloque 3: Cross-Selling */}
        {relatedServices.length > 0 && (
          <section className="max-w-7xl mx-auto px-6 py-24 border-t border-stone-100">
            <h2 className="text-3xl md:text-4xl font-serif text-stone-800 mb-12 text-center">Otros tratamientos que te pueden interesar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedServices.map((svc: any) => (
                <Link href={`/tratamientos/${svc.slug || svc.id}`} key={svc.id} className="bg-stone-50 p-8 rounded-[2rem] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-stone-100 flex flex-col group">
                  <h3 className="text-xl font-bold text-stone-800 group-hover:text-[#d4af37] transition-colors mb-4">{svc.name}</h3>
                  <p className="text-sm text-stone-500 mb-8 line-clamp-2">{svc.description}</p>
                  <div className="flex justify-between items-center mt-auto pt-6 border-t border-stone-200/50">
                    <span className="text-stone-400 font-semibold text-sm flex items-center gap-1">
                      <span className="text-[#d4af37] text-lg leading-none">⏱</span> {svc.duration_minutes} min
                    </span>
                    <span className="bg-white border border-[#d4af37]/30 text-[#b08e23] px-3 py-1.5 rounded-xl font-bold text-sm shadow-sm">
                      {svc.price} €
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </main>
    </div>
  );
}
