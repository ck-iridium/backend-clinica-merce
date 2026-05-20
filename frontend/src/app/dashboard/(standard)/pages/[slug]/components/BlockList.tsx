"use client";
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface Block {
  id: string;
  block_type: 'title_heading' | 'text_image_cta' | 'atomic_image' | 'atomic_category';
  content_data: Record<string, any>;
  order_index: number;
}

interface BlockListProps {
  blocks: Block[];
  loading: boolean;
  onReorder: (index: number, direction: 'up' | 'down') => void;
  onEdit: (block: Block) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: () => void;
  dbCategories: any[];
}

export default function BlockList({
  blocks,
  loading,
  onReorder,
  onEdit,
  onDelete,
  onOpenAddModal,
  dbCategories,
}: BlockListProps) {
  
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
      </div>
    );
  }

  if (blocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-white">
        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mb-5 border border-stone-100 text-stone-300">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75zm1.5 1.5h13.5v13.5H5.25V5.25z" />
          </svg>
        </div>
        <h3 className="font-serif text-lg font-bold text-stone-600 mb-1">Página sin contenido</h3>
        <p className="text-stone-400 text-xs max-w-xs mb-6">Añade tu primer bloque modular para estructurar el diseño.</p>
        <button
          onClick={onOpenAddModal}
          className="bg-stone-900 hover:bg-[#d4af37] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
        >
          + Añadir Bloque
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const isTitle = block.block_type === 'title_heading';
        const isTextImage = block.block_type === 'text_image_cta';
        const isAtomicImage = block.block_type === 'atomic_image';
        const isAtomicCategory = block.block_type === 'atomic_category';

        let previewTitle = 'Sin título';
        let previewDesc = 'Sin descripción';
        let colorClasses = 'bg-stone-50/50 border-stone-200 text-stone-500';
        let icon = (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
          </svg>
        );

        if (isTitle) {
          previewTitle = block.content_data?.title || 'Título vacío';
          previewDesc = block.content_data?.subtitle || 'Subtítulo vacío';
          colorClasses = 'bg-amber-50/50 border-amber-100 text-[#d4af37]';
        } else if (isTextImage) {
          previewTitle = block.content_data?.title || 'Sección Destacada';
          previewDesc = block.content_data?.description || 'Contenido en dos columnas con imagen y CTA.';
          colorClasses = 'bg-blue-50/40 border-blue-100 text-blue-500';
          icon = (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
            </svg>
          );
        } else if (isAtomicImage) {
          previewTitle = 'Bloque Imagen / Vídeo';
          previewDesc = block.content_data?.caption || 'Archivo multimedia de la galería de medios.';
          colorClasses = 'bg-emerald-50/50 border-emerald-100 text-emerald-600';
          icon = (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          );
        } else if (isAtomicCategory) {
          const category = dbCategories.find(c => c.id === block.content_data?.category_id);
          previewTitle = `Bloque de Categoría: ${category?.name || 'Cargando...'}`;
          const tCount = block.content_data?.selected_treatment_ids?.length || 0;
          previewDesc = tCount === 0 
            ? 'Mostrando todos los tratamientos asociados.'
            : `Mostrando ${tCount} tratamientos específicos seleccionados.`;
          colorClasses = 'bg-purple-50/50 border-purple-100 text-purple-600';
          icon = (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.16 3.659A1.5 1.5 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          );
        }

        return (
          <div 
            key={block.id}
            className="bg-white rounded-3xl border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 hover:border-amber-100/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300"
          >
            <div className="flex items-center justify-between gap-6">
              {/* Detalles del Bloque */}
              <div className="flex items-center gap-4 min-w-0">
                
                {/* Botones de Reordenado Rápido */}
                <div className="flex flex-col gap-1 shrink-0">
                  <button
                    onClick={() => onReorder(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-stone-400 hover:text-[#d4af37] disabled:opacity-20 transition-all hover:bg-stone-50 rounded"
                    title="Mover arriba"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onReorder(index, 'down')}
                    disabled={index === blocks.length - 1}
                    className="p-1 text-stone-400 hover:text-[#d4af37] disabled:opacity-20 transition-all hover:bg-stone-50 rounded"
                    title="Mover abajo"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                </div>

                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${colorClasses}`}>
                  {icon}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-stone-400 uppercase tracking-wider">
                      Bloque {index + 1}
                    </span>
                    <span className="text-stone-300">•</span>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                      {block.block_type}
                    </span>
                  </div>
                  
                  <h3 className="font-serif text-lg font-extrabold text-stone-800 mt-1 truncate">
                    {previewTitle}
                  </h3>
                  
                  <p className="text-stone-400 text-xs font-sans truncate mt-1 max-w-xl">
                    {previewDesc}
                  </p>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onEdit(block)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 hover:border-stone-800 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-all"
                >
                  Configurar
                </button>
                <button
                  onClick={() => onDelete(block.id)}
                  className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                  title="Borrar bloque"
                >
                  <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        );
      })}

      {/* Botón rápido de agregar abajo de la lista */}
      <div className="flex justify-center pt-4">
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 bg-stone-900 hover:bg-[#d4af37] text-white px-6 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 shadow-md transform hover:scale-[1.02]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Añadir Bloque Modular
        </button>
      </div>
    </div>
  );
}
