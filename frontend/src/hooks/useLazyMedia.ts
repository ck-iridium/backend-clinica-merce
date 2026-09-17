"use client";

import { useEffect, useRef, useState } from 'react';

interface UseLazyMediaOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

/**
 * Hook reutilizable para Lazy Loading de elementos pesados (vídeos / iframes / canvas).
 * - Utiliza la API nativa de IntersectionObserver.
 * - Por defecto, `rootMargin: '200px'` anticipa la carga justo antes de que el elemento sea visible.
 * - `hasTriggered` asegura que una vez cargado, no vuelva a desmontarse innecesariamente.
 */
export function useLazyMedia<T extends HTMLElement = HTMLElement>(options: UseLazyMediaOptions = {}) {
  const { threshold = 0.1, rootMargin = '200px', triggerOnce = true } = options;
  const elementRef = useRef<T>(null);
  const [isInView, setIsInView] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el || (triggerOnce && hasTriggered)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasTriggered(true);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce, hasTriggered]);

  return { elementRef, isInView, hasTriggered };
}
