"use client";

import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import Showcase3DRing from '@/app/marketing/components/Showcase3DRing';

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
  previewIndex?: number;
  previewAnimating?: boolean;
  handlePreviewNavigate?: (newIndex: number) => void;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  tertiaryColor?: string | null;
  fontFamily?: string | null;
  fontWeightHeadings?: string | null;
  logoSvg?: string | null;
}

export default function Showcase3DPreview({
  heroTitle,
  heroSubtitle,
  heroImage1,
  heroImage2,
  heroImage3,
  previewSectors,
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
            <span>Vista Previa: Simulador en Vivo 3D</span>
          </div>
        </div>
      </div>

      {/* Live Mock Page Body */}
      <div className="flex-1 overflow-y-auto bg-white p-6 relative flex flex-col justify-start min-h-0 space-y-6">

        {/* Mock Landing Header */}
        <div className="flex justify-between items-center border-b border-stone-100 pb-2 mb-1 select-none shrink-0">
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
            <span 
              style={{ backgroundColor: primaryColor || '#1c1917' }}
              className="text-white px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider"
            >
              Entorno Seguro
            </span>
          </div>
        </div>

        {/* Mock Landing Hero Wrapper with Background slideshow & Light Overlay */}
        <div className="relative w-full min-h-[190px] rounded-2xl overflow-hidden border border-stone-200/50 shadow-sm flex flex-col justify-center items-center p-6 text-center select-none shrink-0 bg-stone-50">
          
          {/* Background Rotating Images inside mock Hero */}
          {heroImages.length > 0 && (
            <div className="absolute inset-0 w-full h-full z-0 select-none">
              {heroImages.map((imgUrl, idx) => (
                <img
                  key={idx}
                  src={imgUrl}
                  alt={`Hero Preview ${idx}`}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                    idx === currentHeroImageIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Overlay semi-transparente */}
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10" />

          {/* Hero Content preview */}
          <div className="relative z-20 max-w-xl mx-auto flex flex-col items-center">
            <span 
              style={{ color: tertiaryColor || '#d4af37' }}
              className="text-[8px] font-black uppercase tracking-[0.25em] mb-1.5 preview-sans"
            >
              ESPECIALIDADES
            </span>
            <h1 className="text-sm md:text-base font-serif font-bold text-stone-900 tracking-tight leading-snug drop-shadow-sm mb-1.5 preview-serif text-center">
              {heroTitle || 'La elegancia de tu negocio traducida en un SaaS'}
            </h1>
            <p className="text-[9px] text-stone-600 font-medium max-w-md line-clamp-2 leading-relaxed drop-shadow-sm preview-sans text-center">
              {heroSubtitle || 'Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes.'}
            </p>

            {/* Bottom dots */}
            {heroImages.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-3">
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

        {/* ── ESCENARIO 3D OFICIAL (Mismo componente idéntico a la Landing) ── */}
        <div className="w-full rounded-2xl overflow-hidden border border-stone-200/60 bg-white shadow-sm">
          <Showcase3DRing
            sectorsToRender={previewSectors}
            onConfigureEntorno={() => {}}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            tertiaryColor={tertiaryColor}
            isPreview={true}
          />
        </div>

      </div>
    </div>
  );
}
