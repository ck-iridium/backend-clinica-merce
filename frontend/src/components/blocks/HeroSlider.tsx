"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

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
        boxClass: 'bg-transparent border-2 border-white/40 rounded-3xl px-6 py-3.5 sm:px-8 sm:py-4.5 md:px-9 md:py-6 text-white backdrop-blur-xs',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-white drop-shadow-md',
        suffixClass: 'text-[#d4af37]'
      };
    case 'minimal':
      return {
        boxClass: 'bg-transparent border-0 p-0 text-white shadow-none',
        prefixClass: 'text-white/80',
        amountClass: 'text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]',
        suffixClass: 'text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]'
      };
    case 'solid_white':
      return {
        boxClass: 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-white/50 dark:border-stone-800 rounded-3xl px-6 py-3.5 sm:px-8 sm:py-4.5 md:px-9 md:py-6 text-stone-900 dark:text-white shadow-lg',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-stone-900 dark:text-white',
        suffixClass: 'text-[#d4af37]'
      };
    case 'capsule_dark':
    default:
      return {
        boxClass: 'backdrop-blur-xl bg-black/45 dark:bg-stone-950/60 border border-white/25 rounded-3xl px-6 py-3.5 sm:px-8 sm:py-4.5 md:px-9 md:py-6 text-white hover:border-[#d4af37]/60 transition-all duration-300',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]',
        suffixClass: 'text-[#d4af37]'
      };
  }
};

const getButtonStyle = (style?: string) => {
  switch (style) {
    case 'gold_solid':
      return 'bg-[#d4af37] text-white border border-[#b8952b] hover:bg-[#b8952b]';
    case 'outline':
      return 'bg-transparent border-2 border-white/90 text-white hover:bg-white hover:text-stone-900';
    case 'solid_white':
      return 'bg-white text-stone-900 border border-stone-200 hover:bg-stone-100';
    case 'glass':
    default:
      return 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-stone-900';
  }
};

interface HeroSliderProps {
  content: any;
}

