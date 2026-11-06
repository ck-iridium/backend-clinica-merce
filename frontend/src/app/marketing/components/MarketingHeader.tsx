'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, Menu, X, ArrowUpRight } from 'lucide-react';

interface MarketingHeaderProps {
  logoSvg: string | null;
  primaryColor: string;
  tertiaryColor: string;
  onOpenOnboarding: (plan: 'free' | 'basic' | 'pro' | 'gold') => void;
}

const NAV_ITEMS = [
  { label: 'Características', id: 'comparativa' },
  { label: 'Pilares', id: 'pilares' },
  { label: 'Sectores', id: 'sectores' },
  { label: 'Precios', id: 'precios' },
];

export default function MarketingHeader({
  logoSvg,
  primaryColor,
  tertiaryColor,
  onOpenOnboarding
}: MarketingHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Escucha del scroll: Al inicio es 100% transparente para fundirse con el fondo crema del hero.
  // Al hacer scroll adquiere un fondo blanco translúcido con glassmorphism suave.
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Bloquear scroll de la página cuando el menú móvil fullscreen esté abierto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const handleScrollTo = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleScrollToTop = () => {
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const accentGold = tertiaryColor || '#D4AF37';
  const brandDark = primaryColor || '#1C1917';

  return (
    <>
      {/* Estilo dinámico para aplicar el color primario como fondo en HOVER con texto blanco */}
      <style dangerouslySetInnerHTML={{ __html: `
        .luxury-nav-item {
          transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease;
        }
        .luxury-nav-item:hover {
          background-color: ${brandDark} !important;
          color: #ffffff !important;
        }
        .luxury-nav-item:hover * {
          color: #ffffff !important;
        }
        .luxury-mobile-item {
          transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1), color 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.15s ease;
        }
        .luxury-mobile-item:hover,
        .luxury-mobile-item:active {
          background-color: ${brandDark} !important;
          color: #ffffff !important;
        }
        .luxury-mobile-item:hover *,
        .luxury-mobile-item:active * {
          color: #ffffff !important;
        }
      `}} />

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ${
          isScrolled
            ? 'bg-white/90 backdrop-blur-md border-b border-stone-200/40 shadow-xs py-0.5'
            : 'bg-[#FAF9F6]/90 backdrop-blur-md border-b border-transparent py-1.5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          {/* Logo (Compacto y nítido) */}
          <div
            onClick={handleScrollToTop}
            className="flex items-center gap-2 cursor-pointer select-none group shrink-0"
          >
            {logoSvg ? (
              <div
                className="h-7 sm:h-9 md:h-10 max-w-[140px] sm:max-w-[180px] flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto transition-transform duration-200 group-hover:scale-102"
                dangerouslySetInnerHTML={{ __html: logoSvg }}
              />
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="text-lg sm:text-xl md:text-2xl font-serif tracking-widest text-stone-950 font-bold">
                  PROBOOKIA
                </span>
                <span
                  style={{
                    backgroundColor: `${accentGold}20`,
                    color: accentGold,
                    borderColor: `${accentGold}40`
                  }}
                  className="text-[8px] sm:text-[9px] font-black tracking-[0.2em] uppercase px-1.5 sm:px-2 py-0.5 rounded-full border"
                >
                  SUITE
                </span>
              </div>
            )}
          </div>

          {/* Desktop Navigation (Hover con fondo primario dinámico y texto blanco) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-1.5">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleScrollTo(item.id)}
                className="luxury-nav-item px-3.5 py-2 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer"
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/docs"
              className="luxury-nav-item flex items-center gap-1.5 px-3.5 py-2 text-stone-700 text-xs font-semibold rounded-xl cursor-pointer"
            >
              <BookOpen size={13} className="text-stone-400" />
              <span>Blueprint</span>
            </Link>
          </nav>

          {/* Actions: Desktop vs Mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-white text-stone-700 border border-stone-200/80 hover:text-stone-950 hover:bg-stone-50 transition-all duration-200 active:scale-95 shadow-2xs whitespace-nowrap"
              >
                Iniciar Sesión
              </Link>
              <button
                onClick={() => onOpenOnboarding('pro')}
                style={{ backgroundColor: brandDark }}
                className="hover:opacity-95 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-white/20 flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
              >
                <span>Comenzar Ahora</span>
                <ChevronRight size={13} style={{ color: accentGold }} />
              </button>
            </div>

            {/* Mobile Actions: CTA rápido + Botón Hamburguesa */}
            <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => onOpenOnboarding('pro')}
                style={{ backgroundColor: brandDark }}
                className="text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] font-bold shadow-xs transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <span>Comenzar</span>
                <ChevronRight size={11} style={{ color: accentGold }} />
              </button>

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"}
                className="p-2 rounded-xl text-stone-800 hover:bg-white/60 transition-colors focus:outline-none cursor-pointer"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── MOBILE FULL SCREEN MENU OVERLAY ── */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF9F6] flex flex-col justify-between p-6 sm:p-8 animate-in fade-in duration-300 md:hidden select-none overflow-y-auto">
          {/* Halo ambiental translúcido decorativo */}
          <div
            style={{ backgroundColor: accentGold }}
            className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] opacity-15 pointer-events-none"
          />

          {/* Top Bar del Menú Fullscreen */}
          <div className="flex items-center justify-between border-b border-stone-200/50 pb-4 relative z-10 shrink-0">
            <div
              onClick={handleScrollToTop}
              className="flex items-center gap-2 cursor-pointer"
            >
              {logoSvg ? (
                <div
                  className="h-7 max-w-[130px] flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto"
                  dangerouslySetInnerHTML={{ __html: logoSvg }}
                />
              ) : (
                <span className="text-lg font-serif font-bold tracking-widest text-stone-950">
                  PROBOOKIA
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Cerrar menú"
              className="w-10 h-10 rounded-full bg-white hover:bg-stone-100 text-stone-700 flex items-center justify-center transition-all active:scale-95 cursor-pointer shadow-2xs border border-stone-200/60"
            >
              <X size={20} />
            </button>
          </div>

          {/* Listado de Enlaces de Navegación Fullscreen con Efecto Quiet Luxury */}
          <div className="my-auto py-6 space-y-1 relative z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 block mb-3 px-3">
              Navegación
            </span>

            {/* 01. Inicio */}
            <button
              type="button"
              onClick={handleScrollToTop}
              className="luxury-mobile-item w-full flex items-center justify-between py-3.5 px-3 rounded-xl border-b border-stone-200/40 text-left group transition-all cursor-pointer"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] font-mono text-stone-400">01</span>
                <span className="text-2xl font-serif font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
                  Inicio
                </span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </button>

            {/* 02. Características */}
            <button
              type="button"
              onClick={() => handleScrollTo('comparativa')}
              className="luxury-mobile-item w-full flex items-center justify-between py-3.5 px-3 rounded-xl border-b border-stone-200/40 text-left group transition-all cursor-pointer"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] font-mono text-stone-400">02</span>
                <span className="text-2xl font-serif font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
                  Características
                </span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </button>

            {/* 03. Pilares */}
            <button
              type="button"
              onClick={() => handleScrollTo('pilares')}
              className="luxury-mobile-item w-full flex items-center justify-between py-3.5 px-3 rounded-xl border-b border-stone-200/40 text-left group transition-all cursor-pointer"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] font-mono text-stone-400">03</span>
                <span className="text-2xl font-serif font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
                  Pilares
                </span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </button>

            {/* 04. Sectores */}
            <button
              type="button"
              onClick={() => handleScrollTo('sectores')}
              className="luxury-mobile-item w-full flex items-center justify-between py-3.5 px-3 rounded-xl border-b border-stone-200/40 text-left group transition-all cursor-pointer"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] font-mono text-stone-400">04</span>
                <span className="text-2xl font-serif font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
                  Sectores
                </span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </button>

            {/* 05. Precios */}
            <button
              type="button"
              onClick={() => handleScrollTo('precios')}
              className="luxury-mobile-item w-full flex items-center justify-between py-3.5 px-3 rounded-xl border-b border-stone-200/40 text-left group transition-all cursor-pointer"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] font-mono text-stone-400">05</span>
                <span className="text-2xl font-serif font-bold text-stone-900 group-hover:translate-x-1 transition-transform">
                  Planes & Precios
                </span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </button>

            {/* 06. Blueprint Docs */}
            <Link
              href="/docs"
              onClick={() => setIsMobileMenuOpen(false)}
              className="luxury-mobile-item w-full flex items-center justify-between py-3.5 px-3 rounded-xl text-left group transition-all"
            >
              <div className="flex items-baseline gap-3">
                <span className="text-[11px] font-mono text-stone-400">06</span>
                <span className="text-2xl font-serif font-bold text-stone-900 group-hover:translate-x-1 transition-transform flex items-center gap-2">
                  <span>Blueprint Docs</span>
                  <ArrowUpRight size={16} className="text-stone-400" />
                </span>
              </div>
              <ChevronRight size={18} className="text-stone-400" />
            </Link>
          </div>

          {/* Bottom Actions del Menú Fullscreen */}
          <div className="pt-4 border-t border-stone-200/50 space-y-3 relative z-10 shrink-0">
            <Link
              href="/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3.5 bg-white border border-stone-200/90 rounded-2xl text-xs font-bold text-stone-800 flex items-center justify-center hover:bg-stone-50 transition-all shadow-2xs active:scale-98"
            >
              Iniciar Sesión
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onOpenOnboarding('pro');
              }}
              style={{ backgroundColor: brandDark }}
              className="w-full py-4 text-white rounded-2xl text-xs font-bold shadow-lg flex items-center justify-center gap-2 hover:opacity-95 transition-all active:scale-98 border border-white/20 cursor-pointer"
            >
              <span>Comenzar Prueba Gratuita</span>
              <ChevronRight size={14} style={{ color: accentGold }} />
            </button>

            <p className="text-center text-[10px] text-stone-400 font-medium">
              Probookia Suite · Plataforma All-in-One para Clínicas y Negocios
            </p>
          </div>
        </div>
      )}
    </>
  );
}
