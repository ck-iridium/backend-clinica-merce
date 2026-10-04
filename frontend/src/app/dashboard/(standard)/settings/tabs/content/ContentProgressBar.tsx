"use client";

import React from 'react';
import { Sparkles, Languages } from 'lucide-react';
import { ContentOptimizationProgress } from './types';

interface ContentProgressBarProps {
  progress: ContentOptimizationProgress;
}

export default function ContentProgressBar({ progress }: ContentProgressBarProps) {
  return (
    <div className="rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#1C1917] via-[#26221c] to-[#1C1917] text-white p-5 md:p-7 shadow-xl animate-in slide-in-from-top-2 duration-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3.5">
            <span className="p-2.5 rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30 shrink-0 shadow-inner">
              <Sparkles size={20} className="animate-pulse" />
            </span>
            <div className="space-y-0.5">
              <h4 className="font-serif font-semibold text-base text-white flex items-center gap-2 flex-wrap">
                Redactando y Traduciendo Contenidos con IA
                <span className="font-mono text-xs font-normal text-stone-400 bg-stone-800/80 px-2 py-0.5 rounded-md border border-stone-700">
                  Entidad {progress.current} de {progress.total}
                </span>
              </h4>
              <p className="text-xs text-stone-300 line-clamp-1">
                Lote actual: <span className="text-[#D4AF37] font-medium">{progress.currentTitle}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {progress.failedCount > 0 && (
              <span className="text-[11px] font-medium text-rose-300 bg-rose-950/70 border border-rose-800/70 px-2.5 py-1 rounded-full">
                {progress.failedCount} con error
              </span>
            )}
            <span className="font-mono text-xs md:text-sm font-bold text-[#D4AF37] bg-[#D4AF37]/15 border border-[#D4AF37]/30 px-3.5 py-1 rounded-xl shadow-inner">
              {progress.percent}%
            </span>
          </div>
        </div>

        {/* Barra de Progreso Fluida */}
        <div className="w-full bg-stone-900/90 rounded-full h-3 overflow-hidden border border-stone-700/60 p-0.5 shadow-inner">
          <div
            className="bg-gradient-to-r from-[#b38f26] via-[#D4AF37] to-[#f3d97d] h-full rounded-full transition-all duration-300 ease-out shadow-sm"
            style={{ width: `${Math.max(4, progress.percent)}%` }}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-400 gap-1 font-sans">
          <span className="flex items-center gap-1.5">
            <Languages size={14} className="text-[#D4AF37]" />
            <span>Generando simultáneamente en Español (ES), Inglés (EN) y Francés (FR)</span>
          </span>
          <span className="text-stone-300 font-medium">Lotes de 3 entidades para máxima riqueza literaria</span>
        </div>
      </div>
    </div>
  );
}
