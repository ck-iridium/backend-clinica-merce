"use client";

import { useState, useRef, useCallback, type MutableRefObject, type Dispatch, type SetStateAction } from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { toast } from 'sonner';
import type { AtomicBlock, BlockType, SectionBlock } from '../types';
import { defaultContent } from '../utils/defaultContent';

interface UseBuilderDnDProps {
  sections: SectionBlock[];
  sectionsRef: MutableRefObject<SectionBlock[]>;
  setSections: Dispatch<SetStateAction<SectionBlock[]>>;
  dbCategories: any[];
  recordHistory: () => void;
  setHistory: Dispatch<SetStateAction<SectionBlock[][]>>;
  saveSectionToBackend: (section: SectionBlock) => void;
}

export function useBuilderDnD({
  sections,
  sectionsRef,
  setSections,
  dbCategories,
  recordHistory,
  setHistory,
  saveSectionToBackend,
}: UseBuilderDnDProps) {
  const [activeBlock, setActiveBlock] = useState<AtomicBlock | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const snapshotBeforeDragRef = useRef<SectionBlock[] | null>(null);

  // DnD sensors (8px activation = diferencia intencional de click)
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // Helpers para localizar sección/columna de un bloque
  const findContainer = useCallback(
    (blockId: string): { sectionId: string; columnId: string } | null => {
      for (const sec of sections) {
        for (const col of sec.content_data.columns) {
          if (col.id === blockId) return { sectionId: sec.id, columnId: col.id };
          if (col.blocks.some(b => b.id === blockId)) {
            return { sectionId: sec.id, columnId: col.id };
          }
        }
      }
      return null;
    },
    [sections]
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);
    // Tomar snapshot de sections antes de cualquier movimiento
    snapshotBeforeDragRef.current = JSON.parse(JSON.stringify(sections));

    if (!id.startsWith('library-')) {
      // Buscar el bloque real para el DragOverlay
      for (const sec of sections) {
        for (const col of sec.content_data.columns) {
          const found = col.blocks.find(b => b.id === id);
          if (found) {
            setActiveBlock(found);
            return;
          }
        }
      }
    }
  };

  /**
   * onDragOver: Actualización OPTIMISTA del estado mientras el usuario arrastra.
   * Clave para que el DnD entre columnas funcione correctamente.
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const currentActiveId = active.id as string;
    const currentOverId = over.id as string;

    // Los elementos del sidebar no participan en la vista previa cross-column
    if (currentActiveId.startsWith('library-')) return;

    const sourceContainer = findContainer(currentActiveId);
    const destContainer = findContainer(currentOverId);

    if (!sourceContainer || !destContainer) return;
    if (sourceContainer.columnId === destContainer.columnId) return;

    // Mover el bloque de columna origen a columna destino optimistamente
    setSections(prev => {
      let movingBlock: AtomicBlock | null = null;

      const afterRemove = prev.map(sec => ({
        ...sec,
        content_data: {
          ...sec.content_data,
          columns: sec.content_data.columns.map(col => {
            if (col.id !== sourceContainer.columnId) return col;
            const block = col.blocks.find(b => b.id === currentActiveId);
            if (block) movingBlock = block;
            return { ...col, blocks: col.blocks.filter(b => b.id !== currentActiveId) };
          }),
        },
      }));

      if (!movingBlock) return prev;

      return afterRemove.map(sec => ({
        ...sec,
        content_data: {
          ...sec.content_data,
          columns: sec.content_data.columns.map(col => {
            if (col.id !== destContainer.columnId) return col;
            const overIndex = col.blocks.findIndex(b => b.id === currentOverId);
            const newBlocks = [...col.blocks];
            if (overIndex === -1) {
              newBlocks.push(movingBlock!);
            } else {
              newBlocks.splice(overIndex, 0, movingBlock!);
            }
            return { ...col, blocks: newBlocks };
          }),
        },
      }));
    });
  };

  /**
   * onDragEnd: Finalización del drag.
   * - Si viene del sidebar: crear bloque nuevo en columna destino.
   * - Si es reordenamiento dentro de la MISMA columna: usar arrayMove.
   * - Si es cross-column: el estado ya fue actualizado en onDragOver, solo persistir.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveBlock(null);

    const activeIdStr = active.id as string;
    const overIdStr = over?.id as string | undefined;

    // Si se suelta fuera de cualquier target droppable, cancelar y restaurar si venía del canvas
    if (!over || !overIdStr) {
      if (snapshotBeforeDragRef.current && !activeIdStr.startsWith('library-')) {
        setSections(snapshotBeforeDragRef.current);
      }
      snapshotBeforeDragRef.current = null;
      return;
    }

    // ── CASO A: Bloque de la biblioteca lateral ──────────────────
    if (activeIdStr.startsWith('library-')) {
      const blockType = activeIdStr.replace('library-', '');
      const destContainer = findContainer(overIdStr);
      if (!destContainer) {
        snapshotBeforeDragRef.current = null;
        return;
      }

      // Guardar en el historial antes de insertar
      recordHistory();
      snapshotBeforeDragRef.current = null;

      const newBlock: AtomicBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        block_type: blockType as BlockType,
        content_data: defaultContent(blockType, dbCategories),
      };

      setSections(prev => {
        const updated = prev.map(sec => {
          if (sec.id !== destContainer.sectionId) return sec;
          return {
            ...sec,
            content_data: {
              ...sec.content_data,
              columns: sec.content_data.columns.map(col => {
                if (col.id !== destContainer.columnId) return col;
                const currentBlocks = [...col.blocks];
                const insertAt = currentBlocks.findIndex(b => b.id === overIdStr);
                if (insertAt === -1) currentBlocks.push(newBlock);
                else currentBlocks.splice(insertAt, 0, newBlock);
                return { ...col, blocks: currentBlocks };
              }),
            },
          };
        });
        sectionsRef.current = updated;
        const sec = updated.find(s => s.id === destContainer.sectionId);
        if (sec) saveSectionToBackend(sec);
        return updated;
      });

      toast.success('Bloque añadido desde la biblioteca');
      return;
    }

    // ── CASO B: Reordenamiento dentro de la MISMA columna ────────
    const sourceContainer = findContainer(activeIdStr);
    const destContainer = findContainer(overIdStr);

    if (!sourceContainer || !destContainer) {
      if (snapshotBeforeDragRef.current) {
        setSections(snapshotBeforeDragRef.current);
      }
      snapshotBeforeDragRef.current = null;
      return;
    }

    if (sourceContainer.columnId === destContainer.columnId) {
      let moved = false;
      setSections(prev => {
        const updated = prev.map(sec => {
          if (sec.id !== sourceContainer.sectionId) return sec;
          return {
            ...sec,
            content_data: {
              ...sec.content_data,
              columns: sec.content_data.columns.map(col => {
                if (col.id !== sourceContainer.columnId) return col;
                const oldIdx = col.blocks.findIndex(b => b.id === activeIdStr);
                const newIdx = col.blocks.findIndex(b => b.id === overIdStr);
                if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return col;
                moved = true;
                return { ...col, blocks: arrayMove(col.blocks, oldIdx, newIdx) };
              }),
            },
          };
        });
        const sec = updated.find(s => s.id === sourceContainer.sectionId);
        if (sec && moved) saveSectionToBackend(sec);
        return updated;
      });

      if (moved && snapshotBeforeDragRef.current) {
        setHistory(prev => {
          const next = [...prev, snapshotBeforeDragRef.current!];
          return next.length > 30 ? next.slice(next.length - 30) : next;
        });
      }
      snapshotBeforeDragRef.current = null;
      return;
    }

    // ── CASO C: Cross-column — el estado ya se actualizó en onDragOver
    if (snapshotBeforeDragRef.current) {
      setHistory(prev => {
        const next = [...prev, snapshotBeforeDragRef.current!];
        return next.length > 30 ? next.slice(next.length - 30) : next;
      });
      snapshotBeforeDragRef.current = null;
    }

    const affectedIds = new Set([sourceContainer.sectionId, destContainer.sectionId]);
    sections.forEach(sec => {
      if (affectedIds.has(sec.id)) saveSectionToBackend(sec);
    });
  };

  return {
    sensors,
    activeId,
    activeBlock,
    findContainer,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
  };
}
