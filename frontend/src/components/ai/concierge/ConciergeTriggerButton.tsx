'use client';

import React from 'react';
import ChromaticOrb from '../ChromaticOrb';

interface ConciergeTriggerButtonProps {
  isThemeDark: boolean;
  isSpeaking: boolean;
  onOpen: () => void;
}

export default function ConciergeTriggerButton({
  isThemeDark,
  isSpeaking,
  onOpen,
}: ConciergeTriggerButtonProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={
        isThemeDark
          ? 'h-16 w-16 max-sm:h-14 max-sm:w-14 rounded-full bg-stone-950 p-1 text-white shadow-[0_10px_35px_rgba(0,0,0,0.7)] hover:shadow-[0_0_30px_rgba(255,106,0,0.4)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-stone-800 ring-1 ring-white/10 hover:ring-orange-500/50 group select-none'
          : 'h-16 w-16 max-sm:h-14 max-sm:w-14 rounded-full bg-white/95 p-1 text-stone-900 shadow-[0_10px_35px_rgba(212,175,55,0.25)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.45)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-stone-200/90 ring-1 ring-[#d4af37]/25 hover:ring-[#d4af37]/60 group select-none backdrop-blur-md'
      }
      title="Asistente Virtual 24/7"
      aria-label="Abrir Asistente Virtual 24/7"
    >
      {/* Halo ambiental sutil según tema */}
      <span
        className={
          isThemeDark
            ? 'absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-500/25 via-transparent to-amber-500/15 blur-md opacity-25 group-hover:opacity-80 transition-opacity duration-500 pointer-events-none'
            : 'absolute -inset-1 rounded-full bg-gradient-to-tr from-[#d4af37]/30 via-transparent to-orange-400/20 blur-md opacity-35 group-hover:opacity-90 transition-opacity duration-500 pointer-events-none'
        }
      />

      {/* Esfera con el Símbolo del Infinito Naranja Fino y Animado */}
      <ChromaticOrb 
        size="lg" 
        className="w-full h-full" 
        isSpeaking={isSpeaking} 
        theme={isThemeDark ? 'dark' : 'light'} 
      />

      {/* Tooltip flotante Quiet Luxury (Desktop) */}
      <div
        className={
          isThemeDark
            ? 'absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-stone-950/95 backdrop-blur-md border border-stone-800 text-stone-200 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden md:flex items-center gap-2'
            : 'absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-white/95 backdrop-blur-md border border-stone-200 text-stone-800 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden md:flex items-center gap-2'
        }
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <span>¿Dudas con tu cita? Asistente 24/7</span>
      </div>
    </button>
  );
}
