'use client';

import React, { useState, useEffect } from 'react';

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
    // Si no es un enlace directo con destino externo, notificar selección
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
      className={`group/inspect relative transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'ring-2 ring-[#d4af37] ring-offset-4 ring-offset-stone-900/10 shadow-[0_0_35px_rgba(212,175,55,0.22)]'
          : 'hover:ring-2 hover:ring-[#d4af37]/60 hover:ring-offset-2'
      } ${className}`}
    >
      {/* Etiqueta flotante Quiet Luxury de inspección */}
      <div
        className={`absolute top-3 left-4 z-40 pointer-events-none transition-all duration-300 flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold shadow-xl backdrop-blur-md ${
          isSelected
            ? 'bg-[#1c1917] text-[#d4af37] border border-[#d4af37]/80 opacity-100 scale-100'
            : 'bg-stone-900/90 text-stone-200 border border-stone-700/80 opacity-0 group-hover/inspect:opacity-100 scale-95 group-hover/inspect:scale-100'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse" />
        <span className="tracking-wide">
          {isSelected ? `📍 Editando: ${name}` : `Toca para editar: ${name}`}
        </span>
      </div>

      {children}
    </div>
  );
}
