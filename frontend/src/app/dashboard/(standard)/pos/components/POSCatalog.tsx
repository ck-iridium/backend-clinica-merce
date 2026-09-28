'use client';

import React from 'react';
import { Search, Plus, X, Sparkles, Layers } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Service, Category } from './types';
import { Badge } from '@/components/ui/badge';

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
    <div className="lg:col-span-7 bg-white/85 backdrop-blur-xl rounded-[2rem] p-6 sm:p-8 border border-stone-200/70 shadow-sm space-y-7 min-h-[560px] transition-all animate-in fade-in duration-300">
      {/* Encabezado del Catálogo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            <span className="text-[11px] font-bold text-[#B38F26] uppercase tracking-[0.2em]">
              {t('dashboard.pos.step_identification') || '1. Catálogo de Servicios'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 tracking-tight">
            Selección Rápida
          </h2>
          <p className="text-stone-400 text-xs font-normal">
            {t('dashboard.pos.search_treatment_desc') || 'Añade los tratamientos o sesiones que deseas facturar al ticket actual.'}
          </p>
        </div>

        <Badge variant="luxury" className="self-start sm:self-auto py-1 px-3 text-[10px]">
          {services.length} disponibles
        </Badge>
      </div>

      {/* Buscador de Servicios con Autocompletado */}
      <div className="relative" ref={serviceDropdownRef}>
        <label htmlFor="pos-service-search" className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
          {t('dashboard.pos.search_treatment') || 'Buscar Tratamiento'}
        </label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            id="pos-service-search"
            type="text"
            placeholder={t('dashboard.pos.search_treatment_placeholder') || 'Escribe el nombre del servicio o tratamiento...'}
            value={serviceSearch}
            onChange={(e) => {
              setServiceSearch(e.target.value);
              setShowServiceDropdown(true);
            }}
            onFocus={() => setShowServiceDropdown(true)}
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl border border-stone-200/90 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none bg-stone-50/60 hover:bg-stone-50 focus:bg-white transition-all font-medium text-sm text-stone-800 placeholder:text-stone-400 shadow-2xs"
          />
          {serviceSearch && (
            <button
              onClick={() => setServiceSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 transition-colors"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Desplegable de Resultados Flotante */}
        {showServiceDropdown && (
          <div className="absolute z-30 w-full mt-2 bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-2xl shadow-2xl max-h-72 overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2 duration-200">
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
                    className="w-full text-left px-4 py-3 hover:bg-amber-50/40 rounded-xl transition-all flex justify-between items-center group border border-transparent hover:border-amber-200/50"
                  >
                    <div className="flex flex-col min-w-0 pr-3">
                      <span className="font-semibold text-stone-900 text-sm group-hover:text-amber-950 truncate">
                        {s.name}
                      </span>
                      {categories.find((c) => c.id === s.category_id) && (
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider mt-0.5">
                          {categories.find((c) => c.id === s.category_id)?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-stone-800 font-mono text-sm bg-stone-100 px-2 py-0.5 rounded-lg group-hover:bg-[#D4AF37]/20 group-hover:text-amber-950 transition-colors">
                        {Number(s.price).toFixed(2)}€
                      </span>
                      <span className="w-7 h-7 bg-stone-100 text-stone-600 rounded-lg group-hover:bg-[#D4AF37] group-hover:text-stone-950 transition-all flex items-center justify-center shadow-xs">
                        <Plus size={14} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-stone-400 text-xs">
                {t('dashboard.pos.no_services_found') || 'No se encontraron servicios que coincidan con la búsqueda.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filtros por Categoría */}
      <div className="space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
          <Layers size={13} className="text-[#D4AF37]" />
          <span>{t('dashboard.pos.category_filters') || 'Filtrar por Categoría'}</span>
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200 shadow-2xs ${
              selectedCategory === null
                ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                : 'bg-stone-100/80 text-stone-600 hover:bg-stone-200/70 border border-stone-200/40'
            }`}
          >
            {t('dashboard.pos.all_categories') || 'Todos los Servicios'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all duration-200 shadow-2xs ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#B38F26] text-stone-950 font-bold shadow-sm'
                  : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Catálogo Rápido en Bento Grid */}
      <div className="space-y-3.5 pt-4 border-t border-stone-100">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
            {t('dashboard.pos.fast_catalog') || 'Tratamientos Destacados'}
          </span>
          <span className="text-xs text-stone-400 font-medium">
            {filteredServices.length} {filteredServices.length === 1 ? 'servicio' : 'servicios'}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
          {filteredServices.map((s) => (
            <div
              key={s.id}
              onClick={() => onAddToCart(s)}
              className="group p-4 bg-white/90 border border-stone-200/70 hover:border-[#D4AF37]/60 hover:bg-amber-50/15 rounded-2xl cursor-pointer transition-all duration-300 flex justify-between items-center shadow-2xs hover:shadow-luxury hover:-translate-y-0.5"
            >
              <div className="space-y-1.5 pr-2 max-w-[70%]">
                <h4 className="font-serif font-semibold text-stone-900 text-xs sm:text-sm truncate group-hover:text-amber-950">
                  {s.name}
                </h4>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-stone-800 bg-stone-100 group-hover:bg-[#D4AF37]/20 group-hover:text-amber-950 px-2 py-0.5 rounded-md transition-colors">
                    {Number(s.price).toFixed(2)}€
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="w-8 h-8 rounded-xl bg-stone-100 text-stone-600 border border-stone-200/60 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:text-stone-950 group-hover:border-transparent transition-all duration-300 shadow-2xs active:scale-90 shrink-0"
              >
                <Plus size={14} />
              </button>
            </div>
          ))}
          {filteredServices.length === 0 && (
            <div className="col-span-2 py-12 text-center text-stone-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-stone-300 mx-auto" />
              <p>{t('dashboard.pos.no_services_found') || 'Ningún servicio coincide con la categoría o filtro actual.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
