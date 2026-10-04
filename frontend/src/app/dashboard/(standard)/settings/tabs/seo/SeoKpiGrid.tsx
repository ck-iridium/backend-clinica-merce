"use client";

import React from 'react';
import { ShieldCheck, AlertTriangle, Layers } from 'lucide-react';
import { SeoAuditReport } from '@/lib/seo-engine/types';

interface SeoKpiGridProps {
  report: SeoAuditReport;
}

export default function SeoKpiGrid({ report }: SeoKpiGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Salud SEO */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Salud SEO Global</span>
          <span
            className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
              report.overallScore >= 80
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : report.overallScore >= 50
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {report.overallScore >= 80 ? 'Óptimo' : report.overallScore >= 50 ? 'Mejorable' : 'Crítico'}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-3xl font-serif font-bold text-stone-900">{report.overallScore}%</span>
          <span className="text-xs text-stone-400">calificación técnica</span>
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

      {/* KPI 2: Canibalización */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Canibalización</span>
          <ShieldCheck size={18} className={report.summary.cannibalizationCount === 0 ? 'text-emerald-500' : 'text-rose-500'} />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-serif font-bold text-stone-900">
            {report.summary.cannibalizationCount}
          </span>
          <span className="text-xs text-stone-400 ml-2">
            {report.summary.cannibalizationCount === 1 ? 'conflicto detectado' : 'conflictos detectados'}
          </span>
        </div>
        <p className="text-[11px] text-stone-500 mt-2">
          {report.summary.cannibalizationCount === 0
            ? 'Cada página ataca búsquedas únicas en Google.'
            : 'Páginas compitiendo por la misma búsqueda.'}
        </p>
      </div>

      {/* KPI 3: Incompletos */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Meta Vacíos</span>
          <AlertTriangle size={18} className={report.summary.missingMetaCount === 0 ? 'text-emerald-500' : 'text-amber-500'} />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-serif font-bold text-stone-900">
            {report.summary.missingMetaCount}
          </span>
          <span className="text-xs text-stone-400 ml-2">páginas sin rellenar</span>
        </div>
        <p className="text-[11px] text-stone-500 mt-2">
          {report.summary.missingMetaCount === 0
            ? 'Todas las páginas tienen metadatos propios.'
            : 'Usando actualmente el fallback automático.'}
        </p>
      </div>

      {/* KPI 4: Catálogo Indexable */}
      <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Páginas Auditadas</span>
          <Layers size={18} className="text-[#D4AF37]" />
        </div>
        <div className="mt-3">
          <span className="text-3xl font-serif font-bold text-stone-900">
            {report.summary.totalEntities}
          </span>
          <span className="text-xs text-stone-400 ml-2">URLs en el ecosistema</span>
        </div>
        <p className="text-[11px] text-stone-500 mt-2">
          Home, categorías de servicios y tratamientos.
        </p>
      </div>
    </div>
  );
}
