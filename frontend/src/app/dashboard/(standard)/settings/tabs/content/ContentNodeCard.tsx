"use client";

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  FileText,
  Code2,
  Sparkles,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentAuditNode } from '@/lib/content-engine/types';

interface ContentNodeCardProps {
  node: ContentAuditNode;
  selectedLanguage: 'es' | 'en' | 'fr';
  onGenerateSingle: (node: ContentAuditNode) => void;
  isGenerating?: boolean;
}

export default function ContentNodeCard({
  node,
  selectedLanguage,
  onGenerateSingle,
  isGenerating = false,
}: ContentNodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showRawHtml, setShowRawHtml] = useState(false);

  // Resolver contenido según el idioma seleccionado
  let activeDescription = node.description;
  let activeHtml = node.contentHtml;

  if (selectedLanguage === 'en') {
    activeDescription = node.translations?.en?.description || null;
    activeHtml = node.translations?.en?.content_html || null;
  } else if (selectedLanguage === 'fr') {
    activeDescription = node.translations?.fr?.description || null;
    activeHtml = node.translations?.fr?.content_html || null;
  }

  const descLen = activeDescription?.trim().length || 0;
  const htmlLen = activeHtml?.trim().length || 0;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        node.status === 'empty'
          ? 'border-rose-200/90 shadow-xs'
          : node.status === 'thin'
          ? 'border-amber-200/80 shadow-xs'
          : 'border-stone-200/70 hover:border-stone-300'
      }`}
    >
      {/* ── FILA PRINCIPAL (CABECERA CLICABLE) ── */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Badge de Tipo */}
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0 ${
              node.type === 'category'
                ? 'bg-amber-50 text-[#997300] border border-amber-200/80'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            {node.type === 'category' ? 'Categoría' : 'Servicio'}
          </span>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                {node.name}
              </h4>
              {node.categoryName && (
                <span className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-md font-medium">
                  {node.categoryName}
                </span>
              )}
              {node.price !== null && node.price !== undefined && (
                <span className="text-[11px] font-semibold text-stone-600">
                  {node.price}€
                </span>
              )}
            </div>

            {/* Sub-información rápida: Extracto y estado HTML */}
            <div className="flex items-center gap-3 flex-wrap text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <FileText size={12} className="text-stone-400" />
                <span>
                  {descLen > 0 ? (
                    <span className="text-stone-700 font-medium">{descLen} caracteres</span>
                  ) : (
                    <span className="text-rose-500 font-medium italic">Sin extracto corto</span>
                  )}
                </span>
              </span>

              {node.type === 'service' && (
                <span className="flex items-center gap-1">
                  <Code2 size={12} className={htmlLen > 0 ? 'text-emerald-500' : 'text-stone-400'} />
                  <span>
                    {htmlLen > 0 ? (
                      <span className="text-emerald-700 font-medium bg-emerald-50 px-2 py-0.2 rounded-md border border-emerald-200/60">
                        HTML Estructurado ({htmlLen} car.)
                      </span>
                    ) : (
                      <span className="text-rose-600 font-medium bg-rose-50 px-2 py-0.2 rounded-md border border-rose-200/60">
                        Sin ficha HTML
                      </span>
                    )}
                  </span>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lado Derecho: Estado, Botón Redactar & Chevron */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {node.status === 'optimal' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={13} />
                Óptimo ({node.score})
              </span>
            )}
            {node.status === 'thin' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertTriangle size={13} />
                Thin Content ({node.score})
              </span>
            )}
            {node.status === 'empty' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                <XCircle size={13} />
                Vacío (0)
              </span>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={isGenerating}
            onClick={(e) => {
              e.stopPropagation();
              onGenerateSingle(node);
            }}
            className="rounded-xl border-[#D4AF37]/50 text-stone-800 hover:text-[#997300] hover:bg-amber-50/60 text-xs font-bold h-9 px-3 gap-1.5 shadow-2xs"
          >
            <Sparkles size={13} className="text-[#D4AF37]" />
            <span className="hidden sm:inline">Redactar</span>
          </Button>

          <button
            type="button"
            className="text-stone-400 hover:text-stone-600 p-1"
            aria-label="Expandir ficha"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* ── CUERPO EXPANDIDO (PREVISUALIZACIÓN DE TEXTO Y CONTENIDO HTML) ── */}
      {isExpanded && (
        <div className="border-t border-stone-100 bg-[#FAF9F6]/60 p-4 sm:p-6 space-y-4 text-xs animate-in slide-in-from-top-1 duration-200">
          {/* Incidencias detectadas */}
          {node.issues && node.issues.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-stone-500">Diagnóstico:</span>
              {node.issues.map((issue, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200/70"
                >
                  {issue}
                </span>
              ))}
            </div>
          )}

          {/* Extracto Corto (Description) */}
          <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-stone-200/60">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                Extracto Comercial Corto ({selectedLanguage.toUpperCase()})
              </span>
              <span className="text-[10px] font-mono text-stone-400">
                {descLen} caracteres
              </span>
            </div>
            {activeDescription ? (
              <p className="text-stone-700 text-xs leading-relaxed font-medium">
                {activeDescription}
              </p>
            ) : (
              <p className="text-stone-400 italic text-xs">
                Sin extracto redactado en {selectedLanguage.toUpperCase()}. Se recomienda generar con la IA.
              </p>
            )}
          </div>

          {/* Contenido Extendido HTML (Solo para Servicios) */}
          {node.type === 'service' && (
            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-stone-200/60">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <Code2 size={13} className="text-[#D4AF37]" />
                  <span>Ficha Comercial Estructurada (content_html - {selectedLanguage.toUpperCase()})</span>
                </span>

                {activeHtml && (
                  <button
                    type="button"
                    onClick={() => setShowRawHtml((prev) => !prev)}
                    className="text-[11px] font-semibold text-[#b08e23] hover:underline flex items-center gap-1"
                  >
                    {showRawHtml ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{showRawHtml ? 'Ver maquetado visual' : 'Ver código HTML'}</span>
                  </button>
                )}
              </div>

              {activeHtml ? (
                showRawHtml ? (
                  <pre className="p-3 bg-stone-900 text-stone-200 font-mono text-[11px] rounded-lg overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                    {activeHtml}
                  </pre>
                ) : (
                  <div
                    className="p-4 bg-[#FAF9F6] rounded-xl border border-stone-200/60 text-stone-800 leading-relaxed text-xs space-y-2 max-h-64 overflow-y-auto [&_p]:mb-2 [&_ul]:list-disc [&_ul]:ml-5 [&_ul]:my-2 [&_li]:my-1 [&_strong]:text-stone-900 [&_strong]:font-bold"
                    dangerouslySetInnerHTML={{ __html: activeHtml }}
                  />
                )
              ) : (
                <div className="p-4 bg-stone-50 rounded-xl border border-dashed border-stone-200 text-center text-stone-400 text-xs">
                  Este servicio no cuenta con cuerpo comercial HTML. Haz clic en <strong>Redactar</strong> para que la IA genere su ficha estructurada con beneficios, protocolo y recomendaciones.
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
