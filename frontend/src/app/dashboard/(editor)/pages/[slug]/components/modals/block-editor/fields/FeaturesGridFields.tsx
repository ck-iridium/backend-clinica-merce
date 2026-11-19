import React from 'react';

interface FeaturesGridFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
}

export function FeaturesGridFields({ editFormData, set }: FeaturesGridFieldsProps) {
  const items = Array.isArray(editFormData.items) ? editFormData.items : [];

  const updateItem = (index: number, field: string, val: string) => {
    const next = [...items];
    next[index] = { ...next[index], [field]: val };
    set('items', next);
  };

  const addItem = () => {
    set('items', [...items, { title: 'Nuevo Pilar', description: 'Descripción del beneficio o ventaja.' }]);
  };

  const removeItem = (index: number) => {
    set('items', items.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
          Título de la Sección
        </label>
        <input
          type="text"
          value={editFormData.heading || ''}
          onChange={e => set('heading', e.target.value)}
          placeholder="Ej. Pilares de Excelencia"
          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
        />
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
          Subtítulo
        </label>
        <input
          type="text"
          value={editFormData.subheading || ''}
          onChange={e => set('subheading', e.target.value)}
          placeholder="Ej. Compromiso con el rigor médico y el confort exclusivo"
          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
        />
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-2">
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block">
            Tarjetas de Beneficio ({items.length})
          </label>
          <button
            type="button"
            onClick={addItem}
            className="text-[10px] font-bold text-[#d4af37] hover:underline"
          >
            + Añadir Tarjeta
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 space-y-2 relative">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-stone-400">
                  Tarjeta {idx + 1}
                </span>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(idx)}
                    className="text-stone-400 hover:text-red-500 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </div>
              <input
                type="text"
                value={item.title || ''}
                onChange={e => updateItem(idx, 'title', e.target.value)}
                placeholder="Título del beneficio"
                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
              <textarea
                rows={2}
                value={item.description || ''}
                onChange={e => updateItem(idx, 'description', e.target.value)}
                placeholder="Descripción del beneficio..."
                className="w-full px-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
