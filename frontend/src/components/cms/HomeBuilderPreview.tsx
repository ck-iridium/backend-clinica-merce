import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface PreviewProps {
  formData: any;
  categories: any[];
  services: any[];
  viewportDevice?: 'desktop' | 'tablet' | 'mobile';
  settings?: any;
}

const cleanTitle = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\s*\(?\s*con v[ií]deo\s*\)?/gi, '')
    .replace(/\s+con v[ií]deo/gi, '')
    .trim();
};

const parseSizeScale = (val: any, fallback: number = 100): number => {
  if (typeof val === 'number') return val;
  if (!val) return fallback;
  if (val === 'small') return 80;
  if (val === 'medium') return 90;
  if (val === 'large') return 100;
  if (val === 'xl') return 125;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
};

const getPriceStyleConfig = (style?: string) => {
  switch (style) {
    case 'outline':
      return {
        boxClass: 'bg-transparent border-2 border-white/40 rounded-2xl px-4 py-2 sm:px-5 sm:py-3 text-white backdrop-blur-xs',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-white drop-shadow-md',
        suffixClass: 'text-[#d4af37]'
      };
    case 'minimal':
      return {
        boxClass: 'bg-transparent border-0 p-0 text-white shadow-none',
        prefixClass: 'text-white/80',
        amountClass: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]',
        suffixClass: 'text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]'
      };
    case 'solid_white':
      return {
        boxClass: 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-white/50 dark:border-stone-800 rounded-2xl px-4 py-2 sm:px-5 sm:py-3 text-stone-900 dark:text-white shadow-md',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-stone-900 dark:text-white',
        suffixClass: 'text-[#d4af37]'
      };
    case 'capsule_dark':
    default:
      return {
        boxClass: 'backdrop-blur-xl bg-black/45 dark:bg-stone-950/60 border border-white/25 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3.5 text-white',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-white drop-shadow-md',
        suffixClass: 'text-[#d4af37]'
      };
  }
};

