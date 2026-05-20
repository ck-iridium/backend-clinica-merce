"use client";
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

// ─── Componente Encapsulado de Tarjeta Bento con Video Hover y Precarga ──────
function BentoServiceCard({ svc, idx, gridClass, total }: { svc: any, idx: number, gridClass: string, total: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.4 } // Se activa al visualizar el 40% de la tarjeta
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isTouchDevice = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;
  const shouldShowVideo = isTouchDevice ? isInView : isHovered;

  useEffect(() => {
    if (videoRef.current) {
      if (shouldShowVideo) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [shouldShowVideo]);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  const videoUrl = svc.video_url ? getFullUrl(svc.video_url) : null;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: idx * 0.1 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${gridClass} group relative rounded-3xl overflow-hidden shadow-luxury bg-white border border-stone-100/50 flex flex-col justify-end p-6 cursor-pointer transition-all duration-500 hover:shadow-xl`}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
    >
      {/* Imagen Estática de Fondo */}
      <div className="absolute inset-0 bg-stone-200 z-0 overflow-hidden">
        {svc.image_url ? (
          <img
            src={getFullUrl(svc.image_url)}
            alt={svc.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-stone-100 flex items-center justify-center">
            <span className="font-serif text-stone-300 italic">ProBookia</span>
          </div>
        )}
      </div>

      {/* Video Hover de Precarga con Control de Opacidad */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${shouldShowVideo ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
        {videoUrl ? (
          <video 
            ref={videoRef}
            loop 
            muted 
            playsInline 
            className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ease-out ${videoLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            onCanPlay={() => setVideoLoaded(true)}
            src={videoUrl}
          />
        ) : svc.image_url ? (
           <img 
            src={getFullUrl(svc.image_url)} 
            alt={svc.name} 
            className="w-full h-full object-cover opacity-40 mix-blend-overlay absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            loading="lazy"
          />
        ) : null}

        {videoUrl && shouldShowVideo && !videoLoaded && (
          <div className="absolute bottom-8 right-8 z-30">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Elegant Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/20 to-transparent z-20"></div>

      {/* Service Meta Details */}
      <div className="relative z-30 text-white w-full">
        <span className="text-[#d4af37] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2 block">
          {svc.duration_minutes} min • {svc.price}€
        </span>
        <h4 className="text-xl md:text-2xl font-serif font-bold leading-tight group-hover:text-[#d4af37] transition-colors line-clamp-2">
          {svc.name}
        </h4>
        <p className="text-xs text-white/70 mt-2 font-medium line-clamp-2 group-hover:text-white/95 transition-colors">
          {svc.description}
        </p>
        <div className="pt-4 opacity-0 -translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Link 
            href={`/reservar?service=${svc.id}`} 
            className="inline-flex items-center text-xs font-bold text-[#d4af37] tracking-wider uppercase gap-1"
          >
            Reservar ahora <span className="translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Componente Principal ───────────────────────────────────────────────────
export default function BentoGridServices({ data, services }: { data: any, services: any[] }) {
  const maxServices = data?.max_services || 4;
  const filteredServices = services
    .filter(s => s.is_active)
    .sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0))
    .slice(0, maxServices);

  if (filteredServices.length === 0) return null;

  const total = filteredServices.length;

  // Lógica de Bento inteligente y reactivo sin huecos
  let containerGridClass = "grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[250px]";
  
  if (total === 4) {
    containerGridClass = "grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[280px] md:auto-rows-[280px]";
  } else if (total === 2) {
    containerGridClass = "grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[350px] md:auto-rows-[350px]";
  } else if (total === 1) {
    containerGridClass = "grid-cols-1 gap-6 auto-rows-[450px]";
  }

  const getGridClasses = (index: number, totalCount: number) => {
    if (totalCount === 3) {
      if (index === 0) return 'md:col-span-2 md:row-span-2 h-full';
      return 'md:col-span-1 md:row-span-1 h-full';
    }
    if (totalCount === 4) {
      return 'md:col-span-1 md:row-span-1 h-full';
    }
    if (totalCount === 2) {
      return 'md:col-span-1 md:row-span-1 h-full';
    }
    if (totalCount === 1) {
      return 'col-span-1 h-full';
    }
    // Para >= 5 elementos
    if (index === 0) return 'md:col-span-2 md:row-span-2 h-full';
    if (index === 4) return 'md:col-span-2 md:row-span-1 h-full';
    return 'md:col-span-1 md:row-span-1 h-full';
  };

  return (
    <section className="w-full py-24 px-6 md:px-12 bg-[#FAFAFA] flex flex-col snap-start snap-stop-always md:snap-none">
      {/* Title */}
      <div className="max-w-7xl mx-auto w-full mb-12 text-center md:text-left">
        <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-stone-900 leading-tight">
          {data?.title || 'Nuestros Tratamientos Insignia'}
        </h2>
        {data?.subtitle && (
          <p className="text-lg md:text-xl text-stone-500 mt-3 font-medium font-sans">
            {data.subtitle}
          </p>
        )}
      </div>

      {/* Asymmetric Bento Grid */}
      <div className={`max-w-7xl mx-auto w-full grid ${containerGridClass}`}>
        {filteredServices.map((svc, idx) => {
          const gridClass = getGridClasses(idx, total);
          return (
            <BentoServiceCard 
              key={svc.id} 
              svc={svc} 
              idx={idx} 
              gridClass={gridClass} 
              total={total} 
            />
          );
        })}
      </div>
    </section>
  );
}
