import React from 'react';
import { AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { RichTextEditor } from '../RichTextEditor';

interface TextFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
  blockId: string;
}

const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function TextFields({ editFormData, set, blockId }: TextFieldsProps) {
  return (
    <>
      <div>
        <label className={labelClass}>Contenido del Párrafo (Editor Enriquecido)</label>
        <RichTextEditor
          value={editFormData.html || ''}
          onChange={val => set('html', val)}
          blockId={blockId}
        />
      </div>
      <div>
        <label className={labelClass}>Alineación del Texto</label>
        <div className="grid grid-cols-4 gap-2 select-none">
          {[
            { value: 'left', icon: AlignLeft, label: 'Izquierda' },
            { value: 'center', icon: AlignCenter, label: 'Centro' },
            { value: 'right', icon: AlignRight, label: 'Derecha' },
            { value: 'justify', icon: AlignJustify, label: 'Justificado' }
          ].map(opt => {
            const Icon = opt.icon;
            const isSel = (editFormData.alignment || 'left') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('alignment', opt.value)}
                className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  isSel
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon size={13} className={isSel ? 'text-[#d4af37]' : 'text-stone-400'} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
