"use client"
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Footer from "./Footer";
import PublicNavbar from "./PublicNavbar";
import CookieBanner from "./CookieBanner";
import ScrollToTop from "./ScrollToTop";
import FrontEndConciergeWidget from "./ai/FrontEndConciergeWidget";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.self !== window.top && pathname) {
      window.parent.postMessage(
        {
          type: 'WEBMASTER_PAGE_CHANGED',
          pathname,
        },
        '*'
      );
    }
  }, [pathname]);

  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/super-admin') || pathname === '/login';
  const isMarketing = pathname?.startsWith('/marketing') || pathname?.startsWith('/onboarding') || pathname?.startsWith('/docs');

  if (isDashboard || isMarketing) return (
    <>
      {children}
    </>
  );

  const isHome = pathname === '/';
  const isTreatmentDetail = pathname?.startsWith('/tratamientos/');
  const isBooking = pathname === '/reservar';
  
  // En Home, Tratamientos y Reservar el Navbar y Footer se gestionan internamente 
  // para integrarse con el sistema de scroll/snap o inmersión app
  const useInternalUI = isHome || isTreatmentDetail || isBooking;

  const isEmbedded = typeof window !== 'undefined' && window.self !== window.top;

  return (
    <>
      {!useInternalUI && <PublicNavbar />}
      <main className="flex-grow relative">
        {children}
      </main>
      {!useInternalUI && <Footer />}
      {!isBooking && <ScrollToTop />}
      {!isBooking && !isEmbedded && <FrontEndConciergeWidget />}
      <CookieBanner />
    </>
  );
}
