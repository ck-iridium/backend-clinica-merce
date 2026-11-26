"use client"
import React from 'react';
import { Search, Sparkles, Package, AlertTriangle, Globe, Store } from 'lucide-react';

interface DataGridFiltersProps {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  language: string;
  itemTypeFilter?: 'all' | 'services' | 'products' | 'low_stock';
  onItemTypeFilterChange?: (filter: 'all' | 'services' | 'products' | 'low_stock') => void;
  lowStockCount?: number;
  counts?: {
    all: number;
    services: number;
    products: number;
    low_stock: number;
  };
  webVisibilityFilter?: 'all' | 'web' | 'web_only' | 'hidden';
  onWebVisibilityFilterChange?: (filter: 'all' | 'web' | 'web_only' | 'hidden') => void;
  enableStockControl?: boolean;
}

export function DataGridFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  language,
  itemTypeFilter = 'all',
  onItemTypeFilterChange,
  lowStockCount = 0,
  counts,
  webVisibilityFilter = 'all',
  onWebVisibilityFilterChange,
  enableStockControl = true,
}: DataGridFiltersProps) {
  return (
    <div className="flex flex-col gap-3.5 bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-stone-200/80 shadow-xs">
      <div className="flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector Tipo de Ítem: Todos / Servicios / Productos */}
          {onItemTypeFilterChange && (
            <div className="flex flex-wrap items-center gap-1 bg-stone-100 p-1 rounded-2xl w-fit border border-stone-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => onItemTypeFilterChange('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  itemTypeFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Todos {counts ? `(${counts.all})` : ''}
              </button>
              <button
                type="button"
                onClick={() => onItemTypeFilterChange('services')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  itemTypeFilter === 'services'
                    ? 'bg-white text-[#FF6B00] shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Sparkles size={13} className="text-[#FF6B00]" />
                <span>Servicios {counts ? `(${counts.services})` : ''}</span>
              </button>
              <button
                type="button"
                onClick={() => onItemTypeFilterChange('products')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  itemTypeFilter === 'products'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Package size={13} className="text-stone-600" />
                <span>Productos {counts ? `(${counts.products})` : ''}</span>
              </button>
              {enableStockControl && (
                <button
                  type="button"
                  onClick={() => onItemTypeFilterChange('low_stock')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    itemTypeFilter === 'low_stock'
                      ? 'bg-rose-50 text-rose-700 shadow-xs border border-rose-200/70'
                      : 'text-stone-500 hover:text-rose-700'
                  }`}
                >
                  <AlertTriangle size={13} className={lowStockCount > 0 ? 'text-rose-500' : 'text-stone-400'} />
                  <span>Reposición</span>
                  {lowStockCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black bg-rose-500 text-white">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Filtro rápido de visibilidad Web */}
          {onWebVisibilityFilterChange && (
            <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-2xl w-fit border border-stone-200/60 shadow-2xs">
              <button
                type="button"
                onClick={() => onWebVisibilityFilterChange('all')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
                  webVisibilityFilter === 'all'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                Canal: Todos
              </button>
              <button
                type="button"
                onClick={() => onWebVisibilityFilterChange('web')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                  webVisibilityFilter === 'web'
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Globe size={12} /> Web y TPV
              </button>
              <button
                type="button"
                onClick={() => onWebVisibilityFilterChange('web_only')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                  webVisibilityFilter === 'web_only'
                    ? 'bg-white text-emerald-700 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Globe size={12} /> Solo Web
              </button>
              <button
                type="button"
                onClick={() => onWebVisibilityFilterChange('hidden')}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 ${
                  webVisibilityFilter === 'hidden'
                    ? 'bg-white text-stone-800 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <Store size={12} /> Solo TPV
              </button>
            </div>
          )}
        </div>

        {/* Input de Búsqueda */}
        <div className="relative min-w-[260px] flex-1 md:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            id="services-search-input"
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={language === 'fr' ? 'Rechercher des traitements...' : language === 'en' ? 'Search services...' : 'Buscar por nombre, descripción o ref...'}
            className="w-full pl-11 pr-4 py-2.5 bg-stone-50/80 hover:bg-stone-100/60 focus:bg-white border border-stone-200 focus:border-[#FF6B00] rounded-xl text-xs font-medium text-stone-800 outline-none transition-all focus:ring-1 focus:ring-[#FF6B00]"
          />
        </div>
      </div>

      {/* Filtros de Categorías / Familias */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none pt-1 border-t border-stone-100">
        <button
          id="services-category-filter-all-btn"
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            selectedCategory === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
          }`}
        >
          {language === 'fr' ? 'Tous' : language === 'en' ? 'All' : 'Todas las familias'}
        </button>
        {categories.map(cat => (
          <button
            id={`services-category-filter-btn-${cat.id}`}
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#FF6B00] text-white font-bold shadow-sm'
                : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
