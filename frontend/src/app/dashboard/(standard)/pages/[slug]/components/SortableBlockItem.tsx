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
  dbServices: any[];
}

export default function SortableBlockItem({
  block,
  columnId,
  onEdit,
  onDelete,
  dbCategories,
  dbServices,
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
      className={`group relative bg-white border border-stone-100 shadow-[0_4px_20px_rgba(0,0,0,0.01)] hover:border-[#d4af37]/60 hover:shadow-[0_8px_30px_rgba(0,0,0,0.03)] p-5 rounded-2xl transition-all duration-300 ${
        isDragging ? 'z-50 ring-2 ring-[#d4af37]/40 border-[#d4af37]' : ''
      }`}
    >
      {/* ── CABECERA / CONTROLES DEL BLOQUE ─────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-b border-stone-100 pb-3 mb-3">
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
              {block.block_type === 'text_image_cta' ? 'Bloque Imagen y Texto' : previewTitle}
            </h4>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={() => onEdit({ ...block, columnId })}
            className="p-1.5 text-stone-400 hover:text-stone-800 hover:bg-stone-50 rounded-lg transition-all"
            title="Configurar bloque"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.297 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.991l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.645-.869l.214-1.28z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(block.id, columnId)}
            className="p-1.5 text-stone-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
            title="Eliminar bloque"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── SECCIÓN DE PREVISUALIZACIÓN REAL (LIVE PREVIEW) ───────── */}
      <div className="w-full">
        {/* 1. Previsualización de Título */}
        {isTitle && (
          <div className="p-3 bg-stone-50/50 rounded-xl border border-stone-100 text-center">
            <h2 className="font-serif text-lg font-bold text-stone-850 tracking-tight leading-snug">
              {block.content_data?.title || 'Título de ejemplo'}
            </h2>
            {block.content_data?.subtitle && (
              <p className="text-[10px] text-stone-400 font-sans mt-1 leading-normal">
                {block.content_data.subtitle}
              </p>
            )}
          </div>
        )}

        {/* 2. Previsualización de Texto */}
        {isText && (
          <div className="p-3 bg-stone-50/20 rounded-xl border border-stone-100 max-h-24 overflow-y-auto text-stone-600 font-sans text-xs leading-relaxed">
            <div dangerouslySetInnerHTML={{ __html: block.content_data?.html || 'Escribe contenido de texto...' }} />
          </div>
        )}

        {/* 3. Previsualización de Botón */}
        {isButton && (
          <div className="flex justify-center py-1">
            <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-center cursor-default ${
              block.content_data?.style === 'gold_outline'
                ? 'border border-[#d4af37] text-[#d4af37] bg-transparent'
                : block.content_data?.style === 'dark_solid'
                ? 'bg-stone-900 text-white'
                : 'bg-[#d4af37] text-white shadow-sm'
            }`}>
              {block.content_data?.text || 'Acción'}
            </div>
          </div>
        )}

        {/* 4. Previsualización de Imagen / Bloque 2-en-1 (Multimedia) */}
        {(isImage || block.block_type === 'text_image_cta') && (
          <div>
            {block.content_data?.image_url ? (
              <div className="relative rounded-2xl overflow-hidden shadow-luxury border border-stone-100/50 bg-stone-50/20 flex flex-col items-center justify-center p-2.5">
                {block.content_data.image_url.includes('.mp4') || block.content_data.image_url.includes('.webm') || block.content_data.image_url.includes('video_') ? (
                  <video
                    src={block.content_data.image_url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto max-h-36 object-cover rounded-xl"
                  />
                ) : (
                  <img
                    src={block.content_data.image_url}
                    alt={block.content_data.caption || 'Previsualización'}
                    className="w-full h-auto max-h-36 object-contain rounded-xl"
                  />
                )}
                {block.content_data.caption && (
                  <span className="text-[10px] font-semibold text-stone-400 italic text-center mt-2 px-2 truncate block w-full">
                    {block.content_data.caption}
                  </span>
                )}
              </div>
            ) : (
              <div className="py-7 px-4 border border-dashed border-[#d4af37]/30 rounded-2xl bg-amber-50/5 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mb-2 border border-amber-100/50 text-[#d4af37]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-0.5">
                  Sin multimedia
                </span>
                <span className="text-[9px] text-stone-400 font-sans max-w-[200px]">
                  Configura este bloque para vincular un archivo de la galería.
                </span>
              </div>
            )}
          </div>
        )}

        {/* 5. Previsualización de Tratamientos / Categoría */}
        {isCategory && (
          <div className="space-y-3">
            {block.content_data?.category_id ? (
              (() => {
                const category = dbCategories.find(c => c.id === block.content_data.category_id);
                let services = dbServices.filter(s => s.category_id === block.content_data.category_id && s.is_active);
                if (block.content_data.selected_treatment_ids?.length > 0) {
                  services = services.filter(s => block.content_data.selected_treatment_ids.includes(s.id));
                }
                if (block.content_data.max_items) {
                  services = services.slice(0, block.content_data.max_items);
                }

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-1.5">
                      <span className="text-[10px] font-black text-[#d4af37] uppercase tracking-wider">
                        {category?.name || 'Catálogo de Tratamientos'}
                      </span>
                      <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                        Live Grid
                      </span>
                    </div>

                    {services.length > 0 ? (
                      <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                        {services.map(svc => (
                          <div
                            key={svc.id}
                            className="bg-stone-50/50 border border-stone-200/40 p-2.5 rounded-xl flex items-center justify-between shadow-sm hover:border-[#d4af37]/30 transition-all duration-300"
                          >
                            <div className="min-w-0 pr-2">
                              <h5 className="font-serif text-xs font-bold text-stone-700 truncate leading-tight">
                                {svc.name}
                              </h5>
                              <span className="text-[9px] text-stone-400 font-sans block mt-0.5">
                                {svc.duration} min
                              </span>
                            </div>
                            <span className="text-[10px] font-black text-[#d4af37] bg-amber-50 border border-amber-100/50 px-2.5 py-0.5 rounded-full shrink-0">
                              {svc.price}€
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[10px] text-stone-400 italic text-center py-4">
                        No hay tratamientos seleccionados o activos en la categoría.
                      </p>
                    )}
                  </div>
                );
              })()
            ) : (
              <div className="py-7 px-4 border border-dashed border-[#d4af37]/30 rounded-2xl bg-amber-50/5 flex flex-col items-center justify-center text-center">
                <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center mb-2 border border-amber-100/50 text-[#d4af37]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-3.75 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                </div>
                <span className="text-[10px] font-black text-stone-500 uppercase tracking-widest block mb-0.5">
                  Sin tratamientos
                </span>
                <span className="text-[9px] text-stone-400 font-sans max-w-[200px]">
                  Configura este bloque para vincular una categoría del negocio.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
