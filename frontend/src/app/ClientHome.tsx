"use client";
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import ServiceCard from '@/components/ServiceCard';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import Footer from '@/components/Footer';
import PublicNavbar from '@/components/PublicNavbar';
import { useLanguage } from '@/app/contexts/LanguageContext';

// ─── Sanitizador de Títulos "Quiet Luxury" ────────────────────────────────────
const cleanTitle = (text: string) => {
  if (!text) return '';
  return text
    .replace(/\s*\(?\s*con v[ií]deo\s*\)?/gi, '')
    .replace(/\s+con v[ií]deo/gi, '')
    .trim();
};

const parseSizeScale = (val: any, fallback: number = 100): number => {
  if (typeof val === 'number') return val;
  if (!val) return fallback;
  if (val === 'small') return 80;
  if (val === 'medium') return 90;
  if (val === 'large') return 100;
  if (val === 'xl') return 125;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
};

const getPriceStyleConfig = (style?: string) => {
  switch (style) {
    case 'outline':
      return {
        boxClass: 'bg-transparent border-2 border-white/40 rounded-3xl px-6 py-3.5 sm:px-8 sm:py-4.5 md:px-9 md:py-6 text-white backdrop-blur-xs',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-white drop-shadow-md',
        suffixClass: 'text-[#d4af37]'
      };
    case 'minimal':
      return {
        boxClass: 'bg-transparent border-0 p-0 text-white shadow-none',
        prefixClass: 'text-white/80',
        amountClass: 'text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]',
        suffixClass: 'text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]'
      };
    case 'solid_white':
      return {
        boxClass: 'bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border border-white/50 dark:border-stone-800 rounded-3xl px-6 py-3.5 sm:px-8 sm:py-4.5 md:px-9 md:py-6 text-stone-900 dark:text-white shadow-lg',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-stone-900 dark:text-white',
        suffixClass: 'text-[#d4af37]'
      };
    case 'capsule_dark':
    default:
      return {
        boxClass: 'backdrop-blur-xl bg-black/45 dark:bg-stone-950/60 border border-white/25 rounded-3xl px-6 py-3.5 sm:px-8 sm:py-4.5 md:px-9 md:py-6 text-white hover:border-[#d4af37]/60 transition-all duration-300',
        prefixClass: 'text-[#d4af37]',
        amountClass: 'text-white drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]',
        suffixClass: 'text-[#d4af37]'
      };
  }
};

