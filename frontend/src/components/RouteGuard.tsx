'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * RouteGuard
 * 
 * Componente que se encarga de limpiar efectos secundarios residuales (como el bloqueo de scroll
 * de Radix UI / Shadcn Dialog) al cambiar de ruta.
 */
export default function RouteGuard() {
  const pathname = usePathname();

  useEffect(() => {
    // Forzar la liberación del body al cambiar de ruta
    // Esto previene que el pointer-events: none y overflow: hidden 
    // se queden 'pegados' si un modal estaba abierto durante la navegación.
    document.body.style.pointerEvents = 'auto';
    document.body.style.overflow = 'auto';
    
    // Opcional: Limpiar filtros del dashboard si fuera necesario
  }, [pathname]);

  return null;
}
