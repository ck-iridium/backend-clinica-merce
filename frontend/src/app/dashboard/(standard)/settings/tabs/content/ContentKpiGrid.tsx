"use client";

import React from 'react';
import { AlertCircle, CheckCircle2, FileText, Code2 } from 'lucide-react';
import { ContentAuditReport } from '@/lib/content-engine/types';

interface ContentKpiGridProps {
  report: ContentAuditReport;
}

export default function ContentKpiGrid({ report }: ContentKpiGridProps) {
  const needsAttentionCount = report.emptyCount + report.thinCount;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Salud de Contenidos */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Salud de Contenidos</span>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              report.overallScore >= 80
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : report.overallScore >= 50
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {report.overallScore >= 80 ? 'Excelente' : report.overallScore >= 50 ? 'Mejorable' : 'Crítico'}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-serif font-bold text-stone-900">{report.overallScore}%</span>
          <span className="text-xs text-stone-400">riqueza comercial</span>
        </div>
        <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              report.overallScore >= 80 ? 'bg-emerald-500' : report.overallScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${report.overallScore}%` }}
          />
        </div>
      </div>

      {/* KPI 2: Thin Content / Sin Extracto */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Thin Content / Vacíos</span>
          <AlertCircle size={18} className={needsAttentionCount === 0 ? 'text-emerald-500' : 'text-amber-500'} />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-serif font-bold text-stone-900">
            {needsAttentionCount}
          </span>
          <span className="text-xs text-stone-400 ml-2">
            {needsAttentionCount === 1 ? 'entidad pendiente' : 'entidades pendientes'}
          </span>
        </div>
        <p className="text-[11px] text-stone-500 mt-2">
          {needsAttentionCount === 0
            ? 'Todos los servicios tienen descripción comercial.'
            : `${report.emptyCount} vacíos y ${report.thinCount} con extracto breve (< 80 car.).`}
        </p>
      </div>

      {/* KPI 3: Sin Contenido HTML Estructurado */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Sin HTML Detallado</span>
          <Code2 size={18} className={report.withoutRichContentCount === 0 ? 'text-emerald-500' : 'text-rose-500'} />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-serif font-bold text-stone-900">
            {report.withoutRichContentCount}
          </span>
          <span className="text-xs text-stone-400 ml-2">servicios sin ficha</span>
        </div>
        <p className="text-[11px] text-stone-500 mt-2">
          {report.withoutRichContentCount === 0
            ? 'Todos los servicios disponen de ficha HTML.'
            : 'Faltan beneficios, protocolos y recomendaciones.'}
        </p>
      </div>

      {/* KPI 4: Contenido Óptimo & Completo */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Contenido Óptimo</span>
          <CheckCircle2 size={18} className="text-emerald-500" />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-serif font-bold text-stone-900">
            {report.optimalCount}
          </span>
          <span className="text-xs text-stone-400 ml-2">de {report.totalEntities} analizados</span>
        </div>
        <p className="text-[11px] text-stone-500 mt-2">
          {report.summary.withFullContentCount} servicios con ficha comercial completa.
        </p>
      </div>
    </div>
  );
}
