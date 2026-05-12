"use client";
import { useRef, useState, useEffect } from 'react';
import ServiceCard from './ServiceCard';

interface TreatmentCarouselProps {
  servicios: any[];
  loop?: boolean;
}

export default function TreatmentCarousel({ servicios, loop = false }: TreatmentCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Triplicamos los servicios para el efecto infinito si está activado
  const displayItems = loop ? [...servicios, ...servicios, ...servicios] : servicios;

  // Posicionamiento inicial: Siempre 0 para alineación perfecta con el título
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    setIsReady(true);
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const child = container.children[0] as HTMLElement;
      const childWidth = child ? child.offsetWidth : 372;
      const gap = 24; 
      const scrollAmount = direction === 'left' ? -(childWidth + gap) : (childWidth + gap);

      // Si es loop y estamos al principio intentando ir a la izquierda
      if (loop && direction === 'left' && container.scrollLeft <= 10) {
        // Teletransporte al segundo bloque antes de movernos
        container.style.scrollBehavior = 'auto';
        container.scrollLeft = servicios.length * (childWidth + gap);
        container.style.scrollBehavior = 'smooth';
      }

      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });

      // Lógica de teletransporte para el final
      if (loop) {
        setTimeout(() => {
          const totalWidth = servicios.length * (childWidth + gap);
          if (container.scrollLeft >= totalWidth * 2) {
            container.style.scrollBehavior = 'auto';
            container.scrollLeft -= totalWidth;
            container.style.scrollBehavior = 'smooth';
          }
        }, 500);
      }
    }
  };

  return (
    <div className={`w-full flex flex-col group/carousel transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <style dangerouslySetInnerHTML={{ __html: '.hide-scroll-desktop::-webkit-scrollbar { display: none; } .hide-scroll-desktop { -ms-overflow-style: none; scrollbar-width: none; }' }} />
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto hide-scroll-desktop gap-6 py-12 snap-x mandatory scroll-smooth"
        style={{
          paddingLeft: 'max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))',
          paddingRight: 'max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))',
          scrollPaddingLeft: 'max(1.5rem, calc((100vw - 1280px) / 2 + 1.5rem))'
        }}
      >
        {displayItems.map((s, idx) => (
          <div key={`${s.id}-${idx}`} className="w-[372px] h-[662px] shrink-0 snap-start">
            <ServiceCard service={s} className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="max-w-7xl w-full mx-auto px-6 flex justify-end gap-4 -mt-4 mb-8 hidden md:flex">
        <button onClick={() => handleScroll('left')} className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all z-30">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => handleScroll('right')} className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all z-30">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
