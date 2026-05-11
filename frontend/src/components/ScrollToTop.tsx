"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = (e: any) => {
      // Capturamos el scroll del target (puede ser window o un div con overflow)
      const target = e.target === document ? window.scrollY : (e.target.scrollTop || 0);
      
      // Bajamos el umbral a 300px para que sea más evidente
      if (target > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    // Usamos capture: true para detectar scroll en contenedores internos (como el snap container)
    window.addEventListener('scroll', toggleVisibility, true);
    return () => window.removeEventListener('scroll', toggleVisibility, true);
  }, []);

  const scrollToTop = () => {
    // Intentamos subir en todos los niveles posibles
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const containers = document.querySelectorAll('.overflow-y-auto');
    containers.forEach(container => {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-[200] p-4 rounded-full bg-white/80 backdrop-blur-xl border border-stone-200 text-[#d4af37] shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 animate-in fade-in zoom-in group"
      aria-label="Volver arriba"
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-300 group-hover:-translate-y-1" />
      <div className="absolute inset-0 rounded-full bg-[#d4af37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-lg"></div>
    </button>
  );
}
