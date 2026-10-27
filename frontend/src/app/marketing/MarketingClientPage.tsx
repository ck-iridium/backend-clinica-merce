"use client";

import { useState, useEffect } from 'react';
import OnboardingModal from './components/OnboardingModal';
import Showcase3DRing from './components/Showcase3DRing';
import PricingSection from './components/PricingSection';
import MarketingHeader from './components/MarketingHeader';
import MarketingHero, { HeroTab } from './components/MarketingHero';
import PainComparisonSection from './components/PainComparisonSection';
import PillarsSection from './components/PillarsSection';
import MarketingFooter from './components/MarketingFooter';
import { resolveHeadingFont, resolveBodyFont, FONT_WEIGHT_MAP } from './utils/fonts';

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
    hero_tabs?: HeroTab[];
    hero_image_1?: string | null;
    hero_image_2?: string | null;
    hero_image_3?: string | null;
    logo_svg: string | null;
    primary_color: string;
    secondary_color: string;
    tertiary_color: string;
    font_family: string;
    font_family_body?: string;
    font_weight_headings: string;
    favicon_url: string | null;
  };
  initialSectors: Sector[];
}

const DEFAULT_HERO_TABS: HeroTab[] = [
  {
    id: 'tab-agenda',
    label: 'Agenda & Reservas',
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tab-emr',
    label: 'Fichas Clínicas LOPD',
    image_url: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tab-caja',
    label: 'Caja y Pagos',
    image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=1600&q=80'
  },
  {
    id: 'tab-marketing',
    label: 'Marketing & Fidelización',
    image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80'
  }
];

