"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/PublicNavbar';

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

export default function HeroLuxury({ data, settings }: { data: any, settings?: any }) {
  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  const bgVideo = data?.hero_video_url || settings?.hero_video_url;
  const bgImage = data?.hero_image_url || settings?.hero_image_url;

  // Alignments mapping
  const isFullwidth = data?.hero_content_fullwidth;
  const mobileAlignY = data?.hero_responsive_config?.mobile?.hero_alignment ?? data?.hero_alignment ?? 'bottom';
  const desktopAlignY = data?.hero_alignment ?? 'bottom';
  const alignYClass = `${
    mobileAlignY === 'top' ? 'items-start pt-28' : mobileAlignY === 'bottom' ? 'items-end pb-16' : 'items-center'
  } ${
    desktopAlignY === 'top' ? 'md:items-start md:pt-48' : desktopAlignY === 'bottom' ? 'md:items-end md:pb-32' : 'md:items-center'
  }`;

  const mobileAlignX = data?.hero_responsive_config?.mobile?.hero_horizontal_alignment ?? data?.hero_horizontal_alignment ?? 'left';
  const desktopAlignX = data?.hero_horizontal_alignment ?? 'center';

  const alignXClass = isFullwidth
    ? `${mobileAlignX === 'left' ? 'justify-start text-left' : mobileAlignX === 'right' ? 'justify-end text-right' : 'justify-center text-center'} ${desktopAlignX === 'left' ? 'md:justify-start md:text-left' : desktopAlignX === 'right' ? 'md:justify-end md:text-right' : 'md:justify-center md:text-center'} px-6`
    : 'justify-center text-center px-6';

  // Button Style helper
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
        return 'bg-white/15 backdrop-blur-md border border-white/25 text-white hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white';
    }
  };

  const desktopTitleScale = parseSizeScale(data?.hero_title_size, 100) / 100;
  const tabletTitleScale = parseSizeScale(data?.hero_responsive_config?.tablet?.hero_title_size ?? data?.hero_title_size, 100) / 100;
  const mobileTitleScale = parseSizeScale(data?.hero_responsive_config?.mobile?.hero_title_size ?? data?.hero_responsive_config?.tablet?.hero_title_size ?? data?.hero_title_size, 100) / 100;

  const desktopSubtitleScale = parseSizeScale(data?.hero_subtitle_size, 100) / 100;
  const tabletSubtitleScale = parseSizeScale(data?.hero_responsive_config?.tablet?.hero_subtitle_size ?? data?.hero_subtitle_size, 100) / 100;
  const mobileSubtitleScale = parseSizeScale(data?.hero_responsive_config?.mobile?.hero_subtitle_size ?? data?.hero_responsive_config?.tablet?.hero_subtitle_size ?? data?.hero_subtitle_size, 100) / 100;

  const desktopPriceScale = parseSizeScale(data?.hero_price_size, 100) / 100;
  const tabletPriceScale = parseSizeScale(data?.hero_responsive_config?.tablet?.hero_price_size ?? data?.hero_price_size, 100) / 100;
  const mobilePriceScale = parseSizeScale(data?.hero_responsive_config?.mobile?.hero_price_size ?? data?.hero_responsive_config?.tablet?.hero_price_size ?? data?.hero_price_size, 100) / 100;

  const desktopPriceOffsetY = data?.hero_price_offset_y ?? 0;
  const tabletPriceOffsetY = data?.hero_responsive_config?.tablet?.hero_price_offset_y ?? desktopPriceOffsetY;
  const mobilePriceOffsetY = data?.hero_responsive_config?.mobile?.hero_price_offset_y ?? tabletPriceOffsetY;

  const desktopPeriodScale = parseSizeScale(data?.hero_price_period_size, 100) / 100;
  const tabletPeriodScale = parseSizeScale(data?.hero_responsive_config?.tablet?.hero_price_period_size ?? data?.hero_price_period_size, 100) / 100;
  const mobilePeriodScale = parseSizeScale(data?.hero_responsive_config?.mobile?.hero_price_period_size ?? data?.hero_responsive_config?.tablet?.hero_price_period_size ?? data?.hero_price_period_size, 100) / 100;

  const desktopPeriodOffsetY = data?.hero_price_period_offset_y ?? 0;
  const tabletPeriodOffsetY = data?.hero_responsive_config?.tablet?.hero_price_period_offset_y ?? desktopPeriodOffsetY;
  const mobilePeriodOffsetY = data?.hero_responsive_config?.mobile?.hero_price_period_offset_y ?? tabletPeriodOffsetY;

  const mobileDesdeMb = -6 + mobilePriceOffsetY;
  const tabletDesdeMb = -12 + tabletPriceOffsetY;
  const desktopDesdeMb = -20 + desktopPriceOffsetY;

  const mobilePeriodMt = 3 + mobilePeriodOffsetY;
  const tabletPeriodMt = 3 + tabletPeriodOffsetY;
  const desktopPeriodMt = 3 + desktopPeriodOffsetY;

  const desktopTitleMaxWidth = data?.hero_title_max_width || 100;
  const tabletTitleMaxWidth = data?.hero_responsive_config?.tablet?.hero_title_max_width ?? desktopTitleMaxWidth;
  const mobileTitleMaxWidth = data?.hero_responsive_config?.mobile?.hero_title_max_width ?? tabletTitleMaxWidth;

  const isPriceActive = !!data?.hero_price_enabled && (data?.hero_price_amount || data?.hero_price_prefix);
  const priceConfig = getPriceStyleConfig(data?.hero_price_style);

  const renderPriceCapsule = () => {
    if (!isPriceActive) return null;
    return (
      <div className={`relative group ${priceConfig.boxClass} select-none`}>
        <div className="relative flex flex-col items-start text-left">
          {data?.hero_price_prefix && (
            <span 
              style={{
                '--hero-price-prefix-mb-mobile': `${mobileDesdeMb}px`,
                '--hero-price-prefix-mb-tablet': `${tabletDesdeMb}px`,
                '--hero-price-prefix-mb-desktop': `${desktopDesdeMb}px`,
              } as React.CSSProperties}
              className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.22em] ${priceConfig.prefixClass} block leading-none pl-0.5 select-none relative z-10 transition-all mb-[var(--hero-price-prefix-mb-mobile)] md:mb-[var(--hero-price-prefix-mb-tablet)] lg:mb-[var(--hero-price-prefix-mb-desktop)]`}
            >
              {data?.hero_price_prefix}
            </span>
          )}
          <div className="flex items-end gap-1.5 sm:gap-2.5">
            <span 
              style={{ 
                fontSize: `clamp(${(3.4 * mobilePriceScale).toFixed(2)}rem, ${(5.0 * tabletPriceScale).toFixed(2)}rem, ${(7.5 * desktopPriceScale).toFixed(2)}rem)`,
                fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
              }}
              className={`font-serif font-bold ${priceConfig.amountClass} leading-[0.88] tracking-tight drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]`}
            >
              {data?.hero_price_amount || '15'}
            </span>
            <div className="flex flex-col items-start justify-center leading-none pl-1">
              <span 
                style={{ 
                  fontSize: `clamp(${(1.6 * mobilePriceScale).toFixed(2)}rem, ${(2.2 * tabletPriceScale).toFixed(2)}rem, ${(3.2 * desktopPriceScale).toFixed(2)}rem)`,
                  fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
                }}
                className={`font-serif font-bold ${priceConfig.suffixClass} leading-none`}
              >
                {data?.hero_price_suffix || '€'}
              </span>
              {data?.hero_price_period && (
                <span 
                  style={{
                    '--hero-price-period-mt-mobile': `${mobilePeriodMt}px`,
                    '--hero-price-period-mt-tablet': `${tabletPeriodMt}px`,
                    '--hero-price-period-mt-desktop': `${desktopPeriodMt}px`,
                    fontSize: `clamp(${(0.55 * mobilePeriodScale).toFixed(2)}rem, ${(0.62 * tabletPeriodScale).toFixed(2)}rem, ${(0.70 * desktopPeriodScale).toFixed(2)}rem)`,
                  } as React.CSSProperties}
                  className={`font-black uppercase tracking-[0.18em] ${priceConfig.suffixClass} opacity-90 leading-tight block mt-[var(--hero-price-period-mt-mobile)] md:mt-[var(--hero-price-period-mt-tablet)] lg:mt-[var(--hero-price-period-mt-desktop)] transition-all`}
                >
                  {data?.hero_price_period}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`relative h-[100dvh] min-h-[600px] w-full flex snap-start snap-stop-always md:snap-none ${alignYClass} ${alignXClass} overflow-hidden mt-0`}>
      {/* Dynamic Navbar overlaid inside snap home section */}
      <div className="absolute top-0 left-0 w-full z-[100]">
        <PublicNavbar transparent={true} />
      </div>

      {/* Background Media */}
      {bgVideo ? (
        <div className="absolute inset-0 z-0 bg-stone-900">
          <video 
            autoPlay 
            loop 
            muted 
            playsInline 
            poster={bgImage ? getFullUrl(bgImage) : undefined}
            className="w-full h-full object-cover"
          >
            <source src={getFullUrl(bgVideo)} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
        </div>
      ) : bgImage ? (
        <div className="absolute inset-0 z-0 bg-stone-900">
          <img 
            src={getFullUrl(bgImage)} 
            alt="Hero Background" 
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
        </div>
      ) : (
        <div className="absolute inset-0 z-0 bg-stone-900"></div>
      )}

      {/* Content Container */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className={`relative z-10 w-full px-6 ${
          isFullwidth
            ? `max-w-7xl ${mobileAlignX === 'left' ? 'ml-0 mr-auto text-left' : mobileAlignX === 'right' ? 'mr-0 ml-auto text-right' : 'mx-auto text-center'} ${desktopAlignX === 'left' ? 'md:ml-0 md:mr-auto md:text-left' : desktopAlignX === 'right' ? 'md:mr-0 md:ml-auto md:text-right' : 'md:mx-auto md:text-center'}`
            : `max-w-7xl mx-auto ${mobileAlignX === 'left' ? 'text-left' : mobileAlignX === 'right' ? 'text-right' : 'text-center'} ${desktopAlignX === 'left' ? 'md:text-left' : desktopAlignX === 'right' ? 'md:text-right' : 'md:text-center'}`
        }`}
      >
        <div className={`w-full flex flex-col ${
          mobileAlignX === 'center' ? 'items-center' :
          mobileAlignX === 'right' ? 'items-end' : 'items-start'
        } ${
          desktopAlignX === 'center' ? 'md:items-center' :
          desktopAlignX === 'right' ? 'md:items-end' : 'md:items-start'
        }`}>
          {/* Contenedor Grid con Distribución Especial: Móvil (H1 100% + Subtítulo/Botón | Precio) vs Desktop (3 filas | Precio) */}
          <div 
            style={{ '--hero-title-max-w': `${desktopTitleMaxWidth}%` } as React.CSSProperties}
            className={`w-full ${
              isPriceActive
                ? `grid grid-cols-[1fr_auto] gap-x-3.5 sm:gap-x-6 md:gap-x-8 gap-y-2 sm:gap-y-3.5 items-center [grid-template-areas:'title_title'_'subtitle_price'_'button_price'] md:[grid-template-areas:'title_price'_'subtitle_price'_'button_price'] ${
                    isFullwidth ? '' : 'md:max-w-[var(--hero-title-max-w)]'
                  }`
                : `flex flex-col gap-2.5 sm:gap-4 ${
                    isFullwidth ? '' : 'md:max-w-[var(--hero-title-max-w)]'
                  }`
            } ${
              mobileAlignX === 'center' ? 'text-center' :
              mobileAlignX === 'right' ? 'text-right' : 'text-left'
            } ${
              desktopAlignX === 'center' ? 'md:text-center' :
              desktopAlignX === 'right' ? 'md:text-right' : 'md:text-left'
            }`}
          >
            {/* Título H1 (Fila 1 completa al 100% de ancho en móvil) */}
            <div className="[grid-area:title] min-w-0">
              <h1 
                style={{ 
                  fontSize: isPriceActive 
                    ? `clamp(${(2.1 * mobileTitleScale).toFixed(2)}rem, ${(4.8 * tabletTitleScale).toFixed(2)}vw, ${(6.8 * desktopTitleScale).toFixed(2)}rem)`
                    : `clamp(${(2.4 * mobileTitleScale).toFixed(2)}rem, ${(5.5 * tabletTitleScale).toFixed(2)}vw, ${(7.2 * desktopTitleScale).toFixed(2)}rem)`,
                  fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif"
                }}
                className={`leading-[1.05] font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tight ${
                  desktopAlignX === 'center' ? 'md:mx-auto' : ''
                }`}
              >
                {data?.hero_title || 'Descubre tu Mejor Versión'}
              </h1>
            </div>

            {/* Subtítulo (Fila 2 en móvil, inmediatamente debajo del H1 a la izquierda) */}
            <div className="[grid-area:subtitle] min-w-0">
              <p 
                style={{
                  fontSize: `clamp(${(1.15 * mobileSubtitleScale).toFixed(2)}rem, ${(1.55 * tabletSubtitleScale).toFixed(2)}vw, ${(1.65 * desktopSubtitleScale).toFixed(2)}rem)`
                }}
                className={`text-white/90 font-medium font-sans tracking-wide leading-relaxed drop-shadow-md ${
                  desktopAlignX === 'center' ? 'md:max-w-2xl md:mx-auto' : 'max-w-xl'
                }`}
              >
                {data?.hero_subtitle || 'Tratamientos estéticos avanzados y bienestar en un ambiente exclusivo.'}
              </p>
            </div>

            {/* Botón de Acción CTA (Fila 3 en móvil, debajo del subtítulo en la columna izquierda) */}
            {data?.hero_show_button !== false && (
              <div className={`[grid-area:button] pt-1 md:pt-2 w-full ${
                mobileAlignX === 'center' ? 'flex justify-center' :
                mobileAlignX === 'right' ? 'flex justify-end' : 'flex justify-start'
              } ${
                desktopAlignX === 'center' ? 'md:flex md:justify-center' :
                desktopAlignX === 'right' ? 'md:flex md:justify-end' : 'md:flex md:justify-start'
              }`}>
                <Link 
                  href={data?.hero_button_link || "/reservar"} 
                  className={`inline-flex items-center justify-center px-6 py-2.5 sm:px-8 sm:py-3.5 md:px-11 md:py-4 rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:scale-105 active:scale-95 group text-center whitespace-nowrap w-fit ${getButtonStyle(data?.hero_button_style)}`}
                >
                  <span>{data?.hero_button_text || 'Reservar Cita'}</span>
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
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
      </motion.div>
    </section>
  );
}
