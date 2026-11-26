"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { 
  cleanTitle, 
  parseSizeScale, 
  getPriceStyleConfig, 
  getPreviewImageUrl 
} from './previewUtils';

interface PreviewHeroSectionProps {
  formData: any;
  viewportDevice?: 'desktop' | 'tablet' | 'mobile';
  settings?: any;
}

export const PreviewHeroSection = React.memo(function PreviewHeroSection({
  formData,
  viewportDevice = 'desktop',
  settings
}: PreviewHeroSectionProps) {
  const { translate, t } = useLanguage();

  // Lista normalizada de diapositivas
  const slides: any[] = useMemo(() => {
    if (Array.isArray(formData?.hero_slides) && formData.hero_slides.length > 0) {
      return formData.hero_slides;
    }
    return [formData];
  }, [formData?.hero_slides, formData]);

  const [previewSlideIdx, setPreviewSlideIdx] = useState<number>(0);

  // Sincronizar automáticamente con la diapositiva seleccionada en el editor
  useEffect(() => {
    if (typeof formData?._activeSlideIndex === 'number') {
      setPreviewSlideIdx(formData._activeSlideIndex);
    }
  }, [formData?._activeSlideIndex]);

  const activeIndex = Math.min(Math.max(0, previewSlideIdx), Math.max(0, slides.length - 1));
  const activeSlide = slides[activeIndex] || slides[0] || formData;

  const getResponsiveVal = (field: string, fallback: any) => {
    const config = activeSlide?.hero_responsive_config || formData?.hero_responsive_config;
    if (config && viewportDevice) {
      return config[`${field}_${viewportDevice}`] 
        ?? config[field] 
        ?? activeSlide?.[field] 
        ?? formData?.[field] 
        ?? fallback;
    }
    return activeSlide?.[field] ?? formData?.[field] ?? fallback;
  };

  const heroAlignment = getResponsiveVal('hero_alignment', activeSlide?.hero_alignment || formData?.hero_alignment || 'center');
  const heroHorizontalAlignment = getResponsiveVal('hero_horizontal_alignment', activeSlide?.hero_horizontal_alignment || formData?.hero_horizontal_alignment || 'center');

  const titleMaxWidth = getResponsiveVal('hero_title_max_width', activeSlide?.hero_title_max_width || formData?.hero_title_max_width || 100);
  const isPriceActive = !!(activeSlide?.hero_price_enabled ?? formData?.hero_price_enabled) && (activeSlide?.hero_price_amount || activeSlide?.hero_price_prefix || formData?.hero_price_amount || formData?.hero_price_prefix);
  const titleScale = parseSizeScale(getResponsiveVal('hero_title_size', activeSlide?.hero_title_size || formData?.hero_title_size || 100), 100) / 100;
  const subtitleScale = parseSizeScale(getResponsiveVal('hero_subtitle_size', activeSlide?.hero_subtitle_size || formData?.hero_subtitle_size || 100), 100) / 100;
  const priceScale = parseSizeScale(getResponsiveVal('hero_price_size', activeSlide?.hero_price_size || formData?.hero_price_size || 100), 100) / 100;
  const priceOffsetY = getResponsiveVal('hero_price_offset_y', activeSlide?.hero_price_offset_y ?? formData?.hero_price_offset_y ?? 0);
  const periodScale = parseSizeScale(getResponsiveVal('hero_price_period_size', activeSlide?.hero_price_period_size || formData?.hero_price_period_size || 100), 100) / 100;
  const periodOffsetY = getResponsiveVal('hero_price_period_offset_y', activeSlide?.hero_price_period_offset_y ?? formData?.hero_price_period_offset_y ?? 0);
  const priceConfig = getPriceStyleConfig(activeSlide?.hero_price_style || formData?.hero_price_style);

  // Cálculo tipográfico adaptativo para el canvas de preview
  let titleFontSize = '';
  let subtitleFontSize = '';
  let priceAmountFontSize = '';
  let priceSuffixFontSize = '';

  if (viewportDevice === 'mobile') {
    titleFontSize = isPriceActive 
      ? `${(2.2 * titleScale).toFixed(2)}rem` 
      : `${(2.5 * titleScale).toFixed(2)}rem`;
    subtitleFontSize = `${(1.15 * subtitleScale).toFixed(2)}rem`;
    priceAmountFontSize = `${(3.4 * priceScale).toFixed(2)}rem`;
    priceSuffixFontSize = `${(1.6 * priceScale).toFixed(2)}rem`;
  } else if (viewportDevice === 'tablet') {
    titleFontSize = isPriceActive 
      ? `${(3.2 * titleScale).toFixed(2)}rem` 
      : `${(3.8 * titleScale).toFixed(2)}rem`;
    subtitleFontSize = `${(1.35 * subtitleScale).toFixed(2)}rem`;
    priceAmountFontSize = `${(5.0 * priceScale).toFixed(2)}rem`;
    priceSuffixFontSize = `${(2.2 * priceScale).toFixed(2)}rem`;
  } else {
    titleFontSize = isPriceActive 
      ? `${(5.2 * titleScale).toFixed(2)}rem` 
      : `${(6.0 * titleScale).toFixed(2)}rem`;
    subtitleFontSize = `${(1.55 * subtitleScale).toFixed(2)}rem`;
    priceAmountFontSize = `${(7.5 * priceScale).toFixed(2)}rem`;
    priceSuffixFontSize = `${(3.2 * priceScale).toFixed(2)}rem`;
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

  const periodFontSize = viewportDevice === 'mobile'
    ? `${(0.55 * periodScale).toFixed(2)}rem`
    : viewportDevice === 'tablet'
    ? `${(0.62 * periodScale).toFixed(2)}rem`
    : `${(0.70 * periodScale).toFixed(2)}rem`;

  const desdeMarginBottom = viewportDevice === 'mobile'
    ? -6 + priceOffsetY
    : viewportDevice === 'tablet'
    ? -12 + priceOffsetY
    : -20 + priceOffsetY;

  const renderPriceCapsule = () => {
    if (!isPriceActive) return null;
    const prefixText = translate(activeSlide?.hero_price_prefix ?? formData?.hero_price_prefix, activeSlide?.translations || formData?.translations, 'hero_price_prefix');
    const periodText = translate(activeSlide?.hero_price_period ?? formData?.hero_price_period, activeSlide?.translations || formData?.translations, 'hero_price_period');
    const customLabelColor = activeSlide?.hero_price_label_color || formData?.hero_price_label_color || '';
    const customAmountColor = activeSlide?.hero_price_amount_color || formData?.hero_price_amount_color || '';

    return (
      <div className={`relative group ${priceConfig.boxClass} select-none`}>
        <div className="relative flex flex-col items-start text-left">
          {prefixText && (
            <span 
              style={{ 
                marginBottom: `${desdeMarginBottom}px`,
                ...(customLabelColor ? { color: customLabelColor } : {})
              }}
              className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.22em] ${customLabelColor ? '' : priceConfig.prefixClass} block leading-none pl-0.5 select-none relative z-10 transition-all`}
            >
              {prefixText}
            </span>
          )}
          <div className="flex items-end gap-1.5 sm:gap-2.5">
            <span 
              style={{ 
                fontSize: priceAmountFontSize,
                fontFamily: "var(--font-heading)",
                ...(customAmountColor ? { color: customAmountColor } : {})
              }}
              className={`font-serif font-bold ${customAmountColor ? '' : priceConfig.amountClass} leading-[0.88] tracking-tight drop-shadow-md`}
            >
              {activeSlide?.hero_price_amount || formData?.hero_price_amount || '15'}
            </span>
            <div className="flex flex-col items-start justify-center leading-none pl-1">
              <span 
                style={{ 
                  fontSize: priceSuffixFontSize,
                  fontFamily: "var(--font-heading)",
                  ...(customLabelColor ? { color: customLabelColor } : {})
                }}
                className={`font-serif font-bold ${customLabelColor ? '' : priceConfig.suffixClass} leading-none`}
              >
                {activeSlide?.hero_price_suffix || formData?.hero_price_suffix || '€'}
              </span>
              {periodText && (
                <span 
                  style={{
                    fontSize: periodFontSize,
                    marginTop: `${3 + periodOffsetY}px`,
                    ...(customLabelColor ? { color: customLabelColor } : {})
                  }}
                  className={`font-black uppercase tracking-[0.18em] ${customLabelColor ? '' : priceConfig.suffixClass} opacity-90 leading-tight block transition-all`}
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
    <section className={`relative w-full ${
      viewportDevice === 'mobile' || viewportDevice === 'tablet'
        ? 'h-full min-h-[580px] shrink-0 flex flex-col'
        : 'min-h-[700px] lg:min-h-[760px] h-[calc(100vh-140px)] shrink-0 flex flex-col'
    } ${
      heroAlignment === 'top'
        ? (viewportDevice === 'mobile' ? 'justify-start pt-20 pb-8' : viewportDevice === 'tablet' ? 'justify-start pt-24 pb-10' : 'justify-start pt-28 pb-12')
        : heroAlignment === 'bottom'
        ? (viewportDevice === 'mobile' ? 'justify-end pb-12 pt-8' : viewportDevice === 'tablet' ? 'justify-end pb-16 pt-10' : 'justify-end pb-20 pt-12')
        : 'justify-center py-12'
    } overflow-hidden select-none`}>
      
      {/* Navbar Simulado para Vista Móvil y Tablet (con Logo Real de la Clínica) */}
      {(viewportDevice === 'mobile' || viewportDevice === 'tablet') && (
        <div className="absolute top-0 left-0 right-0 z-20 w-full px-6 pt-5 pb-3 flex items-center justify-between pointer-events-none select-none">
          {settings?.logo_mobile_b64 || settings?.logo_app_b64 ? (
            <img 
              src={settings.logo_mobile_b64 || settings.logo_app_b64}
              alt={settings?.clinic_name || 'Logo'}
              className="h-7 max-h-7 w-auto max-w-[150px] object-contain brightness-0 invert drop-shadow-md"
            />
          ) : (
            <span 
              style={{ fontFamily: "var(--font-heading)" }}
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
        <div className="absolute top-0 left-0 right-0 z-20 w-full px-10 pt-6 pb-4 flex items-center justify-between pointer-events-none select-none">
          {settings?.logo_app_b64 || settings?.logo_mobile_b64 ? (
            <img 
              src={settings.logo_app_b64 || settings.logo_mobile_b64}
              alt={settings?.clinic_name || 'Logo'}
              className="h-8 max-h-8 w-auto max-w-[180px] object-contain brightness-0 invert drop-shadow-md"
            />
          ) : (
            <span 
              style={{ fontFamily: "var(--font-heading)" }}
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
      {activeSlide?.hero_video_url ? (
        <div className="absolute inset-0 z-0 bg-stone-900">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src={getPreviewImageUrl(activeSlide.hero_video_url)} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
        </div>
      ) : activeSlide?.hero_image_url ? (
        <div className="absolute inset-0 z-0 bg-stone-900">
          <img src={getPreviewImageUrl(activeSlide.hero_image_url)} alt="Hero" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-stone-900 text-stone-700 flex items-center justify-center font-bold text-xs uppercase tracking-[0.3em]">
          {t('cms.no_background_defined')}
        </div>
      )}

      <div className={`relative z-10 w-full ${
        viewportDevice === 'mobile' 
          ? 'px-5'
          : viewportDevice === 'tablet'
          ? 'px-8'
          : `px-0 ${
              (activeSlide?.hero_content_fullwidth ?? formData?.hero_content_fullwidth)
                ? `max-w-7xl ${heroHorizontalAlignment === 'left' ? 'text-left ml-0 mr-auto' : heroHorizontalAlignment === 'right' ? 'text-right mr-0 ml-auto' : 'text-center mx-auto'}`
                : `max-w-7xl mx-auto ${heroHorizontalAlignment === 'left' ? 'text-left' : heroHorizontalAlignment === 'right' ? 'text-right' : 'text-center'}`
            }`
      }`}>
        <div className={`w-full flex flex-col ${
          heroHorizontalAlignment === 'center' ? 'items-center' :
          heroHorizontalAlignment === 'right' ? 'items-end' : 'items-start'
        }`}>
          {/* Contenedor Grid con Distribución Especial */}
          <div 
            style={{ '--hero-title-max-w': `${titleMaxWidth}%` } as React.CSSProperties}
            className={`w-full ${
              isPriceActive
                ? `grid grid-cols-[1fr_auto] gap-x-3.5 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3.5 items-center ${
                    viewportDevice === 'mobile'
                      ? `[grid-template-areas:'title_title'_'subtitle_price'_'button_price']`
                      : `[grid-template-areas:'title_price'_'subtitle_price'_'button_price']`
                  } ${
                    (activeSlide?.hero_content_fullwidth ?? formData?.hero_content_fullwidth) ? '' : 'sm:max-w-[var(--hero-title-max-w)]'
                  }`
                : `flex flex-col gap-2.5 sm:gap-4 ${
                    (activeSlide?.hero_content_fullwidth ?? formData?.hero_content_fullwidth) ? '' : 'sm:max-w-[var(--hero-title-max-w)]'
                  }`
            } ${
              heroHorizontalAlignment === 'center' ? 'text-center' :
              heroHorizontalAlignment === 'right' ? 'text-right' : 'text-left'
            }`}
          >
            {/* Título H1 */}
            <div className="[grid-area:title] min-w-0">
              <h1 
                style={{ 
                  fontSize: titleFontSize,
                  fontFamily: "var(--font-heading)"
                }}
                className={`font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-[1.08] tracking-tight ${
                  heroHorizontalAlignment === 'center' ? 'mx-auto' : ''
                }`}
              >
                {cleanTitle(translate(activeSlide?.hero_title || formData?.hero_title || 'Título Principal', activeSlide?.translations || formData?.translations, 'hero_title'))}
              </h1>
            </div>

            {/* Subtítulo */}
            <div className="[grid-area:subtitle] min-w-0">
              <p 
                style={{ fontSize: subtitleFontSize }}
                className={`text-white/90 font-medium font-sans drop-shadow-md leading-relaxed ${
                  heroHorizontalAlignment === 'center' ? 'max-w-xl mx-auto' : 'max-w-xl'
                }`}
              >
                {translate(activeSlide?.hero_subtitle || formData?.hero_subtitle || 'Subtítulo descriptivo que acompaña a la imagen principal.', activeSlide?.translations || formData?.translations, 'hero_subtitle')}
              </p>
            </div>

            {/* Botón de Acción CTA */}
            {(activeSlide?.hero_show_button !== false && formData?.hero_show_button !== false) && (
              <div className={`[grid-area:button] pt-1 md:pt-2 w-full ${
                heroHorizontalAlignment === 'center' ? 'flex justify-center' :
                heroHorizontalAlignment === 'right' ? 'flex justify-end' : 'flex justify-start'
              }`}>
                <div className={`inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3 rounded-full font-bold text-xs sm:text-sm transition-all duration-300 shadow-md text-center whitespace-nowrap w-fit ${getButtonStyle(activeSlide?.hero_button_style || formData?.hero_button_style)}`}>
                  <span>{translate(activeSlide?.hero_button_text || formData?.hero_button_text || 'Reservar Ahora', activeSlide?.translations || formData?.translations, 'hero_button_text')}</span>
                  <span className="ml-2">→</span>
                </div>
              </div>
            )}

            {/* Bloque de Precio */}
            {isPriceActive && (
              <div className="[grid-area:price] self-center shrink-0">
                {renderPriceCapsule()}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── NAVEGACIÓN DEL CARRUSEL EN PREVIEW ─── */}
      {slides.length > 1 && (
        <>
          {formData?.hero_slider_show_arrows !== false && viewportDevice !== 'mobile' && (
            <div className="hidden md:flex absolute inset-y-0 inset-x-2 sm:inset-x-4 items-center justify-between pointer-events-none z-30">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewSlideIdx((prev) => (prev - 1 + slides.length) % slides.length);
                }}
                className="pointer-events-auto p-2 rounded-full bg-stone-900/50 hover:bg-stone-900/80 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 shadow-lg"
                title="Anterior diapositiva"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewSlideIdx((prev) => (prev + 1) % slides.length);
                }}
                className="pointer-events-auto p-2 rounded-full bg-stone-900/50 hover:bg-stone-900/80 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-105 shadow-lg"
                title="Siguiente diapositiva"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {formData?.hero_slider_show_dots !== false && (
            <div className="absolute bottom-4 left-0 right-0 z-30 flex items-center justify-center gap-2 pointer-events-auto">
              {slides.map((_: any, i: number) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPreviewSlideIdx(i)}
                  className={`transition-all duration-300 rounded-full ${
                    i === activeIndex 
                      ? 'w-6 h-2 bg-[#d4af37] shadow-sm' 
                      : 'w-2 h-2 bg-white/50 hover:bg-white/80'
                  }`}
                  title={`Diapositiva ${i + 1}`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
});

PreviewHeroSection.displayName = 'PreviewHeroSection';

