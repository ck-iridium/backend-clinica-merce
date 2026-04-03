"use client"
import { usePathname } from 'next/navigation';
import Footer from "./Footer";
import CookieBanner from "./CookieBanner";

export default function LayoutWrapper() {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith('/dashboard');

  if (isDashboard) return null;

  return (
    <>
      <Footer />
      <CookieBanner />
    </>
  );
}
