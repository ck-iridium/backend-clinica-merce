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
  const alignY = data?.hero_alignment === 'top' ? 'items-start pt-48' : data?.hero_alignment === 'bottom' ? 'items-end pb-32' : 'items-center';
  const alignX = isFullwidth
    ? (data?.hero_horizontal_alignment === 'left' ? 'justify-start text-left px-6' : data?.hero_horizontal_alignment === 'right' ? 'justify-end text-right px-6' : 'justify-center text-center px-6')
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

  const titleMaxWidth = data?.hero_title_max_width || 100;
  const isPriceActive = !!data?.hero_price_enabled && (data?.hero_price_amount || data?.hero_price_prefix);
  const titleScale = parseSizeScale(data?.hero_title_size, 100) / 100;
  const subtitleScale = parseSizeScale(data?.hero_subtitle_size, 100) / 100;
  const priceScale = parseSizeScale(data?.hero_price_size, 100) / 100;
  const priceConfig = getPriceStyleConfig(data?.hero_price_style);

  const renderPriceCapsule = () => {
    if (!isPriceActive) return null;
    return (
      <div className={`relative group ${priceConfig.boxClass} select-none`}>
        <div className="relative flex flex-col items-center justify-center text-center">
          {data?.hero_price_prefix && (
            <span className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.2em] ${priceConfig.prefixClass} block leading-none`}>
              {data?.hero_price_prefix}
            </span>
          )}
          <div 
            className="flex items-baseline justify-center gap-0.5 sm:gap-1.5 leading-none"
            style={{ marginTop: `${-8 + (data?.hero_price_offset_y || 0)}px` }}
          >
            <span 
              style={{ fontSize: `clamp(${(2.4 * priceScale).toFixed(2)}rem, ${(4.8 * priceScale).toFixed(2)}vw, ${(6.5 * priceScale).toFixed(2)}rem)` }}
              className={`font-serif font-black ${priceConfig.amountClass} tracking-tight`}
            >
              {data?.hero_price_amount || '15'}
            </span>
            <span 
              style={{ fontSize: `clamp(${(1.2 * priceScale).toFixed(2)}rem, ${(2.2 * priceScale).toFixed(2)}vw, ${(2.8 * priceScale).toFixed(2)}rem)` }}
              className={`font-serif font-bold ${priceConfig.suffixClass}`}
            >
              {data?.hero_price_suffix || '€'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className={`relative h-[100dvh] min-h-[600px] w-full flex snap-start snap-stop-always md:snap-none ${alignY} ${alignX} overflow-hidden mt-0`}>
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
            ? `max-w-7xl ${data?.hero_horizontal_alignment === 'left' ? 'ml-0 mr-auto text-left' : data?.hero_horizontal_alignment === 'right' ? 'mr-0 ml-auto text-right' : 'mx-auto text-center'}`
            : `max-w-7xl mx-auto ${data?.hero_horizontal_alignment === 'left' ? 'text-left' : data?.hero_horizontal_alignment === 'right' ? 'text-right' : 'text-center'}`
        }`}
      >
        <div className={`flex flex-col ${
          data?.hero_horizontal_alignment === 'center' ? 'items-center' :
          data?.hero_horizontal_alignment === 'right' ? 'items-end' : 'items-start'
        }`}>
          {/* Fila Principal: Textos (Título + Subtítulo) a la izquierda y Precio pegado inmediatamente a la derecha */}
          <div className={`flex flex-row items-center gap-4 sm:gap-6 md:gap-8 max-w-full ${
            data?.hero_horizontal_alignment === 'center' ? 'justify-center' :
            data?.hero_horizontal_alignment === 'right' ? 'justify-end' : 'justify-start'
          }`}>
            {/* Columna Izquierda: Título H1 y Subtítulo */}
            <div 
              style={{ '--hero-title-max-w': `${titleMaxWidth}%` } as React.CSSProperties}
              className={`min-w-0 space-y-2 sm:space-y-3.5 ${
                isPriceActive ? 'flex-1 md:max-w-[var(--hero-title-max-w)]' : 'w-full md:max-w-[var(--hero-title-max-w)]'
              } ${
                data?.hero_horizontal_alignment === 'center' ? 'text-center' :
                data?.hero_horizontal_alignment === 'right' ? 'text-right' : 'text-left'
              }`}
            >
              <h1 
                style={{ 
                  fontSize: isPriceActive 
                    ? `clamp(${(1.75 * titleScale).toFixed(2)}rem, ${(4.8 * titleScale).toFixed(2)}vw, ${(6.8 * titleScale).toFixed(2)}rem)`
                    : `clamp(${(2.2 * titleScale).toFixed(2)}rem, ${(5.5 * titleScale).toFixed(2)}vw, ${(7.2 * titleScale).toFixed(2)}rem)`
                }}
                className={`leading-[1.05] font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tight ${
                  data?.hero_horizontal_alignment === 'center' ? 'mx-auto' : ''
                }`}
              >
                {data?.hero_title || 'Descubre tu Mejor Versión'}
              </h1>

              <p 
                style={{
                  fontSize: `clamp(${(0.85 * subtitleScale).toFixed(2)}rem, ${(1.2 * subtitleScale).toFixed(2)}vw, ${(1.35 * subtitleScale).toFixed(2)}rem)`
                }}
                className={`text-white/90 font-medium font-sans tracking-wide leading-relaxed drop-shadow-md ${
                  data?.hero_horizontal_alignment === 'center' ? 'max-w-2xl mx-auto' : 'max-w-xl'
                }`}
              >
                {data?.hero_subtitle || 'Tratamientos estéticos avanzados y bienestar en un ambiente exclusivo.'}
              </p>
            </div>

            {/* Columna Derecha: Bloque de Precio Pegado Inmediatamente al Título y Subtítulo */}
            {isPriceActive && (
              <div className="shrink-0 self-center">
                {renderPriceCapsule()}
              </div>
            )}
          </div>

          {/* Fila Inferior: Botón de Acción CTA (debajo del bloque de textos y precio) */}
          {data?.hero_show_button !== false && (
            <div className={`pt-3 sm:pt-4 md:pt-6 w-full ${
              data?.hero_horizontal_alignment === 'center' ? 'flex justify-center' :
              data?.hero_horizontal_alignment === 'right' ? 'flex justify-end' : 'flex justify-start'
            }`}>
              <Link 
                href={data?.hero_button_link || "/reservar"} 
                className={`inline-flex items-center justify-center px-8 py-3.5 md:px-11 md:py-4 rounded-full font-bold text-base md:text-lg transition-all duration-300 hover:scale-105 active:scale-95 group text-center whitespace-nowrap w-fit ${getButtonStyle(data?.hero_button_style)}`}
              >
                <span>{data?.hero_button_text || 'Reservar Cita'}</span>
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </section>
  );
}
