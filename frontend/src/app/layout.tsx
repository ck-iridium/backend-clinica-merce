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


export async function generateMetadata(): Promise<Metadata> {
  let allowIndexing = false;
  let seoData: any = {
    title: "Clínica Mercè | Estética y Láser",
    description: "Tratamientos de estética avanzada y depilación láser.",
    keywords: [],
    ogImage: ""
  };
  
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  try {
    const resSettings = await fetch(`${baseUrl}/settings/`, { next: { revalidate: 60 } });
    if (resSettings.ok) {
      const data = await resSettings.json();
      allowIndexing = data.allow_search_engine_indexing;
    }
  } catch(e) {}

  try {
    const resContent = await fetch(`${baseUrl}/site-content/`, { next: { revalidate: 60 } });
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
import PublicNavbar from "@/components/PublicNavbar";
import { Providers } from "@/components/Providers";
import InviteHandler from "@/components/InviteHandler";


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body className="antialiased bg-background text-foreground flex flex-col min-h-screen">
        <Providers>
          <InviteHandler />
          <PublicNavbar />
          <main className="flex-grow relative">
            {children}
          </main>
          <LayoutWrapper />
        </Providers>
      </body>
    </html>
  );
}
