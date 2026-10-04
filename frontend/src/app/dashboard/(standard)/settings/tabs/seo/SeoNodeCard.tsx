"use client";

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Target,
  Ban,
} from 'lucide-react';
import { SemanticNode } from '@/lib/seo-engine/types';

interface SeoNodeCardProps {
  node: SemanticNode;
}

export default function SeoNodeCard({ node }: SeoNodeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const titleLen = node.entity.currentTitle?.length || 0;
  const descLen = node.entity.currentDescription?.length || 0;

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
        node.status === 'conflict'
          ? 'border-rose-200 shadow-sm'
          : node.status === 'warning'
          ? 'border-amber-200/80'
          : 'border-stone-200/70 hover:border-stone-300'
      }`}
    >
      {/* Fila Principal */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
      >
        <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
          {/* Badge de Tipo */}
          <span
            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0 ${
              node.entity.type === 'home'
                ? 'bg-stone-900 text-white'
                : node.entity.type === 'category'
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-stone-100 text-stone-700 border border-stone-200'
            }`}
          >
            {node.entity.type === 'home'
              ? 'Portada'
              : node.entity.type === 'category'
              ? 'Categoría'
              : 'Tratamiento'}
          </span>

          <div className="min-w-0 space-y-0.5">
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                {node.entity.name}
              </h4>
              <span className="text-[11px] font-mono text-stone-400 hidden md:inline truncate max-w-[200px]">
                {node.entity.urlPath}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                <Target size={12} className="text-[#D4AF37]" />
                <span className="text-stone-400">Keyword Asignada:</span>
                <strong className="text-stone-800 font-semibold">{node.assignedKeyword}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Estado & Botón Desplegable */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-2">
            {node.status === 'optimal' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={13} />
                Óptimo ({node.seoScore})
              </span>
            )}
            {node.status === 'warning' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                <AlertTriangle size={13} />
                Revisar ({node.seoScore})
              </span>
            )}
            {node.status === 'conflict' && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                <XCircle size={13} />
                Canibalización
              </span>
            )}
          </div>

          <span className="text-stone-400 p-1">
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
      </div>

      {/* Panel Desplegable con Diagnóstico Detallado */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-stone-100 bg-stone-50/40 text-xs space-y-4">
          {/* Alerta de Canibalización si existe */}
          {node.cannibalizationRisk.hasRisk && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
              <div className="flex items-center gap-2 font-bold text-xs">
                <AlertTriangle size={14} className="text-rose-600" />
                Alerta de Canibalización en Google
              </div>
              <p className="text-[11px] leading-relaxed text-rose-700">
                {node.cannibalizationRisk.reason} (Conflicto directo con:{' '}
                <strong>{node.cannibalizationRisk.conflictingEntityNames.join(', ')}</strong>)
              </p>
            </div>
          )}

          {/* Comparativa de Metadatos Actuales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                  Título SEO Actual
                </span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    titleLen >= 45 && titleLen <= 65
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {titleLen}/60 chars
                </span>
              </div>
              <p className="text-stone-800 font-medium break-words">
                {node.entity.currentTitle || (
                  <span className="italic text-stone-400">Sin título configurado</span>
                )}
              </p>
            </div>

            <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/60">
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                  Meta Descripción Actual
                </span>
                <span
                  className={`text-[10px] font-mono font-bold ${
                    descLen >= 130 && descLen <= 160
                      ? 'text-emerald-600'
                      : 'text-amber-600'
                  }`}
                >
                  {descLen}/155 chars
                </span>
              </div>
              <p className="text-stone-800 font-medium leading-relaxed break-words">
                {node.entity.currentDescription || (
                  <span className="italic text-stone-400">Sin descripción (usando fallback neutro)</span>
                )}
              </p>
            </div>
          </div>

          {/* Palabras Prohibidas (Guardrails Anti-Canibalización) */}
          {node.forbiddenKeywords.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                <Ban size={12} className="text-rose-400" />
                Palabras Clave Prohibidas (Guardrail para evitar canibalizar a tus otros servicios):
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {node.forbiddenKeywords.slice(0, 8).map((fk, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-md font-mono"
                  >
                    {fk}
                  </span>
                ))}
                {node.forbiddenKeywords.length > 8 && (
                  <span className="text-[10px] text-stone-400 italic">
                    +{node.forbiddenKeywords.length - 8} más
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Recomendaciones específicas */}
          {node.recommendations.length > 0 && (
            <div className="pt-1 text-[11px] text-stone-500 space-y-1">
              {node.recommendations.map((rec, i) => (
                <p key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                  {rec}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
