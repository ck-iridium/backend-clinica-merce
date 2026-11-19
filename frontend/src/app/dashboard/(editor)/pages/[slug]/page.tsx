"use client";
import React from 'react';
import { useParams } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
} from '@dnd-kit/core';
import { restrictToWindowEdges, snapCenterToCursor } from '@dnd-kit/modifiers';
import MediaPickerModal from '@/components/MediaPickerModal';

import { usePageBuilder } from './hooks/usePageBuilder';
import CreatorSidebar from './components/CreatorSidebar';
import { CanvasSection } from './components/CanvasSection';
import BlockEditorModal from './components/BlockEditorModal';
import AddBlockModal from './components/AddBlockModal';
import { getBlockDefinition, getBlockIcon } from './utils/blockRegistry';

export default function PageEditor() {
  const { slug } = useParams();
  const slugStr = Array.isArray(slug) ? slug[0] : (slug ?? '');

  const {
    pageTitle,
    sections,
    loading,
    saving,
    lastSavedAt,
    hasUnsavedChanges,
    dbCategories,
    dbServices,
    canUndo,
    handleUndo,
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
    handleCloneBlock,
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

  // Detección de colisión estricta: sólo detecta dropzones donde el cursor o el elemento realmente entra.
  // Evita que un click o drag sobre el sidebar o márgenes vacíos agregue bloques fantasma.
  const customCollisionDetection: CollisionDetection = (args) => {
    // 1. Si el puntero está directamente dentro de un contenedor droppable, esa es la colisión prioritaria
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    // 2. Si no, sólo colisiones con intersección geométrica real del rect (sin saltar a esquinas lejanas)
    return rectIntersection(args);
  };

  return (
    <div className="h-screen w-full flex overflow-hidden bg-stone-100">

      {/* ── DRAG & DROP ENGINE ──────────────────────────────── */}
      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >

        {/* ── SIDEBAR IZQUIERDO ───────────────────────────────── */}
        <CreatorSidebar
          pageTitle={pageTitle}
          slug={slugStr}
          saving={saving}
          lastSavedAt={lastSavedAt}
          hasUnsavedChanges={hasUnsavedChanges}
          canUndo={canUndo}
          onUndo={handleUndo}
          onSave={handleSaveAll}
          onAddSection={handleAddNewSection}
        />

        {/* ── CANVAS DERECHO (WYSIWYG) ─────────────────────────── */}
        <main className="flex-1 h-full overflow-y-auto bg-stone-50 flex flex-col">

          {/* Barra de título del canvas */}
          <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-stone-200 px-8 py-3.5 flex items-center gap-3 shadow-xs shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-[#d4af37]">
              Vista previa en vivo
            </span>
            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200/40">
              Escritorio (Ancho Completo Real)
            </span>

            {/* Botón Deshacer en el Canvas Header */}
            <button
              onClick={handleUndo}
              disabled={!canUndo}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ml-4 ${
                canUndo
                  ? 'bg-white hover:bg-stone-50 text-stone-700 hover:text-stone-900 border-stone-200 shadow-xs active:scale-95'
                  : 'bg-stone-50 text-stone-300 border-stone-200/50 cursor-not-allowed opacity-50'
              }`}
              title="Deshacer cambio (Ctrl + Z)"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
              </svg>
              <span>Deshacer</span>
              <kbd className="text-[9px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded border border-stone-200">
                Ctrl+Z
              </kbd>
            </button>

            {/* Indicador de Autoguardado en Tiempo Real */}
            <div className="flex items-center gap-2 ml-3">
              {saving ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping inline-block" />
                  Guardando cambios...
                </span>
              ) : hasUnsavedChanges ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md border border-stone-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                  Cambios pendientes
                </span>
              ) : lastSavedAt ? (
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  Guardado {lastSavedAt}
                </span>
              ) : null}
            </div>

            <div className="ml-auto flex gap-1.5 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
            </div>
          </div>

          {/* Contenedor del lienzo Full Width real (idéntico a la web pública) */}
          <div className="flex-1 overflow-y-auto w-full flex flex-col bg-white">
            <div className="w-full flex-1 flex flex-col relative min-h-[85vh]">
              
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
                <div className="w-full flex-1 flex flex-col">
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
                      onCloneBlock={handleCloneBlock}
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
          {activeId ? (() => {
            const isLibrary = activeId.startsWith('library-');
            const blockType = isLibrary ? activeId.replace('library-', '') : (activeBlock?.block_type || '');
            const blockDef = getBlockDefinition(blockType);
            const blockIcon = getBlockIcon(blockType);
            const blockLabel = blockDef?.label || activeBlock?.block_type?.replace(/_/g, ' ') || 'Bloque';
            const displayTitle = isLibrary
              ? blockLabel
              : (activeBlock?.content_data?.heading || activeBlock?.content_data?.title || activeBlock?.content_data?.quote || blockLabel);

            return (
              <div className="bg-white/95 backdrop-blur-md border-2 border-[#d4af37] rounded-2xl shadow-[0_20px_50px_rgba(212,175,55,0.22)] p-3.5 max-w-[260px] flex items-center gap-3 select-none pointer-events-none opacity-95 rotate-2 scale-105 transition-transform">
                <div className="w-10 h-10 bg-amber-50 rounded-xl border border-amber-200/80 flex items-center justify-center text-[#d4af37] shrink-0 shadow-2xs">
                  {blockIcon}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[9px] font-black uppercase tracking-wider text-[#d4af37] block">
                    {isLibrary ? 'Nuevo Bloque' : 'Moviendo Bloque'}
                  </span>
                  <span className="text-xs font-bold font-serif text-stone-900 block truncate mt-0.5">
                    {displayTitle}
                  </span>
                </div>
              </div>
            );
          })() : null}
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
