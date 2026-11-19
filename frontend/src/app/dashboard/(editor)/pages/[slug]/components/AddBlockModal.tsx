"use client";
import React, { useState } from 'react';
import { BLOCK_DEFINITIONS, type BlockDefinition } from '../utils/blockRegistry';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (blockType: string) => void;
  adding: boolean;
}

export default function AddBlockModal({ isOpen, onClose, onAddBlock, adding }: AddBlockModalProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');

  if (!isOpen) return null;

  const categories = [
    { id: 'todos', label: 'Todos' },
    { id: 'contenido', label: 'Contenido' },
    { id: 'estructura', label: 'Estructura' },
    { id: 'medios', label: 'Multimedia' },
    { id: 'interactivo', label: 'Interactivo' },
  ];

  const filteredBlocks = selectedCategory === 'todos'
    ? BLOCK_DEFINITIONS
    : BLOCK_DEFINITIONS.filter(b => b.category === selectedCategory);

  return (
    <div className="fixed inset-0 bg-stone-950/50 backdrop-blur-md z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.18)] w-full max-w-3xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[85vh] overflow-hidden border border-stone-200/80">
        
        {/* Header con estilo Quiet Luxury */}
        <div className="px-8 pt-7 pb-5 border-b border-stone-150 flex items-start justify-between shrink-0 bg-white">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
              Librería de Componentes
            </span>
            <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
              Añadir Bloque a la Columna
            </h2>
            <p className="text-stone-400 text-xs mt-1 font-sans">
              Selecciona el elemento que deseas integrar en el diseño de esta sección.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 flex items-center justify-center text-sm font-bold transition-all shadow-2xs"
            title="Cerrar modal"
          >
            ✕
          </button>
        </div>

        {/* Filtros de Categoría */}
        <div className="px-8 py-3 bg-stone-50/70 border-b border-stone-150 flex items-center gap-1.5 overflow-x-auto shrink-0">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
          <span className="ml-auto text-[11px] font-bold text-stone-400">
            {filteredBlocks.length} disponibles
          </span>
        </div>

        {/* Rejilla de Bloques (3 columnas en desktop, 2 en tablet) */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {filteredBlocks.map((block: BlockDefinition) => (
              <button
                key={block.id}
                onClick={() => {
                  onAddBlock(block.id);
                  onClose();
                }}
                disabled={adding}
                className="p-4 rounded-2xl border border-stone-200/80 bg-white hover:border-[#d4af37]/60 hover:bg-amber-50/15 hover:shadow-md transition-all duration-300 text-left group flex flex-col justify-between gap-3 disabled:opacity-50 relative overflow-hidden"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-600 group-hover:bg-white group-hover:border-[#d4af37]/50 group-hover:text-[#d4af37] flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0 shadow-2xs">
                    {block.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[11px] font-bold text-stone-800 group-hover:text-stone-950 uppercase tracking-wider block leading-tight truncate">
                      {block.label}
                    </span>
                    <span className="text-[10px] font-mono text-[#d4af37] uppercase tracking-wider block mt-0.5">
                      {block.category}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-stone-500 font-sans leading-relaxed line-clamp-2">
                  {block.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-stone-150 flex items-center justify-end bg-stone-50/50 shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}
