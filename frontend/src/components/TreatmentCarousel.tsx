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
  const [showLeftArrow, setShowLeftArrow] = useState(false);

  // Triplicamos los servicios para el efecto infinito si está activado
  const displayItems = loop ? [...servicios, ...servicios, ...servicios] : servicios;

  // Posicionamiento inicial: Siempre en 0
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
    setIsReady(true);
  }, []);

  // Lógica de Scroll: Control de flecha y Teletransporte
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || servicios.length === 0) return;

    const handleScrollLogic = () => {
      const { scrollLeft } = container;
      const cardWidth = 372 + 24;
      const totalWidth = servicios.length * cardWidth;

      // 1. Mostrar/Ocultar flecha izquierda
      if (scrollLeft > 100) {
        if (!showLeftArrow) setShowLeftArrow(true);
      } else {
        if (showLeftArrow) setShowLeftArrow(false);
      }

      // 2. Teletransporte infinito (solo si loop está activo)
      if (loop) {
        // Si llegamos cerca del final del tercer set, saltamos al inicio del segundo set
        if (scrollLeft >= totalWidth * 2 + 100) {
          container.style.scrollBehavior = 'auto';
          container.scrollLeft -= totalWidth;
          container.style.scrollBehavior = 'smooth';
        }
      }
    };

    container.addEventListener('scroll', handleScrollLogic, { passive: true });
    return () => container.removeEventListener('scroll', handleScrollLogic);
  }, [loop, servicios.length, showLeftArrow]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const child = container.children[0] as HTMLElement;
      const childWidth = child ? child.offsetWidth : 372;
      const gap = 24;
      const scrollAmount = direction === 'left' ? -(childWidth + gap) : (childWidth + gap);

      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className={`w-full flex flex-col group/carousel transition-opacity duration-500 ${isReady ? 'opacity-100' : 'opacity-0'}`}>
      <style dangerouslySetInnerHTML={{ __html: '.hide-scroll-desktop::-webkit-scrollbar { display: none; } .hide-scroll-desktop { -ms-overflow-style: none; scrollbar-width: none; }' }} />
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto hide-scroll-desktop gap-6 py-8 md:py-12 snap-x snap-mandatory"
        style={{
          paddingLeft: 'max(1.5rem, calc((100% - 1280px) / 2 + 1.5rem))',
          paddingRight: 'max(1.5rem, calc((100% - 1280px) / 2 + 1.5rem))',
          scrollPaddingLeft: 'max(1.5rem, calc((100% - 1280px) / 2 + 1.5rem))'
        }}
      >
        {displayItems.map((s, idx) => (
          <div 
            key={`${s.id}-${idx}`} 
            className="w-[85vw] md:w-[372px] h-[550px] md:h-[662px] shrink-0 snap-start snap-stop-always"
          >
            <ServiceCard service={s} className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="max-w-7xl w-full mx-auto px-6 flex justify-end gap-4 -mt-4 mb-8 hidden md:flex">
        <button 
          onClick={() => handleScroll('left')} 
          className={`w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all z-30 ${!showLeftArrow ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => handleScroll('right')} className="w-12 h-12 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-800 hover:scale-110 active:scale-95 transition-all z-30">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
