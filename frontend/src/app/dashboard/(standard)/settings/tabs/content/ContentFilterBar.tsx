"use client";

import React from 'react';
import { Search } from 'lucide-react';
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
    { id: 'pending', label: 'Requieren Redacción', count: pendingCount, color: 'text-amber-700 font-bold' },
    { id: 'no_html', label: 'Sin HTML Largo', count: report.withoutRichContentCount, color: 'text-rose-700 font-bold' },
    { id: 'optimal', label: 'Óptimos', count: report.optimalCount, color: 'text-emerald-700 font-bold' },
  ];

  return (
    <div className="space-y-3 pt-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Filtros de Estado */}
        <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/60 overflow-x-auto scrollbar-hide">
          {statusFilters.map((f) => (
            <button
              key={f.id}
              onClick={() => onSelectFilter(f.id)}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 whitespace-nowrap ${
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

        {/* Buscador + Filtro de Tipo */}
        <div className="flex items-center gap-2">
          {/* Selector de Tipo (Servicios / Categorías) */}
          <div className="flex items-center gap-1 p-1 bg-stone-100/90 rounded-xl border border-stone-200/70 text-xs shrink-0">
            <button
              onClick={() => onSelectTypeFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                typeFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => onSelectTypeFilter('services')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                typeFilter === 'services' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Servicios ({report.summary.servicesCount})
            </button>
            <button
              onClick={() => onSelectTypeFilter('categories')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                typeFilter === 'categories' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              Categorías ({report.summary.categoriesCount})
            </button>
          </div>

          {/* Campo de búsqueda */}
          <div className="relative w-48 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Buscar servicio..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-stone-400 font-medium px-1">
        <span>Mostrando {filteredCount} de {report.totalEntities} entidades en el catálogo</span>
        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            className="text-[#b08e23] hover:underline font-semibold"
          >
            Limpiar búsqueda
          </button>
        )}
      </div>
    </div>
  );
}
