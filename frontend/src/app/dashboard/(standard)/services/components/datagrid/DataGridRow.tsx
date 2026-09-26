"use client"
import React from 'react';
import { Pencil, Trash2, Loader2 } from 'lucide-react';

interface DataGridRowProps {
  svc: any;
  isChecked: boolean;
  onToggleSelect: () => void;
  categories: any[];
  displayCategory: string;
  isStatusUpdating: boolean;
  onToggleStatus: () => void;
  onOpenImagePicker: () => void;
  inputPriceVal: string;
  onPriceChange: (val: string) => void;
  onPriceSave: (val: string) => void;
  isSavingPrice: boolean;
  inputDurationVal: string;
  onDurationChange: (val: string) => void;
  onDurationSave: (val: string) => void;
  isSavingDuration: boolean;
  isSavingCategory: boolean;
  onCategorySave: (newCatId: string) => void;
  onEditClick: (svc: any) => void;
  onDeleteClick: () => void;
  language: string;
}

export function DataGridRow({
  svc,
  isChecked,
  onToggleSelect,
  categories,
  isStatusUpdating,
  onToggleStatus,
  onOpenImagePicker,
  inputPriceVal,
  onPriceChange,
  onPriceSave,
  isSavingPrice,
  inputDurationVal,
  onDurationChange,
  onDurationSave,
  isSavingDuration,
  isSavingCategory,
  onCategorySave,
  onEditClick,
  onDeleteClick,
  language,
}: DataGridRowProps) {
  return (
    <tr 
      className={`hover:bg-stone-50/50 transition-colors ${
        !svc.is_active ? 'bg-stone-50/20 text-stone-400' : 'text-stone-800'
      }`}
    >
      {/* Checkbox Fila */}
      <td className="p-4 text-center">
        <label className="relative flex items-center justify-center cursor-pointer select-none">
          <input
            id={`services-select-checkbox-${svc.id}`}
            type="checkbox"
            checked={isChecked}
            onChange={onToggleSelect}
            className="sr-only"
          />
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            isChecked 
              ? 'bg-[#d4af37] border-[#d4af37]' 
              : 'border-stone-300 bg-white hover:border-stone-400'
          }`}>
            {isChecked && (
              <svg className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>
      </td>

      {/* Imagen con MediaPicker Directo */}
      <td className="p-4 w-20 text-center">
        <div className="flex items-center justify-center">
          {svc.image_url ? (
            <div 
              id={`services-image-cover-div-${svc.id}`}
              onClick={onOpenImagePicker}
              className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-stone-200 hover:border-[#d4af37] hover:scale-105 transition-all"
              title={language === 'fr' ? "Changer l'image" : language === 'en' ? "Change image" : "Cambiar imagen"}
            >
              <img 
                src={svc.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${svc.image_url}` : svc.image_url} 
                alt={svc.name}
                className="w-full h-full object-cover group-hover:opacity-75 transition-all"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[9px] font-black uppercase tracking-widest">
                {language === 'fr' ? 'Edit' : language === 'en' ? 'Edit' : 'Editar'}
              </div>
            </div>
          ) : (
            <button
              id={`services-image-placeholder-btn-${svc.id}`}
              type="button"
              onClick={onOpenImagePicker}
              className="w-12 h-12 rounded-xl border border-dashed border-stone-300 hover:border-[#d4af37] flex items-center justify-center text-stone-400 hover:text-[#d4af37] hover:bg-stone-50 transition-all cursor-pointer group bg-stone-50/50"
              title={language === 'fr' ? "Ajouter une image" : language === 'en' ? "Add image" : "Añadir imagen"}
            >
              <span className="text-lg font-light group-hover:scale-110 transition-all text-stone-400 group-hover:text-[#d4af37]">+</span>
            </button>
          )}
        </div>
      </td>

      {/* Nombre y Badge de Categoría */}
      <td className="p-4">
        <div className="flex items-center gap-3">
          <div className="font-bold text-stone-800 text-sm">{svc.name}</div>
          {svc.is_featured && (
            <span className="px-2 py-0.5 text-[9px] rounded-full font-black uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-200">
              {language === 'fr' ? 'À la une' : language === 'en' ? 'Featured' : 'Destacado'}
            </span>
          )}
        </div>
        {svc.description && (
          <div className="text-stone-400 text-xs mt-0.5 line-clamp-1 max-w-xl font-medium">
            {svc.description}
          </div>
        )}
      </td>

      {/* Categoría (Select Moderno) */}
      <td className="p-4">
        <div className="relative flex items-center min-w-[140px] max-w-[180px]">
          <select
            id={`services-category-select-${svc.id}`}
            value={svc.category_id || ''}
            disabled={isSavingCategory}
            onChange={e => onCategorySave(e.target.value)}
            className="w-full pl-3 pr-8 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 focus:border-[#d4af37] rounded-lg text-xs font-bold text-stone-800 outline-none transition-all cursor-pointer focus:ring-1 focus:ring-[#d4af37] appearance-none"
          >
            <option value="">{language === 'fr' ? 'Sans catégorie' : language === 'en' ? 'No Category' : 'Sin Categoría'}</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 pointer-events-none text-stone-400">
            {isSavingCategory ? (
              <Loader2 size={12} className="animate-spin text-[#d4af37]" />
            ) : (
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </div>
        </div>
      </td>

      {/* Duración (Entrada de Duración Directa con Auto-guardado) */}
      <td className="p-4">
        <div className="relative flex items-center max-w-[110px]">
          <input
            id={`services-duration-input-${svc.id}`}
            type="text"
            value={inputDurationVal}
            onChange={e => onDurationChange(e.target.value)}
            onBlur={e => onDurationSave(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onDurationSave(inputDurationVal);
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full pr-10 pl-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 focus:border-[#d4af37] rounded-lg text-xs font-bold text-stone-800 dark:text-stone-800 outline-none text-right transition-all focus:ring-1 focus:ring-[#d4af37]"
          />
          <span className="absolute right-2.5 text-stone-400 text-[10px] font-bold pointer-events-none">min</span>
          {isSavingDuration && (
            <Loader2 size={12} className="absolute left-1 animate-spin text-[#d4af37]" />
          )}
        </div>
      </td>

      {/* Entrada de Precio Directa (Auto-guardado) */}
      <td className="p-4">
        <div className="relative flex items-center max-w-[100px]">
          <input
            id={`services-price-input-${svc.id}`}
            type="text"
            value={inputPriceVal}
            onChange={e => onPriceChange(e.target.value)}
            onBlur={e => onPriceSave(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                onPriceSave(inputPriceVal);
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-full pr-7 pl-3 py-1.5 bg-stone-50 hover:bg-stone-100 border border-stone-200 focus:border-[#d4af37] rounded-lg text-xs font-bold text-stone-800 dark:text-stone-800 outline-none text-right transition-all focus:ring-1 focus:ring-[#d4af37]"
          />
          <span className="absolute right-2.5 text-stone-400 text-xs font-bold pointer-events-none">€</span>
          {isSavingPrice && (
            <Loader2 size={12} className="absolute left-1 animate-spin text-[#d4af37]" />
          )}
        </div>
      </td>

      {/* Interruptor de Estado (Toggle Switch) */}
      <td className="p-4 text-center">
        <div className="flex justify-center items-center">
          {isStatusUpdating ? (
            <Loader2 size={16} className="animate-spin text-primary" />
          ) : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id={`services-status-toggle-${svc.id}`}
                type="checkbox"
                checked={svc.is_active}
                onChange={onToggleStatus}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
            </label>
          )}
        </div>
      </td>

      {/* Iconos de Edición Detallada y Borrado */}
      <td className="p-4 text-center">
        <div className="flex justify-center items-center gap-2">
          <button
            id={`services-edit-details-btn-${svc.id}`}
            type="button"
            onClick={() => onEditClick(svc)}
            className="p-1.5 text-stone-400 hover:text-stone-700 bg-white border border-stone-200 hover:border-stone-400 rounded-lg shadow-sm active:scale-95 transition-all"
            title={language === 'fr' ? 'Modifier en détail' : language === 'en' ? 'Edit details' : 'Editar detalladamente'}
          >
            <Pencil size={13} strokeWidth={1.5} />
          </button>
          <button
            id={`services-delete-btn-${svc.id}`}
            type="button"
            onClick={onDeleteClick}
            className="p-1.5 text-rose-400 hover:text-rose-600 bg-white border border-stone-200 hover:border-rose-300 rounded-lg shadow-sm active:scale-95 transition-all"
            title={language === 'fr' ? 'Supprimer définitivement' : language === 'en' ? 'Delete permanently' : 'Eliminar permanentemente'}
          >
            <Trash2 size={13} strokeWidth={1.5} />
          </button>
        </div>
      </td>
    </tr>
  );
}
