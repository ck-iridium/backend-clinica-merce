"use client";
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableBlockItemProps {
  block: {
    id: string;
    block_type: string;
    content_data: Record<string, any>;
  };
  columnId: string;
  onEdit: (block: any) => void;
  onDelete: (blockId: string, columnId: string) => void;
  dbCategories: any[];
}

export default function SortableBlockItem({
  block,
  columnId,
  onEdit,
  onDelete,
  dbCategories,
}: SortableBlockItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isTitle = block.block_type === 'atomic_title' || block.block_type === 'title_heading';
  const isText = block.block_type === 'atomic_text';
  const isImage = block.block_type === 'atomic_image';
  const isButton = block.block_type === 'atomic_button';
  const isCategory = block.block_type === 'atomic_category';

  let previewTitle = 'Bloque Atómico';
  let previewDesc = 'Arrastra para reordenar';
  let badgeColor = 'bg-stone-50 text-stone-500 border-stone-100';

  if (isTitle) {
    previewTitle = block.content_data?.title || 'Título vacío';
    previewDesc = `Encabezado (${block.content_data?.title_tag || 'H2'})`;
    badgeColor = 'bg-amber-50 text-[#d4af37] border-amber-100';
  } else if (isText) {
    previewTitle = 'Bloque de Texto';
    const textContent = block.content_data?.html || '';
    // Limpiar HTML simple para descripción corta
    previewDesc = textContent.replace(/<[^>]*>/g, '').slice(0, 50) || 'Sin contenido de texto.';
    badgeColor = 'bg-blue-50 text-blue-500 border-blue-100';
  } else if (isImage) {
    previewTitle = 'Bloque de Imagen';
    previewDesc = block.content_data?.caption || 'Archivo multimedia';
    badgeColor = 'bg-emerald-50 text-emerald-600 border-emerald-100';
  } else if (isButton) {
    previewTitle = `Botón: ${block.content_data?.text || 'Sin texto'}`;
    previewDesc = `Enlace: ${block.content_data?.url || '#'}`;
    badgeColor = 'bg-rose-50 text-rose-500 border-rose-100';
  } else if (isCategory) {
    const category = dbCategories.find(c => c.id === block.content_data?.category_id);
    previewTitle = `Categoría: ${category?.name || 'Cargando...'}`;
    const count = block.content_data?.selected_treatment_ids?.length || 0;
    previewDesc = count === 0 ? 'Todos los tratamientos' : `${count} seleccionados`;
    badgeColor = 'bg-purple-50 text-purple-600 border-purple-100';
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-white border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#d4af37]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-4 rounded-2xl transition-all duration-300 ${
        isDragging ? 'z-50 ring-2 ring-[#d4af37]/40 border-[#d4af37]' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Detalle */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1.5 text-stone-300 hover:text-stone-500 hover:bg-stone-50 rounded-lg transition-colors shrink-0"
            title="Arrastrar para mover"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v.008h-.008V3.75h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 3.75v.008H11.99V3.75h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008V3.75h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12v.008h-.008V12h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM12 12v.008H11.99V12h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008V12h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-16.5 8.25v.008h-.008v-.008h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008H11.99v-.008h.01zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.875 0v.008h-.008v-.008h.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                {block.block_type.replace('atomic_', '')}
              </span>
            </div>

            <h4 className="font-serif text-sm font-extrabold text-stone-800 mt-1 truncate">
              {previewTitle}
            </h4>

            <p className="text-[10px] text-stone-400 font-sans truncate mt-0.5 max-w-[200px]">
              {previewDesc}
            </p>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit({ ...block, columnId })}
            className="p-1 text-stone-400 hover:text-stone-800 hover:bg-stone-50 rounded-lg transition-all"
            title="Configurar bloque"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.297 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(block.id, columnId)}
            className="p-1 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Eliminar bloque"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
