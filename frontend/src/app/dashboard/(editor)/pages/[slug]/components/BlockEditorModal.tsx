"use client";
import React from 'react';
import { HeroFields } from './modals/block-editor/fields/HeroFields';
import { TitleFields } from './modals/block-editor/fields/TitleFields';
import { TextFields } from './modals/block-editor/fields/TextFields';
import { ImageFields } from './modals/block-editor/fields/ImageFields';
import { TextImageCtaFields } from './modals/block-editor/fields/TextImageCtaFields';
import { ButtonFields } from './modals/block-editor/fields/ButtonFields';
import { CategoryFields } from './modals/block-editor/fields/CategoryFields';
import { QuoteTestimonialFields } from './modals/block-editor/fields/QuoteTestimonialFields';
import { FeaturesGridFields } from './modals/block-editor/fields/FeaturesGridFields';
import { AccordionFaqFields } from './modals/block-editor/fields/AccordionFaqFields';
import { SeparatorSpacerFields } from './modals/block-editor/fields/SeparatorSpacerFields';

interface BlockEditorModalProps {
  isOpen: boolean;
  editingBlock: any;
  editFormData: Record<string, any>;
  onChangeFormData: (data: Record<string, any>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  dbCategories: any[];
  dbServices: any[];
  openGalleryFor: (field: string, mediaType?: 'image' | 'video' | 'all') => void;
}

export default function BlockEditorModal({
  isOpen,
  editingBlock,
  editFormData,
  onChangeFormData,
  onSave,
  onClose,
  saving,
  dbCategories,
  dbServices,
  openGalleryFor,
}: BlockEditorModalProps) {
  if (!isOpen || !editingBlock) return null;

  const set = (key: string, value: any) => onChangeFormData({ ...editFormData, [key]: value });
  const blockType = editingBlock.block_type;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 pt-8 pb-5 border-b border-stone-100 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
            Propiedades del Bloque
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-800 capitalize">
            {blockType.replace(/_/g, ' ')}
          </h2>
        </div>

        {/* Form Body Despachador */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          {blockType === 'hero' && (
            <HeroFields
              editFormData={editFormData}
              set={set}
              openGalleryFor={openGalleryFor}
            />
          )}

          {(blockType === 'atomic_title' || blockType === 'title_heading') && (
            <TitleFields
              editFormData={editFormData}
              set={set}
            />
          )}

          {blockType === 'atomic_text' && (
            <TextFields
              editFormData={editFormData}
              set={set}
              blockId={editingBlock.id}
            />
          )}

          {blockType === 'atomic_image' && (
            <ImageFields
              editFormData={editFormData}
              set={set}
              openGalleryFor={openGalleryFor}
            />
          )}

          {blockType === 'text_image_cta' && (
            <TextImageCtaFields
              editFormData={editFormData}
              set={set}
              openGalleryFor={openGalleryFor}
            />
          )}

          {blockType === 'atomic_button' && (
            <ButtonFields
              editFormData={editFormData}
              set={set}
            />
          )}

          {blockType === 'atomic_category' && (
            <CategoryFields
              editFormData={editFormData}
              set={set}
              dbCategories={dbCategories}
              dbServices={dbServices}
            />
          )}

          {blockType === 'quote_testimonial' && (
            <QuoteTestimonialFields
              editFormData={editFormData}
              set={set}
              openGalleryFor={openGalleryFor}
            />
          )}

          {blockType === 'features_grid' && (
            <FeaturesGridFields
              editFormData={editFormData}
              set={set}
            />
          )}

          {blockType === 'accordion_faq' && (
            <AccordionFaqFields
              editFormData={editFormData}
              set={set}
            />
          )}

          {blockType === 'separator_spacer' && (
            <SeparatorSpacerFields
              editFormData={editFormData}
              set={set}
            />
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-stone-100 flex items-center justify-end gap-3 shrink-0 bg-stone-50/50 rounded-b-3xl">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="px-7 py-2.5 bg-stone-900 hover:bg-[#d4af37] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}
