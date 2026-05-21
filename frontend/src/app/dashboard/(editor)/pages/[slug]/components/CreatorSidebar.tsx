"use client";
import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import Link from 'next/link';

// ── Íconos SVG para cada tipo de bloque ──────────────────────────────
const ICONS: Record<string, React.ReactNode> = {
  hero: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 3h18M3 12h18M3 8.25h18" />
    </svg>
  ),
  title_heading: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
    </svg>
  ),
  atomic_text: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>
  ),
  atomic_image: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  text_image_cta: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15M3.75 9h16.5M3.75 15h16.5" />
    </svg>
  ),
  atomic_button: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  atomic_category: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
};

const BLOCKS = [
  { id: 'hero',            label: 'Hero',            desc: 'Imagen a pantalla completa con título y CTA.' },
  { id: 'title_heading',   label: 'Título Elegante', desc: 'Tipografía serif con divisor dorado.' },
  { id: 'atomic_text',     label: 'Párrafo de Texto', desc: 'Editor HTML enriquecido.' },
  { id: 'atomic_image',    label: 'Imagen o Vídeo',  desc: 'Multimedia desde la galería.' },
  { id: 'text_image_cta',  label: 'Imagen + Texto',  desc: 'Columnas editorial con CTA.' },
  { id: 'atomic_button',   label: 'Botón CTA',       desc: 'Dorado, oscuro u outline.' },
  { id: 'atomic_category', label: 'Bento Catálogo',  desc: 'Grid de tratamientos.' },
];

// ── Item arrastrable individual ───────────────────────────────────────
function DraggableItem({ id, label, desc }: { id: string; label: string; desc: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${id}`,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-start gap-3 py-3 px-3 rounded-xl cursor-grab active:cursor-grabbing select-none
        transition-all duration-200 group hover:bg-stone-50 border border-transparent hover:border-stone-100
        ${isDragging ? 'opacity-40 bg-stone-50 border-stone-100' : ''}`}
    >
      <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-400
        group-hover:bg-white group-hover:text-[#d4af37] group-hover:shadow-sm border border-transparent
        group-hover:border-stone-100 transition-all shrink-0 mt-0.5">
        {ICONS[id]}
      </div>
      <div className="min-w-0">
        <span className="text-[11px] font-black text-stone-700 uppercase tracking-wider block leading-none">
          {label}
        </span>
        <span className="text-[10px] text-stone-400 font-sans mt-1 block leading-relaxed">
          {desc}
        </span>
      </div>
    </div>
  );
}

// ── Sidebar principal ─────────────────────────────────────────────────
interface CreatorSidebarProps {
  pageTitle: string;
  slug: string;
  saving: boolean;
  onSave: () => void;
  onAddSection: () => void;
}

export default function CreatorSidebar({
  pageTitle,
  slug,
  saving,
  onSave,
  onAddSection,
}: CreatorSidebarProps) {
  return (
    <aside className="w-[450px] shrink-0 h-full flex flex-col bg-white border-r border-stone-150 shadow-sm z-30">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-5 border-b border-stone-100">
        {/* Volver */}
        <Link
          href="/dashboard/pages"
          className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors mb-5"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver a Páginas
        </Link>

        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1.5">
          Diseñador Web
        </span>
        <h2 className="font-serif text-xl font-bold text-stone-800 leading-snug truncate" title={pageTitle}>
          {pageTitle || slug}
        </h2>

        {/* Botonera de Control */}
        <div className="flex gap-2.5 mt-4">
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-stone-900 hover:bg-[#d4af37] disabled:opacity-60 text-white text-xs font-black uppercase tracking-widest py-3 px-4 rounded-xl transition-all duration-300 shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Guardando</span>
              </>
            ) : (
              <span>Guardar</span>
            )}
          </button>

          <button
            onClick={() => window.open(`/${slug}`, '_blank')}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold rounded-xl transition-all duration-300 active:scale-95 shadow-sm"
            title="Vista Previa Pública"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Ver Web</span>
          </button>
        </div>
      </div>

      {/* ── Librería de Bloques ──────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-2 px-1">
            Biblioteca de Bloques
          </span>
          <p className="text-xs text-stone-400 font-sans px-1 leading-relaxed">
            Arrastra cualquiera de estos elementos estructurales al lienzo de la derecha para dar vida a la página.
          </p>
        </div>

        <div className="space-y-1.5">
          {BLOCKS.map(b => (
            <DraggableItem key={b.id} id={b.id} label={b.label} desc={b.desc} />
          ))}
        </div>
      </div>

      {/* ── Footer: Añadir sección ───────────────────────────────── */}
      <div className="p-4 border-t border-stone-100 bg-stone-50/50">
        <button
          onClick={onAddSection}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-stone-300 bg-white
            hover:border-[#d4af37]/60 hover:bg-amber-50/5 text-xs font-bold text-stone-500 hover:text-[#d4af37]
            transition-all duration-300 shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Sección Estructural
        </button>
      </div>
    </aside>
  );
}
