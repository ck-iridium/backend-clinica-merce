import React from 'react';

interface SeparatorSpacerFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
}

export function SeparatorSpacerFields({ editFormData, set }: SeparatorSpacerFieldsProps) {
  const currentSpacing = editFormData.spacing || 'medium';
  const currentStyle = editFormData.style || 'line_gold';

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
          Estilo del Divisor
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'line_gold', label: 'Línea Dorada' },
            { id: 'line_subtle', label: 'Línea Gris' },
            { id: 'spacer_only', label: 'Solo Espacio' },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => set('style', opt.id)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                currentStyle === opt.id
                  ? 'bg-stone-900 border-stone-900 text-[#d4af37]'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
          Altura / Separación Vertical
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { id: 'small', label: 'Corta (24px)' },
            { id: 'medium', label: 'Normal (48px)' },
            { id: 'large', label: 'Amplia (80px)' },
          ].map(opt => (
            <button
              key={opt.id}
              type="button"
              onClick={() => set('spacing', opt.id)}
              className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center ${
                currentSpacing === opt.id
                  ? 'bg-stone-900 border-stone-900 text-white'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
