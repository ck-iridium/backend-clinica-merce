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
  const rawItems = previewSectors.length > 0 ? previewSectors : [];
  const displayItems: MappedPreviewSector[] = [];
  if (rawItems.length > 0) {
    while (displayItems.length < 15) {
      displayItems.push(...rawItems);
    }
  }
  const totalCards = displayItems.length;

  const CARD_W = 125;
  const CARD_GAP = 14;
  const SLOT_W = CARD_W + CARD_GAP;
  const TOTAL_TRACK = totalCards * SLOT_W;

  const [previewScrollX, setPreviewScrollX] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const hasDragged = useRef(false);
  const autoResumeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (autoResumeTimerRef.current) {
      clearTimeout(autoResumeTimerRef.current);
      autoResumeTimerRef.current = null;
    }
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  // Auto-avance continuo en la preview (solo avanza si no está arrastrando ni pausado por selección)
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (selectedIdx === null && !isDragging) {
        setPreviewScrollX(prev => {
          const next = prev - (0.045 * delta);
          if (next <= -TOTAL_TRACK) return next + TOTAL_TRACK;
          return next;
        });
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [selectedIdx, isDragging, TOTAL_TRACK]);

  const centerPreviewCard = (index: number) => {
    clearTimers();
    setSelectedIdx(index);
    setPreviewScrollX(-index * SLOT_W);

    autoResumeTimerRef.current = setTimeout(() => {
      setSelectedIdx(null);
    }, 7000);
  };

  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    dragStartScroll.current = previewScrollX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > 5) {
      hasDragged.current = true;
      if (selectedIdx !== null) {
        clearTimers();
        setSelectedIdx(null);
      }
    }
    setPreviewScrollX(dragStartScroll.current + deltaX);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  // Manejo de la galería rotativa del hero
  const heroImages = [heroImage1, heroImage2, heroImage3].filter(Boolean) as string[];
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroImageIndex(prev => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

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
        .preview-serif {
          font-family: ${fontFamily === 'playfair_inter' ? "var(--font-playfair-base), 'Playfair Display', serif" :
            fontFamily === 'outfit' ? "var(--font-outfit), 'Outfit', sans-serif" :
              fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
                fontFamily === 'cormorant_montserrat' ? "var(--font-cormorant), 'Cormorant Garamond', serif" :
                  fontFamily === 'cinzel_roboto' ? "'Cinzel', serif" :
                    "var(--font-inter), 'Inter', sans-serif"
          } !important;
          font-weight: ${activeWeight} !important;
        }
        .preview-sans {
          font-family: ${fontFamily === 'playfair_inter' ? "var(--font-inter), 'Inter', sans-serif" :
            fontFamily === 'outfit' ? "var(--font-outfit), 'Outfit', sans-serif" :
              fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
                fontFamily === 'cormorant_montserrat' ? "var(--font-montserrat), 'Montserrat', sans-serif" :
                  fontFamily === 'cinzel_roboto' ? "'Roboto', sans-serif" :
                    "var(--font-inter), 'Inter', sans-serif"
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

        {/* CONTENEDOR DE CINTA PANORÁMICA CÓNCAVA (Estilo Bambu Lab 3D Track) */}
        <div className="relative flex-1 flex flex-col items-center justify-center gap-2 max-w-4xl w-full mx-auto my-auto">
          
          {/* Píldoras de selector rápido en la preview */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2 select-none">
            {rawItems.map((sec, idx) => {
              return (
                <button
                  key={`pill-${sec.id}-${idx}`}
                  onClick={() => centerPreviewCard(idx)}
                  className="px-2.5 py-1 rounded-full text-[9px] font-bold transition-all duration-300 border preview-sans bg-white/90 hover:bg-white text-stone-600 border-stone-200/70"
                >
                  {sec.badge || sec.title}
                </button>
              );
            })}
          </div>

          {/* ESCENARIO CÓNCAVO PANORÁMICO (3D Ribbon Preview) */}
          <div 
            className="relative w-full h-[250px] flex items-center justify-center select-none shrink-0 overflow-hidden cursor-grab active:cursor-grabbing"
            style={{ perspective: '1200px' }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
          >
            {/* Sombras difuminadas laterales en el mockup */}
            <div className="absolute left-0 inset-y-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-30 pointer-events-none" />
            <div className="absolute right-0 inset-y-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-30 pointer-events-none" />

            {/* Contenedor central 3D */}
            <div className="relative w-0 h-[220px] flex items-center justify-center [transform-style:preserve-3d]">
              {displayItems.map((sector, index) => {
                const basePos = (index * SLOT_W) + previewScrollX;
                const halfTrack = TOTAL_TRACK / 2;
                let relativeX = ((basePos + halfTrack) % TOTAL_TRACK);
                if (relativeX < 0) relativeX += TOTAL_TRACK;
                relativeX -= halfTrack;

                if (Math.abs(relativeX) > 420) return null;

                const normalizedDist = relativeX / 300;
                const rotateY = -Math.max(-28, Math.min(28, normalizedDist * 25));
                const translateZ = -Math.pow(Math.min(Math.abs(normalizedDist), 1.5), 1.3) * 70;
                
                const isSelected = selectedIdx === index;
                const baseScale = Math.max(0.85, 1.02 - Math.abs(normalizedDist) * 0.1);
                const scale = isSelected ? 1.18 : (selectedIdx !== null ? baseScale * 0.94 : baseScale);
                const extraZ = isSelected ? 40 : 0;

                return (
                  <div
                    key={`preview-card-${sector.id}-${index}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!hasDragged.current) {
                        centerPreviewCard(index);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      width: `${CARD_W}px`,
                      height: '210px',
                      left: 0,
                      top: 0,
                      transform: `translateX(${relativeX - CARD_W / 2}px) translateZ(${translateZ + extraZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      transformStyle: 'preserve-3d',
                      zIndex: isSelected ? 60 : Math.round(50 - Math.abs(normalizedDist) * 20),
                      transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease'
                    }}
                    className={`rounded-xl border overflow-hidden bg-stone-900 group shadow-md cursor-pointer ${
                      isSelected
                        ? 'border-[#d4af37] ring-2 ring-[#d4af37]/40 shadow-xl brightness-105'
                        : (selectedIdx !== null
                            ? 'border-white/10 filter brightness-75 opacity-75'
                            : 'border-white/20 hover:border-white/60 filter brightness-95 hover:brightness-100')
                    }`}
                  >
                    {/* Imagen Estática de Portada */}
                    {sector.imageUrl ? (
                      <img
                        src={sector.imageUrl}
                        alt={sector.title}
                        className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
                        loading="lazy"
                      />
                    ) : (
                      <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${sector.placeholderGradient}`} />
                    )}

                    {/* Vídeo en Loop si está activo */}
                    {sector.videoUrl && (
                      <ShowcaseVideo
                        src={sector.videoUrl}
                        poster={sector.imageUrl}
                        isActive={isSelected}
                      />
                    )}

                    {/* Velo degradado */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-black/20 to-transparent pointer-events-none" />

                    {/* Badge Superior */}
                    <div className="absolute top-2 left-2 right-2 z-20 flex items-center justify-between pointer-events-none">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-wider backdrop-blur-md preview-sans ${
                          isSelected ? 'bg-[#d4af37] text-stone-950 font-bold' : 'bg-black/50 text-white/90 border border-white/20'
                        }`}
                      >
                        {sector.badge || 'Sector'}
                      </span>
                    </div>

                    {/* Panel inferior integrado */}
                    <div className="absolute bottom-0 inset-x-0 p-2.5 z-20 text-white">
                      <h4 className="font-serif text-[11px] font-bold leading-tight drop-shadow-md text-white preview-serif truncate">
                        {sector.title}
                      </h4>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Lateral arrows */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-2 pointer-events-none z-30">
              <button
                onClick={() => {
                  if (selectedIdx !== null) {
                    clearTimers();
                    setSelectedIdx(null);
                  }
                  setPreviewScrollX(prev => prev + SLOT_W * 2);
                }}
                className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 shadow-sm active:scale-95 pointer-events-auto transition-transform"
                title="Girar Izquierda"
              >
                <ChevronRight className="w-3 h-3 rotate-180" />
              </button>
              <button
                onClick={() => {
                  if (selectedIdx !== null) {
                    clearTimers();
                    setSelectedIdx(null);
                  }
                  setPreviewScrollX(prev => prev - SLOT_W * 2);
                }}
                className="w-7 h-7 rounded-full bg-white/95 backdrop-blur-sm border border-stone-200/60 hover:bg-stone-50 flex items-center justify-center text-stone-700 shadow-sm active:scale-95 pointer-events-auto transition-transform"
                title="Girar Derecha"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

          </div>

          <div className="text-center">
            <span className="text-[8.5px] font-semibold text-stone-500 bg-stone-100/80 px-2.5 py-1 rounded-full border border-stone-200/60 preview-sans">
              {selectedIdx === null 
                ? "🔄 Giro continuo automático • Arrastra para mover o pulsa una tarjeta"
                : "⏸️ Ficha seleccionada • Reanudando giro en breve"
              }
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