// ─── Componente de Tarjeta Bento/Grid Symmetrical con Video Hover y Precarga ──
function BentoCategoryCard({ svc, idx, gridClass, total }: { svc: any, idx: number, gridClass: string, total: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLAnchorElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
        if (entry.isIntersecting) {
          setHasEnteredViewport(true);
        }
      },
      { threshold: 0.1, rootMargin: '150px' }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const [isTouchDevice, setIsTouchDevice] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsTouchDevice(window.matchMedia('(pointer: coarse)').matches);
    }
  }, []);
  const shouldShowVideo = isTouchDevice ? isInView : isHovered;
  const shouldMountVideo = hasEnteredViewport || isHovered;

  useEffect(() => {
    if (videoRef.current && shouldMountVideo) {
      if (shouldShowVideo) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
  }, [shouldShowVideo, shouldMountVideo]);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  const videoUrl = svc.video_url ? getFullUrl(svc.video_url) : null;

  return (
    <Link
      ref={containerRef}
      href={`/tratamientos/${svc.category_slug || 'general'}/${svc.slug || svc.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${gridClass} group relative rounded-[2rem] overflow-hidden bg-stone-100 border border-stone-100 flex flex-col justify-end p-6 md:p-8 cursor-pointer transition-all duration-500 hover:shadow-xl`}
      style={{
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'transform'
      }}
    >
      {/* Imagen Estática de Fondo */}
      <div className="absolute inset-0 bg-stone-200 z-0 overflow-hidden">
        {svc.image_url ? (
          <img
            src={getFullUrl(svc.image_url)}
            alt={svc.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-stone-100 flex items-center justify-center">
            <span className="font-serif text-stone-300 italic">ProBookia</span>
          </div>
        )}
      </div>

      {/* Video Hover de Precarga con Control de Opacidad - Lazy Loaded */}
      <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${shouldShowVideo ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
        {videoUrl && shouldMountVideo ? (
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="none"
            className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ease-out ${videoLoaded ? 'opacity-100' : 'opacity-0'} group-hover:scale-105`}
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            onCanPlay={() => setVideoLoaded(true)}
            src={shouldMountVideo ? videoUrl : undefined}
          />
        ) : svc.image_url ? (
          <img
            src={getFullUrl(svc.image_url)}
            alt={svc.name}
            className="w-full h-full object-cover opacity-40 mix-blend-overlay absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              transform: 'translateZ(0)',
              willChange: 'transform'
            }}
            loading="lazy"
          />
        ) : null}

        {videoUrl && shouldShowVideo && !videoLoaded && (
          <div className="absolute bottom-8 right-8 z-30">
            <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
          </div>
        )}
      </div>

      {/* Elegant Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/25 to-transparent z-20"></div>

      {/* Service Meta Details */}
      <div className="relative z-30 text-white w-full">
        <span className="text-[#d4af37] text-[10px] md:text-xs font-black uppercase tracking-[0.2em] mb-2 block">
          {svc.duration_minutes} min • {svc.price}€
        </span>
        <h4 className="text-xl md:text-2xl font-serif font-bold leading-tight group-hover:text-[#d4af37] transition-colors line-clamp-2">
          {cleanTitle(svc.name)}
        </h4>
        <p className="text-xs text-white/70 mt-2 font-medium line-clamp-2 group-hover:text-white/95 transition-colors">
          {svc.description}
        </p>
      </div>
    </Link>
  );
}

// ─── Layout 2: Bento Grid inteligente, reactivo sin huecos ────────────────────
function BentoCategoryGrid({ services }: { services: any[] }) {
  if (services.length === 0) return null;

  const total = services.length;
  let containerGridClass = "grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[250px] md:auto-rows-[250px]";

  if (total === 4) {
    containerGridClass = "grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[280px] md:auto-rows-[280px]";
  } else if (total === 2) {
    containerGridClass = "grid-cols-1 md:grid-cols-2 gap-6 auto-rows-[350px] md:auto-rows-[350px]";
  } else if (total === 1) {
    containerGridClass = "grid-cols-1 gap-6 auto-rows-[450px]";
  }

  const getGridClasses = (index: number, totalCount: number) => {
    if (totalCount === 3) {
      if (index === 0) return 'md:col-span-2 md:row-span-2 h-full';
      return 'md:col-span-1 md:row-span-1 h-full';
    }
    if (totalCount === 4) {
      return 'md:col-span-1 md:row-span-1 h-full';
    }
    if (totalCount === 2) {
      return 'md:col-span-1 md:row-span-1 h-full';
    }
    if (totalCount === 1) {
      return 'col-span-1 h-full';
    }
    // Para >= 5 elementos
    if (index === 0) return 'md:col-span-2 md:row-span-2 h-full';
    if (index === 4) return 'md:col-span-2 md:row-span-1 h-full';
    return 'md:col-span-1 md:row-span-1 h-full';
  };

  return (
    <div className={`grid ${containerGridClass} w-full max-w-7xl mx-auto px-6`}>
      {services.map((svc, idx) => {
        const gridClass = getGridClasses(idx, total);
        return (
          <BentoCategoryCard
            key={svc.id}
            svc={svc}
            idx={idx}
            gridClass={gridClass}
            total={total}
          />
        );
      })}
    </div>
  );
}

// ─── Layout 3: Grid Tradicional ──────────────────────────────────────────────
function TraditionalCategoryGrid({ services }: { services: any[] }) {
  if (services.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-7xl mx-auto px-6">
      {services.map((svc: any, idx: number) => (
        <BentoCategoryCard
          key={svc.id}
          svc={svc}
          idx={idx}
          gridClass="aspect-[3/4] h-full"
          total={services.length}
        />
      ))}
    </div>
  );
}

// ─── Layout 4: Lista Minimalista (Quiet Luxury floating reveal) ────────────────
function MinimalistListCard({ svc, idx }: { svc: any, idx: number }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLAnchorElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}` : url;
  };

  const videoUrl = svc.video_url ? getFullUrl(svc.video_url) : null;
  const shouldMountVideo = isInView && isHovered;

  useEffect(() => {
    if (videoRef.current && shouldMountVideo) {
      if (isHovered) {
        videoRef.current.play().catch(() => { });
      } else {
        videoRef.current.pause();
      }
    }
  }, [isHovered, shouldMountVideo]);

  return (
    <Link
      ref={containerRef}
      href={`/tratamientos/${svc.category_slug || 'general'}/${svc.slug || svc.id}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col md:flex-row md:items-center justify-between py-8 border-b border-stone-200/60 hover:border-[#d4af37]/40 transition-all duration-500 w-full"
    >
      <div className="flex-1 pr-6 z-10">
        <div className="flex items-center gap-4 mb-2">
          <span className="text-[#d4af37] text-[10px] font-black uppercase tracking-[0.25em]">
            0{idx + 1} · {svc.duration_minutes} min
          </span>
          <span className="text-stone-300 text-xs">|</span>
          <span className="text-stone-500 text-xs font-bold font-sans">{svc.price} €</span>
        </div>
        <h4 className="text-2xl md:text-3xl font-serif font-bold text-stone-850 group-hover:text-stone-950 transition-colors leading-tight">
          {cleanTitle(svc.name)}
        </h4>
        <p className="text-stone-400 text-sm mt-2 max-w-2xl font-medium leading-relaxed line-clamp-2">
          {svc.description}
        </p>
      </div>

      {/* Floating reveal preview (Quiet Luxury) */}
      <div className="relative md:absolute md:right-16 md:top-1/2 md:-translate-y-1/2 w-full md:w-[240px] h-[140px] rounded-2xl overflow-hidden shadow-luxury border border-stone-200/50 bg-stone-50 mt-4 md:mt-0 transition-all duration-700 md:opacity-0 md:scale-90 md:group-hover:opacity-100 md:group-hover:scale-100 z-20 pointer-events-none">
        {/* Background estático */}
        <div className="absolute inset-0 bg-stone-200 z-0 overflow-hidden">
          {svc.image_url ? (
            <img
              src={getFullUrl(svc.image_url)}
              alt={svc.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-stone-100 flex items-center justify-center">
              <span className="font-serif text-stone-300 italic text-[10px]">ProBookia</span>
            </div>
          )}
        </div>

        {/* Video Hover - Lazy Loaded */}
        <div className={`absolute inset-0 z-10 transition-opacity duration-700 ${isHovered ? 'opacity-100' : 'opacity-0'} overflow-hidden`}>
          {videoUrl && shouldMountVideo ? (
            <video
              ref={videoRef}
              loop
              muted
              playsInline
              preload="none"
              className={`w-full h-full object-cover absolute inset-0 transition-all duration-700 ease-out ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onCanPlay={() => setVideoLoaded(true)}
              src={shouldMountVideo ? videoUrl : undefined}
            />
          ) : svc.image_url ? (
            <img
              src={getFullUrl(svc.image_url)}
              alt={svc.name}
              className="w-full h-full object-cover opacity-40 mix-blend-overlay absolute inset-0"
            />
          ) : null}
        </div>

        {/* Overlay protector */}
        <div className="absolute inset-0 bg-black/10 z-20"></div>
      </div>

      {/* Flecha elegante */}
      <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full border border-stone-100 group-hover:border-[#d4af37] group-hover:bg-[#d4af37]/5 transition-all duration-500 z-10">
        <span className="text-[#d4af37] text-xl group-hover:translate-x-0.5 transition-transform">→</span>
      </div>
    </Link>
  );
}

function MinimalistCategoryList({ services }: { services: any[] }) {
  if (services.length === 0) return null;

  return (
    <div className="flex flex-col w-full max-w-7xl mx-auto px-6 divide-y divide-stone-100">
      {services.map((svc: any, idx: number) => (
        <MinimalistListCard key={svc.id} svc={svc} idx={idx} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TRADUCCIONES INLINE
// ─────────────────────────────────────────────────────────────────────────────
const homeTranslations: Record<string, Record<string, string>> = {
  es: {
    'home.discover_treatments': 'Descubre nuestros tratamientos exclusivos diseñados para resaltar tu belleza natural.',
    'home.see_catalog': 'Ver Catálogo',
    'home.see_all': 'Ver todo',
    'home.loading': 'Cargando la web...'
  },
  en: {
    'home.discover_treatments': 'Discover our exclusive treatments designed to highlight your natural beauty.',
    'home.see_catalog': 'View Catalog',
    'home.see_all': 'See all',
    'home.loading': 'Loading website...'
  },
  fr: {
    'home.discover_treatments': 'Découvrez nos soins exclusifs conçus para sublimer votre beauté naturelle.',
    'home.see_catalog': 'Voir le Catalogue',
    'home.see_all': 'Voir tout',
    'home.loading': 'Chargement du site...'
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function ClientHome({ content, settings, services, categories }: any) {
  const { translate, language } = useLanguage();
  const lang = language || 'es';

  const t = (key: string, fallback: string) =>
    homeTranslations[lang]?.[key] || fallback;

  if (!content) {
    return (
      <div className="flex items-center justify-center min-h-screen text-stone-500 font-bold">
        {t('home.loading', 'Cargando la web...')}
      </div>
    );
  }

  // Traducir servicios y categorías
  const translatedServices = services.map((s: any) => ({
    ...s,
    name: translate(s.name, s.translations, 'name'),
    description: translate(s.description, s.translations, 'description'),
  }));

  const translatedCategories = categories.map((c: any) => ({
    ...c,
    name: translate(c.name, c.translations, 'name'),
    description: translate(c.description, c.translations, 'description'),
  }));

  // Solo categorías activas, respetando su order_index
  const activeCategories = translatedCategories
    .filter((c: any) => c.is_active)
    .sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0));

  // Calcular orden final de secciones desde el JSON guardado
  const baseSections = [
    { id: 'hero', type: 'hero' },
    { id: 'about', type: 'about' },
    { id: 'cta', type: 'cta' },
  ];

  const catSections = activeCategories.map((c: any) => ({
    id: c.id,
    type: 'category',
    data: c,
  }));

  const allAvailable = [...baseSections, ...catSections];
  let orderedSections: any[] = [];

  if (content.home_sections_order) {
    try {
      const savedOrder = JSON.parse(content.home_sections_order);
      savedOrder.forEach((id: string) => {
        const found = allAvailable.find(s => s.id === id);
        if (found) orderedSections.push(found);
      });
      allAvailable.forEach(s => {
        if (!orderedSections.find(o => o.id === s.id)) orderedSections.push(s);
      });
    } catch {
      orderedSections = [...baseSections.slice(0, 2), ...catSections, baseSections[2]];
    }
  } else {
    orderedSections = [...baseSections.slice(0, 2), ...catSections, baseSections[2]];
  }

  // Hero siempre primero
  const hero = orderedSections.find(s => s.type === 'hero') || baseSections[0];
  const middle = orderedSections.filter(s => s.type !== 'hero' && s.type !== 'seo');
  const finalOrder = [hero, ...middle];

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans relative">

      <style dangerouslySetInnerHTML={{
        __html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      <main className="w-full h-[100dvh] overflow-y-auto snap-y-mandatory md:h-auto md:overflow-visible md:snap-none scroll-smooth relative">
        {/* Único Navbar dinámico del CMS en el contenedor superior */}
        <div className="absolute top-0 left-0 w-full z-[100]">
          <PublicNavbar />
        </div>

        {finalOrder.map((section, index) => {

          // ── HERO ──────────────────────────────────────────────────────────
          if (section.type === 'hero') {
            return (
              <section
                key="hero"
                className={`relative h-[100dvh] min-h-[600px] w-full flex snap-start snap-stop-always md:snap-none
                  ${content.hero_alignment === 'top' ? 'items-start pt-48' : content.hero_alignment === 'bottom' ? 'items-end pb-32' : 'items-center'}
                  ${content.hero_content_fullwidth 
                    ? (content.hero_horizontal_alignment === 'left' ? 'justify-start' : content.hero_horizontal_alignment === 'right' ? 'justify-end' : 'justify-center') 
                    : 'justify-center'
                  }
                  overflow-hidden mt-0`}
              >

                {content.hero_video_url ? (
                  <div className="absolute inset-0 z-0 bg-stone-900">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      preload="metadata"
                      poster={content.hero_image_url ? (content.hero_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${content.hero_image_url}` : content.hero_image_url) : undefined}
                      className="w-full h-full object-cover"
                    >
                      <source src={content.hero_video_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${content.hero_video_url}` : content.hero_video_url} type="video/mp4" />
                    </video>
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply" />
                  </div>
                ) : content.hero_image_url ? (
                  <div className="absolute inset-0 z-0 bg-stone-900">
                    <img
                      src={content.hero_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${content.hero_image_url}` : content.hero_image_url}
                      alt={cleanTitle(translate(content.hero_title, content.translations, 'hero_title')) || "Hero"}
                      fetchPriority="high"
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/20 to-stone-900/60 mix-blend-multiply" />
                  </div>
                ) : (
                  <div className="absolute inset-0 z-0 bg-stone-900" />
                )}

                {(() => {
                  const titleMaxWidth = content.hero_title_max_width || 100;
                  const isPriceActive = !!content.hero_price_enabled && (content.hero_price_amount || content.hero_price_prefix);
                  const titleScale = parseSizeScale(content.hero_title_size, 100) / 100;
                  const subtitleScale = parseSizeScale(content.hero_subtitle_size, 100) / 100;
                  const priceScale = parseSizeScale(content.hero_price_size, 100) / 100;
                  const priceConfig = getPriceStyleConfig(content.hero_price_style);

                  const getButtonStyle = (style?: string) => {
                    switch (style) {
                      case 'gold_solid':
                        return 'bg-[#d4af37] text-white border border-[#b8952b] hover:bg-[#b8952b]';
                      case 'outline':
                        return 'bg-transparent border-2 border-white/90 text-white hover:bg-white hover:text-stone-900';
                      case 'solid_white':
                        return 'bg-white text-stone-900 border border-stone-200 hover:bg-stone-100';
                      case 'glass':
                      default:
                        return 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-stone-900';
                    }
                  };

                  const renderPriceCapsule = (isMobile: boolean = false) => {
                    if (!isPriceActive) return null;
                    return (
                      <div className={`shrink-0 ${isMobile ? 'block md:hidden my-2 w-fit' : 'hidden md:block self-start md:self-center'} ${
                        content.hero_horizontal_alignment === 'center' ? 'mx-auto' :
                        content.hero_horizontal_alignment === 'right' ? 'ml-auto' : ''
                      }`}>
                        <div className={`relative group overflow-hidden ${priceConfig.boxClass} select-none`}>
                          <div className="relative flex flex-col items-center justify-center text-center">
                            {translate(content.hero_price_prefix, content.translations, 'hero_price_prefix') && (
                              <span className={`text-[10px] sm:text-xs md:text-sm font-black uppercase tracking-[0.25em] ${priceConfig.prefixClass} block leading-none`}>
                                {translate(content.hero_price_prefix, content.translations, 'hero_price_prefix')}
                              </span>
                            )}
                            <div 
                              className="flex items-baseline justify-center gap-1 sm:gap-1.5 leading-none"
                              style={{ marginTop: `${-12 + (content.hero_price_offset_y || 0)}px` }}
                            >
                              <span 
                                style={{ fontSize: `clamp(${(3.0 * priceScale).toFixed(2)}rem, ${(5.0 * priceScale).toFixed(2)}vw, ${(6.8 * priceScale).toFixed(2)}rem)` }}
                                className={`font-serif font-black ${priceConfig.amountClass} tracking-tight`}
                              >
                                {content.hero_price_amount || '15'}
                              </span>
                              <span 
                                style={{ fontSize: `clamp(${(1.4 * priceScale).toFixed(2)}rem, ${(2.3 * priceScale).toFixed(2)}vw, ${(3.0 * priceScale).toFixed(2)}rem)` }}
                                className={`font-serif font-bold ${priceConfig.suffixClass}`}
                              >
                                {content.hero_price_suffix || '€'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  };

                  return (
                    <div className={`relative z-10 w-full px-6 ${
                      content.hero_content_fullwidth
                        ? `max-w-7xl ${content.hero_horizontal_alignment === 'left' ? 'text-left ml-0 mr-auto' : content.hero_horizontal_alignment === 'right' ? 'text-right mr-0 ml-auto' : 'text-center mx-auto'}`
                        : `max-w-7xl mx-auto ${content.hero_horizontal_alignment === 'left' ? 'text-left' : content.hero_horizontal_alignment === 'right' ? 'text-right' : 'text-center'}`
                    }`}>
                      {/* Bloque Principal Hero: Col 1 (H1 + Subtítulo + [Precio Móvil] + Botón) y Col 2 (Precio Escritorio) */}
                      <div className={`flex flex-col ${
                        content.hero_horizontal_alignment === 'center'
                          ? 'md:flex-row items-center justify-center'
                          : content.hero_horizontal_alignment === 'right'
                          ? 'md:flex-row-reverse items-end justify-start'
                          : 'md:flex-row items-start md:items-center justify-start'
                      } gap-6 md:gap-10 lg:gap-14`}>
                        {/* Columna 1: Textos */}
                        <div 
                          className={`w-full space-y-3 md:space-y-4 ${
                            content.hero_horizontal_alignment === 'center' ? 'text-center' :
                            content.hero_horizontal_alignment === 'right' ? 'text-right' : 'text-left'
                          } ${isPriceActive ? 'md:max-w-2xl' : 'md:max-w-3xl'}`}
                        >
                          {/* Fila 1: Título H1 (el ancho máximo % solo afecta en escritorio, nunca en móvil) */}
                          <h1 
                            style={{ 
                              '--hero-title-max-w': `${titleMaxWidth}%`,
                              fontSize: `clamp(${(2.2 * titleScale).toFixed(2)}rem, ${(5.5 * titleScale).toFixed(2)}vw, ${(7.2 * titleScale).toFixed(2)}rem)`
                            } as React.CSSProperties}
                            className={`leading-none font-serif font-extrabold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)] tracking-tight max-w-full md:max-w-[var(--hero-title-max-w)] ${
                              content.hero_horizontal_alignment === 'center' ? 'mx-auto' : ''
                            }`}
                          >
                            {cleanTitle(translate(content.hero_title, content.translations, 'hero_title'))}
                          </h1>

                          {/* Fila 2: Subtítulo */}
                          <p 
                            style={{
                              fontSize: `clamp(${(0.9 * subtitleScale).toFixed(2)}rem, ${(1.25 * subtitleScale).toFixed(2)}vw, ${(1.35 * subtitleScale).toFixed(2)}rem)`
                            }}
                            className={`text-white/90 font-medium font-sans tracking-wide leading-relaxed drop-shadow-md ${
                              content.hero_horizontal_alignment === 'center' ? 'max-w-2xl mx-auto' : 'max-w-xl'
                            }`}
                          >
                            {translate(content.hero_subtitle, content.translations, 'hero_subtitle')}
                          </p>

                          {/* En Móvil: Cápsula de Precio ubicada exactamente entre Subtítulo y Botón */}
                          {renderPriceCapsule(true)}

                          {/* Fila 3: Botón de Acción CTA (ancho natural en móvil y escritorio, sin sombreado ni glow) */}
                          {content.hero_show_button !== false && (
                            <div className={`pt-2 md:pt-3 ${
                              content.hero_horizontal_alignment === 'center' ? 'flex justify-center' :
                              content.hero_horizontal_alignment === 'right' ? 'flex justify-end' : 'flex justify-start'
                            }`}>
                              <Link 
                                href={content.hero_button_link || '#'} 
                                className={`inline-flex items-center justify-center px-8 py-3.5 md:px-11 md:py-4 rounded-full font-bold text-base md:text-lg transition-all duration-300 hover:scale-105 active:scale-95 group text-center whitespace-nowrap w-fit ${getButtonStyle(content.hero_button_style)}`}
                              >
                                <span>{translate(content.hero_button_text, content.translations, 'hero_button_text')}</span>
                                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform">→</span>
                              </Link>
                            </div>
                          )}
                        </div>

                        {/* En Escritorio: Columna 2 lateral con la Cápsula de Precio */}
                        {renderPriceCapsule(false)}
                      </div>
                    </div>
                  );
                })()}
              </section>
            );
          }

          // ── ABOUT ─────────────────────────────────────────────────────────
          if (section.type === 'about') {
            return (
              <section key="about" className="bg-[#F5F2EE] dark:bg-stone-950 relative flex items-center min-h-[100dvh] h-auto md:h-auto snap-start md:snap-none py-16 md:py-24">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center w-full">
                  {/* Columna Izquierda (Texto e Imagen en móvil) */}
                  <div className="space-y-6 md:space-y-8 flex flex-col items-center text-center md:items-start md:text-left">
                    <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                      {cleanTitle(translate(content.about_title, content.translations, 'about_title'))}
                    </h2>

                    {/* Imagen visible solo en móviles */}
                    <div className="block md:hidden rounded-[2.5rem] overflow-hidden shadow-2xl relative group w-full max-w-[320px] aspect-[4/5] mx-auto my-2 shrink-0">
                      {content.about_image_url ? (
                        <img src={content.about_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${content.about_image_url}` : content.about_image_url} alt="Sobre Mí" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">📷</div>
                      )}
                    </div>

                    <div className="text-base md:text-xl text-stone-600 dark:text-stone-300 leading-relaxed whitespace-pre-wrap font-medium max-w-md">
                      {translate(content.about_text, content.translations, 'about_text')}
                    </div>

                    {content.about_show_button && (
                      <div className="pt-2 md:pt-4">
                        <Link href={content.about_button_link || '#'} className="inline-block border-2 border-stone-200 dark:border-stone-850 text-stone-800 dark:text-stone-200 px-8 py-3.5 md:px-12 md:py-5 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-stone-900 dark:hover:bg-white dark:hover:text-stone-900 hover:text-white hover:border-stone-900 transition-all duration-500">
                          {translate(content.about_button_text, content.translations, 'about_button_text')}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Columna Derecha (Imagen en Desktop) */}
                  <div className="hidden md:block rounded-[3rem] overflow-hidden shadow-2xl relative group w-full md:h-[600px]">
                    {content.about_image_url ? (
                      <img src={content.about_image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${content.about_image_url}` : content.about_image_url} alt="Sobre Mí" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400">📷</div>
                    )}
                  </div>
                </div>
              </section>
            );
          }

          // ── CATEGORÍA ACTIVA ───────────────────────────────────────────────
          if (section.type === 'category') {
            const category = section.data;
            const categoryServices = translatedServices.filter(
              (s: any) => s.category_id === category.id && s.is_active
            );
            if (categoryServices.length === 0) return null;

            const isEven = index % 2 === 0;

            // Leer layout_style de cada categoría
            const layoutStyle: 'cards_slider' | 'bento_grid' | 'traditional_grid' | 'minimalist_list' =
              category.layout_preferences?.layout_style || 'cards_slider';

            const isSlider = layoutStyle === 'cards_slider';
            const sectionClasses = isSlider
              ? `w-full pt-10 pb-[3vh] md:py-24 overflow-hidden flex flex-col h-[100dvh] snap-start snap-stop-always md:h-auto md:snap-none`
              : `w-full pt-12 pb-16 md:py-24 flex flex-col h-auto snap-start md:snap-none`;

            return (
              <section
                key={`cat-${category.id}`}
                className={`${sectionClasses} ${isEven ? 'bg-white dark:bg-stone-950' : 'bg-[#F5F2EE] dark:bg-stone-900/60'}`}
              >
                {/* Cabecera de la categoría */}
                <div className="w-full max-w-7xl mx-auto px-6 mb-8 flex-shrink-0 flex flex-col md:flex-row md:justify-between md:items-end gap-3 md:gap-8">
                  <div className="max-w-2xl">
                    <h2 className="text-3xl md:text-5xl font-serif font-extrabold text-stone-900 dark:text-stone-100 leading-tight">
                      {cleanTitle(category.name)}
                    </h2>
                    <p className="hidden md:block text-lg md:text-xl text-stone-500 dark:text-stone-400 mt-2">
                      {category.description || t('home.discover_treatments', 'Descubre nuestros tratamientos exclusivos.')}
                    </p>
                  </div>
                  <Link
                    href={`/tratamientos/${category.slug || category.id}`}
                    className="self-end md:self-auto inline-flex items-center gap-2 font-bold text-primary hover:text-stone-900 dark:hover:text-white transition-colors uppercase tracking-widest text-[10px] md:text-sm"
                  >
                    <span className="hidden md:inline">{t('home.see_catalog', 'Ver Catálogo')}</span>
                    <span className="md:hidden">{t('home.see_all', 'Ver todo')}</span>
                    <span className="text-xl">→</span>
                  </Link>
                </div>

                {/* ── RENDERIZADO CONDICIONAL POR layout_style DE LA CATEGORÍA ─ */}
                <div className={isSlider ? "flex-1 flex items-stretch w-full py-4 overflow-hidden" : "w-full py-4"}>
                  {layoutStyle === 'cards_slider' && (
                    <div className="w-full flex-1 min-h-0 flex flex-col justify-center pb-8">
                      {/* DESKTOP */}
                      <div className="hidden md:block w-full">
                        {categoryServices.length === 1 && (
                          <div className="max-w-7xl mx-auto px-6">
                            <div className="w-full aspect-[16/9] md:h-[500px]">
                              <ServiceCard service={categoryServices[0]} className="w-full h-full" />
                            </div>
                          </div>
                        )}
                        {categoryServices.length === 2 && (
                          <div className="max-w-7xl mx-auto px-6 flex justify-center gap-8">
                            <div className="w-[372px] h-[662px]">
                              <ServiceCard service={categoryServices[0]} className="w-full h-full" />
                            </div>
                            <div className="w-[372px] h-[662px]">
                              <ServiceCard service={categoryServices[1]} className="w-full h-full" />
                            </div>
                          </div>
                        )}
                        {categoryServices.length >= 3 && (
                          <TreatmentCarousel servicios={categoryServices} loop={true} />
                        )}
                      </div>

                      {/* MOBILE VIEW */}
                      <div className="md:hidden flex overflow-x-auto snap-x-mandatory hide-scroll gap-4 px-6 items-stretch w-full flex-1 min-h-0 pb-4">
                        {categoryServices.map((svc: any) => (
                          <ServiceCard key={svc.id} service={svc} className="snap-stop-always" />
                        ))}
                      </div>
                    </div>
                  )}

                  {layoutStyle === 'bento_grid' && (
                    <BentoCategoryGrid services={categoryServices} />
                  )}

                  {layoutStyle === 'traditional_grid' && (
                    <TraditionalCategoryGrid services={categoryServices} />
                  )}

                  {layoutStyle === 'minimalist_list' && (
                    <MinimalistCategoryList services={categoryServices} />
                  )}
                </div>
              </section>
            );
          }

          // ── CTA ───────────────────────────────────────────────────────────
          if (section.type === 'cta') {
            return (
              <section key="cta" className="flex flex-col justify-center w-full py-24 bg-primary text-primary-foreground text-center px-6 h-[100dvh] snap-start snap-stop-always md:h-auto md:snap-none">
                <div className="max-w-3xl mx-auto space-y-8 animate-in zoom-in-95 duration-700 w-full">
                  <h2 className="text-5xl md:text-6xl font-extrabold tracking-tight">
                    {cleanTitle(translate(content.cta_title, content.translations, 'cta_title'))}
                  </h2>
                  <p className="text-xl md:text-2xl font-medium opacity-90">
                    {translate(content.cta_subtitle, content.translations, 'cta_subtitle')}
                  </p>
                  <div className="pt-6">
                    <a href={content.cta_button_link} className="inline-block bg-stone-900 dark:bg-stone-950 text-white dark:text-stone-100 px-12 py-6 rounded-[var(--radius-btn)] font-bold text-xl hover:bg-stone-800 dark:hover:bg-black transition-all shadow-xl hover:scale-105">
                      {translate(content.cta_button_text, content.translations, 'cta_button_text')}
                    </a>
                  </div>
                </div>
              </section>
            );
          }

          return null;
        })}

        <div className="snap-start snap-stop-always md:snap-none w-full">
          <Footer initialSettings={settings} />
        </div>
      </main>
    </div>
  );
}
