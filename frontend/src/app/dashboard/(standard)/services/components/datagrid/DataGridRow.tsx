"use client"
import React from 'react';
import { Pencil, Trash2, Loader2, Sparkles, Package } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  onQuickStockDelta?: (delta: number) => void;
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
  onQuickStockDelta,
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
              ? 'bg-[#FF6B00] border-[#FF6B00]' 
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
              className="relative w-12 h-12 rounded-xl overflow-hidden cursor-pointer group shadow-sm border border-stone-200 hover:border-[#FF6B00] hover:scale-105 transition-all"
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
              className="w-12 h-12 rounded-xl border border-dashed border-stone-300 hover:border-[#FF6B00] flex items-center justify-center text-stone-400 hover:text-[#FF6B00] hover:bg-stone-50 transition-all cursor-pointer group bg-stone-50/50"
              title={language === 'fr' ? "Ajouter une image" : language === 'en' ? "Add image" : "Añadir imagen"}
            >
              <span className="text-lg font-light group-hover:scale-110 transition-all text-stone-400 group-hover:text-[#FF6B00]">+</span>
            </button>
          )}
        </div>
      </td>

      {/* Nombre y Badge de Categoría */}
      <td className="p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="font-bold text-stone-800 text-sm">{svc.name}</div>
          {svc.is_product ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] rounded-full font-bold bg-stone-100 text-stone-700 border border-stone-200">
              <Package size={10} className="text-stone-500" /> Producto
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[9px] rounded-full font-semibold bg-orange-50 text-orange-900 border border-orange-200/60">
              <Sparkles size={10} className="text-[#FF6B00]" /> Servicio
            </span>
          )}
          {svc.is_visible_on_web === false && (
            <span className="px-1.5 py-0.5 text-[9px] rounded-full font-bold bg-rose-50 text-rose-700 border border-rose-200" title="Oculto de la web pública (Uso interno TPV/Agenda)">
              Solo TPV
            </span>
          )}
          {svc.is_featured && (
            <span className="px-2 py-0.5 text-[9px] rounded-full font-black uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-200">
              {language === 'fr' ? 'À la une' : language === 'en' ? 'Featured' : 'Destacado'}
            </span>
          )}
        </div>
        {svc.is_product && (svc.supplier || svc.sku || svc.supplier_code) && (
          <div className="flex items-center gap-2 mt-1 flex-wrap text-[10px] font-mono text-stone-500">
            {svc.supplier && (
              <span className="px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 font-sans font-semibold">
                {svc.supplier}
              </span>
            )}
            {(svc.sku || svc.supplier_code) && (
              <span>Ref: {svc.sku || svc.supplier_code}</span>
            )}
            {svc.cost_price !== null && svc.cost_price !== undefined && (
              <span className="text-stone-400">Coste: {Number(svc.cost_price).toFixed(2)}€</span>
            )}
          </div>
        )}
        {svc.description && (
          <div className="text-stone-400 text-xs mt-0.5 line-clamp-1 max-w-xl font-medium">
            {svc.description}
          </div>
        )}
      </td>

      {/* Categoría (Select Moderno Luxury) */}
      <td className="p-4">
        <div className="min-w-[150px] max-w-[190px]">
          <Select
            value={svc.category_id || 'none'}
            disabled={isSavingCategory}
            onValueChange={(val) => onCategorySave(val === 'none' ? '' : val)}
          >
            <SelectTrigger
              id={`services-category-select-${svc.id}`}
              className="h-8.5 rounded-xl bg-stone-50/80 hover:bg-stone-100/80 border-stone-200/80 focus:ring-1 focus:ring-[#FF6B00] focus:border-[#FF6B00] text-xs font-semibold text-stone-800 transition-all shadow-2xs gap-1.5"
            >
              <div className="flex items-center gap-1.5 truncate">
                {isSavingCategory && (
                  <Loader2 size={12} className="animate-spin text-[#FF6B00] shrink-0" />
                )}
                <SelectValue placeholder={language === 'fr' ? 'Sans catégorie' : language === 'en' ? 'No Category' : 'Sin Categoría'} />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-stone-200/80 shadow-luxury bg-white/95 backdrop-blur-md py-1 max-h-60">
              <SelectItem value="none" className="text-xs font-medium text-stone-500 rounded-lg cursor-pointer">
                {language === 'fr' ? 'Sans catégorie' : language === 'en' ? 'No Category' : 'Sin Categoría'}
              </SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.id} value={cat.id} className="text-xs font-semibold text-stone-800 rounded-lg cursor-pointer">
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </td>

      {/* Duración o Control Rápido de Stock (Productos TPV) */}
      <td className="p-4">
        {svc.is_product ? (() => {
          const stockVal = Number(svc.stock ?? 0);
          const minStockVal = svc.min_stock !== null && svc.min_stock !== undefined ? Number(svc.min_stock) : 0;
          const isZero = stockVal <= 0;
          const isLow = !isZero && minStockVal > 0 && stockVal <= minStockVal;
          const badgeCls = isZero
            ? 'bg-rose-50 text-rose-700 border-rose-200'
            : isLow
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-emerald-50 text-emerald-700 border-emerald-200';

          return (
            <div className="flex items-center gap-1.5">
              {onQuickStockDelta && (
                <button
                  type="button"
                  onClick={() => onQuickStockDelta(-1)}
                  disabled={stockVal <= 0}
                  className="w-6 h-6 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  title="Restar 1 unidad"
                >
                  -
                </button>
              )}
              <span className={`px-2 py-1 rounded-lg border text-[11px] font-mono font-bold whitespace-nowrap ${badgeCls}`}>
                {stockVal} {svc.stock_unit || 'uds'}
              </span>
              {onQuickStockDelta && (
                <button
                  type="button"
                  onClick={() => onQuickStockDelta(1)}
                  className="w-6 h-6 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 text-stone-600 text-xs font-bold flex items-center justify-center cursor-pointer"
                  title="Sumar 1 unidad"
                >
                  +
                </button>
              )}
            </div>
          );
        })() : (
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
              className="w-full pr-10 pl-3 py-2 bg-stone-50/70 hover:bg-stone-100/70 focus:bg-white border border-stone-200 focus:border-[#FF6B00] rounded-xl text-xs font-bold text-stone-800 outline-none text-right transition-all focus:ring-1 focus:ring-[#FF6B00]"
            />
            <span className="absolute right-2.5 text-stone-400 text-[10px] font-bold pointer-events-none">min</span>
            {isSavingDuration && (
              <Loader2 size={12} className="absolute left-2 animate-spin text-[#FF6B00]" />
            )}
          </div>
        )}
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
            className="w-full pr-7 pl-3 py-2 bg-stone-50/70 hover:bg-stone-100/70 focus:bg-white border border-stone-200 focus:border-[#FF6B00] rounded-xl text-xs font-bold text-stone-800 outline-none text-right transition-all focus:ring-1 focus:ring-[#FF6B00]"
          />
          <span className="absolute right-2.5 text-stone-400 text-xs font-bold pointer-events-none">€</span>
          {isSavingPrice && (
            <Loader2 size={12} className="absolute left-2 animate-spin text-[#FF6B00]" />
          )}
        </div>
      </td>

      {/* Interruptor de Estado (Toggle Switch) */}
      <td className="p-4 text-center">
        <div className="flex justify-center items-center">
          {isStatusUpdating ? (
            <Loader2 size={16} className="animate-spin text-[#FF6B00]" />
          ) : (
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id={`services-status-toggle-${svc.id}`}
                type="checkbox"
                checked={svc.is_active}
                onChange={onToggleStatus}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-stone-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 shadow-2xs"></div>
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
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-stone-800 bg-white border border-stone-200/80 hover:border-stone-300 rounded-xl shadow-2xs active:scale-95 transition-all"
            title={language === 'fr' ? 'Modifier en détail' : language === 'en' ? 'Edit details' : 'Editar detalladamente'}
          >
            <Pencil size={13} strokeWidth={1.75} />
          </button>
          <button
            id={`services-delete-btn-${svc.id}`}
            type="button"
            onClick={onDeleteClick}
            className="w-8 h-8 flex items-center justify-center text-stone-400 hover:text-rose-600 bg-white border border-stone-200/80 hover:border-rose-200 hover:bg-rose-50/50 rounded-xl shadow-2xs active:scale-95 transition-all"
            title={language === 'fr' ? 'Supprimer définitivement' : language === 'en' ? 'Delete permanently' : 'Eliminar permanentemente'}
          >
            <Trash2 size={13} strokeWidth={1.75} />
          </button>
        </div>
      </td>
    </tr>
  );
}
