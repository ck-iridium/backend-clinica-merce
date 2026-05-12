"use client";
import { useRef, useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';

interface TreatmentCarouselProps {
  servicios: any[];
  loop?: boolean;
}

export default function TreatmentCarousel({ servicios, loop = false }: TreatmentCarouselProps) {
  // 1. Referencia al contenedor de SCROLL
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Triplicamos los servicios para el efecto infinito si está activado
  const displayItems = loop ? [...servicios, ...servicios, ...servicios] : servicios;

  // Posicionamiento inicial para el bucle infinito
  useEffect(() => {
    if (loop && scrollContainerRef.current && servicios.length > 0) {
      const container = scrollContainerRef.current;
      
      // Esperamos un momento a que el layout esté listo
      const timer = setTimeout(() => {
        const cardWidth = 372 + 24; // ancho + gap
        const offset = servicios.length * cardWidth;
        container.scrollLeft = offset;
        setIsReady(true);
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      setIsReady(true);
    }
  }, [loop, servicios.length]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const child = container.children[0] as HTMLElement;
      const childWidth = child ? child.offsetWidth : 372;
      const gap = 24; // gap-6
      const scrollAmount = direction === 'left' ? -(childWidth + gap) : (childWidth + gap);

      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });

      // Lógica de teletransporte para el bucle infinito
      if (loop) {
        setTimeout(() => {
          const cardWidth = childWidth + gap;
          const totalWidth = servicios.length * cardWidth;
          
          // Si estamos muy al final, saltamos al bloque central
          if (container.scrollLeft >= totalWidth * 2) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft -= totalWidth;
            container.style.scrollBehavior = 'smooth';
          } 
          // Si estamos muy al principio, saltamos al bloque central
          else if (container.scrollLeft <= totalWidth / 2) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft += totalWidth;
            container.style.scrollBehavior = 'smooth';
          }
        }, 500); // Tiempo suficiente para que termine la animación smooth
      }
    }
  };

  return (
    <div className={`w-full flex flex-col group/carousel transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <style dangerouslySetInnerHTML={{ __html: '.hide-scroll-desktop::-webkit-scrollbar { display: none; } .hide-scroll-desktop { -ms-overflow-style: none; scrollbar-width: none; }' }} />
      {/* CONTENEDOR DE SCROLL - LA REF VA AQUÍ */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto hide-scroll-desktop gap-6 py-12 snap-x mandatory scroll-smooth"
        style={{
          paddingLeft: 'max(1.5rem, calc((100% - 1280px) / 2 + 1.5rem))',
          paddingRight: 'max(1.5rem, calc((100% - 1280px) / 2 + 1.5rem))',
          scrollPaddingLeft: 'max(1.5rem, calc((100% - 1280px) / 2 + 1.5rem))'
        }}
      >
        {displayItems.map((s, idx) => (
          <div key={`${s.id}-${idx}`} className="w-[372px] h-[662px] shrink-0 snap-start">
            <ServiceCard service={s} className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* BOTONES DE NAVEGACIÓN - BLANCOS ESTILO APPLE */}
      <div className="max-w-7xl w-full mx-auto px-6 md:px-12 flex justify-end gap-4 -mt-4 mb-8 hidden md:flex">
        <button
          onClick={() => handleScroll('left')}
          className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all z-30"
          aria-label="Anterior"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button
          onClick={() => handleScroll('right')}
          className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all z-30"
          aria-label="Siguiente"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
