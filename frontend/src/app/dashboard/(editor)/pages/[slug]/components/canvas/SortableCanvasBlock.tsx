import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AtomicBlock } from '../../types';
import { RenderBlock } from './renderers/RenderBlock';

interface SortableCanvasBlockProps {
  block: AtomicBlock;
  sectionId: string;
  columnId: string;
  onEdit: (block: any) => void;
  onDelete: (blockId: string, sectionId: string, columnId: string) => void;
  dbCategories: any[];
  dbServices: any[];
}

export function SortableCanvasBlock({
  block,
  sectionId,
  columnId,
  onEdit,
  onDelete,
  dbCategories,
  dbServices,
}: SortableCanvasBlockProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: isDragging ? undefined : CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const isHeroBlock = block.block_type === 'hero';

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`relative group/block transition-all duration-300 ${
        isHeroBlock ? 'p-0 rounded-none' : 'rounded-3xl p-2.5'
      }`}
    >
      {/* Controles del bloque — aparecen al hover */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-1.5 opacity-0 group-hover/block:opacity-100 transition-opacity duration-200">
        <div
          {...attributes}
          {...listeners}
          className="p-2 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-700 shadow-md hover:scale-105 transition-all"
          title="Mover bloque"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v.008h-.008V3.75h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 3.75v.008H11.99V3.75h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008V3.75h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12v.008h-.008V12h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 12v.008H11.99V12h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008V12h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-16.5 8.25v.008h-.008v-.008h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008H11.99v-.008h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008v-.008h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <button
          onClick={() => onEdit({ ...block, sectionId, columnId })}
          className="p-2 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl text-stone-400 hover:text-stone-900 shadow-md hover:scale-105 transition-all"
          title="Editar bloque"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(block.id, sectionId, columnId)}
          className="p-2 bg-white/95 backdrop-blur-sm border border-red-100 rounded-xl text-stone-300 hover:text-red-500 shadow-md hover:scale-105 transition-all"
          title="Eliminar bloque"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Render real del bloque */}
      <RenderBlock block={block} dbCategories={dbCategories} dbServices={dbServices} />
    </div>
  );
}
