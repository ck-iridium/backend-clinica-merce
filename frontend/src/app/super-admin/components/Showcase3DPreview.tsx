"use client";

import { useState, useEffect } from 'react';
import { Monitor, Star, Sparkles, ChevronRight, Laptop, Layers } from 'lucide-react';

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

  const handleTabClick = (tabId: string) => {
    setInternalActiveId(tabId);
    onSelectHeroTab?.(tabId);
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
        .preview-serif {
          font-family: ${fontFamily === 'playfair_inter' ? "var(--font-playfair-base), 'Playfair Display', serif" :
            fontFamily === 'outfit' ? "var(--font-outfit), 'Outfit', sans-serif" :
              fontFamily === 'fredoka' ? "var(--font-fredoka), 'Fredoka', cursive, sans-serif" :
                fontFamily === 'cormorant_montserrat' ? "var(--font-cormorant), 'Cormorant Garamond', serif" :
                  fontFamily === 'cinzel_roboto' ? "'Cinzel', serif" :
                    "var(--font-inter), 'Inter', sans-serif"
          } !important;
          font-weight: ${activeWeight} !important;
        }
        .preview-sans {
          font-family: ${fontFamily === 'playfair_inter' ? "var(--font-inter), 'Inter', sans-serif" :
            fontFamily === 'outfit' ? "var(--font-outfit), 'Outfit', sans-serif" :
              fontFamily === 'fredoka' ? "var(--font-fredoka), 'Fredoka', cursive, sans-serif" :
                fontFamily === 'cormorant_montserrat' ? "var(--font-montserrat), 'Montserrat', sans-serif" :
                  fontFamily === 'cinzel_roboto' ? "'Roboto', sans-serif" :
                    "var(--font-inter), 'Inter', sans-serif"
          } !important;
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

          {/* C. ABAJO: CONTENEDOR GRANDE (FORMATO 16:9) */}
          <div className="relative z-10 w-full max-w-4xl mx-auto mt-2">
            <div className="aspect-video w-full rounded-2xl md:rounded-3xl border border-stone-200/80 shadow-[0_20px_50px_rgba(0,0,0,0.06)] bg-white overflow-hidden flex flex-col transition-all duration-300">
              
              {/* Marco superior tipo ventana de app */}
              <div className="h-8 bg-stone-100/90 border-b border-stone-200/60 px-4 flex items-center justify-between shrink-0 select-none">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
                </div>
                <div className="text-[10px] font-mono text-stone-400 truncate max-w-xs">
                  Probookia Suite · {activeTab?.label || 'Vista Previa'}
                </div>
                <div className="w-8"></div>
              </div>

              {/* Visor de captura o estado vacío */}
              <div className="relative flex-1 w-full h-full bg-stone-50 flex items-center justify-center overflow-hidden">
                {activeTab?.image_url ? (
                  <img
                    key={activeTab.id}
                    src={activeTab.image_url}
                    alt={activeTab.label}
                    className="w-full h-full object-cover transition-opacity duration-300 ease-out animate-in fade-in"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-stone-200/80 shadow-2xs flex items-center justify-center text-stone-400">
                      <Laptop className="w-7 h-7 text-stone-300" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-stone-800">
                        {activeTab ? `Captura para "${activeTab.label}"` : 'Sin pestañas creadas'}
                      </h4>
                      <p className="text-[10px] text-stone-400 max-w-xs mt-1 leading-relaxed">
                        Sube una captura de pantalla en formato 16:9 en el panel izquierdo para verla reflejada aquí en tiempo real.
                      </p>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
