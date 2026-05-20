"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useFeedback } from '@/app/contexts/FeedbackContext';
import { Skeleton } from '@/components/ui/skeleton';
import MediaPickerModal from '@/components/MediaPickerModal';

interface Block {
  id: string;
  block_type: 'title_heading' | 'text_image_cta' | 'atomic_image' | 'atomic_category';
  content_data: Record<string, any>;
  order_index: number;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function CustomPageEditor() {
  const { slug } = useParams();
  const router = useRouter();
  const { showFeedback } = useFeedback();

  const [pageTitle, setPageTitle] = useState<string>('');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Datos de categorías y tratamientos del negocio para atomic_category
  const [dbCategories, setDbCategories] = useState<any[]>([]);
  const [dbServices, setDbServices] = useState<any[]>([]);

  // Estados para edición de bloque
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

  // Reordena bloques mediante flechas
  const handleReorderBlocks = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const list = [...blocks];
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // Recalcula order_index local
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
      fetchBlocks(); // Revertir
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
    if (galleryField === 'text_image_cta_image') {
      setEditFormData(prev => ({ ...prev, image_url: url }));
    } else if (galleryField === 'atomic_image_image') {
      setEditFormData(prev => ({ ...prev, image_url: url }));
    }
    setShowGallery(false);
    setGalleryField(null);
  };

  // Abre la galería indicando qué campo se va a actualizar
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

