"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

export default function ServiceCard({ service, isLarge = false, className = '' }: { service: any, isLarge?: boolean, className?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      {
        threshold: 0.6, // Se activa cuando el 60% de la tarjeta es visible (centro de pantalla)
      }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      // Si el dispositivo usa ratón (pointer: fine), el vídeo se activa con el hover.
      // Si es táctil (móvil), se activa cuando está en el centro de la pantalla (isInView).
      const isTouch = window.matchMedia('(pointer: coarse)').matches;
      
      if ((isTouch && isInView) || (!isTouch && isHovered)) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isInView, isHovered]);

  // En móvil usamos isInView para la opacidad, en desktop usamos isHovered
  const isTouchDevice = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;
  const showVideo = isTouchDevice ? isInView : isHovered;

  return (
    <Link 
      href={`/tratamientos`} 
      ref={containerRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        group relative rounded-3xl overflow-hidden border border-stone-100 block bg-stone-50 transition-transform duration-500 ease-out shadow-sm hover:shadow-xl hover:scale-[1.03]
        flex-shrink-0
        ${className ? className : `
          w-[85vw] md:w-auto
          snap-center md:snap-align-none
          aspect-[4/5] md:aspect-auto
          ${isLarge ? 'md:h-full md:min-h-[400px]' : 'md:aspect-video'}
        `}
      `}
    >
        {/* Imagen Estática */}
        <div className={`absolute inset-0 bg-stone-200 transition-opacity duration-1000 ${showVideo ? 'opacity-0' : 'opacity-100'}`}>
          {service.image_url ? (
            <img 
              src={service.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${service.image_url}` : service.image_url} 
              alt={service.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                const span = document.createElement('span');
                span.className = 'font-serif text-stone-400 text-xs italic';
                span.innerText = 'Sin Imagen';
                e.currentTarget.parentElement?.appendChild(span);
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="font-serif text-stone-400 text-xs italic">Sin Imagen</span>
            </div>
          )}
        </div>
        
        {/* Vídeo / Imagen Secundaria Hover (Star Effect) */}
        <div className={`absolute inset-0 bg-stone-900 transition-opacity duration-1000 ${showVideo ? 'opacity-100' : 'opacity-0'}`}>
          {service.video_url && (
            <video 
              ref={videoRef}
              loop 
              muted 
              playsInline 
              className="w-full h-full object-cover"
            >
              <source src={service.video_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${service.video_url}` : service.video_url} type="video/mp4" />
            </video>
          )}
          {!service.video_url && service.image_url && (
             <img 
              src={service.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${service.image_url}` : service.image_url} 
              alt={service.name} 
              className="w-full h-full object-cover opacity-40 mix-blend-overlay"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
          )}
        </div>

        {/* Gradiente Protector para el texto (Oscuro permanentemente para leer texto blanco) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-10"></div>

        {/* CONTENEDOR DE TEXTO PEGADO ABAJO */}
        <div className="absolute bottom-0 left-0 w-full p-8 z-20 flex flex-col justify-end">
          
          {/* Título y precio (Siempre visibles) */}
          <div>
            <h3 className="text-2xl font-serif text-white font-bold leading-tight mb-2">
              {service.name}
            </h3>
            <div className="flex items-center gap-3 text-[#d4af37] font-semibold text-sm uppercase tracking-wider">
              <span>{service.duration_minutes} MIN</span>
              <span>•</span>
              <span>{service.price} €</span>
            </div>
          </div>

          {/* Descripción (Oculta por defecto, se expande en hover) */}
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
            <div className="overflow-hidden">
              <p className="text-gray-200 text-sm mt-4 line-clamp-3">
                {service.description}
              </p>
            </div>
          </div>

        </div>
    </Link>
  );
}
