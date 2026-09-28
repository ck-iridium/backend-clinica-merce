"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  FileText, 
  Sparkles, 
  ChevronRight, 
  BookOpen, 
  Check, 
  X, 
  ArrowRight, 
  Bot, 
  Calendar, 
  Receipt, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  XCircle,
  Layers,
  Star
} from 'lucide-react';
import OnboardingModal from './components/OnboardingModal';
import Showcase3DRing from './components/Showcase3DRing';
import PricingSection from './components/PricingSection';

export interface Sector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl: string;
  imageUrl?: string;
  placeholderGradient: string;
}

interface MarketingClientPageProps {
  initialSettings: {
    hero_title: string;
    hero_subtitle: string;
    hero_image_1?: string | null;
    hero_image_2?: string | null;
    hero_image_3?: string | null;
    logo_svg: string | null;
    primary_color: string;
    secondary_color: string;
    tertiary_color: string;
    font_family: string;
    font_weight_headings: string;
    favicon_url: string | null;
  };
  initialSectors: Sector[];
}

export default function MarketingClientPage({ initialSettings, initialSectors }: MarketingClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro' | 'gold'>('pro');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [heroTitle, setHeroTitle] = useState(initialSettings.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings.hero_subtitle);
  const [logoSvg, setLogoSvg] = useState<string | null>(initialSettings.logo_svg);
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primary_color || '#1C1917');
  const [secondaryColor, setSecondaryColor] = useState(initialSettings.secondary_color || '#FAF9F6');
  const [tertiaryColor, setTertiaryColor] = useState(initialSettings.tertiary_color || '#D4AF37');
  const [fontFamily, setFontFamily] = useState(initialSettings.font_family || 'playfair_inter');

  // Manejo de la galería rotativa del hero
  const heroImages = [
    initialSettings.hero_image_1,
    initialSettings.hero_image_2,
    initialSettings.hero_image_3
  ].filter(Boolean) as string[];
  const [currentHeroImageIndex, setCurrentHeroImageIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const handleNavigate = (newIndex: number) => {
    if (animating) return;
    setAnimating(true);
    
    setTimeout(() => {
      setActiveIndex(newIndex);
    }, 200);

    setTimeout(() => {
      setAnimating(false);
    }, 600);
  };

  const handleOpenOnboarding = (plan: 'free' | 'basic' | 'pro' | 'gold') => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const weightMap: Record<string, string> = {
    'light': '300',
    'normal': '400',
    'medium': '500',
    'semibold': '600',
    'bold': '700'
  };
  const activeWeight = weightMap[initialSettings.font_weight_headings || 'semibold'] || '600';

  return (
    <div 
      style={{ 
        '--primary-accent': primaryColor,
        '--secondary-accent': secondaryColor,
        '--tertiary-accent': tertiaryColor 
      } as React.CSSProperties}
      className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-[#d4af37]/20 overflow-x-hidden relative transition-colors duration-300"
    >
      
      {/* Inyección dinámica de Google Fonts y Clases Tipográficas */}
      <style dangerouslySetInnerHTML={{ __html: `
        :root {
          --font-serif: ${
            fontFamily === 'playfair_inter' ? "var(--font-playfair-base), 'Playfair Display', serif" :
            fontFamily === 'outfit' ? "var(--font-outfit), 'Outfit', sans-serif" :
            fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "var(--font-cormorant), 'Cormorant Garamond', serif" :
            fontFamily === 'cinzel_roboto' ? "'Cinzel', serif" :
            "var(--font-inter), 'Inter', sans-serif"
          };
          --font-sans: ${
            fontFamily === 'playfair_inter' ? "var(--font-inter), 'Inter', sans-serif" :
            fontFamily === 'outfit' ? "var(--font-outfit), 'Outfit', sans-serif" :
            fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "var(--font-montserrat), 'Montserrat', sans-serif" :
            fontFamily === 'cinzel_roboto' ? "'Roboto', sans-serif" :
            "var(--font-inter), 'Inter', sans-serif"
          };
        }
        
        .font-serif {
          font-family: var(--font-serif) !important;
          font-weight: ${activeWeight} !important;
        }
        
        .font-sans, body, html, button, input, select, textarea {
          font-family: var(--font-sans) !important;
        }
      ` }} />
      
      {/* ── 1. STICKY HEADER EDITORIAL (QUIET LUXURY GLASSMORPHISM) ── */}
      <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-stone-200/60 py-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSvg ? (
              <div 
                className="h-10 flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: logoSvg }}
              />
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl font-serif tracking-widest text-stone-950 font-bold select-none">
                  PROBOOKIA
                </span>
                <span className="bg-[#D4AF37]/15 text-[#997715] text-[9px] font-black tracking-[0.2em] uppercase px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
                  SUITE
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/docs"
              className="hidden md:flex items-center gap-1.5 px-3 py-2 text-stone-500 hover:text-stone-950 text-xs font-bold transition-colors"
            >
              <BookOpen size={14} />
              <span>Blueprint</span>
            </Link>
            <Link 
              href="/login" 
              className="px-4 sm:px-5 py-2.5 rounded-xl text-xs font-bold bg-white text-stone-700 border border-stone-200/80 hover:text-stone-950 hover:bg-stone-50 transition-all duration-200 active:scale-95 shadow-2xs"
            >
              Acceso Clínicas
            </Link>
            <button 
              onClick={() => handleOpenOnboarding('pro')}
              className="bg-stone-900 hover:bg-stone-950 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-95 border border-stone-800 flex items-center gap-1.5"
            >
              <span>Comenzar Ahora</span>
              <ChevronRight size={13} className="text-[#D4AF37]" />
            </button>
          </div>
        </div>
      </header>

      {/* ── 2. HERO SECTION - BOUTIQUE FULL SCREEN ── */}
      <section className="relative min-h-[calc(100vh-80px)] flex flex-col items-center justify-center overflow-hidden bg-[#FAF9F6]">
        
        {/* Full-screen rotating image background */}
        {heroImages.length > 0 && (
          <div className="absolute inset-0 w-full h-full z-0 select-none">
            {heroImages.map((imgUrl, idx) => (
              <img
                key={idx}
                src={imgUrl}
                alt={`Hero Slideshow ${idx}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                  idx === currentHeroImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>
        )}

        {/* Halo ambiental dorado */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#D4AF37]/8 rounded-full blur-[140px] pointer-events-none z-10" />

        {/* Premium light overlay with very soft blur to guarantee complete text legibility */}
        <div className="absolute inset-0 bg-[#FAF9F6]/85 backdrop-blur-[3px] z-10"></div>

        {/* Hero Content Layer */}
        <div className="max-w-7xl mx-auto px-6 py-20 relative z-20 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000 flex flex-col justify-center items-center">
          <div className="inline-flex items-center gap-2 bg-white/95 border border-[#D4AF37]/30 text-[#997715] px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-8 shadow-sm backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>EL NUEVO ESTÁNDAR TODO-EN-UNO PARA CLÍNICAS SELECTAS</span>
          </div>
          
          <h1 
            className="text-4xl md:text-7xl font-serif font-bold text-stone-950 tracking-tight leading-[1.15] max-w-5xl mx-auto mb-8 filter drop-shadow-sm"
            dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, '<br/>') }}
          />
          
          <p className="text-base md:text-lg text-stone-600 font-medium max-w-2xl mx-auto mb-10 leading-relaxed filter drop-shadow-sm">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
            <button 
              onClick={() => handleOpenOnboarding('pro')}
              className="w-full sm:w-auto bg-stone-950 hover:bg-black text-white px-8 py-4 rounded-2xl text-xs font-bold shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95 hover:scale-[1.02] border border-[#D4AF37]/30"
            >
              <span>Comenzar Prueba Gratuita</span>
              <ChevronRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#pilares" 
              className="w-full sm:w-auto bg-white/90 backdrop-blur-sm border border-stone-200/80 hover:bg-stone-100 text-stone-800 px-8 py-4 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center hover:scale-[1.02] shadow-sm"
            >
              Explorar los 4 Pilares
            </a>
          </div>

          {/* Micro badges de confianza en el hero */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12 text-[11px] font-semibold text-stone-500">
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

          {/* Carousel Dot indicators */}
          {heroImages.length > 1 && (
            <div className="flex justify-center gap-2 mt-12 select-none z-20">
              {heroImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentHeroImageIndex(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    idx === currentHeroImageIndex 
                      ? 'bg-stone-950 scale-125 shadow-sm' 
                      : 'bg-stone-950/20 hover:bg-stone-950/40'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── 3. SECCIÓN: EL DOLOR DE LA FRAGMENTACIÓN VS PROBOOKIA TODO-EN-UNO ── */}
      <section className="py-24 bg-white border-y border-stone-200/60 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[#997715] text-[10px] font-black uppercase tracking-[0.25em] block mb-2">El Dolor del Mercado</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-stone-950">
              ¿Por qué pagar 5 programas si puedes tenerlo todo en uno?
            </h2>
            <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
              La mayoría de clínicas sufren un caos de contraseñas, datos desincronizados y sobrecostes mensuales. ProBookia unifica todo el ecosistema.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
            
            {/* Tarjeta Izquierda: El Caos Actual */}
            <div className="bg-stone-50/70 rounded-3xl border border-stone-200/80 p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 text-stone-400 mb-6">
                  <XCircle size={20} className="text-red-400 shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-stone-500">El Modelo Antiguo y Fragmentado</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-6">Herramientas Dispersas</h3>
                
                <ul className="space-y-4 text-xs font-medium text-stone-600">
                  <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <span>Web + Hosting + Mantenimiento (WordPress)</span>
                    <span className="font-mono font-bold text-stone-800">~40€/mes</span>
                  </li>
                  <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <span>Motor de reservas online (Fresha / Treatwell)</span>
                    <span className="font-mono font-bold text-stone-800">~50€/mes + comisiones</span>
                  </li>
                  <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <span>Software médico LOPD & Consentimientos en papel</span>
                    <span className="font-mono font-bold text-stone-800">~70€/mes</span>
                  </li>
                  <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <span>TPV de mostrador y facturación separada</span>
                    <span className="font-mono font-bold text-stone-800">~30€/mes</span>
                  </li>
                  <li className="flex items-center justify-between pb-3 border-b border-stone-200/60">
                    <span>Copiloto de IA o redacción externa</span>
                    <span className="font-mono font-bold text-stone-800">~30€/mes</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Gasto Medio Mensual</span>
                  <span className="text-2xl font-serif font-bold text-red-500">220€/mes</span>
                </div>
                <span className="text-xs text-stone-500 font-medium max-w-[200px] text-right">
                  + Pérdida de tiempo en 5 inicios de sesión distintos.
                </span>
              </div>
            </div>

            {/* Tarjeta Derecha: La Solución ProBookia */}
            <div className="bg-stone-950 text-white rounded-3xl border-2 border-[#D4AF37] p-8 flex flex-col justify-between shadow-xl relative overflow-hidden ring-4 ring-[#D4AF37]/10">
              <div className="absolute top-0 right-0 bg-gradient-to-r from-[#D4AF37] to-[#bf9b30] text-stone-950 px-3.5 py-1 rounded-bl-2xl text-[9px] font-black uppercase tracking-widest">
                Suite Todo-en-Uno
              </div>

              <div>
                <div className="flex items-center gap-2.5 text-[#D4AF37] mb-6">
                  <CheckCircle2 size={20} className="text-[#D4AF37] shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D4AF37]">La Solución Unificada</span>
                </div>
                <h3 className="text-2xl font-serif font-bold text-white mb-6">ProBookia Suite</h3>

                <ul className="space-y-4 text-xs font-medium text-stone-300">
                  <li className="flex items-center gap-3 pb-3 border-b border-stone-800">
                    <Check size={16} className="text-[#D4AF37] shrink-0" />
                    <span><strong>Web de Lujo con CMS:</strong> Edita fotos, vídeos y catálogo en minutos.</span>
                  </li>
                  <li className="flex items-center gap-3 pb-3 border-b border-stone-800">
                    <Check size={16} className="text-[#D4AF37] shrink-0" />
                    <span><strong>Reservas 24/7 sin comisiones:</strong> Fianza anti-plantones Stripe Connect.</span>
                  </li>
                  <li className="flex items-center gap-3 pb-3 border-b border-stone-800">
                    <Check size={16} className="text-[#D4AF37] shrink-0" />
                    <span><strong>Fichas LOPD & Consentimientos:</strong> Firma manuscrita en tablet/móvil.</span>
                  </li>
                  <li className="flex items-center gap-3 pb-3 border-b border-stone-800">
                    <Check size={16} className="text-[#D4AF37] shrink-0" />
                    <span><strong>Caja TPV & Facturas PDF:</strong> Cobro express por Bizum, tarjeta y bonos.</span>
                  </li>
                  <li className="flex items-center gap-3 pb-3 border-b border-stone-800">
                    <Check size={16} className="text-[#D4AF37] shrink-0" />
                    <span><strong>Copiloto IA Integrado:</strong> Asistente en tu base de datos para redactar y gestionar.</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-6 border-t border-stone-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#D4AF37] tracking-wider block">Todo Incluido Desde</span>
                  <span className="text-3xl font-serif font-bold text-white">29€/mes</span>
                </div>
                <button
                  onClick={() => handleOpenOnboarding('pro')}
                  className="bg-[#D4AF37] hover:bg-[#c29e2f] text-stone-950 font-bold px-5 py-2.5 rounded-xl text-xs shadow-md transition-all active:scale-95 flex items-center gap-1"
                >
                  <span>Probar Gratis</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 4. LOS 4 PILARES DEL ECOSISTEMA PROBOOKIA (BENTO GRID DE LUJO) ── */}
      <section id="pilares" className="py-28 bg-[#FAF9F6]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[#997715] text-[10px] font-black uppercase tracking-[0.25em] block mb-2">Arquitectura de Producto</span>
            <h2 className="text-3xl md:text-5xl font-serif font-bold tracking-tight text-stone-950">
              Los 4 Pilares del Ecosistema
            </h2>
            <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
              Todo lo que una clínica de alta gama necesita para operar con la máxima sofisticación y cero fricción técnica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
            
            {/* Pilar 1 */}
            <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] mb-6">
                  <Globe size={22} strokeWidth={1.75} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#997715] block mb-1">Pilar 01</span>
                <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">Presencia Web de Lujo</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  CMS visual modular sin tocar código. Catálogo de tratamientos con fotos y tiempos de cabina, vídeos de alta definición, páginas personalizadas y SEO automático.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
                Tu marca propia en el centro
              </div>
            </div>

            {/* Pilar 2 */}
            <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 flex items-center justify-center text-emerald-600 mb-6">
                  <Calendar size={22} strokeWidth={1.75} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 block mb-1">Pilar 02</span>
                <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">Motor de Reservas 24/7</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  El paciente reserva desde su smartphone a cualquier hora en 3 pasos. Depósito o fianza anti-plantones obligatoria con Stripe Connect para erradicar las incomparecencias.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
                Cero ausencias no avisadas
              </div>
            </div>

            {/* Pilar 3 */}
            <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-700 mb-6">
                  <Receipt size={22} strokeWidth={1.75} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block mb-1">Pilar 03</span>
                <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">ERP, Legalidad & Caja</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  Fichas médicas con firma manuscrita LOPD sin papel, TPV express de mostrador para cobros por Bizum/tarjeta, facturación correlativa y emisión de bonos multisesión.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
                100% Blindaje legal y fiscal
              </div>
            </div>

            {/* Pilar 4 */}
            <div className="bg-white rounded-3xl p-7 border border-stone-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#1C1917] border border-stone-800 flex items-center justify-center text-[#D4AF37] mb-6">
                  <Bot size={22} strokeWidth={1.75} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-900 block mb-1">Pilar 04</span>
                <h3 className="text-xl font-serif font-bold text-stone-950 mb-3">AI Webmaster Copilot</h3>
                <p className="text-xs text-stone-500 leading-relaxed font-medium">
                  Tu asistente con inteligencia artificial integrado en tu base de datos. Redacta descripciones de tratamientos, traduce contenidos y ayuda a tu equipo en la operativa diaria.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-stone-100 text-[11px] font-bold text-stone-700">
                Inteligencia sin esfuerzo
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 5. SECCIÓN DE SECTORES EN ANILLO 3D REAL ── */}
      <Showcase3DRing
        sectorsToRender={sectors}
        activeIndex={activeIndex}
        animating={animating}
        handleNavigate={handleNavigate}
        onConfigureEntorno={handleOpenOnboarding}
      />

      {/* ── 6. SECCIÓN DE PRECIOS EDITORIALES (REDISEÑADA) ── */}
      <PricingSection onSelectPlan={handleOpenOnboarding} />

      {/* ── 7. FOOTER QUIET LUXURY ── */}
      <footer className="bg-stone-950 text-white py-16 border-t border-stone-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-stone-900 pb-12 mb-12">
          <div>
            <span className="text-xl font-serif tracking-widest text-white block mb-2 font-bold">PROBOOKIA SUITE</span>
            <p className="text-stone-400 text-xs md:text-sm max-w-sm leading-relaxed font-medium">
              La plataforma invisible de alta gama para presencia web, reservas online, expedientes médicos, facturación y TPV en centros selectos.
            </p>
          </div>
          <div className="flex gap-8 text-xs font-bold text-stone-400">
            <Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link>
            <Link href="/aviso-legal" className="hover:text-white transition-colors">Aviso Legal</Link>
            <Link href="/docs" className="hover:text-white transition-colors">VIP Blueprint Docs</Link>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 text-center text-xs text-stone-600 font-semibold">
          &copy; {new Date().getFullYear()} ProBookia. Todos los derechos reservados. SaaS Quiet Luxury B2B.
        </div>
      </footer>

      {/* ── 8. ONBOARDING REGISTRATION MODAL ── */}
      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
        apiUrl={API_URL}
      />

    </div>
  );
}
