'use client';

import { useState, useEffect } from 'react';
import ChromaticOrb from './ChromaticOrb';

interface CopilotTriggerButtonProps {
  onClick: () => void;
  isSpeaking: boolean;
}

export default function CopilotTriggerButton({ onClick, isSpeaking }: CopilotTriggerButtonProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const checkDark = () => {
      const hasDarkClass =
        document.documentElement.classList.contains('dark') ||
        document.body.classList.contains('dark');
      setIsDark(hasDarkClass);
    };

    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // Consultar settings para sincronizar si el tenant configuró dark mode
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/settings/`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.dark_mode_enabled === 'boolean') {
          setIsDark(data.dark_mode_enabled);
        }
      })
      .catch(() => {});

    return () => observer.disconnect();
  }, []);

  return (
    <button
      onClick={onClick}
      className={`h-14 w-14 sm:h-16 sm:w-16 rounded-full p-0 flex items-center justify-center relative select-none hover:scale-105 active:scale-95 transition-all duration-300 group focus:outline-none ${
        isDark
          ? 'shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(255,106,0,0.45)]'
          : 'shadow-[0_8px_25px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] hover:shadow-[0_0_25px_rgba(255,107,0,0.35)]'
      }`}
      title="Co-Piloto AI"
      aria-label="Abrir Co-Piloto AI"
    >
      {/* Halo ambiental externo sutil */}
      <span
        className={`absolute -inset-1 rounded-full bg-gradient-to-tr blur-md opacity-25 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none ${
          isDark
            ? 'from-orange-500/25 via-transparent to-amber-500/15'
            : 'from-orange-500/20 via-transparent to-amber-500/10'
        }`}
      />

      {/* Esfera única (clara en modo claro, obsidiana en modo oscuro) con Infinito Naranja animado */}
      <ChromaticOrb
        size="lg"
        className="w-full h-full"
        isSpeaking={isSpeaking}
        theme={isDark ? 'dark' : 'light'}
      />

      {/* Tooltip flotante Quiet Luxury */}
      <div
        className={`absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl border text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden md:flex items-center gap-2 backdrop-blur-md ${
          isDark
            ? 'bg-stone-950/95 border-stone-800 text-stone-200'
            : 'bg-white/95 border-stone-200 text-stone-800 shadow-lg'
        }`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
        <span>Co-Piloto AI</span>
      </div>
    </button>
  );
}
