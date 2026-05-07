"use client";
import { useRef } from 'react';
import ServiceCard from './ServiceCard'; 

export default function TreatmentCarousel({ servicios }: { servicios: any[] }) {
  // 1. Referencia al contenedor de SCROLL
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const child = scrollContainerRef.current.children[0] as HTMLElement;
      const childWidth = child ? child.offsetWidth : 320;
      const gap = 24; // gap-6
      const scrollAmount = direction === 'left' ? -(childWidth + gap) : (childWidth + gap);
      
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    } else {
      console.error("Error: No se encuentra la referencia al contenedor de scroll");
    }
  };

  return (
    <div className="w-full flex flex-col group/carousel">
      <style dangerouslySetInnerHTML={{ __html: '.hide-scroll-desktop::-webkit-scrollbar { display: none; } .hide-scroll-desktop { -ms-overflow-style: none; scrollbar-width: none; }' }} />
      {/* CONTENEDOR DE SCROLL - LA REF VA AQUÍ */}
      <div 
        ref={scrollContainerRef}
        className="flex overflow-x-auto hide-scroll-desktop gap-6 py-12"
        style={{
          paddingLeft: 'max(1.5rem, calc((100vw - 1400px) / 2 + 3rem))',
          paddingRight: 'max(1.5rem, calc((100vw - 1400px) / 2 + 3rem))'
        }}
      >
        {servicios.map((s) => (
          <div key={s.id} className="w-[300px] h-[540px] shrink-0">
            <ServiceCard service={s} className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* BOTONES DE NAVEGACIÓN - BLANCOS ESTILO APPLE */}
      <div className="max-w-[1400px] w-full mx-auto px-6 md:px-12 flex justify-end gap-4 -mt-4 mb-8 hidden md:flex">
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