export default function MarketingClientPage({ initialSettings, initialSectors }: MarketingClientPageProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'free' | 'basic' | 'pro' | 'gold'>('pro');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  // Branding & Contenido del CMS
  const [sectors, setSectors] = useState<Sector[]>(initialSectors);
  const [heroTitle, setHeroTitle] = useState(initialSettings.hero_title);
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings.hero_subtitle);
  const [logoSvg, setLogoSvg] = useState<string | null>(initialSettings.logo_svg);
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primary_color || '#1C1917');
  const [secondaryColor, setSecondaryColor] = useState(initialSettings.secondary_color || '#FAF9F6');
  const [tertiaryColor, setTertiaryColor] = useState(initialSettings.tertiary_color || '#D4AF37');
  const [fontFamily, setFontFamily] = useState(initialSettings.font_family || 'playfair');
  const [fontFamilyBody, setFontFamilyBody] = useState(initialSettings.font_family_body || 'inter');
  const [fontWeightHeadings, setFontWeightHeadings] = useState(initialSettings.font_weight_headings || 'semibold');

  const [heroTabs, setHeroTabs] = useState<HeroTab[]>(
    initialSettings.hero_tabs && initialSettings.hero_tabs.length > 0
      ? initialSettings.hero_tabs
      : DEFAULT_HERO_TABS
  );

  // Sincronización dinámica de ajustes de Branding en tiempo real desde el CMS
  useEffect(() => {
    fetch(`${API_URL}/super-admin/marketing/public`, { cache: 'no-store' })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch public settings');
      })
      .then(data => {
        if (data?.settings) {
          if (data.settings.hero_title) setHeroTitle(data.settings.hero_title);
          if (data.settings.hero_subtitle) setHeroSubtitle(data.settings.hero_subtitle);
          if (data.settings.hero_tabs && data.settings.hero_tabs.length > 0) {
            setHeroTabs(data.settings.hero_tabs);
          }
          if (data.settings.logo_svg !== undefined) setLogoSvg(data.settings.logo_svg);
          if (data.settings.primary_color) setPrimaryColor(data.settings.primary_color);
          if (data.settings.secondary_color) setSecondaryColor(data.settings.secondary_color);
          if (data.settings.tertiary_color) setTertiaryColor(data.settings.tertiary_color);
          if (data.settings.font_family) setFontFamily(data.settings.font_family);
          if (data.settings.font_family_body) setFontFamilyBody(data.settings.font_family_body);
          if (data.settings.font_weight_headings) setFontWeightHeadings(data.settings.font_weight_headings);
        }
        if (data?.sectors && data.sectors.length > 0) {
          setSectors(data.sectors.map((s: any, idx: number) => {
            const text = `${s.slug || ''} ${s.title || ''} ${s.badge_text || ''}`.toLowerCase();
            let resolvedImage = s.image_url;
            if (!resolvedImage || resolvedImage.trim() === '') {
              if (text.includes('barber') || idx === 1) {
                resolvedImage = 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80';
              } else if (text.includes('dent') || text.includes('odont') || idx === 2) {
                resolvedImage = 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80';
              } else if (text.includes('peluquer') || text.includes('salon') || idx === 3) {
                resolvedImage = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80';
              } else if (text.includes('tattoo') || text.includes('tatuad') || idx === 4) {
                resolvedImage = 'https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80';
              } else {
                resolvedImage = 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80';
              }
            }
            return {
              id: s.id,
              badge: s.badge_text || s.title,
              title: s.title,
              copy: s.copy || '',
              videoUrl: s.video_url || '',
              imageUrl: resolvedImage,
              placeholderGradient: 'from-stone-800 to-stone-900'
            };
          }));
        }
      })
      .catch(err => console.warn('[MarketingClientPage] Usando ajustes pre-renderizados:', err.message));
  }, [API_URL]);

  // Estado para el Anillo 3D de Sectores
  const [sectorActiveIndex, setSectorActiveIndex] = useState(0);
  const [sectorAnimating, setSectorAnimating] = useState(false);

  const handleSectorNavigate = (newIndex: number) => {
    if (sectorAnimating) return;
    setSectorAnimating(true);
    setTimeout(() => {
      setSectorActiveIndex(newIndex);
    }, 200);
    setTimeout(() => {
      setSectorAnimating(false);
    }, 600);
  };

  const handleOpenOnboarding = (plan: 'free' | 'basic' | 'pro' | 'gold') => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const activeWeight = FONT_WEIGHT_MAP[fontWeightHeadings || 'semibold'] || '600';
  const resolvedHeadingFont = resolveHeadingFont(fontFamily);
  const resolvedBodyFont = resolveBodyFont(fontFamilyBody, fontFamily);

  return (
    <div
      style={{
        '--primary-accent': primaryColor,
        '--secondary-accent': secondaryColor,
        '--tertiary-accent': tertiaryColor
      } as React.CSSProperties}
      className="min-h-screen bg-[#FAF9F6] text-stone-900 font-sans selection:bg-[#d4af37]/20 overflow-x-hidden relative transition-colors duration-300"
    >
      {/* Inyección dinámica de Google Fonts y Clases Tipográficas desde el Panel de Branding */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400..800&family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Fredoka:wght@300..700&family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&family=Roboto:wght@300;400;500;700&display=swap');

        :root {
          --font-serif: ${resolvedHeadingFont} !important;
          --font-heading: ${resolvedHeadingFont} !important;
          --font-playfair: ${resolvedHeadingFont} !important;
          --font-cormorant: ${resolvedHeadingFont} !important;
          --font-sans: ${resolvedBodyFont} !important;
          --font-body: ${resolvedBodyFont} !important;
          --primary-accent: ${primaryColor || '#1C1917'} !important;
          --secondary-accent: ${secondaryColor || '#FAF9F6'} !important;
          --tertiary-accent: ${tertiaryColor || '#D4AF37'} !important;
        }
        
        .font-serif, h1, h2, h3, h4, h5, h6 {
          font-family: ${resolvedHeadingFont} !important;
          font-weight: ${activeWeight} !important;
        }
        
        .font-sans, body, html, button, input, select, textarea, p, span, a {
          font-family: ${resolvedBodyFont} !important;
        }
      ` }} />

      {/* ── 1. HEADER EDITORIAL (QUIET LUXURY GLASSMORPHISM) ── */}
      <MarketingHeader
        logoSvg={logoSvg}
        primaryColor={primaryColor}
        tertiaryColor={tertiaryColor}
        onOpenOnboarding={handleOpenOnboarding}
      />

      {/* ── 2. HERO SECTION CON TABS Y SLIDER 16:9 ENCAPSULADO ── */}
      <MarketingHero
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        heroTabs={heroTabs}
        primaryColor={primaryColor}
        tertiaryColor={tertiaryColor}
        onOpenOnboarding={handleOpenOnboarding}
      />

      {/* ── 3. EL DOLOR DE LA FRAGMENTACIÓN VS PROBOOKIA TODO-EN-UNO ── */}
      <PainComparisonSection onSelectPlan={handleOpenOnboarding} />

      {/* ── 4. LOS 4 PILARES DEL ECOSISTEMA PROBOOKIA (BENTO GRID) ── */}
      <PillarsSection />

      {/* ── 5. SECCIÓN DE SECTORES EN ANILLO 3D REAL ── */}
      <Showcase3DRing
        sectorsToRender={sectors}
        activeIndex={sectorActiveIndex}
        animating={sectorAnimating}
        handleNavigate={handleSectorNavigate}
        onConfigureEntorno={handleOpenOnboarding}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        tertiaryColor={tertiaryColor}
      />

      {/* ── 6. SECCIÓN DE PRECIOS EDITORIALES ── */}
      <PricingSection onSelectPlan={handleOpenOnboarding} />

      {/* ── 7. FOOTER QUIET LUXURY ── */}
      <MarketingFooter />

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
