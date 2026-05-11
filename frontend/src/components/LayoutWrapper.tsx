"use client"
import { usePathname } from 'next/navigation';
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";
import ScrollToTop from "./ScrollToTop";

export default function LayoutWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) return null;
  const isHome = pathname === '/';
  const isTreatmentDetail = pathname?.startsWith('/tratamientos/');

  return (
    <>
      {(!isHome && !isTreatmentDetail) && <Footer />}
      <ScrollToTop />
      <CookieBanner />
    </>
  );
}
