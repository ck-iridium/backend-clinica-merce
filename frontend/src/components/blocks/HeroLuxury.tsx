"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import PublicNavbar from '@/components/PublicNavbar';

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
        return 'bg-[#d4af37] text-white border border-[#b8952b] hover:bg-[#b8952b] shadow-[0_10px_25px_rgba(212,175,55,0.4)]';
      case 'outline':
        return 'bg-transparent border-2 border-white/90 text-white hover:bg-white hover:text-stone-900';
      case 'solid_white':
        return 'bg-white text-stone-900 border border-stone-200 hover:bg-stone-100 shadow-xl';
      case 'glass':
      default:
        return 'bg-white/15 backdrop-blur-md border border-white/25 text-white hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white shadow-2xl';
    }
  };

  const titleMaxWidth = data?.hero_title_max_width || 100;
  const isPriceActive = !!data?.hero_price_enabled && (data?.hero_price_amount || data?.hero_price_prefix);

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
        className={`relative z-10 w-full ${
          isFullwidth
            ? `max-w-7xl ${data?.hero_horizontal_alignment === 'left' ? 'ml-0 mr-auto text-left' : data?.hero_horizontal_alignment === 'right' ? 'mr-0 ml-auto text-right' : 'mx-auto text-center'}`
            : `max-w-7xl mx-auto ${data?.hero_horizontal_alignment === 'left' ? 'text-left' : data?.hero_horizontal_alignment === 'right' ? 'text-right' : 'text-center'}`
        }`}
      >
        {isPriceActive ? (
          /* Disposición en 2 Columnas: Título+Subtítulo a un lado, Bloque de Precio al lado igualando altura */
          <div className={`flex flex-col md:flex-row items-stretch gap-6 md:gap-12 ${
            data?.hero_horizontal_alignment === 'right' ? 'md:flex-row-reverse' : ''
          } ${data?.hero_horizontal_alignment === 'center' ? 'items-center justify-center' : 'justify-between'}`}>
            {/* Columna de Título y Subtítulo */}
            <div className="flex-1 min-w-0">
              <h1 
                style={{ maxWidth: `${titleMaxWidth}%` }}
                className={`${
                  data?.hero_title_size === 'medium' ? 'text-4xl md:text-5xl lg:text-6xl' :
                  data?.hero_title_size === 'xl' ? 'text-6xl md:text-7xl lg:text-8xl' :
                  'text-5xl md:text-6xl lg:text-7xl'
                } leading-none font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] ${
                  data?.hero_horizontal_alignment === 'center' ? 'mx-auto' : data?.hero_horizontal_alignment === 'right' ? 'ml-auto' : ''
                }`}
              >
                {data?.hero_title || 'Descubre tu Mejor Versión'}
              </h1>
              <p className={`${
                data?.hero_subtitle_size === 'small' ? 'text-base md:text-lg' :
                data?.hero_subtitle_size === 'large' ? 'text-lg md:text-2xl' :
                'text-base md:text-xl'
              } text-white/90 font-medium font-sans tracking-wide leading-relaxed drop-shadow-md mt-5 ${
                data?.hero_horizontal_alignment === 'center' ? 'max-w-2xl mx-auto' : 'max-w-2xl'
              } ${data?.hero_horizontal_alignment === 'right' ? 'ml-auto' : ''}`}>
                {data?.hero_subtitle || 'Tratamientos estéticos avanzados y bienestar en un ambiente exclusivo.'}
              </p>
            </div>

            {/* Columna de Precio Destacado */}
            <div className={`flex flex-col justify-center shrink-0 py-2 ${
              data?.hero_horizontal_alignment === 'center' ? 'items-center text-center' : data?.hero_horizontal_alignment === 'right' ? 'items-end text-right' : 'items-start md:items-end text-left md:text-right'
            }`}>
              <div className="bg-stone-900/40 backdrop-blur-md border border-white/20 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col justify-center">
                <span className="text-xs md:text-sm uppercase tracking-[0.25em] font-extrabold text-[#d4af37] block mb-1">
                  {data?.hero_price_prefix || 'Desde'}
                </span>
                <div className="flex items-baseline gap-1.5 leading-none">
                  <span className={`${
                    data?.hero_price_size === 'medium' ? 'text-5xl md:text-6xl lg:text-7xl' :
                    data?.hero_price_size === 'xl' ? 'text-7xl md:text-8xl lg:text-[9rem]' :
                    'text-6xl md:text-7xl lg:text-8xl'
                  } font-serif font-extrabold text-white tracking-tight drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]`}>
                    {data?.hero_price_amount || '45'}
                  </span>
                  <span className="text-2xl md:text-4xl font-serif font-bold text-[#d4af37] drop-shadow-md">
                    {data?.hero_price_suffix || '€'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Disposición Clásica: Título con Ancho Máx % + Subtítulo */
          <>
            <h1 
              style={{ maxWidth: `${titleMaxWidth}%` }}
              className={`${
                data?.hero_title_size === 'medium' ? 'text-4xl md:text-6xl lg:text-7xl' :
                data?.hero_title_size === 'xl' ? 'text-6xl md:text-8xl lg:text-[8.5rem]' :
                'text-5xl md:text-7xl lg:text-[7rem]'
              } leading-none font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)] ${
                data?.hero_horizontal_alignment === 'center' ? 'mx-auto' : data?.hero_horizontal_alignment === 'right' ? 'ml-auto' : ''
              }`}
            >
              {data?.hero_title || 'Descubre tu Mejor Versión'}
            </h1>
            <p className={`${
              data?.hero_subtitle_size === 'small' ? 'text-base md:text-xl' :
              data?.hero_subtitle_size === 'large' ? 'text-xl md:text-3xl' :
              'text-lg md:text-2xl'
            } text-white/90 font-medium font-sans tracking-wide leading-relaxed drop-shadow-md mt-6 ${
              data?.hero_horizontal_alignment === 'center' ? 'max-w-3xl mx-auto' : 'max-w-2xl'
            } ${data?.hero_horizontal_alignment === 'right' ? 'ml-auto' : ''}`}>
              {data?.hero_subtitle || 'Tratamientos estéticos avanzados y bienestar en un ambiente exclusivo.'}
            </p>
          </>
        )}

        {/* Botón de Acción con estilo dinámico */}
        {data?.hero_show_button !== false && (
          <div className="pt-8">
            <Link 
              href={data?.hero_button_link || "/reservar"} 
              className={`inline-block px-12 py-5 rounded-full font-bold text-lg transition-all duration-500 hover:scale-105 active:scale-95 group ${getButtonStyle(data?.hero_button_style)}`}
            >
              {data?.hero_button_text || 'Reservar Cita'} 
              <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        )}
      </motion.div>
    </section>
  );
}
