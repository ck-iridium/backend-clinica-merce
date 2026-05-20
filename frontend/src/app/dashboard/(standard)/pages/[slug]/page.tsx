"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import MediaPickerModal from '@/components/MediaPickerModal';
import { toast } from 'sonner';

// Primitives de DND-Kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';

// Componentes modulares importados
import BlockList from './components/BlockList';
import AddBlockModal from './components/AddBlockModal';
import BlockEditorModal from './components/BlockEditorModal';

interface AtomicBlock {
  id: string;
  block_type: 'atomic_title' | 'atomic_text' | 'atomic_image' | 'atomic_button' | 'atomic_category' | 'title_heading' | 'text_image_cta';
  content_data: Record<string, any>;
}

interface ColumnStructure {
  id: string;
  width: string;
  blocks: AtomicBlock[];
}

interface SectionStructure {
  id: string;
  columns_count: number;
  py_spacing?: string;
  bg_color?: string;
  columns: ColumnStructure[];
}

interface SectionBlock {
  id: string;
  block_type: 'section';
  content_data: SectionStructure;
  order_index: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CustomPageEditor() {
  const { slug } = useParams();
  const { showFeedback } = useFeedback();

  const [pageTitle, setPageTitle] = useState<string>('');
  const [sections, setSections] = useState<SectionBlock[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);

  // Estados para modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [targetLocation, setTargetLocation] = useState<{ sectionId: string; columnId: string } | null>(null);

  // Datos del negocio para atomic_category
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);

  // Edición de bloque activo
  const [editingBlock, setEditingBlock] = useState<any>(null);
  const [savingBlock, setSavingBlock] = useState(false);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Galería de selección de archivos
  const [showGallery, setShowGallery] = useState(false);
  const [galleryField, setGalleryField] = useState<'text_image_cta_image' | 'atomic_image_image' | null>(null);

