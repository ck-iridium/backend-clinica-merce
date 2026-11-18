'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Edit3, CheckCircle2 } from 'lucide-react';

interface InspectableSectionProps {
  id: string;
  name: string;
  pageSlug?: string;
  blockType?: string;
  children: React.ReactNode;
  className?: string;
}

export default function InspectableSection({
  id,
  name,
  pageSlug = 'home',
  blockType,
  children,
  className = '',
}: InspectableSectionProps) {
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isSelected, setIsSelected] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEmbedded(window.self !== window.top);
    }

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'WEBMASTER_ACTIVE_SELECTION') {
        setIsSelected(e.data.sectionId === id);
      } else if (e.data?.type === 'WEBMASTER_CLEAR_SELECTION') {
        setIsSelected(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id]);

  if (!isEmbedded) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
    // Si el usuario hace clic dentro de un enlace o botón genuino que no sea el wrapper,
    // aún así seleccionamos la sección para el asistente sin romper la navegación si lo desea
    window.parent.postMessage(
      {
        type: 'WEBMASTER_SECTION_SELECTED',
        sectionId: id,
        sectionName: name,
        pageSlug,
        blockType,
      },
      '*'
    );
  };

  return (
    <div
      onClick={handleClick}
      className={`group/inspect relative transition-all duration-300 cursor-pointer rounded-2xl ${
        isSelected
          ? 'ring-3 ring-[#d4af37] ring-offset-4 ring-offset-stone-900/10 shadow-[0_0_40px_rgba(212,175,55,0.3)]'
          : 'hover:ring-2 hover:ring-[#d4af37] hover:ring-offset-2'
      } ${className}`}
    >
      {/* Velo translúcido con brillo dorado al hacer hover */}
      <div 
        className={`absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-30 ${
          isSelected 
            ? 'opacity-100 bg-[#d4af37]/[0.06] border-2 border-[#d4af37]' 
            : 'opacity-0 group-hover/inspect:opacity-100 bg-[#d4af37]/[0.03] border border-[#d4af37]/50'
        }`} 
      />

      {/* Etiqueta Flotante Quiet Luxury de Alta Visibilidad */}
      <div
        className={`absolute top-3 left-3 z-50 pointer-events-none transition-all duration-300 flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[11px] font-semibold shadow-2xl backdrop-blur-xl ${
          isSelected
            ? 'bg-[#d4af37] text-stone-950 border-2 border-white/80 opacity-100 scale-100 shadow-[0_8px_30px_rgba(212,175,55,0.4)]'
            : 'bg-stone-950/95 text-white border border-[#d4af37]/80 opacity-0 group-hover/inspect:opacity-100 scale-95 group-hover/inspect:scale-100 shadow-[0_8px_30px_rgba(0,0,0,0.6)]'
        }`}
      >
        {isSelected ? (
          <>
            <CheckCircle2 size={14} className="text-stone-950 shrink-0" />
            <span className="font-bold tracking-wide">Editando ahora: {name}</span>
          </>
        ) : (
          <>
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]"></span>
            </span>
            <Edit3 size={12} className="text-[#d4af37] shrink-0" />
            <span className="font-medium tracking-wide">Clic para editar · <strong className="font-bold text-[#d4af37]">{name}</strong></span>
          </>
        )}
      </div>

      {children}
    </div>
  );
}
