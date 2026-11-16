"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Sparkles } from 'lucide-react';
import { 
  Sector, 
  Showcase3DRingProps, 
  FALLBACK_SECTORS 
} from './showcase3d/showcaseData';
import { useShowcaseDimensions } from './showcase3d/useShowcaseDimensions';
import { Showcase3DCard } from './showcase3d/Showcase3DCard';
import { ShowcaseVideoModal } from './showcase3d/ShowcaseVideoModal';

// Re-exportar tipos para mantener compatibilidad 100% con Showcase3DPreview y otros módulos
export type { Sector, Showcase3DRingProps };
export { FALLBACK_SECTORS };

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

  // Offset continuo para animación suave en 3D
  const [offset, setOffset] = useState<number>(activeIndex ?? 0);
  const targetOffsetRef = useRef<number>(activeIndex ?? 0);
  const currentOffsetRef = useRef<number>(activeIndex ?? 0);

  const [modalSector, setModalSector] = useState<{ sector: Sector; index: number } | null>(null);

  // Dimensiones adaptables responsivas 9:16
  const { width: cardWidth, height: cardHeight, radius, angleStep, stageHeight } = useShowcaseDimensions(isPreview);

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

  // ── CONTROLADOR DE ARRASTRE Y CLIC SIN CONFLICTOS ──
  const isPointerDownRef = useRef(false);
  const hasDraggedRef = useRef(false);
  const clickBlockedUntilRef = useRef(0);

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

    targetOffsetRef.current = currentOffsetRef.current;
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startOffset: targetOffsetRef.current,
    };
  };

  // Iniciar interacción sobre una tarjeta específica
  const handleCardPointerDown = (e: React.PointerEvent, k: number, sector: Sector, actualItemIndex: number) => {
    if (modalSector) return;
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    isPointerDownRef.current = true;
    hasDraggedRef.current = false;

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

  // Movimiento del cursor: arrastre sensible
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

  // Fin de la interacción
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return;
    isPointerDownRef.current = false;

    const card = cardPointerDownRef.current;
    cardPointerDownRef.current = null;
    dragStartRef.current = null;

    // Clic limpio en ficha
    if (!hasDraggedRef.current && card) {
      const dx = e.clientX - card.x;
      const dy = e.clientY - card.y;
      const dist = Math.hypot(dx, dy);
      const duration = Date.now() - card.time;

      if (dist < 14 && duration < 650) {
        targetOffsetRef.current = Math.round(targetOffsetRef.current) + card.k;
        handleNavigate?.(card.actualItemIndex);
        setModalSector({ sector: card.sector, index: card.actualItemIndex });
        return;
      }
    }

    if (hasDraggedRef.current) {
      clickBlockedUntilRef.current = Date.now() + 180;
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 180);
    }
  };

  // Seguridad global: capturar pointerup fuera de la ventana
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

  // Clic directo en tarjeta
  const handleCardClick = (e: React.MouseEvent, k: number, sector: Sector, actualItemIndex: number) => {
    e.stopPropagation();
    if (hasDraggedRef.current || Date.now() < clickBlockedUntilRef.current) {
      return;
    }
    targetOffsetRef.current = Math.round(targetOffsetRef.current) + k;
    handleNavigate?.(actualItemIndex);
    setModalSector({ sector, index: actualItemIndex });
  };

  // Bucle de animación continuo y suave
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const tick = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      if (!isPointerDownRef.current && !modalSector) {
        const speed = 0.00028;
        targetOffsetRef.current += speed * delta;
      }

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

  // Selección por píldoras superiores
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
  const visibleSlots = [-3, -2, -1, 0, 1, 2, 3];

  return (
    <section
      id="sectores"
      className={`scroll-mt-20 w-full bg-white relative overflow-hidden select-none flex flex-col justify-between ${
        isPreview ? 'py-4' : 'py-28'
      }`}
    >
      {/* ── 1. CABECERA, TÍTULO Y PÍLDORAS ── */}
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
                className={`px-3.5 py-1.5 rounded-full text-[11px] md:text-xs font-bold transition-all duration-300 border shadow-sm cursor-pointer ${
                  isPillActive
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

      {/* ── 2. ESCENARIO 3D EN ARCO CONVEXO ── */}
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
        <div
          suppressHydrationWarning={true}
          className="relative w-full h-full flex items-center justify-center pointer-events-none"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {visibleSlots.map((k) => {
            const baseCenter = Math.round(offset);
            const slotOffset = k - (offset - baseCenter);
            const absOffset = Math.abs(slotOffset);

            const actualItemIndex = ((baseCenter + k) % numItems + numItems) % numItems;
            const sector = items[actualItemIndex];
            if (!sector) return null;

            return (
              <Showcase3DCard
                key={`bambu-slot-${k}`}
                slotKey={k}
                slotOffset={slotOffset}
                absOffset={absOffset}
                angleStep={angleStep}
                radius={radius}
                cardWidth={cardWidth}
                cardHeight={cardHeight}
                sector={sector}
                actualItemIndex={actualItemIndex}
                onPointerDown={(e) => handleCardPointerDown(e, k, sector, actualItemIndex)}
                onClick={(e) => handleCardClick(e, k, sector, actualItemIndex)}
              />
            );
          })}
        </div>
      </div>

      {/* ── 3. MODAL SPOTLIGHT CON VÍDEO ── */}
      {modalSector && (
        <ShowcaseVideoModal
          modalSector={modalSector}
          onClose={() => setModalSector(null)}
          onConfigureEntorno={onConfigureEntorno}
          accentColor={accentColor}
          brandPrimary={brandPrimary}
          isPreview={isPreview}
        />
      )}
    </section>
  );
}
