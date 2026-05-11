"use client";

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar el botón solo después de bajar 400px
  useEffect(() => {
    const toggleVisibility = () => {
      // Intentamos detectar el scroll tanto del window como del contenedor principal si existe
      const scrollContainer = document.getElementById('main-scroll-container');
      const currentScroll = scrollContainer ? scrollContainer.scrollTop : window.scrollY;
      
      if (currentScroll > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility, true);
    return () => window.removeEventListener('scroll', toggleVisibility, true);
  }, []);

  const scrollToTop = () => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) {
      scrollContainer.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    } else {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  };

  if (!isVisible) return null;

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-8 right-8 z-[150] p-4 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#d4af37] shadow-2xl transition-all duration-500 hover:scale-110 active:scale-95 animate-in fade-in zoom-in group"
      aria-label="Volver arriba"
    >
      <ArrowUp className="w-6 h-6 transition-transform duration-300 group-hover:-translate-y-1" />
      
      {/* Halo de luz suave al pasar el ratón */}
      <div className="absolute inset-0 rounded-full bg-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
    </button>
  );
}
