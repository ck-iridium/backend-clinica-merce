import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface PreviewProps {
  formData: any;
  categories: any[];
  services: any[];
}

// Memoizar el componente para que no se re-renderice si sus props no cambian (fundamental para el drag & drop)
const HomeBuilderPreview = React.memo(({ formData, categories, services = [] }: PreviewProps) => {
  const { translate, t } = useLanguage();
  
  // Función auxiliar para forzar la ruta de la imagen si es relativa
  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : url;
  };

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-stone-50 select-none custom-scrollbar">
      
      {/* ─── 1. HERO SECTION (16:9) ─── */}
      <section className={`relative w-full aspect-video flex ${formData?.hero_alignment === 'top' ? 'items-start pt-20' : formData?.hero_alignment === 'bottom' ? 'items-end pb-16' : 'items-center'} ${formData?.hero_horizontal_alignment === 'left' ? 'justify-start text-left pl-12' : formData?.hero_horizontal_alignment === 'right' ? 'justify-end text-right pr-12' : 'justify-center text-center'} p-6 overflow-hidden`}>
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
          <div className="absolute inset-0 z-0 bg-stone-900 text-stone-700 flex items-center justify-center font-bold text-xs uppercase tracking-[0.3em]">
             {t('cms.no_background_defined')}
          </div>
        )}

        <div className={`relative z-10 space-y-4 ${
          formData?.hero_horizontal_alignment === 'left' ? 'max-w-xl ml-0 mr-auto' : 
          formData?.hero_horizontal_alignment === 'right' ? 'max-w-xl mr-0 ml-auto' : 
          'max-w-xl mx-auto'
        }`}>
          <h1 className="text-4xl md:text-5xl font-serif font-extrabold text-white drop-shadow-md leading-tight">
            {translate(formData?.hero_title || 'Título Principal', formData?.translations, 'hero_title')}
          </h1>
          <p className="text-sm md:text-lg text-white/90 font-medium drop-shadow-sm leading-relaxed">
            {translate(formData?.hero_subtitle || 'Subtítulo descriptivo que acompaña a la imagen principal.', formData?.translations, 'hero_subtitle')}
          </p>
          {formData?.hero_show_button !== false && (
            <div className="pt-4">
              <div className="inline-block bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-3 rounded-full font-bold text-sm">
                {translate(formData?.hero_button_text || 'Reservar Ahora', formData?.translations, 'hero_button_text')} <span className="ml-1">→</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── 2. ABOUT SECTION ─── */}
      <section className="py-16 bg-white flex items-center">
        <div className={`px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full ${formData?.about_layout === 'left' ? 'md:flex-row-reverse' : ''}`}>
          <div className={`space-y-6 ${formData?.about_layout === 'left' ? 'order-2' : 'order-1'}`}>
            <h2 className="text-3xl font-serif font-extrabold text-stone-900 leading-tight">
              {translate(formData?.about_title || 'Sobre Nosotros', formData?.translations, 'about_title')}
            </h2>
            <div className="text-sm text-stone-500 leading-relaxed whitespace-pre-wrap font-medium">
              {translate(formData?.about_text || 'Texto introductorio sobre la filosofía de la clínica...', formData?.translations, 'about_text')}
            </div>
            {formData?.about_show_button && (
              <div className="pt-2">
                <div className="inline-block border border-stone-200 text-stone-800 px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest">
                  {translate(formData?.about_button_text || 'Saber Más', formData?.translations, 'about_button_text')}
                </div>
              </div>
            )}
          </div>
          <div className={`${formData?.about_layout === 'left' ? 'order-1' : 'order-2'}`}>
            {formData?.about_image_url ? (
              <div className="rounded-3xl overflow-hidden shadow-luxury aspect-[4/5] w-full max-w-[400px] mx-auto relative group transition-transform hover:scale-[1.02] duration-500">
                <img src={getImageUrl(formData.about_image_url)} alt="Sobre Mí" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-stone-900/5 mix-blend-multiply"></div>
              </div>
            ) : (
              <div className="rounded-3xl bg-stone-50 aspect-[4/5] w-full max-w-[400px] mx-auto flex flex-col items-center justify-center text-stone-300 border-2 border-dashed border-stone-200">
                <ImageIcon size={48} strokeWidth={1} />
                <p className="font-bold text-[10px] uppercase tracking-widest mt-4">
                  {t('cms.section_image')}
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── 3. CATEGORÍAS ─── */}
      {categories
        .filter((c: any) => c.is_active !== false)
        .map((category: any, index: number) => {
        const isEven = index % 2 === 0;
        return (
          <section key={category.id} className={`w-full py-12 ${isEven ? 'bg-white' : 'bg-[#F7F7F5]'}`}>
            <div className="px-8 mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 mb-2">
                  {translate(category.name, category.translations, 'name')}
                </h2>
                <p className="text-xs md:text-sm text-stone-500">
                  {translate(category.description || 'Descubre nuestros tratamientos.', category.translations, 'description')}
                </p>
              </div>
            </div>
            
            <div className="px-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-90 pointer-events-none">
               {services
                .filter((s: any) => s.category_id === category.id)
                .slice(0, 4)
                .map((service: any) => (
                 <div key={service.id} className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-100 relative group">
                   {service.image_url ? (
                     <img 
                       src={getImageUrl(service.image_url)} 
                       alt={translate(service.name, service.translations, 'name')} 
                       className="w-full h-full object-cover" 
                     />
                   ) : (
                     <div className="w-full h-full flex items-center justify-center bg-stone-50 p-4 text-center">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 leading-tight">
                          {translate(service.name, service.translations, 'name')}
                        </span>
                     </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                   <div className="absolute bottom-4 left-4 right-4">
                     <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                       {translate(service.name, service.translations, 'name')}
                     </p>
                     <p className="text-[9px] text-white/60 font-medium">{service.duration_minutes} min</p>
                   </div>
                 </div>
               ))}
               
               {services.filter((s: any) => s.category_id === category.id).length === 0 && (
                 <>
                   {[1, 2, 3].map(i => (
                     <div key={i} className="aspect-[3/4] bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center p-4">
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-200">
                          {t('cms.treatment').replace('{i}', i.toString())}
                        </span>
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
          <h2 className="text-3xl font-extrabold tracking-tight">
            {translate(formData?.cta_title || 'Llamada a la Acción', formData?.translations, 'cta_title')}
          </h2>
          <p className="text-sm font-medium opacity-90">
            {translate(formData?.cta_subtitle || 'Subtítulo persuasivo para el final.', formData?.translations, 'cta_subtitle')}
          </p>
          <div className="pt-4">
            <div className="inline-block bg-stone-900 text-white px-8 py-3 rounded-full font-bold text-sm">
              {translate(formData?.cta_button_text || 'Botón CTA', formData?.translations, 'cta_button_text')}
            </div>
          </div>
        </div>
      </section>
      
      <div className="h-32 bg-stone-900 w-full shrink-0 flex items-center justify-center">
         <div className="w-1/3 h-2 bg-stone-800 rounded-full"></div>
      </div>
    </div>
  );
});

HomeBuilderPreview.displayName = 'HomeBuilderPreview';
export default HomeBuilderPreview;
