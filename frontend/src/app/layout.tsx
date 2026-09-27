import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond, Playfair, Montserrat, Outfit } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-inter',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant',
  display: 'swap',
});

const playfair = Playfair({
  weight: ['400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-playfair-base',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

const fontClasses = `${inter.variable} ${cormorantGaramond.variable} ${playfair.variable} ${montserrat.variable} ${outfit.variable}`;

function getFontVar(fontName: string, fallback: string): string {
  switch (fontName) {
    case 'Cormorant Garamond':
      return 'var(--font-cormorant), serif';
    case 'Playfair':
    case 'Playfair Display':
      return "var(--font-playfair-base), 'Playfair', 'Playfair Display', serif";
    case 'Montserrat':
      return 'var(--font-montserrat), sans-serif';
    case 'Outfit':
      return 'var(--font-outfit), sans-serif';
    case 'Inter':
      return 'var(--font-inter), sans-serif';
    default:
      return fallback;
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};


import { headers } from "next/headers";
import { resolveTenantContext } from "@/lib/tenant-resolver";

export async function generateMetadata(): Promise<Metadata> {
  const { host, cleanHost, tenantSlug, isMarketing, baseUrl: tenantBaseUrl, apiUrl, tenantId } = await resolveTenantContext();
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || apiUrl;

  if (!baseUrl) {
    console.warn("[layout.tsx] process.env.NEXT_PUBLIC_API_URL is not defined.");
    return {
      title: "Probookia | Software de Gestión Premium",
      description: "Gestión inteligente de citas con diseño Quiet Luxury."
    };
  }

  if (isMarketing) {
    let allowSaasIndexing = false;
    const systemTenantId = process.env.NEXT_PUBLIC_SYSTEM_TENANT_ID;
    if (systemTenantId) {
      try {
        const resSettings = await fetch(`${baseUrl}/settings/`, {
          next: { revalidate: 60 },
          headers: { "X-Tenant-ID": systemTenantId }
        });
        if (resSettings.ok) {
          const data = await resSettings.json();
          allowSaasIndexing = data.allow_search_engine_indexing;
        }
      } catch (e) { }
    }

    const protocol = host.includes('localhost') ? 'http' : 'https';
    const saasCanonical = `${protocol}://${host || 'probookia.com'}`;

    return {
      title: "Probookia | Software de Gestión Premium para Negocios y Centros de Estética, Wellness y Belleza",
      description: "Eleva la experiencia de tu negocio premium. Gestión inteligente de citas, expedientes, consentimientos digitales y facturación integrada con diseño Quiet Luxury.",
      robots: allowSaasIndexing ? "index, follow" : "noindex, nofollow",
      alternates: {
        canonical: saasCanonical,
      },
    };
  }

  const hostParts = host.split('.');
  let resolvedTenantName = "Centro";
  if (hostParts.length > 1 && hostParts[0] !== 'www') {
    resolvedTenantName = hostParts[0]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  let allowIndexing = true;
  let googleVerification: string | undefined = undefined;
  let seoData: any = {
    title: resolvedTenantName,
    description: `Servicios personalizados y bienestar de primer nivel en ${resolvedTenantName}.`,
    keywords: [],
    ogImage: "",
    favicon: ""
  };

  if (tenantId) {
    try {
      const resSettings = await fetch(`${baseUrl}/settings/`, {
        next: { revalidate: 3600, tags: [`tenant-${tenantId}`, `tenant-settings-${tenantId}`] },
        headers: { "X-Tenant-ID": tenantId }
      });
      if (resSettings.ok) {
        const data = await resSettings.json();
        if (data.allow_search_engine_indexing !== undefined) {
          allowIndexing = data.allow_search_engine_indexing;
        }
        if (data.google_site_verification) {
          let cleanCode = data.google_site_verification.trim();
          const match = cleanCode.match(/content=["']([^"']+)["']/i);
          if (match) {
            cleanCode = match[1];
          } else if (cleanCode.includes('=')) {
            cleanCode = cleanCode.split('=').pop()?.replace(/["']/g, '').trim() || cleanCode;
          }
          googleVerification = cleanCode;
        }
        if (data.clinic_name) {
          seoData.title = data.clinic_name;
          seoData.description = data.clinic_description || `Servicios personalizados y bienestar de primer nivel en ${data.clinic_name}.`;
        }
        // Jerarquía de favicon del tenant: favicon_b64 -> logo_app_b64 -> logo_pdf_b64
        seoData.favicon = data.favicon_b64 || data.logo_app_b64 || data.logo_pdf_b64 || "";
      }
    } catch (e) { }

    try {
      const resContent = await fetch(`${baseUrl}/site-content/`, {
        next: { revalidate: 3600, tags: [`tenant-${tenantId}`, `tenant-content-${tenantId}`] },
        headers: { "X-Tenant-ID": tenantId }
      });
      if (resContent.ok) {
        const data = await resContent.json();
        if (data.seo_title) seoData.title = data.seo_title;
        if (data.seo_description) seoData.description = data.seo_description;
        if (data.seo_keywords) seoData.keywords = data.seo_keywords.split(',').map((k: string) => k.trim());
        if (data.hero_image_url) {
          seoData.ogImage = data.hero_image_url.startsWith('/') ? `${baseUrl}${data.hero_image_url}` : data.hero_image_url;
        }
      }
    } catch (e) { }
  }

  const finalFavicon = seoData.favicon || "/favicon_probookia.ico";
  const finalOgImage = seoData.ogImage || seoData.favicon || "/favicon_probookia.ico";
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const tenantCanonical = `${protocol}://${host}`;

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    robots: allowIndexing ? "index, follow" : "noindex, nofollow",
    alternates: {
      canonical: tenantCanonical,
    },
    verification: googleVerification ? {
      google: googleVerification,
    } : undefined,
    icons: {
      icon: finalFavicon,
      shortcut: finalFavicon,
      apple: finalFavicon,
    },
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      images: finalOgImage ? [{ url: finalOgImage }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seoData.title,
      description: seoData.description,
      images: finalOgImage ? [finalOgImage] : [],
    }
  };
}

import LayoutWrapper from "@/components/LayoutWrapper";
import { Providers } from "@/components/Providers";
import InviteHandler from "@/components/InviteHandler";
import TenantInitializer from "@/components/TenantInitializer";
import TenantTracking from "@/components/analytics/TenantTracking";
import JsonLd from "@/components/seo/JsonLd";

import { CreditCard, Sparkles } from "lucide-react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = headers();
  const tenantSlug = requestHeaders.get("x-tenant-slug") || "";
  const pathname = requestHeaders.get("x-pathname") || "";
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/super-admin') || pathname.startsWith('/login');
  const isMarketing = (!tenantSlug || tenantSlug === "www") && !isDashboardRoute;
  const isBypassRoute = pathname.startsWith("/super-admin") || pathname.startsWith("/login");

  console.log('[RootLayout SSR Debug]', {
    tenantSlug,
    pathname,
    isMarketing,
    isBypassRoute,
    tenantId: requestHeaders.get("x-tenant-id")
  });

  let settings: any = null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const tenantId = requestHeaders.get("x-tenant-id");

  let isSuspended = false;
  if (baseUrl && tenantId && !isMarketing && !isBypassRoute) {
    try {
      const resSettings = await fetch(`${baseUrl}/settings/`, {
        cache: 'no-store',
        headers: { "X-Tenant-ID": tenantId }
      });
      if (resSettings.status === 402) {
        isSuspended = true;
      } else if (resSettings.ok) {
        settings = await resSettings.json();
      }
    } catch (e) { }
  }

  let marketingFavicon = "/favicon_probookia.ico";
  if (isMarketing && baseUrl) {
    try {
      const resPub = await fetch(`${baseUrl}/super-admin/marketing/public`, {
        next: { revalidate: 3600, tags: ['marketing-public'] }
      });
      if (resPub.ok) {
        const data = await resPub.json();
        if (data.settings?.favicon_url) {
          marketingFavicon = data.settings.favicon_url;
        }
      }
    } catch (e) {}
  }

  if (isSuspended) {
    if (isDashboardRoute) {
      // ── PANTALLA PRIVADA PARA EL PROPIETARIO (Dashboard) ──
      const bizumPhone = process.env.NEXT_PUBLIC_BIZUM_PHONE || "+34 630 338 538";
      const cleanPhone = bizumPhone.replace(/[^0-9]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent("Hola, deseo reactivar la suscripción de mi clínica en ProBookia.")}`;

      return (
        <html lang="es" suppressHydrationWarning className={fontClasses}>
          <body className="antialiased bg-[#F7F7F5] text-[#1F2937] flex items-center justify-center min-h-screen p-6 font-sans">
            <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-12 shadow-luxury border border-[#d4af37]/20 text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-2 bg-[#d4af37]"></div>

              <div className="w-16 h-16 bg-[#fcf8e5] text-[#b08e23] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CreditCard className="w-8 h-8" />
              </div>

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] block mb-2">Panel Administrativo</span>
              <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-[#1F2937] leading-tight mb-4">
                Suscripción Pendiente
              </h1>

              <p className="text-stone-500 font-medium text-xs leading-relaxed mb-6">
                El acceso al panel de control de esta clínica requiere renovación. Puedes reactivar tu cuenta de inmediato mediante Bizum o contactando con soporte.
              </p>

              <div className="bg-[#FAF8F5] border border-[#d4af37]/30 rounded-2xl p-4 mb-6 text-left">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block mb-1">Reactivación Rápida con Bizum</span>
                <p className="text-xs font-bold text-stone-800">
                  Bizum al: <span className="font-mono text-[#b08e23] font-black">{bizumPhone}</span>
                </p>
                <p className="text-[10px] text-stone-400 mt-1">Indica el nombre de tu clínica en el concepto para reactivación inmediata.</p>
              </div>

              <div className="space-y-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#1F2937] hover:bg-[#d4af37] text-white font-bold py-3.5 rounded-xl text-xs shadow-sm transition-all duration-300 active:scale-95"
                >
                  Reactivar por WhatsApp
                </a>
                <a
                  href="/login"
                  className="block w-full bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 font-bold py-3 rounded-xl text-xs transition-all duration-300"
                >
                  Cambiar de Cuenta
                </a>
              </div>
            </div>
          </body>
        </html>
      );
    } else {
      // ── PANTALLA PÚBLICA PARA CLIENTES / PACIENTES (Aceternity Quiet Luxury) ──
      // Cero mención a impagos: Discreta, minimalista y con branding sutil de ProBookia
      return (
        <html lang="es" suppressHydrationWarning className={fontClasses}>
          <body className="antialiased bg-[#FAF9F6] text-[#1c1917] flex items-center justify-center min-h-screen p-6 font-sans relative overflow-hidden select-none">
            {/* 1. Fondo de cuadrícula sutil (Aceternity style) */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e1cc_1px,transparent_1px)] [background-size:28px_28px] opacity-60 pointer-events-none"></div>

            {/* 2. Halo de luz dorada ambiental (Glow) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] bg-gradient-to-tr from-[#d4af37]/15 to-amber-200/10 rounded-full blur-[130px] pointer-events-none"></div>

            {/* 3. Tarjeta Monolítica Glassmorphism */}
            <div className="max-w-md w-full bg-white/70 backdrop-blur-2xl rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_70px_-20px_rgba(212,175,55,0.12)] border border-white/80 relative z-10 text-center">
              
              {/* Monograma ProBookia */}
              <div className="w-16 h-16 rounded-[1.25rem] bg-gradient-to-b from-[#1c1917] to-stone-900 text-[#d4af37] border border-[#d4af37]/30 shadow-xl shadow-stone-900/10 flex items-center justify-center mx-auto mb-5">
                <span className="font-serif text-3xl font-bold tracking-tighter">P</span>
              </div>

              {/* Logo y Sello */}
              <div className="inline-flex items-center justify-center gap-2 mb-6">
                <span className="font-serif tracking-[0.3em] text-sm font-semibold text-stone-900 uppercase">
                  PROBOOKIA
                </span>
                <span className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full bg-[#fcf8e5] text-[#b08e23] border border-[#e5e1cc] font-bold">
                  SaaS
                </span>
              </div>

              {/* Mensaje Neutro y Discreto */}
              <h1 className="text-xl md:text-2xl font-serif text-stone-850 font-medium tracking-tight mb-2">
                Portal Temporalmente en Pausa
              </h1>

              <p className="text-xs text-stone-400 font-sans max-w-xs mx-auto leading-relaxed mb-8">
                Este espacio no se encuentra disponible actualmente.
              </p>

              {/* Publicidad Sutil ProBookia */}
              <div className="pt-6 border-t border-stone-100 flex flex-col items-center">
                <a
                  href="/marketing"
                  className="group inline-flex items-center gap-1.5 text-[11px] font-medium text-stone-500 hover:text-stone-950 transition-colors py-1 px-3 rounded-full hover:bg-stone-50/80"
                >
                  <span>Tecnología y reservas para clínicas de autor</span>
                  <span className="text-[#d4af37] group-hover:translate-x-0.5 transition-transform text-xs">↗</span>
                </a>
              </div>
            </div>
          </body>
        </html>
      );
    }
  }

  if (isMarketing) {
    return (
      <html lang="es" suppressHydrationWarning className={fontClasses}>
        <head>
          <link rel="icon" href={marketingFavicon} />
          <link rel="preconnect" href="https://ypimdbkiuguiszaddzaj.supabase.co" crossOrigin="anonymous" />
          <link rel="dns-prefetch" href="https://ypimdbkiuguiszaddzaj.supabase.co" />
          <style dangerouslySetInnerHTML={{
            __html: `
            :root {
              --font-heading: var(--font-inter), sans-serif !important;
              --font-playfair: var(--font-inter), sans-serif !important;
              --font-cormorant: var(--font-inter), sans-serif !important;
              --font-inter: var(--font-inter), sans-serif !important;
            }
          ` }} />
        </head>
        <body className="antialiased bg-white text-stone-900 flex flex-col min-h-screen">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    );
  }

  // ── CÁLCULO DE VALORES DE MARCA DINÁMICOS ──
  const primaryColor = settings?.accent_color_primary || settings?.accent_color || '#d4af37';
  const secondaryColor = settings?.accent_color_secondary || '#1c1917';
  const primaryHsl = hexToHsl(primaryColor);
  const secondaryHsl = hexToHsl(secondaryColor);
  const isDark = settings?.dark_mode_enabled || false;
  const borderRadiusStyle = settings?.border_radius || 'suave';
  const headingsFont = settings?.branding_font_headings || 'Playfair';
  const bodyFont = settings?.branding_font_body || 'Inter';
  const favicon = settings?.favicon_b64 || settings?.logo_app_b64 || settings?.logo_pdf_b64 || '/favicon_probookia.ico';

  let radiusBase = "1rem";
  let radiusCard = "1.5rem";
  let radiusBtn = "0.75rem";

  if (borderRadiusStyle === 'recto') {
    radiusBase = "0px";
    radiusCard = "0px";
    radiusBtn = "0px";
  } else if (borderRadiusStyle === 'organico') {
    radiusBase = "1.5rem";
    radiusCard = "2.5rem";
    radiusBtn = "9999px";
  }

  const host = requestHeaders.get("host") || "";
  const localBusinessSchema = (!isMarketing && !isDashboardRoute && settings) ? {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": settings.clinic_name || "Centro de Estética",
    "description": settings.clinic_description || settings.seo_description || undefined,
    "url": host ? `https://${host}` : undefined,
    "telephone": settings.clinic_phone || undefined,
    "email": settings.clinic_email || undefined,
    "address": settings.clinic_address ? {
      "@type": "PostalAddress",
      "streetAddress": settings.clinic_address,
      "addressCountry": "ES"
    } : undefined,
    "image": settings.logo_app_b64 || undefined,
    "priceRange": "€€",
    ...(settings.operations_center_latitude && settings.operations_center_longitude ? {
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": settings.operations_center_latitude,
        "longitude": settings.operations_center_longitude
      }
    } : {}),
    ...(settings.open_time && settings.close_time ? {
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          "opens": settings.open_time,
          "closes": settings.close_time
        }
      ]
    } : {}),
    ...(settings.instagram_url || settings.maps_url ? {
      "sameAs": [settings.instagram_url, settings.maps_url].filter(Boolean)
    } : {})
  } : null;

  return (
    <html lang="es" suppressHydrationWarning className={`${fontClasses} ${isDark && !isDashboardRoute ? 'dark' : ''}`}>
      <head>
        <link rel="icon" href={favicon} />
        <link rel="preconnect" href="https://ypimdbkiuguiszaddzaj.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://ypimdbkiuguiszaddzaj.supabase.co" />
        {localBusinessSchema && <JsonLd id="tenant-business-jsonld" data={localBusinessSchema} />}
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --primary: ${primaryHsl} !important;
            --secondary: ${secondaryHsl} !important;
            --ring: ${primaryHsl} !important;
            --radius-base: ${radiusBase} !important;
            --radius-card: ${radiusCard} !important;
            --radius-btn: ${radiusBtn} !important;
            ${isDashboardRoute ? `
            --font-heading: var(--font-inter), sans-serif !important;
            --font-playfair: var(--font-inter), sans-serif !important;
            --font-cormorant: var(--font-inter), sans-serif !important;
            ` : `
            --font-heading: ${getFontVar(headingsFont, "var(--font-playfair-base), 'Playfair', 'Playfair Display', serif")} !important;
            --font-cormorant: ${getFontVar(headingsFont, 'var(--font-cormorant), serif')} !important;
            --font-playfair: ${getFontVar(headingsFont, "var(--font-playfair-base), 'Playfair', 'Playfair Display', serif")} !important;
            --font-inter: ${getFontVar(bodyFont, 'var(--font-inter), sans-serif')} !important;
            `}
          }
        ` }} />
      </head>
      <body className="antialiased bg-background text-foreground flex flex-col min-h-screen">
        <Providers>
          <TenantInitializer />
          <InviteHandler />
          <TenantTracking settings={settings} />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}

function hexToHsl(hex: string): string {
  hex = hex.replace(/^#/, '');

  if (!/^[0-9A-Fa-f]{6}$/.test(hex)) {
    return "46 65% 52%";
  }

  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;

  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}
