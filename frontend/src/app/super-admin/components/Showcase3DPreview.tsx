"use client";

import { useRef, useEffect, useState } from 'react';
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
  heroImage1?: string | null;
  heroImage2?: string | null;
  heroImage3?: string | null;
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

function ShowcaseVideo({ src, poster, isActive }: { src: string; poster?: string; isActive: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(err => console.log("Auto-play blocked or interrupted:", err));
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      className="w-full h-full object-cover"
      loop
      muted
      playsInline
    />
  );
}

export default function Showcase3DPreview({
  heroTitle,
  heroSubtitle,
  heroImage1,
  heroImage2,
  heroImage3,
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

  const N_prev = previewSectors.length;
  const realIndexPrev = N_prev > 0 ? ((previewIndex % N_prev) + N_prev) % N_prev : 0;

  // Manejo de la galería rotativa del hero
  const heroImages = [heroImage1, heroImage2, heroImage3].filter(Boolean) as string[];
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const handlePreviewCardClick = (targetIndex: number) => {
    if (N_prev === 0) return;
    const currentReal = ((previewIndex % N_prev) + N_prev) % N_prev;
    let diff = targetIndex - currentReal;
    if (diff > N_prev / 2) {
      diff -= N_prev;
    } else if (diff < -N_prev / 2) {
      diff += N_prev;
    }
    handlePreviewNavigate(previewIndex + diff);
  };

  return (
    <div
      style={{
        '--primary-accent': primaryColor || '#3b82f6',
        '--secondary-accent': secondaryColor || '#1c1917',
        '--tertiary-accent': tertiaryColor || '#d4af37'
      } as React.CSSProperties}
      className="flex-1 h-full bg-stone-50 flex flex-col relative overflow-hidden animate-fade-in"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&family=Outfit:wght@100..900&family=Fredoka:wght@300..700&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Montserrat:wght@100..900&family=Cinzel:wght@400..900&family=Roboto:wght@100..900&display=swap');
        
        .preview-serif {
          font-family: ${fontFamily === 'playfair_inter' ? "'Playfair Display', serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
              fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
                fontFamily === 'cormorant_montserrat' ? "'Cormorant Garamond', serif" :
                  fontFamily === 'cinzel_roboto' ? "'Cinzel', serif" :
                    "'Inter', sans-serif"
          } !important;
          font-weight: ${activeWeight} !important;
        }
        .preview-sans {
          font-family: ${fontFamily === 'playfair_inter' ? "'Inter', sans-serif" :
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

      {/* Live Mock Page Body - Optimización de Distribución Vertical */}
      <div className="flex-1 overflow-y-auto bg-white p-6 relative flex flex-col justify-start min-h-0">

        {/* Mock Landing Header */}
        <div className="flex justify-between items-center border-b border-stone-100 pb-2 mb-3 select-none shrink-0">
          {logoSvg ? (
            <div
              className="h-6 flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto"
              dangerouslySetInnerHTML={{ __html: logoSvg }}
            />
          ) : (
            <span className="text-xs font-serif font-bold tracking-widest text-stone-900 preview-serif">
              PROBOOKIA <span style={{ color: tertiaryColor || '#d4af37' }} className="preview-sans text-[8px] font-black tracking-[0.2em] uppercase ml-0.5">SaaS</span>
            </span>
          )}

          <div className="flex justify-between items-center gap-4 text-[9px] text-stone-400 font-bold preview-sans">
            <span>Producto</span>
            <span>Precios</span>
            <span>Documentación</span>
            <span className="bg-stone-950 text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider">Entorno Seguro</span>
          </div>
        </div>

        {/* Mock Landing Hero Wrapper with Background slideshow & Light Overlay */}
        <div className="relative w-full min-h-[190px] rounded-2xl overflow-hidden border border-stone-200/50 shadow-sm flex flex-col justify-center items-center p-6 text-center select-none shrink-0 mb-4 bg-stone-50">
          
          {/* Background Rotating Images inside mock Hero */}
          {heroImages.length > 0 && (
            <div className="absolute inset-0 w-full h-full z-0 select-none animate-fade-in">
              {heroImages.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Hero Mockup ${idx}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    idx === currentHeroImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Premium light overlay */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10"></div>

          {/* Content layer */}
          <div className="relative z-20 max-w-lg mx-auto flex flex-col items-center">
            <span style={{ color: tertiaryColor || '#d4af37' }} className="text-[8px] font-black uppercase tracking-[0.25em] block mb-1 preview-sans">
              Especialidades
            </span>
            <h2 className="text-base md:text-lg font-serif font-bold tracking-tight text-stone-950 leading-snug mb-1 transition-all duration-300 preview-serif">
              {heroTitle || 'Sectores de Alta Gama'}
            </h2>
            <p className="text-[9px] text-stone-600 font-semibold leading-relaxed max-w-sm mx-auto transition-all duration-300 preview-sans">
              {heroSubtitle || 'Interactúa con el carrusel en anillo 3D tridimensional de alta precisión.'}
            </p>

            {/* Bottom dots */}
            {heroImages.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-4">
                {heroImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentHeroImageIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                      idx === currentHeroImageIndex 
                        ? 'bg-stone-950 scale-125' 
                        : 'bg-stone-950/20 hover:bg-stone-950/40'
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CONTENEDOR VERTICAL QUE ALINEA EL CAROUSEL Y LA INFO AL CENTRO (my-auto, justify-center) */}
        <div className="relative flex-1 flex flex-col items-center justify-center gap-4 max-w-4xl w-full mx-auto my-auto">

          {/* 3D COVERFLOW INFINITE STAGE - Ajustado para tarjetas 9:16 */}
          <div className="relative w-full h-[390px] flex items-center justify-center [perspective:1000px] [transform-style:preserve-3d] select-none shrink-0">

            {/* Card Container wrapper - Formato 9:16 (w-200px, h-355px es 9:16) */}
            <div className="relative w-[200px] h-[355px] [transform-style:preserve-3d]">
              {previewSectors.map((sector, index) => {
                // Circular offset for infinite loop
                const realActive = ((previewIndex % N_prev) + N_prev) % N_prev;
                let offset = index - realActive;
                if (offset > N_prev / 2) {
                  offset -= N_prev;
                } else if (offset < -N_prev / 2) {
                  offset += N_prev;
                }

                // Transform configurations based on offset (Central card scaled to 1.15)
                let transformStr = "";
                let zIndex = 0;
                let opacity = 1;
                let pointerEvents: "auto" | "none" = "auto";

                if (offset === 0) {
                  transformStr = "translateX(0) scale(1.15) rotateY(0deg)";
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
                  opacity = 0.4;
                } else if (offset === -2) {
                  transformStr = "translateX(-110%) scale(0.7) rotateY(25deg)";
                  zIndex = 10;
                  opacity = 0.4;
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
                    onClick={() => handlePreviewCardClick(index)}
                    style={{
                      transform: transformStr,
                      zIndex: zIndex,
                      opacity: opacity,
                      pointerEvents: pointerEvents,
                      transition: "all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)"
                    }}
                    className={`absolute inset-0 cursor-pointer [backface-visibility:hidden] select-none rounded-3xl border border-stone-200/50 shadow-md overflow-hidden bg-stone-50 ${isActive
                        ? 'drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)] border-stone-300/60'
                        : 'filter brightness-90 hover:brightness-100 hover:opacity-90'
                      }`}
                  >
                    <ShowcaseVideo
                      src={sector.videoUrl}
                      poster={sector.imageUrl}
                      isActive={isActive}
                    />
                    <div className="absolute top-4 left-4 z-10">
                      <span
                        style={isActive ? { backgroundColor: primaryColor || '#3b82f6', borderColor: primaryColor || '#3b82f6', color: '#ffffff' } : {}}
                        className={`border px-3 py-1 rounded-full text-[8px] font-black tracking-wider uppercase preview-sans ${isActive ? '' : 'bg-white/95 border-stone-200/60 text-stone-500'
                          }`}
                      >
                        {sector.badge}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lateral arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none z-20">
              <button
                onClick={() => handlePreviewNavigate(previewIndex - 1)}
                className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 shadow-md active:scale-95 pointer-events-auto transition-transform"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={() => handlePreviewNavigate(previewIndex + 1)}
                className="w-9 h-9 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 shadow-md active:scale-95 pointer-events-auto transition-transform"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* FICHA BLANCA EMERGENTE - Perfectamente centrada abajo con mt-6 */}
          {previewSectors[realIndexPrev] && (
            <div className={`mt-6 max-w-sm w-full bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-stone-100/80 transition-all duration-500 transform z-30 select-none text-center shrink-0 ${previewAnimating ? 'translate-y-4 opacity-0' : 'translate-y-0 opacity-100'
              }`}>
              <span style={{ color: tertiaryColor || '#d4af37' }} className="text-[8px] uppercase font-black tracking-[0.15em] block mb-1 preview-sans">
                {previewSectors[realIndexPrev]?.badge}
              </span>
              <h4 className="font-serif text-base text-stone-900 font-bold mb-1 leading-tight preview-serif">
                {previewSectors[realIndexPrev]?.title}
              </h4>
              <p className="text-stone-500 text-[10px] leading-relaxed mb-3 preview-sans">
                {previewSectors[realIndexPrev]?.copy}
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
