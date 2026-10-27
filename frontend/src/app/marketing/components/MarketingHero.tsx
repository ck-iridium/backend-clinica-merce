'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ChevronLeft, Sparkles, CheckCircle2 } from 'lucide-react';

export interface HeroTab {
  id: string;
  label: string;
  image_url?: string;
}

interface MarketingHeroProps {
  heroTitle: string;
  heroSubtitle: string;
  heroTabs: HeroTab[];
  primaryColor: string;
  tertiaryColor: string;
  onOpenOnboarding: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
}

export default function MarketingHero({
  heroTitle,
  heroSubtitle,
  heroTabs,
  primaryColor,
  tertiaryColor,
  onOpenOnboarding
}: MarketingHeroProps) {
  const [activeHeroTabId, setActiveHeroTabId] = useState<string>(heroTabs?.[0]?.id || 'tab-agenda');
  const [isSliderPaused, setIsSliderPaused] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Asegurar que activeHeroTabId sea válido si cambian los tabs
  useEffect(() => {
    if (heroTabs && heroTabs.length > 0 && !heroTabs.some(t => t.id === activeHeroTabId)) {
      setActiveHeroTabId(heroTabs[0].id);
    }
  }, [heroTabs, activeHeroTabId]);

  const currentTabs = heroTabs && heroTabs.length > 0 ? heroTabs : [];
  const currentTabIndex = currentTabs.findIndex((t) => t.id === activeHeroTabId);
  const heroActiveIndex = currentTabIndex >= 0 ? currentTabIndex : 0;

  const handleNextSlide = () => {
    if (currentTabs.length <= 1) return;
    const nextIdx = (heroActiveIndex + 1) % currentTabs.length;
    setActiveHeroTabId(currentTabs[nextIdx].id);
  };

  const handlePrevSlide = () => {
    if (currentTabs.length <= 1) return;
    const prevIdx = (heroActiveIndex - 1 + currentTabs.length) % currentTabs.length;
    setActiveHeroTabId(currentTabs[prevIdx].id);
  };

  const handleSelectTab = (tabId: string) => {
    setActiveHeroTabId(tabId);
  };

  // Autoplay pausado al interactuar o pasar el cursor
  useEffect(() => {
    if (isSliderPaused || currentTabs.length <= 1) return;
    const interval = setInterval(() => {
      const nextIdx = (heroActiveIndex + 1) % currentTabs.length;
      setActiveHeroTabId(currentTabs[nextIdx].id);
    }, 6000);
    return () => clearInterval(interval);
  }, [isSliderPaused, currentTabs.length, heroActiveIndex]);

  const getSlideOffset = (index: number) => {
    let diff = index - heroActiveIndex;
    while (diff > currentTabs.length / 2) diff -= currentTabs.length;
    while (diff < -currentTabs.length / 2) diff += currentTabs.length;
    return diff;
  };

  return (
    <section className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-start overflow-hidden bg-[#FAF9F6] pt-12 pb-24">
      {/* Halo ambiental dorado */}
      <div
        style={{ backgroundColor: tertiaryColor || '#D4AF37' }}
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[720px] h-[380px] rounded-full blur-[140px] opacity-15 pointer-events-none z-10"
      />

      {/* Hero Content Layer */}
      <div className="max-w-7xl mx-auto px-6 relative z-20 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000 flex flex-col justify-center items-center w-full">
        {/* Main Title */}
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-stone-950 tracking-tight leading-[1.12] max-w-5xl mx-auto mb-6 filter drop-shadow-xs"
          dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, '<br/>') }}
        />

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-stone-600 font-sans font-medium max-w-2xl mx-auto mb-8 leading-relaxed filter drop-shadow-xs">
          {heroSubtitle}
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto mb-8">
          <button
            onClick={() => onOpenOnboarding('pro')}
            style={{ backgroundColor: primaryColor || '#1c1917' }}
            className="w-full sm:w-auto text-white px-8 py-4 rounded-2xl text-xs font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95 hover:scale-[1.02] border border-white/20"
          >
            <span>Comenzar Prueba Gratuita</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" style={{ color: tertiaryColor || '#D4AF37' }} />
          </button>
          <a
            href="#pilares"
            className="w-full sm:w-auto bg-white/90 backdrop-blur-sm border border-stone-200/80 hover:bg-stone-100 text-stone-800 px-8 py-4 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center hover:scale-[1.02] shadow-sm"
          >
            Explorar los 4 Pilares
          </a>
        </div>

        {/* ── INTERACTIVE TABS ROW (Estilo Pabau) ── */}
        {currentTabs.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 my-4 z-20">
            {currentTabs.map((tab) => {
              const isSelected = ((currentTabs.find((t) => t.id === activeHeroTabId) || currentTabs[0])?.id === tab.id);
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleSelectTab(tab.id)}
                  style={isSelected ? {
                    backgroundColor: primaryColor || '#1c1917',
                    color: '#ffffff',
                    borderColor: primaryColor || '#1c1917'
                  } : undefined}
                  className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 shadow-xs border ${isSelected
                      ? 'shadow-lg scale-105 ring-2 ring-[#D4AF37]/30'
                      : 'bg-white/95 text-stone-600 border-stone-200/90 hover:border-stone-300 hover:text-stone-950 hover:bg-stone-50'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 16:9 SHOWCASE TRÍPTICO SLIDER PROFESIONAL CON FRAMER MOTION ── */}
      <div
        onMouseEnter={() => setIsSliderPaused(true)}
        onMouseLeave={() => setIsSliderPaused(false)}
        className="w-full relative overflow-hidden py-4 sm:py-8 mt-4 z-20 flex items-center justify-center select-none"
      >
        {/* Máscara de desvanecimiento lateral izquierda (Quiet Luxury edge blend) */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-20 sm:w-36 md:w-56 lg:w-72 bg-gradient-to-r from-[#FAF9F6] via-[#FAF9F6]/85 to-transparent z-30" />

        {/* Máscara de desvanecimiento lateral derecha */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-20 sm:w-36 md:w-56 lg:w-72 bg-gradient-to-l from-[#FAF9F6] via-[#FAF9F6]/85 to-transparent z-30" />

        {/* Flecha Flotante Izquierda */}
        {currentTabs.length > 1 && (
          <button
            type="button"
            onClick={handlePrevSlide}
            className="absolute left-4 sm:left-8 md:left-12 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-lg text-stone-700 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft className="w-5 h-5 text-stone-700 group-hover:-translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Flecha Flotante Derecha */}
        {currentTabs.length > 1 && (
          <button
            type="button"
            onClick={handleNextSlide}
            className="absolute right-4 sm:right-8 md:right-12 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md border border-stone-200/80 shadow-lg text-stone-700 hover:text-stone-950 hover:scale-105 active:scale-95 transition-all flex items-center justify-center group"
            aria-label="Siguiente diapositiva"
          >
            <ChevronRight className="w-5 h-5 text-stone-700 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}

        {/* Elemento de dimensionamiento responsivo 16:9 */}
        <div className="w-[84vw] max-w-[860px] aspect-video opacity-0 pointer-events-none" />

        {/* Escenario de diapositivas animadas con física de deslizamiento */}
        <div className="absolute inset-0 flex items-center justify-center overflow-visible">
          {currentTabs.map((tab, idx) => {
            const offset = getSlideOffset(idx);
            const isCenter = offset === 0;
            const isLeft = offset === -1;
            const isRight = offset === 1;
            const isVisible = Math.abs(offset) <= 1;

            const xPos = isCenter ? "0%" : isRight ? "56%" : isLeft ? "-56%" : offset > 1 ? "130%" : "-130%";

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
                drag={isCenter ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.25}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(_, { offset: dragOffset, velocity }) => {
                  setTimeout(() => setIsDragging(false), 50);
                  if (dragOffset.x < -50 || velocity.x < -300) {
                    handleNextSlide();
                  } else if (dragOffset.x > 50 || velocity.x > 300) {
                    handlePrevSlide();
                  }
                }}
                onClick={() => {
                  if (isDragging) return;
                  if (isLeft) handlePrevSlide();
                  if (isRight) handleNextSlide();
                }}
                className={`absolute w-[84vw] max-w-[860px] aspect-video rounded-2xl md:rounded-3xl overflow-hidden border bg-white ${isCenter
                    ? 'border-stone-200/90 shadow-[0_25px_65px_-15px_rgba(0,0,0,0.14)] ring-1 ring-stone-900/5 cursor-grab active:cursor-grabbing'
                    : isVisible
                      ? 'border-stone-200/80 shadow-lg cursor-pointer'
                      : 'pointer-events-none'
                  }`}
                style={{ willChange: 'transform, opacity' }}
              >
                {tab.image_url ? (
                  <img
                    src={tab.image_url}
                    alt={tab.label}
                    className="w-full h-full object-cover pointer-events-none select-none"
                    draggable={false}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-3 bg-stone-50 select-none">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center text-stone-400">
                      <Sparkles className="w-8 h-8 text-[#D4AF37]" />
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-stone-800">
                        {tab.label ? `Módulo ${tab.label}` : 'Módulo'}
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm mt-1 leading-relaxed">
                        Captura del módulo disponible en la plataforma de gestión Probookia.
                      </p>
                    </div>
                  </div>
                )}

                {/* Indicador de acción en hover para tarjetas laterales */}
                {!isCenter && isVisible && (
                  <div className="absolute inset-0 bg-stone-900/0 hover:bg-stone-900/5 transition-colors flex items-center justify-center pointer-events-none">
                    <span className="bg-white/95 text-stone-800 text-xs font-bold px-3.5 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-stone-200">
                      {isLeft && <ChevronLeft className="w-3.5 h-3.5" />}
                      <span>{tab.label}</span>
                      {isRight && <ChevronRight className="w-3.5 h-3.5" />}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Micro badges de confianza en el pie del hero */}
      <div className="max-w-5xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6 mt-10 text-[11px] font-semibold text-stone-500 relative z-20">
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-[#D4AF37]" /> Sin permanencia ni comisiones
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-[#D4AF37]" /> Fianza anti-plantones Stripe
        </span>
        <span className="flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-[#D4AF37]" /> Fichas médicas con firma LOPD
        </span>
      </div>
    </section>
  );
}
