"use client";
import React from 'react';

const BLOCK_TYPES = [
  { id: 'hero',            label: 'Hero',             desc: 'Imagen a pantalla completa con título y CTA', icon: '🖼️' },
  { id: 'title_heading',   label: 'Título Elegante',  desc: 'Tipografía serif con divisor dorado',         icon: '📰' },
  { id: 'atomic_text',     label: 'Párrafo de Texto', desc: 'Editor de texto HTML enriquecido',            icon: '📝' },
  { id: 'atomic_image',    label: 'Imagen o Vídeo',   desc: 'Multimedia compatible con galería',           icon: '🖼️' },
  { id: 'text_image_cta',  label: 'Imagen + Texto',   desc: 'Bloque editorial con botón de acción',        icon: '🗂️' },
  { id: 'atomic_button',   label: 'Botón CTA',        desc: 'Llamada a la acción personalizable',          icon: '🔘' },
  { id: 'atomic_category', label: 'Bento Catálogo',   desc: 'Grid de tratamientos con tarjetas',           icon: '⚙️' },
];

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (blockType: string) => void;
  adding: boolean;
}

export default function AddBlockModal({ isOpen, onClose, onAddBlock, adding }: AddBlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-in zoom-in-95 duration-300">
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
            Librería de Bloques
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-800">Añadir bloque</h2>
          <p className="text-stone-400 text-xs mt-1">Selecciona el tipo de bloque que quieres insertar en esta columna.</p>
        </div>

        <div className="grid grid-cols-1 gap-2 max-h-80 overflow-y-auto">
          {BLOCK_TYPES.map((block) => (
            <button
              key={block.id}
              onClick={() => { onAddBlock(block.id); onClose(); }}
              disabled={adding}
              className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 hover:border-[#d4af37]/30 hover:bg-amber-50/30 transition-all duration-200 text-left group disabled:opacity-50"
            >
              <span className="text-2xl">{block.icon}</span>
              <div>
                <span className="font-bold text-sm text-stone-800 block group-hover:text-stone-900">{block.label}</span>
                <span className="text-xs text-stone-400">{block.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full py-3 rounded-2xl border border-stone-200 text-stone-500 hover:bg-stone-50 text-sm font-bold transition-all duration-200"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
