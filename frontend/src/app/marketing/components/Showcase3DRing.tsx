"use client";

import { ChevronRight } from 'lucide-react';

interface Sector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl: string;
  imageUrl?: string;
  placeholderGradient: string;
}

interface Showcase3DRingProps {
  sectorsToRender: Sector[];
  activeIndex: number;
  animating: boolean;
  handleNavigate: (newIndex: number) => void;
  onConfigureEntorno: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
}

export default function Showcase3DRing({
  sectorsToRender,
  activeIndex,
  animating,
  handleNavigate,
  onConfigureEntorno
}: Showcase3DRingProps) {
  const N = sectorsToRender.length;
  const realIndex = ((activeIndex % N) + N) % N;

  const handleCardClick = (targetIndex: number) => {
    const currentReal = ((activeIndex % N) + N) % N;
    let diff = targetIndex - currentReal;
    if (diff > N / 2) {
      diff -= N;
    } else if (diff < -N / 2) {
      diff += N;
    }
    handleNavigate(activeIndex + diff);
  };

  return (
    <section id="sectors" className="py-24 bg-stone-50/50 border-y border-stone-100 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 relative flex flex-col items-center">
        
        {/* Cabecera Editorial */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-blue-600 text-[10px] font-black uppercase tracking-[0.25em] block mb-3">Especialidades</span>
          <h2 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-stone-950">
            Sectores de Alta Gama
          </h2>
          <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
            Navega por las especialidades de ProBookia con nuestro carrusel 3D Coverflow infinito.
          </p>
        </div>

        {/* El contenedor padre define la profundidad del espacio */}
        <div className="relative w-full h-[650px] overflow-hidden flex flex-col items-center justify-center [perspective:1000px] [transform-style:preserve-3d]">
          
          {/* Contenedor central de tarjetas */}
          <div className="relative w-[280px] h-[480px] [transform-style:preserve-3d] select-none">
            {sectorsToRender.map((sector, index) => {
              // Cálculo de distancia circular con offset infinito
              const realActive = ((activeIndex % N) + N) % N;
              let offset = index - realActive;
              if (offset > N / 2) {
                offset -= N;
              } else if (offset < -N / 2) {
                offset += N;
              }

              // Transformaciones Coverflow dinámicas según el offset
              let transformStr = "";
              let zIndex = 0;
              let opacity = 1;
              let pointerEvents: "auto" | "none" = "auto";

              if (offset === 0) {
                transformStr = "translateX(0) scale(1) rotateY(0deg)";
                zIndex = 30;
                opacity = 1;
              } else if (offset === 1) {
                transformStr = "translateX(60%) scale(0.85) rotateY(-15deg)";
                zIndex = 20;
                opacity = 0.8;
              } else if (offset === -1) {
                transformStr = "translateX(-60%) scale(0.85) rotateY(15deg)";
                zIndex = 20;
                opacity = 0.8;
              } else if (offset === 2) {
                transformStr = "translateX(110%) scale(0.7) rotateY(-25deg)";
                zIndex = 10;
                opacity = 0.5;
              } else if (offset === -2) {
                transformStr = "translateX(-110%) scale(0.7) rotateY(25deg)";
                zIndex = 10;
                opacity = 0.5;
              } else {
                transformStr = `translateX(${offset * 100}%) scale(0.5) rotateY(0deg)`;
                zIndex = 0;
                opacity = 0;
                pointerEvents = "none";
              }

              const isActive = offset === 0;

              return (
                <div
                  key={sector.id}
                  onClick={() => handleCardClick(index)}
                  style={{
                    transform: transformStr,
                    zIndex: zIndex,
                    opacity: opacity,
                    pointerEvents: pointerEvents,
                    transition: "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)"
                  }}
                  className={`absolute inset-0 cursor-pointer [backface-visibility:hidden] select-none ${
                    isActive 
                      ? 'drop-shadow-[0_25px_50px_rgba(28,25,23,0.15)] scale-105' 
                      : 'filter brightness-90 hover:brightness-100 hover:opacity-90'
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-2xl border border-stone-200/50 p-3 shadow-md relative overflow-hidden">
                    <div className="w-full h-full rounded-xl overflow-hidden bg-stone-50 relative border border-stone-100">
                      <video 
                        src={sector.videoUrl} 
                        poster={sector.imageUrl} 
                        className="w-full h-full object-cover" 
                        autoPlay={isActive} 
                        loop 
                        muted 
                        playsInline 
                      />
                      <div className="absolute top-4 left-4 z-10">
                        <span className={`border px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider shadow-sm uppercase transition-colors duration-500 ${
                          isActive ? 'bg-stone-900 border-stone-900 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                        }`}>
                          {sector.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Controles de Navegación Lateral (Flechitas Flotantes Premium) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-12 pointer-events-none z-20">
            <button
              onClick={() => handleNavigate(activeIndex - 1)}
              className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/80 hover:bg-stone-50 flex items-center justify-center text-stone-700 hover:text-stone-950 transition-all shadow-md active:scale-95 pointer-events-auto"
              title="Sector Anterior"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button
              onClick={() => handleNavigate(activeIndex + 1)}
              className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/80 hover:bg-stone-50 flex items-center justify-center text-stone-700 hover:text-stone-950 transition-all shadow-md active:scale-95 pointer-events-auto"
              title="Siguiente Sector"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* LA FICHA BLANCA EMERGENTE (Fuera de las tarjetas, abajo en el centro) */}
          {sectorsToRender[realIndex] && (
            <div className={`absolute bottom-6 max-w-md w-full bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-stone-100 transition-all duration-500 transform z-30 ${
              animating ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
            }`}>
              <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">
                {sectorsToRender[realIndex]?.badge}
              </span>
              <h3 className="font-serif text-2xl text-stone-900 my-1">
                {sectorsToRender[realIndex]?.title}
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed mb-4">
                {sectorsToRender[realIndex]?.copy}
              </p>
              <button 
                onClick={() => onConfigureEntorno('pro')}
                className="w-full bg-stone-950 text-white text-xs py-2.5 rounded-xl font-medium hover:bg-stone-900 transition-colors"
              >
                Configurar Entorno
              </button>
            </div>
          )}
          
        </div>
      </div>
    </section>
  );
}
