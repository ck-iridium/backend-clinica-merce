"use client"
import React from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';

interface DataGridBulkBarProps {
  selectedCount: number;
  bulkActionLoading: boolean;
  onBulkActivate: () => void;
  onBulkDeactivate: () => void;
  onBulkDelete: () => void;
  language: string;
}

export function DataGridBulkBar({
  selectedCount,
  bulkActionLoading,
  onBulkActivate,
  onBulkDeactivate,
  onBulkDelete,
  language,
}: DataGridBulkBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-[#1c1917] text-white rounded-2xl p-4 md:px-6 shadow-xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-[#d4af37] text-stone-950 flex items-center justify-center text-xs font-black">
          {selectedCount}
        </span>
        <span className="text-xs font-bold text-stone-300 tracking-wide">
          {language === 'fr' ? 'services sélectionnés pour action groupée' : language === 'en' ? 'services selected for bulk action' : 'servicios seleccionados para acción masiva'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
        <button
          id="services-bulk-activate-btn"
          type="button"
          disabled={bulkActionLoading}
          onClick={onBulkActivate}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Eye size={14} /> {language === 'fr' ? 'Tout activer' : language === 'en' ? 'Activate All' : 'Activar Todos'}
        </button>
        <button
          id="services-bulk-deactivate-btn"
          type="button"
          disabled={bulkActionLoading}
          onClick={onBulkDeactivate}
          className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <EyeOff size={14} /> {language === 'fr' ? 'Tout désactiver' : language === 'en' ? 'Deactivate All' : 'Desactivar Todos'}
        </button>
        <button
          id="services-bulk-delete-btn"
          type="button"
          disabled={bulkActionLoading}
          onClick={onBulkDelete}
          className="px-4 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800/40 text-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <Trash2 size={14} /> {language === 'fr' ? 'Supprimer le lot' : language === 'en' ? 'Delete Bulk' : 'Eliminar Lote'}
        </button>
      </div>
    </div>
  );
}
