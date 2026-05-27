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
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
  fontFamily?: string | null;
  fontWeightHeadings?: string | null;
  logoSvg?: string | null;
}

export default function Showcase3DPreview({
  heroTitle,
  heroSubtitle,
  previewSectors,
  previewIndex,
  previewAnimating,
  handlePreviewNavigate,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  fontFamily,
  fontWeightHeadings,
  logoSvg
}: Showcase3DPreviewProps) {
  const weightMap: Record<string, string> = {
    'light': '300',
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700'
  };
  const activeWeight = weightMap[fontWeightHeadings || 'semibold'] || '600';

  return (
    <div 
      style={{ 
        '--primary-accent': primaryColor || '#3b82f6',
        '--secondary-accent': secondaryColor || '#1c1917',
        '--tertiary-accent': tertiaryColor || '#d4af37' 
      } as React.CSSProperties}
      className="flex-1 h-full bg-stone-50 flex flex-col relative overflow-hidden"
    >
      {/* Inyección dinámica de Google Fonts para la previsualización del cliente */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&family=Outfit:wght@100..900&family=Fredoka:wght@300..700&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Montserrat:wght@100..900&family=Cinzel:wght@400..900&family=Roboto:wght@100..900&display=swap');
        
        .preview-serif {
          font-family: ${
            fontFamily === 'playfair_inter' ? "'Playfair Display', serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
            fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "'Cormorant Garamond', serif" :
            fontFamily === 'cinzel_roboto' ? "'Cinzel', serif" :
            "'Inter', sans-serif"
          } !important;
          font-weight: ${activeWeight} !important;
        }
        
        .preview-sans {
          font-family: ${
            fontFamily === 'playfair_inter' ? "'Inter', sans-serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
            fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "'Montserrat', sans-serif" :
            fontFamily === 'cinzel_roboto' ? "'Roboto', sans-serif" :
            "'Inter', sans-serif"
          } !important;
        }
      ` }} />
      
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
          {logoSvg ? (
            <div 
              className="h-8 flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto"
              dangerouslySetInnerHTML={{ __html: logoSvg }}
            />
          ) : (
            <span className="text-xs font-serif font-bold tracking-widest text-stone-900 preview-serif">
              PROBOOKIA <span style={{ color: tertiaryColor || '#d4af37' }} className="preview-sans text-[8px] font-black tracking-[0.2em] uppercase ml-0.5">SaaS</span>
            </span>
          )}
          
          <div className="flex justify-between items-center gap-6 text-[9px] text-stone-400 font-bold preview-sans">
            <span>Producto</span>
            <span>Precios</span>
            <span>Documentación</span>
            <span className="bg-stone-950 text-white px-3 py-1.2 rounded-lg text-[8px] font-black uppercase tracking-wider">Entorno Seguro</span>
          </div>
        </div>

        {/* Live Hero Header */}
        <div className="text-center max-w-2xl mx-auto select-none mt-2 shrink-0">
          <span style={{ color: tertiaryColor || '#d4af37' }} className="text-[9px] font-black uppercase tracking-[0.25em] block mb-3 preview-sans">
            Especialidades
          </span>
          <h2 className="text-2xl md:text-4xl font-serif font-bold tracking-tight text-stone-950 leading-snug mb-4 transition-all duration-300 preview-serif">
            {heroTitle || 'Sectores de Alta Gama'}
          </h2>
          <p className="text-xs md:text-sm text-stone-500 font-medium leading-relaxed max-w-lg mx-auto transition-all duration-300 preview-sans">
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
                    <span 
                      style={previewIndex === 0 ? { backgroundColor: primaryColor || '#3b82f6', borderColor: primaryColor || '#3b82f6', color: '#ffffff' } : {}}
                      className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase preview-sans ${
                        previewIndex === 0 ? '' : 'bg-white/95 border-stone-200/60 text-stone-500'
                      }`}
                    >
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
                    <span 
                      style={previewIndex === 1 ? { backgroundColor: primaryColor || '#3b82f6', borderColor: primaryColor || '#3b82f6', color: '#ffffff' } : {}}
                      className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase preview-sans ${
                        previewIndex === 1 ? '' : 'bg-white/95 border-stone-200/60 text-stone-500'
                      }`}
                    >
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
                    <span 
                      style={previewIndex === 2 ? { backgroundColor: primaryColor || '#3b82f6', borderColor: primaryColor || '#3b82f6', color: '#ffffff' } : {}}
                      className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase preview-sans ${
                        previewIndex === 2 ? '' : 'bg-white/95 border-stone-200/60 text-stone-500'
                      }`}
                    >
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
                    <span 
                      style={previewIndex === 3 ? { backgroundColor: primaryColor || '#3b82f6', borderColor: primaryColor || '#3b82f6', color: '#ffffff' } : {}}
                      className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase preview-sans ${
                        previewIndex === 3 ? '' : 'bg-white/95 border-stone-200/60 text-stone-500'
                      }`}
                    >
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
              <span style={{ color: tertiaryColor || '#d4af37' }} className="text-[8.5px] uppercase font-black tracking-[0.15em] block mb-1 preview-sans">
                {previewSectors[previewIndex]?.badge}
              </span>
              <h4 className="font-serif text-base text-stone-900 font-bold mb-1.5 leading-tight preview-serif">
                {previewSectors[previewIndex]?.title}
              </h4>
              <p className="text-stone-500 text-[10px] md:text-xs leading-relaxed mb-4 preview-sans">
                {previewSectors[previewIndex]?.copy}
              </p>
              <button 
                style={{ backgroundColor: primaryColor || '#3b82f6' }}
                className="w-full text-white text-[9px] py-2 px-4 rounded-xl font-bold hover:opacity-90 transition-opacity preview-sans uppercase tracking-wider shadow-sm"
              >
                Configurar Entorno
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