  // Sensores de Dnd-Kit (PointerSensor optimizado)
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Previene arrastres accidentales al hacer clic
      },
    })
  );

  useEffect(() => {
    if (slug) {
      fetchPageDetails();
      fetchBlocks();
    }
    fetchBusinessData();
  }, [slug]);

  // Carga los detalles de la página (título real) desde el menú de navegación
  const fetchPageDetails = async () => {
    try {
      const res = await fetch(`${API}/cms/navigation`);
      if (res.ok) {
        const items = await res.json();
        const currentPage = items.find((item: any) => item.path === `/${slug}` && item.is_custom);
        if (currentPage) {
          setPageTitle(currentPage.label);
        } else {
          setPageTitle(slug as string);
        }
      }
    } catch {
      setPageTitle(slug as string);
    }
  };

  // Carga las categorías y tratamientos de la clínica
  const fetchBusinessData = async () => {
    try {
      const [resCat, resSvc] = await Promise.all([
        fetch(`${API}/service-categories/`),
        fetch(`${API}/services/`)
      ]);
      if (resCat.ok) setDbCategories(await resCat.json());
      if (resSvc.ok) setDbServices(await resSvc.json());
    } catch (err) {
      console.error("Error cargando servicios/categorías:", err);
    }
  };

  // Carga los bloques de la página y los normaliza a secciones
  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/cms/blocks/${slug}`);
      if (res.ok) {
        const data = await res.json();
        // Normalización defensiva para páginas antiguas o planas
        const normalized = data.map((block: any, idx: number) => {
          if (block.block_type === 'section') {
            return block;
          } else {
            // Envolvemos el bloque plano antiguo en una sección virtual con id idéntico
            return {
              id: block.id,
              page_slug: slug,
              block_type: 'section',
              order_index: block.order_index ?? idx,
              content_data: {
                id: block.id,
                columns_count: 1,
                py_spacing: 'py-24',
                bg_color: 'cream',
                columns: [
                  {
                    id: `col-${block.id}-0`,
                    width: 'w-full',
                    blocks: [
                      {
                        id: `atomic-${block.id}`,
                        block_type: block.block_type.startsWith('atomic_') 
                          ? block.block_type 
                          : `atomic_${block.block_type}`,
                        content_data: block.content_data
                      }
                    ]
                  }
                ]
              }
            };
          }
        });
        setSections(normalized);
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudieron cargar los bloques de esta página.' });
    } finally {
      setLoading(false);
    }
  };

  // Añade una nueva Sección vacía
  const handleAddNewSection = async () => {
    const defaultStructure: SectionStructure = {
      id: `sec-${Date.now()}`,
      columns_count: 1,
      py_spacing: 'py-24',
      bg_color: 'cream',
      columns: [
        {
          id: `col-${Date.now()}-0`,
          width: 'w-full',
          blocks: []
        }
      ]
    };

    try {
      const res = await fetch(`${API}/cms/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_slug: slug,
          block_type: 'section',
          content_data: defaultStructure
        })
      });

      if (res.ok) {
        toast.success('Sección añadida correctamente');
        fetchBlocks();
      } else {
        throw new Error();
      }
    } catch {
      toast.error('Error al crear la sección');
    }
  };

  // Elimina una sección completa
  const handleDeleteSection = async (sectionId: string) => {
    try {
      const res = await fetch(`${API}/cms/blocks/${sectionId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success('Sección eliminada');
        setSections(prev => prev.filter(s => s.id !== sectionId));
      } else {
        throw new Error();
      }
    } catch {
      toast.error('No se pudo eliminar la sección');
    }
  };

  // Reordena secciones completas mediante flechas
  const handleReorderSections = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const list = [...sections];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const payload = list.map((b, idx) => ({ ...b, order_index: idx }));
    setSections(payload);

    try {
      const res = await fetch(`${API}/cms/blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: payload.map(b => b.id) })
      });
      if (res.ok) {
        toast.success('Orden de las secciones guardado');
      } else {
        throw new Error();
      }
    } catch {
      toast.error('No se pudo sincronizar el orden de las secciones');
      fetchBlocks(); 
    }
  };

  // Actualiza la estructura de columnas de una sección
  const handleUpdateSectionLayout = async (sectionId: string, columnsCount: number) => {
    const updatedSections = sections.map(sec => {
      if (sec.id !== sectionId) return sec;

      const struct = sec.content_data;
      const currentCols = struct.columns || [];
      const newCols: ColumnStructure[] = [];

      for (let i = 0; i < columnsCount; i++) {
        if (currentCols[i]) {
          newCols.push(currentCols[i]);
        } else {
          newCols.push({
            id: `col-${sec.id}-${i}`,
            width: columnsCount === 2 ? 'w-1/2' : columnsCount === 3 ? 'w-1/3' : columnsCount === 4 ? 'w-1/4' : 'w-full',
            blocks: []
          });
        }
      }

      // Si reducimos columnas, movemos los bloques de las columnas eliminadas a la primera columna
      if (currentCols.length > columnsCount) {
        const extraBlocks = currentCols.slice(columnsCount).flatMap(col => col.blocks || []);
        if (newCols[0] && extraBlocks.length > 0) {
          newCols[0].blocks = [...(newCols[0].blocks || []), ...extraBlocks];
        }
      }

      return {
        ...sec,
        content_data: {
          ...struct,
          columns_count: columnsCount,
          columns: newCols
        }
      };
    });

    setSections(updatedSections);
    const targetSection = updatedSections.find(s => s.id === sectionId);
    if (targetSection) {
      saveSectionToBackend(targetSection);
    }
  };

  // Guarda asíncronamente una sección específica en el backend
  const saveSectionToBackend = async (section: SectionBlock) => {
    const promise = fetch(`${API}/cms/blocks/${section.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        block_type: 'section',
        content_data: section.content_data
      })
    });

    toast.promise(promise, {
      loading: 'Guardando cambios estructurales...',
      success: 'Sección sincronizada',
      error: 'Error al sincronizar con Supabase'
    });
  };

  // Abre el modal para añadir un bloque atómico en una columna específica
  const handleOpenAddBlockForColumn = (sectionId: string, columnId: string) => {
    setTargetLocation({ sectionId, columnId });
    setShowAddModal(true);
  };

  // Añade un bloque atómico a una columna de una sección
  const handleAddBlockToColumn = async (type: 'title_heading' | 'text_image_cta' | 'atomic_image' | 'atomic_category') => {
    if (!targetLocation) return;
    setAdding(true);

    let defaultContent = {};
    const normalizedType = type.startsWith('atomic_') ? type : `atomic_${type}`;

    if (type === 'title_heading') {
      defaultContent = {
        title: 'Nuevo Título Atómico',
        title_tag: 'h2',
        alignment: 'center'
      };
    } else if (type === 'text_image_cta') {
      defaultContent = {
        title: 'Contenido Atómico',
        description: 'Escribe aquí un párrafo persuasivo.',
        image_url: '',
        image_position: 'left'
      };
    } else if (type === 'atomic_image') {
      defaultContent = {
        image_url: '',
        caption: 'Pie de foto',
        alignment: 'center',
        max_width: '800px'
      };
    } else if (type === 'atomic_category') {
      defaultContent = {
        category_id: dbCategories[0]?.id || '',
        selected_treatment_ids: [],
        layout: 'grid',
        max_items: 4
      };
    }

    const newBlock = {
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      block_type: normalizedType,
      content_data: defaultContent
    };

    const updatedSections = sections.map(sec => {
      if (sec.id !== targetLocation.sectionId) return sec;
      const struct = sec.content_data;
      const updatedCols = struct.columns.map(col => {
        if (col.id !== targetLocation.columnId) return col;
        return {
          ...col,
          blocks: [...(col.blocks || []), newBlock as any]
        };
      });
      return {
        ...sec,
        content_data: { ...struct, columns: updatedCols }
      };
    });

    setSections(updatedSections);
    setShowAddModal(false);
    setTargetLocation(null);
    setAdding(false);

    const updatedSec = updatedSections.find(s => s.id === targetLocation.sectionId);
    if (updatedSec) {
      saveSectionToBackend(updatedSec);
    }
  };

  // Abre el modal de edición para un bloque atómico
  const handleStartEditBlock = (block: any, sectionId: string, columnId: string) => {
    setEditingBlock({ ...block, sectionId, columnId });
    setEditFormData({ ...block.content_data });
  };

  // Guarda las propiedades editadas de un bloque atómico
  const handleSaveBlockEdit = async () => {
    if (!editingBlock) return;
    setSavingBlock(true);

    const updatedSections = sections.map(sec => {
      if (sec.id !== editingBlock.sectionId) return sec;
      const struct = sec.content_data;
      const updatedCols = struct.columns.map(col => {
        if (col.id !== editingBlock.columnId) return col;
        const updatedBlocks = col.blocks.map(b => {
          if (b.id !== editingBlock.id) return b;
          return {
            ...b,
            content_data: editFormData
          };
        });
        return { ...col, blocks: updatedBlocks };
      });
      return {
        ...sec,
        content_data: { ...struct, columns: updatedCols }
      };
    });

    setSections(updatedSections);
    setEditingBlock(null);
    setSavingBlock(false);

    const updatedSec = updatedSections.find(s => s.id === editingBlock.sectionId);
    if (updatedSec) {
      saveSectionToBackend(updatedSec);
    }
  };

  // Elimina un bloque atómico de una columna
  const handleDeleteBlockFromColumn = async (blockId: string, sectionId: string, columnId: string) => {
    const updatedSections = sections.map(sec => {
      if (sec.id !== sectionId) return sec;
      const struct = sec.content_data;
      const updatedCols = struct.columns.map(col => {
        if (col.id !== columnId) return col;
        return {
          ...col,
          blocks: col.blocks.filter(b => b.id !== blockId)
        };
      });
      return {
        ...sec,
        content_data: { ...struct, columns: updatedCols }
      };
    });

    setSections(updatedSections);
    const updatedSec = updatedSections.find(s => s.id === sectionId);
    if (updatedSec) {
      saveSectionToBackend(updatedSec);
    }
  };

  // Maneja el evento de soltar un elemento del DND-Kit
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Buscar la sección y columna de origen
    let sourceSectionId = '';
    let sourceColumnId = '';
    let targetSectionId = '';
    let targetColumnId = '';
    let activeBlock: AtomicBlock | null = null;

    // 1. Encontrar bloque origen
    sections.forEach(sec => {
      sec.content_data.columns.forEach(col => {
        const found = col.blocks.find(b => b.id === activeId);
        if (found) {
          sourceSectionId = sec.id;
          sourceColumnId = col.id;
          activeBlock = found;
        }
      });
    });

    // 2. Encontrar destino (puede ser una columna o el ID de otro bloque)
    sections.forEach(sec => {
      sec.content_data.columns.forEach(col => {
        if (col.id === overId) {
          targetSectionId = sec.id;
          targetColumnId = col.id;
        } else {
          const found = col.blocks.find(b => b.id === overId);
          if (found) {
            targetSectionId = sec.id;
            targetColumnId = col.id;
          }
        }
      });
    });

    if (!activeBlock || !targetColumnId) return;

    // Si origen y destino son iguales, reordenamos en la misma columna
    const updatedSections = sections.map(sec => {
      const struct = sec.content_data;

      // Si es el mismo contenedor
      if (sec.id === sourceSectionId && sourceColumnId === targetColumnId) {
        const col = struct.columns.find(c => c.id === sourceColumnId);
        if (!col) return sec;

        const currentBlocks = [...col.blocks];
        const oldIndex = currentBlocks.findIndex(b => b.id === activeId);
        let newIndex = currentBlocks.findIndex(b => b.id === overId);

        if (newIndex === -1) newIndex = currentBlocks.length;

        currentBlocks.splice(oldIndex, 1);
        currentBlocks.splice(newIndex, 0, activeBlock!);

        const updatedCols = struct.columns.map(c => {
          if (c.id === sourceColumnId) {
            return { ...c, blocks: currentBlocks };
          }
          return c;
        });

        return {
          ...sec,
          content_data: { ...struct, columns: updatedCols }
        };
      }

      // Si cruzamos entre columnas
      let nextCols = struct.columns;
      let hasChanged = false;

      if (sec.id === sourceSectionId) {
        // Quitar de columna origen
        nextCols = nextCols.map(c => {
          if (c.id === sourceColumnId) {
            hasChanged = true;
            return { ...c, blocks: c.blocks.filter(b => b.id !== activeId) };
          }
          return c;
        });
      }

      if (sec.id === targetSectionId) {
        // Añadir a columna destino
        nextCols = nextCols.map(c => {
          if (c.id === targetColumnId) {
            hasChanged = true;
            const currentBlocks = [...c.blocks];
            let newIndex = currentBlocks.findIndex(b => b.id === overId);
            if (newIndex === -1) newIndex = currentBlocks.length;

            currentBlocks.splice(newIndex, 0, activeBlock!);
            return { ...c, blocks: currentBlocks };
          }
          return c;
        });
      }

      if (hasChanged) {
        return {
          ...sec,
          content_data: { ...struct, columns: nextCols }
        };
      }

      return sec;
    });

    setSections(updatedSections);

    // Sincronizar secciones afectadas
    const affectedSections = updatedSections.filter(
      s => s.id === sourceSectionId || s.id === targetSectionId
    );
    affectedSections.forEach(sec => saveSectionToBackend(sec));
  };

  // Manejar selección de imagen de galería
  const handleImageSelected = (url: string) => {
    setEditFormData(prev => ({ ...prev, image_url: url }));
    setShowGallery(false);
    setGalleryField(null);
  };

  const openGalleryFor = (field: 'text_image_cta_image' | 'atomic_image_image') => {
    setGalleryField(field);
    setShowGallery(true);
  };

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
        onClose={() => { setShowAddModal(false); setTargetLocation(null); }}
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
          onClose={() => { setShowGallery(false); setGalleryField(null); }}
          onImageSelected={handleImageSelected}
          mediaType="image"
        />
      )}

    </div>
  );
}
