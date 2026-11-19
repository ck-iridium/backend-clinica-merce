import React from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';

interface TitleFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function TitleFields({ editFormData, set }: TitleFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClass}>Texto del Título</label>
        <input 
          className={`${inputClass} font-serif text-base font-bold text-stone-900`} 
          value={editFormData.title || ''} 
          onChange={e => set('title', e.target.value)} 
          placeholder="Título de la sección..." 
        />
      </div>
      <div>
        <label className={labelClass}>Subtítulo (opcional)</label>
        <input 
          className={inputClass} 
          value={editFormData.subtitle || ''} 
          onChange={e => set('subtitle', e.target.value)} 
          placeholder="Texto complementario o descripción breve..." 
        />
      </div>

      {/* Familia Tipográfica Preestablecida */}
      <div>
        <label className={labelClass}>Tipografía</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 select-none">
          {[
            { value: 'playfair', label: 'Playfair Display', note: 'Serif Clásica' },
            { value: 'inter', label: 'Inter Moderno', note: 'Sans Nítida' },
            { value: 'cormorant', label: 'Cormorant', note: 'Cursiva Lujo' },
            { value: 'cinzel', label: 'Cinzel', note: 'Romana Monumental' },
            { value: 'montserrat', label: 'Montserrat', note: 'Geométrica' }
          ].map(font => {
            const isSel = (editFormData.font_family || 'playfair') === font.value;
            return (
              <button
                key={font.value}
                type="button"
                onClick={() => set('font_family', font.value)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSel
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <span className="block text-xs font-bold leading-tight truncate">{font.label}</span>
                <span className={`block text-[9px] mt-0.5 ${isSel ? 'text-[#d4af37]' : 'text-stone-400'}`}>{font.note}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grosor y Tamaño */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Grosor de Fuente</label>
          <div className="grid grid-cols-3 gap-1 select-none">
            {[
              { value: 'normal', label: 'Normal' },
              { value: 'semibold', label: 'Semibold' },
              { value: 'extrabold', label: 'Black' }
            ].map(w => {
              const isSel = (editFormData.font_weight || 'extrabold') === w.value;
              return (
                <button
                  key={w.value}
                  type="button"
                  onClick={() => set('font_weight', w.value)}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {w.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelClass}>Tamaño</label>
          <div className="grid grid-cols-3 gap-1 select-none">
            {[
              { value: 'small', label: 'M (24px)' },
              { value: 'medium', label: 'L (36px)' },
              { value: 'xlarge', label: 'XL (54px)' }
            ].map(s => {
              const isSel = (editFormData.font_size || 'medium') === s.value;
              return (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set('font_size', s.value)}
                  className={`py-2 px-1.5 rounded-xl text-[11px] font-bold border transition-all text-center ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tag HTML y Alineación */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Jerarquía HTML (Tag)</label>
          <div className="grid grid-cols-4 gap-1 select-none">
            {['h1', 'h2', 'h3', 'h4'].map(tag => {
              const isSel = (editFormData.title_tag || 'h2') === tag;
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => set('title_tag', tag)}
                  className={`py-2 rounded-xl text-xs font-black uppercase border transition-all text-center ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelClass}>Alineación</label>
          <div className="grid grid-cols-3 gap-1 select-none">
            {[
              { value: 'left', icon: AlignLeft, label: 'Izq' },
              { value: 'center', icon: AlignCenter, label: 'Centro' },
              { value: 'right', icon: AlignRight, label: 'Dcha' }
            ].map(al => {
              const Icon = al.icon;
              const isSel = (editFormData.alignment || 'center') === al.value;
              return (
                <button
                  key={al.value}
                  type="button"
                  onClick={() => set('alignment', al.value)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <Icon size={12} className={isSel ? 'text-[#d4af37]' : 'text-stone-400'} />
                  <span>{al.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Color y Transformación */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Color del Texto</label>
          <div className="grid grid-cols-3 gap-1 select-none">
            {[
              { value: 'stone-900', label: 'Antracita', colorDot: 'bg-stone-900' },
              { value: 'gold', label: 'Dorado', colorDot: 'bg-[#d4af37]' },
              { value: 'white', label: 'Blanco', colorDot: 'bg-white border border-stone-300' }
            ].map(c => {
              const isSel = (editFormData.text_color || 'stone-900') === c.value;
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => set('text_color', c.value)}
                  className={`py-2 px-1 rounded-xl text-[10px] font-bold border transition-all flex items-center justify-center gap-1.5 ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${c.colorDot}`} />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelClass}>Estilo de Mayúsculas</label>
          <div className="grid grid-cols-3 gap-1 select-none">
            {[
              { value: 'none', label: 'Normal' },
              { value: 'uppercase', label: 'MAYÚSC.' },
              { value: 'italic', label: 'Cursiva' }
            ].map(t => {
              const isSel = (editFormData.text_transform || 'none') === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('text_transform', t.value)}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition-all text-center ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <input 
          type="checkbox" 
          id="show_divider" 
          checked={editFormData.show_divider !== false} 
          onChange={e => set('show_divider', e.target.checked)} 
          className="w-4 h-4 accent-[#d4af37] rounded cursor-pointer" 
        />
        <label htmlFor="show_divider" className="text-xs font-semibold text-stone-600 cursor-pointer select-none">
          Mostrar acento de línea divisoria dorada
        </label>
      </div>
    </>
  );
}
