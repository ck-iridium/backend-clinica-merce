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
  const alignY = data?.hero_alignment === 'top' ? 'items-start pt-48' : data?.hero_alignment === 'bottom' ? 'items-end pb-32' : 'items-center';
  const alignX = data?.hero_horizontal_alignment === 'left' ? 'justify-start text-left px-6 md:px-12 lg:px-24' : data?.hero_horizontal_alignment === 'right' ? 'justify-end text-right px-6 md:px-12 lg:px-24' : 'justify-center text-center px-6';

  return (
    <section className={`relative h-[100dvh] min-h-[600px] w-full flex snap-start snap-stop-always md:snap-none ${alignY} ${alignX} overflow-hidden mt-0`}>
      {/* Dynamic Navbar overlaid inside snap home section */}
      <div className="absolute top-0 left-0 w-full z-[100]">
        <PublicNavbar transparent={true} />
      </div>

      {/* Background Media */}
      {bgVideo ? (
        <div className="absolute inset-0 z-0 bg-stone-900">
          <video autoPlay loop muted playsInline className="w-full h-full object-cover">
            <source src={getFullUrl(bgVideo)} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply"></div>
        </div>
      ) : bgImage ? (
        <div className="absolute inset-0 z-0 bg-stone-900">
          <img src={getFullUrl(bgImage)} alt="Hero Background" className="w-full h-full object-cover" />
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
        className={`relative z-10 max-w-7xl w-full ${data?.hero_horizontal_alignment === 'left' ? 'ml-0 mr-auto' : data?.hero_horizontal_alignment === 'right' ? 'mr-0 ml-auto' : 'mx-auto'}`}
      >
        <h1 className="text-5xl md:text-7xl lg:text-[6.5rem] leading-none font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.4)]">
          {data?.hero_title || 'Descubre tu Mejor Versión'}
        </h1>
        <p className={`text-lg md:text-2xl text-white/90 font-medium font-sans tracking-wide leading-relaxed drop-shadow-md mt-6 ${data?.hero_horizontal_alignment === 'center' ? 'max-w-3xl mx-auto' : 'max-w-2xl'} ${data?.hero_horizontal_alignment === 'right' ? 'ml-auto' : ''}`}>
          {data?.hero_subtitle || 'Tratamientos estéticos avanzados y bienestar en un ambiente exclusivo.'}
        </p>

        {data?.hero_show_button !== false && (
          <div className="pt-8">
            <Link 
              href={data?.hero_button_link || "/reservar"} 
              className="inline-block bg-white/15 backdrop-blur-md border border-white/25 text-white px-12 py-5 rounded-full font-bold text-lg hover:bg-[#d4af37] hover:border-[#d4af37] hover:text-white transition-all duration-500 shadow-2xl hover:scale-105 active:scale-95 group"
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
