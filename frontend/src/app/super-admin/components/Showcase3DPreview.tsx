"use client";

import { Monitor, ChevronRight } from 'lucide-react';

export interface MappedPreviewSector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl: string;
  imageUrl?: string;
  placeholderGradient: string;
}

interface Showcase3DPreviewProps {
  heroTitle: string;
  heroSubtitle: string;
  previewSectors: MappedPreviewSector[];
  previewIndex: number;
  previewAnimating: boolean;
  handlePreviewNavigate: (newIndex: number) => void;
}

export default function Showcase3DPreview({
  heroTitle,
  heroSubtitle,
  previewSectors,
  previewIndex,
  previewAnimating,
  handlePreviewNavigate
}: Showcase3DPreviewProps) {
  return (
    <div className="flex-1 h-full bg-stone-50 flex flex-col relative overflow-hidden">
      
      {/* Device Wrapper Header (Top bar mockup) */}
      <div className="h-12 bg-stone-100 border-b border-stone-200/60 px-6 flex items-center justify-between shrink-0 select-none font-sans">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
          </div>
          <span className="text-[10px] text-stone-400 font-mono border-l border-stone-200 pl-3 ml-2">
            probookia.com/marketing/showcase
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[9px] text-stone-400 font-bold bg-white px-3 py-1 rounded-lg border border-stone-200/50 shadow-sm">
            <Monitor className="w-3.5 h-3.5 text-stone-400" />
            <span>Vista Previa: Pantalla Completa B2B</span>
          </div>
        </div>
      </div>

      {/* Live Mock Page Body */}
      <div className="flex-1 overflow-y-auto bg-white p-10 relative flex flex-col justify-between min-h-0">
        
        {/* Mock Landing Header */}
        <div className="flex justify-between items-center border-b border-stone-100 pb-4 mb-6 select-none shrink-0">
          <span className="text-xs font-serif font-bold tracking-widest text-stone-900">PROBOOKIA</span>
          <div className="flex justify-between items-center gap-6 text-[9px] text-stone-400 font-bold font-sans">
            <span>Producto</span>
            <span>Precios</span>
            <span>Documentación</span>
            <span className="bg-stone-950 text-white px-3 py-1.2 rounded-lg text-[8px] font-black uppercase tracking-wider">Entorno Seguro</span>
          </div>
        </div>

        {/* Live Hero Header */}
        <div className="text-center max-w-2xl mx-auto select-none mt-2 shrink-0">
          <span className="text-blue-600 text-[9px] font-black uppercase tracking-[0.25em] block mb-3 font-sans">
            Especialidades
          </span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-stone-950 leading-snug mb-4 transition-all duration-300">
            {heroTitle || 'Sectores de Alta Gama'}
          </h2>
          <p className="text-xs md:text-sm text-stone-500 font-medium leading-relaxed max-w-lg mx-auto transition-all duration-300 font-sans">
            {heroSubtitle || 'Interactúa con el carrusel en anillo 3D tridimensional de alta precisión.'}
          </p>
        </div>

        {/* 3D CYLINDRICAL STAGE */}
        <div className="relative flex-1 min-h-[480px] w-full flex items-center justify-center [perspective:1200px] [perspective-origin:50%_38%] select-none overflow-hidden my-2 shrink-0">
          
          {/* Spinning Ring */}
          <div 
            className="relative w-[260px] h-[450px] transition-transform duration-1000 ease-out [transform-style:preserve-3d]"
            style={{ transform: `rotateY(${previewIndex * -90}deg)` }}
          >
            {/* Card 0 */}
            <div 
              onClick={() => handlePreviewNavigate(0)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(0deg)_translateZ(350px)] ${
                previewIndex === 0 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-20' : 'scale-95 opacity-25 hover:opacity-50 filter brightness-90 z-10'
              }`}
            >
              <div className="w-full h-full bg-white rounded-3xl border border-stone-200/50 p-2.5 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-50 relative border border-stone-100">
                  <video src={previewSectors[0]?.videoUrl} poster={previewSectors[0]?.imageUrl} className="w-full h-full object-cover" autoPlay={previewIndex === 0} loop muted playsInline />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase font-sans ${
                      previewIndex === 0 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                    }`}>
                      {previewSectors[0]?.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 1 */}
            <div 
              onClick={() => handlePreviewNavigate(1)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(90deg)_translateZ(350px)] ${
                previewIndex === 1 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-20' : 'scale-95 opacity-25 hover:opacity-50 filter brightness-90 z-10'
              }`}
            >
              <div className="w-full h-full bg-white rounded-3xl border border-stone-200/50 p-2.5 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-50 relative border border-stone-100">
                  <video src={previewSectors[1]?.videoUrl} poster={previewSectors[1]?.imageUrl} className="w-full h-full object-cover" autoPlay={previewIndex === 1} loop muted playsInline />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase font-sans ${
                      previewIndex === 1 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                    }`}>
                      {previewSectors[1]?.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div 
              onClick={() => handlePreviewNavigate(2)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(180deg)_translateZ(350px)] ${
                previewIndex === 2 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-20' : 'scale-95 opacity-25 hover:opacity-50 filter brightness-90 z-10'
              }`}
            >
              <div className="w-full h-full bg-white rounded-3xl border border-stone-200/50 p-2.5 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-50 relative border border-stone-100">
                  <video src={previewSectors[2]?.videoUrl} poster={previewSectors[2]?.imageUrl} className="w-full h-full object-cover" autoPlay={previewIndex === 2} loop muted playsInline />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase font-sans ${
                      previewIndex === 2 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                    }`}>
                      {previewSectors[2]?.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div 
              onClick={() => handlePreviewNavigate(3)}
              className={`absolute inset-0 cursor-pointer transition-all duration-700 ease-out [backface-visibility:hidden] [transform:rotateY(270deg)_translateZ(350px)] ${
                previewIndex === 3 ? 'scale-105 opacity-100 drop-shadow-[0_20px_40px_rgba(0,0,0,0.08)] z-20' : 'scale-95 opacity-25 hover:opacity-50 filter brightness-90 z-10'
              }`}
            >
              <div className="w-full h-full bg-white rounded-3xl border border-stone-200/50 p-2.5 shadow-md relative overflow-hidden">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-stone-50 relative border border-stone-100">
                  <video src={previewSectors[3]?.videoUrl} poster={previewSectors[3]?.imageUrl} className="w-full h-full object-cover" autoPlay={previewIndex === 3} loop muted playsInline />
                  <div className="absolute top-4 left-4 z-10">
                    <span className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase font-sans ${
                      previewIndex === 3 ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white/95 border-stone-200/60 text-stone-500'
                    }`}>
                      {previewSectors[3]?.badge}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lateral arrows */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-12 pointer-events-none z-20">
            <button
              onClick={() => {
                const prevIndex = (previewIndex - 1 + 4) % 4;
                handlePreviewNavigate(prevIndex);
              }}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 shadow-lg active:scale-95 pointer-events-auto transition-transform"
            >
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button
              onClick={() => {
                const nextIndex = (previewIndex + 1) % 4;
                handlePreviewNavigate(nextIndex);
              }}
              className="w-10 h-10 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 shadow-lg active:scale-95 pointer-events-auto transition-transform"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Sliding Sheet Details Panel */}
          {previewSectors[previewIndex] && (
            <div className={`absolute bottom-4 max-w-sm w-full bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl border border-stone-100/80 transition-all duration-500 transform z-30 select-none text-center ${
              previewAnimating ? 'translate-y-6 opacity-0' : 'translate-y-0 opacity-100'
            }`}>
              <span className="text-[8.5px] uppercase font-black tracking-[0.15em] text-blue-600 block mb-1 font-sans">
                {previewSectors[previewIndex]?.badge}
              </span>
              <h4 className="font-serif text-base text-stone-900 font-bold mb-1.5 leading-tight">
                {previewSectors[previewIndex]?.title}
              </h4>
              <p className="text-stone-500 text-[10px] md:text-xs leading-relaxed mb-4 font-sans">
                {previewSectors[previewIndex]?.copy}
              </p>
              <button className="w-full bg-stone-950 text-white text-[9px] py-2 px-4 rounded-xl font-bold hover:bg-stone-900 transition-colors font-sans uppercase tracking-wider">
                Configurar Entorno
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
