"use client";

import { useRef, useEffect, useState, useCallback } from 'react';
import { ChevronRight, Sparkles, ArrowRight, Play, Pause } from 'lucide-react';

export interface Sector {
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
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsVideoLoaded(true))
          .catch(() => {
            // Autoplay bloqueado por políticas del navegador
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
        isActive && isVideoLoaded ? 'opacity-100' : 'opacity-0'
      }`}
      loop
      muted
      playsInline
    />
  );
}

export default function Showcase3DRing({
  sectorsToRender,
  activeIndex,
  animating,
  handleNavigate,
  onConfigureEntorno
}: Showcase3DRingProps) {
  const rawItems = sectorsToRender.length > 0 ? sectorsToRender : [];
  
  // Duplicar elementos para un carril continuo infinito sin huecos (mínimo 18 tarjetas)
  const displayItems: Sector[] = [];
  if (rawItems.length > 0) {
    while (displayItems.length < 18) {
      displayItems.push(...rawItems);
    }
  }
  const totalCards = Math.max(displayItems.length, 1);

  // Dimensiones dinámicas y adaptadas al 100% de la altura y anchura del viewport
  const [dimensions, setDimensions] = useState({
    cardWidth: 280,
    cardHeight: 430,
    cardGap: 24,
    stageHeight: 520
  });

  useEffect(() => {
    const updateDimensions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      // Estimación de espacio vertical disponible dentro del 100vh de la sección
      const headerHeight = w < 768 ? 160 : 200;
      const footerHeight = 65;
      const paddingVertical = 48; // py-6 top y bottom
      const availableStageHeight = Math.max(340, h - headerHeight - footerHeight - paddingVertical);

      // Altura base de tarjeta antes de zoom (dejando margen holgado para la ampliación al hacer clic)
      let cardH = Math.min(580, Math.max(300, Math.round(availableStageHeight * 0.70)));
      let cardW = Math.round(cardH * 0.65);

      // Ajustes para resoluciones muy anchas (2K / 2560px)
      if (w >= 2200) {
        cardH = Math.min(600, Math.max(480, Math.round(availableStageHeight * 0.72)));
        cardW = Math.round(cardH * 0.65);
      } else if (w < 768) {
        cardW = Math.min(cardW, Math.round(w * 0.65));
        cardH = Math.round(cardW / 0.65);
      }

      const gap = Math.round(cardW * 0.08);

      setDimensions({
        cardWidth: cardW,
        cardHeight: cardH,
        cardGap: Math.max(18, gap),
        stageHeight: availableStageHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const slotWidth = dimensions.cardWidth + dimensions.cardGap;
  const totalTrackWidth = totalCards * slotWidth;

  // Estados de control
  const [scrollX, setScrollX] = useState(0);
  const [isAutoPlayEnabled, setIsAutoPlayEnabled] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(null);
  const [resumeCountdown, setResumeCountdown] = useState<number | null>(null);

  const resumeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Limpiar temporizadores de auto-reanudación
  const clearAutoResumeTimers = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setResumeCountdown(null);
  }, []);

  useEffect(() => {
    return () => clearAutoResumeTimers();
  }, [clearAutoResumeTimers]);

  // Drag & Swipe
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const hasDragged = useRef(false);

  // Animación continua a 60 FPS (Avanza solo mientras no esté pausado o arrastrando)
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (currentTime: number) => {
      const delta = currentTime - lastTime;
      lastTime = currentTime;

      if (!isDragging && isAutoPlayEnabled) {
        setScrollX(prev => {
          const next = prev - (0.052 * delta);
          if (next <= -totalTrackWidth) return next + totalTrackWidth;
          return next;
        });
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isDragging, isAutoPlayEnabled, totalTrackWidth]);

  // Centrar tarjeta seleccionada al frente (X = 0), pausar carrusel, ampliarla y programar reanudación tras 7s
  const handleSelectCard = useCallback((index: number) => {
    clearAutoResumeTimers();
    setSelectedCardIndex(index);
    setIsAutoPlayEnabled(false);
    
    // Desplazar suavemente esa tarjeta al centro exacto
    const targetOffset = -index * slotWidth;
    setScrollX(targetOffset);

    // Iniciar temporizador de reanudación automática de 7 segundos
    let secondsLeft = 7;
    setResumeCountdown(secondsLeft);

    countdownIntervalRef.current = setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        if (countdownIntervalRef.current) {
          clearInterval(countdownIntervalRef.current);
          countdownIntervalRef.current = null;
        }
      } else {
        setResumeCountdown(secondsLeft);
      }
    }, 1000);

    resumeTimerRef.current = setTimeout(() => {
      setIsAutoPlayEnabled(true);
      setSelectedCardIndex(null);
      setResumeCountdown(null);
    }, 7000);
  }, [slotWidth, clearAutoResumeTimers]);

  // Reanudar el giro continuo manualmente y devolver el tamaño normal
  const handleResumeAutoPlay = () => {
    clearAutoResumeTimers();
    setIsAutoPlayEnabled(true);
    setSelectedCardIndex(null);
  };

  // Drag del ratón
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.clientX;
    dragStartScroll.current = scrollX;
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX.current;
    if (Math.abs(deltaX) > 5) {
      hasDragged.current = true;
      // Si el usuario empieza a arrastrar, resetear de inmediato la tarjeta ampliada y los timers
      if (selectedCardIndex !== null) {
        clearAutoResumeTimers();
        setSelectedCardIndex(null);
        setIsAutoPlayEnabled(true);
      }
    }
    setScrollX(dragStartScroll.current + deltaX);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  // Drag táctil
  const onTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    hasDragged.current = false;
    dragStartX.current = e.touches[0].clientX;
    dragStartScroll.current = scrollX;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const deltaX = e.touches[0].clientX - dragStartX.current;
    if (Math.abs(deltaX) > 5) {
      hasDragged.current = true;
      // Si el usuario empieza a arrastrar en móvil, resetear tarjeta ampliada
      if (selectedCardIndex !== null) {
        clearAutoResumeTimers();
        setSelectedCardIndex(null);
        setIsAutoPlayEnabled(true);
      }
    }
    setScrollX(dragStartScroll.current + deltaX);
  };

  const onTouchEnd = () => {
    setIsDragging(false);
  };

  return (
    <section 
      id="sectors" 
      className="h-screen min-h-[700px] flex flex-col justify-between bg-[#FAFAFA] border-y border-stone-200/60 overflow-hidden relative select-none py-6"
    >
      
      {/* 1. CABECERA EDITORIAL SUPERIOR (shrink-0) */}
      <div className="max-w-4xl mx-auto px-6 text-center shrink-0">
        <div className="inline-flex items-center gap-2 bg-white/90 border border-stone-200/70 text-stone-700 px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase mb-2.5 shadow-sm">
          <Sparkles className="w-3 h-3 text-[#d4af37]" />
          PLANTILLAS Y ENTORNOS VERIFICADOS
        </div>
        <h2 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-stone-950 leading-tight">
          Especializado en la excelencia de tu centro
        </h2>
        <p className="text-stone-500 text-xs md:text-sm mt-2 font-medium leading-relaxed max-w-2xl mx-auto">
          Gira de forma continua. Arrastra para explorar o pulsa en cualquier sector para centrarlo, ampliarlo y ver su vídeo.
        </p>

        {/* Píldoras de Acceso Rápido */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          {rawItems.map((sec, idx) => {
            const isSelected = selectedCardIndex !== null && (selectedCardIndex % rawItems.length) === idx;
            return (
              <button
                key={`pill-${sec.id}-${idx}`}
                onClick={() => handleSelectCard(idx)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 border shadow-sm ${
                  isSelected
                    ? 'bg-stone-950 text-white border-stone-950 scale-105 shadow-md'
                    : 'bg-white/90 hover:bg-white text-stone-700 border-stone-200/80 hover:scale-105 active:scale-95'
                }`}
              >
                {sec.badge || sec.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ESCENARIO PANORÁMICO 100VW (flex-1 para ocupar todo el espacio vertical disponible) */}
      <div 
        style={{ perspective: '1600px' }}
        className="relative w-screen left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] flex-1 min-h-0 flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        
        {/* Degradados laterales anfiteatro infinito (Fade de Bambu Lab) */}
        <div className="absolute left-0 inset-y-0 w-24 md:w-64 bg-gradient-to-r from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent z-40 pointer-events-none" />
        <div className="absolute right-0 inset-y-0 w-24 md:w-64 bg-gradient-to-l from-[#FAFAFA] via-[#FAFAFA]/90 to-transparent z-40 pointer-events-none" />

        {/* PISTA 3D CON PROYECCIÓN CÓNCAVA BAMBU LAB */}
        <div 
          style={{ height: `${dimensions.cardHeight}px` }}
          className="relative w-0 flex items-center justify-center [transform-style:preserve-3d]"
        >
          {displayItems.map((sector, index) => {
            const basePos = (index * slotWidth) + scrollX;
            const halfTrack = totalTrackWidth / 2;
            let relativeX = ((basePos + halfTrack) % totalTrackWidth);
            if (relativeX < 0) relativeX += totalTrackWidth;
            relativeX -= halfTrack;

            // Omitir tarjetas fuera del campo visual para máximo rendimiento
            if (Math.abs(relativeX) > 1700) return null;

            // Factor de distancia relativa al centro
            const normalizedDist = relativeX / (dimensions.cardWidth * 3.2);

            // Fórmula Cóncava de Bambu Lab:
            // Tarjetas al centro están rectas; tarjetas a los extremos giran hacia adentro y retroceden en Z
            const rotateY = -Math.max(-28, Math.min(28, normalizedDist * 25));
            const translateZ = -Math.pow(Math.min(Math.abs(normalizedDist), 1.6), 1.3) * 140;
            
            const isSelected = selectedCardIndex === index;
            const baseScale = Math.max(0.85, 1.02 - Math.abs(normalizedDist) * 0.1);

            // 🎯 AMPLIACIÓN DESTACADA DE LA SELECCIONADA:
            // Cuando está seleccionada, escala a 1.25x y se adelanta hacia el usuario
            const scale = isSelected 
              ? 1.24 
              : (selectedCardIndex !== null ? baseScale * 0.92 : baseScale);
            
            const extraZ = isSelected ? 90 : 0;

            return (
              <div
                key={`bambu-card-${sector.id}-${index}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!hasDragged.current) {
                    handleSelectCard(index);
                  }
                }}
                style={{
                  position: 'absolute',
                  width: `${dimensions.cardWidth}px`,
                  height: `${dimensions.cardHeight}px`,
                  left: 0,
                  top: 0,
                  transform: `translateX(${relativeX - dimensions.cardWidth / 2}px) translateZ(${translateZ + extraZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  transformStyle: 'preserve-3d',
                  zIndex: isSelected ? 70 : Math.round(50 - Math.abs(normalizedDist) * 20),
                  transition: isDragging ? 'none' : 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.4s ease, box-shadow 0.4s ease, opacity 0.4s ease, filter 0.4s ease'
                }}
                className={`rounded-2xl border overflow-hidden bg-stone-900 group cursor-pointer select-none ${
                  isSelected
                    ? 'border-[#d4af37] ring-4 ring-[#d4af37]/40 shadow-[0_35px_80px_-15px_rgba(0,0,0,0.65)] brightness-105'
                    : (selectedCardIndex !== null
                        ? 'border-white/10 filter brightness-75 opacity-70 hover:opacity-90 hover:brightness-95 shadow-md'
                        : 'border-white/20 hover:border-white/60 filter brightness-95 hover:brightness-100 shadow-md')
                }`}
              >
                
                {/* 1. Imagen Estática de Portada Fija */}
                {sector.imageUrl ? (
                  <img
                    src={sector.imageUrl}
                    alt={sector.title}
                    className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className={`absolute inset-0 w-full h-full bg-gradient-to-br ${sector.placeholderGradient}`} />
                )}

                {/* 2. Reproductor de Vídeo Dinámico (Se activa al hacer clic y seleccionar) */}
                {sector.videoUrl && (
                  <VideoPlayer
                    src={sector.videoUrl}
                    poster={sector.imageUrl}
                    isActive={isSelected}
                  />
                )}

                {/* 3. Velo Degradado Estético */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent pointer-events-none" />

                {/* 4. Badge Superior */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                  <span className={`px-2.5 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider backdrop-blur-md transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#d4af37] text-stone-950 font-extrabold shadow-sm'
                      : 'bg-black/50 text-white/90 border border-white/20'
                  }`}>
                    {sector.badge || 'Sector'}
                  </span>

                  {isSelected && sector.videoUrl && (
                    <span className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full text-[8px] font-bold text-white/90 border border-white/10 animate-pulse">
                      <Play className="w-2.5 h-2.5 fill-current text-[#d4af37]" /> REPRODUCIENDO
                    </span>
                  )}
                </div>

                {/* 5. Información en la base */}
                <div className="absolute bottom-0 inset-x-0 p-4 z-20 text-white flex flex-col justify-end">
                  <h3 className="font-serif text-base md:text-lg font-bold leading-tight drop-shadow-md text-white">
                    {sector.title}
                  </h3>

                  {isSelected && (
                    <p className="text-xs text-stone-300 line-clamp-2 mt-1 leading-relaxed animate-fade-in font-medium">
                      {sector.copy}
                    </p>
                  )}

                  {/* Acciones al estar seleccionada */}
                  {isSelected && (
                    <div className="mt-3 pt-2.5 border-t border-white/20 animate-fade-in">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfigureEntorno('pro');
                        }}
                        className="w-full bg-white hover:bg-stone-100 text-stone-950 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md active:scale-95 group/btn"
                      >
                        <span>Configurar este Entorno</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

        {/* Flechas de Navegación Lateral */}
        <button
          onClick={() => {
            if (selectedCardIndex !== null) {
              clearAutoResumeTimers();
              setSelectedCardIndex(null);
              setIsAutoPlayEnabled(true);
            }
            setScrollX(prev => prev + slotWidth * 2);
          }}
          className="absolute left-3 md:left-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-200/80 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50"
          title="Desplazar a la izquierda"
        >
          <ChevronRight className="w-5 h-5 rotate-180" />
        </button>
        
        <button
          onClick={() => {
            if (selectedCardIndex !== null) {
              clearAutoResumeTimers();
              setSelectedCardIndex(null);
              setIsAutoPlayEnabled(true);
            }
            setScrollX(prev => prev - slotWidth * 2);
          }}
          className="absolute right-3 md:right-8 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/95 hover:bg-white text-stone-800 border border-stone-200/80 shadow-md backdrop-blur-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 z-50"
          title="Desplazar a la derecha"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

      </div>

      {/* 3. BARRA DE CONTROLES INFERIOR (shrink-0) */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 shrink-0 text-center">
        <span className="text-[11px] font-semibold text-stone-500 bg-white px-4 py-1.5 rounded-full border border-stone-200/70 shadow-sm flex items-center justify-center gap-2">
          {isAutoPlayEnabled ? (
            <>🔄 Giro continuo activo • Arrastra para mover o pulsa una tarjeta para enfocarla y reproducir su vídeo</>
          ) : resumeCountdown !== null ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
              <span>Demostración en primer plano • Reanudando giro automático en <strong>{resumeCountdown}s</strong></span>
            </>
          ) : (
            <>⏸️ Demostración en primer plano • Carrusel en pausa</>
          )}
        </span>

        {!isAutoPlayEnabled ? (
          <button
            onClick={handleResumeAutoPlay}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-stone-950 text-white hover:bg-stone-800 transition-colors shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Reanudar ahora
          </button>
        ) : (
          <button
            onClick={() => {
              clearAutoResumeTimers();
              setIsAutoPlayEnabled(false);
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:text-stone-950 transition-colors shadow-sm"
          >
            <Pause className="w-3.5 h-3.5 text-[#d4af37]" /> Pausar
          </button>
        )}
      </div>

    </section>
  );
}
