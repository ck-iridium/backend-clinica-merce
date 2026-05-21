"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';
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
    handleUpdateSectionMetadata,
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
    galleryMediaType,
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
        <main className="flex-1 h-full overflow-y-auto bg-stone-50/50 flex flex-col">

          {/* Barra de título del canvas */}
          <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200 px-8 py-3.5 flex items-center gap-3 shadow-sm shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37]">
              Vista previa en vivo
            </span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200/40">
              Escritorio (Ancho Máx: 1300px)
            </span>
            <div className="ml-auto flex gap-1.5 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            </div>
          </div>

          {/* Contenedor del lienzo flotante */}
          <div className="flex-1 p-6 md:p-12 overflow-y-auto flex justify-center items-start">
            <div className="w-full max-w-[1300px] bg-white rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.04)] border border-stone-200/50 overflow-hidden min-h-[85vh] flex flex-col relative">
              
              {loading ? (
                <div className="flex-1 flex items-center justify-center p-12">
                  <div className="space-y-6 w-full max-w-3xl mx-auto">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-32 bg-stone-50 animate-pulse rounded-2xl border border-stone-100" />
                    ))}
                  </div>
                </div>
              ) : sections.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8">
                  <div className="w-16 h-16 rounded-full bg-stone-50 flex items-center justify-center text-2xl border border-stone-100">
                    📄
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.25em] text-[#d4af37]">
                    Lienzo en Blanco
                  </span>
                  <p className="text-xs text-stone-400 font-sans text-center max-w-xs leading-relaxed">
                    Arrastra bloques desde el panel lateral o añade una primera sección estructural para comenzar a construir.
                  </p>
                  <button
                    onClick={handleAddNewSection}
                    className="mt-2 bg-stone-900 hover:bg-[#d4af37] text-white text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-xl transition-all duration-300 shadow-md active:scale-95"
                  >
                    + Añadir primera sección
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-stone-200/60 flex-1">
                  {sections.map((section, index) => (
                    <CanvasSection
                      key={section.id}
                      section={section}
                      index={index}
                      totalSections={sections.length}
                      onReorder={handleReorderSections}
                      onDelete={handleDeleteSection}
                      onUpdateLayout={handleUpdateSectionLayout}
                      onUpdateSectionMetadata={handleUpdateSectionMetadata}
                      onEditBlock={handleStartEditBlock}
                      onDeleteBlock={handleDeleteBlockFromColumn}
                      onAddBlock={handleOpenAddBlockForColumn}
                      dbCategories={dbCategories}
                      dbServices={dbServices}
                    />
                  ))}

                  {/* Zona de nueva sección al final */}
                  <div className="flex justify-center py-12 bg-stone-50/50">
                    <button
                      onClick={handleAddNewSection}
                      className="flex items-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 hover:border-[#d4af37]/40 text-stone-500 hover:text-[#d4af37] text-xs font-bold uppercase tracking-widest px-8 py-3.5 rounded-2xl transition-all duration-300 shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Nueva Sección Estructural
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── DragOverlay — FUERA de cualquier contenedor con overflow ─ */}
        <DragOverlay dropAnimation={null} modifiers={[restrictToWindowEdges, snapCenterToCursor]}>
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
          mediaType={galleryMediaType}
        />
      )}
    </div>
  );
}
