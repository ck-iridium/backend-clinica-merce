'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';

interface CoachTooltipProps {
  targetId: string;
  content: string;
  onClose: () => void;
}

export default function CoachTooltip({ targetId, content, onClose }: CoachTooltipProps) {
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Posicionar el tooltip debajo del elemento, centrado horizontalmente
          setCoords({
            top: rect.bottom + window.scrollY + 12,
            left: rect.left + window.scrollX + rect.width / 2,
          });
        }
      }
    };

    const timer = setTimeout(updatePosition, 200);

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [targetId]);

  if (!coords) return null;

  return (
    <div
      className="absolute z-[9999] -translate-x-1/2 flex flex-col items-center pointer-events-auto"
      style={{ top: coords.top, left: coords.left }}
    >
      {/* Flecha apuntando hacia arriba */}
      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white drop-shadow-[0_-1px_1px_rgba(212,175,55,0.1)]"></div>
      
      {/* Contenedor del Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="bg-white/95 backdrop-blur-md border border-[#d4af37]/35 rounded-2xl p-4 shadow-[0_10px_35px_-5px_rgba(212,175,55,0.18)] max-w-xs relative flex items-start gap-3 border-l-4 border-l-[#d4af37]"
      >
        <div className="mt-0.5 text-[#d4af37] shrink-0">
          <Sparkles size={14} className="animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-[12.5px] font-sans font-semibold leading-relaxed text-stone-800">
            {content}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-700 transition-colors p-0.5 rounded-full hover:bg-stone-100 shrink-0"
        >
          <X size={14} />
        </button>
      </motion.div>
    </div>
  );
}
