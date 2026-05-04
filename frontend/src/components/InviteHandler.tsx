"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function InviteHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Solo ejecutar en el cliente
    if (typeof window === 'undefined') return;

    const hash = window.location.hash;
    if (hash && hash.includes('access_token=') && hash.includes('type=invite')) {
      // Si la URL actual ya es /activar-cuenta, no redirigir para evitar bucles
      if (pathname === '/activar-cuenta') return;

      // Preservar el hash y redirigir a la ruta dedicada de activación
      router.push(`/activar-cuenta${hash}`);
    }
  }, [pathname, router]);

  return null;
}
