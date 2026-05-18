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
    return {
      title: "Clínica Mercè SaaS - Software de Gestión para Clínicas de Estética Premium",
      description: "Eleva la experiencia de tu clínica estética. Gestión de agenda, expedientes médicos, consentimientos digitales y facturación con diseño Quiet Luxury.",
      robots: "index, follow",
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


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = headers();
  const tenantSlug = requestHeaders.get("x-tenant-slug") || "";
  const isMarketing = !tenantSlug || tenantSlug === "www";

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
        </Providers>
      </body>
    </html>
  );
}
