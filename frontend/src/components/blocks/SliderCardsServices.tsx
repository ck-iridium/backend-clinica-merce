"use client";
import { useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function SliderCardsServices({ data, services }: { data: any, services: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  const activeServices = services.filter(s => s.is_active);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.75 : scrollLeft + clientWidth * 0.75;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (activeServices.length === 0) return null;

  return (
    <section className="w-full py-24 bg-[#F5F2EE] px-6 md:px-12 flex flex-col snap-start snap-stop-always md:snap-none overflow-hidden">
      {/* Header with Title and Nav buttons */}
      <div className="max-w-7xl mx-auto w-full mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl text-center md:text-left">
          <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-stone-900 leading-tight">
            {data?.title || 'Tratamientos Exclusivos'}
          </h2>
          {data?.subtitle && (
            <p className="text-lg md:text-xl text-stone-500 mt-3 font-medium font-sans">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Scroll Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button 
            onClick={() => scroll('left')}
            className="w-12 h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-800 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <button 
            onClick={() => scroll('right')}
            className="w-12 h-12 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-800 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all duration-300 shadow-sm"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Horizontal Cards Slider */}
      <div 
        ref={scrollRef}
        className="w-full overflow-x-auto snap-x-mandatory hide-scroll flex gap-6 pb-8"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {/* Left spacing for alignment with max-w-7xl container on desktop */}
        <div className="hidden md:block w-[calc((100vw-1280px)/2)] shrink-0"></div>

        {activeServices.map((svc, idx) => (
          <motion.div
            key={svc.id}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.05 }}
            className="w-[85vw] md:w-[380px] h-[550px] shrink-0 snap-center snap-stop-always rounded-3xl overflow-hidden shadow-luxury bg-white border border-stone-100/50 flex flex-col justify-end p-6 relative group transition-all duration-500 hover:shadow-xl"
          >
            {/* Background Image */}
            {svc.image_url ? (
              <img
                src={getFullUrl(svc.image_url)}
                alt={svc.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="absolute inset-0 bg-stone-100 flex items-center justify-center">
                <span className="font-serif text-stone-300 italic">ProBookia</span>
              </div>
            )}

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent z-10"></div>

            {/* Meta tags */}
            <div className="absolute top-6 right-6 z-20">
              <div className="bg-black/35 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
                <span className="text-[#d4af37] text-xs font-black uppercase tracking-wider">
                  {svc.price}€
                </span>
              </div>
            </div>

            {/* Content info */}
            <div className="relative z-20 text-white w-full">
              <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.2em] mb-2 block">
                {svc.duration_minutes} min
              </span>
              <h4 className="text-2xl font-serif font-bold leading-tight group-hover:text-[#d4af37] transition-colors line-clamp-2">
                {svc.name}
              </h4>
              <p className="text-sm text-white/70 mt-2 font-medium line-clamp-2 group-hover:text-white/95 transition-colors">
                {svc.description}
              </p>
              
              <div className="pt-6">
                <Link 
                  href={`/reservar?service=${svc.id}`} 
                  className="w-full text-center block bg-white/10 backdrop-blur-md border border-white/20 text-white py-3 rounded-full text-sm font-bold tracking-wider uppercase hover:bg-white hover:text-stone-950 transition-all duration-300"
                >
                  Reservar Cita
                </Link>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Right spacing for padding balance */}
        <div className="w-6 md:w-[calc((100vw-1280px)/2)] shrink-0"></div>
      </div>
    </section>
  );
}
