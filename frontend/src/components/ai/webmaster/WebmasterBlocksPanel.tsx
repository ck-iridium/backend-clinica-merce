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
  onChangeActivePage: (slug: string, path: string) => void;
  onBlockInserted: () => void;
  onAskAI: (prompt: string) => void;
}

export default function WebmasterBlocksPanel({
  activePageSlug,
  onChangeActivePage,
  onBlockInserted,
  onAskAI,
}: WebmasterBlocksPanelProps) {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [isInserting, setIsInserting] = useState(false);

  // Cargar páginas del sitio
  useEffect(() => {
    async function loadPages() {
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
        const res = await fetch(`${API_URL}/cms/navigation`, {
          headers: {
            'X-Tenant-ID': tenantId,
            Authorization: authToken ? `Bearer ${authToken}` : '',
          },
        });
        if (res.ok) {
          const navs: PageItem[] = await res.json();
          // Añadir Portada siempre al inicio
          const allPages: PageItem[] = [
            { id: 'home', label: 'Portada (Home)', path: '/', is_custom: false },
            ...navs.filter((n) => n.is_custom),
          ];
          setPages(allPages);
        }
      } catch (err) {
        console.error('Error al cargar páginas:', err);
      } finally {
        setIsLoadingPages(false);
      }
    }
    loadPages();
  }, []);

  const currentPage = pages.find((p) => {
    if (activePageSlug === 'home') return p.path === '/';
    return p.path === `/${activePageSlug}` || p.path.endsWith(`/${activePageSlug}`);
  }) || pages[0] || { id: 'home', label: 'Portada', path: '/', is_custom: false };

  // Insertar un bloque de forma nativa a la página activa
  const handleInsertBlock = async (blockType: string, options: { layout?: string; title?: string } = {}) => {
    if (isInserting) return;
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

    const cleanSlug = activePageSlug === '/' || !activePageSlug ? 'home' : activePageSlug.replace(/^\//, '');

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
        contentData = {
          category_id: '',
          selected_treatment_ids: [],
          layout: options.layout || 'slider',
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
        <div className="flex flex-wrap gap-1.5">
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
                  onChangeActivePage(s, p.path);
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
        </div>
      </div>

      {/* ── BIBLIOTECA DE BLOQUES MODULARES ── */}
      <div className="p-5 flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#b38f2b]">
            Biblioteca de Bloques · Co-Construcción
          </span>
          <span className="text-[10px] text-stone-400 font-medium">
            1-Clic o Vía Asistente IA
          </span>
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
      </div>
    </div>
  );
}
