"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Monitor, ChevronRight, ChevronLeft, Laptop, Eye, Smartphone } from 'lucide-react';
import { resolveHeadingFont, resolveBodyFont, FONT_WEIGHT_MAP, GOOGLE_FONTS_URL } from '@/app/marketing/utils/fonts';
import PainComparisonSection from '@/app/marketing/components/PainComparisonSection';
import PillarsSection from '@/app/marketing/components/PillarsSection';
import Showcase3DRing, { Sector } from '@/app/marketing/components/Showcase3DRing';
import PricingSection from '@/app/marketing/components/PricingSection';
import MarketingFooter from '@/app/marketing/components/MarketingFooter';
import type { PainComparisonData } from './SaaSCMSPainForm';
import type { PillarsSectionData } from './SaaSCMSPillarsForm';

export interface MappedPreviewSector extends Sector {
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
  mobile_image_url?: string;
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
  previewIndex?: number;
  previewAnimating?: boolean;
  onNavigateSector?: (index: number) => void;
  painComparisonData?: PainComparisonData;
  pillarsData?: PillarsSectionData;
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
  logoSvg,
  previewSectors = [],
  previewIndex = 0,
  previewAnimating = false,
  onNavigateSector,
  painComparisonData,
  pillarsData
}: Showcase3DPreviewProps) {
  const activeWeight = FONT_WEIGHT_MAP[fontWeightHeadings || 'semibold'] || '600';
  const resolvedHeadingFont = resolveHeadingFont(fontFamily);
  const resolvedBodyFont = resolveBodyFont(fontFamilyBody, fontFamily);

  // Dispositivo de previsualización (Escritorio / Móvil)
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Manejo de pestaña activa en el visor del Hero
  const [internalActiveId, setInternalActiveId] = useState<string>(
    activeHeroTabId || heroTabs[0]?.id || ''
  );

  useEffect(() => {
    if (activeHeroTabId) {
      setInternalActiveId(activeHeroTabId);
    } else if (heroTabs.length > 0 && !heroTabs.some(t => t.id === internalActiveId)) {
      setInternalActiveId(heroTabs[0].id);
    }
  }, [activeHeroTabId, heroTabs, internalActiveId]);

  const activeTab = heroTabs.find(t => t.id === internalActiveId) || heroTabs[0];
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

  // Manejo de rotación en el Anillo 3D de Sectores
  const [internalSectorIndex, setInternalSectorIndex] = useState(previewIndex);
  const [internalSectorAnimating, setInternalSectorAnimating] = useState(false);

  useEffect(() => {
    if (previewIndex !== undefined) {
      setInternalSectorIndex(previewIndex);
    }
  }, [previewIndex]);

  const handleInternalSectorNavigate = (newIdx: number) => {
    if (onNavigateSector) {
      onNavigateSector(newIdx);
    } else {
      if (internalSectorAnimating) return;
      setInternalSectorAnimating(true);
      setTimeout(() => setInternalSectorIndex(newIdx), 200);
      setTimeout(() => setInternalSectorAnimating(false), 600);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const accentColor = tertiaryColor || '#D4AF37';
  const darkColor = primaryColor || '#1C1917';
  const surfaceColor = secondaryColor || '#FAF9F6';

  return (
    <div
      style={{
        '--primary-accent': darkColor,
        '--secondary-accent': surfaceColor,
        '--tertiary-accent': accentColor
      } as React.CSSProperties}
      className="flex-1 h-full bg-stone-50 flex flex-col relative overflow-hidden animate-fade-in"
    >
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('${GOOGLE_FONTS_URL}');

        .preview-landing-root {
          --font-serif: ${resolvedHeadingFont} !important;
          --font-heading: ${resolvedHeadingFont} !important;
          --font-playfair: ${resolvedHeadingFont} !important;
          --font-cormorant: ${resolvedHeadingFont} !important;
          --font-sans: ${resolvedBodyFont} !important;
          --font-body: ${resolvedBodyFont} !important;
        }

        .preview-landing-root .font-serif,
        .preview-landing-root .font-serif.font-bold,
        .preview-landing-root .font-serif.font-semibold,
        .preview-landing-root .font-serif.font-medium,
        .preview-landing-root h1,
        .preview-landing-root h2,
        .preview-landing-root h3,
        .preview-landing-root h4,
        .preview-landing-root [class*="font-serif"] {
          font-family: ${resolvedHeadingFont} !important;
          font-weight: ${activeWeight} !important;
        }

        .preview-landing-root .font-sans,
        .preview-landing-root p,
        .preview-landing-root span,
        .preview-landing-root button,
        .preview-landing-root input {
          font-family: ${resolvedBodyFont} !important;
        }
      ` }} />

      {/* ── 1. Top bar mockup de navegador con Accesos Rápidos de Sección ── */}
      <div className="h-12 bg-stone-100 border-b border-stone-200/80 px-4 sm:px-6 flex items-center justify-between shrink-0 select-none font-sans z-30">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-400/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400/80"></div>
          </div>
          <span className="text-[10px] text-stone-500 font-mono border-l border-stone-200 pl-2.5 ml-1.5 hidden md:inline">
            probookia.com/marketing (Live Preview)
          </span>
        </div>

        {/* Botones de anclaje rápido para saltar a las secciones */}
        <div className="flex items-center gap-1 overflow-x-auto py-1">
          <button
            type="button"
            onClick={() => scrollToSection('preview-hero')}
            className="px-2.5 py-1 rounded-md text-[9px] font-bold text-stone-600 hover:text-stone-950 hover:bg-white transition-colors"
          >
            Hero
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('preview-pain')}
            className="px-2.5 py-1 rounded-md text-[9px] font-bold text-stone-600 hover:text-stone-950 hover:bg-white transition-colors"
          >
            Comparativa
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('preview-pillars')}
            className="px-2.5 py-1 rounded-md text-[9px] font-bold text-stone-600 hover:text-stone-950 hover:bg-white transition-colors"
          >
            Pilares
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('preview-sectors')}
            className="px-2.5 py-1 rounded-md text-[9px] font-bold text-stone-600 hover:text-stone-950 hover:bg-white transition-colors flex items-center gap-1"
          >
            <span>Sectores</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]"></span>
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('preview-pricing')}
            className="px-2.5 py-1 rounded-md text-[9px] font-bold text-stone-600 hover:text-stone-950 hover:bg-white transition-colors"
          >
            Precios
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-stone-200/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setPreviewDevice('desktop')}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              previewDevice === 'desktop'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Monitor className="w-3 h-3" />
            <span>Escritorio</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewDevice('mobile')}
            className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              previewDevice === 'mobile'
                ? 'bg-[#D4AF37] text-stone-950 shadow-xs'
                : 'text-stone-500 hover:text-stone-900'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Móvil</span>
          </button>
        </div>
      </div>

      {/* ── 2. Scrollable Landing Viewport ── */}
      <div className="preview-landing-root flex-1 overflow-y-auto bg-[#FAF9F6] relative min-h-0 scroll-smooth">

        {/* Mock Landing Header */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/60 px-6 py-3 flex justify-between items-center transition-all duration-300">
          <div className="flex items-center gap-3">
            {logoSvg ? (
              <div
                className="h-7 flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto max-w-[160px]"
                dangerouslySetInnerHTML={{ __html: logoSvg }}
              />
            ) : (
              <span className="text-base font-serif font-bold tracking-tight text-stone-900">
                PROBOOKIA <span style={{ color: accentColor }} className="text-[9px] font-sans font-black tracking-widest uppercase ml-0.5">SaaS</span>
              </span>
            )}
          </div>

          <nav className="hidden md:flex items-center gap-5 text-xs text-stone-600 font-semibold font-sans">
            <button type="button" onClick={() => scrollToSection('preview-pain')} className="hover:text-stone-950 transition-colors cursor-pointer">Características</button>
            <button type="button" onClick={() => scrollToSection('preview-pillars')} className="hover:text-stone-950 transition-colors cursor-pointer">Pilares</button>
            <button type="button" onClick={() => scrollToSection('preview-sectors')} className="hover:text-stone-950 transition-colors cursor-pointer">Sectores</button>
            <button type="button" onClick={() => scrollToSection('preview-pricing')} className="hover:text-stone-950 transition-colors cursor-pointer">Precios</button>
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-bold text-stone-700 px-3 py-1.5">
              Acceso Clínicas
            </span>
            <span 
              style={{ backgroundColor: darkColor }}
              className="text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs cursor-default"
            >
              Probar Gratis
            </span>
          </div>
        </header>

        {/* ── SECCIÓN 1: HERO SECTION INTERACTIVO ── */}
        <section id="preview-hero" className="relative w-full flex flex-col items-center justify-center pt-8 pb-14 px-6 text-center select-none overflow-hidden">
          {/* Halo ambiental translúcido con acento de marca */}
          <div 
            style={{ backgroundColor: accentColor }}
            className="absolute top-12 left-1/2 -translate-x-1/2 w-[520px] h-[260px] rounded-full blur-[120px] opacity-15 pointer-events-none" 
          />

          {/* Editorial y Titulares */}
          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <h1 
              style={{ fontWeight: activeWeight }}
              className="text-2xl sm:text-4xl md:text-5xl font-serif text-stone-950 tracking-tight leading-[1.18] drop-shadow-xs mb-4 text-center"
            >
              {heroTitle || 'El único software que tu clínica volverá a necesitar.'}
            </h1>

            <p className="text-sm md:text-base text-stone-600 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-xs text-center mb-6">
              {heroSubtitle || 'Probookia unifica tu agenda, cobros, fichas médicas y marketing en una sola pantalla. Menos herramientas, cero fricción, más rentabilidad.'}
            </p>

            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                type="button"
                style={{ backgroundColor: darkColor }}
                className="text-white px-6 py-3 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition-all flex items-center gap-1.5 active:scale-95"
              >
                <span>Solicitar Demostración</span>
                <ChevronRight className="w-3.5 h-3.5" style={{ color: accentColor }} />
              </button>
              <button
                type="button"
                className="bg-white/90 border border-stone-200/90 text-stone-800 px-5 py-3 rounded-xl text-xs font-bold shadow-2xs hover:bg-stone-50 transition-all"
              >
                Tour del Producto
              </button>
            </div>
          </div>

          {/* Fila Horizontal de Pestañas (Tabs) */}
          {heroTabs && heroTabs.length > 0 && (
            <div className="relative z-10 w-full flex flex-wrap items-center justify-center gap-2 pt-2 pb-6 max-w-4xl mx-auto">
              {heroTabs.map((tab) => {
                const isSelected = (activeTab?.id === tab.id);
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabClick(tab.id)}
                    style={isSelected ? {
                      backgroundColor: darkColor,
                      color: '#ffffff',
                      borderColor: darkColor
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

          {/* VISTA SEGÚN DISPOSITIVO: ESCRITORIO O MÓVIL */}
          {previewDevice === 'mobile' ? (
            /* Simulador Smartphone Vertical en Vista Previa */
            <div className="relative z-10 w-full flex flex-col items-center justify-center py-6 select-none">
              <div className="relative w-full max-w-[280px] flex items-center justify-center">
                {/* Flecha Izquierda Flotante */}
                {heroTabs.length > 1 && (
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute -left-4 z-40 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-md text-stone-700 hover:text-stone-950 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
                    aria-label="Anterior pestaña"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Flecha Derecha Flotante */}
                {heroTabs.length > 1 && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute -right-4 z-40 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-stone-200/90 shadow-md text-stone-700 hover:text-stone-950 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
                    aria-label="Siguiente pestaña"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Smartphone Mockup */}
                <motion.div
                  key={activeTab?.id || 'mobile-preview'}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className="w-[260px] h-[480px] rounded-[2.5rem] bg-stone-950 p-2 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] relative border-4 border-stone-800 ring-1 ring-white/10 flex flex-col"
                >
                  {/* Dynamic Island */}
                  <div className="w-20 h-3.5 bg-black rounded-full absolute top-3 left-1/2 -translate-x-1/2 z-40 flex items-center justify-end px-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-800 border border-stone-700" />
                  </div>

                  {/* Pantalla */}
                  <div className="w-full h-full rounded-[2rem] overflow-hidden bg-stone-100 relative">
                    {activeTab?.mobile_image_url || activeTab?.image_url ? (
                      <img
                        src={activeTab?.mobile_image_url || activeTab?.image_url}
                        alt={activeTab?.label}
                        className="w-full h-full object-cover pointer-events-none select-none"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-2 bg-stone-50 select-none">
                        <Smartphone className="w-8 h-8 text-[#D4AF37]" />
                        <h4 className="text-xs font-bold text-stone-800">{activeTab?.label}</h4>
                        <span className="text-[9.5px] text-stone-400">Sube una captura vertical en el panel</span>
                      </div>
                    )}

                    {/* Tag de cabecera */}
                    <div className="absolute top-7 left-3 right-3 flex items-center justify-between pointer-events-none z-30">
                      <span className="px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/15">
                        {activeTab?.label}
                      </span>
                      <span 
                        style={{ backgroundColor: accentColor }}
                        className="px-1.5 py-0.5 rounded-full text-[7.5px] font-bold text-stone-950 shadow-xs"
                      >
                        {activeTab?.mobile_image_url ? 'Móvil Dedicado' : 'Escritorio'}
                      </span>
                    </div>

                    {/* Home indicator */}
                    <div className="w-24 h-1 bg-white/60 rounded-full absolute bottom-2 left-1/2 -translate-x-1/2 z-40 pointer-events-none" />
                  </div>
                </motion.div>
              </div>

              {/* Dots */}
              {heroTabs.length > 1 && (
                <div className="flex items-center justify-center gap-1 mt-4">
                  {heroTabs.map((t, idx) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTabClick(t.id)}
                      className={`transition-all duration-300 rounded-full cursor-pointer ${
                        idx === validIndex
                          ? 'w-5 h-1.5 bg-[#D4AF37]'
                          : 'w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Tríptico Slider 16:9 con Framer Motion (Escritorio) */
            <div className="relative z-10 w-full max-w-5xl mx-auto overflow-hidden py-4 select-none flex items-center justify-center">
              {/* Máscaras de desvanecimiento lateral */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/85 to-transparent z-30" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/85 to-transparent z-30" />

              {/* Flechas Flotantes */}
              {heroTabs.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2 sm:left-4 z-40 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-md text-stone-700 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    aria-label="Diapositiva anterior"
                  >
                    <ChevronLeft className="w-4 h-4 text-stone-700" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2 sm:right-4 z-40 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-md text-stone-700 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
                    aria-label="Siguiente diapositiva"
                  >
                    <ChevronRight className="w-4 h-4 text-stone-700" />
                  </button>
                </>
              )}

              {/* Placeholder de dimensionamiento 16:9 */}
              <div className="w-[82%] md:w-[75%] aspect-video opacity-0 pointer-events-none" />

              {/* Pista de diapositivas */}
              <div className="absolute inset-0 flex items-center justify-center overflow-visible">
                {heroTabs.map((tab, idx) => {
                  const offset = getSlideOffset(idx);
                  const isCenter = offset === 0;
                  const isLeft = offset === -1;
                  const isRight = offset === 1;
                  const isVisible = Math.abs(offset) <= 1;

                  const xPos = isCenter ? "0%" : isRight ? "54%" : isLeft ? "-54%" : offset > 1 ? "120%" : "-120%";

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
                      className={`absolute w-[82%] md:w-[75%] aspect-video rounded-xl md:rounded-2xl overflow-hidden border bg-white ${
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
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center space-y-2 bg-stone-50 select-none">
                          <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center text-stone-400">
                            <Laptop className="w-6 h-6 text-[#D4AF37]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-stone-800">
                              {tab.label ? `Captura de "${tab.label}"` : 'Sin etiqueta'}
                            </h4>
                            <span className="text-[10px] text-stone-400">Sube una imagen 16:9 en el panel izquierdo</span>
                          </div>
                        </div>
                      )}

                      {!isCenter && isVisible && (
                        <div className="absolute inset-0 bg-stone-900/0 hover:bg-stone-900/5 transition-colors flex items-center justify-center pointer-events-none">
                          <span className="bg-white/95 text-stone-800 text-[10px] font-bold px-3 py-1 rounded-full shadow-xs flex items-center gap-1 border border-stone-200">
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
          )}
        </section>

        {/* ── SECCIÓN 2: COMPARATIVA DE MERCADO (PAIN COMPARISON) ── */}
        <section id="preview-pain" className="w-full">
          <PainComparisonSection
            onSelectPlan={() => {}}
            primaryColor={darkColor}
            secondaryColor={surfaceColor}
            tertiaryColor={accentColor}
            data={painComparisonData}
          />
        </section>

        {/* ── SECCIÓN 3: LOS 4 PILARES DEL ECOSISTEMA ── */}
        <section id="preview-pillars" className="w-full">
          <PillarsSection
            primaryColor={darkColor}
            secondaryColor={surfaceColor}
            tertiaryColor={accentColor}
            data={pillarsData}
          />
        </section>

        {/* ── SECCIÓN 4: ANILLO 3D DE SECTORES ── */}
        <section id="preview-sectors" className="w-full">
          <Showcase3DRing
            sectorsToRender={previewSectors && previewSectors.length > 0 ? previewSectors : []}
            activeIndex={previewIndex ?? internalSectorIndex}
            animating={previewAnimating ?? internalSectorAnimating}
            handleNavigate={handleInternalSectorNavigate}
            onConfigureEntorno={() => {}}
            primaryColor={darkColor}
            secondaryColor={surfaceColor}
            tertiaryColor={accentColor}
            isPreview={true}
          />
        </section>

        {/* ── SECCIÓN 5: PRECIOS Y PLANES ── */}
        <section id="preview-pricing" className="w-full">
          <PricingSection
            onSelectPlan={() => {}}
            primaryColor={darkColor}
            secondaryColor={surfaceColor}
            tertiaryColor={accentColor}
          />
        </section>

        {/* ── SECCIÓN 6: FOOTER EDITORIAL ── */}
        <footer id="preview-footer" className="w-full">
          <MarketingFooter
            primaryColor={darkColor}
            tertiaryColor={accentColor}
          />
        </footer>

      </div>
    </div>
  );
}
