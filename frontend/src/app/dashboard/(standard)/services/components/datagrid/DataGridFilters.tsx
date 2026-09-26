"use client"
import React from 'react';
import { Search } from 'lucide-react';

interface DataGridFiltersProps {
  categories: any[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  language: string;
}

export function DataGridFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  language,
}: DataGridFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white p-4 rounded-2xl border border-stone-100 shadow-sm">
      {/* Filtros de Categorías */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          id="services-category-filter-all-btn"
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            selectedCategory === 'all'
              ? 'bg-stone-900 text-white shadow-sm'
              : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
          }`}
        >
          {language === 'fr' ? 'Tous' : language === 'en' ? 'All' : 'Todos'}
        </button>
        {categories.map(cat => (
          <button
            id={`services-category-filter-btn-${cat.id}`}
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#d4af37] text-white shadow-sm'
                : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Input de Búsqueda */}
      <div className="relative min-w-[260px]">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          id="services-search-input"
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={language === 'fr' ? 'Rechercher des traitements...' : language === 'en' ? 'Search services...' : 'Buscar tratamientos...'}
          className="w-full pl-11 pr-4 py-2.5 bg-stone-50 hover:bg-stone-100/50 focus:bg-white border border-stone-200 focus:border-[#d4af37] rounded-xl text-xs font-medium text-stone-800 dark:text-stone-800 outline-none transition-all focus:ring-1 focus:ring-[#d4af37]"
        />
      </div>
    </div>
  );
}
