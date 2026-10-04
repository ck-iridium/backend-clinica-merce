"use client";

import React from 'react';
import { Sparkles, RefreshCw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SeoOptimizationProposal } from '@/lib/seo-engine/ai-orchestrator';

interface SeoReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposals: SeoOptimizationProposal[];
  isApplying: boolean;
  onApply: () => void;
}

export default function SeoReviewModal({
  open,
  onOpenChange,
  proposals,
  isApplying,
  onApply,
}: SeoReviewModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl p-0 border border-stone-200 bg-white shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-stone-100 bg-[#FAF9F6]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                <Sparkles size={20} />
              </span>
              <div>
                <DialogTitle className="text-xl font-serif font-bold text-stone-900">
                  Propuesta de Optimización SEO con IA
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-500 font-sans mt-0.5">
                  Revisa las propuestas antes de consolidarlas en la base de datos de Supabase. Cada tratamiento
                  tendrá una intención de búsqueda única y protegida.
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Listado Comparativo */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-stone-100">
          {proposals.map((item) => (
            <div key={item.entityId} className="pt-5 first:pt-0 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                    {item.entityType}
                  </span>
                  {item.language && item.language !== 'es' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                      {item.language === 'en' ? '🇬🇧 EN' : '🇫🇷 FR'}
                    </span>
                  )}
                  <h5 className="text-sm font-bold text-stone-900">{item.entityName}</h5>
                </div>
                <span className="text-[11px] font-mono text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20">
                  Target: {item.proposed.assignedKeyword}
                </span>
              </div>

              {/* Comparativa en Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Antes */}
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                    Estado Actual en DB
                  </span>
                  <div>
                    <span className="text-[10px] text-stone-400">Título:</span>
                    <p className="font-medium text-stone-700 text-xs">
                      {item.original.seo_title || <span className="italic text-stone-400">Sin título</span>}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400">Descripción:</span>
                    <p className="font-medium text-stone-600 text-[11px] leading-relaxed">
                      {item.original.seo_description || (
                        <span className="italic text-stone-400">Sin descripción</span>
                      )}
                    </p>
                  </div>
                  {item.original.slug && (
                    <div>
                      <span className="text-[10px] text-stone-400">Slug:</span>
                      <p className="font-mono text-stone-600 text-[11px]">
                        {item.original.slug}
                      </p>
                    </div>
                  )}
                </div>

                {/* Después (Propuesta IA) */}
                <div className="p-3.5 rounded-xl bg-amber-50/40 border border-[#D4AF37]/30 space-y-2 relative">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#b08e23] flex items-center justify-between">
                    <span>Propuesta IA (Guardrails)</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-black">Score 95+</span>
                  </span>
                  <div>
                    <span className="text-[10px] text-stone-400">Nuevo Título ({item.proposed.seo_title.length} chars):</span>
                    <p className="font-bold text-stone-900 text-xs">
                      {item.proposed.seo_title}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400">Nueva Descripción ({item.proposed.seo_description.length} chars):</span>
                    <p className="font-medium text-stone-800 text-[11px] leading-relaxed">
                      {item.proposed.seo_description}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-stone-400">Keywords:</span>
                    <p className="text-[10px] font-mono text-stone-600">
                      {item.proposed.seo_keywords}
                    </p>
                  </div>
                  {item.proposed.slug && (
                    <div>
                      <span className="text-[10px] text-stone-400">Slug Traducido:</span>
                      <p className="font-mono text-stone-900 font-bold text-[11px]">
                        {item.proposed.slug}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-stone-400 italic">
                💡 Razón estratégica: {item.rationale}
              </p>
            </div>
          ))}
        </div>

        <DialogFooter className="p-4 sm:p-5 border-t border-stone-100 bg-[#FAF9F6] flex flex-row items-center justify-between sm:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isApplying}
            className="rounded-xl px-4 text-xs font-semibold text-stone-600 hover:bg-stone-100"
          >
            Descartar
          </Button>

          <Button
            variant="luxury"
            size="sm"
            onClick={onApply}
            disabled={isApplying}
            className="rounded-xl px-6 text-xs font-bold shadow-luxury text-stone-950 flex items-center gap-2"
          >
            {isApplying ? (
              <RefreshCw size={16} className="animate-spin text-stone-900" />
            ) : (
              <Check size={16} strokeWidth={2} />
            )}
            {isApplying ? 'Persistiendo en Supabase...' : `Confirmar y Aplicar (${proposals.length})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
