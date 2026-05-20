"use client";
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import MediaPickerModal from '@/components/MediaPickerModal';

// Primitives de DND-Kit
import { DndContext, closestCenter, DragOverlay } from '@dnd-kit/core';

// Componentes modulares y hook
import BlockList from './components/BlockList';
import AddBlockModal from './components/AddBlockModal';
import BlockEditorModal from './components/BlockEditorModal';
import CreatorSidebar from './components/CreatorSidebar';
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
    activeId,
    handleDragStart,
  } = usePageBuilderDnd(slug);

  return (
    <div className="animate-in fade-in duration-500 max-w-7xl mx-auto px-6 lg:px-8">
      
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
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col lg:flex-row gap-8 items-start mb-12">
          {/* Creator Sidebar Fijo a la Izquierda (Biblioteca de bloques) */}
          <CreatorSidebar />

          {/* Lienzo del Page Builder */}
          <div className="flex-grow min-w-0 space-y-6">
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
              dbServices={dbServices}
              onAddNewSection={handleAddNewSection}
            />
          </div>
        </div>

        {/* ── DragOverlay: Feedback visual durante el arrastre ──── */}
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <div className="bg-white border-2 border-[#d4af37] p-5 rounded-2xl shadow-luxury max-w-[280px] select-none flex items-center gap-3 cursor-grabbing opacity-95 scale-95 pointer-events-none transition-transform duration-200">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center border border-amber-100 text-[#d4af37] shrink-0">
                {activeId.includes('title') ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                  </svg>
                ) : activeId.includes('text') ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 17.75V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25V6" />
                  </svg>
                ) : activeId.includes('image') ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                ) : activeId.includes('button') ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 9.152c.582.448 1.148.89 1.676 1.345m-1.676-1.345c-.38-.3-1.047-.22-1.436.17l-5.835 5.835a.75.75 0 01-.53.22H5.25v-2.03a.75.75 0 01.22-.53l5.835-5.835c.39-.39 1.057-.47 1.436-.17l1.676 1.345zm1.676 1.345c.39.39.47 1.057.17 1.436l-1.345 1.676" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25z" />
                  </svg>
                )}
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block">
                  Arrastrando Bloque
                </span>
                <span className="font-serif text-xs font-bold text-stone-850 block truncate mt-0.5">
                  {activeId.startsWith('library-') 
                    ? `Crear ${activeId.replace('library-', '').replace('_', ' ').toUpperCase()}`
                    : `Mover elemento`}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
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
