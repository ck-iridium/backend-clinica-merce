"use client";
import React from 'react';
import { HeroFields } from './modals/block-editor/fields/HeroFields';
import { TitleFields } from './modals/block-editor/fields/TitleFields';
import { TextFields } from './modals/block-editor/fields/TextFields';
import { ImageFields } from './modals/block-editor/fields/ImageFields';
import { TextImageCtaFields } from './modals/block-editor/fields/TextImageCtaFields';
import { ButtonFields } from './modals/block-editor/fields/ButtonFields';
import { CategoryFields } from './modals/block-editor/fields/CategoryFields';

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
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-stone-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:bg-stone-50 text-sm font-bold transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-stone-900 hover:bg-[#d4af37] text-white text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
