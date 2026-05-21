"use client";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { toast } from 'sonner';
import {
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

// ── Tipos ────────────────────────────────────────────────────────────
export type BlockType =
  | 'atomic_title' | 'atomic_text' | 'atomic_image' | 'atomic_button'
  | 'atomic_category' | 'title_heading' | 'text_image_cta' | 'hero';

export interface AtomicBlock {
  id: string;
  block_type: BlockType;
  content_data: Record<string, any>;
}

export interface ColumnStructure {
  id: string;
  width: string;
  blocks: AtomicBlock[];
}

export interface SectionStructure {
  id: string;
  columns_count: number;
  py_spacing?: string;
  bg_color?: string;
  vertical_alignment?: string;
  columns: ColumnStructure[];
}

export interface SectionBlock {
  id: string;
  block_type: 'section';
  content_data: SectionStructure;
  order_index: number;
}

// Plantillas de contenido por tipo de bloque
function defaultContent(blockType: string, dbCategories: any[]): Record<string, any> {
  switch (blockType) {
    case 'hero':
      return { image_url: '', heading: 'Descubre tu mejor versión', subheading: 'Tratamientos estéticos avanzados.', cta_text: 'Reservar cita', cta_url: '/reservar' };
    case 'title_heading':
      return { title: 'Nuevo Título', title_tag: 'h2', alignment: 'center', show_divider: true };
    case 'atomic_text':
      return { html: '<p>Escribe aquí tu párrafo...</p>' };
    case 'atomic_image':
      return { image_url: '', caption: '', alignment: 'center', max_width: '800px' };
    case 'text_image_cta':
      return { title: 'Contenido', description: 'Párrafo descriptivo.', image_url: '', image_position: 'left' };
    case 'atomic_button':
      return { text: 'Acción', url: '#', style: 'gold_solid', alignment: 'center' };
    case 'atomic_category':
      return { category_id: dbCategories[0]?.id || '', selected_treatment_ids: [], layout: 'grid', max_items: 4 };
    default:
      return {};
  }
}

// ─────────────────────────────────────────────────────────────────────
const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export function usePageBuilder(slug: string | string[]) {
  const { showFeedback } = useFeedback();
  const saveTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});

  // ── Estado principal ────────────────────────────────────────────
  const [pageTitle, setPageTitle] = useState('');
  const [sections, setSections] = useState<SectionBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ── Business data ───────────────────────────────────────────────
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);

  // ── DnD state ──────────────────────────────────────────────────
  // Guardamos el bloque activo completo para el DragOverlay
  const [activeBlock, setActiveBlock] = useState<AtomicBlock | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  // ── Block editing ───────────────────────────────────────────────
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [savingBlock, setSavingBlock] = useState(false);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // ── Gallery picker ──────────────────────────────────────────────
  const [showGallery, setShowGallery] = useState(false);
  const [galleryField, setGalleryField] = useState<string | null>(null);
  const [galleryMediaType, setGalleryMediaType] = useState<'image' | 'video' | 'all'>('image');

  // ── Modal "add block" ───────────────────────────────────────────
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetLocation, setTargetLocation] = useState<{ sectionId: string; columnId: string } | null>(null);

  // ── DnD sensors (8px activation = diferencia intencional de click) ──
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  // ── Helpers para localizar sección/columna de un bloque ────────
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

  // ── Inicialización ──────────────────────────────────────────────
  useEffect(() => {
    if (!slug) return;
    fetchPageDetails();
    fetchBlocks();
    fetchBusinessData();
  }, [slug]);

  const fetchPageDetails = async () => {
    try {
      const res = await fetch(`${API}/cms/navigation`);
      if (res.ok) {
        const items = await res.json();
        const page = items.find((i: any) => i.path === `/${slug}` && i.is_custom);
        setPageTitle(page?.label ?? (Array.isArray(slug) ? slug[0] : slug));
      }
    } catch {
      setPageTitle(Array.isArray(slug) ? slug[0] : slug);
    }
  };

  const fetchBusinessData = async () => {
    try {
      const [resCat, resSvc] = await Promise.all([
        fetch(`${API}/service-categories/`),
        fetch(`${API}/services/`),
      ]);
      if (resCat.ok) setDbCategories(await resCat.json());
      if (resSvc.ok) setDbServices(await resSvc.json());
    } catch { /* silencioso */ }
  };

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/cms/blocks/${slug}`);
      if (res.ok) {
        const data = await res.json();
        const normalized = data.map((block: any, idx: number): SectionBlock => {
          if (block.block_type === 'section') return block;
          return {
            id: block.id,
            block_type: 'section',
            order_index: block.order_index ?? idx,
            content_data: {
              id: block.id,
              columns_count: 1,
              py_spacing: 'py-24',
              bg_color: 'cream',
              columns: [{
                id: `col-${block.id}-0`,
                width: 'w-full',
                blocks: [{ id: `atomic-${block.id}`, block_type: block.block_type, content_data: block.content_data }]
              }]
            }
          };
        });
        setSections(normalized);
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudieron cargar los bloques.' });
    } finally {
      setLoading(false);
    }
  };

  // ── Persistencia con debounce por sección ──────────────────────
  const saveSectionToBackend = useCallback((section: SectionBlock) => {
    const sectionId = section.id;
    if (saveTimeoutRef.current[sectionId]) {
      clearTimeout(saveTimeoutRef.current[sectionId]);
    }
    saveTimeoutRef.current[sectionId] = setTimeout(async () => {
      try {
        const res = await fetch(`${API}/cms/blocks/${sectionId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ block_type: 'section', content_data: section.content_data }),
        });
        if (!res.ok) throw new Error();
      } catch {
        toast.error('Error al sincronizar sección con Supabase');
      }
    }, 800);
  }, []);

  // ── Guardado manual de todo el estado (botón "Guardar") ────────
  const handleSaveAll = async () => {
    setSaving(true);
    try {
      await Promise.all(
        sections.map(sec =>
          fetch(`${API}/cms/blocks/${sec.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ block_type: 'section', content_data: sec.content_data }),
          })
        )
      );
      toast.success('¡Página guardada correctamente!');
    } catch {
      toast.error('Error al guardar la página');
    } finally {
      setSaving(false);
    }
  };

  // ── Secciones ──────────────────────────────────────────────────
  const handleAddNewSection = async () => {
    const newId = `sec-${Date.now()}`;
    const defaultStructure: SectionStructure = {
      id: newId,
      columns_count: 1,
      py_spacing: 'py-24',
      bg_color: 'cream',
      columns: [{ id: `col-${newId}-0`, width: 'w-full', blocks: [] }],
    };
    try {
      const res = await fetch(`${API}/cms/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page_slug: slug, block_type: 'section', content_data: defaultStructure }),
      });
      if (res.ok) {
        toast.success('Sección añadida');
        fetchBlocks();
      }
    } catch {
      toast.error('Error al crear sección');
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      const res = await fetch(`${API}/cms/blocks/${sectionId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Sección eliminada');
        setSections(prev => prev.filter(s => s.id !== sectionId));
      }
    } catch {
      toast.error('No se pudo eliminar la sección');
    }
  };

  const handleReorderSections = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= sections.length) return;
    const list = [...sections];
    [list[index], list[target]] = [list[target], list[index]];
    const payload = list.map((b, i) => ({ ...b, order_index: i }));
    setSections(payload);
    fetch(`${API}/cms/blocks/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: payload.map(b => b.id) }),
    }).catch(() => toast.error('Error al reordenar'));
  };

  const handleUpdateSectionLayout = (sectionId: string, columnsCount: number) => {
    const updated = sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      const current = sec.content_data.columns;
      const newCols: ColumnStructure[] = Array.from({ length: columnsCount }, (_, i) => {
        if (current[i]) return current[i];
        return {
          id: `col-${sectionId}-${i}`,
          width: columnsCount === 2 ? 'w-1/2' : columnsCount === 3 ? 'w-1/3' : columnsCount === 4 ? 'w-1/4' : 'w-full',
          blocks: [],
        };
      });
      // Si reducimos columnas, rescatamos bloques al primero
      if (current.length > columnsCount) {
        const orphans = current.slice(columnsCount).flatMap(c => c.blocks);
        if (orphans.length) newCols[0].blocks = [...newCols[0].blocks, ...orphans];
      }
      return { ...sec, content_data: { ...sec.content_data, columns_count: columnsCount, columns: newCols } };
    });
    setSections(updated);
    const sec = updated.find(s => s.id === sectionId);
    if (sec) saveSectionToBackend(sec);
  };

  const handleUpdateSectionMetadata = (sectionId: string, key: string, value: any) => {
    const updated = sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      return { ...sec, content_data: { ...sec.content_data, [key]: value } };
    });
    setSections(updated);
    const sec = updated.find(s => s.id === sectionId);
    if (sec) saveSectionToBackend(sec);
  };

  // ── Bloques ────────────────────────────────────────────────────
  const handleAddBlockToColumn = async (blockType: string, sectionId: string, columnId: string) => {
    const newBlock: AtomicBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      block_type: blockType as BlockType,
      content_data: defaultContent(blockType, dbCategories),
    };
    const updated = sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        content_data: {
          ...sec.content_data,
          columns: sec.content_data.columns.map(col =>
            col.id === columnId ? { ...col, blocks: [...col.blocks, newBlock] } : col
          ),
        },
      };
    });
    setSections(updated);
    const sec = updated.find(s => s.id === sectionId);
    if (sec) saveSectionToBackend(sec);
    setShowAddModal(false);
  };

  const handleDeleteBlockFromColumn = (blockId: string, sectionId: string, columnId: string) => {
    const updated = sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      return {
        ...sec,
        content_data: {
          ...sec.content_data,
          columns: sec.content_data.columns.map(col =>
            col.id === columnId ? { ...col, blocks: col.blocks.filter(b => b.id !== blockId) } : col
          ),
        },
      };
    });
    setSections(updated);
    const sec = updated.find(s => s.id === sectionId);
    if (sec) saveSectionToBackend(sec);
  };

  const handleStartEditBlock = (block: any) => {
    setEditingBlock(block);
    setEditFormData({ ...block.content_data });
  };

  const handleSaveBlockEdit = async () => {
    if (!editingBlock) return;
    setSavingBlock(true);
    const updated = sections.map(sec => ({
      ...sec,
      content_data: {
        ...sec.content_data,
        columns: sec.content_data.columns.map(col => ({
          ...col,
          blocks: col.blocks.map(b =>
            b.id === editingBlock.id ? { ...b, content_data: editFormData } : b
          ),
        })),
      },
    }));
    setSections(updated);
    const affectedSec = updated.find(s =>
      s.content_data.columns.some(c => c.blocks.some(b => b.id === editingBlock.id))
    );
    if (affectedSec) {
      await fetch(`${API}/cms/blocks/${affectedSec.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ block_type: 'section', content_data: affectedSec.content_data }),
      });
    }
    setSavingBlock(false);
    setEditingBlock(null);
    toast.success('Bloque actualizado');
  };

  const handleOpenAddBlockForColumn = (sectionId: string, columnId: string) => {
    setTargetLocation({ sectionId, columnId });
    setShowAddModal(true);
  };

  // ── Gallery ────────────────────────────────────────────────────
  const openGalleryFor = (field: string, mediaType: 'image' | 'video' | 'all' = 'image') => {
    setGalleryField(field);
    setGalleryMediaType(mediaType);
    setShowGallery(true);
  };

  const handleImageSelected = (url: string) => {
    setEditFormData(prev => ({ ...prev, image_url: url }));
    setShowGallery(false);
    setGalleryField(null);
  };

  // ── DnD handlers ───────────────────────────────────────────────
  const handleDragStart = (event: DragStartEvent) => {
    const id = event.active.id as string;
    setActiveId(id);

    if (!id.startsWith('library-')) {
      // Buscar el bloque real para el DragOverlay
      for (const sec of sections) {
        for (const col of sec.content_data.columns) {
          const found = col.blocks.find(b => b.id === id);
          if (found) { setActiveBlock(found); return; }
        }
      }
    }
  };

  /**
   * onDragOver: Actualización OPTIMISTA del estado mientras el usuario arrastra.
   * Esta es la clave para que el DnD entre columnas funcione correctamente.
   * Sin esto, al soltar dnd-kit no sabe en qué lista está el elemento.
   */
  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Los elementos del sidebar no participan en la vista previa cross-column
    if (activeId.startsWith('library-')) return;

    const sourceContainer = findContainer(activeId);
    const destContainer = findContainer(overId);

    if (!sourceContainer || !destContainer) return;
    if (sourceContainer.columnId === destContainer.columnId) return; // mismo contenedor: SortableContext lo maneja

    // Mover el bloque de columna origen a columna destino optimistamente
    setSections(prev => {
      let movingBlock: AtomicBlock | null = null;

      const afterRemove = prev.map(sec => ({
        ...sec,
        content_data: {
          ...sec.content_data,
          columns: sec.content_data.columns.map(col => {
            if (col.id !== sourceContainer.columnId) return col;
            const block = col.blocks.find(b => b.id === activeId);
            if (block) movingBlock = block;
            return { ...col, blocks: col.blocks.filter(b => b.id !== activeId) };
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
            // Insertar antes del elemento sobre el que estamos
            const overIndex = col.blocks.findIndex(b => b.id === overId);
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
   * - Si es cross-column: el estado ya fue actualizado en onDragOver,
   *   solo necesitamos persistir.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveBlock(null);
    if (!over) return;

    const activeIdStr = active.id as string;
    const overIdStr = over.id as string;

    // ── CASO A: Bloque de la biblioteca lateral ──────────────────
    if (activeIdStr.startsWith('library-')) {
      const blockType = activeIdStr.replace('library-', '');
      const destContainer = findContainer(overIdStr);
      if (!destContainer) return;

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

    if (!sourceContainer || !destContainer) return;

    if (sourceContainer.columnId === destContainer.columnId) {
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
                if (oldIdx === -1 || newIdx === -1) return col;
                return { ...col, blocks: arrayMove(col.blocks, oldIdx, newIdx) };
              }),
            },
          };
        });
        const sec = updated.find(s => s.id === sourceContainer.sectionId);
        if (sec) saveSectionToBackend(sec);
        return updated;
      });
      return;
    }

    // ── CASO C: Cross-column — el estado ya se actualizó en onDragOver
    // Solo necesitamos persistir ambas secciones afectadas
    const affectedIds = new Set([sourceContainer.sectionId, destContainer.sectionId]);
    sections.forEach(sec => {
      if (affectedIds.has(sec.id)) saveSectionToBackend(sec);
    });
  };

  return {
    // State
    pageTitle,
    sections,
    loading,
    saving,
    dbCategories,
    dbServices,
    activeId,
    activeBlock,
    // DnD
    sensors,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    // Sections
    handleAddNewSection,
    handleDeleteSection,
    handleReorderSections,
    handleUpdateSectionLayout,
    handleUpdateSectionMetadata,
    handleSaveAll,
    // Blocks
    handleAddBlockToColumn,
    handleDeleteBlockFromColumn,
    handleStartEditBlock,
    handleSaveBlockEdit,
    handleOpenAddBlockForColumn,
    // Modal "add block"
    showAddModal,
    setShowAddModal,
    targetLocation,
    // Block editor
    editingBlock,
    setEditingBlock,
    savingBlock,
    editFormData,
    setEditFormData,
    // Gallery
    showGallery,
    setShowGallery,
    galleryMediaType,
    openGalleryFor,
    handleImageSelected,
  };
}
