"use client";

import React from 'react';
import { SeoAuditReport } from '@/lib/seo-engine/types';
import { SeoFilterType } from './types';

interface SeoFilterBarProps {
  report: SeoAuditReport;
  selectedFilter: SeoFilterType;
  onSelectFilter: (filter: SeoFilterType) => void;
  filteredCount: number;
}

export default function SeoFilterBar({
  report,
  selectedFilter,
  onSelectFilter,
  filteredCount,
}: SeoFilterBarProps) {
  const filters: Array<{
    id: SeoFilterType;
    label: string;
    count: number;
    color?: string;
  }> = [
    { id: 'all', label: 'Todos', count: report.summary.totalEntities },
    { id: 'conflict', label: 'Conflictos', count: report.summary.conflictCount, color: 'text-rose-600' },
    { id: 'warning', label: 'Advertencias', count: report.summary.warningCount, color: 'text-amber-600' },
    { id: 'optimal', label: 'Óptimos', count: report.summary.optimalCount, color: 'text-emerald-600' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/60 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelectFilter(f.id)}
            className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
              selectedFilter === f.id
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <span>{f.label}</span>
            <span className={`px-1.5 py-0.2 rounded-md bg-stone-200/60 text-[10px] ${f.color || ''}`}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <p className="text-xs text-stone-400 font-medium">
        Mostrando {filteredCount} de {report.summary.totalEntities} páginas
      </p>
    </div>
  );
}
