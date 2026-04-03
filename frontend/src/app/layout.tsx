import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Clínica Mercè | Estética y Láser",
  description: "Tratamientos de estética avanzada y depilación láser.",
  robots: "noindex, nofollow",
};

import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased bg-stone-50 text-stone-900 flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
