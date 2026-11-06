"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, ArrowRight, Play, X, Volume2, VolumeX } from 'lucide-react';

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

const FALLBACK_SECTORS: Sector[] = [
  {
    id: 'clinicas',
    badge: 'Clínicas Estéticas',
    title: 'Clínicas & Wellness',
    copy: 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.clinicas,
    imageUrl: DEFAULT_SECTOR_IMAGES.clinicas,
  },
  {
    id: 'barberias',
    badge: 'Barberías Selectas',
    title: 'Barberías Premium',
    copy: 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.barberias,
    imageUrl: DEFAULT_SECTOR_IMAGES.barberias,
  },
  {
    id: 'dentistas',
    badge: 'Odontología Avanzada',
    title: 'Consultorios Dentales',
    copy: 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.dentistas,
    imageUrl: DEFAULT_SECTOR_IMAGES.dentistas,
  },
  {
    id: 'peluquerias',
    badge: 'Salones de Alta Costura',
    title: 'Salones de Belleza',
    copy: 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.peluquerias,
    imageUrl: DEFAULT_SECTOR_IMAGES.peluquerias,
  },
  {
    id: 'tattoos',
    badge: 'Tattoo & Piercing',
    title: 'Tattoo Studios',
    copy: 'Gestión de citas por artista, anticipos online y fichas de consentimiento informado sin papel.',
    videoUrl: DEFAULT_SECTOR_VIDEOS.tattoos,
    imageUrl: DEFAULT_SECTOR_IMAGES.tattoos,
  }
];

