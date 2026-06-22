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

  // 1. Efecto para inyectar estilos de resaltado dinámicos y agregarlos al elemento objetivo
  useEffect(() => {
    const styleId = 'coach-tooltip-highlight-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;
    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      styleElement.innerHTML = `
        @keyframes coachHighlightPulse {
          0% {
            box-shadow: 0 0 0 0px rgba(212, 175, 55, 0.9), 0 0 0 1px rgba(212, 175, 55, 0.5);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(212, 175, 55, 0), 0 0 0 12px rgba(212, 175, 55, 0);
          }
          100% {
            box-shadow: 0 0 0 0px rgba(212, 175, 55, 0), 0 0 0 0px rgba(212, 175, 55, 0);
          }
        }
        .coach-target-highlight {
          outline: 2.5px solid #d4af37 !important;
          outline-offset: 3px !important;
          animation: coachHighlightPulse 1.8s infinite ease-in-out !important;
          transition: outline-color 0.3s ease !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    const element = document.getElementById(targetId);
    if (element) {
      element.classList.add('coach-target-highlight');
    }

    return () => {
      if (element) {
        element.classList.remove('coach-target-highlight');
      }
    };
  }, [targetId]);

  // 2. Efecto para posicionar el tooltip
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // 20 * 200ms = 4 segundos

    const updatePosition = () => {
      const element = document.getElementById(targetId);
      if (element) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          // Posicionar el tooltip debajo del elemento, centrado horizontalmente
          setCoords({
            top: rect.bottom + window.scrollY + 16,
            left: rect.left + window.scrollX + rect.width / 2,
          });
          return true;
        }
      }
      return false;
    };

    // Intentar de inmediato
    const success = updatePosition();

    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    let intervalId: any = null;
    if (!success) {
      intervalId = setInterval(() => {
        attempts++;
        if (updatePosition() || attempts >= maxAttempts) {
          clearInterval(intervalId);
        }
      }, 200);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
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
      <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[8px] border-b-white drop-shadow-[0_-2px_2px_rgba(212,175,55,0.25)]"></div>
      
      {/* Contenedor del Tooltip */}
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.95 }}
        animate={{ 
          opacity: 1, 
          y: [0, -6, 0], 
          scale: 1 
        }}
        exit={{ opacity: 0, y: 12, scale: 0.95 }}
        transition={{ 
          y: {
            repeat: Infinity,
            duration: 2.8,
            ease: "easeInOut"
          },
          opacity: { duration: 0.3 },
          scale: { duration: 0.3 }
        }}
        className="bg-white/95 backdrop-blur-md border border-[#d4af37]/45 rounded-2xl p-4 shadow-[0_15px_45px_-8px_rgba(212,175,55,0.25)] w-80 sm:w-96 max-w-[calc(100vw-32px)] relative flex items-start gap-3 border-l-4 border-l-[#d4af37]"
      >
        <div className="mt-0.5 text-[#d4af37] shrink-0">
          <Sparkles size={16} className="animate-pulse" />
        </div>
        <div className="flex-1">
          <p className="text-[12.5px] font-sans font-semibold leading-relaxed text-stone-800">
            {content}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-stone-400 hover:text-stone-700 transition-colors p-1 rounded-full hover:bg-stone-100 shrink-0"
        >
          <X size={14} />
        </button>
      </motion.div>
    </div>
  );
}
