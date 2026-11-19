import React, { useState } from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

export function getCleanFileName(url?: string): string {
  if (!url) return '';
  try {
    const parts = url.split('/');
    const lastPart = parts[parts.length - 1];
    const clean = lastPart.split('?')[0];
    if (clean.length > 26) {
      const ext = clean.split('.').pop() || 'webp';
      return `${clean.substring(0, 16)}...${ext}`;
    }
    return clean;
  } catch {
    return 'archivo_multimedia.webp';
  }
}

interface MediaSelectorFieldProps {
  value: string;
  onChange: (val: string) => void;
  onOpenGallery: () => void;
  label?: string;
  aspectRatio?: string;
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function MediaSelectorField({
  value,
  onChange,
  onOpenGallery,
  label = "Fotografía o Vídeo",
  aspectRatio = "aspect-video",
}: MediaSelectorFieldProps) {
  const [showManualUrl, setShowManualUrl] = useState(false);
  const isVideo = value && (value.includes('.mp4') || value.includes('.webm') || value.includes('video_'));
  const cleanName = getCleanFileName(value);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className={labelClass}>{label}</label>
        {value && (
          <span className="text-[10px] font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-md flex items-center gap-1.5 border border-stone-200/60">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            <span className="font-mono">{cleanName}</span>
          </span>
        )}
      </div>

      {value ? (
        <div className={`relative w-full ${aspectRatio} rounded-2xl overflow-hidden shadow-xs border border-stone-200/80 bg-stone-900 group`}>
          {isVideo ? (
            <video src={value} autoPlay loop muted playsInline className="w-full h-full object-cover" />
          ) : (
            <img src={value} alt="Vista previa" className="w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-all flex items-center justify-center gap-2 opacity-90 group-hover:opacity-100">
            <button
              type="button"
              onClick={onOpenGallery}
              className="px-4 py-2 rounded-xl bg-white/95 hover:bg-white text-stone-900 text-xs font-black uppercase tracking-wider shadow-md backdrop-blur-sm transition-all active:scale-95 flex items-center gap-1.5"
            >
              <ImageIcon size={13} className="text-[#d4af37]" />
              <span>Cambiar Medio</span>
            </button>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-xl bg-black/60 hover:bg-red-600 text-white transition-all text-xs"
              title="Quitar medio"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={onOpenGallery}
          className={`w-full ${aspectRatio} rounded-2xl border-2 border-dashed border-stone-200 hover:border-[#d4af37] bg-stone-50 hover:bg-amber-50/20 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300 group p-6 text-center select-none`}
        >
          <div className="w-10 h-10 rounded-full bg-white shadow-xs border border-stone-200 flex items-center justify-center text-stone-400 group-hover:text-[#d4af37] group-hover:border-[#d4af37] transition-all">
            <ImageIcon size={18} />
          </div>
          <span className="text-xs font-bold text-stone-600 group-hover:text-stone-900">
            Seleccionar de Galería
          </span>
          <span className="text-[10px] text-stone-400">
            Haz clic para abrir el catálogo multimedia de la clínica
          </span>
        </div>
      )}

      {/* Opción discreta para URL externa sin abrumar */}
      <div className="pt-0.5">
        {!showManualUrl ? (
          <button
            type="button"
            onClick={() => setShowManualUrl(true)}
            className="text-[10px] text-stone-400 hover:text-stone-600 hover:underline flex items-center gap-1"
          >
            <span>🔗 O pegar enlace directo externo</span>
          </button>
        ) : (
          <div className="flex gap-1.5 items-center mt-1">
            <input
              className={inputClass}
              value={value || ''}
              onChange={e => onChange(e.target.value)}
              placeholder="https://..."
            />
            <button
              type="button"
              onClick={() => setShowManualUrl(false)}
              className="p-2 text-stone-400 hover:text-stone-600"
              title="Cerrar"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
