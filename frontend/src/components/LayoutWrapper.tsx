"use client"
import { usePathname } from 'next/navigation';
import Footer from "./Footer";
import PublicNavbar from "./PublicNavbar";
import CookieBanner from "./CookieBanner";
import ScrollToTop from "./ScrollToTop";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) return (
    <>
      {children}
    </>
  );

  const isHome = pathname === '/';
  const isTreatmentDetail = pathname?.startsWith('/tratamientos/');
  
  // En Home y Tratamientos el Navbar y Footer se gestionan internamente 
  // para integrarse con el sistema de scroll/snap
  const useInternalUI = isHome || isTreatmentDetail;

  return (
    <>
      {!useInternalUI && <PublicNavbar />}
      <main className="flex-grow relative">
        {children}
      </main>
      {!useInternalUI && <Footer />}
      <ScrollToTop />
      <CookieBanner />
    </>
  );
}
