"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import MediaPickerModal from '@/components/MediaPickerModal';

import { usePageBuilder } from './hooks/usePageBuilder';
import CreatorSidebar from './components/CreatorSidebar';
import { CanvasSection } from './components/CanvasSection';
import BlockEditorModal from './components/BlockEditorModal';
import AddBlockModal from './components/AddBlockModal';

export default function PageEditor() {
  const { slug } = useParams();
  const slugStr = Array.isArray(slug) ? slug[0] : (slug ?? '');

  const {
    pageTitle,
    sections,
    loading,
    saving,
    dbCategories,
    dbServices,
    sensors,
    activeId,
    activeBlock,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleSaveAll,
    handleAddNewSection,
    handleDeleteSection,
    handleReorderSections,
    handleUpdateSectionLayout,
    handleAddBlockToColumn,
    handleDeleteBlockFromColumn,
    handleStartEditBlock,
    handleSaveBlockEdit,
    handleOpenAddBlockForColumn,
    showAddModal,
    setShowAddModal,
    targetLocation,
    editingBlock,
    setEditingBlock,
    savingBlock,
    editFormData,
    setEditFormData,
    showGallery,
    setShowGallery,
    openGalleryFor,
    handleImageSelected,
  } = usePageBuilder(slugStr);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-stone-100">

      {/* ── DRAG & DROP ENGINE ──────────────────────────────── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >

        {/* ── SIDEBAR IZQUIERDO ───────────────────────────────── */}
        <CreatorSidebar
          pageTitle={pageTitle}
          slug={slugStr}
          saving={saving}
          onSave={handleSaveAll}
          onAddSection={handleAddNewSection}
        />

        {/* ── CANVAS DERECHO (WYSIWYG) ─────────────────────────── */}
        <main className="flex-1 h-full overflow-y-auto">

          {/* Barra de título del canvas */}
          <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-stone-200 px-8 py-3 flex items-center gap-3 shadow-sm">
            <span className="text-xs font-black uppercase tracking-widest text-stone-500">
              Vista previa en vivo · Reordenamiento Estructural
            </span>
            <div className="ml-auto flex gap-1.5 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-300" />
            </div>
          </div>

          {/* ── Cuerpo del canvas ────────────────────────────── */}
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="space-y-4 w-full max-w-2xl mx-auto px-8">
                {[1, 2].map(i => (
                  <div key={i} className="h-48 bg-white/60 animate-pulse rounded-2xl" />
                ))}
              </div>
            </div>
          ) : sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">
                Lienzo vacío
              </span>
              <p className="text-sm text-stone-400 font-sans text-center max-w-xs">
                Arrastra bloques desde el sidebar o añade una sección para comenzar.
              </p>
              <button
                onClick={handleAddNewSection}
                className="mt-2 bg-stone-900 hover:bg-[#d4af37] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 shadow-md"
              >
                + Añadir primera sección
              </button>
            </div>
          ) : (
            <div className="divide-y divide-stone-200/60">
              {sections.map((section, index) => (
                <CanvasSection
                  key={section.id}
                  section={section}
                  index={index}
                  totalSections={sections.length}
                  onReorder={handleReorderSections}
                  onDelete={handleDeleteSection}
                  onUpdateLayout={handleUpdateSectionLayout}
                  onEditBlock={handleStartEditBlock}
                  onDeleteBlock={handleDeleteBlockFromColumn}
                  onAddBlock={handleOpenAddBlockForColumn}
                  dbCategories={dbCategories}
                  dbServices={dbServices}
                />
              ))}

              {/* Zona de nueva sección al final */}
              <div className="flex justify-center py-10">
                <button
                  onClick={handleAddNewSection}
                  className="flex items-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#d4af37]/40 text-stone-500 hover:text-[#d4af37] text-xs font-bold uppercase tracking-widest px-8 py-4 rounded-2xl transition-all duration-300 shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  Nueva Sección Estructural
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── DragOverlay — FUERA de cualquier contenedor con overflow ─ */}
        <DragOverlay dropAnimation={null}>
          {activeId ? (
            <div className="bg-white border-2 border-[#d4af37] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] p-4 max-w-[240px] flex items-center gap-3 select-none pointer-events-none opacity-95 rotate-1">
              <div className="w-8 h-8 bg-amber-50 rounded-xl border border-amber-100 flex items-center justify-center text-[#d4af37] shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
                </svg>
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-black uppercase tracking-wider text-stone-400 block">
                  {activeId.startsWith('library-') ? 'Nuevo bloque' : 'Moviendo'}
                </span>
                <span className="text-xs font-bold font-serif text-stone-800 block truncate mt-0.5">
                  {activeId.startsWith('library-')
                    ? activeId.replace('library-', '').replace(/_/g, ' ').toUpperCase()
                    : (activeBlock?.content_data?.title || activeBlock?.content_data?.text || activeBlock?.block_type || 'Bloque')}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>

      </DndContext>

      {/* ── Modales (fuera del DndContext para evitar conflictos de z-index) ── */}
      <AddBlockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddBlock={(blockType) =>
          targetLocation
            ? handleAddBlockToColumn(blockType, targetLocation.sectionId, targetLocation.columnId)
            : undefined
        }
        adding={false}
      />

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

      {showGallery && (
        <MediaPickerModal
          onClose={() => setShowGallery(false)}
          onImageSelected={handleImageSelected}
          mediaType="image"
        />
      )}
    </div>
  );
}
