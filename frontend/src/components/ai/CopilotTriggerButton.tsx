'use client';

import ChromaticOrb from './ChromaticOrb';

interface CopilotTriggerButtonProps {
  onClick: () => void;
  isSpeaking: boolean;
}

export default function CopilotTriggerButton({ onClick, isSpeaking }: CopilotTriggerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="h-16 w-16 max-sm:h-14 max-sm:w-14 rounded-full bg-stone-950 p-1 text-white shadow-[0_10px_35px_rgba(0,0,0,0.6)] hover:shadow-[0_0_30px_rgba(255,106,0,0.35)] transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative border border-stone-800 ring-1 ring-white/10 hover:ring-orange-500/40 group select-none"
      title="Co-Piloto AI"
      aria-label="Abrir Co-Piloto AI"
    >
      {/* Halo ambiental externo sutil oscuro con toque naranja en hover */}
      <span className="absolute -inset-1 rounded-full bg-gradient-to-tr from-orange-500/25 via-transparent to-amber-500/15 blur-md opacity-25 group-hover:opacity-75 transition-opacity duration-500 pointer-events-none" />

      {/* Esfera de Cristal Obsidiana con Infinito Naranja Fino y Animado */}
      <ChromaticOrb size="lg" className="w-full h-full" isSpeaking={isSpeaking} />

      {/* Tooltip flotante Quiet Luxury (Desktop) */}
      <div className="absolute right-full mr-3.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-stone-950/95 backdrop-blur-md border border-stone-800 text-stone-200 text-xs font-medium whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 hidden md:flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
        <span>Co-Piloto AI</span>
      </div>
    </button>
  );
}
