"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import MediaPickerModal from '@/components/MediaPickerModal';

// Componentes modulares importados
import BlockList from './components/BlockList';
import AddBlockModal from './components/AddBlockModal';
import BlockEditorModal from './components/BlockEditorModal';

interface Block {
  id: string;
  block_type: 'title_heading' | 'text_image_cta' | 'atomic_image' | 'atomic_category';
  content_data: Record<string, any>;
  order_index: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CustomPageEditor() {
  const { slug } = useParams();
  const { showFeedback } = useFeedback();

  const [pageTitle, setPageTitle] = useState<string>('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Datos del negocio para atomic_category
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);

  // Edición de bloque activo
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [savingBlockId, setSavingBlockId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Record<string, any>>({});

  // Galería de selección de archivos
  const [showGallery, setShowGallery] = useState(false);
  const [galleryField, setGalleryField] = useState<'text_image_cta_image' | 'atomic_image_image' | null>(null);

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

  // Carga los bloques de la página
  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/cms/blocks/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setBlocks(data);
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudieron cargar los bloques de esta página.' });
    } finally {
      setLoading(false);
    }
  };

  // Añade un bloque al backend
  const handleAddBlock = async (type: 'title_heading' | 'text_image_cta' | 'atomic_image' | 'atomic_category') => {
    setAdding(true);
    let defaultContent = {};

    if (type === 'title_heading') {
      defaultContent = {
        title: 'Nuevo Título de Sección',
        subtitle: 'Añade una breve descripción o subtítulo para contextualizar el tema.',
        title_tag: 'h2',
        alignment: 'center',
        show_divider: true
      };
    } else if (type === 'text_image_cta') {
      defaultContent = {
        title: 'Sección Destacada de Contenido',
        description: 'Escribe aquí un párrafo persuasivo con el estilo de tu clínica. Este bloque cuenta con un diseño a dos columnas ideal para captar la atención.',
        image_url: '',
        image_position: 'left',
        cta_button: {
          text: 'Conocer más',
          url: '/services',
          style: 'gold_solid'
        }
      };
    } else if (type === 'atomic_image') {
      defaultContent = {
        image_url: '',
        caption: 'Escribe un pie de foto o descripción corta aquí.',
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

    try {
      const res = await fetch(`${API}/cms/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          page_slug: slug,
          block_type: type,
          content_data: defaultContent
        })
      });

      if (res.ok) {
        showFeedback({ type: 'success', title: 'Bloque añadido', message: 'El bloque ha sido creado correctamente en la página.' });
        setShowAddModal(false);
        fetchBlocks();
      } else {
        throw new Error();
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo crear el bloque.' });
    } finally {
      setAdding(false);
    }
  };

  // Elimina un bloque
  const handleDeleteBlock = async (id: string) => {
    try {
      const res = await fetch(`${API}/cms/blocks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showFeedback({ type: 'success', title: 'Bloque eliminado', message: 'El bloque se ha quitado de la página.' });
        setBlocks(prev => prev.filter(b => b.id !== id));
      } else {
        throw new Error();
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo eliminar el bloque.' });
    }
  };

  // Reordena bloques mediante flechas de reordenado rápido
  const handleReorderBlocks = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const list = [...blocks];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const payload = list.map((b, idx) => ({ ...b, order_index: idx }));
    setBlocks(payload);

    try {
      const res = await fetch(`${API}/cms/blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: payload.map(b => b.id) })
      });
      if (res.ok) {
        showFeedback({ type: 'success', title: 'Orden guardado', message: 'El orden de los bloques se ha sincronizado.' });
      } else {
        throw new Error();
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudo actualizar el orden en el servidor.' });
      fetchBlocks(); 
    }
  };

  // Iniciar edición de bloque
  const startEditBlock = (block: Block) => {
    setEditingBlock(block);
    setEditFormData({ ...block.content_data });
  };

  // Guardar cambios del bloque editado
  const handleSaveBlockEdit = async () => {
    if (!editingBlock) return;
    setSavingBlockId(editingBlock.id);

    try {
      const res = await fetch(`${API}/cms/blocks/${editingBlock.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          block_type: editingBlock.block_type,
          content_data: editFormData
        })
      });

      if (res.ok) {
        showFeedback({ type: 'success', title: 'Bloque actualizado', message: 'Los cambios se han guardado correctamente.' });
        setBlocks(prev => prev.map(b => b.id === editingBlock.id ? { ...b, content_data: editFormData } : b));
        setEditingBlock(null);
      } else {
        throw new Error();
      }
    } catch {
      showFeedback({ type: 'error', title: 'Error', message: 'No se pudieron guardar los cambios en el bloque.' });
    } finally {
      setSavingBlockId(null);
    }
  };

  // Manejar selección de imagen de galería
  const handleImageSelected = (url: string) => {
    setEditFormData(prev => ({ ...prev, image_url: url }));
    setShowGallery(false);
    setGalleryField(null);
  };

  // Abre la galería de imágenes/vídeos
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
              Mini Elementor
            </span>
          </div>

          <h1 className="font-serif text-3xl font-extrabold text-stone-800 leading-tight">
            Editar: {pageTitle || slug}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-stone-400 font-sans">URL pública:</span>
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
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Ver Página
        </a>
      </div>

      {/* ── LISTADO DE BLOQUES (Componente Desacoplado) ───────────── */}
      <div className="space-y-6 mb-12">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">
          Estructura de la página ({blocks.length} bloques)
        </h2>

        <BlockList
          blocks={blocks}
          loading={loading}
          onReorder={handleReorderBlocks}
          onEdit={startEditBlock}
          onDelete={handleDeleteBlock}
          onOpenAddModal={() => setShowAddModal(true)}
          dbCategories={dbCategories}
        />
      </div>

      {/* ── MODAL AGREGAR BLOQUE (Componente Desacoplado) ─────────── */}
      <AddBlockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAddBlock={handleAddBlock}
        adding={adding}
      />

      {/* ── MODAL PROPIEDADES BLOQUE (Componente Desacoplado) ──────── */}
      <BlockEditorModal
        isOpen={!!editingBlock}
        editingBlock={editingBlock}
        editFormData={editFormData}
        onChangeFormData={setEditFormData}
        onSave={handleSaveBlockEdit}
        onClose={() => setEditingBlock(null)}
        saving={savingBlockId === editingBlock?.id}
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
