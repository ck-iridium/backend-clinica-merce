"use client";
import { useRef } from 'react';
import ServiceCard from '../ServiceCard';
import { ArrowLeft, ArrowRight } from 'lucide-react';

export default function SliderCardsServices({ data, services }: { data: any, services: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeServices = services.filter(s => s.is_active);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth * 0.4 : scrollLeft + clientWidth * 0.4;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (activeServices.length === 0) return null;

  return (
    <section className="w-full py-20 bg-[#F5F2EE] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex flex-col relative">

        {/* Cabecera perfectamente alineada a la izquierda */}
        <div className="w-full mb-10 text-left">
          <h2 className="text-4xl md:text-5xl font-serif font-extrabold text-stone-900 leading-tight">
            {data?.title || 'Tratamientos Exclusivos'}
          </h2>
          {data?.subtitle && (
            <p className="text-lg md:text-xl text-stone-500 mt-2 font-medium font-sans">
              {data.subtitle}
            </p>
          )}
        </div>

        {/* Contenedor Relativo para posicionar las flechas sobre el Slider */}
        <div className="relative w-full group/slider">

          {/* Flecha Izquierda Flotante */}
          <button
            onClick={() => scroll('left')}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full border border-stone-200/50 bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-800 hover:bg-stone-900 hover:text-white transition-all duration-300 shadow-md md:opacity-0 group-hover/slider:opacity-100"
          >
            <ArrowLeft size={20} />
          </button>

          {/* Flecha Derecha Flotante */}
          <button
            onClick={() => scroll('right')}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 w-12 h-12 rounded-full border border-stone-200/50 bg-white/80 backdrop-blur-md flex items-center justify-center text-stone-800 hover:bg-stone-900 hover:text-white transition-all duration-300 shadow-md md:opacity-0 group-hover/slider:opacity-100"
          >
            <ArrowRight size={20} />
          </button>

          {/* Slider de Tarjetas Nativo */}
          <div
            ref={scrollRef}
            className="w-full overflow-x-auto snap-x snap-mandatory hide-scroll flex gap-6 pb-6"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {activeServices.map((svc) => (
              <ServiceCard
                key={svc.id}
                service={svc}
                className="snap-center snap-stop-always"
              />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}