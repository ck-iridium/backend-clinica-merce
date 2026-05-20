"use client";
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MediaPickerModal from '@/components/MediaPickerModal';

// Primitives de DND-Kit
import { DndContext, closestCenter } from '@dnd-kit/core';

// Componentes modulares y hook
import BlockList from './components/BlockList';
import AddBlockModal from './components/AddBlockModal';
import BlockEditorModal from './components/BlockEditorModal';
import { usePageBuilderDnd } from './hooks/usePageBuilderDnd';

export default function CustomPageEditor() {
  const { slug } = useParams();

  const {
    pageTitle,
    sections,
    loading,
    adding,
    sensors,
    showAddModal,
    setShowAddModal,
    dbCategories,
    dbServices,
    editingBlock,
    setEditingBlock,
    savingBlock,
    editFormData,
    setEditFormData,
    showGallery,
    setShowGallery,
    handleAddNewSection,
    handleDeleteSection,
    handleReorderSections,
    handleUpdateSectionLayout,
    handleOpenAddBlockForColumn,
    handleAddBlockToColumn,
    handleStartEditBlock,
    handleSaveBlockEdit,
    handleDeleteBlockFromColumn,
    handleDragEnd,
    handleImageSelected,
    openGalleryFor,
  } = usePageBuilderDnd(slug);

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto">
      
      {/* ── CABECERA DEL EDITOR ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-stone-100 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link 
              href="/dashboard/pages" 
              className="text-stone-400 hover:text-stone-600 transition-colors text-xs flex items-center gap-1 font-semibold"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Volver a Páginas
            </Link>
            <span className="text-stone-300">/</span>
            <span className="text-[10px] font-black bg-amber-50 text-[#d4af37] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Mini Elementor Pro
            </span>
          </div>

          <h1 className="font-serif text-3xl font-extrabold text-stone-800 leading-tight">
            Diseñador: {pageTitle || slug}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-stone-400 font-sans">Enlace directo:</span>
            <a 
              href={`/${slug}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs font-mono text-[#d4af37] hover:underline"
            >
              /{slug}
            </a>
          </div>
        </div>

        <a
          href={`/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-stone-50 border border-stone-200 text-stone-600 hover:bg-stone-100 px-5 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          </svg>
          Vista Previa Pública
        </a>
      </div>

      {/* ── CONTENEDOR DRAG & DROP DEL LIENZO ─────────────────────── */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="space-y-6 mb-12">
          <BlockList
            sections={sections}
            loading={loading}
            onReorderSection={handleReorderSections}
            onDeleteSection={handleDeleteSection}
            onUpdateSectionLayout={handleUpdateSectionLayout}
            onEditBlock={handleStartEditBlock}
            onDeleteBlock={handleDeleteBlockFromColumn}
            onOpenAddBlockModal={handleOpenAddBlockForColumn}
            dbCategories={dbCategories}
            onAddNewSection={handleAddNewSection}
          />
        </div>
      </DndContext>

      {/* ── MODAL AGREGAR BLOQUE ─────────────────────────── */}
      <AddBlockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddBlock={handleAddBlockToColumn}
        adding={adding}
      />

      {/* ── MODAL PROPIEDADES BLOQUE ──────────────────────── */}
      <BlockEditorModal
        isOpen={!!editingBlock}
        editingBlock={editingBlock}
        editFormData={editFormData}
        onChangeFormData={setEditFormData}
        onSave={handleSaveBlockEdit}
        onClose={() => setEditingBlock(null)}
        saving={savingBlock}
        dbCategories={dbCategories}
        dbServices={dbServices}
        openGalleryFor={openGalleryFor}
      />

      {/* ── SELECCIONADOR DE MEDIOS (GALERÍA GLOBAL) ──────────────── */}
      {showGallery && (
        <MediaPickerModal
          onClose={() => { setShowGallery(false); }}
          onImageSelected={handleImageSelected}
          mediaType="image"
        />
      )}

    </div>
  );
}
