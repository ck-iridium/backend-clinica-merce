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
  selectedLanguage: 'es' | 'en' | 'fr';
  onSelectLanguage: (lang: 'es' | 'en' | 'fr') => void;
  onRescan: () => void;
  onOptimize: (mode: 'pending' | 'all') => void;
}

const LANGUAGES = [
  { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
];

export default function SeoHeaderBanner({
  loading,
  isOptimizing,
  progress,
  pendingCount,
  totalCount,
  selectedLanguage,
  onSelectLanguage,
  onRescan,
  onOptimize,
}: SeoHeaderBannerProps) {
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  const langNames = {
    es: 'Español',
    en: 'Inglés',
    fr: 'Francés',
  };

  return (
    <>
      <div className="relative overflow-hidden bg-[#1C1917] text-white rounded-3xl py-7 px-6 md:px-8 border border-stone-800 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
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
                Auditor Estratega Multi-idioma
              </span>
            </div>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-2xl font-normal">
              Audita y optimiza el posicionamiento en Google. El orquestador decodifica tarifas y códigos internos a intenciones de búsqueda humanas reales con protección anti-canibalización.
            </p>
          </div>
        </div>

        {/* ── SELECTOR DE IDIOMAS Y DOBLE BOTÓN ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto relative z-10">
          {/* Selector de idiomas del Auditor */}
          <div className="flex items-center gap-1 p-1 bg-stone-900 rounded-2xl border border-stone-800 shadow-inner">
            {LANGUAGES.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onSelectLanguage(lang.code)}
                  disabled={loading || isOptimizing}
                  className={`px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 ${
                    isSelected
                      ? 'bg-[#d4af37] text-stone-950 shadow-sm'
                      : 'text-stone-300 hover:text-white hover:bg-stone-800'
                  }`}
                  title={`Auditar y optimizar en ${lang.label}`}
                >
                  <span className="text-sm leading-none">{lang.flag}</span>
                  <span className="hidden sm:inline">{lang.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
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
                      <p className="text-[11px] text-stone-500">Solo páginas con advertencias, conflictos o sin datos en {langNames[selectedLanguage]}.</p>
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
                      <p className="text-xs font-bold text-[#b08e23]">Forzar re-optimización de todo el catálogo ({totalCount})</p>
                      <p className="text-[11px] text-stone-500">Regenera desde cero y sobrescribe las {totalCount} páginas en {langNames[selectedLanguage]}.</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación FeedbackModal para forzar re-optimización completa */}
      {confirmModalOpen && (
        <FeedbackModal
          type="confirm"
          title={`¿Forzar re-optimización de todo el catálogo en ${langNames[selectedLanguage]}?`}
          message={`Esta acción enviará las ${totalCount} páginas de tu catálogo al Agente Estratega IA para reescribir y regenerar todos los títulos, descripciones, palabras clave y slugs en ${langNames[selectedLanguage].toLowerCase()}. Se sobrescribirán las configuraciones actuales de este idioma al aplicar los cambios. ¿Deseas continuar?`}
          confirmText={`Sí, regenerar las ${totalCount} páginas en ${langNames[selectedLanguage]}`}
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
