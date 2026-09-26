'use client';

import React from 'react';
import { Search, Plus, X } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Service, Category } from './types';

interface POSCatalogProps {
  services: Service[];
  categories: Category[];
  onAddToCart: (service: Service) => void;
  serviceSearch: string;
  setServiceSearch: (val: string) => void;
  showServiceDropdown: boolean;
  setShowServiceDropdown: (val: boolean) => void;
  selectedCategory: string | null;
  setSelectedCategory: (val: string | null) => void;
  serviceDropdownRef: React.RefObject<HTMLDivElement>;
}

export function POSCatalog({
  services,
  categories,
  onAddToCart,
  serviceSearch,
  setServiceSearch,
  showServiceDropdown,
  setShowServiceDropdown,
  selectedCategory,
  setSelectedCategory,
  serviceDropdownRef,
}: POSCatalogProps) {
  const { t } = useLanguage();

  const filteredServices = services.filter((s) => {
    const matchesCategory = selectedCategory ? s.category_id === selectedCategory : true;
    const matchesSearch = s.name.toLowerCase().includes(serviceSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-stone-200/40 shadow-sm space-y-8 min-h-[550px] transition-all animate-in fade-in duration-300">
      <div className="space-y-2">
        <h3 className="text-xs font-bold text-[#d4af37] uppercase tracking-[0.2em]">
          {t('dashboard.pos.step_identification') || '1. Selección de Servicios'}
        </h3>
        <p className="text-stone-400 text-xs">
          {t('dashboard.pos.search_treatment_desc') || 'Busca y añade los tratamientos que deseas facturar al ticket.'}
        </p>
      </div>

      {/* Buscador de Servicios con Autocompletado */}
      <div className="relative" ref={serviceDropdownRef}>
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
          {t('dashboard.pos.search_treatment') || 'Buscar Tratamiento'}
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            id="pos-service-search"
            type="text"
            placeholder={t('dashboard.pos.search_treatment_placeholder') || 'Escribe el nombre del servicio...'}
            value={serviceSearch}
            onChange={(e) => {
              setServiceSearch(e.target.value);
              setShowServiceDropdown(true);
            }}
            onFocus={() => setShowServiceDropdown(true)}
            className="w-full pl-12 pr-5 py-4 rounded-2xl border border-stone-200 focus:border-stone-500 focus:ring-1 focus:ring-stone-500 outline-none bg-stone-50/50 transition-all font-medium text-sm"
          />
          {serviceSearch && (
            <button
              onClick={() => setServiceSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Desplegable de Resultados */}
        {showServiceDropdown && (
          <div className="absolute z-30 w-full mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl max-h-72 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            {filteredServices.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredServices.map((s) => (
                  <button
                    key={s.id}
                    id={`pos-service-result-${s.id}`}
                    onClick={() => {
                      onAddToCart(s);
                      setServiceSearch('');
                      setShowServiceDropdown(false);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-stone-50 rounded-xl transition-colors flex justify-between items-center group"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold text-stone-800 text-sm group-hover:text-stone-950">{s.name}</span>
                      {categories.find((c) => c.id === s.category_id) && (
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">
                          {categories.find((c) => c.id === s.category_id)?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-stone-700 font-mono text-sm">{Number(s.price).toFixed(2)}€</span>
                      <span className="p-1 bg-stone-100 text-stone-600 rounded-lg group-hover:bg-stone-900 group-hover:text-white transition-colors">
                        <Plus size={14} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-stone-400 text-sm">
                {t('dashboard.pos.no_services_found') || 'No se encontraron servicios'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtros Rápidos por Categoría */}
      <div className="space-y-3">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
          {t('dashboard.pos.category_filters') || 'Filtros por Categoría'}
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
              selectedCategory === null
                ? 'bg-stone-950 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/70'
            }`}
          >
            {t('dashboard.pos.all_categories') || 'Todos'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-950 text-white border-transparent'
                  : 'bg-[#F7F7F5] text-stone-600 hover:bg-stone-200/50 border border-stone-200/20'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catálogo Rápido en Cuadrícula */}
      <div className="space-y-4 pt-4 border-t border-stone-100">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t('dashboard.pos.fast_catalog') || 'Catálogo Rápido'}
          </span>
          <span className="text-xs text-stone-400 font-medium">
            {t('dashboard.pos.services_available')?.replace('{count}', String(filteredServices.length)) ||
              `${filteredServices.length} servicios disponibles`}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              onClick={() => onAddToCart(s)}
              className="p-4 bg-white border border-stone-200/60 hover:border-stone-400/80 hover:bg-stone-50/30 rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center group shadow-sm hover:shadow-md"
            >
              <div className="space-y-1 pr-2 max-w-[70%]">
                <h4 className="font-semibold text-stone-800 text-xs truncate group-hover:text-stone-950">{s.name}</h4>
                <span className="text-[10px] text-stone-400 font-medium font-mono">{Number(s.price).toFixed(2)}€</span>
              </div>
              <button className="w-8 h-8 rounded-full bg-stone-50 text-stone-500 border border-stone-100 flex items-center justify-center group-hover:bg-stone-950 group-hover:text-white group-hover:border-transparent transition-all duration-300 shadow-sm active:scale-90">
                <Plus size={14} />
              </button>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-2 py-10 text-center text-stone-400 text-xs">
              {t('dashboard.pos.no_services_found') || 'Ningún servicio coincide con la categoría o búsqueda seleccionada.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
