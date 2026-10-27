"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Star, Sparkles, ChevronRight, ChevronLeft, Laptop, Layers } from 'lucide-react';
import { resolveHeadingFont, resolveBodyFont, FONT_WEIGHT_MAP, GOOGLE_FONTS_URL } from '@/app/marketing/utils/fonts';

export interface MappedPreviewSector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl: string;
  imageUrl?: string;
  placeholderGradient: string;
}

export interface HeroTabItem {
  id: string;
  label: string;
  image_url: string;
}

interface Showcase3DPreviewProps {
  heroTitle: string;
  heroSubtitle: string;
  heroTabs?: HeroTabItem[];
  activeHeroTabId?: string;
  onSelectHeroTab?: (id: string) => void;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
  fontFamily?: string | null;
  fontFamilyBody?: string | null;
  fontWeightHeadings?: string | null;
  logoSvg?: string | null;
  previewSectors?: MappedPreviewSector[];
}

export default function Showcase3DPreview({
  heroTitle,
  heroSubtitle,
  heroTabs = [],
  activeHeroTabId,
  onSelectHeroTab,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  fontFamily,
  fontFamilyBody,
  fontWeightHeadings,
  logoSvg
}: Showcase3DPreviewProps) {
  const activeWeight = FONT_WEIGHT_MAP[fontWeightHeadings || 'semibold'] || '600';

  // Manejo de pestaña activa en el visor
  const [internalActiveId, setInternalActiveId] = useState<string>(
    activeHeroTabId || heroTabs[0]?.id || ''
  );

  useEffect(() => {
    if (activeHeroTabId) {
      setInternalActiveId(activeHeroTabId);
    } else if (heroTabs.length > 0 && !heroTabs.some(t => t.id === internalActiveId)) {
      setInternalActiveId(heroTabs[0].id);
    }
  }, [activeHeroTabId, heroTabs]);

  const activeTab = heroTabs.find(t => t.id === internalActiveId) || heroTabs[0];

  const hasMultipleTabs = heroTabs.length > 1;
  const activeIndex = heroTabs.findIndex(t => t.id === (activeTab?.id || ''));
  const validIndex = activeIndex >= 0 ? activeIndex : 0;

  const handleTabClick = (tabId: string) => {
    setInternalActiveId(tabId);
    onSelectHeroTab?.(tabId);
  };

  const handleNext = () => {
    if (heroTabs.length <= 1) return;
    const nextIdx = (validIndex + 1) % heroTabs.length;
    handleTabClick(heroTabs[nextIdx].id);
  };

  const handlePrev = () => {
    if (heroTabs.length <= 1) return;
    const prevIdx = (validIndex - 1 + heroTabs.length) % heroTabs.length;
    handleTabClick(heroTabs[prevIdx].id);
  };

  const getSlideOffset = (index: number) => {
    let diff = index - validIndex;
    while (diff > heroTabs.length / 2) diff -= heroTabs.length;
    while (diff < -heroTabs.length / 2) diff += heroTabs.length;
    return diff;
  };

  return (
    <div
      style={{
        '--primary-accent': primaryColor || '#1c1917',
        '--secondary-accent': secondaryColor || '#FAF9F6',
        '--tertiary-accent': tertiaryColor || '#d4af37'
      } as React.CSSProperties}
      className="flex-1 h-full bg-stone-50 flex flex-col relative overflow-hidden animate-fade-in"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('${GOOGLE_FONTS_URL}');

        .preview-serif {
          font-family: ${resolveHeadingFont(fontFamily)} !important;
          font-weight: ${activeWeight} !important;
        }
        .preview-sans {
          font-family: ${resolveBodyFont(fontFamilyBody, fontFamily)} !important;
        }
      ` }} />

      {/* ── 1. Top bar mockup de dispositivo ── */}
      <div className="h-12 bg-stone-100 border-b border-stone-200/60 px-6 flex items-center justify-between shrink-0 select-none font-sans">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-400/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-400/80"></div>
          </div>
          <span className="text-[10px] text-stone-400 font-mono border-l border-stone-200 pl-3 ml-2">
            probookia.com/marketing/showcase
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[9px] text-stone-500 font-bold bg-white px-3 py-1 rounded-lg border border-stone-200/60 shadow-2xs">
            <Monitor className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Vista Previa: Hero SaaS Interactivo</span>
          </div>
        </div>
      </div>

      {/* ── 2. Live Mock Page Body (Estilo Pabau) ── */}
      <div className="flex-1 overflow-y-auto bg-[#FAF9F6] p-6 lg:p-8 relative flex flex-col justify-start min-h-0 space-y-6">

        {/* Mock Landing Header */}
        <div className="flex justify-between items-center border-b border-stone-200/60 pb-3 select-none shrink-0 bg-white/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border">
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

          <div className="hidden sm:flex items-center gap-4 text-[10px] text-stone-500 font-bold preview-sans">
            <span>Características</span>
            <span>Soluciones</span>
            <span>Precios</span>
            <span>Docs</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-block text-[10px] font-bold text-stone-600 px-2.5 py-1">
              Acceso Clínicas
            </span>
            <span 
              style={{ backgroundColor: primaryColor || '#1c1917' }}
              className="text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider shadow-xs"
            >
              Probar Gratis
            </span>
          </div>
        </div>

        {/* ── 3. HERO SECTION INTERACTIVO ESTILO PABAU ── */}
        <section className="relative w-full flex flex-col items-center justify-center pt-2 pb-6 text-center select-none">
          
          {/* Halo ambiental translúcido con acento de marca */}
          <div 
            style={{ backgroundColor: tertiaryColor || '#D4AF37' }}
            className="absolute top-10 left-1/2 -translate-x-1/2 w-[420px] h-[220px] rounded-full blur-[110px] opacity-15 pointer-events-none" 
          />

          {/* A. ARRIBA: EDITORIAL Y TITULARES */}
          <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
            {/* Título Principal */}
            <h1 className="text-xl md:text-3xl font-serif font-bold text-stone-950 tracking-tight leading-[1.2] drop-shadow-xs mb-3 preview-serif text-center">
              {heroTitle || 'El único software que tu clínica volverá a necesitar.'}
            </h1>

            {/* Subtítulo Descriptivo */}
            <p className="text-xs md:text-sm text-stone-600 font-medium max-w-lg mx-auto leading-relaxed drop-shadow-xs preview-sans text-center mb-5">
              {heroSubtitle || 'Probookia unifica tu agenda, cobros, fichas médicas y marketing en una sola pantalla. Menos herramientas, cero fricción, más rentabilidad.'}
            </p>

            {/* Botones de Llamada a la Acción */}
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <button
                type="button"
                style={{ backgroundColor: primaryColor || '#1c1917' }}
                className="text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Solicitar Demostración</span>
                <ChevronRight className="w-3.5 h-3.5" style={{ color: tertiaryColor || '#D4AF37' }} />
              </button>
              <button
                type="button"
                className="bg-white/90 border border-stone-200/90 text-stone-800 px-4 py-2.5 rounded-xl text-xs font-bold shadow-2xs hover:bg-stone-50 transition-all"
              >
                Tour del Producto
              </button>
            </div>
          </div>

          {/* B. MEDIO: FILA HORIZONTAL DE BOTONES (TABS) */}
          {heroTabs && heroTabs.length > 0 && (
            <div className="relative z-10 w-full flex flex-wrap items-center justify-center gap-2 pt-4 pb-4">
              {heroTabs.map((tab) => {
                const isSelected = (activeTab?.id === tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    style={isSelected ? {
                      backgroundColor: primaryColor || '#1c1917',
                      color: '#ffffff',
                      borderColor: primaryColor || '#1c1917'
                    } : undefined}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 shadow-2xs border ${
                      isSelected
                        ? 'shadow-md scale-105 ring-2 ring-[#D4AF37]/30'
                        : 'bg-white/95 text-stone-600 border-stone-200/90 hover:border-stone-300 hover:text-stone-900 hover:bg-stone-50'
                    }`}
                  >
                    {tab.label || 'Sin etiqueta'}
                  </button>
                );
              })}
            </div>
          )}

          {/* C. ABAJO: TRÍPTICO SLIDER PROFESIONAL CON FRAMER MOTION */}
          <div className="relative z-10 w-full overflow-hidden py-3 select-none flex items-center justify-center">
            {/* Máscara de desvanecimiento lateral izquierda */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/85 to-transparent z-30" />
            
            {/* Máscara de desvanecimiento lateral derecha */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/85 to-transparent z-30" />

            {/* Flecha Flotante Izquierda */}
            {heroTabs.length > 1 && (
              <button
                type="button"
                onClick={handlePrev}
                className="absolute left-2 sm:left-4 z-40 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-md text-stone-700 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Diapositiva anterior"
              >
                <ChevronLeft className="w-4 h-4 text-stone-700" />
              </button>
            )}

            {/* Flecha Flotante Derecha */}
            {heroTabs.length > 1 && (
              <button
                type="button"
                onClick={handleNext}
                className="absolute right-2 sm:right-4 z-40 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-md text-stone-700 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center"
                aria-label="Siguiente diapositiva"
              >
                <ChevronRight className="w-4 h-4 text-stone-700" />
              </button>
            )}

            {/* Placeholder de dimensionamiento 16:9 responsivo */}
            <div className="w-[74%] aspect-video opacity-0 pointer-events-none" />

            {/* Pista de diapositivas animadas */}
            <div className="absolute inset-0 flex items-center justify-center overflow-visible">
              {heroTabs.map((tab, idx) => {
                const offset = getSlideOffset(idx);
                const isCenter = offset === 0;
                const isLeft = offset === -1;
                const isRight = offset === 1;
                const isVisible = Math.abs(offset) <= 1;

                const xPos = isCenter ? "0%" : isRight ? "52%" : isLeft ? "-52%" : offset > 1 ? "120%" : "-120%";

                return (
                  <motion.div
                    key={tab.id}
                    animate={{
                      x: xPos,
                      scale: isCenter ? 1 : isVisible ? 0.88 : 0.75,
                      opacity: isCenter ? 1 : isVisible ? 0.55 : 0,
                      zIndex: isCenter ? 25 : isVisible ? 15 : 0,
                    }}
                    whileHover={!isCenter && isVisible ? { opacity: 0.85, scale: 0.90 } : undefined}
                    transition={{
                      x: { type: "spring", stiffness: 220, damping: 28, mass: 0.9 },
                      scale: { type: "spring", stiffness: 240, damping: 28 },
                      opacity: { duration: 0.35 }
                    }}
                    onClick={() => {
                      if (isLeft) handlePrev();
                      if (isRight) handleNext();
                    }}
                    className={`absolute w-[74%] aspect-video rounded-xl md:rounded-2xl overflow-hidden border bg-white ${
                      isCenter
                        ? 'border-stone-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.10)] ring-1 ring-stone-900/5 cursor-default'
                        : isVisible
                        ? 'border-stone-200/80 shadow-md cursor-pointer'
                        : 'pointer-events-none'
                    }`}
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {tab.image_url ? (
                      <img 
                        src={tab.image_url} 
                        alt={tab.label}
                        className="w-full h-full object-cover pointer-events-none select-none"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-4 text-center space-y-1.5 bg-stone-50 select-none">
                        <div className="w-10 h-10 rounded-xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center text-stone-400">
                          <Laptop className="w-5 h-5 text-[#D4AF37]" />
                        </div>
                        <div>
                          <h4 className="text-[11px] font-bold text-stone-800">
                            {tab.label ? `Captura de "${tab.label}"` : 'Sin etiqueta'}
                          </h4>
                        </div>
                      </div>
                    )}

                    {!isCenter && isVisible && (
                      <div className="absolute inset-0 bg-stone-900/0 hover:bg-stone-900/5 transition-colors flex items-center justify-center pointer-events-none">
                        <span className="bg-white/95 text-stone-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1 border border-stone-200">
                          {isLeft && <ChevronLeft className="w-3 h-3" />}
                          <span>{tab.label}</span>
                          {isRight && <ChevronRight className="w-3 h-3" />}
                        </span>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
