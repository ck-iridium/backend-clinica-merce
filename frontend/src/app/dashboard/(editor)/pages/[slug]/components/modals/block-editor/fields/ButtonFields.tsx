import React from 'react';

interface ButtonFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function ButtonFields({ editFormData, set }: ButtonFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClass}>Texto del botón</label>
        <input 
          className={inputClass} 
          value={editFormData.text || ''} 
          onChange={e => set('text', e.target.value)} 
          placeholder="Reservar cita..." 
        />
      </div>
      <div>
        <label className={labelClass}>URL de destino</label>
        <input 
          className={inputClass} 
          value={editFormData.url || ''} 
          onChange={e => set('url', e.target.value)} 
          placeholder="/reservar" 
        />
      </div>
      <div>
        <label className={labelClass}>Estilo del botón</label>
        <div className="grid grid-cols-3 gap-2 select-none">
          {[
            { value: 'gold_solid', label: 'Dorado Sólido' },
            { value: 'gold_outline', label: 'Dorado Outline' },
            { value: 'dark_solid', label: 'Antracita' }
          ].map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => set('style', opt.value)}
              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                (editFormData.style || 'gold_solid') === opt.value
                  ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
                  ? 'bg-stone-900 border-stone-900 text-white shadow-sm'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
