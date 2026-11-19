import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { AtomicBlock, ColumnStructure } from '../../types';
import { SortableCanvasBlock } from './SortableCanvasBlock';

interface CanvasColumnProps {
  col: ColumnStructure;
  sectionId: string;
  columnsCount: number;
  onEdit: (block: any) => void;
  onDelete: (blockId: string, sectionId: string, columnId: string) => void;
  onClone: (blockId: string, sectionId: string, columnId: string) => void;
  onOpenAI: (block: any, sectionId: string, columnId: string) => void;
  onAddBlock: (sectionId: string, columnId: string) => void;
  dbCategories: any[];
  dbServices: any[];
  isBoxed?: boolean;
  sectionVerticalAlign?: string;
}

export function CanvasColumn({
  col,
  sectionId,
  columnsCount,
  onEdit,
  onDelete,
  onClone,
  onOpenAI,
  onAddBlock,
  dbCategories,
  dbServices,
  isBoxed = false,
  sectionVerticalAlign,
}: CanvasColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const blocks: AtomicBlock[] = col.blocks || [];

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-0 min-h-[80px] relative transition-all duration-200 group/col ${
        isOver ? 'ring-2 ring-[#d4af37]/50 ring-inset rounded-sm bg-amber-50/10' : ''
      }`}
    >
      <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
        {blocks.map(block => (
          <SortableCanvasBlock
            key={block.id}
            block={block}
            sectionId={sectionId}
            columnId={col.id}
            onEdit={onEdit}
            onDelete={onDelete}
            onClone={onClone}
            onOpenAI={onOpenAI}
            dbCategories={dbCategories}
            dbServices={dbServices}
            isBoxed={isBoxed}
            sectionVerticalAlign={sectionVerticalAlign}
          />
        ))}
      </SortableContext>

      {/* Botón flotante para añadir bloque al final de una columna con contenido (oculto en Hero para mantener estética limpia) */}
      {blocks.length > 0 && !blocks.some(b => b.block_type === 'hero') && (
        <div className="flex justify-center py-2 opacity-0 group-hover/col:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onAddBlock(sectionId, col.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#d4af37]/50 text-stone-500 hover:text-[#d4af37] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-xs"
            title="Añadir bloque a esta columna"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Añadir bloque</span>
          </button>
        </div>
      )}

      {/* Drop-zone hint cuando vacío */}
      {blocks.length === 0 && (
        <button
          onClick={() => onAddBlock(sectionId, col.id)}
          className={`w-full h-full min-h-[160px] flex flex-col items-center justify-center gap-2 border border-dashed rounded-[2rem]
            transition-all duration-300 cursor-pointer group/drop p-6 text-center select-none
            ${isOver
              ? 'border-[#d4af37] bg-amber-50/10'
              : 'border-stone-200 hover:border-[#d4af37]/40 bg-transparent hover:bg-stone-50'
            }`}
        >
          <div className="w-8 h-8 rounded-full bg-stone-50 group-hover/drop:bg-amber-50 flex items-center justify-center transition-all border border-stone-100">
            <svg className="w-4 h-4 text-stone-400 group-hover/drop:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="text-[11px] font-black text-stone-600 group-hover/drop:text-stone-800 uppercase tracking-widest transition-colors block">
            {isOver ? 'Soltar aquí' : 'Añadir bloque'}
          </span>
          <span className="text-[9px] text-stone-400 font-sans block mt-0.5 leading-snug">
            Arrastra desde el panel lateral o haz clic
          </span>
        </button>
      )}
    </div>
  );
}
