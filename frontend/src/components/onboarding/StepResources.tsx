"use client"

import React, { useState } from 'react';
import { DoorOpen, Plus, Trash2, Sparkles, Layers } from 'lucide-react';

export interface ResourceItem {
  name: string;
  quantity: number;
  locationIndex: number;
}

interface StepResourcesProps {
  resources: ResourceItem[];
  setResources: React.Dispatch<React.SetStateAction<ResourceItem[]>>;
  locationNames: string[];
}

export const StepResources: React.FC<StepResourcesProps> = ({
  resources,
  setResources,
  locationNames
}) => {
  const [resourceName, setResourceName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedLocIndex, setSelectedLocIndex] = useState(0);

  const handleAdd = () => {
    if (!resourceName.trim()) return;
    setResources(prev => [
      ...prev,
      {
        name: resourceName.trim(),
        quantity: Math.max(1, quantity),
        locationIndex: selectedLocIndex
      }
    ]);
    setResourceName('');
    setQuantity(1);
  };

  const handleRemove = (index: number) => {
    setResources(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 font-sans">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] block">
          Paso Opcional · Control de Concurrencia
        </span>
        <h3 className="font-serif text-lg text-stone-900 font-bold">
          Cabinas y Recursos Físicos
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          Si dispones de cabinas de estética, salas médicas o aparatología exclusiva (ej. Láser Sapphire, Sillón 1), regístralas aquí. ProBookia garantizará que nunca se solapen dos citas simultáneas en el mismo recurso.
        </p>
      </div>

      {/* Formulario de adición */}
      <div className="bg-[#FAF9F5]/80 border border-stone-200/80 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Nombre de Cabina / Máquina
            </label>
            <input
              type="text"
              value={resourceName}
              onChange={(e) => setResourceName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAdd())}
              placeholder="Ej. Cabina Láser 1, Sillón Dental A..."
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-xs font-semibold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
            />
          </div>

          <div className="sm:col-span-3 space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
              Unidades
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
            />
          </div>

          {locationNames.length > 1 && (
            <div className="sm:col-span-3 space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
                Sede
              </label>
              <select
                value={selectedLocIndex}
                onChange={(e) => setSelectedLocIndex(parseInt(e.target.value))}
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-3 text-xs font-semibold text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37] focus:border-[#d4af37] transition-all"
              >
                {locationNames.map((name, idx) => (
                  <option key={idx} value={idx}>{name || `Sede ${idx + 1}`}</option>
                ))}
              </select>
            </div>
          )}

          <div className={`${locationNames.length > 1 ? 'sm:col-span-12' : 'sm:col-span-3'} flex items-end`}>
            <button
              type="button"
              onClick={handleAdd}
              disabled={!resourceName.trim()}
              className="w-full bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white font-bold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none active:scale-95 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Añadir
            </button>
          </div>
        </div>
      </div>

      {/* Lista de recursos añadidos */}
      <div className="space-y-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
          Recursos Registrados ({resources.length})
        </label>
        {resources.length === 0 ? (
          <div className="border border-dashed border-stone-200 rounded-2xl p-6 text-center bg-stone-50/50">
            <Layers className="w-8 h-8 mx-auto text-stone-300 mb-2" />
            <p className="text-xs text-stone-500 font-medium">
              No has añadido recursos físicos todavía.
            </p>
            <p className="text-[11px] text-stone-400 mt-1">
              Si tus servicios no requieren salas o aparatología limitada, pulsa <strong>Siguiente</strong> para continuar.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {resources.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3.5 bg-white border border-stone-200/80 rounded-2xl shadow-sm hover:border-[#d4af37]/40 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#d4af37] flex items-center justify-center shrink-0">
                    <DoorOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900">{item.name}</h4>
                    <p className="text-[10px] text-stone-400">
                      {item.quantity} {item.quantity === 1 ? 'unidad' : 'unidades'}
                      {locationNames.length > 1 && ` · ${locationNames[item.locationIndex] || 'Sede Principal'}`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="p-1.5 text-stone-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
        <p className="text-[11px] text-stone-500 leading-relaxed">
          <strong>Tip de Configuración:</strong> Siempre podrás crear más recursos físicos o asociarlos a tratamientos concretos desde <em>Ajustes &gt; Sedes &gt; Cabinas</em> una vez dentro del panel.
        </p>
      </div>
    </div>
  );
};

