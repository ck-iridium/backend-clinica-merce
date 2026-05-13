'use client';

interface MediaBulkBarProps {
  count: number;
  deleting: boolean;
  onClear: () => void;
  onDelete: () => void;
}

export default function MediaBulkBar({ count, deleting, onClear, onDelete }: MediaBulkBarProps) {
  if (count === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center gap-3 bg-stone-900 text-white px-6 py-4 rounded-[2rem] shadow-2xl border border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 bg-red-500 text-white rounded-xl flex items-center justify-center text-sm font-black">
            {count}
          </span>
          <span className="text-sm font-bold">archivo{count > 1 ? 's' : ''} seleccionado{count > 1 ? 's' : ''}</span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <button
          onClick={onClear}
          className="text-sm text-white/60 hover:text-white font-bold transition-colors"
        >
          Cancelar
        </button>
        <button
          onClick={onDelete}
          disabled={deleting}
          className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-xl font-black text-sm transition-all active:scale-95 disabled:opacity-50 shadow-lg shadow-red-500/30"
        >
          {deleting
            ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Eliminando...</span></>
            : <><span>🗑️</span><span>Borrar {count} seleccionados</span></>
          }
        </button>
      </div>
    </div>
  );
}
