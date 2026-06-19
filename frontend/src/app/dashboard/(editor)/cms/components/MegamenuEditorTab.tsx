"use client"
import React from 'react';

interface MegamenuEditorTabProps {
  megamenuLayout: 'bento' | 'directory';
  setMegamenuLayout: (layout: 'bento' | 'directory') => void;
  megamenuCategories: string[] | null;
  setMegamenuCategories: (cats: string[] | null) => void;
  categories: any[];
  toggleMegamenuCategory: (categoryId: string) => void;
}

export default function MegamenuEditorTab({
  megamenuLayout,
  setMegamenuLayout,
  megamenuCategories,
  setMegamenuCategories,
  categories,
  toggleMegamenuCategory
}: MegamenuEditorTabProps) {
  return (
    <div className="space-y-6">
      <p className="text-xs text-stone-400 font-medium leading-relaxed">
        Personaliza la estructura y las categorías que se muestran cuando un cliente pasa el cursor sobre "Servicios" en la barra de navegación principal.
      </p>
      
      {/* Layout Selector */}
      <div className="space-y-3">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
          Distribución Visual (Layout)
        </label>
        <div className="grid grid-cols-2 gap-4">
          {/* Bento Option */}
          <div
            onClick={() => setMegamenuLayout('bento')}
            className={`p-4 rounded-3xl border cursor-pointer transition-all duration-300 ${
              megamenuLayout === 'bento'
                ? 'border-[#d4af37] bg-amber-50/10 shadow-[0_4px_16px_rgba(212,175,55,0.08)]'
                : 'border-stone-100 hover:border-stone-200 bg-white hover:bg-stone-50/50'
            }`}
          >
            <div className="h-16 w-full rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-3">
              <div className="grid grid-cols-3 gap-1 w-12 h-10">
                <div className="bg-[#d4af37] rounded col-span-2"></div>
                <div className="bg-stone-200 rounded"></div>
                <div className="bg-stone-200 rounded"></div>
                <div className="bg-[#d4af37]/60 rounded col-span-2"></div>
              </div>
            </div>
            <div className="text-xs font-bold text-stone-800 text-center">Bento Grid</div>
            <p className="text-[9px] text-stone-400 text-center mt-1">Imágenes y diseño asimétrico</p>
          </div>

          {/* Directory Option */}
          <div
            onClick={() => setMegamenuLayout('directory')}
            className={`p-4 rounded-3xl border cursor-pointer transition-all duration-300 ${
              megamenuLayout === 'directory'
                ? 'border-[#d4af37] bg-amber-50/10 shadow-[0_4px_16px_rgba(212,175,55,0.08)]'
                : 'border-stone-100 hover:border-stone-200 bg-white hover:bg-stone-50/50'
            }`}
          >
            <div className="h-16 w-full rounded-2xl bg-stone-50 border border-stone-100 flex items-center justify-center mb-3">
              <div className="flex gap-2 w-14 h-10 items-center justify-center">
                <div className="flex flex-col gap-1 w-4">
                  <div className="h-1 bg-[#d4af37] rounded w-full"></div>
                  <div className="h-1 bg-stone-200 rounded w-3"></div>
                  <div className="h-1 bg-stone-200 rounded w-2"></div>
                </div>
                <div className="flex flex-col gap-1 w-4">
                  <div className="h-1 bg-[#d4af37] rounded w-full"></div>
                  <div className="h-1 bg-stone-200 rounded w-3"></div>
                  <div className="h-1 bg-stone-200 rounded w-2"></div>
                </div>
                <div className="flex flex-col gap-1 w-4">
                  <div className="h-1 bg-[#d4af37] rounded w-full"></div>
                  <div className="h-1 bg-stone-200 rounded w-3"></div>
                  <div className="h-1 bg-stone-200 rounded w-2"></div>
                </div>
              </div>
            </div>
            <div className="text-xs font-bold text-stone-800 text-center">Directorio</div>
            <p className="text-[9px] text-stone-400 text-center mt-1">Lista detallada en columnas</p>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="border-t border-stone-100 pt-6 space-y-4">
        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
          Filtro de Categorías
        </label>
        
        {/* Option Toggle */}
        <div className="flex gap-2 bg-stone-100/60 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setMegamenuCategories(null)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              megamenuCategories === null
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Mostrar Todas
          </button>
          <button
            type="button"
            onClick={() => {
              const activeCats = categories.filter(c => c.is_active).map(c => c.id);
              setMegamenuCategories(activeCats);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              megamenuCategories !== null
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Selección Manual
          </button>
        </div>

        {/* Selection Checklist */}
        {megamenuCategories === null ? (
          <div className="bg-amber-50/20 border border-amber-100/50 rounded-2xl p-4 text-xs text-stone-600 leading-relaxed">
            <span className="font-bold text-amber-800 block mb-1">💡 Modo automático activo</span>
            Todas las categorías de servicios activas se mostrarán dinámicamente. Al crear una nueva categoría, se incluirá de forma automática.
          </div>
        ) : (
          <div className="space-y-2 border border-stone-100 rounded-3xl p-4 bg-white max-h-[300px] overflow-y-auto">
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block mb-2 px-1">
              Categorías del Menú
            </span>
            {categories.length === 0 ? (
              <p className="text-xs text-stone-400 px-1">No hay categorías disponibles.</p>
            ) : (
              categories.map(cat => {
                const isChecked = megamenuCategories.includes(cat.id);
                return (
                  <label
                    key={cat.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-stone-50 transition-colors cursor-pointer text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleMegamenuCategory(cat.id)}
                      className="rounded text-[#d4af37] focus:ring-[#d4af37] border-stone-200 w-4 h-4 cursor-pointer"
                    />
                    <span className={`font-semibold ${isChecked ? 'text-stone-800' : 'text-stone-400'}`}>
                      {cat.name}
                    </span>
                    {!cat.is_active && (
                      <span className="ml-auto text-[9px] font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                        Inactiva
                      </span>
                    )}
                  </label>
                );
              })
            )}
            {megamenuCategories.length === 0 && (
              <div className="text-[10px] text-rose-600 bg-rose-50/50 border border-rose-100 rounded-2xl p-3 mt-2">
                ⚠️ Has desmarcado todas las categorías. **El megamenú no se mostrará** en la cabecera pública de la web.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
