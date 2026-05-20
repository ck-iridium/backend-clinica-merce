"use client";
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableBlockItem from './SortableBlockItem';

interface AtomicBlock {
  id: string;
  block_type: string;
  content_data: Record<string, any>;
}

interface ColumnWrapperProps {
  id: string; // ID único de la columna
  width: string;
  blocks: AtomicBlock[];
  onEdit: (block: any) => void;
  onDelete: (blockId: string, columnId: string) => void;
  dbCategories: any[];
  dbServices: any[];
}

export default function ColumnWrapper({
  id,
  width,
  blocks,
  onEdit,
  onDelete,
  dbCategories,
  dbServices,
}: ColumnWrapperProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col p-4 rounded-2xl border transition-all duration-300 min-h-[140px] relative ${
        isOver
          ? 'bg-amber-50/30 border-dashed border-[#d4af37] shadow-luxury'
          : 'bg-stone-50/50 border-stone-200/60 hover:bg-stone-50'
      }`}
    >
      <div className="absolute top-2 right-3 text-[9px] font-black text-stone-300 uppercase tracking-widest pointer-events-none select-none">
        Columna
      </div>

      <div className="flex-grow space-y-3">
        <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
          {blocks.map((block) => (
            <SortableBlockItem
              key={block.id}
              block={block}
              columnId={id}
              onEdit={onEdit}
              onDelete={onDelete}
              dbCategories={dbCategories}
              dbServices={dbServices}
            />
          ))}
        </SortableContext>

        {blocks.length === 0 && (
          <div className="h-full flex items-center justify-center py-8 text-center">
            <span className="text-[10px] font-semibold text-stone-400/80 italic select-none">
              Arrastra bloques aquí
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
