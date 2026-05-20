"use client";
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import ColumnWrapper from './ColumnWrapper';

interface AtomicBlock {
  id: string;
  block_type: string;
  content_data: Record<string, any>;
}

interface ColumnStructure {
  id: string;
  width: string;
  blocks: AtomicBlock[];
}

interface SectionStructure {
  id: string;
  columns_count: number;
  py_spacing?: string;
  bg_color?: string;
  columns: ColumnStructure[];
}

interface SectionBlock {
  id: string;
  block_type: 'section';
  content_data: SectionStructure;
  order_index: number;
}

interface BlockListProps {
  sections: SectionBlock[];
  loading: boolean;
  onReorderSection: (index: number, direction: 'up' | 'down') => void;
  onDeleteSection: (sectionId: string) => void;
  onUpdateSectionLayout: (sectionId: string, columnsCount: number) => void;
  onEditBlock: (block: any, sectionId: string, columnId: string) => void;
  onDeleteBlock: (blockId: string, sectionId: string, columnId: string) => void;
  onOpenAddBlockModal: (sectionId: string, columnId: string) => void;
  dbCategories: any[];
  onAddNewSection: () => void;
}

export default function BlockList({
  sections,
  loading,
  onReorderSection,
  onDeleteSection,
  onUpdateSectionLayout,
  onEditBlock,
  onDeleteBlock,
  onOpenAddBlockModal,
  dbCategories,
  onAddNewSection,
}: BlockListProps) {

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2].map(i => <Skeleton key={i} className="h-48 w-full rounded-[2.5rem]" />)}
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-stone-200 rounded-[2.5rem] bg-white">
        <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center mb-6 border border-stone-100 text-stone-300">
          <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75zm1.5 1.5h13.5v13.5H5.25V5.25z" />
          </svg>
        </div>
        <h3 className="font-serif text-xl font-bold text-stone-700 mb-2">Lienzo vacío</h3>
        <p className="text-stone-400 text-xs max-w-sm mb-8 leading-relaxed">Comienza añadiendo una sección de columnas para estructurar tus contenidos.</p>
        <button
          onClick={onAddNewSection}
          className="bg-stone-900 hover:bg-[#d4af37] text-white px-7 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 shadow-md hover:scale-[1.02]"
        >
          + Añadir Sección
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {sections.map((section, index) => {
        const struct = section.content_data || { columns_count: 1, columns: [] };
        const columnsCount = struct.columns_count || 1;
        const columns = struct.columns || [];

        // Clases CSS Grid según el conteo de columnas
        let gridClass = 'grid-cols-1';
        if (columnsCount === 2) gridClass = 'grid-cols-1 md:grid-cols-2 gap-8';
        if (columnsCount === 3) gridClass = 'grid-cols-1 md:grid-cols-3 gap-6';
        if (columnsCount === 4) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4';

        return (
          <div
            key={section.id}
            className="bg-white rounded-[2rem] border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-8 hover:shadow-[0_12px_45px_rgba(0,0,0,0.04)] transition-all duration-300 relative group/section"
          >
            {/* Cabecera / Toolbar de Sección */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-stone-50 pb-4">
              <div className="flex items-center gap-3">
                {/* Reordenado de sección */}
                <div className="flex gap-0.5">
                  <button
                    onClick={() => onReorderSection(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 text-stone-400 hover:text-[#d4af37] disabled:opacity-20 hover:bg-stone-50 rounded-lg transition-all"
                    title="Subir sección"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onReorderSection(index, 'down')}
                    disabled={index === sections.length - 1}
                    className="p-1.5 text-stone-400 hover:text-[#d4af37] disabled:opacity-20 hover:bg-stone-50 rounded-lg transition-all"
                    title="Bajar sección"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>

                <div className="h-4 w-[1px] bg-stone-200" />

                <span className="text-xs font-black text-stone-400 uppercase tracking-widest">
                  Sección {index + 1}
                </span>
              </div>

              {/* Ajustes de columnas e eliminación */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 bg-stone-50 p-1 rounded-xl border border-stone-200/50">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider px-2">Columnas:</span>
                  {[1, 2, 3, 4].map((num) => (
                    <button
                      key={num}
                      onClick={() => onUpdateSectionLayout(section.id, num)}
                      className={`w-7 h-7 rounded-lg text-xs font-black transition-all ${
                        columnsCount === num
                          ? 'bg-stone-900 text-white shadow-sm'
                          : 'text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => onDeleteSection(section.id)}
                  className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-all"
                  title="Borrar sección entera"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Rejilla de Columnas */}
            <div className={`grid ${gridClass}`}>
              {columns.map((col: ColumnStructure) => (
                <div key={col.id} className="flex flex-col">
                  <ColumnWrapper
                    id={col.id}
                    width={col.width}
                    blocks={col.blocks || []}
                    onEdit={(block) => onEditBlock(block, section.id, col.id)}
                    onDelete={(blockId) => onDeleteBlock(blockId, section.id, col.id)}
                    dbCategories={dbCategories}
                  />
                  
                  {/* Botón Añadir Bloque en Columna */}
                  <button
                    onClick={() => onOpenAddBlockModal(section.id, col.id)}
                    className="mt-2 py-2 rounded-xl border border-dashed border-stone-200 hover:border-[#d4af37]/60 text-[10px] font-bold text-stone-400 hover:text-[#d4af37] bg-stone-50/20 hover:bg-stone-50/50 transition-all duration-300 flex items-center justify-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Añadir Bloque Atómico
                  </button>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Botón Añadir Sección Final */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onAddNewSection}
          className="flex items-center gap-2 bg-stone-900 hover:bg-[#d4af37] text-white px-8 py-4 rounded-2xl text-xs font-bold transition-all duration-300 shadow-md hover:scale-[1.02] active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva Sección Estructural
        </button>
      </div>
    </div>
  );
}