      {/* ── LISTADO DE BLOQUES ACTUALES ───────────────────────────── */}
      <div className="space-y-6 mb-12">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">
          Estructura de la página ({blocks.length} bloques)
        </h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <Skeleton key={i} className="h-32 w-full rounded-3xl" />)}
          </div>
        ) : blocks.length === 0 ? (
          /* Estado vacío */
          <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-stone-200 rounded-3xl bg-white">
            <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center mb-5 border border-stone-100 text-stone-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v16.5h16.5V3.75H3.75zm1.5 1.5h13.5v13.5H5.25V5.25z" />
              </svg>
            </div>
            <h3 className="font-serif text-lg font-bold text-stone-600 mb-1">Página sin contenido</h3>
            <p className="text-stone-400 text-xs max-w-xs mb-6">Añade tu primer bloque modular para estructurar el diseño.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-sm"
            >
              + Añadir Bloque
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => {
              const isTitle = block.block_type === 'title_heading';
              const isTextImage = block.block_type === 'text_image_cta';
              const isAtomicImage = block.block_type === 'atomic_image';
              const isAtomicCategory = block.block_type === 'atomic_category';

              // Visualizaciones sencillas en la lista
              let previewTitle = 'Sin título';
              let previewDesc = 'Sin descripción';
              let colorClasses = 'bg-stone-50/50 border-stone-200 text-stone-500';
              let icon = (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                </svg>
              );

              if (isTitle) {
                previewTitle = block.content_data?.title || 'Título vacío';
                previewDesc = block.content_data?.subtitle || 'Subtítulo vacío';
                colorClasses = 'bg-amber-50/50 border-amber-100 text-[#d4af37]';
              } else if (isTextImage) {
                previewTitle = block.content_data?.title || 'Sección Destacada';
                previewDesc = block.content_data?.description || 'Contenido en dos columnas con imagen y CTA.';
                colorClasses = 'bg-blue-50/40 border-blue-100 text-blue-500';
                icon = (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
                  </svg>
                );
              } else if (isAtomicImage) {
                previewTitle = 'Bloque Imagen / Vídeo';
                previewDesc = block.content_data?.caption || 'Archivo multimedia de la galería de medios.';
                colorClasses = 'bg-emerald-50/50 border-emerald-100 text-emerald-600';
                icon = (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                );
              } else if (isAtomicCategory) {
                const category = dbCategories.find(c => c.id === block.content_data?.category_id);
                previewTitle = `Bloque de Categoría: ${category?.name || 'Cargando...'}`;
                const tCount = block.content_data?.selected_treatment_ids?.length || 0;
                previewDesc = tCount === 0 
                  ? 'Mostrando todos los tratamientos asociados.'
                  : `Mostrando ${tCount} tratamientos específicos seleccionados.`;
                colorClasses = 'bg-purple-50/50 border-purple-100 text-purple-600';
                icon = (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.16 3.659A1.5 1.5 0 009.568 3z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                  </svg>
                );
              }

              return (
                <div 
                  key={block.id}
                  className="bg-white rounded-3xl border border-stone-100 shadow-[0_8px_30px_rgba(0,0,0,0.02)] p-6 hover:border-amber-100/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-6">
                    {/* Detalles del Bloque */}
                    <div className="flex items-center gap-4 min-w-0">
                      
                      {/* Botones de Reordenado Rápido */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => handleReorderBlocks(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-stone-400 hover:text-[#d4af37] disabled:opacity-20 transition-all hover:bg-stone-50 rounded"
                          title="Mover arriba"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleReorderBlocks(index, 'down')}
                          disabled={index === blocks.length - 1}
                          className="p-1 text-stone-400 hover:text-[#d4af37] disabled:opacity-20 transition-all hover:bg-stone-50 rounded"
                          title="Mover abajo"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>

                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${colorClasses}`}>
                        {icon}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-stone-400 uppercase tracking-wider">
                            Bloque {index + 1}
                          </span>
                          <span className="text-stone-300">•</span>
                          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-widest bg-stone-50 px-2 py-0.5 rounded border border-stone-100">
                            {block.block_type}
                          </span>
                        </div>
                        
                        <h3 className="font-serif text-lg font-extrabold text-stone-800 mt-1 truncate">
                          {previewTitle}
                        </h3>
                        
                        <p className="text-stone-400 text-xs font-sans truncate mt-1 max-w-xl">
                          {previewDesc}
                        </p>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => startEditBlock(block)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-stone-200 hover:border-stone-800 rounded-xl text-xs font-bold text-stone-600 hover:text-stone-900 transition-all"
                      >
                        Configurar
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="p-2 text-stone-300 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 rounded-xl transition-all"
                        title="Borrar bloque"
                      >
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Botón rápido de agregar abajo de la lista */}
            <div className="flex justify-center pt-4">
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center gap-2 bg-stone-900 hover:bg-[#d4af37] text-white px-6 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 shadow-md transform hover:scale-[1.02]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Añadir Bloque Modular
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── MODAL PARA AGREGAR NUEVO BLOQUE ───────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl p-10 animate-in zoom-in-95 duration-300">
            
            <div className="mb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
                Librería de Componentes
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-800">
                Añadir bloque a la página
              </h2>
              <p className="text-stone-400 text-xs mt-1">
                Selecciona una de las estructuras modulares para inyectar en tu página.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {/* Opción 1: Title Heading */}
              <button
                onClick={() => handleAddBlock('title_heading')}
                disabled={adding}
                className="border border-stone-200 hover:border-amber-200 bg-white hover:bg-stone-50/50 p-5 rounded-3xl text-left transition-all duration-300 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-[#d4af37] mb-3 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9h16.5m-16.5 6.75h16.5" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-stone-800 mb-1 group-hover:text-[#d4af37] transition-colors">
                  Encabezado Serif
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed font-sans">
                  Título elegante en Playfair Display con una línea dorada decorativa y subtítulo.
                </p>
              </button>

              {/* Opción 2: Text Image CTA */}
              <button
                onClick={() => handleAddBlock('text_image_cta')}
                disabled={adding}
                className="border border-stone-200 hover:border-blue-200 bg-white hover:bg-stone-50/50 p-5 rounded-3xl text-left transition-all duration-300 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-50/50 border border-blue-100 flex items-center justify-center text-blue-500 mb-3 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-stone-800 mb-1 group-hover:text-blue-500 transition-colors">
                  Texto + Imagen + CTA
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed font-sans">
                  Contenedor asimétrico de dos columnas con título, descripción, imagen y botón de llamada a la acción.
                </p>
              </button>

              {/* Opción 3: Atomic Image */}
              <button
                onClick={() => handleAddBlock('atomic_image')}
                disabled={adding}
                className="border border-stone-200 hover:border-emerald-200 bg-white hover:bg-stone-50/50 p-5 rounded-3xl text-left transition-all duration-300 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 mb-3 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25z" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-stone-800 mb-1 group-hover:text-emerald-500 transition-colors">
                  Imagen / Vídeo Único
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed font-sans">
                  Bloque para inyectar una imagen o un loop de vídeo con pie de foto y anchos personalizables.
                </p>
              </button>

              {/* Opción 4: Atomic Category */}
              <button
                onClick={() => handleAddBlock('atomic_category')}
                disabled={adding}
                className="border border-stone-200 hover:border-purple-200 bg-white hover:bg-stone-50/50 p-5 rounded-3xl text-left transition-all duration-300 group disabled:opacity-50"
              >
                <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 mb-3 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.5 1.5 0 002.122 0l4.318-4.318a1.5 1.5 0 000-2.122L11.16 3.659A1.5 1.5 0 009.568 3z" />
                  </svg>
                </div>
                <h4 className="font-bold text-sm text-stone-800 mb-1 group-hover:text-purple-500 transition-colors">
                  Bloque de Tratamientos
                </h4>
                <p className="text-stone-400 text-xs leading-relaxed font-sans">
                  Elige una categoría y selecciona qué tratamientos renderizar dinámicamente con estilo Bento.
                </p>
              </button>
            </div>

            <div className="flex">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-full py-3.5 rounded-2xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
              >
                Cerrar Galería
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL PARA EDITAR CONTENIDO DE UN BLOQUE ───────────────── */}
      {editingBlock && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-10 animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto">
            
            <div className="mb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
                Panel de Configuración
              </span>
              <h2 className="font-serif text-2xl font-bold text-stone-800">
                Ajustes del Bloque
              </h2>
              <p className="text-stone-400 text-xs mt-1">
                Edita las variables y textos del bloque seleccionado. Los cambios se aplicarán en vivo.
              </p>
            </div>

            <div className="space-y-5 mb-8">
              {/* Formulario según tipo de bloque */}
              {editingBlock.block_type === 'title_heading' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Título de Encabezado</label>
                    <input
                      type="text"
                      value={editFormData.title || ''}
                      onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Subtítulo o Párrafo Secundario</label>
                    <textarea
                      rows={3}
                      value={editFormData.subtitle || ''}
                      onChange={e => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Nivel HTML</label>
                      <select
                        value={editFormData.title_tag || 'h2'}
                        onChange={e => setEditFormData({ ...editFormData, title_tag: e.target.value })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                      >
                        <option value="h1">H1 (Principal)</option>
                        <option value="h2">H2 (Sección)</option>
                        <option value="h3">H3 (Subsección)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Alineación</label>
                      <select
                        value={editFormData.alignment || 'center'}
                        onChange={e => setEditFormData({ ...editFormData, alignment: e.target.value })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                      >
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                        <option value="right">Derecha</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 bg-stone-50 rounded-xl border border-stone-100">
                    <span className="text-sm font-bold text-stone-700">Mostrar línea decorativa dorada</span>
                    <button
                      type="button"
                      onClick={() => setEditFormData({ ...editFormData, show_divider: !editFormData.show_divider })}
                      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${editFormData.show_divider ? 'bg-[#d4af37]' : 'bg-stone-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${editFormData.show_divider ? 'translate-x-5' : ''}`} />
                    </button>
                  </div>
                </>
              )}

              {editingBlock.block_type === 'text_image_cta' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Título de la Sección</label>
                    <input
                      type="text"
                      value={editFormData.title || ''}
                      onChange={e => setEditFormData({ ...editFormData, title: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Cuerpo / Descripción</label>
                    <textarea
                      rows={5}
                      value={editFormData.description || ''}
                      onChange={e => setEditFormData({ ...editFormData, description: e.target.value })}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Imagen del Bloque</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Sin archivo multimedia seleccionado"
                        value={editFormData.image_url || ''}
                        readOnly
                        className="flex-grow border border-stone-200 rounded-xl px-4 py-3 text-xs font-mono bg-stone-50 text-stone-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => openGalleryFor('text_image_cta_image')}
                        className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0"
                      >
                        Elegir de Galería
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Posición de Imagen</label>
                      <select
                        value={editFormData.image_position || 'left'}
                        onChange={e => setEditFormData({ ...editFormData, image_position: e.target.value })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                      >
                        <option value="left">A la izquierda</option>
                        <option value="right">A la derecha</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Estilo de Botón CTA</label>
                      <select
                        value={editFormData.cta_button?.style || 'gold_solid'}
                        onChange={e => setEditFormData({
                          ...editFormData,
                          cta_button: {
                            ...(editFormData.cta_button || {}),
                            style: e.target.value
                          }
                        })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                      >
                        <option value="gold_solid">Dorado Sólido</option>
                        <option value="gold_outline">Dorado Borde</option>
                        <option value="dark_solid">Oscuro Sólido</option>
                        <option value="white_solid">Blanco Sólido</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Texto del Botón CTA</label>
                      <input
                        type="text"
                        value={editFormData.cta_button?.text || ''}
                        onChange={e => setEditFormData({
                          ...editFormData,
                          cta_button: {
                            ...(editFormData.cta_button || {}),
                            text: e.target.value
                          }
                        })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Enlace del Botón CTA</label>
                      <input
                        type="text"
                        value={editFormData.cta_button?.url || ''}
                        onChange={e => setEditFormData({
                          ...editFormData,
                          cta_button: {
                            ...(editFormData.cta_button || {}),
                            url: e.target.value
                          }
                        })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] font-mono text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {editingBlock.block_type === 'atomic_image' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Imagen / Loop de Vídeo</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Sin archivo multimedia seleccionado"
                        value={editFormData.image_url || ''}
                        readOnly
                        className="flex-grow border border-stone-200 rounded-xl px-4 py-3 text-xs font-mono bg-stone-50 text-stone-500 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => openGalleryFor('atomic_image_image')}
                        className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0"
                      >
                        Elegir de Galería
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Pie de Foto / Título Corto</label>
                    <input
                      type="text"
                      value={editFormData.caption || ''}
                      onChange={e => setEditFormData({ ...editFormData, caption: e.target.value })}
                      placeholder="Ej: Resultados del tratamiento tras 3 sesiones."
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Alineación</label>
                      <select
                        value={editFormData.alignment || 'center'}
                        onChange={e => setEditFormData({ ...editFormData, alignment: e.target.value })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                      >
                        <option value="left">Izquierda</option>
                        <option value="center">Centro</option>
                        <option value="right">Derecha</option>
                        <option value="full_width">Ancho Completo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Ancho Máximo</label>
                      <input
                        type="text"
                        value={editFormData.max_width || '800px'}
                        onChange={e => setEditFormData({ ...editFormData, max_width: e.target.value })}
                        placeholder="Ej: 800px o 100%"
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] font-mono text-xs"
                      />
                    </div>
                  </div>
                </>
              )}

              {editingBlock.block_type === 'atomic_category' && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Categoría del Negocio</label>
                    <select
                      value={editFormData.category_id || ''}
                      onChange={e => {
                        const newCatId = e.target.value;
                        setEditFormData({
                          ...editFormData,
                          category_id: newCatId,
                          selected_treatment_ids: [] // Reiniciar seleccionados al cambiar categoría
                        });
                      }}
                      className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                    >
                      <option value="" disabled>Selecciona una categoría...</option>
                      {dbCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {editFormData.category_id && (
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Tratamientos a Mostrar</label>
                      <p className="text-[10px] text-stone-400 mb-3">Marca los tratamientos específicos que deseas renderizar. Si no seleccionas ninguno, se mostrarán todos los de la categoría por defecto.</p>
                      
                      <div className="border border-stone-200 rounded-2xl max-h-48 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
                        {dbServices
                          .filter(svc => svc.category_id === editFormData.category_id && svc.is_active)
                          .map(svc => {
                            const isChecked = editFormData.selected_treatment_ids?.includes(svc.id);
                            return (
                              <label key={svc.id} className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors">
                                <input
                                  type="checkbox"
                                  checked={isChecked || false}
                                  onChange={() => {
                                    const currentList = editFormData.selected_treatment_ids || [];
                                    const nextList = currentList.includes(svc.id)
                                      ? currentList.filter((id: string) => id !== svc.id)
                                      : [...currentList, svc.id];
                                    setEditFormData({ ...editFormData, selected_treatment_ids: nextList });
                                  }}
                                  className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] border-stone-300"
                                />
                                <span>{svc.name} <span className="text-[10px] text-stone-400">({svc.price}€)</span></span>
                              </label>
                            );
                          })}

                        {dbServices.filter(svc => svc.category_id === editFormData.category_id && svc.is_active).length === 0 && (
                          <p className="text-xs text-stone-400 italic text-center py-4">No hay tratamientos activos en esta categoría.</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Diseño del Grid</label>
                      <select
                        value={editFormData.layout || 'grid'}
                        onChange={e => setEditFormData({ ...editFormData, layout: e.target.value })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                      >
                        <option value="grid">Bento Grid Dinámico</option>
                        <option value="slider">Slider Cards Deslizable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Máximo de elementos</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={editFormData.max_items || 4}
                        onChange={e => setEditFormData({ ...editFormData, max_items: parseInt(e.target.value) || 4 })}
                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Botonera */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setEditingBlock(null)}
                className="flex-1 py-3.5 rounded-2xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
              >
                Descartar
              </button>
              <button
                onClick={handleSaveBlockEdit}
                disabled={savingBlockId === editingBlock.id}
                className="flex-1 py-3.5 rounded-2xl bg-stone-900 hover:bg-[#d4af37] text-white text-sm font-bold transition-all duration-300 disabled:opacity-40"
              >
                {savingBlockId === editingBlock.id ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── COMPONENTE MEDIA GALLERY MOCK REUTILIZABLE ────────────── */}
      {showGallery && (
        <MediaPickerModal
          onClose={() => { setShowGallery(false); setGalleryField(null); }}
          onImageSelected={handleImageSelected}
          mediaType={galleryField === 'atomic_image_image' ? 'image' : 'image'} // Soporta imágenes y vídeos filtrados en el modal
        />
      )}

    </div>
  );
}
