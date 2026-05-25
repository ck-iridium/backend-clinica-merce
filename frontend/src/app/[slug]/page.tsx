export const dynamic = 'force-dynamic';

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import BentoGridServices from '@/components/blocks/BentoGridServices';
import ServiceCard from '@/components/ServiceCard';
import Link from 'next/link';

// Tipos estructurales del Page Builder
interface AtomicBlock {
  id: string;
  block_type: 'atomic_title' | 'atomic_text' | 'atomic_image' | 'atomic_button' | 'atomic_category' | 'title_heading' | 'text_image_cta' | 'hero';
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
  vertical_alignment?: string;
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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');

  if (!baseUrl || !tenantId) return {};

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
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');

  if (!baseUrl || !tenantId) {
    notFound();
  }

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

  const firstSectionHasHero = sections[0]?.content_data?.columns?.some(
    (col: any) => (col.blocks || []).some((b: any) => b.block_type === 'hero')
  );
  const mainPadding = firstSectionHasHero ? 'pt-0' : 'pt-20';

  return (
    <>
      <main className={`w-full min-h-screen bg-[#FAFAFA] ${mainPadding}`}>

        {sections.length > 0 ? (
          <div className="flex flex-col w-full">
            {sections.map((section, index) => {
              const struct = section.content_data || { columns_count: 1, columns: [] };
              const columnsCount = struct.columns_count || 1;
              const columns = struct.columns || [];

              // Clases CSS Grid según el conteo de columnas
              let gridClass = 'grid-cols-1';
              if (columnsCount === 2) gridClass = 'grid-cols-1 md:grid-cols-2 gap-8 md:gap-12';
              if (columnsCount === 3) gridClass = 'grid-cols-1 md:grid-cols-3 gap-6 md:gap-8';
              if (columnsCount === 4) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6';

              // Espaciados Quiet Luxury y fondos
              const hasHero = columns.some(col => (col.blocks || []).some(b => b.block_type === 'hero'));
              const isFirstWithHero = index === 0 && hasHero;
              const pySpacing = isFirstWithHero ? 'pt-0 pb-0' : (hasHero ? 'py-0' : (struct.py_spacing || 'py-24'));
              const bgColor = struct.bg_color === 'white' ? 'bg-white' : 'bg-[#FAFAFA]';
              const paddingClass = hasHero ? 'p-0' : 'px-6 md:px-12';
              const widthClass = hasHero ? 'w-full' : 'max-w-7xl mx-auto grid';
              const verticalAlign = struct.vertical_alignment || 'items-start';

              return (
                <section
                  key={section.id}
                  className={`w-full ${pySpacing} ${bgColor} ${paddingClass} transition-all duration-300 border-b border-stone-100/30`}
                >
                  <div className={`${widthClass} ${hasHero ? '' : gridClass} ${verticalAlign}`}>
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
                                  <div className={`w-12 h-[2px] bg-primary mt-4 rounded-full inline-block`} />
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
                            const alignClass = 
                              data.alignment === 'center' ? 'text-center' :
                              data.alignment === 'right' ? 'text-right' :
                              data.alignment === 'justify' ? 'text-justify' :
                              'text-left';
                            return (
                              <div
                                key={block.id}
                                className={`prose prose-stone max-w-none text-stone-600 font-sans text-base leading-relaxed py-2 ${alignClass}`}
                                dangerouslySetInnerHTML={{ __html: data.html || '' }}
                              />
                            );
                          }

                          // ──── RENDER: ATOMIC IMAGE ────
                          if (block.block_type === 'atomic_image') {
                            if (!data.image_url) return null;
                            const isVideo = data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_');
                            const alignment = data.alignment || 'center';
                            const isFullWidth = alignment === 'full_width';
                            const fitMode = data.object_fit || 'cover';
                            const heightStyle = data.height_preset === 'small' ? '250px' : data.height_preset === 'medium' ? '400px' : data.height_preset === 'large' ? '550px' : data.height_preset === 'screen' ? '750px' : (fitMode !== 'none' ? '380px' : 'auto');

                            return (
                              <div key={block.id} className={`w-full py-4 flex ${
                                alignment === 'left' ? 'justify-start' : 
                                alignment === 'right' ? 'justify-end' : 
                                'justify-center'
                              }`}>
                                <div 
                                  className={`rounded-[2rem] overflow-hidden shadow-luxury border border-stone-100/50 bg-white ${isFullWidth ? 'w-full rounded-none border-none p-0' : 'p-3'}`}
                                  style={{ maxWidth: isFullWidth ? '100%' : (data.max_width || '100%') }}
                                >
                                  <div className="relative overflow-hidden rounded-2xl w-full">
                                    {isVideo ? (
                                      <video
                                        src={data.image_url}
                                        autoPlay
                                        loop
                                        muted
                                        playsInline
                                        className="w-full"
                                        style={{ 
                                          objectFit: fitMode as any,
                                          height: heightStyle
                                        }}
                                      />
                                    ) : (
                                      <img
                                        src={data.image_url}
                                        alt={data.caption || 'Imagen'}
                                        className="w-full"
                                        style={{ 
                                          objectFit: fitMode as any,
                                          height: heightStyle
                                        }}
                                      />
                                    )}
                                  </div>
                                  {data.caption && (
                                    <p className="mt-3 text-xs font-semibold text-stone-500 italic text-center px-4">
                                      {data.caption}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          }

                          // ──── RENDER: TEXT_IMAGE_CTA (Imagen + Texto) ────
                          if (block.block_type === 'text_image_cta') {
                            const isVideo = data.image_url && (data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_'));
                            const fitMode = data.object_fit || 'cover';
                            const heightStyle = data.height_preset === 'small' ? '250px' : data.height_preset === 'medium' ? '400px' : data.height_preset === 'large' ? '550px' : data.height_preset === 'screen' ? '750px' : '380px';
                            const align = data.alignment || 'left';

                            const layoutClass = align === 'right' 
                              ? 'flex flex-col md:flex-row-reverse gap-8 md:gap-12 items-center'
                              : align === 'center'
                              ? 'flex flex-col gap-6'
                              : 'flex flex-col md:flex-row gap-8 md:gap-12 items-center';

                            return (
                              <div key={block.id} className="w-full py-8 px-6">
                                <div className={`w-full max-w-7xl mx-auto ${layoutClass}`}>
                                  {/* Lado Imagen */}
                                  <div className={`w-full ${align === 'center' ? 'max-w-4xl mx-auto' : 'md:w-1/2'} shrink-0 rounded-[2rem] overflow-hidden shadow-luxury border border-stone-100 p-3 bg-white`}>
                                    {data.image_url ? (
                                      <div className="relative overflow-hidden rounded-2xl w-full">
                                        {isVideo ? (
                                          <video
                                            src={data.image_url}
                                            autoPlay
                                            loop
                                            muted
                                            playsInline
                                            className="w-full"
                                            style={{ objectFit: fitMode as any, height: heightStyle }}
                                          />
                                        ) : (
                                          <img
                                            src={data.image_url}
                                            alt={data.caption || data.heading || ''}
                                            className="w-full"
                                            style={{ objectFit: fitMode as any, height: heightStyle }}
                                          />
                                        )}
                                      </div>
                                    ) : (
                                      <div className="w-full h-full min-h-[220px] border-2 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center bg-stone-50/50 py-10 px-4 text-center">
                                        <span className="text-2xl mb-1">🖼️</span>
                                        <span className="text-xs text-stone-500 font-black uppercase tracking-wider">Imagen del Bloque</span>
                                      </div>
                                    )}
                                    {data.caption && (
                                      <p className="text-xs text-stone-400 font-sans italic text-center mt-2.5">{data.caption}</p>
                                    )}
                                  </div>

                                  {/* Lado Texto */}
                                  <div className={`w-full ${align === 'center' ? 'max-w-3xl mx-auto text-center' : 'md:w-1/2 text-left'} flex flex-col justify-center space-y-4`}>
                                    {data.heading && (
                                      <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-extrabold text-stone-800 leading-tight">
                                        {data.heading}
                                      </h3>
                                    )}
                                    {data.subheading && (
                                      <p className="text-stone-600 font-sans text-sm md:text-base leading-relaxed whitespace-pre-line">
                                        {data.subheading}
                                      </p>
                                    )}
                                    {data.cta_text && (
                                      <div className={`pt-2 ${align === 'center' ? 'flex justify-center' : ''}`}>
                                        <Link
                                          href={data.cta_url || '#'}
                                          className="inline-block bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest px-7 py-3.5 rounded-[var(--radius-btn)] shadow-md transition-all duration-300 hover:bg-primary hover:text-white"
                                        >
                                          {data.cta_text}
                                        </Link>
                                      </div>
                                    )}
                                  </div>
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
                                ? 'border border-primary text-primary bg-transparent hover:bg-primary hover:text-white' 
                                : data.style === 'dark_solid' 
                                ? 'bg-stone-900 text-white hover:bg-stone-800' 
                                : 'bg-primary text-white hover:bg-primary/90';

                            return (
                              <div key={block.id} className={`w-full flex ${alignClass} py-3`}>
                                <Link
                                  href={data.url || '#'}
                                  className={`px-7 py-3.5 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-95 ${styleClass}`}
                                >
                                  {data.text || 'Acción'}
                                </Link>
                              </div>
                            );
                          }

                          // ──── RENDER: HERO ────
                          if (block.block_type === 'hero') {
                            const isVideo = data.image_url && (data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_'));
                            return (
                              <div key={block.id} className="relative w-full min-h-[500px] md:min-h-[620px] flex items-center justify-center overflow-hidden w-full rounded-none shadow-luxury">
                                {data.image_url ? (
                                  isVideo ? (
                                    <video src={data.image_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover" />
                                  ) : (
                                    <img src={data.image_url} alt={data.heading} className="absolute inset-0 w-full h-full object-cover" />
                                  )
                                ) : (
                                  <div className="absolute inset-0 bg-stone-900" />
                                )}
                                <div className="absolute inset-0 bg-black/40" />
                                <div className="relative z-10 text-center px-6 max-w-4xl mx-auto space-y-4">
                                  {data.heading && (
                                    <h1 className="font-serif text-4xl md:text-6xl font-extrabold text-white leading-tight">
                                      {data.heading}
                                    </h1>
                                  )}
                                  {data.subheading && (
                                    <p className="text-stone-200 text-lg md:text-xl font-sans max-w-2xl mx-auto leading-relaxed">
                                      {data.subheading}
                                    </p>
                                  )}
                                  {data.cta_text && (
                                    <div className="pt-4">
                                      <Link
                                        href={data.cta_url || '#'}
                                        className="inline-block bg-primary text-white hover:bg-primary/95 px-8 py-4 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95"
                                      >
                                        {data.cta_text}
                                      </Link>
                                    </div>
                                  )}
                                </div>
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

                            const layoutStyle = data.layout === 'grid' ? 'traditional_grid' : (data.layout || 'traditional_grid');

                            return (
                              <div key={block.id} className="w-full py-6">
                                {layoutStyle === 'cards_slider' && (
                                  <div className="w-full overflow-x-auto snap-x snap-mandatory hide-scroll flex gap-6 pb-6" style={{ scrollSnapType: 'x mandatory' }}>
                                    {filteredServices.map((service: any) => {
                                      const preparedSvc = {
                                        ...service,
                                        video_url: service.video_url || (service.image_url?.includes('.mp4') || service.image_url?.includes('.webm') || service.image_url?.includes('video_') ? service.image_url : '')
                                      };
                                      return (
                                        <ServiceCard
                                          key={service.id}
                                          service={preparedSvc}
                                          className="snap-center snap-stop-always"
                                        />
                                      );
                                    })}
                                  </div>
                                )}

                                {layoutStyle === 'bento_grid' && (
                                  <div className="-mx-6 md:-mx-12">
                                    <BentoGridServices
                                      data={{
                                        title: category?.name || 'Nuestros Tratamientos',
                                        subtitle: category?.description || 'Nuestros tratamientos insignia.'
                                      }}
                                      services={filteredServices}
                                    />
                                  </div>
                                )}

                                {layoutStyle === 'traditional_grid' && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {filteredServices.map((service: any) => {
                                      const preparedSvc = {
                                        ...service,
                                        video_url: service.video_url || (service.image_url?.includes('.mp4') || service.image_url?.includes('.webm') || service.image_url?.includes('video_') ? service.image_url : '')
                                      };
                                      return (
                                        <ServiceCard
                                          key={service.id}
                                          service={preparedSvc}
                                          className="w-full aspect-square h-auto md:h-auto"
                                        />
                                      );
                                    })}
                                  </div>
                                )}

                                {layoutStyle === 'minimalist_list' && (
                                  <div className="flex flex-col divide-y divide-stone-200/60 border-t border-b border-stone-200/50">
                                    {filteredServices.map((service: any, idx: number) => {
                                      const hrefPath = `/tratamientos/${service.category_slug || 'general'}/${service.slug || service.id}`;
                                      return (
                                        <div key={service.id} className="flex items-center justify-between py-6 group">
                                          <div className="pr-4">
                                            <span className="text-primary text-[10px] font-bold uppercase tracking-wider block mb-1">
                                              0{idx + 1} · {service.duration_minutes} min
                                            </span>
                                            <Link href={hrefPath} className="inline-block">
                                              <h4 className="text-base font-serif font-bold text-stone-800 hover:text-primary transition-colors leading-tight">
                                                {service.name}
                                              </h4>
                                            </Link>
                                            <p className="text-xs text-stone-400 mt-1.5 max-w-2xl leading-relaxed">
                                              {service.description}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-6 shrink-0">
                                            <span className="text-stone-700 text-sm font-black">{service.price} €</span>
                                            <Link href={hrefPath} className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-stone-900 border-b border-transparent hover:border-stone-950/40 pb-0.5 transition-all">
                                              {data.link_text || 'Ver'} →
                                            </Link>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
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
            <div className="w-16 h-[2px] bg-primary rounded-full mb-10" />

            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary block mb-4">
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
              className="inline-flex items-center gap-2 text-sm font-bold text-stone-500 hover:text-primary transition-colors duration-300 group"
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
