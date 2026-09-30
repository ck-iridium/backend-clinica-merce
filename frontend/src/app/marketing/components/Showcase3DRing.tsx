"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Sparkles, ArrowRight, Play, Pause, X, ChevronRight } from 'lucide-react';

export interface Sector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl?: string;
  video_url?: string;
  imageUrl?: string;
  image_url?: string;
  placeholderGradient?: string;
}

export interface Showcase3DRingProps {
  sectorsToRender: Sector[];
  activeIndex?: number;
  animating?: boolean;
  handleNavigate?: (newIndex: number) => void;
  onConfigureEntorno: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
  isPreview?: boolean;
}

const DEFAULT_SECTOR_IMAGES: Record<string, string> = {
  clinicas: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
  barberias: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
  dentistas: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
  peluquerias: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  tattoos: 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80',
};

const DEFAULT_SECTOR_VIDEOS: Record<string, string> = {
  clinicas: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patients-face-with-magnifier-40545-large.mp4',
  barberias: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-man-with-a-razor-41223-large.mp4',
  dentistas: 'https://assets.mixkit.co/videos/preview/mixkit-dentist-adjusting-a-surgical-light-in-clinic-40549-large.mp4',
  peluquerias: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
  tattoos: 'https://assets.mixkit.co/videos/preview/mixkit-tattoo-artist-working-on-a-design-41224-large.mp4',
};

function resolveSectorImage(s: Sector, idx: number): string {
  const customImg = s.imageUrl || s.image_url;
  if (customImg && typeof customImg === 'string' && customImg.trim() !== '') {
    return customImg;
  }
  const text = `${s.id || ''} ${s.title || ''} ${s.badge || ''}`.toLowerCase();
  if (text.includes('barber') || idx % 5 === 1) return DEFAULT_SECTOR_IMAGES.barberias;
  if (text.includes('dent') || text.includes('odont') || idx % 5 === 2) return DEFAULT_SECTOR_IMAGES.dentistas;
  if (text.includes('peluquer') || text.includes('salon') || idx % 5 === 3) return DEFAULT_SECTOR_IMAGES.peluquerias;
  if (text.includes('tattoo') || text.includes('tatuad') || idx % 5 === 4) return DEFAULT_SECTOR_IMAGES.tattoos;
  return DEFAULT_SECTOR_IMAGES.clinicas;
}

function resolveSectorVideo(s: Sector, idx: number): string {
  const customVid = s.videoUrl || s.video_url;
  if (customVid && typeof customVid === 'string' && customVid.trim() !== '') {
    return customVid;
  }
  const text = `${s.id || ''} ${s.title || ''} ${s.badge || ''}`.toLowerCase();
  if (text.includes('barber') || idx % 5 === 1) return DEFAULT_SECTOR_VIDEOS.barberias;
  if (text.includes('dent') || text.includes('odont') || idx % 5 === 2) return DEFAULT_SECTOR_VIDEOS.dentistas;
  if (text.includes('peluquer') || text.includes('salon') || idx % 5 === 3) return DEFAULT_SECTOR_VIDEOS.peluquerias;
  if (text.includes('tattoo') || text.includes('tatuad') || idx % 5 === 4) return DEFAULT_SECTOR_VIDEOS.tattoos;
  return DEFAULT_SECTOR_VIDEOS.clinicas;
}

