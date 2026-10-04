"use client";

import React, { useState } from 'react';
import { Sparkles, RefreshCw, ChevronDown, Target, Wand2, Globe2 } from 'lucide-react';
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
      <div className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 md:p-9 border border-stone-200/80 shadow-[0_12px_44px_-16px_rgba(0,0,0,0.04)] transition-all">
        {/* Aura luminosa dorada sutil de fondo */}
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-gradient-to-br from-[#d4af37]/10 via-amber-100/20 to-transparent blur-3xl pointer-events-none" />

        {/* ── FILA SUPERIOR: TÍTULO, BADGE Y SELECTOR DE IDIOMAS ── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <span className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#B38F26] shrink-0 shadow-sm p-3">
              <Sparkles size={24} strokeWidth={1.75} />
            </span>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-stone-900 tracking-tight">
                  SEO & Posicionamiento Local
                </h3>
                <span className="bg-amber-50 text-[#997300] text-[10px] sm:text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200/60 shadow-xs">
                  Auditor Estratega Multi-idioma
                </span>
              </div>
            </div>
          </div>

          {/* Selector de idiomas con estilo segmented pill */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-start">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-stone-400 uppercase tracking-wider mr-1">
              <Globe2 size={14} className="text-stone-400" />
              <span>Idioma:</span>
            </div>
            <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/80 shadow-inner w-full sm:w-auto justify-center">
              {LANGUAGES.map((lang) => {
                const isSelected = selectedLanguage === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => onSelectLanguage(lang.code)}
                    disabled={loading || isOptimizing}
                    className={`px-3.5 py-2 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 ${
                      isSelected
                        ? 'bg-white text-stone-900 font-bold shadow-sm border border-stone-200/70'
                        : 'text-stone-600 hover:text-stone-900 font-medium hover:bg-stone-200/60'
                    }`}
                    title={`Auditar y optimizar en ${lang.label}`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="font-semibold">{lang.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Separador fino y elegante */}
        <div className="my-6 border-t border-stone-100" />

        {/* ── FILA INFERIOR: DESCRIPCIÓN CONTEXTUAL Y BOTONES DE ACCIÓN ── */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-normal">
              Audita y optimiza el posicionamiento en Google de cada idioma. El orquestador decodifica tarifas y códigos internos a intenciones de búsqueda humanas reales con protección anti-canibalización.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400 pt-1">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium text-stone-500">
                Auditoría activa en <strong className="text-stone-800 font-semibold">{langNames[selectedLanguage]}</strong> ({totalCount} páginas en catálogo)
              </span>
            </div>
          </div>

          {/* Grupo de Acciones: Re-escanear + Botón Dual */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <Button
              variant="outline"
              size="default"
              onClick={onRescan}
              disabled={loading || isOptimizing}
              className="rounded-xl border-stone-200/90 bg-stone-50/70 hover:bg-stone-100/80 text-stone-700 hover:text-stone-900 transition-all text-xs font-semibold h-11 px-4 shadow-xs"
            >
              <RefreshCw size={15} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
              Re-escanear
            </Button>

            {/* Botón Dual (Split Button / Dropdown) para optimización inteligente */}
            <div className="inline-flex rounded-xl shadow-[0_4px_16px_-4px_rgba(212,175,55,0.35)] shrink-0">
              <Button
                variant="luxury"
                size="default"
                onClick={() => onOptimize('pending')}
                disabled={loading || isOptimizing}
                className="rounded-l-xl rounded-r-none font-bold text-xs h-11 px-5 text-white flex items-center gap-2 active:scale-95 transition-transform"
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
                    size="default"
                    disabled={loading || isOptimizing}
                    className="rounded-r-xl rounded-l-none border-l border-white/20 h-11 px-3 text-white hover:brightness-105 transition-colors"
                    aria-label="Más opciones de optimización"
                  >
                    <ChevronDown size={15} strokeWidth={2.5} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl bg-white border border-stone-200/90 shadow-2xl space-y-1 z-50">
                  <DropdownMenuItem
                    onClick={() => onOptimize('pending')}
                    disabled={loading || isOptimizing}
                    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-stone-50 focus:bg-stone-50 transition-colors"
                  >
                    <Target size={16} className="text-[#D4AF37] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-stone-900">Optimizar pendientes ({pendingCount})</p>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        Solo páginas con advertencias, conflictos o sin datos en {langNames[selectedLanguage]}.
                      </p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-stone-100 my-1" />
                  <DropdownMenuItem
                    onClick={() => setConfirmModalOpen(true)}
                    disabled={loading || isOptimizing}
                    className="flex items-start gap-3 p-3 rounded-xl cursor-pointer hover:bg-amber-50/70 focus:bg-amber-50/70 transition-colors group"
                  >
                    <Wand2 size={16} className="text-[#b08e23] mt-0.5 shrink-0 group-hover:rotate-12 transition-transform" />
                    <div>
                      <p className="text-xs font-bold text-[#b08e23]">Forzar re-optimización de todo el catálogo ({totalCount})</p>
                      <p className="text-[11px] text-stone-500 mt-0.5 leading-snug">
                        Regenera desde cero y sobrescribe las {totalCount} páginas en {langNames[selectedLanguage]}.
                      </p>
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
