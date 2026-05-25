"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function ServiceCard({ service, isLarge = false, className = '' }: { service: any, isLarge?: boolean, className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const containerRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.6, // Se activa cuando el 60% de la tarjeta es visible
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isTouchDevice = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;
  const shouldShowVideo = isTouchDevice ? isInView : isHovered;

  useEffect(() => {
    if (videoRef.current) {
      if (shouldShowVideo) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
  }, [shouldShowVideo]);

  const videoUrl = service.video_url?.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${service.video_url}` : service.video_url;

  return (
    <Link
      href={`/tratamientos/${service.category_slug || 'general'}/${service.slug || service.id}`}
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-850 block bg-stone-50 dark:bg-stone-900 transition-all duration-500 ease-out shadow-sm hover:shadow-xl
        flex-shrink-0 w-[85vw] md:w-[372px] h-full md:h-[662px] snap-center md:snap-align-none
        ${className}
      `}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
    >
      {/* Imagen Estática con Lazy Loading - Siempre visible de fondo para evitar flash */}
      <div className="absolute inset-0 bg-stone-200 dark:bg-stone-900 z-0 overflow-hidden">
        {service.image_url ? (
          <img
            src={service.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${service.image_url}` : service.image_url}
            alt={service.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="font-serif text-stone-400 dark:text-stone-600 text-xs italic">Sin Imagen</span>
          </div>
        )}
      </div>

      {/* Vídeo / Imagen Secundaria Hover - CON PRE-CARGA Y CONTROL DE OPACIDAD SIN RE-MONTAR */}
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
        ) : service.image_url ? (
          <img
            src={service.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${service.image_url}` : service.image_url}
            alt={service.name}
            className="w-full h-full object-cover opacity-40 mix-blend-overlay absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            loading="lazy"
          />
        ) : null}

        {/* Spinner de carga minimalista - BLANCO */}
        {videoUrl && shouldShowVideo && !videoLoaded && (
          <div className="absolute bottom-8 right-8 z-30">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Gradiente Protector para el texto - Capa z-20 para asegurar que esté sobre el vídeo */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20"></div>

      {/* CONTENEDOR DE TEXTO PEGADO ABAJO - Capa z-30 sobre el gradiente y el vídeo */}
      <div className="absolute bottom-0 left-0 w-full p-8 z-30 flex flex-col justify-end">

        {/* Título y precio (Siempre visibles) */}
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
          <h3 className="text-2xl font-serif text-white font-bold leading-tight mb-2">
            {service.name}
          </h3>
          <div className="flex items-center gap-3 text-primary font-semibold text-sm uppercase tracking-wider">
            <span>{service.duration_minutes} MIN</span>
            <span>•</span>
            <span>{service.price} €</span>
          </div>
        </div>

        {/* Descripción (Oculta por defecto, se expande en hover) */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
          <div className="overflow-hidden">
            <p className="text-gray-200 text-sm mt-4 line-clamp-3 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
              {service.description}
            </p>
          </div>
        </div>

      </div>
    </Link>
  );
}
