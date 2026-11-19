"use client";
import React from 'react';
import { Palette } from 'lucide-react';

interface ColorPreset {
  value: string;
  label: string;
  colorClass?: string;
  style?: React.CSSProperties;
}

interface ColorPalettePickerProps {
  label?: string;
  value: string;
  onChange: (val: string) => void;
  presets?: ColorPreset[];
}

export function ColorPalettePicker({
  label,
  value,
  onChange,
  presets = [
    { value: 'primary', label: 'Marca', style: { background: 'var(--primary, #d4af37)' } },
    { value: 'stone-900', label: 'Antracita', colorClass: 'bg-stone-900' },
    { value: 'white', label: 'Blanco', colorClass: 'bg-white border border-stone-300' },
  ],
}: ColorPalettePickerProps) {
  const isCustom = value?.startsWith('#');

  return (
    <div>
      {label && (
        <label className="block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5">
          {label}
        </label>
      )}

      <div className="flex items-center gap-2">
        {presets.map(p => {
          const isSel = value === p.value;
          return (
            <button
              key={p.value}
              type="button"
              onClick={() => onChange(p.value)}
              className={`h-8 px-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                isSel
                  ? 'bg-stone-900 border-stone-900 text-white shadow-xs ring-1 ring-stone-900'
                  : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
              }`}
            >
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${p.colorClass || ''}`}
                style={p.style}
              />
              <span>{p.label}</span>
            </button>
          );
        })}

        {/* Botón Cromático de Paleta Personalizada */}
        <div className="relative group/color" title="Color personalizado (abrir paleta)">
          <button
            type="button"
            className={`h-8 px-2.5 rounded-xl border text-[11px] font-bold transition-all flex items-center gap-1.5 relative overflow-hidden ${
              isCustom
                ? 'bg-stone-900 border-stone-900 text-white shadow-xs ring-1 ring-stone-900'
                : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span
              className="w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center border border-white/80 shadow-2xs"
              style={{
                background: isCustom
                  ? value
                  : 'conic-gradient(from 180deg at 50% 50%, #f43f5e 0deg, #fb923c 60deg, #facc15 120deg, #4ade80 180deg, #38bdf8 240deg, #818cf8 300deg, #f43f5e 360deg)',
              }}
            >
              <Palette size={8} className="text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
            </span>
            <span>{isCustom ? value.toUpperCase() : 'Personalizado'}</span>
          </button>

          <input
            type="color"
            value={isCustom ? value : '#ffffff'}
            onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            title="Seleccionar color personalizado"
          />
        </div>
      </div>
    </div>
  );
}
