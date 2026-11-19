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
  onClone: (blockId: string, sectionId: string, columnId: string) => void;
  onOpenAI?: (block: any, sectionId: string, columnId: string) => void;
  dbCategories: any[];
  dbServices: any[];
  isBoxed?: boolean;
}

export function SortableCanvasBlock({
  block,
  sectionId,
  columnId,
  onEdit,
  onDelete,
  onClone,
  onOpenAI,
  dbCategories,
  dbServices,
  isBoxed = false,
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
  const supportsAI = ['atomic_title', 'title_heading', 'atomic_text', 'accordion_faq', 'features_grid', 'hero', 'quote_testimonial', 'text_image_cta', 'atomic_image'].includes(block.block_type);

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
        {supportsAI && onOpenAI && (
          <button
            onClick={() => onOpenAI(block, sectionId, columnId)}
            className="p-2 bg-gradient-to-tr from-[#ff5500] to-[#ff7a18] hover:from-[#ff4500] hover:to-[#ff6a00] border border-orange-400/50 rounded-xl text-white shadow-md shadow-orange-500/25 hover:scale-105 active:scale-95 transition-all group/ai"
            title="Generar o mejorar con IA"
          >
            <svg className="w-4 h-4 transition-transform group-hover/ai:rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4Zm0 0c2 2.67 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.33-6 4Z" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
          </button>
        )}
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
          onClick={() => onClone(block.id, sectionId, columnId)}
          className="p-2 bg-white/95 backdrop-blur-sm border border-stone-200 rounded-xl text-stone-400 hover:text-[#d4af37] shadow-md hover:scale-105 transition-all"
          title="Duplicar bloque"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(block.id, sectionId, columnId)}
          className="p-2 bg-white/95 backdrop-blur-sm border border-stone-200 hover:border-red-200 rounded-xl text-stone-400 hover:text-red-500 hover:bg-red-50/50 shadow-md hover:scale-105 transition-all"
          title="Eliminar bloque"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* Render real del bloque */}
      <div
        onClickCapture={(e) => {
          const anchor = (e.target as HTMLElement).closest('a');
          if (anchor) {
            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <RenderBlock block={block} dbCategories={dbCategories} dbServices={dbServices} isBoxed={isBoxed} />
      </div>
    </div>
  );
}