// Memoizar el componente para que no se re-renderice si sus props no cambian (fundamental para el drag & drop)
const HomeBuilderPreview = React.memo(({ formData, categories, services = [], viewportDevice = 'desktop', settings }: PreviewProps) => {
  const { translate, t } = useLanguage();
  
  // Función auxiliar para forzar la ruta de la imagen si es relativa
  const getImageUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : url;
  };

  // Helper para resolver propiedades responsivas según la resolución activa
  const getResponsiveVal = (field: string, fallback: any) => {
    if (viewportDevice === 'mobile') {
      return formData?.hero_responsive_config?.mobile?.[field] 
        ?? formData?.hero_responsive_config?.tablet?.[field] 
        ?? formData?.[field] 
        ?? fallback;
    }
    if (viewportDevice === 'tablet') {
      return formData?.hero_responsive_config?.tablet?.[field] 
        ?? formData?.[field] 
        ?? fallback;
    }
    return formData?.[field] ?? fallback;
  };

  const heroAlignment = getResponsiveVal('hero_alignment', formData?.hero_alignment || 'center');
  const heroHorizontalAlignment = getResponsiveVal('hero_horizontal_alignment', formData?.hero_horizontal_alignment || 'center');

  return (
    <div className="w-full h-full flex flex-col overflow-y-auto bg-stone-50 select-none custom-scrollbar">
      
      {/* ─── 1. HERO SECTION (Adaptativo según Viewport) ─── */}
      <section className={`relative w-full ${
        viewportDevice === 'mobile' || viewportDevice === 'tablet'
          ? 'h-full min-h-[580px] shrink-0 flex flex-col justify-between'
          : 'min-h-[580px] lg:min-h-[640px] shrink-0 flex flex-col justify-between'
      } overflow-hidden`}>
        
        {/* Navbar Simulado para Vista Móvil y Tablet (con Logo Real de la Clínica) */}
        {(viewportDevice === 'mobile' || viewportDevice === 'tablet') && (
          <div className="relative z-20 w-full px-6 pt-5 pb-3 flex items-center justify-between pointer-events-none select-none">
            {settings?.logo_mobile_b64 || settings?.logo_app_b64 ? (
              <img 
                src={settings.logo_mobile_b64 || settings.logo_app_b64}
                alt={settings?.clinic_name || 'Logo'}
                className="h-7 max-h-7 w-auto max-w-[150px] object-contain brightness-0 invert drop-shadow-md"
              />
            ) : (
              <span 
                style={{ fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif" }}
                className="text-base text-white font-serif font-medium tracking-wide drop-shadow-md"
              >
                {settings?.clinic_name || 'Clínica Mercè'}
              </span>
            )}
            <div className="flex flex-col gap-1.5 items-end justify-center w-6 h-6">
              <span className="w-5 h-0.5 bg-white/90 rounded-full drop-shadow"></span>
              <span className="w-3.5 h-0.5 bg-white/90 rounded-full drop-shadow"></span>
            </div>
          </div>
        )}

        {/* Navbar Simulado para Vista Desktop (con Logo Real de la Clínica y Enlaces) */}
        {viewportDevice === 'desktop' && (
          <div className="relative z-20 w-full px-10 pt-6 pb-4 flex items-center justify-between pointer-events-none select-none">
            {settings?.logo_app_b64 || settings?.logo_mobile_b64 ? (
              <img 
                src={settings.logo_app_b64 || settings.logo_mobile_b64}
                alt={settings?.clinic_name || 'Logo'}
                className="h-8 max-h-8 w-auto max-w-[180px] object-contain brightness-0 invert drop-shadow-md"
              />
            ) : (
              <span 
                style={{ fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif" }}
                className="text-lg text-white font-serif font-medium tracking-wide drop-shadow-md"
              >
                {settings?.clinic_name || 'Clínica Mercè'}
              </span>
            )}
            <div className="flex items-center gap-7 text-xs text-white/90 font-medium drop-shadow">
              <span>Tratamientos</span>
              <span>Sobre Mí</span>
              <span>Contacto</span>
              <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold tracking-wide">
                Reservar Cita
              </span>
            </div>
          </div>
        )}

        {/* Fondo Multimedia */}
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
          const titleMaxWidth = getResponsiveVal('hero_title_max_width', formData?.hero_title_max_width || 100);
          const isPriceActive = !!formData?.hero_price_enabled && (formData?.hero_price_amount || formData?.hero_price_prefix);
          const titleScale = parseSizeScale(getResponsiveVal('hero_title_size', formData?.hero_title_size || 100), 100) / 100;
          const subtitleScale = parseSizeScale(getResponsiveVal('hero_subtitle_size', formData?.hero_subtitle_size || 100), 100) / 100;
          const priceScale = parseSizeScale(getResponsiveVal('hero_price_size', formData?.hero_price_size || 100), 100) / 100;
          const priceOffsetY = getResponsiveVal('hero_price_offset_y', formData?.hero_price_offset_y ?? 0);
          const priceConfig = getPriceStyleConfig(formData?.hero_price_style);

          // Cálculo tipográfico adaptativo para el canvas de preview (sin usar vw que deformarían con el monitor del editor)
          let titleFontSize = '';
          let subtitleFontSize = '';
          let priceAmountFontSize = '';
          let priceSuffixFontSize = '';
          let pricePeriodFontSize = '';

          if (viewportDevice === 'mobile') {
            titleFontSize = isPriceActive 
              ? `${(1.95 * titleScale).toFixed(2)}rem` 
              : `${(2.35 * titleScale).toFixed(2)}rem`;
            subtitleFontSize = `${(0.88 * subtitleScale).toFixed(2)}rem`;
            priceAmountFontSize = `${(3.2 * priceScale).toFixed(2)}rem`;
            priceSuffixFontSize = `${(1.5 * priceScale).toFixed(2)}rem`;
            pricePeriodFontSize = `${(0.75 * priceScale).toFixed(2)}rem`;
          } else if (viewportDevice === 'tablet') {
            titleFontSize = isPriceActive 
              ? `${(2.1 * titleScale).toFixed(2)}rem` 
              : `${(2.5 * titleScale).toFixed(2)}rem`;
            subtitleFontSize = `${(0.98 * subtitleScale).toFixed(2)}rem`;
            priceAmountFontSize = `${(4.4 * priceScale).toFixed(2)}rem`;
            priceSuffixFontSize = `${(2.0 * priceScale).toFixed(2)}rem`;
            pricePeriodFontSize = `${(0.90 * priceScale).toFixed(2)}rem`;
          } else {
            titleFontSize = isPriceActive 
              ? `${(2.2 * titleScale).toFixed(2)}rem` 
              : `${(2.7 * titleScale).toFixed(2)}rem`;
            subtitleFontSize = `${(1.0 * subtitleScale).toFixed(2)}rem`;
            priceAmountFontSize = `${(5.2 * priceScale).toFixed(2)}rem`;
            priceSuffixFontSize = `${(2.4 * priceScale).toFixed(2)}rem`;
            pricePeriodFontSize = `${(0.95 * priceScale).toFixed(2)}rem`;
          }

          const getButtonStyle = (style?: string) => {
            switch (style) {
              case 'gold_solid':
                return 'bg-[#d4af37] text-white border border-[#b8952b]';
              case 'outline':
                return 'bg-transparent border-2 border-white/90 text-white';
              case 'solid_white':
                return 'bg-white text-stone-900 border border-stone-200';
              case 'glass':
              default:
                return 'bg-white/10 backdrop-blur-md border border-white/20 text-white';
            }
          };

          const renderPriceCapsule = () => {
            if (!isPriceActive) return null;
            const periodText = translate(formData?.hero_price_period, formData?.translations, 'hero_price_period');
            return (
              <div className={`relative group ${priceConfig.boxClass} select-none`}>
                <div className="relative flex flex-col items-start text-left">
                  {translate(formData?.hero_price_prefix, formData?.translations, 'hero_price_prefix') && (
                    <span className={`text-[10px] sm:text-xs font-black uppercase tracking-[0.22em] ${priceConfig.prefixClass} block mb-0 leading-none pl-0.5 select-none`}>
                      {translate(formData?.hero_price_prefix, formData?.translations, 'hero_price_prefix')}
                    </span>
                  )}
                  <div 
                    className="flex items-center gap-1.5 sm:gap-3 leading-none"
                    style={{ marginTop: `${-18 + Math.round(priceOffsetY)}px` }}
                  >
                    <span 
                      style={{ 
                        fontSize: priceAmountFontSize,
                        fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
                      }}
                      className={`font-serif font-black ${priceConfig.amountClass} tracking-tight drop-shadow-md`}
                    >
                      {formData?.hero_price_amount || '15'}
                    </span>
                    <div className="flex flex-col items-start justify-center leading-none pl-1">
                      <span 
                        style={{ 
                          fontSize: priceSuffixFontSize,
                          fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
                        }}
                        className={`font-serif font-bold ${priceConfig.suffixClass} leading-none`}
                      >
                        {formData?.hero_price_suffix || '€'}
                      </span>
                      {periodText && (
                        <span 
                          style={{ fontSize: pricePeriodFontSize }}
                          className={`font-black uppercase tracking-wider ${priceConfig.suffixClass} opacity-90 leading-tight mt-0.5 sm:mt-1`}
                        >
                          {periodText}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          };

          return (
            <div className={`relative z-10 w-full ${
              viewportDevice === 'mobile' 
                ? `px-5 ${heroAlignment === 'top' ? 'pt-4 pb-auto' : heroAlignment === 'center' ? 'my-auto' : 'pb-10 pt-auto'}`
                : viewportDevice === 'tablet'
                ? `px-8 ${heroAlignment === 'top' ? 'pt-8 pb-auto' : heroAlignment === 'center' ? 'my-auto' : 'pb-14 pt-auto'}`
                : `px-10 ${heroAlignment === 'top' ? 'pt-8 pb-auto' : heroAlignment === 'center' ? 'my-auto' : 'pb-16 pt-auto'} ${
                    formData?.hero_content_fullwidth
                      ? `max-w-7xl ${heroHorizontalAlignment === 'left' ? 'text-left ml-0 mr-auto' : heroHorizontalAlignment === 'right' ? 'text-right mr-0 ml-auto' : 'text-center mx-auto'}`
                      : `max-w-7xl mx-auto ${heroHorizontalAlignment === 'left' ? 'text-left' : heroHorizontalAlignment === 'right' ? 'text-right' : 'text-center'}`
                  }`
            }`}>
              <div className={`w-full flex flex-col ${
                heroHorizontalAlignment === 'center' ? 'items-center' :
                heroHorizontalAlignment === 'right' ? 'items-end' : 'items-start'
              }`}>
                {/* Contenedor Grid con Distribución Especial: Móvil (H1 100% + Subtítulo/Botón | Precio) vs Desktop/Tablet (3 filas | Precio) */}
                <div 
                  style={{ '--hero-title-max-w': `${titleMaxWidth}%` } as React.CSSProperties}
                  className={`w-full ${
                    isPriceActive
                      ? `grid grid-cols-[1fr_auto] gap-x-3.5 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3.5 items-center ${
                          viewportDevice === 'mobile'
                            ? `[grid-template-areas:'title_title'_'subtitle_price'_'button_price']`
                            : `[grid-template-areas:'title_price'_'subtitle_price'_'button_price']`
                        } ${
                          formData?.hero_content_fullwidth ? '' : 'sm:max-w-[var(--hero-title-max-w)]'
                        }`
                      : `flex flex-col gap-2.5 sm:gap-4 ${
                          formData?.hero_content_fullwidth ? '' : 'sm:max-w-[var(--hero-title-max-w)]'
                        }`
                  } ${
                    heroHorizontalAlignment === 'center' ? 'text-center' :
                    heroHorizontalAlignment === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {/* Título H1 (Fila 1 completa al 100% de ancho en móvil) */}
                  <div className="[grid-area:title] min-w-0">
                    <h1 
                      style={{ 
                        fontSize: titleFontSize,
                        fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
                      }}
                      className={`font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-[1.08] tracking-tight ${
                        heroHorizontalAlignment === 'center' ? 'mx-auto' : ''
                      }`}
                    >
                      {cleanTitle(translate(formData?.hero_title || 'Título Principal', formData?.translations, 'hero_title'))}
                    </h1>
                  </div>

                  {/* Subtítulo (Fila 2 en móvil, inmediatamente debajo del H1 a la izquierda) */}
                  <div className="[grid-area:subtitle] min-w-0">
                    <p 
                      style={{ fontSize: subtitleFontSize }}
                      className={`text-white/90 font-medium font-sans drop-shadow-md leading-relaxed ${
                        heroHorizontalAlignment === 'center' ? 'max-w-xl mx-auto' : 'max-w-xl'
                      }`}
                    >
                      {translate(formData?.hero_subtitle || 'Subtítulo descriptivo que acompaña a la imagen principal.', formData?.translations, 'hero_subtitle')}
                    </p>
                  </div>

                  {/* Botón de Acción CTA (Fila 3 en móvil, debajo del subtítulo en la columna izquierda) */}
                  {formData?.hero_show_button !== false && (
                    <div className={`[grid-area:button] pt-1 md:pt-2 w-full ${
                      heroHorizontalAlignment === 'center' ? 'flex justify-center' :
                      heroHorizontalAlignment === 'right' ? 'flex justify-end' : 'flex justify-start'
                    }`}>
                      <div className={`inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 shadow-md text-center whitespace-nowrap w-fit ${getButtonStyle(formData?.hero_button_style)}`}>
                        <span>{translate(formData?.hero_button_text || 'Reservar Ahora', formData?.translations, 'hero_button_text')}</span>
                        <span className="ml-2">→</span>
                      </div>
                    </div>
                  )}

                  {/* Bloque de Precio (Columna derecha centrado verticalmente frente a subtítulo + botón en móvil, o frente a H1 + subtítulo + botón en desktop) */}
                  {isPriceActive && (
                    <div className="[grid-area:price] self-center shrink-0">
                      {renderPriceCapsule()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* ─── 2. ABOUT SECTION ─── */}
      <section className="py-12 md:py-16 bg-white flex items-center">
        {viewportDevice === 'mobile' ? (
          <div className="px-6 flex flex-col items-center text-center w-full space-y-4">
            <h2 className="text-2xl font-serif font-extrabold text-stone-900 leading-tight">
              {cleanTitle(translate(formData?.about_title || 'Sobre Nosotros', formData?.translations, 'about_title'))}
            </h2>

            {formData?.about_image_url ? (
              <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] w-full max-w-[280px] mx-auto relative group shrink-0">
                <img src={getImageUrl(formData.about_image_url)} alt="Sobre Mí" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-stone-900/5 mix-blend-multiply"></div>
              </div>
            ) : (
              <div className="rounded-[2.5rem] bg-stone-50 aspect-[4/5] w-full max-w-[280px] mx-auto flex flex-col items-center justify-center text-stone-300 border-2 border-dashed border-stone-200">
                <ImageIcon size={40} strokeWidth={1} />
                <p className="font-bold text-[9px] uppercase tracking-widest mt-3">
                  {t('cms.section_image')}
                </p>
              </div>
            )}

            <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap font-medium max-w-sm px-2">
              {translate(formData?.about_text || 'Texto introductorio sobre la filosofía de la clínica...', formData?.translations, 'about_text')}
            </div>

            {formData?.about_show_button && (
              <div className="pt-2">
                <div className="inline-block border border-stone-200 text-stone-800 px-7 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest">
                  {translate(formData?.about_button_text || 'Saber Más', formData?.translations, 'about_button_text')}
                </div>
              </div>
            )}
          </div>
        ) : (
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
        )}
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
