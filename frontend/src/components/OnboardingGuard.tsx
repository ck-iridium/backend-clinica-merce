"use client";
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function OnboardingGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Si ya estamos en la página de onboarding, no hacemos redirección para evitar loops
    if (pathname === '/dashboard/onboarding') {
      setLoading(false);
      return;
    }

    const checkOnboarding = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`, {
          cache: 'no-store'
        });
        if (res.ok) {
          const settings = await res.json();
          // Si el onboarding NO está completado, redirigimos obligatoriamente
          if (settings && settings.onboarding_completed === false) {
            router.replace('/dashboard/onboarding');
          }
        }
      } catch (err) {
        console.warn("OnboardingGuard: No se pudo verificar el estado del onboarding.", err);
      } finally {
        setLoading(false);
      }
    };

    checkOnboarding();
  }, [pathname, router]);

  return null;
}
