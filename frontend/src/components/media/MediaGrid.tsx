'use client';

import { type MediaFile, isVideoFile } from '@/lib/mediaTypes';

interface MediaGridProps {
  files: MediaFile[];
  loading: boolean;
  selectedFile: MediaFile | null;
  selectedNames: Set<string>;
  onFileClick: (file: MediaFile) => void;
  onToggleSelect: (name: string) => void;
}

export default function MediaGrid({
  files,
  loading,
  selectedFile,
  selectedNames,
  onFileClick,
  onToggleSelect,
}: MediaGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-primary rounded-full animate-spin" />
        <p className="text-stone-400 font-medium text-sm tracking-widest uppercase">Cargando galería...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4 bg-white rounded-[2rem] border border-stone-100">
        <span className="text-5xl opacity-30">🖼️</span>
        <p className="text-stone-400 font-medium">No hay imágenes en esta categoría.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
      {files.map(file => {
        const isChecked = selectedNames.has(file.name);
        const canSelect = file.status === 'orphan';
        const isSelected = selectedFile?.name === file.name;

        return (
          <div
            key={file.name}
            className={`group relative rounded-2xl overflow-hidden aspect-square border-2 transition-all duration-200 cursor-pointer bg-stone-100
              ${isChecked ? 'border-red-500 ring-2 ring-red-400/40 scale-[0.97]' : isSelected ? 'border-primary ring-2 ring-primary/30 scale-[0.98]' : 'border-transparent hover:border-stone-300 hover:shadow-md'}`}
            onClick={() => {
              if (selectedNames.size > 0 && canSelect) {
                onToggleSelect(file.name);
              } else {
                onFileClick(file);
              }
            }}
          >
            {/* Media Preview */}
            {isVideoFile(file) ? (
              <div className="w-full h-full relative bg-stone-900 flex items-center justify-center">
                <video
                  src={file.url}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  muted
                  playsInline
                  crossOrigin="anonymous"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-lg">
                    <span className="text-white text-xs ml-0.5">▶</span>
                  </div>
                </div>
              </div>
            ) : (
              <img
                src={file.url}
                alt={file.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                crossOrigin="anonymous"
              />
            )}

            {/* Status dot */}
            <div className={`absolute top-2 right-2 w-2.5 h-2.5 rounded-full shadow-md transition-opacity ${isChecked ? 'opacity-0' : 'opacity-100'} ${file.status === 'in_use' ? 'bg-emerald-400' : 'bg-stone-400'}`} />

            {/* Checkbox — only for orphans */}
            {canSelect && (
              <div
                className="absolute top-2 left-2"
                onClick={e => { e.stopPropagation(); onToggleSelect(file.name); }}
              >
                <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shadow-md
                    ${isChecked ? 'bg-red-500 border-red-500' : 'bg-white/80 border-stone-300 opacity-0 group-hover:opacity-100'}`}>
                  {isChecked && <span className="text-white text-[10px] font-black leading-none">✓</span>}
                </div>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-stone-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none">
              <p className="text-white text-[10px] font-bold truncate w-full text-left leading-tight">{file.name}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
