'use client';

import { useState, useEffect } from 'react';
import { 
  Sparkles, Plus, ExternalLink, Image as ImageIcon, Type, 
  SlidersHorizontal, LayoutGrid, MousePointerClick, FileText, 
  Columns, ChevronRight, Check
} from 'lucide-react';
import { toast } from 'sonner';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

interface PageItem {
  id: string;
  label: string;
  path: string;
  is_custom: boolean;
}

interface WebmasterBlocksPanelProps {
  activePageSlug: string;
  onChangeActivePage: (slug: string, path: string, label?: string) => void;
  onBlockInserted: () => void;
  onAskAI: (prompt: string) => void;
  onOpenVisualBuilder?: () => void;
}

export default function WebmasterBlocksPanel({
  activePageSlug,
  onChangeActivePage,
  onBlockInserted,
  onAskAI,
  onOpenVisualBuilder,
}: WebmasterBlocksPanelProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [isInserting, setIsInserting] = useState(false);

  // Cargar páginas y categorías del sitio
  useEffect(() => {
    async function loadData() {
      try {
        const tenantId = getCookie('tenant_id') || '';
        const userSession = localStorage.getItem('user');
        let authToken = '';
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            authToken = parsed.access_token || parsed.token || '';
          } catch {}
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const [resNav, resCats] = await Promise.all([
          fetch(`${API_URL}/cms/navigation`, {
            headers: {
              'X-Tenant-ID': tenantId,
              Authorization: authToken ? `Bearer ${authToken}` : '',
            },
          }),
          fetch(`${API_URL}/service-categories/`, {
            headers: {
              'X-Tenant-ID': tenantId,
              Authorization: authToken ? `Bearer ${authToken}` : '',
            },
          }),
        ]);

        if (resNav.ok) {
          const navs: PageItem[] = await resNav.json();
          const allPages: PageItem[] = [
            { id: 'home', label: 'Portada (Home)', path: '/', is_custom: false },
            ...navs.filter((n) => n.is_custom),
          ];
          setPages(allPages);
        }

        if (resCats.ok) {
          const catsData = await resCats.json();
          setCategories(catsData);
        }
      } catch (err) {
        console.error('Error al cargar datos en panel:', err);
      } finally {
        setIsLoadingPages(false);
      }
    }
    loadData();
  }, []);

  const currentPage = pages.find((p) => {
    if (activePageSlug === 'home') return p.path === '/';
    return p.path === `/${activePageSlug}` || p.path.endsWith(`/${activePageSlug}`);
  }) || pages[0] || { id: 'home', label: 'Portada (Home)', path: '/', is_custom: false };

  // Insertar un bloque de forma nativa a la página personalizada activa
  const handleInsertBlock = async (blockType: string, options: { layout?: string; title?: string } = {}) => {
    if (isInserting) return;
    if (!currentPage.is_custom) {
      toast.error('La Portada no usa bloques individuales; se edita desde el CMS o con el Co-Piloto.');
      return;
    }
    setIsInserting(true);

    const tenantId = getCookie('tenant_id') || '';
    const userSession = localStorage.getItem('user');
    let authToken = '';
    if (userSession) {
      try {
        const parsed = JSON.parse(userSession);
        authToken = parsed.access_token || parsed.token || '';
      } catch {}
    }

    const cleanSlug = activePageSlug.replace(/^\//, '');

    // Generar estructura completa de section
    const sectionId = `sec-${Date.now().toString(36)}`;
    const colId = `col-${Date.now().toString(36)}`;
    const blockId = `atomic-${Date.now().toString(36)}`;

    let contentData: Record<string, any> = {};

    switch (blockType) {
      case 'hero':
        contentData = {
          image_url: '',
          heading: 'Experiencia Exclusiva',
          subheading: 'Tratamientos de alta gama adaptados a ti.',
          cta_text: 'Reservar Cita',
          cta_url: '/reservar',
        };
        break;
      case 'title_heading':
        contentData = {
          title: options.title || 'Título de Prestigio',
          title_tag: 'h2',
          alignment: 'center',
          show_divider: true,
          subtitle: 'Excelencia, distinción y calma.',
        };
        break;
      case 'atomic_text':
        contentData = {
          html: '<p class="leading-relaxed">Hemos concebido este espacio para ofrecerte una experiencia distinguida, donde la serenidad, la privacidad y la más alta dedicación técnica se fusionan para responder a tus más altas expectativas.</p>',
          alignment: 'left',
        };
        break;
      case 'atomic_image':
        contentData = {
          image_url: '',
          caption: 'Instalaciones y Espacio',
          alignment: 'center',
          max_width: '900px',
        };
        break;
      case 'text_image_cta':
        contentData = {
          title: 'Nuestra Esencia',
          description: 'Un entorno diseñado para revitalizar cuerpo y mente con tratamientos personalizados.',
          image_url: '',
          image_position: 'left',
          button_text: 'Descubrir Más',
          button_url: '/reservar',
        };
        break;
      case 'atomic_category':
        const mappedLayout = options.layout === 'slider' ? 'cards_slider' : options.layout === 'bento' ? 'bento_grid' : 'traditional_grid';
        contentData = {
          category_id: categories[0]?.id || '',
          selected_treatment_ids: [],
          layout: mappedLayout,
          max_items: 6,
        };
        break;
      case 'atomic_button':
        contentData = {
          text: 'Reservar Experiencia',
          url: '/reservar',
          style: 'gold_solid',
          alignment: 'center',
        };
        break;
    }

    const payload = {
      page_slug: cleanSlug,
      block_type: 'section',
      content_data: {
        id: sectionId,
        columns_count: 1,
        py_spacing: 'py-14',
        bg_color: 'white',
        vertical_alignment: 'items-start',
        columns: [
          {
            id: colId,
            width: 'w-full',
            blocks: [
              {
                id: blockId,
                block_type: blockType,
                content_data: contentData,
              },
            ],
          },
        ],
      },
    };

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/cms/blocks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          Authorization: authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al añadir el bloque.');

      toast.success('¡Bloque añadido con éxito a la página!');
      onBlockInserted();
    } catch (err: any) {
      toast.error(err.message || 'Error al insertar bloque.');
    } finally {
      setIsInserting(false);
    }
  };

  const BLOCKS_CATALOG = [
    {
      id: 'atomic_category_slider',
      type: 'atomic_category',
      layout: 'slider',
      icon: SlidersHorizontal,
      title: 'Carrusel de Catálogo',
      subtitle: 'Tratamientos en diapositivas interactivas',
      prompt: `Añade un carrusel de tratamientos en formato slider a la página "${currentPage.label}".`,
    },
    {
      id: 'atomic_category_bento',
      type: 'atomic_category',
      layout: 'bento',
      icon: LayoutGrid,
      title: 'Bento Grid de Tratamientos',
      subtitle: 'Mosaico modular asimétrico 2026',
      prompt: `Inserta un módulo Bento Grid destacando nuestros mejores tratamientos en la página "${currentPage.label}".`,
    },
    {
      id: 'text_image_cta',
      type: 'text_image_cta',
      icon: ImageIcon,
      title: 'Imagen + Texto (Split)',
      subtitle: '2 columnas: fotografía y redacción persuasiva',
      prompt: `Diseña un bloque elegante de dos columnas con fotografía editorial y texto para la página "${currentPage.label}".`,
    },
    {
      id: 'atomic_image',
      type: 'atomic_image',
      icon: ImageIcon,
      title: 'Fotografía / Galería',
      subtitle: 'Marco de alta gama para fotos o vídeos',
      prompt: `Añade un bloque de fotografía de alta gama a la página "${currentPage.label}".`,
    },
    {
      id: 'title_heading',
      type: 'title_heading',
      icon: Type,
      title: 'Título de Prestigio',
      subtitle: 'Tipografía serif H2 con divisor dorado',
      prompt: `Propón y añade un título elegante con divisor dorado a la página "${currentPage.label}".`,
    },
    {
      id: 'atomic_text',
      type: 'atomic_text',
      icon: FileText,
      title: 'Párrafo Editorial',
      subtitle: 'Redacción enriquecida de estilo Quiet Luxury',
      prompt: `Redacta y añade un párrafo editorial de alta costura a la página "${currentPage.label}".`,
    },
    {
      id: 'hero',
      type: 'hero',
      icon: Sparkles,
      title: 'Hero Cinemático',
      subtitle: 'Banner a pantalla completa con botón',
      prompt: `Añade una sección Hero a pantalla completa con botón de reserva en la página "${currentPage.label}".`,
    },
    {
      id: 'atomic_button',
      type: 'atomic_button',
      icon: MousePointerClick,
      title: 'Botón CTA de Reserva',
      subtitle: 'Llamada a la acción hacia /reservar',
      prompt: `Añade un botón de reserva directa hacia /reservar en la página "${currentPage.label}".`,
    },
  ];

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] border-r border-stone-200/80 overflow-y-auto scrollbar-thin scrollbar-thumb-stone-200">
      {/* ── CABECERA Y SELECTOR DE PÁGINA ── */}
      <div className="p-5 bg-white border-b border-stone-200/70 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
            <h3 className="text-xs font-black uppercase tracking-widest text-stone-800">
              Página Activa en Edición
            </h3>
          </div>
          {currentPage.is_custom && (
            <a
              href={`/dashboard/pages/${currentPage.path.replace(/^\//, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-bold text-stone-400 hover:text-[#b38f2b] flex items-center gap-1 transition-colors"
            >
              <span>Abrir en Elementor</span>
              <ExternalLink size={11} />
            </a>
          )}
        </div>

        {/* Dropdown / Botones de Páginas */}
        <div className="flex flex-wrap gap-1.5 items-center">
          {pages.map((p) => {
            const isSelected =
              (activePageSlug === 'home' && p.path === '/') ||
              p.path === `/${activePageSlug}` ||
              p.path.endsWith(`/${activePageSlug}`);

            return (
              <button
                key={p.id}
                onClick={() => {
                  const s = p.path === '/' ? 'home' : p.path.replace(/^\//, '');
                  onChangeActivePage(s, p.path, p.label);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-stone-100 hover:bg-stone-200/70 text-stone-600'
                }`}
              >
                <span>{p.label}</span>
                {isSelected && <Check size={11} className="text-[#d4af37]" />}
              </button>
            );
          })}

          {/* Botón rápido para crear nueva página */}
          <button
            onClick={() => onAskAI("Quiero crear una nueva página personalizada para mi web. ¿Qué temáticas me recomiendas para mi negocio y qué estructura inicial le damos?")}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100/80 border border-amber-200/60 transition-all flex items-center gap-1 active:scale-95 shadow-2xs"
            title="Crear una nueva página asistida por el Co-Piloto"
          >
            <Plus size={12} />
            <span>Nueva Página</span>
          </button>
        </div>
      </div>

      {/* ── CUERPO: SEGÚN SEA PORTADA O PÁGINA PERSONALIZADA ── */}
      <div className="p-5 flex-1 space-y-4">
        {!currentPage.is_custom ? (
          /* MODO PORTADA (HOME) */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200/80 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#b38f2b]">
                  Arquitectura de Portada (Home)
                </span>
                <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full font-bold">
                  CMS Nativo
                </span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                La Portada principal está optimizada con secciones clave de conversión (Hero Diapositivas, Sobre Mí, Catálogo de Tratamientos y Llamada a la Acción).
              </p>
              {onOpenVisualBuilder && (
                <button
                  onClick={onOpenVisualBuilder}
                  className="w-full mt-2 py-2 px-3 rounded-xl bg-stone-900 hover:bg-[#1c1917] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                >
                  <ExternalLink size={13} className="text-[#d4af37]" />
                  <span>Abrir Editor de Portada (CMS)</span>
                </button>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                Acciones Rápidas Asistidas por IA
              </span>

              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => onAskAI("Propón y añade una nueva diapositiva atractiva para el carrusel Hero de la portada con título, subtítulo, foto y botón de reserva.")}
                  className="w-full p-3 bg-white hover:bg-stone-50 border border-stone-200/80 hover:border-amber-300 rounded-xl text-left transition-all group flex items-start gap-3 shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                    <Sparkles size={13} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 group-hover:text-stone-950">Añadir Diapositiva Hero con IA</h5>
                    <p className="text-[10px] text-stone-400 mt-0.5">Crea un slide con título, fotografía y botón directo a /reservar.</p>
                  </div>
                </button>

                <button
                  onClick={() => onAskAI("Configura las categorías de la portada en formato Bento Grid 2026 para una visualización asimétrica de lujo.")}
                  className="w-full p-3 bg-white hover:bg-stone-50 border border-stone-200/80 hover:border-amber-300 rounded-xl text-left transition-all group flex items-start gap-3 shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                    <LayoutGrid size={13} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 group-hover:text-stone-950">Cambiar Catálogo a Bento Grid</h5>
                    <p className="text-[10px] text-stone-400 mt-0.5">Presenta los tratamientos en cuadrícula modular asimétrica 2026.</p>
                  </div>
                </button>

                <button
                  onClick={() => onAskAI("Configura las categorías de la portada en formato Slider Carrusel interactivo.")}
                  className="w-full p-3 bg-white hover:bg-stone-50 border border-stone-200/80 hover:border-amber-300 rounded-xl text-left transition-all group flex items-start gap-3 shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                    <SlidersHorizontal size={13} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 group-hover:text-stone-950">Cambiar Catálogo a Slider Deslizable</h5>
                    <p className="text-[10px] text-stone-400 mt-0.5">Diapositivas horizontales táctiles para móviles y escritorio.</p>
                  </div>
                </button>

                <button
                  onClick={() => onAskAI("Reescribe los títulos principales y el texto de Sobre Mí de la portada con estilo editorial y Quiet Luxury.")}
                  className="w-full p-3 bg-white hover:bg-stone-50 border border-stone-200/80 hover:border-amber-300 rounded-xl text-left transition-all group flex items-start gap-3 shadow-2xs"
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#d4af37] shrink-0 mt-0.5">
                    <FileText size={13} />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-stone-900 group-hover:text-stone-950">Optimizar Textos de Portada para SEO</h5>
                    <p className="text-[10px] text-stone-400 mt-0.5">Redacción persuasiva de alta costura adaptada a tu clínica.</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MODO PÁGINA PERSONALIZADA (BLOQUES & ELEMENTOR) */
          <>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-[#b38f2b]">
                Biblioteca de Bloques · Co-Construcción
              </span>
              {onOpenVisualBuilder && (
                <button
                  onClick={onOpenVisualBuilder}
                  className="text-[10px] font-bold text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors"
                >
                  <ExternalLink size={11} className="text-[#d4af37]" />
                  <span>Diseñador Visual</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {BLOCKS_CATALOG.map((b) => {
                const Icon = b.icon;
                return (
                  <div
                    key={b.id}
                    className="group relative bg-white/90 hover:bg-white rounded-2xl p-3.5 border border-stone-200/80 hover:border-amber-300/80 shadow-2xs hover:shadow-[0_6px_20px_-4px_rgba(212,175,55,0.18)] transition-all duration-300"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50/80 border border-amber-200/60 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-stone-950 transition-colors shrink-0 mt-0.5 shadow-2xs">
                        <Icon size={14} strokeWidth={2.2} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-stone-900 group-hover:text-stone-950 truncate">
                            {b.title}
                          </h4>
                        </div>
                        <p className="text-[10px] text-stone-400 group-hover:text-stone-600 mt-0.5 leading-snug">
                          {b.subtitle}
                        </p>

                        {/* Acciones del Bloque: Directo o Asistido por IA */}
                        <div className="flex items-center gap-2 mt-2.5">
                          <button
                            onClick={() => handleInsertBlock(b.type, { layout: b.layout, title: b.title })}
                            disabled={isInserting}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-900 text-stone-700 hover:text-white text-[10px] font-bold transition-all duration-200 flex items-center gap-1 active:scale-95 disabled:opacity-40"
                            title="Insertar bloque en la página inmediatamente"
                          >
                            <Plus size={11} />
                            <span>Añadir</span>
                          </button>

                          <button
                            onClick={() => onAskAI(b.prompt)}
                            className="px-2.5 py-1 rounded-lg bg-amber-50/90 hover:bg-[#d4af37] text-amber-900 hover:text-stone-950 border border-amber-200/70 text-[10px] font-bold transition-all duration-200 flex items-center gap-1 active:scale-95 shadow-2xs"
                            title="Pedir al Director Creativo que lo redacte e inserte"
                          >
                            <Sparkles size={11} className="text-[#d4af37] group-hover:text-stone-950" />
                            <span>Redactar con IA</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
