"use client";

import { Plus, Edit2, Trash2, Film } from 'lucide-react';

export interface ShowcaseSector {
  id: string;
  title: string;
  slug: string;
  badge_text: string | null;
  video_url: string | null;
  image_url: string | null;
  order_index: number;
}

interface SaaSCMSSectorListProps {
  sectors: ShowcaseSector[];
  loading: boolean;
  onAdd: () => void;
  onEdit: (sector: ShowcaseSector) => void;
  onDelete: (sector: ShowcaseSector) => void;
}

export default function SaaSCMSSectorList({
  sectors,
  loading,
  onAdd,
  onEdit,
  onDelete
}: SaaSCMSSectorListProps) {
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-stone-100">
        <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">Sectores Activos</h4>
        <button
          onClick={onAdd}
          className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Nuevo</span>
        </button>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-16 bg-stone-50 border border-stone-100 rounded-xl"></div>
          ))}
        </div>
      ) : sectors.length === 0 ? (
        <div className="p-6 text-center text-stone-400 font-medium text-xs bg-stone-50 rounded-2xl border border-stone-200/50">
          No hay sectores registrados.
        </div>
      ) : (
        <div className="space-y-3 font-sans">
          {sectors.map(sector => (
            <div 
              key={sector.id}
              className="p-3 bg-stone-50/50 hover:bg-stone-50 border border-stone-200/40 rounded-xl flex items-center justify-between transition-colors duration-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-stone-200 shrink-0 border border-stone-100 flex items-center justify-center relative">
                  {sector.video_url ? (
                    <video src={sector.video_url} className="w-full h-full object-cover" muted />
                  ) : (
                    <Film className="w-4 h-4 text-stone-300" />
                  )}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-stone-900 leading-tight">{sector.title}</h5>
                  <p className="text-[9px] font-mono text-stone-400 mt-0.5">slug: {sector.slug}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onEdit(sector)}
                  className="w-7 h-7 rounded-lg hover:bg-stone-200/60 flex items-center justify-center text-stone-600 hover:text-stone-900 transition-colors"
                  title="Editar Sector"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(sector)}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-stone-400 hover:text-red-600 transition-colors"
                  title="Eliminar Sector"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
