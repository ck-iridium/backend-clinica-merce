"use client";
import { useRef } from 'react';
import ServiceCard from './ServiceCard'; // Asegúrate de la ruta

export default function TreatmentCarousel({ servicios }: { servicios: any[] }) {
  const carouselRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      // Scrolleamos un 60% del ancho visible de la pantalla para asegurar que rompemos el punto de snap
      const scrollAmount = direction === 'left' ? -carouselRef.current.clientWidth * 0.6 : carouselRef.current.clientWidth * 0.6;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* TRACK DEL CARRUSEL (Sangrado Edge-to-Edge) */}
      <div 
        ref={carouselRef}
        className="flex overflow-x-auto snap-x snap-mandatory gap-6 pt-8 pb-24 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{
          paddingLeft: 'max(1.5rem, calc((100vw - 1400px) / 2 + 3rem))', /* 3rem = px-12 align */
          paddingRight: '1.5rem'
        }}
      >
        {servicios.map((servicio) => (
          <div key={servicio.id} className="min-w-[320px] max-w-[320px] md:min-w-[360px] md:max-w-[360px] h-[450px] md:h-[520px] shrink-0 snap-start">
            <ServiceCard service={servicio} className="w-full h-full" />
          </div>
        ))}
      </div>

      {/* FLECHAS DE NAVEGACIÓN (Alineadas a la derecha del contenedor base) */}
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 mt-2 flex justify-end gap-4 hidden md:flex">
        <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>
        <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-all">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    </div>
  );
}
