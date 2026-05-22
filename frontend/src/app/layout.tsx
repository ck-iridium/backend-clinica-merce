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

  if (isMarketing) {
    let allowSaasIndexing = false;
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const resSettings = await fetch(`${baseUrl}/settings/`, { 
        next: { revalidate: 60 },
        headers: { "X-Tenant-ID": "00000000-0000-0000-0000-000000000001" }
      });
      if (resSettings.ok) {
        const data = await resSettings.json();
        allowSaasIndexing = data.allow_search_engine_indexing;
      }
    } catch(e) {}

    return {
      title: "Probookia | Software de Gestión Premium para Negocios y Centros de Estética, Wellness y Belleza",
      description: "Eleva la experiencia de tu negocio premium. Gestión inteligente de citas, expedientes, consentimientos digitales y facturación integrada con diseño Quiet Luxury.",
      robots: allowSaasIndexing ? "index, follow" : "noindex, nofollow",
    };
  }

  let allowIndexing = false;
  let seoData: any = {
    title: "Estetica Merce | Estética y Láser",
    description: "Tratamientos de estética avanzada y depilación láser.",
    keywords: [],
    ogImage: ""
  };
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const tenantId = requestHeaders.get("x-tenant-id") || '00000000-0000-0000-0000-000000000001';

  try {
    const resSettings = await fetch(`${baseUrl}/settings/`, { 
      next: { revalidate: 60 },
      headers: { "X-Tenant-ID": tenantId }
    });
    if (resSettings.ok) {
      const data = await resSettings.json();
      allowIndexing = data.allow_search_engine_indexing;
    }
  } catch(e) {}

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
  } catch(e) {}

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
import AICopilotWidget from '@/components/ai/AICopilotWidget';


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

  let isSuspended = false;
  if (!isMarketing && !isBypassRoute) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const tenantId = requestHeaders.get("x-tenant-id") || '00000000-0000-0000-0000-000000000001';
      const resSettings = await fetch(`${baseUrl}/settings/`, {
        cache: 'no-store', // Comprobar estado en vivo
        headers: { "X-Tenant-ID": tenantId }
      });
      if (resSettings.status === 402) {
        isSuspended = true;
      }
    } catch(e) {}
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
      <html lang="es" suppressHydrationWarning className={`${inter.variable}`}>
        <body className="antialiased bg-[#F7F7F5] text-[#1F2937] flex flex-col min-h-screen">
          <Providers>
            {children}
          </Providers>
        </body>
      </html>
    );
  }

  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body className="antialiased bg-background text-foreground flex flex-col min-h-screen">
        <Providers>
          <TenantInitializer />
          <InviteHandler />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <AICopilotWidget />
        </Providers>
      </body>
    </html>
  );
}
