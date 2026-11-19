import React from 'react';
import { SmartLinkField } from '../SmartLinkField';
import { ColorPalettePicker } from '../ColorPalettePicker';

interface ButtonFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
  dbCategories?: any[];
  dbServices?: any[];
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function ButtonFields({
  editFormData,
  set,
  dbCategories = [],
  dbServices = [],
}: ButtonFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className={labelClass}>Texto del Botón</label>
        <input 
          className={inputClass} 
          value={editFormData.text || ''} 
          onChange={e => set('text', e.target.value)} 
          placeholder="Ej: Reservar cita..." 
        />
      </div>

      <SmartLinkField
        label="URL de Destino"
        value={editFormData.url || ''}
        onChange={val => set('url', val)}
        onSelectSuggestedText={txt => {
          if (!editFormData.text) {
            set('text', txt);
          }
        }}
        categories={dbCategories}
        services={dbServices}
      />

      {/* Estilo y Paleta de Colores */}
      <div>
        <label className={labelClass}>Estilo del Botón</label>
        <div className="grid grid-cols-3 gap-2 select-none mb-3">
          {[
            { value: 'primary_solid', label: 'Color Marca' },
            { value: 'primary_outline', label: 'Borde Marca' },
            { value: 'dark_solid', label: 'Antracita' },
          ].map(opt => {
            const currentStyle = editFormData.style === 'gold_solid' ? 'primary_solid' : editFormData.style === 'gold_outline' ? 'primary_outline' : editFormData.style;
            const isSel = (currentStyle || 'primary_solid') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  set('style', opt.value);
                  set('custom_bg', '');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  isSel
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Color Personalizado Opcional con Paleta Cromática */}
        <ColorPalettePicker
          label="O Personalizar Color de Fondo"
          value={editFormData.custom_bg || ''}
          onChange={val => {
            set('custom_bg', val);
            set('style', 'custom');
          }}
          presets={[
            { value: 'primary', label: 'Marca', style: { background: 'var(--primary, #d4af37)' } },
            { value: '#1c1917', label: 'Oscuro', colorClass: 'bg-stone-900' },
            { value: '#059669', label: 'Verde', colorClass: 'bg-emerald-600' },
          ]}
        />
      </div>

      <div>
        <label className={labelClass}>Alineación</label>
        <div className="grid grid-cols-3 gap-2 select-none">
          {[
            { value: 'left', label: 'Izquierda' },
            { value: 'center', label: 'Centro' },
            { value: 'right', label: 'Derecha' }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('alignment', opt.value)}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                (editFormData.alignment || 'center') === opt.value
                  ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
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
