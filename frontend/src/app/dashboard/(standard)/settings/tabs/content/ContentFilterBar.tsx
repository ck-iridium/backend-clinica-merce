"use client";

import React from 'react';
import { Search, X } from 'lucide-react';
import { ContentAuditReport } from '@/lib/content-engine/types';
import { ContentFilterType, ContentTypeFilter } from './types';

interface ContentFilterBarProps {
  report: ContentAuditReport;
  selectedFilter: ContentFilterType;
  onSelectFilter: (filter: ContentFilterType) => void;
  typeFilter: ContentTypeFilter;
  onSelectTypeFilter: (filter: ContentTypeFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredCount: number;
}

export default function ContentFilterBar({
  report,
  selectedFilter,
  onSelectFilter,
  typeFilter,
  onSelectTypeFilter,
  searchQuery,
  onSearchChange,
  filteredCount,
}: ContentFilterBarProps) {
  const pendingCount = report.emptyCount + report.thinCount;

  const statusFilters: Array<{
    id: ContentFilterType;
    label: string;
    count: number;
    color?: string;
  }> = [
    { id: 'all', label: 'Todos', count: report.totalEntities },
    { id: 'pending', label: 'Requieren Redacción', count: pendingCount, color: 'text-amber-800 font-bold' },
    { id: 'no_html', label: 'Sin HTML Largo', count: report.withoutRichContentCount, color: 'text-rose-800 font-bold' },
    { id: 'optimal', label: 'Óptimos', count: report.optimalCount, color: 'text-emerald-800 font-bold' },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-stone-200/70 p-4 space-y-3.5 shadow-xs">
      {/* ── FILA 1: PÍLDORAS DE ESTADO (Nunca colapsan, diseño fluido) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-stone-100/90 rounded-2xl border border-stone-200/60">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                selectedFilter === f.id
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/70'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span>{f.label}</span>
              <span className={`px-1.5 py-0.5 rounded-md bg-stone-200/70 text-[10px] ${f.color || ''}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <span className="text-xs text-stone-400 font-medium shrink-0 self-end sm:self-center">
          Mostrando <strong className="text-stone-700">{filteredCount}</strong> de {report.totalEntities} entidades
        </span>
      </div>

      {/* ── FILA 2: SELECTOR DE TIPO + BUSCADOR (Espaciados y bien diferenciados) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-stone-100">
        {/* Selector de Tipo (Todos / Servicios / Categorías) */}
        <div className="flex items-center gap-1 p-1 bg-stone-100/80 rounded-xl border border-stone-200/60 text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => onSelectTypeFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              typeFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Todos los tipos
          </button>
          <button
            onClick={() => onSelectTypeFilter('services')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              typeFilter === 'services' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Servicios ({report.summary.servicesCount})
          </button>
          <button
            onClick={() => onSelectTypeFilter('categories')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
              typeFilter === 'categories' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Categorías ({report.summary.categoriesCount})
          </button>
        </div>

        {/* Buscador de texto con icono de limpieza */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8.5 pr-8 py-2 rounded-xl bg-stone-50/70 border border-stone-200/80 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-0.5 rounded-full hover:bg-stone-200/60 transition-colors"
              title="Borrar búsqueda"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
