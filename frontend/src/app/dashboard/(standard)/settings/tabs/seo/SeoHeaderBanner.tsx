"use client";

import React, { useState } from 'react';
import { Sparkles, RefreshCw, ChevronDown, Target, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import FeedbackModal from '@/components/FeedbackModal';
import { OptimizationProgress } from './types';

interface SeoHeaderBannerProps {
  loading: boolean;
  isOptimizing: boolean;
  progress: OptimizationProgress | null;
  pendingCount: number;
  totalCount: number;
  onRescan: () => void;
  onOptimize: (mode: 'pending' | 'all') => void;
}

export default function SeoHeaderBanner({
  loading,
  isOptimizing,
  progress,
  pendingCount,
  totalCount,
  onRescan,
  onOptimize,
}: SeoHeaderBannerProps) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  return (
    <>
      <div className="relative overflow-hidden bg-[#1C1917] text-white rounded-3xl py-7 px-6 md:px-8 border border-stone-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="flex items-start md:items-center gap-5 relative z-10">
          <span className="w-13 h-13 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 shadow-inner p-3">
            <Sparkles size={24} strokeWidth={1.5} />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xl md:text-2xl font-serif font-semibold tracking-wide text-white">
                SEO & Posicionamiento Local
              </h3>
              <span className="bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
                Escáner Híbrido IA
              </span>
            </div>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-2xl font-normal">
              Audita y optimiza el posicionamiento orgánico de tu negocio en Google. El algoritmo anti-canibalización
              asigna palabras clave únicas por tratamiento y la IA redacta títulos y descripciones de alto impacto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={onRescan}
            disabled={loading || isOptimizing}
            className="rounded-xl bg-stone-800 hover:bg-stone-700 border-stone-700 hover:border-stone-600 text-white hover:text-white transition-all text-xs font-semibold py-5 px-4 shadow-sm"
          >
            <RefreshCw size={15} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Re-escanear
          </Button>

          {/* Botón Dual (Split Button / Dropdown) para optimización inteligente */}
          <div className="inline-flex rounded-xl shadow-luxury shrink-0">
            <Button
              variant="luxury"
              size="sm"
              onClick={() => onOptimize('pending')}
              disabled={loading || isOptimizing}
              className="rounded-l-xl rounded-r-none font-bold text-xs py-5 px-4 text-stone-950 flex items-center gap-2 active:scale-95 transition-transform"
            >
              <Sparkles size={16} strokeWidth={2} className={isOptimizing ? 'animate-spin' : ''} />
              {isOptimizing && progress
                ? `Optimizando (${progress.current}/${progress.total})...`
                : isOptimizing
                ? 'Optimizando...'
                : pendingCount > 0
                ? `Optimizar pendientes (${pendingCount})`
                : 'Optimizar pendientes (0)'}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="luxury"
                  size="sm"
                  disabled={loading || isOptimizing}
                  className="rounded-r-xl rounded-l-none border-l border-stone-950/20 py-5 px-2.5 text-stone-950 hover:bg-[#e0bc46] transition-colors"
                  aria-label="Más opciones de optimización"
                >
                  <ChevronDown size={15} strokeWidth={2.5} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72 p-2 rounded-2xl bg-white border border-stone-200/80 shadow-2xl space-y-1 z-50">
                <DropdownMenuItem
                  onClick={() => onOptimize('pending')}
                  disabled={loading || isOptimizing}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-stone-50 focus:bg-stone-50 transition-colors"
                >
                  <Target size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-stone-900">Optimizar pendientes ({pendingCount})</p>
                    <p className="text-[11px] text-stone-500">Solo páginas con alertas, conflictos o sin descripción.</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-stone-100 my-1" />
                <DropdownMenuItem
                  onClick={() => setConfirmModalOpen(true)}
                  disabled={loading || isOptimizing}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer hover:bg-amber-50/60 focus:bg-amber-50/60 transition-colors group"
                >
                  <Wand2 size={16} className="text-[#b08e23] mt-0.5 shrink-0 group-hover:rotate-12 transition-transform" />
                  <div>
                    <p className="text-xs font-bold text-[#b08e23]">Regenerar todo el catálogo ({totalCount})</p>
                    <p className="text-[11px] text-stone-500">Salta filtros y reescribe todas las {totalCount} páginas con IA.</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Modal de confirmación FeedbackModal para regeneración completa */}
      {confirmModalOpen && (
        <FeedbackModal
          type="confirm"
          title="¿Regenerar todo el catálogo con IA?"
          message={`Esta acción enviará las ${totalCount} páginas de tu catálogo al Agente Estratega IA para reescribir todos los títulos, descripciones y palabras clave con visión holística. Se sobrescribirán las configuraciones actuales al confirmar y aplicar los cambios. ¿Deseas continuar?`}
          confirmText={`Sí, regenerar las ${totalCount} páginas`}
          cancelText="Cancelar"
          onClose={() => setConfirmModalOpen(false)}
          onConfirmHandler={() => {
            setConfirmModalOpen(false);
            onOptimize('all');
          }}
        />
      )}
    </>
  );
}