export default function HeroSlider({ content }: HeroSliderProps) {
  const { translate } = useLanguage();

  // Normalizar diapositivas
  const slides: any[] = useMemo(() => {
    if (Array.isArray(content?.hero_slides) && content.hero_slides.length > 0) {
      return content.hero_slides;
    }
    return [content || {}];
  }, [content]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const autoplay = content.hero_slider_autoplay ?? true;
  const interval = content.hero_slider_interval ?? 5;
  const effect = content.hero_slider_effect ?? 'fade';
  const showArrows = content.hero_slider_show_arrows ?? true;
  const showDots = content.hero_slider_show_dots ?? true;

  // Autoplay con pausa en hover o touch
  useEffect(() => {
    if (!autoplay || isPaused || slides.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, Math.max(3, interval) * 1000);

    return () => clearInterval(timer);
  }, [autoplay, interval, isPaused, slides.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Soporte de gestos táctiles (Swipe en móvil)
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsPaused(true);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false);
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchStartXRef.current - touchEndX;

    if (Math.abs(diffX) > 50) {
      if (diffX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartXRef.current = null;
  };

  return (
    <section
      key="hero"
      id="hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative h-[100dvh] min-h-[600px] w-full snap-start snap-stop-always md:snap-none overflow-hidden mt-0 bg-stone-950"
    >
      {/* Contenedor de diapositivas (Track continuo para 'slide' o Relativo superpuesto para 'fade') */}
      <div
        className={`w-full h-full ${
          effect === 'slide'
            ? 'flex transition-transform duration-700 ease-out'
            : 'relative'
        }`}
        style={
          effect === 'slide'
            ? { 
                transform: `translate3d(-${currentIndex * 100}%, 0, 0)`,
                transitionTimingFunction: 'cubic-bezier(0.25, 1, 0.5, 1)'
              }
            : undefined
        }
      >
        {slides.map((slide: any, index: number) => {
          const isActive = index === currentIndex;

          // Cálculos responsivos individuales por diapositiva
          const desktopTitleScale = parseSizeScale(slide.hero_title_size || content.hero_title_size, 100) / 100;
          const tabletTitleScale = parseSizeScale(slide.hero_responsive_config?.tablet?.hero_title_size ?? slide.hero_title_size ?? content.hero_title_size, 100) / 100;
          const mobileTitleScale = parseSizeScale(slide.hero_responsive_config?.mobile?.hero_title_size ?? slide.hero_responsive_config?.tablet?.hero_title_size ?? slide.hero_title_size ?? content.hero_title_size, 100) / 100;

          const desktopSubtitleScale = parseSizeScale(slide.hero_subtitle_size || content.hero_subtitle_size, 100) / 100;
          const tabletSubtitleScale = parseSizeScale(slide.hero_responsive_config?.tablet?.hero_subtitle_size ?? slide.hero_subtitle_size ?? content.hero_subtitle_size, 100) / 100;
          const mobileSubtitleScale = parseSizeScale(slide.hero_responsive_config?.mobile?.hero_subtitle_size ?? slide.hero_responsive_config?.tablet?.hero_subtitle_size ?? slide.hero_subtitle_size ?? content.hero_subtitle_size, 100) / 100;

          const desktopPriceScale = parseSizeScale(slide.hero_price_size || content.hero_price_size, 100) / 100;
          const tabletPriceScale = parseSizeScale(slide.hero_responsive_config?.tablet?.hero_price_size ?? slide.hero_price_size ?? content.hero_price_size, 100) / 100;
          const mobilePriceScale = parseSizeScale(slide.hero_responsive_config?.mobile?.hero_price_size ?? slide.hero_responsive_config?.tablet?.hero_price_size ?? slide.hero_price_size ?? content.hero_price_size, 100) / 100;

          const desktopPriceOffsetY = slide.hero_price_offset_y ?? content.hero_price_offset_y ?? 0;
          const tabletPriceOffsetY = slide.hero_responsive_config?.tablet?.hero_price_offset_y ?? desktopPriceOffsetY;
          const mobilePriceOffsetY = slide.hero_responsive_config?.mobile?.hero_price_offset_y ?? tabletPriceOffsetY;

          const desktopPeriodScale = parseSizeScale(slide.hero_price_period_size || content.hero_price_period_size, 100) / 100;
          const tabletPeriodScale = parseSizeScale(slide.hero_responsive_config?.tablet?.hero_price_period_size ?? slide.hero_price_period_size ?? content.hero_price_period_size, 100) / 100;
          const mobilePeriodScale = parseSizeScale(slide.hero_responsive_config?.mobile?.hero_price_period_size ?? slide.hero_responsive_config?.tablet?.hero_price_period_size ?? slide.hero_price_period_size ?? content.hero_price_period_size, 100) / 100;

          const desktopPeriodOffsetY = slide.hero_price_period_offset_y ?? content.hero_price_period_offset_y ?? 0;
          const tabletPeriodOffsetY = slide.hero_responsive_config?.tablet?.hero_price_period_offset_y ?? desktopPeriodOffsetY;
          const mobilePeriodOffsetY = slide.hero_responsive_config?.mobile?.hero_price_period_offset_y ?? tabletPeriodOffsetY;

          const mobileDesdeMb = -6 + mobilePriceOffsetY;
          const tabletDesdeMb = -12 + tabletPriceOffsetY;
          const desktopDesdeMb = -20 + desktopPriceOffsetY;

          const mobilePeriodMt = 3 + mobilePeriodOffsetY;
          const tabletPeriodMt = 3 + tabletPeriodOffsetY;
          const desktopPeriodMt = 3 + desktopPeriodOffsetY;

          const desktopTitleMaxWidth = slide.hero_title_max_width || content.hero_title_max_width || 100;
          const tabletTitleMaxWidth = slide.hero_responsive_config?.tablet?.hero_title_max_width ?? desktopTitleMaxWidth;
          const mobileTitleMaxWidth = slide.hero_responsive_config?.mobile?.hero_title_max_width ?? tabletTitleMaxWidth;

          const isFullwidth = slide.hero_content_fullwidth ?? content.hero_content_fullwidth;
          const isPriceActive = !!(slide.hero_price_enabled ?? content.hero_price_enabled) && (slide.hero_price_amount || slide.hero_price_prefix || content.hero_price_amount || content.hero_price_prefix);
          const priceConfig = getPriceStyleConfig(slide.hero_price_style || content.hero_price_style);

          const alignment = slide.hero_alignment || content.hero_alignment || 'center';
          const horizontalAlignment = slide.hero_horizontal_alignment || content.hero_horizontal_alignment || 'center';

          const alignClasses = `
            ${alignment === 'top' ? 'items-start pt-48' : alignment === 'bottom' ? 'items-end pb-32' : 'items-center'}
            ${isFullwidth 
              ? (horizontalAlignment === 'left' ? 'justify-start' : horizontalAlignment === 'right' ? 'justify-end' : 'justify-center') 
              : 'justify-center'
            }
          `;

          // Renderizado del bloque de precio
          const renderPriceCapsule = () => {
            if (!isPriceActive) return null;
            const periodText = translate(slide.hero_price_period ?? content.hero_price_period, slide.translations || content.translations, 'hero_price_period');
            const prefixText = translate(slide.hero_price_prefix ?? content.hero_price_prefix, slide.translations || content.translations, 'hero_price_prefix');

            return (
              <div className={`relative group ${priceConfig.boxClass} select-none`}>
                <div className="relative flex flex-col items-start text-left">
                  {prefixText && (
                    <span 
                      className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.22em] ${priceConfig.prefixClass} block leading-none pl-0.5 select-none relative z-10 transition-all mb-[var(--hero-prefix-mb-mobile)] md:mb-[var(--hero-prefix-mb-tablet)] lg:mb-[var(--hero-prefix-mb-desktop)]`}
                    >
                      {prefixText}
                    </span>
                  )}
                  <div className="flex items-end gap-1.5 sm:gap-2.5">
                    <span 
                      style={{ 
                        fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
                      }}
                      className={`font-serif font-bold text-[length:var(--hero-price-size-mobile)] md:text-[length:var(--hero-price-size-tablet)] lg:text-[length:var(--hero-price-size-desktop)] leading-[0.88] ${priceConfig.amountClass} tracking-tight drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]`}
                    >
                      {slide.hero_price_amount || content.hero_price_amount || '15'}
                    </span>
                    <div className="flex flex-col items-start justify-center leading-none pl-1">
                      <span 
                        style={{ 
                          fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
                        }}
                        className={`font-serif font-bold text-[length:var(--hero-suffix-size-mobile)] md:text-[length:var(--hero-suffix-size-tablet)] lg:text-[length:var(--hero-suffix-size-desktop)] leading-none ${priceConfig.suffixClass}`}
                      >
                        {slide.hero_price_suffix || content.hero_price_suffix || '€'}
                      </span>
                      {periodText && (
                        <span 
                          className={`font-black uppercase tracking-[0.18em] text-[length:var(--hero-period-size-mobile)] md:text-[length:var(--hero-period-size-tablet)] lg:text-[length:var(--hero-period-size-desktop)] mt-[var(--hero-period-mt-mobile)] md:mt-[var(--hero-period-mt-tablet)] lg:mt-[var(--hero-period-mt-desktop)] ${priceConfig.suffixClass} opacity-90 leading-tight block transition-all`}
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

          // Clases de envoltura según el efecto elegido (slide continuo o crossfade)
          const slideWrapperClass = effect === 'slide'
            ? `relative w-full h-full flex-none flex ${alignClasses} ${isActive ? 'pointer-events-auto' : 'pointer-events-none'}`
            : `absolute inset-0 w-full h-full flex ${alignClasses} transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`;

          return (
            <div
              key={slide.id || `slide-${index}`}
              className={slideWrapperClass}
              style={effect === 'slide' ? { width: '100%' } : undefined}
            >
            {/* Fondo Multimedia */}
            {slide.hero_video_url ? (
              <div className="absolute inset-0 z-0 bg-stone-900">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="metadata"
                  poster={slide.hero_image_url ? (slide.hero_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${slide.hero_image_url}` : slide.hero_image_url) : undefined}
                  className="w-full h-full object-cover"
                >
                  <source src={slide.hero_video_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${slide.hero_video_url}` : slide.hero_video_url} type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply" />
              </div>
            ) : slide.hero_image_url ? (
              <div className="absolute inset-0 z-0 bg-stone-900">
                <img
                  src={slide.hero_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${slide.hero_image_url}` : slide.hero_image_url}
                  alt={cleanTitle(translate(slide.hero_title || content.hero_title, slide.translations || content.translations, 'hero_title')) || "Hero"}
                  fetchPriority={index === 0 ? "high" : "low"}
                  loading={index === 0 ? "eager" : "lazy"}
                  decoding="async"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply" />
              </div>
            ) : (
              <div className="absolute inset-0 z-0 bg-stone-900" />
            )}

            {/* Contenedor Tipográfico y Acciones */}
            <div 
              style={{
                '--hero-title-size-mobile': isPriceActive ? `${(2.2 * mobileTitleScale).toFixed(2)}rem` : `${(2.5 * mobileTitleScale).toFixed(2)}rem`,
                '--hero-title-size-tablet': isPriceActive ? `${(3.2 * tabletTitleScale).toFixed(2)}rem` : `${(3.8 * tabletTitleScale).toFixed(2)}rem`,
                '--hero-title-size-desktop': isPriceActive ? `${(5.2 * desktopTitleScale).toFixed(2)}rem` : `${(6.0 * desktopTitleScale).toFixed(2)}rem`,

                '--hero-sub-size-mobile': `${(1.15 * mobileSubtitleScale).toFixed(2)}rem`,
                '--hero-sub-size-tablet': `${(1.35 * tabletSubtitleScale).toFixed(2)}rem`,
                '--hero-sub-size-desktop': `${(1.55 * desktopSubtitleScale).toFixed(2)}rem`,

                '--hero-price-size-mobile': `${(3.4 * mobilePriceScale).toFixed(2)}rem`,
                '--hero-price-size-tablet': `${(5.0 * tabletPriceScale).toFixed(2)}rem`,
                '--hero-price-size-desktop': `${(7.5 * desktopPriceScale).toFixed(2)}rem`,

                '--hero-suffix-size-mobile': `${(1.6 * mobilePriceScale).toFixed(2)}rem`,
                '--hero-suffix-size-tablet': `${(2.2 * tabletPriceScale).toFixed(2)}rem`,
                '--hero-suffix-size-desktop': `${(3.2 * desktopPriceScale).toFixed(2)}rem`,

                '--hero-period-size-mobile': `${(0.55 * mobilePeriodScale).toFixed(2)}rem`,
                '--hero-period-size-tablet': `${(0.62 * tabletPeriodScale).toFixed(2)}rem`,
                '--hero-period-size-desktop': `${(0.70 * desktopPeriodScale).toFixed(2)}rem`,

                '--hero-prefix-mb-mobile': `${mobileDesdeMb}px`,
                '--hero-prefix-mb-tablet': `${tabletDesdeMb}px`,
                '--hero-prefix-mb-desktop': `${desktopDesdeMb}px`,

                '--hero-period-mt-mobile': `${mobilePeriodMt}px`,
                '--hero-period-mt-tablet': `${tabletPeriodMt}px`,
                '--hero-period-mt-desktop': `${desktopPeriodMt}px`,

                '--hero-title-max-w-desktop': `${desktopTitleMaxWidth}%`,
                '--hero-title-max-w-tablet': `${tabletTitleMaxWidth}%`,
                '--hero-title-max-w-mobile': `${mobileTitleMaxWidth}%`,
              } as React.CSSProperties}
              className={`relative z-10 w-full px-6 sm:px-12 md:px-16 ${
                isFullwidth 
                  ? (horizontalAlignment === 'left' ? 'text-left ml-0 mr-auto' : horizontalAlignment === 'right' ? 'text-right mr-0 ml-auto' : 'text-center mx-auto')
                  : (horizontalAlignment === 'left' ? 'max-w-7xl mx-auto text-left' : horizontalAlignment === 'right' ? 'max-w-7xl mx-auto text-right' : 'max-w-7xl mx-auto text-center')
              }`}
            >
              <div className={`w-full flex flex-col ${
                horizontalAlignment === 'center' ? 'items-center' :
                horizontalAlignment === 'right' ? 'items-end' : 'items-start'
              }`}>
                <div 
                  className={`w-full ${
                    isPriceActive
                      ? `grid grid-cols-[1fr_auto] gap-x-3.5 sm:gap-x-6 md:gap-x-12 gap-y-2 sm:gap-y-3.5 items-center [grid-template-areas:'title_title'_'subtitle_price'_'button_price'] md:[grid-template-areas:'title_price'_'subtitle_price'_'button_price'] ${
                          isFullwidth ? '' : 'w-full max-w-[var(--hero-title-max-w-mobile)] md:max-w-[var(--hero-title-max-w-tablet)] lg:max-w-[var(--hero-title-max-w-desktop)]'
                        }`
                      : `flex flex-col gap-2.5 sm:gap-4 ${
                          isFullwidth ? '' : 'w-full max-w-[var(--hero-title-max-w-mobile)] md:max-w-[var(--hero-title-max-w-tablet)] lg:max-w-[var(--hero-title-max-w-desktop)]'
                        }`
                  } ${
                    horizontalAlignment === 'center' ? 'text-center' :
                    horizontalAlignment === 'right' ? 'text-right' : 'text-left'
                  }`}
                >
                  {/* Título H1 */}
                  <div className="[grid-area:title] min-w-0">
                    <h1 
                      style={{ 
                        fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
                      }}
                      className={`font-serif font-extrabold text-[length:var(--hero-title-size-mobile)] md:text-[length:var(--hero-title-size-tablet)] lg:text-[length:var(--hero-title-size-desktop)] text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] leading-[1.08] tracking-tight ${
                        horizontalAlignment === 'center' ? 'mx-auto' : ''
                      }`}
                    >
                      {cleanTitle(translate(slide.hero_title || content.hero_title, slide.translations || content.translations, 'hero_title'))}
                    </h1>
                  </div>

                  {/* Subtítulo */}
                  <div className="[grid-area:subtitle] min-w-0">
                    <p 
                      className={`text-[length:var(--hero-sub-size-mobile)] md:text-[length:var(--hero-sub-size-tablet)] lg:text-[length:var(--hero-sub-size-desktop)] text-white/90 font-medium font-sans drop-shadow-md leading-relaxed ${
                        horizontalAlignment === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'
                      }`}
                    >
                      {translate(slide.hero_subtitle || content.hero_subtitle, slide.translations || content.translations, 'hero_subtitle')}
                    </p>
                  </div>

                  {/* Botón de Acción CTA */}
                  {(slide.hero_show_button !== false && content.hero_show_button !== false) && (
                    <div className={`[grid-area:button] pt-1 md:pt-2 w-full ${
                      horizontalAlignment === 'center' ? 'flex justify-center' :
                      horizontalAlignment === 'right' ? 'flex justify-end' : 'flex justify-start'
                    }`}>
                      <Link 
                        href={slide.hero_button_link || content.hero_button_link || '#'} 
                        className={`inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3.5 md:px-11 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 active:scale-95 group text-center whitespace-nowrap w-fit ${getButtonStyle(slide.hero_button_style || content.hero_button_style)}`}
                      >
                        <span>{translate(slide.hero_button_text || content.hero_button_text || 'Reservar Cita', slide.translations || content.translations, 'hero_button_text')}</span>
                        <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
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
          </div>
        );
      })}
      </div>

      {/* Controles de Navegación (Flechas) si hay más de 1 diapositiva */}
      {slides.length > 1 && showArrows && (
        <div className="absolute inset-y-0 inset-x-4 sm:inset-x-8 flex items-center justify-between pointer-events-none z-20">
          <button
            type="button"
            onClick={prevSlide}
            aria-label="Diapositiva anterior"
            className="pointer-events-auto p-3 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 shadow-xl group"
          >
            <ChevronLeft size={22} className="group-hover:-translate-x-0.5 transition-transform" />
          </button>
          <button
            type="button"
            onClick={nextSlide}
            aria-label="Siguiente diapositiva"
            className="pointer-events-auto p-3 rounded-full bg-black/30 hover:bg-black/60 backdrop-blur-md border border-white/20 text-white transition-all hover:scale-110 shadow-xl group"
          >
            <ChevronRight size={22} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      )}

      {/* Indicadores (Dots) si hay más de 1 diapositiva */}
      {slides.length > 1 && showDots && (
        <div className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-2.5 pointer-events-auto">
          {slides.map((_: any, i: number) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentIndex(i)}
              aria-label={`Ir a diapositiva ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === currentIndex 
                  ? 'w-8 h-2 bg-[#d4af37] shadow-lg shadow-[#d4af37]/30 ring-2 ring-[#d4af37]/40' 
                  : 'w-2.5 h-2.5 bg-white/40 hover:bg-white/80'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
