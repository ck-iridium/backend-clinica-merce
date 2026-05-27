"use client"

import { useState } from 'react';
import Link from 'next/link';
import { Shield, FileText, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
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
    logo_svg: string | null;
    primary_color: string;
    secondary_color: string;
    tertiary_color: string;
    font_family: string;
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
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primary_color);
  const [secondaryColor, setSecondaryColor] = useState(initialSettings.secondary_color);
  const [tertiaryColor, setTertiaryColor] = useState(initialSettings.tertiary_color);
  const [fontFamily, setFontFamily] = useState(initialSettings.font_family);

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

  return (
    <div 
      style={{ 
        '--primary-accent': primaryColor,
        '--secondary-accent': secondaryColor,
        '--tertiary-accent': tertiaryColor 
      } as React.CSSProperties}
      className="min-h-screen bg-white text-stone-900 font-sans selection:bg-[#d4af37]/20 overflow-x-hidden relative transition-colors duration-300"
    >
      
      {/* Inyección dinámica de Google Fonts y Clases Tipográficas */}
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&family=Outfit:wght@100..900&family=Fredoka:wght@300..700&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Montserrat:wght@100..900&family=Cinzel:wght@400..900&family=Roboto:wght@100..900&display=swap');
        
        :root {
          --font-serif: ${
            fontFamily === 'playfair_inter' ? "'Playfair Display', serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
            fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "'Cormorant Garamond', serif" :
            fontFamily === 'cinzel_roboto' ? "'Cinzel', serif" :
            "'Inter', sans-serif"
          };
          --font-sans: ${
            fontFamily === 'playfair_inter' ? "'Inter', sans-serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
            fontFamily === 'fredoka' ? "'Fredoka', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "'Montserrat', sans-serif" :
            fontFamily === 'cinzel_roboto' ? "'Roboto', sans-serif" :
            "'Inter', sans-serif"
          };
        }
        
        .font-serif {
          font-family: var(--font-serif) !important;
        }
        
        .font-sans, body, html, button, input, select, textarea {
          font-family: var(--font-sans) !important;
        }
      ` }} />
      
      {/* 1. STICKY HEADER EDITORIAL */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-stone-100 py-1 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logoSvg ? (
              <div 
                className="h-10 flex items-center justify-start [&>svg]:h-full [&>svg]:w-auto"
                dangerouslySetInnerHTML={{ __html: logoSvg }}
              />
            ) : (
              <span className="text-xl md:text-2.5xl font-serif tracking-widest text-stone-950 font-semibold select-none">
                PROBOOKIA <span style={{ color: tertiaryColor }} className="font-sans text-[10px] font-black tracking-[0.25em] uppercase ml-1">SaaS</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <Link
              href="/docs"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-stone-500 hover:text-stone-950 text-xs font-bold transition-colors"
            >
              <BookOpen size={14} />
              <span>SaaS Blueprint</span>
            </Link>
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-xl text-xs font-bold bg-stone-50 text-stone-700 border border-stone-200/60 hover:text-stone-950 hover:bg-stone-100 transition-all duration-300 active:scale-95 shadow-sm"
            >
              Acceso Profesional
            </Link>
            <button 
              onClick={() => handleOpenOnboarding('pro')}
              style={{ backgroundColor: primaryColor }}
              className="hover:opacity-90 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Comenzar Ahora
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION - BOUTIQUE BLANCA */}
      <section className="relative pt-20 pb-20 md:pt-36 md:pb-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center animate-in fade-in slide-in-from-bottom-6 duration-1000">
          <div className="inline-flex items-center gap-2 bg-stone-50 border border-stone-200/60 text-stone-500 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase mb-8 shadow-sm">
            <Sparkles className="w-3 h-3" style={{ color: tertiaryColor }} /> EL NUEVO ESTÁNDAR PARA CENTROS Y SALONES DE LUJO
          </div>
          
          <h1 
            className="text-4xl md:text-7xl font-serif font-semibold text-stone-950 tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8"
            dangerouslySetInnerHTML={{ __html: heroTitle.replace(/\n/g, '<br/>') }}
          />
          
          <p className="text-base md:text-lg text-stone-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            {heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => handleOpenOnboarding('pro')}
              style={{ backgroundColor: primaryColor }}
              className="w-full sm:w-auto hover:opacity-90 text-white px-8 py-4 rounded-xl text-xs font-bold shadow-md transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
            >
              Comenzar Prueba Gratuita <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="#sectors" 
              className="w-full sm:w-auto bg-white border border-stone-200/80 hover:bg-stone-50 text-stone-700 px-8 py-4 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center"
            >
              Ver Sectores de Especialidad
            </a>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN DE SECTORES EN ANILLO 3D CILÍNDRICO REAL */}
      <Showcase3DRing
        sectorsToRender={sectors}
        activeIndex={activeIndex}
        animating={animating}
        handleNavigate={handleNavigate}
        onConfigureEntorno={handleOpenOnboarding}
      />

      {/* 4. LOS 3 PUNTOS FUERTES (BENTO REFACTORIZADO A LA ALTA GAMA) */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          
          <div className="text-center max-w-2xl mx-auto mb-24">
            <span style={{ color: tertiaryColor }} className="text-[10px] font-black uppercase tracking-[0.25em] block mb-3">La Diferencia ProBookia</span>
            <h2 className="text-3xl md:text-5xl font-serif font-semibold tracking-tight text-stone-950">
              ¿Por qué ProBookia?
            </h2>
            <p className="text-stone-500 text-sm md:text-base mt-3 font-medium">
              Dejamos obsoletas las agendas analógicas y los listados genéricos. Tres pilares técnicos blindados para proteger y proyectar tu negocio.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Beneficio 1: Multi-tenant Aislado */}
            <div className="p-8 rounded-3xl bg-stone-50/50 border border-stone-200/50 flex flex-col justify-between h-[360px] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="text-5xl font-serif font-medium text-stone-200/80 mb-6 transition-colors group-hover:opacity-40">01</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5" style={{ color: primaryColor }} />
                  <h3 className="font-serif text-xl font-semibold text-stone-950">
                    Aislamiento Total RLS
                  </h3>
                </div>
                <p className="text-stone-500 text-[14px] leading-relaxed font-medium">
                  Seguridad a nivel bancario. Cada centro tiene su base de datos herméticamente aislada con Supabase RLS. Nadie ve los datos de nadie. Cumplimiento absoluto RGPD sin riesgos.
                </p>
              </div>
              <Link href="/docs?tab=aislamiento-multi-tenant" style={{ color: primaryColor }} className="text-xs font-bold hover:opacity-80 transition-colors flex items-center gap-1 mt-4">
                <span>Ver plano de arquitectura</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            {/* Beneficio 2: Marca Blanca Lujo */}
            <div className="p-8 rounded-3xl bg-stone-50/50 border border-stone-200/50 flex flex-col justify-between h-[360px] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="text-5xl font-serif font-medium text-stone-200/80 mb-6 transition-colors group-hover:opacity-40">02</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5" style={{ color: primaryColor }} />
                  <h3 className="font-serif text-xl font-semibold text-stone-950">
                    Branding Invisible de Lujo
                  </h3>
                </div>
                <p className="text-stone-500 text-[14px] leading-relaxed font-medium">
                  No vendemos ProBookia a tu paciente. Mostramos tu logotipo digitalizado, tus colores corporativos, tipografías y tu subdominio exclusivo. ProBookia es el motor oculto que te hace lucir gigante.
                </p>
              </div>
              <Link href="/docs?tab=estructura-catalogo" style={{ color: primaryColor }} className="text-xs font-bold hover:opacity-80 transition-colors flex items-center gap-1 mt-4">
                <span>Ver control de marca blanca</span>
                <ChevronRight size={12} />
              </Link>
            </div>

            {/* Beneficio 3: Copiloto por Voz */}
            <div className="p-8 rounded-3xl bg-stone-50/50 border border-stone-200/50 flex flex-col justify-between h-[360px] hover:shadow-lg transition-all duration-300 relative overflow-hidden group">
              <div className="text-5xl font-serif font-medium text-stone-200/80 mb-6 transition-colors group-hover:opacity-40">03</div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" style={{ color: primaryColor }} />
                  <h3 className="font-serif text-xl font-semibold text-stone-950">
                    Co-Piloto por Voz IA
                  </h3>
                </div>
                <p className="text-stone-500 text-[14px] leading-relaxed font-medium">
                  No pierdas el tiempo haciendo clics. Habla con el sistema como a un colega humano: *"Pon el color de acento primario en dorado"* o *"Genera el copy SEO en tono clínico"*, y la IA procesará la acción al instante.
                </p>
              </div>
              <Link href="/docs?tab=limites-conversacionales" style={{ color: primaryColor }} className="text-xs font-bold hover:opacity-80 transition-colors flex items-center gap-1 mt-4">
                <span>Ver límites conversacionales</span>
                <ChevronRight size={12} />
              </Link>
            </div>

          </div>

        </div>
      </section>

      {/* 5. SUSCRIPCIÓN & PRECIOS EDITORIALES */}
      <PricingSection onSelectPlan={handleOpenOnboarding} />

      {/* 5. FOOTER */}
      <footer className="bg-stone-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8 border-b border-stone-900 pb-12 mb-12">
          <div>
            <span className="text-xl font-serif tracking-widest text-white block mb-2">PROBOOKIA SaaS</span>
            <p className="text-stone-400 text-xs md:text-sm max-w-sm leading-relaxed font-medium">
              La plataforma invisible de alta gama para agendamiento, gestión de citas, facturación y TPV en centros selectos.
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

      {/* 6. ONBOARDING REGISTRATION MODAL (BOUTIQUE BLANCA) */}
      <OnboardingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedPlan={selectedPlan}
        apiUrl={API_URL}
      />

    </div>
  );
}