export default function Showcase3DRing({
  sectorsToRender,
  activeIndex,
  handleNavigate,
  onConfigureEntorno,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  isPreview = false
}: Showcase3DRingProps) {
  const items = useMemo(() => {
    return sectorsToRender && sectorsToRender.length > 0 ? sectorsToRender : FALLBACK_SECTORS;
  }, [sectorsToRender]);

  const numItems = items.length;

  // Offset continuo para animación suave
  const [offset, setOffset] = useState<number>(activeIndex ?? 0);
  const targetOffsetRef = useRef<number>(activeIndex ?? 0);
  const currentOffsetRef = useRef<number>(activeIndex ?? 0);

  const [modalSector, setModalSector] = useState<{ sector: Sector; index: number } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ── DIMENSIONES ADAPTABLES 9:16 (Ocupan todo el espacio libre de la pantalla) ──
  const [dimensions, setDimensions] = useState({
    width: isPreview ? 190 : 395,
    height: isPreview ? 338 : 702,
    radius: isPreview ? 720 : 1420,
    angleStep: isPreview ? 18 : 17,
    stageHeight: isPreview ? 380 : 760,
  });

  useEffect(() => {
    if (isPreview) return;

    const updateDimensions = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      if (w < 640) {
        // Móviles
        const cardW = Math.min(w * 0.78, 290);
        setDimensions({
          width: Math.round(cardW),
          height: Math.round(cardW * (16 / 9)),
          radius: 960,
          angleStep: 18.5,
          stageHeight: Math.round(cardW * (16 / 9) + 40),
        });
      } else if (w < 1024) {
        // Tablets y laptops compactas
        setDimensions({
          width: 340,
          height: 604,
          radius: 1200,
          angleStep: 17.5,
          stageHeight: 670,
        });
      } else if (w < 1536) {
        // Desktop estándar (1080p) - Fichas grandes e imponentes que llenan el alto
        const cardH = Math.min(Math.round(h * 0.68), 710);
        const cardW = Math.round(cardH * (9 / 16));
        setDimensions({
          width: cardW,
          height: cardH,
          radius: 1400,
          angleStep: 17,
          stageHeight: cardH + 60,
        });
      } else {
        // Pantallas 2K y 4K
        const cardH = Math.min(Math.round(h * 0.70), 780);
        const cardW = Math.round(cardH * (9 / 16));
        setDimensions({
          width: cardW,
          height: cardH,
          radius: 1550,
          angleStep: 16.5,
          stageHeight: cardH + 70,
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isPreview]);

  const { width: cardWidth, height: cardHeight, radius, angleStep, stageHeight } = dimensions;

  // Sincronizar activeIndex externo sin saltos
  useEffect(() => {
    if (typeof activeIndex === 'number') {
      const currentNorm = ((Math.round(targetOffsetRef.current) % numItems) + numItems) % numItems;
      if (currentNorm !== activeIndex) {
        let diff = activeIndex - currentNorm;
        if (diff > numItems / 2) diff -= numItems;
        if (diff < -numItems / 2) diff += numItems;
        targetOffsetRef.current = Math.round(targetOffsetRef.current) + diff;
      }
    }
  }, [activeIndex, numItems]);

  // Listener Escape para cerrar modal
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalSector) {
        setModalSector(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalSector]);

  // Autoplay de vídeo al abrir modal
  useEffect(() => {
    if (modalSector && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        if (videoRef.current) {
          videoRef.current.muted = true;
          setIsMuted(true);
          videoRef.current.play().catch(() => { });
        }
      });
    }
  }, [modalSector]);

  // ── CONTROLADOR DE ARRASTRE Y CLIC SIN CONFLICTOS ──
  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const clickBlockedUntilRef = useRef(0);
  const backdropPointerDownRef = useRef(false);

  const dragStartRef = useRef<{
    x: number;
    y: number;
    startOffset: number;
  } | null>(null);

  const cardPointerDownRef = useRef<{
    k: number;
    sector: Sector;
    actualItemIndex: number;
    x: number;
    y: number;
    time: number;
  } | null>(null);

  // Iniciar interacción en el escenario vacío
  const handleStagePointerDown = (e: React.PointerEvent) => {
    if (modalSector) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;
    cardPointerDownRef.current = null;

    // Frenar cualquier inercia de auto-giro residual
    targetOffsetRef.current = currentOffsetRef.current;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffset: targetOffsetRef.current,
    };
  };

  // Iniciar interacción sobre una tarjeta específica (central o lateral)
  const handleCardPointerDown = (e: React.PointerEvent, k: number, sector: Sector, actualItemIndex: number) => {
    if (modalSector) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;

    // Congelar inercia para que la tarjeta permanezca 100% estática bajo el cursor
    targetOffsetRef.current = currentOffsetRef.current;

    cardPointerDownRef.current = {
      k,
      sector,
      actualItemIndex,
      x: e.clientX,
      y: e.clientY,
      time: Date.now(),
    };

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffset: targetOffsetRef.current,
    };
  };

  // Movimiento del cursor: si el desplazamiento supera 10px, es un arrastre intencional
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const dist = Math.hypot(dx, dy);

    if (dist > 10) {
      hasDraggedRef.current = true;
      const sensitivity = isPreview ? 0.0035 : 0.0022;
      targetOffsetRef.current = dragStartRef.current.startOffset - dx * sensitivity;
    }
  };

  // Fin de la interacción: evalúa si fue clic limpio en cualquier ficha o fin de arrastre
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    const card = cardPointerDownRef.current;
    cardPointerDownRef.current = null;
    dragStartRef.current = null;

    // Clic limpio en ficha detectado por coordenadas físicas del ratón
    if (!hasDraggedRef.current && card) {
      const dx = e.clientX - card.x;
      const dy = e.clientY - card.y;
      const dist = Math.hypot(dx, dy);
      const duration = Date.now() - card.time;

      if (dist < 14 && duration < 650) {
        // 1. Centrar la ficha en el anfiteatro 3D
        targetOffsetRef.current = Math.round(targetOffsetRef.current) + card.k;
        handleNavigate?.(card.actualItemIndex);

        // 2. Abrir inmediatamente el modal spotlight en formato 9:16 grande
        setModalSector({ sector: card.sector, index: card.actualItemIndex });
        return;
      }
    }

    // Si fue arrastre, bloquear eventos click sintéticos durante 180ms
    if (hasDraggedRef.current) {
      clickBlockedUntilRef.current = Date.now() + 180;
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 180);
    }
  };

  // Seguridad global: capturar pointerup si el usuario suelta fuera de la ventana
  useEffect(() => {
    const handleGlobalUp = (e: PointerEvent) => {
      if (isPointerDownRef.current) {
        handlePointerUp(e as unknown as React.PointerEvent);
      }
    };
    window.addEventListener('pointerup', handleGlobalUp);
    window.addEventListener('pointercancel', handleGlobalUp);
    return () => {
      window.removeEventListener('pointerup', handleGlobalUp);
      window.removeEventListener('pointercancel', handleGlobalUp);
    };
  }, []);

  // Clic directo como fallback de eventos
  const handleCardClick = (e: React.MouseEvent, k: number, sector: Sector, actualItemIndex: number) => {
    e.stopPropagation();

    if (hasDraggedRef.current || Date.now() < clickBlockedUntilRef.current) {
      return;
    }

    targetOffsetRef.current = Math.round(targetOffsetRef.current) + k;
    handleNavigate?.(actualItemIndex);
    setModalSector({ sector, index: actualItemIndex });
  };

  // ── BUCLE DE ANIMACIÓN CONTINUO ──
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // El giro continuo se pausa si el modal está abierto o si el usuario mantiene el puntero presionado
      const isUserInteracting = isPointerDownRef.current;
      if (!isUserInteracting && !modalSector) {
        const speed = 0.00028;
        targetOffsetRef.current += speed * delta;
      }

      // Lerp suave hacia targetOffsetRef
      const diff = targetOffsetRef.current - currentOffsetRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentOffsetRef.current += diff * 0.12;
        setOffset(currentOffsetRef.current);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [modalSector]);

  // ── ACCIÓN AL PULSAR PÍLDORAS SUPERIORES ──
  const handlePillClick = (targetIndex: number) => {
    const currentNorm = ((Math.round(targetOffsetRef.current) % numItems) + numItems) % numItems;
    let diff = targetIndex - currentNorm;
    if (diff > numItems / 2) diff -= numItems;
    if (diff < -numItems / 2) diff += numItems;

    targetOffsetRef.current = Math.round(targetOffsetRef.current) + diff;
    handleNavigate?.(targetIndex);

    const targetSector = items[targetIndex];
    if (targetSector) {
      setModalSector({ sector: targetSector, index: targetIndex });
    }
  };

  const currentCenterNormIndex = ((Math.round(offset) % numItems) + numItems) % numItems;
  const accentColor = tertiaryColor || '#D4AF37';
  const brandPrimary = primaryColor || '#1c1917';

  // 7 slots activos para el arco convexo estilo Bambu Lab (-3 a +3)
  const visibleSlots = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <section
      id="sectores"
      className={`scroll-mt-20 w-full bg-white relative overflow-hidden select-none flex flex-col justify-between ${isPreview ? 'py-4' : 'py-28'
        }`}
    >
      {/* ── 1. CABECERA, TÍTULO Y PÍLDORAS (RITMO VERTICAL QUIET LUXURY UNIFICADO A PY-28) ── */}
      <div className="w-full max-w-4xl mx-auto px-6 text-center shrink-0 relative z-20 mb-8 md:mb-12">
        {!isPreview && (
          <div
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.25em] mb-4 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span>PLANTILLAS Y ENTORNOS VERIFICADOS</span>
          </div>
        )}

        <h2 className={`${isPreview ? 'text-lg md:text-xl' : 'text-3xl md:text-5xl'} font-serif font-bold tracking-tight text-stone-950 leading-tight`}>
          Especializado en la excelencia de tu centro
        </h2>

        {!isPreview && (
          <p className="text-stone-500 text-sm md:text-base mt-4 font-medium leading-relaxed max-w-2xl mx-auto">
            Entornos preconfigurados y optimizados para la identidad y operativa real de cada sector.
          </p>
        )}

        {/* Píldoras de Acceso Rápido */}
        <div className={`flex flex-wrap items-center justify-center gap-2 ${isPreview ? 'mt-2 mb-1' : 'mt-6 mb-2'}`}>
          {items.map((sec, idx) => {
            const isPillActive = currentCenterNormIndex === idx;
            return (
              <button
                key={`pill-${sec.id}-${idx}`}
                type="button"
                onClick={() => handlePillClick(idx)}
                style={isPillActive ? { backgroundColor: brandPrimary, borderColor: brandPrimary, color: '#ffffff' } : undefined}
                className={`px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-bold transition-all duration-300 border shadow-sm cursor-pointer ${isPillActive
                    ? 'scale-105 shadow-md ring-2 ring-[#D4AF37]/50 font-black'
                    : 'bg-white/95 hover:bg-white text-stone-700 border-stone-200/80 hover:scale-105 active:scale-95'
                  }`}
              >
                {sec.badge || sec.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. ESCENARIO 3D EN ARCO CONVEXO CON ARRASTRE Y CLIC 100% FUNCIONALES ── */}
      <div
        suppressHydrationWarning={true}
        className="w-full relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none"
        style={{
          height: `${stageHeight}px`,
          perspective: isPreview ? '1100px' : '1500px',
          perspectiveOrigin: '50% 50%',
        }}
        onPointerDown={handleStagePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        {/* Contenedor de proyección 3D (con pointer-events-none para que el plano Z=0 no bloquee los clics en tarjetas laterales con Z negativo) */}
        <div
          suppressHydrationWarning={true}
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {visibleSlots.map((k) => {
            // Desplazamiento continuo del slot relativo al centro actual
            const baseCenter = Math.round(offset);
            const slotOffset = k - (offset - baseCenter);
            const absOffset = Math.abs(slotOffset);

            // Mapeo cíclico al array de items reales
            const actualItemIndex = ((baseCenter + k) % numItems + numItems) % numItems;
            const sector = items[actualItemIndex];
            if (!sector) return null;

            // Fórmulas matemáticas de arco convexo (Bambu Lab geometry):
            const angleDeg = slotOffset * angleStep;
            const angleRad = (angleDeg * Math.PI) / 180;

            // Posición horizontal en arco (X)
            const rawX = Math.sin(angleRad) * radius;
            const x = Math.round(rawX * 100) / 100;

            // Profundidad (Z): 0 en el centro, negativo hacia el fondo a los lados
            const rawZ = (Math.cos(angleRad) - 1) * radius;
            const z = Math.round(rawZ * 100) / 100;

            // Rotación Y
            const rotY = Math.round(-angleDeg * 100) / 100;

            // Escala y opacidad suaves (redondeadas para evitar diferencias de coma flotante SSR vs Cliente)
            const scale = Math.round(Math.max(0.75, 1 - absOffset * 0.045) * 1000) / 1000;
            const opacity = Math.round(Math.max(0, 1 - Math.pow(absOffset / 3.4, 2.2)) * 1000) / 1000;
            const zIndex = Math.round(100 - absOffset * 10);

            if (absOffset > 3.5 || opacity <= 0.01) return null;

            const isCenterCard = Math.abs(slotOffset) < 0.45;
            const imgSrc = resolveSectorImage(sector, actualItemIndex);

            return (
              <div
                key={`bambu-slot-${k}`}
                suppressHydrationWarning={true}
                onPointerDown={(e) => handleCardPointerDown(e, k, sector, actualItemIndex)}
                onClick={(e) => handleCardClick(e, k, sector, actualItemIndex)}
                className={`absolute rounded-[2.4rem] md:rounded-[2.8rem] overflow-hidden cursor-pointer select-none transition-shadow duration-300 group pointer-events-auto ${isCenterCard
                    ? 'border-[3.5px] border-[#D4AF37] ring-4 ring-[#D4AF37]/25 shadow-[0_30px_90px_-15px_rgba(212,175,55,0.45),0_15px_40px_rgba(0,0,0,0.35)]'
                    : 'border-[3px] border-stone-800/80 shadow-2xl hover:border-stone-700'
                  }`}
                style={{
                  width: `${cardWidth}px`,
                  height: `${cardHeight}px`,
                  transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotY}deg) scale(${scale})`,
                  opacity: opacity,
                  zIndex: zIndex,
                  transformStyle: 'preserve-3d',
                  willChange: 'transform, opacity',
                  pointerEvents: opacity > 0.1 ? 'auto' : 'none',
                }}
              >
                {/* ── ISLA DINÁMICA / SPEAKER SUPERIOR DE SMARTPHONE ── */}
                <div className="absolute top-3 inset-x-0 z-30 flex justify-center pointer-events-none">
                  <div className="w-20 md:w-24 h-4 bg-black/90 rounded-full border border-white/10 flex items-center justify-center gap-1.5 shadow-md backdrop-blur-md">
                    <span className="w-2 h-2 rounded-full bg-stone-900 border border-white/20" />
                    <span className="w-6 h-0.5 rounded-full bg-stone-700" />
                  </div>
                </div>

                {/* ── IMAGEN DE FONDO VERTICAL 9:16 ── */}
                <img
                  src={imgSrc}
                  alt={sector.title}
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
                />

                {/* ── VELO DEGRADADO CINEMATOGRÁFICO DE LECTURA ── */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/30 pointer-events-none z-10" />

                {/* ── BADGE SUPERIOR DE SECTOR ── */}
                <div className="absolute top-9 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider backdrop-blur-md border shadow-md ${isCenterCard
                      ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37]'
                      : 'bg-black/60 text-white border-white/20'
                    }`}>
                    {sector.badge || sector.title}
                  </span>

                  {isCenterCard && (
                    <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Activo
                    </span>
                  )}
                </div>

                {/* ── BOTÓN PLAY CENTRAL EN LA FICHA ACTIVA ── */}
                {isCenterCard && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <div className="w-16 h-16 rounded-full bg-[#D4AF37] text-stone-950 flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-300 ring-4 ring-black/40">
                      <Play className="w-7 h-7 fill-current ml-0.5" />
                    </div>
                  </div>
                )}

                {/* ── PIE DE LA FICHA MÓVIL ── */}
                <div className="absolute bottom-0 inset-x-0 p-5 md:p-6 z-20 text-white flex flex-col justify-end pointer-events-none">
                  <h3 className="font-serif text-base md:text-xl font-bold leading-tight drop-shadow-md text-white group-hover:text-[#D4AF37] transition-colors">
                    {sector.title}
                  </h3>

                  <p className="text-[11px] md:text-xs text-stone-200 mt-1.5 font-medium line-clamp-2 opacity-90 leading-relaxed">
                    {sector.copy || 'Entorno SaaS exclusivo con expedientes LOPD y motor de reservas sin comisiones.'}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-stone-300 flex items-center gap-1 group-hover:text-[#D4AF37] transition-colors">
                      <span>Ver demostración</span>
                      <ArrowRight className="w-3 h-3 text-[#D4AF37]" />
                    </span>
                  </div>

                  {/* Barra Home Indicator de Smartphone */}
                  <div className="w-24 h-1 bg-white/40 rounded-full mx-auto mt-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. MODAL SPOTLIGHT CON VÍDEO (OCUPA EL 82% DEL ALTO DE PANTALLA) ── */}
      {modalSector && (
        <div
          className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-200`}
          onPointerDown={(e) => {
            if (e.target === e.currentTarget) {
              backdropPointerDownRef.current = true;
            }
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && backdropPointerDownRef.current) {
              backdropPointerDownRef.current = false;
              setModalSector(null);
            }
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative h-[82vh] max-h-[900px] aspect-[9/16] w-auto max-w-[94vw] rounded-[2.8rem] md:rounded-[3.4rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.95)] border-[4px] border-stone-800 bg-stone-950 flex flex-col justify-between animate-in zoom-in-95 duration-300"
            style={{
              boxShadow: `0 30px 100px -10px ${accentColor}60, 0 15px 50px rgba(0,0,0,0.95)`
            }}
          >
            {/* Isla dinámica superior en el modal */}
            <div className="absolute top-3 inset-x-0 z-30 flex justify-center pointer-events-none">
              <div className="w-28 h-5 bg-black/90 rounded-full border border-white/10 flex items-center justify-center gap-2 shadow-md backdrop-blur-md">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-900 border border-white/20" />
                <span className="w-7 h-0.5 rounded-full bg-stone-700" />
              </div>
            </div>

            {/* Vídeo / Poster de Fondo en 9:16 a gran escala */}
            <video
              ref={videoRef}
              key={modalSector.sector.id}
              src={resolveSectorVideo(modalSector.sector, modalSector.index)}
              poster={resolveSectorImage(modalSector.sector, modalSector.index)}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Velo degrade para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/30 pointer-events-none z-10" />

            {/* Cabecera del modal */}
            <div className="relative z-20 pt-10 px-6 flex items-center justify-between">
              <span
                style={{ backgroundColor: accentColor, color: '#1c1917' }}
                className="px-3.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md backdrop-blur-md"
              >
                {modalSector.sector.badge || modalSector.sector.title}
              </span>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsMuted(prev => !prev)}
                  className="w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-transform active:scale-90 cursor-pointer"
                  title={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => setModalSector(null)}
                  className="w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-transform active:scale-90 cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pie de detalles y botón de acción */}
            <div className="relative z-20 p-6 md:p-8 text-white space-y-3.5 pb-8">
              <div>
                <h3 className="font-serif text-xl md:text-3xl font-bold leading-tight drop-shadow-md">
                  {modalSector.sector.title}
                </h3>
                <p className="text-xs md:text-sm text-stone-200 mt-2 leading-relaxed font-medium line-clamp-3">
                  {modalSector.sector.copy || 'Entorno SaaS exclusivo para centros selectos con expedientes LOPD y motor de reservas sin comisiones.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setModalSector(null);
                  onConfigureEntorno('pro');
                }}
                style={{ backgroundColor: brandPrimary }}
                className="w-full text-white py-4 px-5 rounded-2xl text-xs md:text-sm font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 hover:opacity-95 border border-white/20 cursor-pointer"
              >
                <span>Configurar este Entorno</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Home indicator en el modal */}
              <div className="w-28 h-1 bg-white/40 rounded-full mx-auto pt-1" />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
