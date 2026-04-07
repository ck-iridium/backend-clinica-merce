import "./globals.css";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  let allowIndexing = false;
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      allowIndexing = data.allow_search_engine_indexing;
    }
  } catch(e) {}

  return {
    title: "Clínica Mercè | Estética y Láser",
    description: "Tratamientos de estética avanzada y depilación láser.",
    robots: allowIndexing ? "index, follow" : "noindex, nofollow",
  };
}

import LayoutWrapper from "@/components/LayoutWrapper";
import PublicNavbar from "@/components/PublicNavbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased bg-stone-50 text-stone-900 flex flex-col min-h-screen">
        <PublicNavbar />
        <main className="flex-grow relative">
          {children}
        </main>
        <LayoutWrapper />
      </body>
    </html>
  );
}
