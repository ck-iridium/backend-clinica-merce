"use client";
import React, { useState, useEffect } from 'react';
import { useDraggable } from '@dnd-kit/core';
import Link from 'next/link';
import { getTenantPublicUrl } from '@/utils/tenantUrl';
import { BLOCK_DEFINITIONS, type BlockDefinition } from '../utils/blockRegistry';

// ── Item arrastrable en tarjeta cuadrada moderna ─────────────────────
function DraggableItem({ block }: { block: BlockDefinition }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${block.id}`,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3.5 rounded-2xl border bg-white cursor-grab active:cursor-grabbing select-none
        transition-all duration-300 group flex flex-col items-center text-center justify-center gap-2
        hover:border-[#d4af37]/60 hover:shadow-md relative overflow-hidden
        ${
          isDragging
            ? 'opacity-30 scale-95 border-[#d4af37] bg-amber-50/30'
            : 'border-stone-200/80 hover:bg-white'
        }`}
      title={block.desc}
    >
      <div
        className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/80 text-stone-500
        group-hover:bg-amber-50/60 group-hover:border-[#d4af37]/40 group-hover:text-[#d4af37]
        flex items-center justify-center transition-all duration-300 group-hover:scale-110 shrink-0 shadow-2xs"
      >
        {block.icon}
      </div>
      <div className="w-full min-w-0">
        <span className="text-[11px] font-bold text-stone-800 group-hover:text-stone-950 uppercase tracking-wider block leading-tight truncate">
          {block.label}
        </span>
        <span className="text-[9.5px] text-stone-400 font-sans line-clamp-1 mt-0.5 leading-tight">
          {block.desc}
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
  lastSavedAt?: string | null;
  hasUnsavedChanges?: boolean;
  canUndo?: boolean;
  onUndo?: () => void;
  onSave: () => void;
  onAddSection: () => void;
}

export default function CreatorSidebar({
  pageTitle,
  slug,
  saving,
  lastSavedAt,
  hasUnsavedChanges,
  canUndo = false,
  onUndo,
  onSave,
  onAddSection,
}: CreatorSidebarProps) {
  const [isEmbedded, setIsEmbedded] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const embeddedByQuery = window.location.search.includes('embedded=true');
      const embeddedByIframe = window.self !== window.top;
      setIsEmbedded(embeddedByQuery || embeddedByIframe);
    }
  }, []);

  return (
    <aside className="w-[380px] shrink-0 h-full flex flex-col bg-stone-50/50 border-r border-stone-200 shadow-xs z-30">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="px-5 pt-5 pb-4 bg-white border-b border-stone-150">
        {/* Volver - Oculto si está incrustado en el AI Webmaster */}
        {!isEmbedded && (
          <Link
            href="/dashboard/pages"
            className="flex items-center gap-2 text-xs font-bold text-stone-400 hover:text-stone-600 transition-colors mb-4"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Volver a Páginas
          </Link>
        )}

        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
          Diseñador Web
        </span>
        <h2 className="font-serif text-lg font-bold text-stone-900 leading-snug truncate" title={pageTitle}>
          {pageTitle || slug}
        </h2>

        {/* Botonera de Control */}
        <div className="flex gap-2 mt-3.5">
          {onUndo && (
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`flex items-center justify-center gap-1.5 px-3 py-2.5 border rounded-xl text-xs font-bold transition-all duration-300 shadow-xs ${
                canUndo
                  ? 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700 hover:text-stone-900 active:scale-95'
                  : 'bg-stone-50 border-stone-200/50 text-stone-300 cursor-not-allowed opacity-50'
              }`}
              title="Deshacer última acción (Ctrl + Z)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
            </button>
          )}

          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-stone-900 hover:bg-[#d4af37] disabled:opacity-60 text-white text-xs font-black uppercase tracking-widest py-2.5 px-3 rounded-xl transition-all duration-300 shadow-sm active:scale-95 flex items-center justify-center gap-1.5"
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
            onClick={() => window.open(getTenantPublicUrl(`/${slug}`), '_blank')}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-stone-100 hover:bg-stone-200 border border-stone-200 text-stone-700 hover:text-stone-900 text-xs font-bold rounded-xl transition-all duration-300 active:scale-95 shadow-xs"
            title="Vista Previa Pública en el subdominio del inquilino"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.43 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Ver Web</span>
          </button>
        </div>

        {/* Indicador de Estado y Autoguardado */}
        <div className="mt-2.5 flex items-center justify-between text-[10px] px-0.5 font-medium text-stone-400">
          {saving ? (
            <span className="text-amber-600 flex items-center gap-1 font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
              Sincronizando...
            </span>
          ) : hasUnsavedChanges ? (
            <span className="text-stone-500 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
              Cambios pendientes
            </span>
          ) : lastSavedAt ? (
            <span className="text-emerald-700 flex items-center gap-1 font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              Guardado {lastSavedAt}
            </span>
          ) : (
            <span className="text-stone-400">Protegido</span>
          )}
          <span className="text-stone-300">Ctrl+Z</span>
        </div>
      </div>

      {/* ── Librería de Bloques en Grid 2 por Fila ───────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        <div>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 block mb-1">
            Biblioteca de Bloques
          </span>
          <p className="text-[11px] text-stone-400 font-sans leading-relaxed">
            Arrastra cualquier bloque al lienzo para añadirlo a tu sección.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {BLOCK_DEFINITIONS.map(block => (
            <DraggableItem key={block.id} block={block} />
          ))}
        </div>
      </div>

      {/* ── Footer: Añadir sección ───────────────────────────────── */}
      <div className="p-3.5 border-t border-stone-200 bg-white">
        <button
          onClick={onAddSection}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-stone-300 bg-stone-50/50
            hover:border-[#d4af37]/60 hover:bg-amber-50/10 text-xs font-bold text-stone-600 hover:text-[#d4af37]
            transition-all duration-300 shadow-2xs"
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
