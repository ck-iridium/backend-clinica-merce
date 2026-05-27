"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, FileText, Sparkles, ChevronRight, BookOpen } from 'lucide-react';
import OnboardingModal from './components/OnboardingModal';
import Showcase3DRing from './components/Showcase3DRing';
import PricingSection from './components/PricingSection';

interface Sector {
  id: string;
  badge: string;
  title: string;
  copy: string;
  videoUrl: string;
  imageUrl?: string;
  placeholderGradient: string;
}

export default function MarketingPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro' | 'gold'>('pro');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  const fallbackSectors: Sector[] = [
    {
      id: 'clinicas',
      badge: 'Clínicas Estéticas',
      title: 'Clínicas & Wellness',
      copy: 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dermatologist-examining-a-patients-face-with-magnifier-40545-large.mp4',
      placeholderGradient: 'from-blue-50 to-blue-100/30'
    },
    {
      id: 'barberias',
      badge: 'Barberías Selectas',
      title: 'Barberías Premium',
      copy: 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-barber-shaving-a-man-with-a-razor-41223-large.mp4',
      placeholderGradient: 'from-amber-50 to-amber-100/30'
    },
    {
      id: 'dentistas',
      badge: 'Odontología Avanzada',
      title: 'Consultorios Dentales',
      copy: 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-dentist-adjusting-a-surgical-light-in-clinic-40549-large.mp4',
      placeholderGradient: 'from-emerald-50 to-emerald-100/30'
    },
    {
      id: 'peluquerias',
      badge: 'Salones de Alta Costura',
      title: 'Salones de Belleza',
      copy: 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.',
      videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
      placeholderGradient: 'from-purple-50 to-purple-100/30'
    }
  ];

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [heroTitle, setHeroTitle] = useState('La elegancia de tu negocio traducida en un SaaS de Lujo');
  const [heroSubtitle, setHeroSubtitle] = useState('Diseñado exclusivamente para centros de estética, wellness, spas y salones premium independientes. Agendas fluidas, expedientes médicos asimétricos y reservas de doble opt-in integradas en una experiencia sublime.');
  
  // Estados de Branding y SEO dinámicos del SaaS ProBookia
  const [logoSvg, setLogoSvg] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#1c1917');
  const [tertiaryColor, setTertiaryColor] = useState('#d4af37');
  const [fontFamily, setFontFamily] = useState('playfair_inter');

  const [activeIndex, setActiveIndex] = useState(0);
  const [animating, setAnimating] = useState(false);

  const sectorsToRender = sectors.length >= 4 ? sectors : fallbackSectors;

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

  useEffect(() => {
    async function loadMarketingContent() {
      try {
        const response = await fetch(`${API_URL}/super-admin/marketing/public`);
        if (!response.ok) throw new Error('Error loading marketing content');
        const data = await response.json();
        
        if (data.settings) {
          if (data.settings.hero_title) setHeroTitle(data.settings.hero_title);
          if (data.settings.hero_subtitle) setHeroSubtitle(data.settings.hero_subtitle);
          if (data.settings.logo_svg) setLogoSvg(data.settings.logo_svg);
          if (data.settings.primary_color) setPrimaryColor(data.settings.primary_color);
          if (data.settings.secondary_color) setSecondaryColor(data.settings.secondary_color);
          if (data.settings.tertiary_color) setTertiaryColor(data.settings.tertiary_color);
          if (data.settings.font_family) setFontFamily(data.settings.font_family);
          
          // Inyección dinámica de SEO en el Cliente (Document Headers)
          if (data.settings.seo_title) {
            document.title = data.settings.seo_title;
          }
          if (data.settings.seo_description) {
            let metaDesc = document.querySelector('meta[name="description"]');
            if (metaDesc) {
              metaDesc.setAttribute('content', data.settings.seo_description);
            } else {
              metaDesc = document.createElement('meta');
              metaDesc.setAttribute('name', 'description');
              metaDesc.setAttribute('content', data.settings.seo_description);
              document.head.appendChild(metaDesc);
            }
          }
          if (data.settings.seo_keywords) {
            let metaKey = document.querySelector('meta[name="keywords"]');
            if (metaKey) {
              metaKey.setAttribute('content', data.settings.seo_keywords);
            } else {
              metaKey = document.createElement('meta');
              metaKey.setAttribute('name', 'keywords');
              metaKey.setAttribute('content', data.settings.seo_keywords);
              document.head.appendChild(metaKey);
            }
          }
        }
        
        if (data.sectors && data.sectors.length > 0) {
          const mappedSectors = data.sectors.map((s: any) => {
            let gradient = 'from-blue-50 to-blue-100/30';
            if (s.slug === 'barberias' || s.order_index === 1) gradient = 'from-amber-50 to-amber-100/30';
            else if (s.slug === 'dentistas' || s.order_index === 2) gradient = 'from-emerald-50 to-emerald-100/30';
            else if (s.slug === 'peluquerias' || s.order_index === 3) gradient = 'from-purple-50 to-purple-100/30';
            
            let copy = 'Configura tu plataforma en marca blanca de alta gama con subdominio exclusivo y RLS a nivel de base de datos.';
            if (s.slug === 'clinicas') copy = 'Aislamiento total de expedientes clínicos en base de datos, firmas manuscritas Base64 y branding de lujo.';
            else if (s.slug === 'barberias') copy = 'Gestión ágil de especialistas en tiempo real, venta de bonos express y protección total contra incomparecencias.';
            else if (s.slug === 'dentistas') copy = 'Calendarios dinámicos asimétricos, cobros rápidos en POS y recordatorios automáticos por SMTP privado.';
            else if (s.slug === 'peluquerias') copy = 'Portal de reserva en 3 pasos con colores y logotipos propios, adaptable a dominio exclusivo corporativo.';
            
            return {
              id: s.id,
              badge: s.badge_text || 'Especialidad',
              title: s.title,
              copy: copy,
              videoUrl: s.video_url || 'https://assets.mixkit.co/videos/preview/mixkit-hairdresser-cutting-hair-of-a-woman-in-salon-40552-large.mp4',
              imageUrl: s.image_url || '',
              placeholderGradient: gradient
            };
          });
          setSectors(mappedSectors);
        } else {
          setSectors(fallbackSectors);
        }
      } catch (err) {
        console.error('Error fetching CMS content, falling back to static lists', err);
        setSectors(fallbackSectors);
      }
    }
    loadMarketingContent();
  }, []);

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
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Inter:wght@100..900&family=Outfit:wght@100..900&family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&family=Montserrat:wght@100..900&family=Cinzel:wght@400..900&family=Roboto:wght@100..900&display=swap');
        
        :root {
          --font-serif: ${
            fontFamily === 'playfair_inter' ? "'Playfair Display', serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
            fontFamily === 'cormorant_montserrat' ? "'Cormorant Garamond', serif" :
            fontFamily === 'cinzel_roboto' ? "'Cinzel', serif" :
            "'Inter', sans-serif"
          };
          --font-sans: ${
            fontFamily === 'playfair_inter' ? "'Inter', sans-serif" :
            fontFamily === 'outfit' ? "'Outfit', sans-serif" :
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
        sectorsToRender={sectorsToRender}
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
