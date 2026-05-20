"use client";
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import BentoGridServices from '@/components/blocks/BentoGridServices';
import Link from 'next/link';
import type { AtomicBlock, SectionBlock } from '../hooks/usePageBuilder';

// ── Render de cada tipo de bloque (WYSIWYG real) ─────────────────────
function RenderBlock({ block, dbCategories, dbServices }: {
  block: AtomicBlock;
  dbCategories: any[];
  dbServices: any[];
}) {
  const data = block.content_data || {};

  // HERO
  if (block.block_type === 'hero') {
    return (
      <div className="relative w-full min-h-[340px] bg-stone-900 overflow-hidden flex items-end">
        {data.image_url && (
          data.image_url.match(/\.(mp4|webm)/) ? (
            <video src={data.image_url} autoPlay loop muted playsInline
              className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <img src={data.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
          )
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 to-transparent" />
        <div className="relative z-10 p-8 md:p-12 max-w-2xl">
          {data.heading && (
            <h1 className="font-serif text-3xl md:text-4xl font-extrabold text-white leading-tight mb-3">
              {data.heading}
            </h1>
          )}
          {data.subheading && (
            <p className="text-white/80 font-sans text-sm mb-6 leading-relaxed">{data.subheading}</p>
          )}
          {data.cta_text && (
            <span className="inline-block bg-[#d4af37] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg cursor-default">
              {data.cta_text}
            </span>
          )}
        </div>
        {!data.image_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/40 text-xs font-bold uppercase tracking-widest">
              Hero · Sin imagen
            </span>
          </div>
        )}
      </div>
    );
  }

  // TITLE / HEADING
  if (block.block_type === 'atomic_title' || block.block_type === 'title_heading') {
    const Tag = (data.title_tag || 'h2') as keyof JSX.IntrinsicElements;
    const align = data.alignment === 'left' ? 'text-left' : data.alignment === 'right' ? 'text-right' : 'text-center';
    return (
      <div className={`py-4 w-full ${align}`}>
        <Tag className="font-serif text-2xl md:text-3xl font-extrabold text-stone-800 leading-tight">
          {data.title || 'Título de sección'}
        </Tag>
        {data.show_divider !== false && (
          <div className={`w-10 h-[2px] bg-[#d4af37] mt-3 rounded-full ${align === 'text-center' ? 'mx-auto' : align === 'text-right' ? 'ml-auto' : ''}`} />
        )}
        {data.subtitle && (
          <p className="text-stone-400 text-sm mt-3 font-sans">{data.subtitle}</p>
        )}
      </div>
    );
  }

  // TEXT
  if (block.block_type === 'atomic_text') {
    return (
      <div
        className="prose prose-stone max-w-none text-stone-600 font-sans text-base leading-relaxed py-2"
        dangerouslySetInnerHTML={{ __html: data.html || '<p>Sin contenido</p>' }}
      />
    );
  }

  // IMAGE / VIDEO + TEXT-IMAGE-CTA
  if (block.block_type === 'atomic_image' || block.block_type === 'text_image_cta') {
    const isVideo = data.image_url && (data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_'));
    const isFull = data.alignment === 'full_width';

    return (
      <div className={`w-full py-3 flex ${data.alignment === 'left' ? 'justify-start' : data.alignment === 'right' ? 'justify-end' : 'justify-center'}`}>
        {data.image_url ? (
          <div className={`${isFull ? 'w-full rounded-none' : 'rounded-[1.5rem] overflow-hidden shadow-luxury border border-stone-100 p-3'}`}
            style={{ maxWidth: isFull ? '100%' : (data.max_width || '800px') }}>
            {isVideo ? (
              <video src={data.image_url} autoPlay loop muted playsInline
                className={`w-full object-cover ${isFull ? 'h-[50vh]' : 'h-auto rounded-xl'}`} />
            ) : (
              <img src={data.image_url} alt={data.caption || ''} className={`w-full h-auto ${isFull ? '' : 'rounded-xl'}`} />
            )}
            {data.caption && (
              <p className="text-xs text-stone-400 italic text-center mt-2">{data.caption}</p>
            )}
          </div>
        ) : (
          <div className="w-full h-32 border-2 border-dashed border-stone-200 rounded-2xl flex items-center justify-center bg-stone-50/50">
            <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Sin imagen — configura este bloque</span>
          </div>
        )}
      </div>
    );
  }

  // BUTTON
  if (block.block_type === 'atomic_button') {
    const align = data.alignment === 'left' ? 'justify-start' : data.alignment === 'right' ? 'justify-end' : 'justify-center';
    const cls = data.style === 'gold_outline'
      ? 'border border-[#d4af37] text-[#d4af37] bg-transparent'
      : data.style === 'dark_solid'
      ? 'bg-stone-900 text-white'
      : 'bg-[#d4af37] text-white';
    return (
      <div className={`w-full py-3 flex ${align}`}>
        <span className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest cursor-default shadow-sm ${cls}`}>
          {data.text || 'Acción'}
        </span>
      </div>
    );
  }

  // CATEGORY / BENTO
  if (block.block_type === 'atomic_category') {
    const category = dbCategories.find(c => c.id === data.category_id);
    let services = dbServices.filter(s => s.category_id === data.category_id && s.is_active);
    if (data.selected_treatment_ids?.length) services = services.filter(s => data.selected_treatment_ids.includes(s.id));
    if (data.max_items) services = services.slice(0, data.max_items);

    if (!data.category_id) return (
      <div className="py-10 text-center border-2 border-dashed border-stone-200 rounded-2xl bg-stone-50/30">
        <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">Bento Catálogo — configura la categoría</span>
      </div>
    );

    return (
      <div className="w-full py-2">
        <BentoGridServices
          data={{ title: category?.name || 'Tratamientos', subtitle: category?.description || '' }}
          services={services}
        />
      </div>
    );
  }

  return null;
}

// ── Bloque arrastrable dentro del canvas ─────────────────────────────
function SortableCanvasBlock({ block, sectionId, columnId, onEdit, onDelete, dbCategories, dbServices }: {
  block: AtomicBlock;
  sectionId: string;
  columnId: string;
  onEdit: (block: any) => void;
  onDelete: (blockId: string, sectionId: string, columnId: string) => void;
  dbCategories: any[];
  dbServices: any[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/block">
      {/* Controles del bloque — aparecen al hover */}
      <div className="absolute top-1 right-1 z-30 flex items-center gap-1 opacity-0 group-hover/block:opacity-100 transition-opacity duration-200">
        <div
          {...attributes}
          {...listeners}
          className="p-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-lg cursor-grab active:cursor-grabbing text-stone-400 hover:text-stone-700 shadow-sm"
          title="Mover bloque"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v.008h-.008V3.75h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 3.75v.008H11.99V3.75h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008V3.75h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12v.008h-.008V12h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 12v.008H11.99V12h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008V12h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-16.5 8.25v.008h-.008v-.008h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008H11.99v-.008h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008v-.008h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </div>
        <button
          onClick={() => onEdit({ ...block, sectionId, columnId })}
          className="p-1.5 bg-white/90 backdrop-blur-sm border border-stone-200 rounded-lg text-stone-400 hover:text-stone-900 shadow-sm transition-colors"
          title="Editar bloque"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(block.id, sectionId, columnId)}
          className="p-1.5 bg-white/90 backdrop-blur-sm border border-red-100 rounded-lg text-stone-300 hover:text-red-500 shadow-sm transition-colors"
          title="Eliminar bloque"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Render real del bloque */}
      <RenderBlock block={block} dbCategories={dbCategories} dbServices={dbServices} />
    </div>
  );
}

// ── Columna droppable ─────────────────────────────────────────────────
function CanvasColumn({ col, sectionId, columnsCount, onEdit, onDelete, onAddBlock, dbCategories, dbServices }: {
  col: any;
  sectionId: string;
  columnsCount: number;
  onEdit: (block: any) => void;
  onDelete: (blockId: string, sectionId: string, columnId: string) => void;
  onAddBlock: (sectionId: string, columnId: string) => void;
  dbCategories: any[];
  dbServices: any[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });
  const blocks: AtomicBlock[] = col.blocks || [];

  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-h-[80px] relative transition-all duration-200 ${
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
            dbCategories={dbCategories}
            dbServices={dbServices}
          />
        ))}
      </SortableContext>

      {/* Drop-zone hint cuando vacío */}
      {blocks.length === 0 && (
        <button
          onClick={() => onAddBlock(sectionId, col.id)}
          className={`w-full flex flex-col items-center justify-center gap-2 py-10 border-2 border-dashed
            transition-all duration-200 cursor-pointer group/drop
            ${isOver
              ? 'border-[#d4af37] bg-amber-50/20'
              : 'border-stone-200/70 hover:border-[#d4af37]/40 hover:bg-stone-50/30'
            }`}
        >
          <svg className="w-5 h-5 text-stone-300 group-hover/drop:text-[#d4af37] transition-colors" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="text-[10px] font-bold text-stone-400 group-hover/drop:text-[#d4af37] uppercase tracking-widest transition-colors">
            {isOver ? 'Soltar aquí' : 'Añadir bloque'}
          </span>
        </button>
      )}
    </div>
  );
}

// ── Sección del canvas con toolbar WYSIWYG ────────────────────────────
export function CanvasSection({ section, index, totalSections, onReorder, onDelete, onUpdateLayout, onEditBlock, onDeleteBlock, onAddBlock, dbCategories, dbServices }: {
  section: SectionBlock;
  index: number;
  totalSections: number;
  onReorder: (i: number, dir: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onUpdateLayout: (id: string, cols: number) => void;
  onEditBlock: (block: any) => void;
  onDeleteBlock: (blockId: string, sectionId: string, columnId: string) => void;
  onAddBlock: (sectionId: string, columnId: string) => void;
  dbCategories: any[];
  dbServices: any[];
}) {
  const struct = section.content_data;
  const columns = struct.columns || [];
  const columnsCount = struct.columns_count || 1;

  let gridClass = 'flex';
  if (columnsCount >= 2) gridClass = 'flex';

  const bgColor = struct.bg_color === 'white' ? 'bg-white' : 'bg-[#FAFAFA]';

  return (
    <div className={`relative group/section w-full ${bgColor}`}>
      {/* ── Toolbar de sección incrustada (se ve al hover) ── */}
      <div className="flex items-center gap-3 px-6 py-2 bg-white/80 backdrop-blur-sm border-b border-t border-stone-200 z-20 relative">
        {/* Flechas reordenado */}
        <div className="flex gap-0.5">
          <button
            onClick={() => onReorder(index, 'up')}
            disabled={index === 0}
            className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 rounded transition-colors"
            title="Subir"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
            </svg>
          </button>
          <button
            onClick={() => onReorder(index, 'down')}
            disabled={index === totalSections - 1}
            className="p-1 text-stone-400 hover:text-stone-700 disabled:opacity-20 rounded transition-colors"
            title="Bajar"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>

        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-500">
          Sección {index + 1}
        </span>

        {/* Selector columnas */}
        <div className="flex items-center gap-1 ml-auto">
          <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mr-1">Columnas:</span>
          {[1, 2, 3, 4].map(n => (
            <button
              key={n}
              onClick={() => onUpdateLayout(section.id, n)}
              className={`w-6 h-6 rounded-md text-[10px] font-black transition-all ${
                columnsCount === n
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'text-stone-400 hover:bg-stone-100'
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        {/* Borrar sección */}
        <button
          onClick={() => onDelete(section.id)}
          className="p-1 text-stone-300 hover:text-red-500 transition-colors rounded ml-2"
          title="Eliminar sección"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* ── Columnas reales del canvas ── */}
      <div className={`${gridClass} w-full divide-x divide-stone-100`}>
        {columns.map((col: any) => (
          <CanvasColumn
            key={col.id}
            col={col}
            sectionId={section.id}
            columnsCount={columnsCount}
            onEdit={onEditBlock}
            onDelete={onDeleteBlock}
            onAddBlock={onAddBlock}
            dbCategories={dbCategories}
            dbServices={dbServices}
          />
        ))}
      </div>
    </div>
  );
}
