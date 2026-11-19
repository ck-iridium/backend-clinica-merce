import React from 'react';
import { Check } from 'lucide-react';

interface CategoryFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
  dbCategories: any[];
  dbServices: any[];
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function CategoryFields({ editFormData, set, dbCategories, dbServices }: CategoryFieldsProps) {
  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className={labelClass}>Colección / Categoría de Tratamientos</label>
          <span className="text-[10px] text-stone-400 font-sans">
            {dbCategories.length} disponibles
          </span>
        </div>
        
        {/* Selector Visual de Categorías en Tarjetas de Lujo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[260px] overflow-y-auto p-1 pr-1.5 [scrollbar-width:thin]">
          {dbCategories.map(cat => {
            const isSelected = editFormData.category_id === cat.id;
            const serviceCount = dbServices?.filter(s => s.category_id === cat.id && s.is_active !== false)?.length ?? 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => set('category_id', cat.id)}
                className={`group relative text-left p-3.5 rounded-2xl border transition-all duration-300 flex items-center justify-between ${
                  isSelected
                    ? 'border-[#d4af37] bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 shadow-[0_4px_16px_-4px_rgba(212,175,55,0.25)] ring-1 ring-[#d4af37]'
                    : 'border-stone-200/80 bg-white hover:border-[#d4af37]/40 hover:bg-stone-50/70 shadow-2xs'
                }`}
              >
                <div className="min-w-0 pr-2">
                  <span className={`block font-serif text-sm font-bold tracking-tight truncate ${isSelected ? 'text-stone-950 font-black' : 'text-stone-800 group-hover:text-stone-950'}`}>
                    {cat.name}
                  </span>
                  <span className={`block text-[11px] font-sans mt-0.5 ${isSelected ? 'text-[#b38f2b] font-medium' : 'text-stone-400 group-hover:text-stone-500'}`}>
                    {serviceCount} {serviceCount === 1 ? 'tratamiento' : 'tratamientos'}
                  </span>
                </div>
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isSelected
                      ? 'bg-[#d4af37] text-white shadow-xs'
                      : 'border border-stone-200 text-transparent group-hover:border-stone-300'
                  }`}
                >
                  <Check size={12} strokeWidth={3} />
                </div>
              </button>
            );
          })}
        </div>
        {dbCategories.length === 0 && (
          <div className="p-4 rounded-2xl border border-dashed border-stone-200 text-center">
            <p className="text-xs text-stone-500 font-sans">
              No se encontraron categorías activas. Crea categorías en la sección de Servicios para vincularlas aquí.
            </p>
          </div>
        )}
      </div>

      {editFormData.category_id && (<>
        <div>
          <label className={labelClass}>Diseño / Disposición Visual</label>
          <div className="grid grid-cols-2 gap-2.5 select-none">
            {[
              { value: 'traditional_grid', label: 'Cuadrícula (Grid)', desc: 'Columnas limpias y ordenadas' },
              { value: 'bento_grid', label: 'Bento Asimétrico 2026', desc: 'Layout dinámico Quiet Luxury' },
              { value: 'cards_slider', label: 'Carrusel de Tarjetas', desc: 'Desplazamiento interactivo' },
              { value: 'minimalist_list', label: 'Lista Elegante', desc: 'Tipografía y precios discretos' }
            ].map(layout => {
              const isSelected = (editFormData.layout || 'traditional_grid') === layout.value;
              return (
                <button
                  key={layout.value}
                  type="button"
                  onClick={() => set('layout', layout.value)}
                  className={`p-3 rounded-2xl text-left transition-all duration-200 border ${
                    isSelected
                      ? 'bg-stone-950 border-stone-950 text-white shadow-md'
                      : 'bg-white border-stone-200 text-stone-700 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{layout.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                  </div>
                  <span className={`block text-[10px] mt-0.5 ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                    {layout.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className={labelClass}>Tratamientos a mostrar (opcional)</label>
          <div className="space-y-1.5 max-h-48 overflow-y-auto border border-stone-150 rounded-2xl p-3 bg-stone-50/50 [scrollbar-width:thin]">
            {dbServices.filter(s => s.category_id === editFormData.category_id && s.is_active).map(svc => (
              <label key={svc.id} className="flex items-center gap-2.5 cursor-pointer group py-1 px-1.5 rounded-lg hover:bg-stone-100/70 transition-colors">
                <input
                  type="checkbox"
                  checked={(editFormData.selected_treatment_ids || []).includes(svc.id)}
                  onChange={e => {
                    const current = editFormData.selected_treatment_ids || [];
                    set('selected_treatment_ids', e.target.checked ? [...current, svc.id] : current.filter((id: string) => id !== svc.id));
                  }}
                  className="w-4 h-4 accent-[#d4af37] rounded"
                />
                <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors font-medium">{svc.name}</span>
              </label>
            ))}
          </div>
          <p className="text-[10px] text-stone-400 mt-1">Si no seleccionas ninguno, se mostrarán todos los activos de la categoría.</p>
        </div>
        <div>
          <label className={labelClass}>Máximo de tratamientos visibles</label>
          <div className="flex gap-2 select-none">
            {[2, 3, 4, 6, 8].map(n => {
              const isSelected = (editFormData.max_items || 4) === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => set('max_items', n)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    isSelected
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {n}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className={labelClass}>Texto del enlace de acción (ej: "Ver Tratamiento", "Reservar")</label>
          <input
            className={inputClass}
            value={editFormData.link_text || ''}
            onChange={e => set('link_text', e.target.value)}
            placeholder="Por defecto: Ver tratamiento"
          />
        </div>
      </>)}
    </>
  );
}
