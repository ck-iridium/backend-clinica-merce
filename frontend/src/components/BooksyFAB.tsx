"use client";
import { useState, useEffect } from 'react';

export default function BooksyFAB() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document;
      const scrollY = target === document ? window.scrollY : (target as HTMLElement).scrollTop;
      
      // Mostrar el botón después de scrollear 200px (fuera del Hero)
      if (scrollY !== undefined) {
        if (scrollY > 200) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  return (
    <a
      href="https://booksy.com/es-es/12345_clinica-merce_estetica_12345_madrid" // TODO: Usar link real desde settings
      target="_blank"
      rel="noopener noreferrer"
      className={`
        fixed bottom-8 right-8 z-50
        flex items-center gap-3 px-8 py-4
        bg-[#D4AF37] text-stone-900 font-bold text-lg
        rounded-full shadow-2xl shadow-[#D4AF37]/20
        backdrop-blur-md bg-opacity-90
        transition-all duration-500 transform
        hover:scale-105 active:scale-95
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}
      `}
    >
      <span className="text-xl">📅</span>
      Reservar
    </a>
  );
}
