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
            className="p-2 bg-white/95 backdrop-blur-sm border border-amber-200/90 hover:border-[#d4af37] rounded-xl text-[#d4af37] hover:bg-amber-50/70 shadow-md hover:scale-105 transition-all group/ai"
            title="Generar o mejorar con IA"
          >
            <svg className="w-4 h-4 transition-transform group-hover/ai:rotate-12" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
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
          className="p-2 bg-white/95 backdrop-blur-sm border border-red-100 rounded-xl text-stone-300 hover:text-red-500 shadow-md hover:scale-105 transition-all"
          title="Eliminar bloque"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