function VideoPlayer({
  src,
  poster,
  isActive
}: {
  src: string;
  poster?: string;
  isActive: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Auto-play prevenido o esperando interacción:", err);
        });
      }
    } else {
      video.pause();
    }
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      preload={isActive ? "auto" : "none"}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-out ${
        isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'
      }`}
      loop
      muted
      playsInline
    />
  );
}

export default function Showcase3DRing({
  sectorsToRender,
  onConfigureEntorno,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  isPreview = false
}: Showcase3DRingProps) {
  const rawItems = sectorsToRender.length > 0 ? sectorsToRender : [];

  // Mapeamos a 12 items para formar el cilindro exacto de Lightswind UI
  const displayItems = useMemo(() => {
    if (rawItems.length === 0) return [];
    const items: Sector[] = [];
    while (items.length < 12) {
      items.push(...rawItems);
    }
    return items.slice(0, 12);
  }, [rawItems]);

  const n = 12;

  // Ángulo de rotación del cilindro 3D
  const [rotationY, setRotationY] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [isCentering, setIsCentering] = useState(false);

  // Proporciones idénticas a Lightswind UI oficial y Bambu Lab
  const cardWidth = isPreview ? "12em" : "19.5em";
  const cardAspectRatio = "7/10";
  // Perspective oficial de Lightswind (35em) para la curvatura y profundidad cóncava exacta del anfiteatro
  const perspective = isPreview ? "28em" : "35em";

  // Rotación continua mediante requestAnimationFrame
  useEffect(() => {
    if (isPaused || selectedCardIndex !== null || isCentering) return;

    let animId: number;
    let lastTime = performance.now();
    const speedDegPerMs = 0.011; // Rotación lenta y cinematográfica

    const loop = (time: number) => {
      if (isDraggingRef.current) return;
      const delta = time - lastTime;
      lastTime = time;

      setRotationY(prev => (prev - speedDegPerMs * delta) % 360);
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, selectedCardIndex, isCentering]);

  // Arrastre con ratón o táctil
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startRotationRef = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (selectedCardIndex !== null) return;
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startRotationRef.current = rotationY;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    // Giro suave al arrastrar en la dirección física correspondiente
    setRotationY(startRotationRef.current - deltaX * 0.28);
  };

  const onPointerUp = () => {
    isDraggingRef.current = false;
  };

  // 🎯 DETECCIÓN DE CLIC ROBUSTA Y DIRECTA EN TARJETA (INMUNE AL ARRASTRE Y ANIMACIÓN)
  const cardPointerDownRef = useRef<{ x: number; y: number; time: number; idx: number } | null>(null);

  const onCardPointerDown = (e: React.PointerEvent, idx: number) => {
    cardPointerDownRef.current = {
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
      idx
    };
  };

  const onCardPointerUp = (e: React.PointerEvent, idx: number) => {
    if (!cardPointerDownRef.current || cardPointerDownRef.current.idx !== idx) return;
    const dx = Math.abs(e.clientX - cardPointerDownRef.current.x);
    const dy = Math.abs(e.clientY - cardPointerDownRef.current.y);
    const dt = Date.now() - cardPointerDownRef.current.time;
    cardPointerDownRef.current = null;

    // Si fue un clic o tap real (< 15px de desplazamiento y < 500ms)
    if (dx < 15 && dy < 15 && dt < 500) {
      openCardZoom(idx);
    }
  };

  // Abre la tarjeta centrada con zoom y reproduce el vídeo
  const openCardZoom = (index: number) => {
    setIsPaused(true);
    setSelectedCardIndex(index);
  };

  // Reanudar el giro y cerrar la tarjeta ampliada
  const handleCloseZoom = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedCardIndex(null);
    setIsCentering(false);
    setIsPaused(false);
  };

  const accentColor = tertiaryColor || '#E213FF';
  const brandPrimary = primaryColor || '#2244C9';

  // Sector activo para el visor centrado
  const activeSector = selectedCardIndex !== null && displayItems[selectedCardIndex]
    ? displayItems[selectedCardIndex]
    : null;

  return (
    <section className={`w-full bg-white relative overflow-hidden select-none flex flex-col justify-between ${
      isPreview ? 'py-3' : 'py-16 md:py-24'
    }`}>
      
      {/* ── 1. TROZO SUPERIOR: CABECERA, TÍTULO Y PÍLDORAS ── */}
      <div className="w-full max-w-4xl mx-auto px-6 text-center shrink-0 relative z-20">
        {!isPreview && (
          <div 
            style={{ borderColor: `${accentColor}50`, color: accentColor }}
            className="inline-flex items-center gap-2 bg-white/95 border px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-4 shadow-sm backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>PLANTILLAS Y ENTORNOS VERIFICADOS</span>
          </div>
        )}

        <h2 className={`${isPreview ? 'text-lg md:text-xl' : 'text-2xl md:text-5xl'} font-serif font-bold tracking-tight text-stone-950 leading-tight`}>
          Especializado en la excelencia de tu centro
        </h2>

        {!isPreview && (
          <p className="text-stone-500 text-xs md:text-sm mt-3 font-medium leading-relaxed max-w-2xl mx-auto">
            Arrastra para girar el anfiteatro 3D. Pulsa cualquier sector para centrarlo y ver su vídeo demostrativo.
          </p>
        )}

        {/* Píldoras de Acceso Rápido */}
        <div className={`flex flex-wrap items-center justify-center gap-2 ${isPreview ? 'mt-2 mb-1' : 'mt-6 mb-2'}`}>
          {rawItems.map((sec, idx) => {
            const isPillActive = selectedCardIndex !== null && (selectedCardIndex % rawItems.length) === idx;
            return (
              <button
                key={`pill-${sec.id}-${idx}`}
                onClick={() => openCardZoom(idx)}
                style={isPillActive ? { backgroundColor: brandPrimary, borderColor: brandPrimary, color: '#ffffff' } : undefined}
                className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-bold transition-all duration-300 border shadow-sm ${
                  isPillActive
                    ? 'scale-105 shadow-md ring-2 ring-white/50'
                    : 'bg-white/95 hover:bg-white text-stone-700 border-stone-200/80 hover:scale-105 active:scale-95'
                }`}
              >
                {sec.badge || sec.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. TROZO INFERIOR: ESCENARIO 3D CON ARCO ENVOLVENTE Y SPOTLIGHT EN EL CENTRO ── */}
      <div
        className={`grid w-full overflow-hidden place-items-center select-none cursor-grab active:cursor-grabbing relative touch-none py-6 ${
          isPreview ? 'h-[360px]' : 'h-[75vh] md:h-[680px] lg:h-[720px] min-h-[560px]'
        }`}
        style={{
          perspective: perspective,
          WebkitMask: "linear-gradient(90deg, transparent 0%, #000 18% 82%, transparent 100%)",
          mask: "linear-gradient(90deg, transparent 0%, #000 18% 82%, transparent 100%)",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* NÚCLEO CILÍNDRICO 3D LIGHTSWIND */}
        <div
          className="grid place-self-center pointer-events-auto will-change-transform"
          style={{
            transformStyle: "preserve-3d",
            transform: `rotateY(${rotationY}deg)`,
            transition: isDraggingRef.current 
              ? "none" 
              : isCentering 
                ? "transform 0.75s cubic-bezier(0.16, 1, 0.3, 1)" 
                : "none",
          }}
        >
          {displayItems.map((sector, i) => {
            const imgSrc = resolveSectorImage(sector, i);

            return (
              <div
                key={`slide-${sector.id}-${i}`}
                onPointerDown={(e) => onCardPointerDown(e, i)}
                onPointerUp={(e) => onCardPointerUp(e, i)}
                onClick={(e) => {
                  e.stopPropagation();
                  openCardZoom(i);
                }}
                className="col-start-1 row-start-1 object-cover rounded-[1.75em] overflow-hidden cursor-pointer relative bg-stone-900 border border-white/20 hover:border-white/60 select-none shadow-2xl transition-all duration-300 hover:scale-[1.03]"
                style={{
                  width: cardWidth,
                  aspectRatio: cardAspectRatio,
                  backfaceVisibility: "hidden",
                  WebkitBackfaceVisibility: "hidden",
                  transformStyle: "preserve-3d",
                  transform: `rotateY(calc(${i} * (1turn / ${n}))) translateZ(calc(-1 * (0.5 * ${cardWidth} + 0.5em) / tan(0.5 * (1turn / ${n}))))`,
                }}
              >
                {/* Imagen de portada */}
                <img
                  src={imgSrc}
                  alt={sector.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 hover:scale-105"
                />

                {/* Velo Degradado */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none z-10" />

                {/* Badge Superior */}
                <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md bg-black/60 text-white border border-white/20 shadow-sm"
                  >
                    {sector.badge || sector.title}
                  </span>
                </div>

                {/* Título en la base */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-20 text-white flex flex-col justify-end pointer-events-none">
                  <h3 className="font-serif text-sm md:text-base font-bold leading-tight drop-shadow-md text-white">
                    {sector.title}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── 🎯 VISOR SPOTLIGHT CENTRADO: Muestra en el medio con zoom y reproduce el vídeo ── */}
        {selectedCardIndex !== null && activeSector && (
          <div 
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={handleCloseZoom}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-[340px] md:max-w-[460px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85)] border-2 border-white/40 bg-stone-950 aspect-[7/10] flex flex-col justify-between animate-in zoom-in-95 duration-300 select-text"
              style={{
                boxShadow: `0 35px 100px -15px ${accentColor}60, 0 10px 40px rgba(0,0,0,0.9)`
              }}
            >
              {/* Imagen de fondo */}
              <img
                src={resolveSectorImage(activeSector, selectedCardIndex)}
                alt={activeSector.title}
                className="absolute inset-0 w-full h-full object-cover"
              />

              {/* Reproductor de vídeo HD con autoplay */}
              <VideoPlayer
                src={resolveSectorVideo(activeSector, selectedCardIndex)}
                poster={resolveSectorImage(activeSector, selectedCardIndex)}
                isActive={true}
              />

              {/* Velo degrade */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/40 z-10 pointer-events-none" />

              {/* Cabecera con Badge y Botón de Cerrar */}
              <div className="relative z-20 p-5 flex items-center justify-between">
                <span
                  style={{ backgroundColor: accentColor, color: '#1c1917' }}
                  className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md"
                >
                  {activeSector.badge || activeSector.title}
                </span>

                <button
                  onClick={handleCloseZoom}
                  className="w-9 h-9 rounded-full bg-black/75 hover:bg-black text-white flex items-center justify-center border border-white/30 shadow-lg transition-transform active:scale-90 hover:scale-105"
                  title="Cerrar y volver al carrusel"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Información y CTA al final */}
              <div className="relative z-20 p-6 text-white space-y-3">
                <div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight drop-shadow-md">
                    {activeSector.title}
                  </h3>
                  <p className="text-xs text-stone-200 mt-1.5 leading-relaxed font-medium line-clamp-3">
                    {activeSector.copy || 'Entorno SaaS exclusivo para centros selectos con expedientes LOPD y motor de reservas sin comisiones.'}
                  </p>
                </div>

                <button
                  onClick={() => onConfigureEntorno('pro')}
                  style={{ backgroundColor: brandPrimary }}
                  className="w-full text-white py-3 px-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 hover:opacity-95 border border-white/20 cursor-pointer"
                >
                  <span>Configurar este Entorno</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* ── 3. CONTROLES DE REPRODUCCIÓN INFERIORES ── */}
      <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 shrink-0 text-center relative z-20 ${
        isPreview ? 'mt-1' : 'mt-4'
      }`}>
        <span className="text-[11px] font-semibold text-stone-500 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-stone-200/70 shadow-sm flex items-center justify-center gap-2">
          {selectedCardIndex !== null ? (
            <>🎯 Vídeo en reproducción activa • Pulsa en la ✕ o fuera para volver al carrusel</>
          ) : !isPaused ? (
            <>🔄 Giro 3D continuo activo • Arrastra con el ratón o pulsa una tarjeta para ver su vídeo</>
          ) : (
            <>⏸️ Giro pausado • Pulsa reanudar para continuar</>
          )}
        </span>

        {selectedCardIndex !== null ? (
          <button
            onClick={handleCloseZoom}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-stone-950 text-white hover:bg-stone-800 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5 rotate-180" /> Continuar Explorando
          </button>
        ) : isPaused ? (
          <button
            onClick={() => setIsPaused(false)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-stone-950 text-white hover:bg-stone-800 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Reanudar Giro
          </button>
        ) : (
          <button
            onClick={() => setIsPaused(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:text-stone-950 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5 text-stone-500" /> Pausar
          </button>
        )}
      </div>

    </section>
  );
}
