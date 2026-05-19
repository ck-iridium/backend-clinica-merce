"use client"
import { usePathname } from 'next/navigation';
import Footer from "./Footer";
import PublicNavbar from "./PublicNavbar";
import CookieBanner from "./CookieBanner";
import ScrollToTop from "./ScrollToTop";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard') || pathname?.startsWith('/super-admin') || pathname === '/login';

  if (isDashboard) return (
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

  return (
    <>
      {!useInternalUI && <PublicNavbar />}
      <main className="flex-grow relative">
        {children}
      </main>
      {!useInternalUI && <Footer />}
      {!isBooking && <ScrollToTop />}
      <CookieBanner />
    </>
  );
}
