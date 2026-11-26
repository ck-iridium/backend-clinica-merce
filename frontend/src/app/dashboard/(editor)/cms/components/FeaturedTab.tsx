"use client";
import React, { useState, useMemo } from 'react';
import { Sparkles, Check, Search, X, Layers, Clock, Tag } from 'lucide-react';

interface FeaturedTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  services: any[];
  categories: any[];
}

export default function FeaturedTab({
  formData,
  setFormData,
  services = [],
  categories = []
}: FeaturedTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');

  const config = formData.featured_services_config || {
    enabled: false,
    title: 'Tratamientos Estrella',
    subtitle: 'Nuestra selección más demandada para una experiencia de cuidado y bienestar excepcional.',
    service_ids: [],
    layout_style: 'bento',
    show_price: true,
    show_duration: true
  };

  const updateConfig = (key: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      featured_services_config: {
        ...(prev.featured_services_config || {
          enabled: false,
          title: 'Tratamientos Estrella',
          subtitle: 'Nuestra selección más demandada para una experiencia de cuidado y bienestar excepcional.',
          service_ids: [],
          layout_style: 'bento',
          show_price: true,
          show_duration: true
        }),
        [key]: value
      }
    }));
  };

  const selectedIds: string[] = Array.isArray(config.service_ids) ? config.service_ids : [];

  const toggleService = (id: string) => {
    const stringId = String(id);
    let newIds: string[];
    if (selectedIds.includes(stringId)) {
      newIds = selectedIds.filter(item => item !== stringId);
    } else {
      newIds = [...selectedIds, stringId];
    }
    updateConfig('service_ids', newIds);
  };

  const clearSelection = () => {
    updateConfig('service_ids', []);
  };

  // Filtrado de servicios
  const filteredServices = useMemo(() => {
    return services.filter((svc: any) => {
      const matchesSearch = !searchTerm.trim() || 
        svc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (svc.description && svc.description.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategoryFilter === 'all' || 
        String(svc.category_id) === String(selectedCategoryFilter);

      return matchesSearch && matchesCategory;
    });
  }, [services, searchTerm, selectedCategoryFilter]);

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c: any) => c.id === categoryId);
    return cat?.name || 'General';
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div>
        <h2 className="text-lg font-serif font-bold text-stone-900 leading-tight">
          Tratamientos Destacados
        </h2>
        <p className="text-[10px] text-stone-400 uppercase tracking-widest font-medium">
          Selección protagonista para la portada
        </p>
      </div>

      {/* Interruptor Principal */}
      <div className="p-5 border border-stone-100 rounded-3xl bg-white shadow-sm flex items-center justify-between">
        <div>
          <span className="text-sm font-bold text-stone-800 block">
            Activar Bloque de Destacados
          </span>
          <span className="text-xs text-stone-400">
            Muestra una sección curada con tus tratamientos estrella en la portada.
          </span>
        </div>
        <button
          id="cms-featured-toggle"
          type="button"
          onClick={() => updateConfig('enabled', !config.enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
            config.enabled ? 'bg-emerald-500' : 'bg-stone-200'
          }`}
        >
          <span
            className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
              config.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {config.enabled && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Textos del Bloque */}
          <div className="p-5 border border-stone-100 rounded-3xl bg-[#F7F7F5] shadow-sm space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">
                Título del Bloque
              </label>
              <input
                type="text"
                value={config.title || ''}
                onChange={(e) => updateConfig('title', e.target.value)}
                placeholder="Ej: Tratamientos Estrella"
                className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 text-sm font-bold shadow-sm"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">
                Subtítulo / Introducción
              </label>
              <textarea
                rows={2}
                value={config.subtitle || ''}
                onChange={(e) => updateConfig('subtitle', e.target.value)}
                placeholder="Breve frase que invite a descubrir los tratamientos seleccionados..."
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 text-xs font-medium shadow-sm resize-y leading-relaxed"
              />
            </div>

            {/* Estilo de Visualización */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400 mb-2">
                Diseño Visual
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'bento', label: 'Bento Luxury', icon: '⊞', desc: 'Asimétrico con protagonista' },
                  { value: 'grid', label: 'Grid Limpio', icon: '▦', desc: 'Tarjetas 3 columnas' },
                  { value: 'slider', label: 'Carrusel', icon: '🎞️', desc: 'Desplazamiento horizontal' }
                ].map((opt) => {
                  const isSelected = (config.layout_style || 'bento') === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateConfig('layout_style', opt.value)}
                      className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                          : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <span className="text-lg mb-1">{opt.icon}</span>
                      <span className="text-[10px] font-bold uppercase tracking-tight">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conmutadores de Detalle */}
            <div className="pt-2 flex items-center justify-between border-t border-stone-200/60">
              <span className="text-xs font-semibold text-stone-700">Mostrar Precio</span>
              <button
                type="button"
                onClick={() => updateConfig('show_price', config.show_price === false ? true : false)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
                  config.show_price !== false ? 'bg-emerald-500' : 'bg-stone-200'
                }`}
              >
                <span className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  config.show_price !== false ? 'translate-x-[20px]' : 'translate-x-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-700">Mostrar Duración</span>
              <button
                type="button"
                onClick={() => updateConfig('show_duration', config.show_duration === false ? true : false)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none ${
                  config.show_duration !== false ? 'bg-emerald-500' : 'bg-stone-200'
                }`}
              >
                <span className={`pointer-events-none block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  config.show_duration !== false ? 'translate-x-[20px]' : 'translate-x-1'
                }`} />
              </button>
            </div>
          </div>

          {/* Selector de Tratamientos */}
          <div className="p-5 border border-stone-100 rounded-3xl bg-white shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                  Tratamientos Seleccionados ({selectedIds.length})
                </span>
                <span className="text-[11px] text-stone-400">
                  Marca los servicios que deseas incluir en este bloque.
                </span>
              </div>
              {selectedIds.length > 0 && (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-[11px] font-bold text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Limpiar todos
                </button>
              )}
            </div>

            {/* Buscador y filtro por categoría */}
            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar tratamiento por nombre..."
                  className="w-full pl-9 pr-8 py-2 rounded-xl border border-stone-200 bg-stone-50/50 text-xs focus:outline-none focus:ring-1 focus:ring-stone-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {categories.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-1 hide-scroll">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryFilter('all')}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                      selectedCategoryFilter === 'all'
                        ? 'bg-[#FF6B00] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Todas ({services.length})
                  </button>
                  {categories.map((cat: any) => {
                    const isCurrent = selectedCategoryFilter === String(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategoryFilter(String(cat.id))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap transition-all ${
                          isCurrent
                            ? 'bg-[#FF6B00] text-white'
                            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {cat.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Lista interactiva de servicios */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 divide-y divide-stone-100">
              {filteredServices.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-6">
                  No se encontraron tratamientos con ese criterio.
                </p>
              ) : (
                filteredServices.map((svc: any) => {
                  const isChecked = selectedIds.includes(String(svc.id));
                  const catName = getCategoryName(svc.category_id);

                  return (
                    <div
                      key={svc.id}
                      onClick={() => toggleService(svc.id)}
                      className={`pt-2 pb-2 px-3 rounded-2xl flex items-center justify-between cursor-pointer transition-all ${
                        isChecked 
                          ? 'bg-[#FF6B00]/5 border border-[#FF6B00]/30' 
                          : 'hover:bg-stone-50 border border-transparent'
                      }`}
                    >
                      <div className="flex-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-stone-400">
                            {catName}
                          </span>
                          {svc.duration_minutes && (
                            <span className="text-[9px] text-stone-400 flex items-center gap-0.5">
                              <Clock size={9} />
                              {svc.duration_minutes}m
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-bold text-stone-900 truncate">
                          {svc.name}
                        </h4>
                        {svc.price && (
                          <span className="text-[11px] font-semibold text-[#d4af37]">
                            {parseFloat(svc.price).toFixed(2)} €
                          </span>
                        )}
                      </div>

                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border transition-all ${
                          isChecked
                            ? 'bg-[#FF6B00] border-[#FF6B00] text-white shadow-2xs'
                            : 'border-stone-200 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
