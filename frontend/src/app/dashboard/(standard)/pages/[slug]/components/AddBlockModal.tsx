"use client";
import React from 'react';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBlock: (type: 'title_heading' | 'text_image_cta' | 'atomic_image' | 'atomic_category') => void;
  adding: boolean;
}

export default function AddBlockModal({ isOpen, onClose, onAddBlock, adding }: AddBlockModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 animate-in zoom-in-95 duration-300">
        
        <div className="mb-8">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
            Librería de Componentes
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-800">
            Añadir bloque a la página
          </h2>
          <p className="text-stone-400 text-xs mt-1">
            Selecciona una de las estructuras modulares para inyectar en tu página.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Opción 1: Title Heading */}
          <button
            onClick={() => onAddBlock('title_heading')}
            disabled={adding}
            className="border border-stone-200 hover:border-amber-200 bg-white hover:bg-stone-50/50 p-5 rounded-3xl text-left transition-all duration-300 group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#d4af37] mb-3 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-stone-800 mb-1 group-hover:text-[#d4af37] transition-colors">
              Encabezado Serif
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed font-sans">
              Título elegante en Playfair Display con una línea dorada decorativa y subtítulo.
            </p>
          </button>

          {/* Opción 2: Text Image CTA */}
          <button
            onClick={() => onAddBlock('text_image_cta')}
            disabled={adding}
            className="border border-stone-200 hover:border-blue-200 bg-white hover:bg-stone-50/50 p-5 rounded-3xl text-left transition-all duration-300 group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-stone-800 mb-1 group-hover:text-blue-500 transition-colors">
              Texto + Imagen + CTA
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed font-sans">
              Contenedor asimétrico de dos columnas con título, descripción, imagen y botón de llamada a la acción.
            </p>
          </button>

          {/* Opción 3: Atomic Image */}
          <button
            onClick={() => onAddBlock('atomic_image')}
            disabled={adding}
            className="border border-stone-200 hover:border-emerald-200 bg-white hover:bg-stone-50/50 p-5 rounded-3xl text-left transition-all duration-300 group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-3 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-stone-800 mb-1 group-hover:text-emerald-500 transition-colors">
              Imagen / Vídeo Único
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed font-sans">
              Bloque para inyectar una imagen o un loop de vídeo con pie de foto y anchos personalizables.
            </p>
          </button>

          {/* Opción 4: Atomic Category */}
          <button
            onClick={() => onAddBlock('atomic_category')}
            disabled={adding}
            className="border border-stone-200 hover:border-purple-200 bg-white hover:bg-stone-50/50 p-5 rounded-3xl text-left transition-all duration-300 group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 mb-3 group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.16 3.659A1.5 1.5 0 009.568 3z" />
              </svg>
            </div>
            <h4 className="font-bold text-sm text-stone-800 mb-1 group-hover:text-purple-500 transition-colors">
              Bloque de Tratamientos
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed font-sans">
              Elige una categoría y selecciona qué tratamientos renderizar dinámicamente con estilo Bento.
            </p>
          </button>
        </div>

        <div className="flex">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3.5 rounded-2xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
          >
            Cerrar Galería
          </button>
        </div>
      </div>
    </div>
  );
}
