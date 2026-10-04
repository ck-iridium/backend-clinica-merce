"use client";

import React, { useState } from 'react';
import { Sparkles, Save, Code2, Eye, EyeOff, Globe2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ContentOptimizationProposal } from '@/lib/content-engine/types';

interface ContentReviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proposals: ContentOptimizationProposal[];
  isApplying: boolean;
  onApply: () => void;
}

const LANGUAGES = [
  { code: 'es' as const, label: 'Español', flag: '🇪🇸' },
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  { code: 'fr' as const, label: 'Français', flag: '🇫🇷' },
];

export default function ContentReviewModal({
  open,
  onOpenChange,
  proposals,
  isApplying,
  onApply,
}: ContentReviewModalProps) {
  const [reviewLang, setReviewLang] = useState<'es' | 'en' | 'fr'>('es');
  const [viewHtmlCodeMap, setViewHtmlCodeMap] = useState<Record<string, boolean>>({});

  const toggleViewCode = (entityId: string) => {
    setViewHtmlCodeMap((prev) => ({
      ...prev,
      [entityId]: !prev[entityId],
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl p-0 border border-stone-200 bg-white shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b border-stone-100 bg-[#FAF9F6]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center shrink-0">
                <Sparkles size={20} />
              </span>
              <div>
                <DialogTitle className="text-xl font-serif font-bold text-stone-900">
                  Propuestas de Redacción Comercial IA
                </DialogTitle>
                <DialogDescription className="text-xs text-stone-500 font-sans mt-0.5">
                  Revisa los extractos persuasivos y el contenido HTML estructurado generado concurrentemente en 3 idiomas antes de guardarlo en Supabase.
                </DialogDescription>
              </div>
            </div>

            {/* Selector de idioma para previsualización en el modal */}
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/80 shadow-inner self-start sm:self-auto">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setReviewLang(lang.code)}
                  className={`px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-all font-semibold ${
                    reviewLang === lang.code
                      ? 'bg-white text-stone-900 shadow-sm border border-stone-200/70 font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.label}</span>
                </button>
              ))}
            </div>
          </div>
        </DialogHeader>

        {/* Listado Comparativo */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-stone-100">
          {proposals.map((item) => {
            const proposedForLang = item.proposed[reviewLang];
            const isService = item.entityType === 'service';
            const showCode = !!viewHtmlCodeMap[item.entityId];

            return (
              <div key={item.entityId} className="pt-5 first:pt-0 space-y-3">
                {/* Cabecera de la Entidad */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {item.entityType === 'category' ? 'Categoría' : 'Servicio'}
                    </span>
                    <h5 className="text-sm font-bold text-stone-900">{item.entityName}</h5>
                    {item.categoryName && (
                      <span className="text-[11px] text-stone-500 font-medium">
                        ({item.categoryName})
                      </span>
                    )}
                  </div>

                  {item.rationale && (
                    <span className="text-[11px] text-stone-600 italic bg-amber-50/80 px-2.5 py-0.5 rounded-full border border-amber-200/60 max-w-sm truncate">
                      {item.rationale}
                    </span>
                  )}
                </div>

                {/* Comparativa: Antes (Estado en DB) vs Después (Propuesta IA) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* ANTES */}
                  <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 space-y-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Estado Actual en Base de Datos (ES)
                    </span>
                    <div>
                      <span className="text-[10px] text-stone-400 font-semibold">Extracto Comercial:</span>
                      <p className="font-medium text-stone-700 text-xs mt-0.5 leading-relaxed">
                        {item.original.description || (
                          <span className="italic text-rose-400 font-normal">Sin extracto comercial</span>
                        )}
                      </p>
                    </div>

                    {isService && (
                      <div>
                        <span className="text-[10px] text-stone-400 font-semibold">Ficha HTML:</span>
                        {item.original.content_html ? (
                          <div
                            className="mt-1 p-2.5 bg-white rounded-lg border border-stone-200/60 text-stone-600 text-[11px] max-h-32 overflow-y-auto leading-relaxed [&_ul]:list-disc [&_ul]:ml-4"
                            dangerouslySetInnerHTML={{ __html: item.original.content_html }}
                          />
                        ) : (
                          <p className="italic text-rose-400 font-normal mt-0.5">
                            Sin contenido detallado en HTML
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* DESPUÉS (Propuesta IA para el idioma seleccionado) */}
                  <div className="p-4 rounded-xl bg-amber-50/30 border border-[#D4AF37]/40 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#b08e23] flex items-center gap-1.5">
                        <Sparkles size={12} />
                        <span>Propuesta IA ({reviewLang.toUpperCase()})</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Nativo 3 Idiomas
                      </span>
                    </div>

                    {/* Nuevo Extracto */}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-stone-500 font-semibold">
                          Nuevo Extracto Comercial ({proposedForLang?.description?.length || 0} car.):
                        </span>
                      </div>
                      <p className="font-medium text-stone-900 text-xs mt-0.5 leading-relaxed bg-white/80 p-2.5 rounded-lg border border-stone-200/60">
                        {proposedForLang?.description || (
                          <span className="italic text-stone-400">Sin propuesta</span>
                        )}
                      </p>
                    </div>

                    {/* Nuevo Contenido HTML (Servicios) */}
                    {isService && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-stone-500 font-semibold flex items-center gap-1">
                            <Code2 size={12} className="text-[#D4AF37]" />
                            <span>Ficha Estructurada ({proposedForLang?.content_html?.length || 0} car.):</span>
                          </span>

                          {proposedForLang?.content_html && (
                            <button
                              type="button"
                              onClick={() => toggleViewCode(item.entityId)}
                              className="text-[10px] font-semibold text-[#b08e23] hover:underline flex items-center gap-1"
                            >
                              {showCode ? <Eye size={11} /> : <EyeOff size={11} />}
                              <span>{showCode ? 'Ver diseño' : 'Ver código HTML'}</span>
                            </button>
                          )}
                        </div>

                        {proposedForLang?.content_html ? (
                          showCode ? (
                            <pre className="p-3 bg-stone-900 text-stone-200 font-mono text-[10px] rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                              {proposedForLang.content_html}
                            </pre>
                          ) : (
                            <div
                              className="p-3 bg-white rounded-lg border border-stone-200/70 text-stone-800 text-[11px] leading-relaxed max-h-40 overflow-y-auto [&_p]:mb-1.5 [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:my-1.5 [&_li]:my-0.5 [&_strong]:text-stone-950 [&_strong]:font-semibold"
                              dangerouslySetInnerHTML={{ __html: proposedForLang.content_html }}
                            />
                          )
                        ) : (
                          <p className="italic text-stone-400 font-normal">
                            Sin contenido HTML generado
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer del Modal */}
        <DialogFooter className="p-4 sm:p-5 border-t border-stone-100 bg-[#FAF9F6] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-stone-500 font-medium">
            <span>
              {proposals.length} {proposals.length === 1 ? 'propuesta lista' : 'propuestas listas'} para aplicar en <strong className="text-stone-800">Español, Inglés y Francés</strong> simultáneamente.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              variant="outline"
              size="default"
              disabled={isApplying}
              onClick={() => onOpenChange(false)}
              className="rounded-xl border-stone-200 text-xs font-semibold"
            >
              Cancelar
            </Button>

            <Button
              variant="luxury"
              size="default"
              disabled={isApplying || proposals.length === 0}
              onClick={onApply}
              className="rounded-xl font-bold text-xs px-5 text-white flex items-center gap-2"
            >
              <Save size={15} />
              {isApplying ? 'Guardando en Supabase...' : 'Guardar en Base de Datos (3 Idiomas)'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
