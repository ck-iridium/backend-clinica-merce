import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const cormorantGaramond = Cormorant_Garamond({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-cormorant'
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#ffffff',
};


import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = headers();
  const tenantSlug = requestHeaders.get("x-tenant-slug") || "";
  const isMarketing = !tenantSlug || tenantSlug === "www";
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

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

    return {
      title: "Probookia | Software de Gestión Premium para Negocios y Centros de Estética, Wellness y Belleza",
      description: "Eleva la experiencia de tu negocio premium. Gestión inteligente de citas, expedientes, consentimientos digitales y facturación integrada con diseño Quiet Luxury.",
      robots: allowSaasIndexing ? "index, follow" : "noindex, nofollow",
    };
  }

  const host = requestHeaders.get("host") || "";
  const hostParts = host.split('.');
  let resolvedTenantName = "Centro";
  if (hostParts.length > 1 && hostParts[0] !== 'www') {
    resolvedTenantName = hostParts[0]
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  let allowIndexing = false;
  let seoData: any = {
    title: `${resolvedTenantName} | Estética y Láser`,
    description: `Tratamientos de estética avanzada y depilación láser en ${resolvedTenantName}.`,
    keywords: [],
    ogImage: ""
  };

  const tenantId = requestHeaders.get("x-tenant-id");

  if (tenantId) {
    try {
      const resSettings = await fetch(`${baseUrl}/settings/`, {
        next: { revalidate: 60 },
        headers: { "X-Tenant-ID": tenantId }
      });
      if (resSettings.ok) {
        const data = await resSettings.json();
        allowIndexing = data.allow_search_engine_indexing;
        if (data.clinic_name) {
          seoData.title = `${data.clinic_name} | Estética y Láser`;
          seoData.description = `Tratamientos de estética avanzada y depilación láser en ${data.clinic_name}.`;
        }
      }
    } catch (e) { }

    try {
      const resContent = await fetch(`${baseUrl}/site-content/`, {
        next: { revalidate: 60 },
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

  return {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords,
    robots: allowIndexing ? "index, follow" : "noindex, nofollow",
    openGraph: {
      title: seoData.title,
      description: seoData.description,
      images: seoData.ogImage ? [{ url: seoData.ogImage }] : [],
    }
  };
}

import LayoutWrapper from "@/components/LayoutWrapper";
import { Providers } from "@/components/Providers";
import InviteHandler from "@/components/InviteHandler";
import TenantInitializer from "@/components/TenantInitializer";


import { CreditCard } from "lucide-react";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = headers();
  const tenantSlug = requestHeaders.get("x-tenant-slug") || "";
  const pathname = requestHeaders.get("x-pathname") || "";
  const isMarketing = !tenantSlug || tenantSlug === "www";
  const isBypassRoute = pathname.startsWith("/super-admin") || pathname.startsWith("/login");

  let settings: any = null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const tenantId = requestHeaders.get("x-tenant-id");

  let isSuspended = false;
  if (baseUrl && tenantId && !isMarketing && !isBypassRoute) {
    try {
      const resSettings = await fetch(`${baseUrl}/settings/`, {
        cache: 'no-store', // Obtener ajustes en vivo para inyectar marca dinámicamente
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
        next: { revalidate: 60 }
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
    return (
      <html lang="es" suppressHydrationWarning className={`${inter.variable}`}>
        <body className="antialiased bg-[#F7F7F5] text-[#1F2937] flex items-center justify-center min-h-screen p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 md:p-12 shadow-luxury border border-[#d4af37]/20 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-2 bg-[#d4af37]"></div>

            <div className="w-16 h-16 bg-[#fcf8e5] text-[#b08e23] rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-sm">
              <CreditCard className="w-8 h-8" />
            </div>

            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#d4af37] block mb-3">Clínica Inactiva</span>
            <h1 className="text-3xl md:text-4xl font-serif font-extrabold text-[#1F2937] leading-tight mb-6">
              Servicio Suspendido
            </h1>

            <p className="text-stone-500 font-medium text-sm leading-relaxed mb-8">
              El acceso a esta clínica ha sido suspendido temporalmente debido a un pago pendiente o suscripción inactiva. Si eres el propietario, puedes reactivar el acceso realizando tu pago en el panel de control o contactando a soporte técnico.
            </p>

            <div className="space-y-4">
              <a
                href="/login"
                className="block w-full bg-[#1F2937] hover:bg-[#d4af37] text-white font-bold py-3.5 rounded-xl text-sm shadow-sm transition-all duration-300 active:scale-95"
              >
                Acceder al Panel de Control
              </a>
              <a
                href="mailto:soporte@merce-saas.com"
                className="block w-full bg-white hover:bg-stone-50 text-stone-600 border border-stone-200 font-bold py-3.5 rounded-xl text-sm transition-all duration-300"
              >
                Contactar con Soporte B2B
              </a>
            </div>
          </div>
        </body>
      </html>
    );
  }

  if (isMarketing) {
    return (
      <html lang="es" suppressHydrationWarning className={`${inter.variable} ${cormorantGaramond.variable}`}>
        <head>
          <link rel="icon" href={marketingFavicon} />
          <style dangerouslySetInnerHTML={{
            __html: `
            :root {
              --font-playfair: var(--font-cormorant) !important;
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
  const headingsFont = settings?.branding_font_headings || 'Playfair Display';
  const bodyFont = settings?.branding_font_body || 'Inter';
  const favicon = settings?.favicon_b64 || '/favicon_tenant.ico';

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

  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/super-admin') || pathname.startsWith('/login');

  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${cormorantGaramond.variable} ${isDark && !isDashboardRoute ? 'dark' : ''}`}>
      <head>
        <link rel="icon" href={favicon} type="image/x-icon" />
        <style dangerouslySetInnerHTML={{
          __html: `
          :root {
            --primary: ${primaryHsl} !important;
            --secondary: ${secondaryHsl} !important;
            --ring: ${primaryHsl} !important;
            --radius-base: ${radiusBase} !important;
            --radius-card: ${radiusCard} !important;
            --radius-btn: ${radiusBtn} !important;
            --font-cormorant: '${headingsFont}', serif !important;
            --font-playfair: '${headingsFont}', serif !important;
            --font-inter: '${bodyFont}', sans-serif !important;
          }
        ` }} />
      </head>
      <body className="antialiased bg-background text-foreground flex flex-col min-h-screen">
        <Providers>
          <TenantInitializer />
          <InviteHandler />
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
