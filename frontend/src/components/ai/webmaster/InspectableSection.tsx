'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit3, CheckCircle2, Sparkles } from 'lucide-react';

export function EmbeddedOnly({ children }: { children: React.ReactNode }) {
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEmbedded(window.self !== window.top);
    }
  }, []);

  if (!isEmbedded) return null;
  return <>{children}</>;
}

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
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isScrolledHighlight, setIsScrolledHighlight] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEmbedded(window.self !== window.top);
    }

    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'WEBMASTER_ACTIVE_SELECTION') {
        setIsSelected(e.data.sectionId === id);
      } else if (e.data?.type === 'WEBMASTER_CLEAR_SELECTION') {
        setIsSelected(false);
      } else if (e.data?.type === 'WEBMASTER_SCROLL_TO') {
        if (e.data.sectionId === id) {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setIsScrolledHighlight(true);
          setTimeout(() => setIsScrolledHighlight(false), 2000);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [id]);

  if (!isEmbedded) {
    return <>{children}</>;
  }

  const handleClick = (e: React.MouseEvent) => {
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

  const handleMouseMove = (e: React.MouseEvent) => {
    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY + 16}px, 0)`;
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true);
    if (cardRef.current) {
      cardRef.current.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY + 16}px, 0)`;
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className={`group/inspect relative transition-all duration-300 cursor-pointer rounded-2xl ${
        isSelected
          ? 'ring-3 ring-[#d4af37] ring-offset-4 ring-offset-stone-900/10 shadow-[0_0_40px_rgba(212,175,55,0.35)]'
          : isScrolledHighlight
          ? 'ring-3 ring-[#d4af37] animate-pulse shadow-[0_0_45px_rgba(212,175,55,0.4)]'
          : 'hover:ring-2 hover:ring-[#d4af37] hover:ring-offset-2'
      } ${className}`}
    >
      {/* Velo translúcido con brillo dorado */}
      <div 
        className={`absolute inset-0 pointer-events-none rounded-[inherit] transition-opacity duration-300 z-30 ${
          isSelected || isScrolledHighlight
            ? 'opacity-100 bg-[#d4af37]/[0.06] border-2 border-[#d4af37]' 
            : 'opacity-0 group-hover/inspect:opacity-100 bg-[#d4af37]/[0.03] border border-[#d4af37]/60'
        }`} 
      />

      {/* Ficha Rectangular Flotante con Seguimiento Inmediato (Sin Retraso / 0ms GPU) */}
      {isHovered && !isSelected && (
        <div
          ref={cardRef}
          className="fixed top-0 left-0 pointer-events-none z-[99999] will-change-transform transition-none"
          style={{
            transform: `translate3d(-9999px, -9999px, 0)`,
          }}
        >
          <div className="w-56 p-3 rounded-2xl bg-stone-950/95 text-white border border-[#d4af37]/70 shadow-[0_16px_36px_rgba(0,0,0,0.7)] backdrop-blur-2xl text-left animate-in fade-in zoom-in-95 duration-100">
            <div className="flex items-center gap-1.5 mb-1.5 pb-1 border-b border-white/10">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]" />
              </span>
              <span className="text-[9px] font-black uppercase tracking-[0.16em] text-[#d4af37]">
                Sección Editable
              </span>
            </div>
            <div className="text-xs font-serif font-bold text-amber-50 leading-snug line-clamp-2">
              {name}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-stone-400 font-sans">
              <Edit3 size={11} className="text-[#d4af37] shrink-0" />
              <span>Clic para abrir opciones con IA</span>
            </div>
          </div>
        </div>
      )}

      {/* Etiqueta Activa SOLO cuando está seleccionada (Eliminada etiqueta redundante en hover) */}
      {isSelected && (
        <div className="absolute top-3 left-3 z-40 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-bold bg-[#d4af37] text-stone-950 shadow-md animate-in fade-in duration-200">
          <CheckCircle2 size={13} className="text-stone-950 shrink-0" />
          <span>Editando: {name}</span>
        </div>
      )}

      {children}
    </div>
  );
}
