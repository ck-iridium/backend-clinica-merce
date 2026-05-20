import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import BentoGridServices from '@/components/blocks/BentoGridServices';
import Link from 'next/link';

// Tipos estructurales del Page Builder
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

interface PageProps {
  params: { slug: string };
}

// Metadata dinámica por página
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';

  try {
    const res = await fetch(`${baseUrl}/cms/navigation`, {
      next: { revalidate: 60 },
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (res.ok) {
      const navItems: any[] = await res.json();
      const page = navItems.find((item) => item.path === `/${slug}` && item.is_custom);
      if (page) {
        return {
          title: `${page.label} | Clínica`,
          description: `Página personalizada: ${page.label}`,
        };
      }
    }
  } catch {
    // silencioso
  }

  return {
    title: 'Página | Clínica',
  };
}

export default async function CustomPage({ params }: PageProps) {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id') || '00000000-0000-0000-0000-000000000001';

  // 1. Verificar que la página existe y es custom
  let pageTitle = slug;
  try {
    const resNav = await fetch(`${baseUrl}/cms/navigation`, {
      next: { revalidate: 30 },
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (resNav.ok) {
      const navItems: any[] = await resNav.json();
      const page = navItems.find((item) => item.path === `/${slug}` && item.is_custom);
      if (!page) {
        notFound();
      }
      pageTitle = page.label;
    } else {
      notFound();
    }
  } catch {
    notFound();
  }

  // 2. Cargar los bloques y normalizarlos de forma retrocompatible
  let rawBlocks: any[] = [];
  try {
    const resBlocks = await fetch(`${baseUrl}/cms/blocks/${slug}`, {
      next: { revalidate: 30 },
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (resBlocks.ok) {
      rawBlocks = await resBlocks.json();
    }
  } catch {
    // Silencioso
  }

  // Normalización defensiva para páginas con bloques antiguos/planos
  const sections: SectionBlock[] = rawBlocks.map((block: any, idx: number) => {
    if (block.block_type === 'section') {
      return block;
    } else {
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
                } as any
              ]
            }
          ]
        }
      };
    }
  });

  // 3. Cargar los datos del negocio para renderizar las categorías y tratamientos
  let dbCategories: any[] = [];
  let dbServices: any[] = [];
  try {
    const [resCat, resSvc] = await Promise.all([
      fetch(`${baseUrl}/service-categories/`, { headers: { 'X-Tenant-ID': tenantId } }),
      fetch(`${baseUrl}/services/`, { headers: { 'X-Tenant-ID': tenantId } })
    ]);
    if (resCat.ok) dbCategories = await resCat.json();
    if (resSvc.ok) dbServices = await resSvc.json();
  } catch {
    // Silencioso
  }

  return (
    <>
      <main className="w-full min-h-screen bg-[#FAFAFA] pt-20">

        {sections.length > 0 ? (
          <div className="flex flex-col w-full">
            {sections.map((section) => {
              const struct = section.content_data || { columns_count: 1, columns: [] };
              const columnsCount = struct.columns_count || 1;
              const columns = struct.columns || [];

              // Clases CSS Grid según el conteo de columnas
              let gridClass = 'grid-cols-1';
              if (columnsCount === 2) gridClass = 'grid-cols-1 md:grid-cols-2 gap-8 md:gap-12';
              if (columnsCount === 3) gridClass = 'grid-cols-1 md:grid-cols-3 gap-6 md:gap-8';
              if (columnsCount === 4) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6';

              // Espaciados Quiet Luxury y fondos
              const pySpacing = struct.py_spacing || 'py-24';
              const bgColor = struct.bg_color === 'white' ? 'bg-white' : 'bg-[#FAFAFA]';

              return (
                <section
                  key={section.id}
                  className={`w-full ${pySpacing} ${bgColor} px-6 md:px-12 transition-all duration-300 border-b border-stone-100/30`}
                >
                  <div className={`max-w-7xl mx-auto grid ${gridClass}`}>
                    {columns.map((col) => (
                      <div key={col.id} className="flex flex-col gap-6 justify-center">
                        {(col.blocks || []).map((block) => {
                          const data = block.content_data || {};

                          // ──── RENDER: ATOMIC TITLE ────
                          if (block.block_type === 'atomic_title' || block.block_type === 'title_heading') {
                            const Tag = data.title_tag || 'h2';
                            const alignment = data.alignment || 'center';
                            const alignClass = 
                              alignment === 'left' ? 'text-left' : 
                              alignment === 'right' ? 'text-right' : 
                              'text-center';

                            return (
                              <div key={block.id} className={`w-full ${alignClass} py-3`}>
                                <Tag className={`font-serif text-3xl md:text-4xl font-extrabold text-stone-800 leading-tight`}>
                                  {data.title}
                                </Tag>
                                {data.show_divider !== false && (
                                  <div className={`w-12 h-[2px] bg-[#d4af37] mt-4 rounded-full inline-block`} />
                                )}
                                {data.subtitle && (
                                  <p className="text-stone-400 text-sm mt-3 font-sans max-w-lg mx-auto">
                                    {data.subtitle}
                                  </p>
                                )}
                              </div>
                            );
                          }

                          // ──── RENDER: ATOMIC TEXT ────
                          if (block.block_type === 'atomic_text') {
                            return (
                              <div
                                key={block.id}
                                className="prose prose-stone max-w-none text-stone-600 font-sans text-base leading-relaxed py-2"
                                dangerouslySetInnerHTML={{ __html: data.html || '' }}
                              />
                            );
                          }

                          // ──── RENDER: ATOMIC IMAGE / TEXT_IMAGE_CTA ────
                          if (block.block_type === 'atomic_image' || block.block_type === 'text_image_cta') {
                            if (!data.image_url) return null;
                            const isVideo = data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_');
                            const alignment = data.alignment || 'center';
                            const isFullWidth = alignment === 'full_width';

                            return (
                              <div key={block.id} className={`w-full py-4 flex ${
                                alignment === 'left' ? 'justify-start' : 
                                alignment === 'right' ? 'justify-end' : 
                                'justify-center'
                              }`}>
                                <div 
                                  className={`rounded-[2rem] overflow-hidden shadow-luxury border border-stone-100/50 bg-white ${isFullWidth ? 'w-full rounded-none border-none p-0' : 'p-3'}`}
                                  style={{ maxWidth: isFullWidth ? '100%' : (data.max_width || '800px') }}
                                >
                                  {isVideo ? (
                                    <video
                                      src={data.image_url}
                                      autoPlay
                                      loop
                                      muted
                                      playsInline
                                      className={`w-full object-cover rounded-2xl ${isFullWidth ? 'h-[50vh] rounded-none' : ''}`}
                                    />
                                  ) : (
                                    <img
                                      src={data.image_url}
                                      alt={data.caption || 'Imagen'}
                                      className={`w-full h-auto rounded-2xl ${isFullWidth ? 'rounded-none' : ''}`}
                                    />
                                  )}
                                  {data.caption && (
                                    <p className="mt-3 text-xs font-semibold text-stone-500 italic text-center px-4">
                                      {data.caption}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // ──── RENDER: ATOMIC BUTTON ────
                          if (block.block_type === 'atomic_button') {
                            const btnAlign = data.alignment || 'left';
                            const alignClass = 
                              btnAlign === 'left' ? 'justify-start' : 
                              btnAlign === 'right' ? 'justify-end' : 
                              'justify-center';

                            const styleClass = 
                              data.style === 'gold_outline' 
                                ? 'border border-[#d4af37] text-[#d4af37] bg-transparent hover:bg-[#d4af37] hover:text-white' 
                                : data.style === 'dark_solid' 
                                ? 'bg-stone-900 text-white hover:bg-stone-800' 
                                : 'bg-[#d4af37] text-white hover:bg-[#b08e23]';

                            return (
                              <div key={block.id} className={`w-full flex ${alignClass} py-3`}>
                                <Link
                                  href={data.url || '#'}
                                  className={`px-7 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-95 ${styleClass}`}
                                >
                                  {data.text || 'Acción'}
                                </Link>
                              </div>
                            );
                          }

                          // ──── RENDER: ATOMIC CATEGORY ────
                          if (block.block_type === 'atomic_category') {
                            const category = dbCategories.find(c => c.id === data.category_id);
                            let filteredServices = dbServices.filter(svc => svc.category_id === data.category_id && svc.is_active);

                            if (data.selected_treatment_ids && data.selected_treatment_ids.length > 0) {
                              filteredServices = filteredServices.filter(svc => data.selected_treatment_ids.includes(svc.id));
                            }

                            if (data.max_items) {
                              filteredServices = filteredServices.slice(0, data.max_items);
                            }

                            if (filteredServices.length === 0) return null;

                            return (
                              <div key={block.id} className="w-full py-4 -mx-6 md:-mx-12">
                                <BentoGridServices
                                  data={{
                                    title: category?.name || 'Nuestros Tratamientos',
                                    subtitle: category?.description || 'Nuestros tratamientos insignia.'
                                  }}
                                  services={filteredServices}
                                />
                              </div>
                            );
                          }

                          return null;
                        })}
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* Estado vacío elegante */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <div className="w-16 h-[2px] bg-[#d4af37] rounded-full mb-10" />

            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d4af37] block mb-4">
              Página en construcción
            </span>

            <h1 className="font-serif text-4xl md:text-5xl font-extrabold text-stone-800 leading-tight mb-6">
              {pageTitle}
            </h1>

            <p className="text-stone-400 font-sans text-base md:text-lg max-w-md leading-relaxed mb-10">
              Esta página está lista y publicada. En breve encontrarás aquí toda la información que estamos preparando para ti.
            </p>

            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-[#d4af37] transition-colors duration-300 group"
            >
              <svg
                className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform duration-300"
                fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Volver al inicio
            </a>

            <div className="w-16 h-[2px] bg-stone-100 rounded-full mt-10" />
          </div>
        )}

      </main>
    </>
  );
}
