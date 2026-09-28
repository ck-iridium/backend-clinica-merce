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
    <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-stone-200/80 shadow-xs">
      {/* Filtros de Categorías */}
      <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
        <button
          id="services-category-filter-all-btn"
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            selectedCategory === 'all'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
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
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#D4AF37] text-stone-950 font-bold shadow-xs'
                : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
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
          className="w-full pl-11 pr-4 py-2.5 bg-stone-50/80 hover:bg-stone-100/60 focus:bg-white border border-stone-200 focus:border-[#D4AF37] rounded-xl text-xs font-medium text-stone-800 outline-none transition-all focus:ring-1 focus:ring-[#D4AF37]"
        />
      </div>
    </div>
  );
}
