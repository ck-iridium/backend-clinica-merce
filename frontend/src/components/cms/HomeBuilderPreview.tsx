import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface PreviewProps {
  formData: any;
  categories: any[];
  services: any[];
}

const cleanTitle = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\s*\(?\s*con v[ií]deo\s*\)?/gi, '')
    .replace(/\s+con v[ií]deo/gi, '')
    .trim();
};

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
      <section className={`relative w-full aspect-video flex ${formData?.hero_alignment === 'top' ? 'items-start pt-20' : formData?.hero_alignment === 'bottom' ? 'items-end pb-16' : 'items-center'} ${
        formData?.hero_content_fullwidth
          ? (formData?.hero_horizontal_alignment === 'left' ? 'justify-start text-left pl-6' : formData?.hero_horizontal_alignment === 'right' ? 'justify-end text-right pr-6' : 'justify-center text-center')
          : 'justify-center'
      } p-6 overflow-hidden`}>
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

        {(() => {
          const titleMaxWidth = formData?.hero_title_max_width || 100;
          const isPriceActive = !!formData?.hero_price_enabled && (formData?.hero_price_amount || formData?.hero_price_prefix);
          const getButtonStyle = (style?: string) => {
            switch (style) {
              case 'gold_solid':
                return 'bg-[#d4af37] text-white border border-[#b8952b] shadow-md';
              case 'outline':
                return 'bg-transparent border-2 border-white/90 text-white';
              case 'solid_white':
                return 'bg-white text-stone-900 border border-stone-200 shadow-md';
              case 'glass':
              default:
                return 'bg-white/10 backdrop-blur-md border border-white/20 text-white';
            }
          };

          const priceSizeClass = 
            formData?.hero_price_size === 'medium' ? 'text-2xl sm:text-3xl' :
            formData?.hero_price_size === 'xl' ? 'text-4xl sm:text-5xl' :
            'text-3xl sm:text-4xl';

          const priceSuffixClass = 
            formData?.hero_price_size === 'medium' ? 'text-sm sm:text-base' :
            formData?.hero_price_size === 'xl' ? 'text-lg sm:text-xl' :
            'text-base sm:text-lg';

          return (
            <div className={`relative z-10 w-full px-6 ${
              formData?.hero_content_fullwidth
                ? `max-w-4xl ${formData?.hero_horizontal_alignment === 'left' ? 'text-left ml-0 mr-auto' : formData?.hero_horizontal_alignment === 'right' ? 'text-right mr-0 ml-auto' : 'text-center mx-auto'}`
                : `max-w-4xl mx-auto ${formData?.hero_horizontal_alignment === 'left' ? 'text-left' : formData?.hero_horizontal_alignment === 'right' ? 'text-right' : 'text-center'}`
            }`}>
              {/* Bloque Principal Hero: Col 1 (H1 + Subtítulo + Botón) y Col 2 (Precio Encapsulado) */}
              <div className={`flex flex-col ${
                formData?.hero_horizontal_alignment === 'center'
                  ? 'sm:flex-row items-center justify-center'
                  : formData?.hero_horizontal_alignment === 'right'
                  ? 'sm:flex-row-reverse items-end justify-start'
                  : 'sm:flex-row items-start sm:items-center justify-start'
              } gap-4 sm:gap-6 md:gap-8`}>
                {/* Columna 1: Fila 1 = H1, Fila 2 = Subtítulo, Fila 3 = Botón CTA */}
                <div 
                  style={{ maxWidth: titleMaxWidth < 100 ? `${titleMaxWidth}%` : undefined }}
                  className={`space-y-2 ${
                    formData?.hero_horizontal_alignment === 'center' ? 'text-center' :
                    formData?.hero_horizontal_alignment === 'right' ? 'text-right' : 'text-left'
                  } ${isPriceActive ? 'max-w-xl' : 'max-w-2xl'}`}
                >
                  {/* Fila 1: Título H1 */}
                  <h1 className={`${
                    formData?.hero_title_size === 'medium' ? 'text-xl sm:text-2xl md:text-3xl' :
                    formData?.hero_title_size === 'xl' ? 'text-3xl sm:text-4xl md:text-5xl' :
                    'text-2xl sm:text-3xl md:text-4xl'
                  } font-serif font-extrabold text-white drop-shadow-md leading-tight tracking-tight`}>
                    {cleanTitle(translate(formData?.hero_title || 'Título Principal', formData?.translations, 'hero_title'))}
                  </h1>

                  {/* Fila 2: Subtítulo */}
                  <p className={`${
                    formData?.hero_subtitle_size === 'small' ? 'text-xs' :
                    formData?.hero_subtitle_size === 'large' ? 'text-sm sm:text-base' :
                    'text-xs sm:text-sm'
                  } text-white/90 font-medium drop-shadow-sm leading-relaxed ${
                    formData?.hero_horizontal_alignment === 'center' ? 'max-w-xl mx-auto' : 'max-w-xl'
                  }`}>
                    {translate(formData?.hero_subtitle || 'Subtítulo descriptivo que acompaña a la imagen principal.', formData?.translations, 'hero_subtitle')}
                  </p>

                  {/* Fila 3: Botón de Acción pegado a los textos */}
                  {formData?.hero_show_button !== false && (
                    <div className="pt-1.5 sm:pt-2">
                      <div className={`inline-block px-6 py-2 rounded-full font-bold text-xs sm:text-sm transition-all shadow-md ${getButtonStyle(formData?.hero_button_style)}`}>
                        {translate(formData?.hero_button_text || 'Reservar Ahora', formData?.translations, 'hero_button_text')} <span className="ml-1">→</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Columna 2: Cápsula de Precio Encapsulada y Compacta */}
                {isPriceActive && (
                  <div className={`shrink-0 self-start sm:self-center ${
                    formData?.hero_horizontal_alignment === 'center' ? 'mx-auto' : ''
                  }`}>
                    <div className="relative group overflow-hidden rounded-2xl p-3.5 sm:p-4 md:p-5 backdrop-blur-xl bg-black/45 dark:bg-stone-950/60 border border-white/25 shadow-lg ring-1 ring-white/10 select-none">
                      <div className="relative flex flex-col items-center justify-center text-center space-y-0.5">
                        {translate(formData?.hero_price_prefix, formData?.translations, 'hero_price_prefix') && (
                          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] block leading-none mb-0.5">
                            {translate(formData?.hero_price_prefix, formData?.translations, 'hero_price_prefix')}
                          </span>
                        )}
                        <div className="flex items-baseline justify-center gap-0.5 sm:gap-1 leading-none">
                          <span className={`${priceSizeClass} font-serif font-black text-white tracking-tight drop-shadow-md`}>
                            {formData?.hero_price_amount || '15'}
                          </span>
                          <span className={`${priceSuffixClass} font-serif font-bold text-[#d4af37]`}>
                            {formData?.hero_price_suffix || '€'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ─── 2. ABOUT SECTION ─── */}
      <section className="py-16 bg-white flex items-center">
        <div className={`px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full ${formData?.about_layout === 'left' ? 'md:flex-row-reverse' : ''}`}>
          <div className={`space-y-6 ${formData?.about_layout === 'left' ? 'order-2' : 'order-1'}`}>
            <h2 className="text-3xl font-serif font-extrabold text-stone-900 leading-tight">
              {cleanTitle(translate(formData?.about_title || 'Sobre Nosotros', formData?.translations, 'about_title'))}
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
        const layoutStyle = category.layout_preferences?.layout_style || 'cards_slider';
        const categoryServices = services.filter((s: any) => s.category_id === category.id);
        return (
          <section key={category.id} className={`w-full py-12 ${isEven ? 'bg-white' : 'bg-[#F7F7F5]'}`}>
            <div className="px-8 mb-6 flex justify-between items-end">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 mb-2">
                  {cleanTitle(translate(category.name, category.translations, 'name'))}
                </h2>
                <p className="text-xs md:text-sm text-stone-500">
                  {translate(category.description || 'Descubre nuestros tratamientos.', category.translations, 'description')}
                </p>
              </div>
            </div>
            
            <div className="w-full">
              {layoutStyle === 'cards_slider' && (
                <div className="px-8 flex gap-4 overflow-x-auto pb-4 pointer-events-none opacity-90 hide-scroll">
                  {categoryServices.map((service: any) => (
                    <div key={service.id} className="w-[180px] shrink-0 aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-100 relative group">
                      {service.image_url ? (
                        <img 
                          src={getImageUrl(service.image_url)} 
                          alt={cleanTitle(translate(service.name, service.translations, 'name'))} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-50 p-4 text-center">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 leading-tight">
                             {cleanTitle(translate(service.name, service.translations, 'name'))}
                           </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                          {cleanTitle(translate(service.name, service.translations, 'name'))}
                        </p>
                        <p className="text-[9px] text-white/60 font-medium">{service.duration_minutes} min</p>
                      </div>
                    </div>
                  ))}
                  
                  {categoryServices.length === 0 && (
                    <>
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-[180px] shrink-0 aspect-[3/4] bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-center p-4">
                           <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-200">
                             {t('cms.treatment').replace('{i}', i.toString())}
                           </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              )}

              {layoutStyle === 'bento_grid' && (
                <div className={`px-8 grid w-full gap-3 pointer-events-none opacity-90 ${
                  categoryServices.length === 4 ? 'grid-cols-2 auto-rows-[120px]' :
                  categoryServices.length === 2 ? 'grid-cols-2 auto-rows-[150px]' :
                  categoryServices.length === 1 ? 'grid-cols-1 auto-rows-[200px]' :
                  'grid-cols-2 md:grid-cols-3 auto-rows-[100px]'
                }`}>
                  {categoryServices.map((service: any, idx: number) => {
                    const totalCount = categoryServices.length;
                    let gridClass = 'col-span-1 row-span-1 h-full';
                    if (totalCount === 3) {
                      if (idx === 0) gridClass = 'col-span-2 row-span-2 h-full';
                    } else if (totalCount >= 5 && idx === 0) {
                      gridClass = 'col-span-2 row-span-2 h-full';
                    }
                    
                    return (
                      <div key={service.id} className={`${gridClass} bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-100 relative group`}>
                        {service.image_url ? (
                          <img 
                            src={getImageUrl(service.image_url)} 
                            alt={cleanTitle(translate(service.name, service.translations, 'name'))} 
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-stone-50 p-4 text-center">
                             <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 leading-tight">
                               {cleanTitle(translate(service.name, service.translations, 'name'))}
                             </span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                            {cleanTitle(translate(service.name, service.translations, 'name'))}
                          </p>
                          <p className="text-[9px] text-white/60 font-medium">{service.duration_minutes} min</p>
                        </div>
                      </div>
                    );
                  })}
                  
                  {categoryServices.length === 0 && (
                    <div className="col-span-full h-24 rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                      <span className="text-xs text-stone-400 font-medium font-sans">Sin tratamientos disponibles</span>
                    </div>
                  )}
                </div>
              )}

              {layoutStyle === 'traditional_grid' && (
                <div className="px-8 grid grid-cols-2 md:grid-cols-3 gap-4 pointer-events-none opacity-90">
                  {categoryServices.map((service: any) => (
                    <div key={service.id} className="aspect-[3/4] bg-stone-100 rounded-2xl overflow-hidden shadow-sm border border-stone-100 relative group">
                      {service.image_url ? (
                        <img 
                          src={getImageUrl(service.image_url)} 
                          alt={cleanTitle(translate(service.name, service.translations, 'name'))} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-50 p-4 text-center">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 leading-tight">
                             {cleanTitle(translate(service.name, service.translations, 'name'))}
                           </span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-[11px] font-bold text-white truncate leading-tight uppercase tracking-wide">
                          {cleanTitle(translate(service.name, service.translations, 'name'))}
                        </p>
                        <p className="text-[9px] text-white/60 font-medium">{service.duration_minutes} min</p>
                      </div>
                    </div>
                  ))}
                  
                  {categoryServices.length === 0 && (
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
              )}

              {layoutStyle === 'minimalist_list' && (
                <div className="px-8 flex flex-col divide-y divide-stone-100 pointer-events-none opacity-90">
                  {categoryServices.map((service: any, idx: number) => (
                    <div key={service.id} className="flex items-center justify-between py-4">
                      <div>
                        <span className="text-[#d4af37] text-[9px] font-bold uppercase tracking-wider block mb-1">
                          0{idx + 1} · {service.duration_minutes} min
                        </span>
                        <h4 className="text-sm font-serif font-bold text-stone-800">
                          {cleanTitle(translate(service.name, service.translations, 'name'))}
                        </h4>
                        <p className="text-[10px] text-stone-400 mt-1 max-w-xl truncate leading-normal">
                          {service.description}
                        </p>
                      </div>
                      <span className="text-stone-600 text-xs font-bold shrink-0">{service.price} €</span>
                    </div>
                  ))}
                  
                  {categoryServices.length === 0 && (
                    <div className="py-4 text-center">
                      <span className="text-xs text-stone-400 font-medium font-sans">Sin tratamientos disponibles</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* ─── 4. CTA SECTION ─── */}
      <section className="flex flex-col justify-center w-full py-16 bg-[#d4af37] text-stone-900 text-center px-6">
        <div className="max-w-xl mx-auto space-y-4 w-full">
          <h2 className="text-3xl font-extrabold tracking-tight">
            {cleanTitle(translate(formData?.cta_title || 'Llamada a la Acción', formData?.translations, 'cta_title'))}
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
