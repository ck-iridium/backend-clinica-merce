"use client";

import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, ArrowRight, Play, Pause, X, ChevronRight, Volume2, VolumeX } from 'lucide-react';

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

  // Offset continuo (número real que avanza con auto-play o drag)
  const [offset, setOffset] = useState<number>(activeIndex ?? 0);
  const targetOffsetRef = useRef<number>(activeIndex ?? 0);
  const currentOffsetRef = useRef<number>(activeIndex ?? 0);
  
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [modalSector, setModalSector] = useState<{ sector: Sector; index: number } | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Dimensiones según viewport y modo
  const cardWidth = isPreview ? 175 : 255;
  const cardHeight = isPreview ? 245 : 355;
  const radius = isPreview ? 620 : 960;
  const angleStep = isPreview ? 17 : 16.5;

  // Sincronizar activeIndex externo si cambia desde el padre
  useEffect(() => {
    if (typeof activeIndex === 'number' && Math.abs(activeIndex - targetOffsetRef.current) > 0.01) {
      targetOffsetRef.current = activeIndex;
    }
  }, [activeIndex]);

  // Listener para cerrar modal con Escape
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && modalSector) {
        setModalSector(null);
        setIsPaused(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalSector]);

  // Bucle de animación fluida (lerp + auto-play)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Auto-play suave si no está pausado, ni en hover, ni arrastrando, ni con modal abierto
      if (!isPaused && !isHovered && !isDraggingRef.current && !modalSector) {
        const speed = 0.00035; // Desplazamiento lento, elegante
        targetOffsetRef.current += speed * delta;
      }

      // Interpolación exponencial suave (lerp)
      const diff = targetOffsetRef.current - currentOffsetRef.current;
      if (Math.abs(diff) > 0.0001) {
        currentOffsetRef.current += diff * 0.12;
        setOffset(currentOffsetRef.current);
      }

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, isHovered, modalSector]);

  // ── GESTIÓN DE ARRASTRE Y CLIC 100% FIABLE ──
  const isDraggingRef = useRef(false);
  const dragStartPosRef = useRef({ x: 0, y: 0, time: 0 });
  const dragStartOffsetRef = useRef(0);

  const onPointerDown = (e: React.PointerEvent) => {
    if (modalSector) return;
    dragStartPosRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
    dragStartOffsetRef.current = targetOffsetRef.current;
    isDraggingRef.current = false;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStartPosRef.current.time) return;
    const dx = e.clientX - dragStartPosRef.current.x;
    const dy = e.clientY - dragStartPosRef.current.y;
    const dist = Math.hypot(dx, dy);

    // Solo si se mueve más de 6px se activa el modo arrastre
    if (dist > 6) {
      isDraggingRef.current = true;
      const sensitivity = isPreview ? 0.0035 : 0.0024;
      targetOffsetRef.current = dragStartOffsetRef.current - dx * sensitivity;
    }
  };

  const onPointerUp = () => {
    dragStartPosRef.current.time = 0;
    if (isDraggingRef.current) {
      // Al soltar tras arrastrar, no hacemos nada extra, dejamos que siga flotando
      isDraggingRef.current = false;
    }
  };

  // Al hacer clic en una tarjeta específica
  const handleCardClick = (relativeSlot: number, actualIndex: number) => {
    // Si fue un arrastre real, ignorar el clic
    if (isDraggingRef.current) return;

    if (relativeSlot === 0) {
      // Si la tarjeta ya está en el centro frontal, abrir el modal de vídeo y detalles
      setIsPaused(true);
      setModalSector({ sector: items[actualIndex], index: actualIndex });
    } else {
      // Si está a los lados, desplazarla suavemente al centro
      targetOffsetRef.current = Math.round(targetOffsetRef.current) + relativeSlot;
      handleNavigate?.(actualIndex);
    }
  };

  // Al pulsar en las píldoras de navegación superior
  const handlePillClick = (targetIndex: number) => {
    const currentNorm = ((Math.round(targetOffsetRef.current) % numItems) + numItems) % numItems;
    let diff = targetIndex - currentNorm;
    // Tomar el camino más corto en el círculo
    if (diff > numItems / 2) diff -= numItems;
    if (diff < -numItems / 2) diff += numItems;

    targetOffsetRef.current = Math.round(targetOffsetRef.current) + diff;
    handleNavigate?.(targetIndex);
  };

  const currentCenterNormIndex = ((Math.round(offset) % numItems) + numItems) % numItems;

  const accentColor = tertiaryColor || '#D4AF37';
  const brandPrimary = primaryColor || '#1c1917';

  // Generamos los 7 slots activos para el arco convexo estilo Bambu Lab (-3 a +3)
  const visibleSlots = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <section 
      className={`w-full bg-white relative overflow-hidden select-none flex flex-col justify-between ${
        isPreview ? 'py-4' : 'py-16 md:py-24'
      }`}
    >
      {/* ── 1. CABECERA, TÍTULO Y PÍLDORAS ── */}
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
            Gira el carrusel de especialidades. Pulsa cualquier sector para centrarlo y ver su vídeo demostrativo.
          </p>
        )}

        {/* Píldoras de Acceso Rápido con estado activo exacto */}
        <div className={`flex flex-wrap items-center justify-center gap-2 ${isPreview ? 'mt-2 mb-1' : 'mt-6 mb-4'}`}>
          {items.map((sec, idx) => {
            const isPillActive = currentCenterNormIndex === idx;
            return (
              <button
                key={`pill-${sec.id}-${idx}`}
                type="button"
                onClick={() => handlePillClick(idx)}
                style={isPillActive ? { backgroundColor: brandPrimary, borderColor: brandPrimary, color: '#ffffff' } : undefined}
                className={`px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-bold transition-all duration-300 border shadow-sm cursor-pointer ${
                  isPillActive
                    ? 'scale-105 shadow-md ring-2 ring-[#D4AF37]/40 font-black'
                    : 'bg-white/95 hover:bg-white text-stone-700 border-stone-200/80 hover:scale-105 active:scale-95'
                }`}
              >
                {sec.badge || sec.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. ESCENARIO 3D EN ARCO CONVEXO ESTILO BAMBU LAB ── */}
      <div
        className={`w-full relative flex items-center justify-center select-none cursor-grab active:cursor-grabbing touch-none ${
          isPreview ? 'h-[300px]' : 'h-[440px] md:h-[490px]'
        }`}
        style={{
          perspective: isPreview ? '1000px' : '1300px',
          perspectiveOrigin: '50% 50%',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          isDraggingRef.current = false;
          dragStartPosRef.current.time = 0;
        }}
      >
        {/* Contenedor central de proyección 3D */}
        <div 
          className="relative w-full h-full flex items-center justify-center"
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

            // Fórmulas matemáticas de arco convexo:
            // 1. Ángulo angular en grados y radianes
            const angleDeg = slotOffset * angleStep;
            const angleRad = (angleDeg * Math.PI) / 180;

            // 2. Posición horizontal en arco (X)
            const x = Math.sin(angleRad) * radius;

            // 3. Profundidad (Z): 0 en el centro, negativo hacia el fondo a los lados (curvatura hacia atrás)
            const z = (Math.cos(angleRad) - 1) * radius;

            // 4. Rotación Y: Los de la derecha giran hacia la izquierda, los de la izquierda hacia la derecha
            const rotY = -angleDeg;

            // 5. Escala y opacidad suaves para disolverse en el horizonte
            const scale = Math.max(0.72, 1 - absOffset * 0.045);
            const opacity = Math.max(0, 1 - Math.pow(absOffset / 3.4, 2.2));
            const zIndex = Math.round(100 - absOffset * 10);

            // Si está muy lejos en el borde, no renderizar
            if (absOffset > 3.5 || opacity <= 0.01) return null;

            const isCenterCard = Math.abs(slotOffset) < 0.45;
            const imgSrc = resolveSectorImage(sector, actualItemIndex);

            return (
              <div
                key={`bambu-card-${k}-${actualItemIndex}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(k, actualItemIndex);
                }}
                className={`absolute rounded-[1.5rem] md:rounded-[1.75rem] overflow-hidden cursor-pointer select-none transition-shadow duration-300 group ${
                  isCenterCard 
                    ? 'ring-2 ring-[#D4AF37] shadow-[0_20px_60px_-15px_rgba(212,175,55,0.35),0_10px_30px_rgba(0,0,0,0.2)]' 
                    : 'shadow-xl hover:shadow-2xl'
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
                {/* Imagen de Fondo */}
                <img
                  src={imgSrc}
                  alt={sector.title}
                  draggable={false}
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none transition-transform duration-700 group-hover:scale-105"
                />

                {/* Velo Degradado cinematográfico */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10 pointer-events-none z-10" />

                {/* Badge Superior */}
                <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between pointer-events-none">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md border shadow-sm ${
                    isCenterCard 
                      ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37]' 
                      : 'bg-black/60 text-white border-white/20'
                  }`}>
                    {sector.badge || sector.title}
                  </span>

                  {isCenterCard && (
                    <span className="w-6 h-6 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                    </span>
                  )}
                </div>

                {/* Pie de Tarjeta */}
                <div className="absolute bottom-0 inset-x-0 p-4 md:p-5 z-20 text-white flex flex-col justify-end pointer-events-none">
                  <h3 className="font-serif text-sm md:text-base font-bold leading-tight drop-shadow-md text-white group-hover:text-[#D4AF37] transition-colors">
                    {sector.title}
                  </h3>
                  {isCenterCard && (
                    <p className="text-[10px] text-stone-300 mt-1 font-medium flex items-center gap-1 opacity-90">
                      <span>Ver vídeo demostrativo</span>
                      <ArrowRight className="w-2.5 h-2.5 text-[#D4AF37]" />
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. CONTROLES DE REPRODUCCIÓN INFERIORES ── */}
      <div className={`flex flex-col sm:flex-row items-center justify-center gap-3 shrink-0 text-center relative z-20 ${
        isPreview ? 'mt-1' : 'mt-4'
      }`}>
        <span className="text-[11px] font-semibold text-stone-500 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-stone-200/70 shadow-sm flex items-center justify-center gap-2">
          {!isPaused ? (
            <>🔄 Desplazamiento continuo activo • Pulsa o arrastra para explorar sectores</>
          ) : (
            <>⏸️ Carrusel pausado • Pulsa reanudar para continuar</>
          )}
        </span>

        {isPaused ? (
          <button
            type="button"
            onClick={() => setIsPaused(false)}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-stone-950 text-white hover:bg-stone-800 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" /> Reanudar
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsPaused(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white border border-stone-200 text-stone-700 hover:text-stone-950 transition-colors shadow-sm active:scale-95 cursor-pointer"
          >
            <Pause className="w-3.5 h-3.5 text-stone-500" /> Pausar
          </button>
        )}
      </div>

      {/* ── 4. MODAL SPOTLIGHT CON VÍDEO (Limpio, sin cortes de máscara ni overflow) ── */}
      {modalSector && (
        <div 
          className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-[100] flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md animate-in fade-in duration-200`}
          onClick={() => {
            setModalSector(null);
            setIsPaused(false);
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[340px] md:max-w-[440px] rounded-3xl overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.85)] border border-white/20 bg-stone-950 aspect-[7/10] flex flex-col justify-between animate-in zoom-in-95 duration-300"
            style={{
              boxShadow: `0 30px 90px -10px ${accentColor}50, 0 10px 40px rgba(0,0,0,0.95)`
            }}
          >
            {/* Vídeo / Poster de Fondo */}
            <video
              src={resolveSectorVideo(modalSector.sector, modalSector.index)}
              poster={resolveSectorImage(modalSector.sector, modalSector.index)}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Velo degrade para legibilidad */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/30 pointer-events-none z-10" />

            {/* Cabecera del modal */}
            <div className="relative z-20 p-5 flex items-center justify-between">
              <span
                style={{ backgroundColor: accentColor, color: '#1c1917' }}
                className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md backdrop-blur-md"
              >
                {modalSector.sector.badge || modalSector.sector.title}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsMuted(prev => !prev)}
                  className="w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-transform active:scale-90 cursor-pointer"
                  title={isMuted ? "Activar sonido" : "Silenciar"}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalSector(null);
                    setIsPaused(false);
                  }}
                  className="w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 shadow-md transition-transform active:scale-90 cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Pie de detalles y botón de acción */}
            <div className="relative z-20 p-6 text-white space-y-3">
              <div>
                <h3 className="font-serif text-xl md:text-2xl font-bold leading-tight drop-shadow-md">
                  {modalSector.sector.title}
                </h3>
                <p className="text-xs text-stone-200 mt-2 leading-relaxed font-medium line-clamp-3">
                  {modalSector.sector.copy || 'Entorno SaaS exclusivo para centros selectos con expedientes LOPD y motor de reservas sin comisiones.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onConfigureEntorno('pro')}
                style={{ backgroundColor: brandPrimary }}
                className="w-full text-white py-3.5 px-4 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 shadow-lg active:scale-95 hover:opacity-95 border border-white/20 cursor-pointer"
              >
                <span>Configurar este Entorno</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
