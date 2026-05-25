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

  const [mounted, setMounted] = useState(false);
  const [paddingStyles, setPaddingStyles] = useState<any>({});

  // Triplicamos los servicios para el efecto infinito si está activado
  const displayItems = loop ? [...servicios, ...servicios, ...servicios] : servicios;

  // Lógica de montaje y estilos dinámicos (evita Hydration Error)
  useEffect(() => {
    setMounted(true);
    const isMobile = window.innerWidth < 768;
    const desktopPadding = 'max(1.5rem, calc((100% - 1280px) / 2 + 1.5rem))';
    
    setPaddingStyles({
      paddingLeft: isMobile ? '1.5rem' : desktopPadding,
      paddingRight: isMobile ? '1.5rem' : desktopPadding,
      scrollPaddingLeft: isMobile ? '0' : desktopPadding
    });

    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = 0;
    }
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
    <div className="w-full flex flex-col group/carousel">
      <style dangerouslySetInnerHTML={{ __html: '.hide-scroll-desktop::-webkit-scrollbar { display: none; } .hide-scroll-desktop { -ms-overflow-style: none; scrollbar-width: none; }' }} />
      <div
        ref={scrollContainerRef}
        className={`flex overflow-x-auto hide-scroll-desktop gap-4 md:gap-6 py-8 md:py-12 snap-x snap-mandatory px-6 md:px-0 h-full ${servicios.length <= 1 ? 'justify-center' : 'justify-start'}`}
        style={mounted ? paddingStyles : {}}
      >
        {displayItems.map((s, idx) => (
          <div 
            key={`${s.id}-${idx}`} 
            className="w-[85vw] md:w-[372px] h-full md:h-[662px] shrink-0 snap-center md:snap-start snap-stop-always"
          >
            <ServiceCard service={s} className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* BOTONES DE NAVEGACIÓN */}
      <div className="max-w-7xl w-full mx-auto px-6 flex justify-end gap-4 -mt-4 mb-8 hidden md:flex">
        <button 
          onClick={() => handleScroll('left')} 
          className={`w-12 h-12 rounded-full bg-white dark:bg-stone-900 shadow-lg dark:shadow-none border border-gray-100 dark:border-stone-800 flex items-center justify-center text-gray-800 dark:text-stone-100 hover:scale-110 active:scale-95 transition-all z-30 ${!showLeftArrow ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button 
          onClick={() => handleScroll('right')} 
          className="w-12 h-12 rounded-full bg-white dark:bg-stone-900 shadow-lg dark:shadow-none border border-gray-100 dark:border-stone-800 flex items-center justify-center text-gray-800 dark:text-stone-100 hover:scale-110 active:scale-95 transition-all z-30"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
