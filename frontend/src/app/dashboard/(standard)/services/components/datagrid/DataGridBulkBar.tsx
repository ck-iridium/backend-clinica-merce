"use client"
import React from 'react';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="bg-[#1c1917] text-white rounded-3xl p-4 md:px-6 shadow-2xl border border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3">
        <span className="w-6 h-6 rounded-full bg-[#D4AF37] text-stone-950 flex items-center justify-center text-xs font-black shadow-xs">
          {selectedCount}
        </span>
        <span className="text-xs font-semibold text-stone-300 tracking-wide">
          {language === 'fr' ? 'services sélectionnés pour action groupée' : language === 'en' ? 'services selected for bulk action' : 'servicios seleccionados para acción masiva'}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
        <Button
          id="services-bulk-activate-btn"
          type="button"
          size="sm"
          disabled={bulkActionLoading}
          onClick={onBulkActivate}
          className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl h-9 px-3.5 gap-1.5 transition-all"
        >
          <Eye size={14} /> {language === 'fr' ? 'Tout activer' : language === 'en' ? 'Activate All' : 'Activar Todos'}
        </Button>
        <Button
          id="services-bulk-deactivate-btn"
          type="button"
          size="sm"
          disabled={bulkActionLoading}
          onClick={onBulkDeactivate}
          className="bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl h-9 px-3.5 gap-1.5 transition-all"
        >
          <EyeOff size={14} /> {language === 'fr' ? 'Tout désactiver' : language === 'en' ? 'Deactivate All' : 'Desactivar Todos'}
        </Button>
        <Button
          id="services-bulk-delete-btn"
          type="button"
          size="sm"
          disabled={bulkActionLoading}
          onClick={onBulkDelete}
          className="bg-rose-950/80 hover:bg-rose-900 border border-rose-800/40 text-rose-200 text-xs font-bold rounded-xl h-9 px-3.5 gap-1.5 transition-all"
        >
          <Trash2 size={14} /> {language === 'fr' ? 'Supprimer le lot' : language === 'en' ? 'Delete Bulk' : 'Eliminar Lote'}
        </Button>
      </div>
    </div>
  );
}
