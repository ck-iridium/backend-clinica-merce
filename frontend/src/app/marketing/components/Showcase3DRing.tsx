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
            Interactúa con el carrusel en anillo 3D tridimensional de alta precisión.
          </p>
        </div>

        {/* El contenedor padre define la profundidad del espacio */}
        <div className="relative w-full h-[650px] overflow-hidden flex flex-col items-center justify-center [perspective:1200px]">
          
          {/* EL ANILLO: Este es el contenedor que gira según el sector activo */}
          <div 
            className="relative w-[280px] h-[500px] transition-transform duration-1000 ease-out [transform-style:preserve-3d]"
            style={{ transform: `rotateY(${activeIndex * -90}deg)` }}
          >
            {/* CARD 0: Clínicas (0 grados) */}
            <div 
              onClick={() => handleNavigate(0)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(0deg)_translateZ(380px)] ${
                activeIndex === 0 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(37,99,235,0.08)] z-20' : 'scale-95 opacity-40 hover:opacity-70 filter brightness-90 z-10'
              }`}
            >
              <div className="w-full h-full bg-white rounded-2xl border border-stone-200/50 p-3 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-xl overflow-hidden bg-stone-50 relative border border-stone-100">
                  <video 
                    src={sectorsToRender[0]?.videoUrl} 
                    poster={sectorsToRender[0]?.imageUrl} 
                    className="w-full h-full object-cover" 
                    autoPlay={activeIndex === 0} 
                    loop 
                    muted 
                    playsInline 
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`border px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider shadow-sm uppercase transition-colors duration-500 ${
                      activeIndex === 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                    }`}>
                      {sectorsToRender[0]?.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CARD 1: Barberías (90 grados) */}
            <div 
              onClick={() => handleNavigate(1)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(90deg)_translateZ(380px)] ${
                activeIndex === 1 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(37,99,235,0.08)] z-20' : 'scale-95 opacity-40 hover:opacity-70 filter brightness-90 z-10'
              }`}
            >
              <div className="w-full h-full bg-white rounded-2xl border border-stone-200/50 p-3 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-xl overflow-hidden bg-stone-50 relative border border-stone-100">
                  <video 
                    src={sectorsToRender[1]?.videoUrl} 
                    poster={sectorsToRender[1]?.imageUrl} 
                    className="w-full h-full object-cover" 
                    autoPlay={activeIndex === 1} 
                    loop 
                    muted 
                    playsInline 
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`border px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider shadow-sm uppercase transition-colors duration-500 ${
                      activeIndex === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                    }`}>
                      {sectorsToRender[1]?.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CARD 2: Dentistas (180 grados) */}
            <div 
              onClick={() => handleNavigate(2)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(380px)] ${
                activeIndex === 2 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(37,99,235,0.08)] z-20' : 'scale-95 opacity-40 hover:opacity-70 filter brightness-90 z-10'
              }`}
            >
              <div className="w-full h-full bg-white rounded-2xl border border-stone-200/50 p-3 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-xl overflow-hidden bg-stone-50 relative border border-stone-100">
                  <video 
                    src={sectorsToRender[2]?.videoUrl} 
                    poster={sectorsToRender[2]?.imageUrl} 
                    className="w-full h-full object-cover" 
                    autoPlay={activeIndex === 2} 
                    loop 
                    muted 
                    playsInline 
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`border px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider shadow-sm uppercase transition-colors duration-500 ${
                      activeIndex === 2 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                    }`}>
                      {sectorsToRender[2]?.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CARD 3: Salones (270 grados) */}
            <div 
              onClick={() => handleNavigate(3)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(270deg)_translateZ(380px)] ${
                activeIndex === 3 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(37,99,235,0.08)] z-20' : 'scale-95 opacity-40 hover:opacity-70 filter brightness-90 z-10'
              }`}
            >
              <div className="w-full h-full bg-white rounded-2xl border border-stone-200/50 p-3 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-xl overflow-hidden bg-stone-50 relative border border-stone-100">
                  <video 
                    src={sectorsToRender[3]?.videoUrl} 
                    poster={sectorsToRender[3]?.imageUrl} 
                    className="w-full h-full object-cover" 
                    autoPlay={activeIndex === 3} 
                    loop 
                    muted 
                    playsInline 
                  />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`border px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider shadow-sm uppercase transition-colors duration-500 ${
                      activeIndex === 3 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                    }`}>
                      {sectorsToRender[3]?.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controles de Navegación Lateral (Flechitas Flotantes Premium) */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-12 pointer-events-none z-20">
            <button
              onClick={() => {
                const prevIndex = (activeIndex - 1 + 4) % 4;
                handleNavigate(prevIndex);
              }}
              className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/80 hover:bg-stone-50 flex items-center justify-center text-stone-700 hover:text-stone-950 transition-all shadow-md active:scale-95 pointer-events-auto"
              title="Sector Anterior"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button
              onClick={() => {
                const nextIndex = (activeIndex + 1) % 4;
                handleNavigate(nextIndex);
              }}
              className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/80 hover:bg-stone-50 flex items-center justify-center text-stone-700 hover:text-stone-950 transition-all shadow-md active:scale-95 pointer-events-auto"
              title="Siguiente Sector"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* LA FICHA BLANCA EMERGENTE (Fuera del anillo, abajo en el centro) */}
          {sectorsToRender[activeIndex] && (
            <div className={`absolute bottom-6 max-w-md w-full bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-stone-100 transition-all duration-500 transform z-30 ${
              animating ? 'translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
            }`}>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-600">
                {sectorsToRender[activeIndex]?.badge}
              </span>
              <h3 className="font-serif text-2xl text-stone-900 my-1">
                {sectorsToRender[activeIndex]?.title}
              </h3>
              <p className="text-stone-600 text-xs leading-relaxed mb-4">
                {sectorsToRender[activeIndex]?.copy}
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
