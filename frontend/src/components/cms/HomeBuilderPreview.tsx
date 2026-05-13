import React from 'react';

interface PreviewProps {
  formData: any;
  categories: any[];
  services: any[]; // Podríamos pasarlo si queremos los items exactos, o simular
}

export default function HomeBuilderPreview({ formData, categories, services = [] }: PreviewProps) {
  
  // Función auxiliar para forzar la ruta de la imagen si es relativa
  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : url;
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-stone-50 select-none custom-scrollbar">
      
      {/* ─── 1. HERO SECTION (16:9) ─── */}
      <section className={`relative w-full aspect-video flex ${formData?.hero_alignment === 'top' ? 'items-start pt-20' : formData?.hero_alignment === 'bottom' ? 'items-end pb-16' : 'items-center'} justify-center p-6 overflow-hidden`}>
        {formData?.hero_video_url ? (
          <div className="absolute inset-0 z-0 bg-stone-900">
            <video autoPlay loop muted playsInline className="w-full h-full object-cover">
              <source src={getImageUrl(formData.hero_video_url)} type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
          </div>
        ) : formData?.hero_image_url ? (
          <div className="absolute inset-0 z-0 bg-stone-900">
            <img src={getImageUrl(formData.hero_image_url)} alt="Hero" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-stone-900"></div>
        )}

        <div className="relative z-10 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-white drop-shadow-md">
            {formData?.hero_title || 'Título Principal'}
          </h1>
          <p className="text-sm md:text-lg text-white/90 max-w-xl mx-auto font-medium drop-shadow-sm">
            {formData?.hero_subtitle || 'Subtítulo descriptivo que acompaña a la imagen principal.'}
          </p>
          <div className="pt-4">
            <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full font-bold text-sm">
              {formData?.hero_button_text || 'Reservar Ahora'} <span className="ml-1">→</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 2. ABOUT SECTION ─── */}
      <section className="py-8 bg-white flex items-center">
        <div className="px-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center w-full">
          <div className="space-y-3">
            <h2 className="text-xl font-extrabold text-stone-900">{formData?.about_title || 'Sobre Nosotros'}</h2>
            <div className="text-[13px] text-stone-500 leading-relaxed whitespace-pre-wrap font-medium line-clamp-5">
              {formData?.about_text || 'Texto introductorio sobre la filosofía de la clínica...'}
            </div>
          </div>
          {formData?.about_image_url ? (
            <div className="rounded-3xl overflow-hidden shadow-lg aspect-square max-w-[280px] mx-auto relative">
              <img src={getImageUrl(formData.about_image_url)} alt="Sobre Mí" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="rounded-3xl bg-stone-50 aspect-square max-w-[280px] mx-auto flex flex-col items-center justify-center text-stone-300 border border-dashed border-stone-200">
              <span className="text-xl mb-1">📷</span>
              <p className="font-bold text-[10px] uppercase tracking-widest">Imagen</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── 3. CATEGORÍAS (Renderizadas en orden) ─── */}
      {categories.map((category: any, index: number) => {
        const isEven = index % 2 === 0;
        return (
          <section key={category.id} className={`w-full py-12 ${isEven ? 'bg-white' : 'bg-[#F7F7F5]'}`}>
            <div className="px-8 mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 mb-2">{category.name}</h2>
                <p className="text-xs md:text-sm text-stone-500">{category.description || 'Descubre nuestros tratamientos.'}</p>
              </div>
            </div>
            
            {/* Cards de Tratamientos REALES para esta categoría */}
            <div className="px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-90 pointer-events-none">
               {services
                .filter((s: any) => s.category_id === category.id)
                .slice(0, 4) // Limitamos a 4 por categoría en la preview
                .map((service: any) => (
                 <div key={service.id} className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-100 relative group">
                   {service.image_url ? (
                     <img 
                       src={getImageUrl(service.image_url)} 
                       alt={service.name} 
                       className="w-full h-full object-cover" 
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-stone-50 p-4 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 leading-tight">
                          {service.name}
                        </span>
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                   <div className="absolute bottom-4 left-4 right-4">
                     <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                       {service.name}
                     </p>
                     <p className="text-[9px] text-white/60 font-medium">{service.duration_minutes} min</p>
                   </div>
                 </div>
               ))}
               
               {/* Si no hay servicios, mostrar placeholders de texto */}
               {services.filter((s: any) => s.category_id === category.id).length === 0 && (
                 <>
                   {[1, 2, 3].map(i => (
                     <div key={i} className="aspect-[3/4] bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center p-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-200">Tratamiento {i}</span>
                     </div>
                   ))}
                 </>
               )}
            </div>
          </section>
        );
      })}

      {/* ─── 4. CTA SECTION ─── */}
      <section className="flex flex-col justify-center w-full py-16 bg-[#d4af37] text-stone-900 text-center px-6">
        <div className="max-w-xl mx-auto space-y-4 w-full">
          <h2 className="text-3xl font-extrabold tracking-tight">{formData?.cta_title || 'Llamada a la Acción'}</h2>
          <p className="text-sm font-medium opacity-90">{formData?.cta_subtitle || 'Subtítulo persuasivo para el final.'}</p>
          <div className="pt-4">
            <div className="inline-block bg-stone-900 text-white px-8 py-3 rounded-full font-bold text-sm">
              {formData?.cta_button_text || 'Botón CTA'}
            </div>
          </div>
        </div>
      </section>
      
      {/* FOOTER SIMULADO */}
      <div className="h-32 bg-stone-900 w-full shrink-0 flex items-center justify-center">
         <div className="w-1/3 h-2 bg-stone-800 rounded-full"></div>
      </div>
    </div>
  );
}
