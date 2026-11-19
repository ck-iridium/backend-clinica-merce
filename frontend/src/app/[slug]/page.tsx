export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import BentoGridServices from '@/components/blocks/BentoGridServices';
import ServiceCard from '@/components/ServiceCard';
import TreatmentCarousel from '@/components/TreatmentCarousel';
import InspectableSection, { EmptyColumnDropZone } from '@/components/ai/webmaster/InspectableSection';
import Link from 'next/link';

// Tipos estructurales del Page Builder
interface AtomicBlock {
  id: string;
  block_type:
    | 'atomic_title'
    | 'atomic_text'
    | 'atomic_image'
    | 'atomic_button'
    | 'atomic_category'
    | 'title_heading'
    | 'text_image_cta'
    | 'hero'
    | 'quote_testimonial'
    | 'features_grid'
    | 'accordion_faq'
    | 'separator_spacer';
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
  content_width?: 'boxed' | 'fullwidth';
  horizontal_alignment?: string;
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

function normalizeSlug(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function matchSlug(itemPath: string, targetSlug: string): boolean {
  const cleanItem = normalizeSlug(itemPath.replace(/^\//, ''));
  const cleanTarget = normalizeSlug(targetSlug);
  if (cleanItem === cleanTarget) return true;
  const stripItem = cleanItem.replace(/-+/g, '');
  const stripTarget = cleanTarget.replace(/-+/g, '');
  return stripItem === stripTarget;
}

// Metadata dinámica por página
export async function generateMetadata({ params }: PageProps) {
  const { slug } = params;

  if (slug.startsWith('google') && slug.endsWith('.html')) {
    return {
      title: `Google Verification - ${slug}`,
      robots: 'noindex, nofollow',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');

  if (!baseUrl || !tenantId) return {};

  try {
    const res = await fetch(`${baseUrl}/cms/navigation`, {
      cache: 'no-store',
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (res.ok) {
      const navItems: any[] = await res.json();
      const page = navItems.find((item) => matchSlug(item.path, slug) && item.is_custom);
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

  // Verificación dinámica de Google Search Console si se solicita un archivo google*.html
  if (slug.startsWith('google') && slug.endsWith('.html')) {
    return (
      <div style={{ fontFamily: 'monospace', padding: 24, background: '#ffffff', color: '#111827' }}>
        google-site-verification: {slug}
      </div>
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const requestHeaders = headers();
  const tenantId = requestHeaders.get('x-tenant-id');

  if (!baseUrl || !tenantId) {
    notFound();
  }

  // 1. Verificar si la página existe en SiteNavigation (con tolerancia a acentos y guiones)
  let pageTitle = slug.replace(/-/g, ' ');
  let targetBlockSlug = slug;
  try {
    const resNav = await fetch(`${baseUrl}/cms/navigation`, {
      cache: 'no-store',
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (resNav.ok) {
      const navItems: any[] = await resNav.json();
      const page = navItems.find((item) => matchSlug(item.path, slug) && item.is_custom);
      if (page) {
        pageTitle = page.label;
        targetBlockSlug = page.path.replace(/^\//, '');
      }
    }
  } catch {
    // Silencioso
  }

  // 2. Cargar los bloques y normalizarlos de forma retrocompatible
  let rawBlocks: any[] = [];
  try {
    let resBlocks = await fetch(`${baseUrl}/cms/blocks/${targetBlockSlug}`, {
      cache: 'no-store',
      headers: { 'X-Tenant-ID': tenantId },
    });
    if (!resBlocks.ok && targetBlockSlug !== slug) {
      resBlocks = await fetch(`${baseUrl}/cms/blocks/${slug}`, {
        cache: 'no-store',
        headers: { 'X-Tenant-ID': tenantId },
      });
    }
    if (resBlocks.ok) {
      rawBlocks = await resBlocks.json();
    }
  } catch {
    // Silencioso
  }

  // Si no se encontró ni en navigation ni tiene bloques, solo entonces es 404
  if (!rawBlocks.length && pageTitle === slug.replace(/-/g, ' ')) {
    notFound();
  }

  // Normalización defensiva para páginas con bloques antiguos/planos
  const sections: SectionBlock[] = rawBlocks.map((block: any, idx: number) => {
    if (block.block_type === 'section') {
      return block;
    } else {
      const bData = block.content_data || {};
      const generatedBlocks: any[] = [];

      if (bData.title && (block.block_type === 'text' || block.block_type === 'atomic_text')) {
        generatedBlocks.push({
          id: `atomic-title-${block.id}`,
          block_type: 'atomic_title',
          content_data: {
            title: bData.title,
            title_tag: 'h1',
            alignment: 'center',
            show_divider: true,
            subtitle: bData.seo_description || 'Excelencia y distinción en cada detalle.'
          }
        });
      }

      generatedBlocks.push({
        id: `atomic-${block.id}`,
        block_type: block.block_type.startsWith('atomic_') 
          ? block.block_type 
          : `atomic_${block.block_type}`,
        content_data: {
          ...bData,
          html: bData.html || bData.body_html || bData.text || ''
        }
      });

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
              blocks: generatedBlocks
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
      fetch(`${baseUrl}/service-categories/`, { 
        next: { revalidate: 3600, tags: [`tenant-${tenantId}`, `tenant-${tenantId}-categories`] },
        headers: { 'X-Tenant-ID': tenantId } 
      }),
      fetch(`${baseUrl}/services/`, { 
        next: { revalidate: 3600, tags: [`tenant-${tenantId}`, `tenant-${tenantId}-services`] },
        headers: { 'X-Tenant-ID': tenantId } 
      })
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

              // Espaciados Quiet Luxury, fondos y anchos
              const hasHero = columns.some(col => (col.blocks || []).some(b => b.block_type === 'hero'));
              const hasCardsSlider = columns.some(col => 
                (col.blocks || []).some(b => {
                  if (b.block_type !== 'atomic_category') return false;
                  const l = b.content_data?.layout;
                  return !l || l === 'cards_slider' || l === 'slider';
                })
              );
              const isFirstWithHero = index === 0 && hasHero;
              const isFirstSection = index === 0;
              const pySpacing = isFirstWithHero 
                ? 'pt-0 pb-0' 
                : hasHero 
                ? 'py-0' 
                : isFirstSection 
                ? 'pt-6 md:pt-8 pb-12 md:pb-16' 
                : (struct.py_spacing || 'py-20');

              const rawBg = struct.bg_color || 'cream';
              const isCustomHex = rawBg.startsWith('#');
              const isDark = rawBg === 'dark' || rawBg === 'anthracite' || rawBg === '#1c1917' || rawBg === '#121212';
              const bgColor = isCustomHex
                ? ''
                : rawBg === 'white'
                ? 'bg-white'
                : rawBg === 'dark' || rawBg === 'anthracite'
                ? 'bg-stone-900 text-white'
                : rawBg === 'soft_gold'
                ? 'bg-[#FAF7F0]'
                : 'bg-[#FAFAFA]';

              const isFullWidth = struct.content_width === 'fullwidth';
              const paddingClass = (hasHero || hasCardsSlider) ? 'px-0' : (isFullWidth ? 'px-4 md:px-8' : 'px-6 md:px-12');
              const widthClass = (hasHero || hasCardsSlider) ? 'w-full' : (isFullWidth ? 'w-full grid' : 'max-w-7xl mx-auto grid');
              const verticalAlign = struct.vertical_alignment || 'items-start';
              const horizontalAlign = struct.horizontal_alignment || 'justify-start';

              return (
                <InspectableSection
                  key={section.id}
                  id={section.id}
                  name={`Sección ${index + 1} (${columnsCount} ${columnsCount === 1 ? 'columna' : 'columnas'})`}
                  pageSlug={slug}
                  blockType="section"
                >
                  <section
                    style={isCustomHex ? { backgroundColor: rawBg } : undefined}
                    className={`w-full ${pySpacing} ${bgColor} ${paddingClass} ${isDark ? 'text-white' : ''} transition-all duration-300 border-b border-stone-100/30`}
                  >
                    <div className={`${widthClass} ${(hasHero || hasCardsSlider) ? '' : gridClass} ${verticalAlign} ${horizontalAlign}`}>
                    {columns.map((col, colIdx) => (
                      <div key={col.id} className="flex flex-col gap-6 justify-center">
                        {(col.blocks || []).length === 0 ? (
                          <EmptyColumnDropZone
                            colIndex={colIdx}
                            totalCols={columnsCount}
                            sectionId={section.id}
                            pageSlug={slug}
                          />
                        ) : (
                          (col.blocks || []).map((block) => {
                          const data = block.content_data || {};

                          // ──── RENDER: ATOMIC TITLE ────
                          if (block.block_type === 'atomic_title' || block.block_type === 'title_heading') {
                            const Tag = (data.title_tag || 'h2') as keyof JSX.IntrinsicElements;
                            const alignment = data.alignment || 'center';
                            const alignClass = 
                              alignment === 'left' ? 'text-left' : 
                              alignment === 'right' ? 'text-right' : 
                              'text-center';

                            // Fuentes preestablecidas
                            const fontClass = 
                              data.font_family === 'inter' ? 'font-sans' :
                              data.font_family === 'cormorant' ? 'font-serif italic tracking-wide' :
                              data.font_family === 'cinzel' ? 'font-serif uppercase tracking-[0.2em]' :
                              data.font_family === 'montserrat' ? 'font-sans tracking-wide font-bold' :
                              'font-serif';
                              
                            // Grosor
                            const weightClass = 
                              data.font_weight === 'normal' ? 'font-normal' :
                              data.font_weight === 'medium' ? 'font-medium' :
                              data.font_weight === 'semibold' ? 'font-semibold' :
                              data.font_weight === 'bold' ? 'font-bold' :
                              data.font_weight === 'extrabold' ? 'font-black' :
                              'font-extrabold';

                            // Tamaño
                            const sizeClass = 
                              data.font_size === 'small' ? 'text-xl md:text-2xl' :
                              data.font_size === 'large' ? 'text-3xl md:text-5xl' :
                              data.font_size === 'xlarge' ? 'text-4xl md:text-6xl' :
                              'text-2xl md:text-4xl';

                            // Transformación
                            const transformClass = 
                              data.text_transform === 'uppercase' ? 'uppercase tracking-widest' :
                              data.text_transform === 'italic' ? 'italic' :
                              '';

                            // Color
                            const colorClass = 
                              data.text_color === 'gold' ? 'text-[#d4af37]' :
                              data.text_color === 'white' ? 'text-white' :
                              data.text_color === 'stone-400' ? 'text-stone-400' :
                              'text-stone-900';

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name={`Título: "${data.title || 'Encabezado'}"`}
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className={`w-full ${alignClass} py-3`}>
                                  <Tag className={`${fontClass} ${weightClass} ${sizeClass} ${transformClass} ${colorClass} leading-tight`}>
                                    {data.title}
                                  </Tag>
                                  {data.show_divider !== false && (
                                    <div className={`w-12 h-[2px] bg-[#d4af37] mt-4 rounded-full ${alignment === 'center' ? 'mx-auto' : alignment === 'right' ? 'ml-auto' : ''}`} />
                                  )}
                                  {data.subtitle && (
                                    <p className="text-stone-400 text-sm mt-3 font-sans max-w-lg mx-auto">
                                      {data.subtitle}
                                    </p>
                                  )}
                                </div>
                              </InspectableSection>
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
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name="Texto Editorial"
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div
                                  className={`prose prose-stone max-w-none text-stone-600 font-sans text-base leading-relaxed py-2 ${alignClass}`}
                                  dangerouslySetInnerHTML={{ __html: data.html || data.body_html || data.text || '' }}
                                />
                              </InspectableSection>
                            );
                          }

                          // ──── RENDER: ATOMIC IMAGE ────
                          if (block.block_type === 'atomic_image') {
                            const alignment = data.alignment || 'center';
                            const isFullWidth = alignment === 'full_width';
                            const fitMode = data.object_fit || 'cover';
                            const heightStyle = data.height_preset === 'small' ? '250px' : data.height_preset === 'medium' ? '400px' : data.height_preset === 'large' ? '550px' : data.height_preset === 'screen' ? '750px' : (fitMode !== 'none' ? '380px' : 'auto');

                            if (!data.image_url) {
                              return (
                                <InspectableSection
                                  key={block.id}
                                  id={block.id}
                                  name="Fotografía / Espacio de Imagen"
                                  pageSlug={slug}
                                  blockType={block.block_type}
                                >
                                  <div className={`w-full py-4 flex ${alignment === 'left' ? 'justify-start' : alignment === 'right' ? 'justify-end' : 'justify-center'}`}>
                                    <div className="w-full max-w-xl h-56 rounded-3xl border-2 border-dashed border-stone-200/80 bg-stone-50/70 flex flex-col items-center justify-center p-6 text-stone-400 gap-2">
                                      <span className="text-2xl">🖼️</span>
                                      <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">{data.caption || 'Espacio para Fotografía Editorial'}</span>
                                      <span className="text-[11px] text-stone-400">Edita este bloque desde el Diseñador Web para seleccionar una imagen</span>
                                    </div>
                                  </div>
                                </InspectableSection>
                              );
                            }

                            const isVideo = data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_');

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name="Fotografía Editorial"
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className={`w-full py-4 flex ${
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
                                          preload="none"
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
                              </InspectableSection>
                            );
                          }

                          // ──── RENDER: TEXT_IMAGE_CTA (Imagen + Texto) ────
                          if (block.block_type === 'text_image_cta') {
                            const isVideo = data.image_url && (data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_'));
                            const fitMode = data.object_fit || 'cover';
                            const heightStyle = data.height_preset === 'small' ? '250px' : data.height_preset === 'medium' ? '400px' : data.height_preset === 'large' ? '550px' : data.height_preset === 'screen' ? '750px' : '380px';
                            const layout = data.layout || (data.alignment === 'right' ? 'image_right' : data.alignment === 'center' ? 'image_top' : 'image_left');
                            const isStacked = layout === 'image_top' || layout === 'image_bottom';

                            const layoutClass = 
                              layout === 'image_right' 
                                ? 'flex flex-col md:flex-row-reverse gap-8 md:gap-14 items-center'
                                : layout === 'image_top'
                                ? 'flex flex-col gap-8 items-center max-w-4xl mx-auto'
                                : layout === 'image_bottom'
                                ? 'flex flex-col-reverse gap-8 items-center max-w-4xl mx-auto'
                                : 'flex flex-col md:flex-row gap-8 md:gap-14 items-center';

                            const imageContainerClass = isStacked
                              ? 'w-full max-w-3xl mx-auto'
                              : 'w-full md:w-1/2';

                            const textContainerClass = isStacked
                              ? 'w-full max-w-2xl mx-auto text-center items-center'
                              : 'w-full md:w-1/2 text-left items-start';

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name="Imagen + Texto Editorial"
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className="w-full py-8 px-6">
                                  <div className={`w-full max-w-7xl mx-auto ${layoutClass}`}>
                                    {/* Lado Imagen */}
                                    <div className={`${imageContainerClass} shrink-0 rounded-[2rem] overflow-hidden shadow-luxury border border-stone-100 p-3 bg-white`}>
                                      {data.image_url ? (
                                        <div className="relative overflow-hidden rounded-2xl w-full">
                                          {isVideo ? (
                                            <video
                                              src={data.image_url}
                                              autoPlay
                                              loop
                                              muted
                                              playsInline
                                              preload="none"
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
                                    <div className={`${textContainerClass} flex flex-col justify-center space-y-4`}>
                                      {(data.heading || data.title) && (
                                        <h3 className="font-serif text-2xl md:text-3xl lg:text-4xl font-extrabold text-stone-800 leading-tight">
                                          {data.heading || data.title}
                                        </h3>
                                      )}
                                      {(data.subheading || data.description || data.text) && (
                                        <p className="text-stone-600 font-sans text-sm md:text-base leading-relaxed whitespace-pre-line">
                                          {data.subheading || data.description || data.text}
                                        </p>
                                      )}
                                      {(data.cta_text || data.button_text) && (
                                        <div className={`pt-2 ${isStacked ? 'flex justify-center' : ''}`}>
                                          <Link
                                            href={data.cta_url || data.button_url || data.url || '#'}
                                            className="inline-block bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest px-7 py-3.5 rounded-[var(--radius-btn)] shadow-md transition-all duration-300 hover:bg-primary hover:text-white"
                                          >
                                            {data.cta_text || data.button_text}
                                          </Link>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </InspectableSection>
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
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name="Botón de Acción"
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className={`w-full flex ${alignClass} py-3`}>
                                  <Link
                                    href={data.url || '#'}
                                    className={`px-7 py-3.5 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-sm active:scale-95 ${styleClass}`}
                                  >
                                    {data.text || 'Acción'}
                                  </Link>
                                </div>
                              </InspectableSection>
                            );
                          }

                          // ──── RENDER: HERO ────
                          if (block.block_type === 'hero') {
                            const isVideo = data.image_url && (data.image_url.includes('.mp4') || data.image_url.includes('.webm') || data.image_url.includes('video_'));
                            const heroAlign = data.alignment || 'center';
                            const heroAlignContainer = 
                              heroAlign === 'left' ? 'text-left items-start mr-auto' :
                              heroAlign === 'right' ? 'text-right items-end ml-auto' :
                              'text-center items-center mx-auto';
                            const heroSubAlign = 
                              heroAlign === 'left' ? 'mr-auto ml-0' :
                              heroAlign === 'right' ? 'ml-auto mr-0' :
                              'mx-auto';
                            const heroOuterAlign = 
                              heroAlign === 'left' ? 'justify-start px-8 md:px-16' :
                              heroAlign === 'right' ? 'justify-end px-8 md:px-16' :
                              'justify-center px-6';

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name="Hero Principal"
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className={`relative w-full min-h-[500px] md:min-h-[620px] flex items-center ${heroOuterAlign} overflow-hidden w-full rounded-none shadow-luxury`}>
                                  {data.image_url ? (
                                    isVideo ? (
                                      <video src={data.image_url} autoPlay loop muted playsInline preload="none" className="absolute inset-0 w-full h-full object-cover" />
                                    ) : (
                                      <img src={data.image_url} alt={data.heading} fetchPriority="high" loading="eager" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
                                    )
                                  ) : (
                                    <div className="absolute inset-0 bg-stone-900" />
                                  )}
                                  <div className="absolute inset-0 bg-black/40" />
                                  <div className={`relative z-10 ${heroAlignContainer} max-w-4xl space-y-4`}>
                                    {(data.heading || data.title) && (
                                      <h1 className="font-serif text-4xl md:text-6xl font-extrabold text-white leading-tight">
                                        {data.heading || data.title}
                                      </h1>
                                    )}
                                    {(data.subheading || data.subtitle || data.description) && (
                                      <p className={`text-stone-200 text-lg md:text-xl font-sans max-w-2xl ${heroSubAlign} leading-relaxed`}>
                                        {data.subheading || data.subtitle || data.description}
                                      </p>
                                    )}
                                    {(data.cta_text || data.button_text) && (
                                      <div className="pt-4">
                                        <Link
                                          href={data.cta_url || data.button_url || data.url || '#'}
                                          className="inline-block bg-primary text-white hover:bg-primary/95 px-8 py-4 rounded-[var(--radius-btn)] text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95"
                                        >
                                          {data.cta_text || data.button_text}
                                        </Link>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </InspectableSection>
                            );
                          }

                          // ──── RENDER: ATOMIC CATEGORY ────
                          if (block.block_type === 'atomic_category') {
                            let catId = data.category_id;
                            if (!catId && dbCategories.length > 0) {
                              catId = dbCategories[0]?.id;
                            }
                            const category = dbCategories.find(c => c.id === catId);
                            let filteredServices = catId 
                              ? dbServices.filter(svc => svc.category_id === catId && svc.is_active)
                              : dbServices.filter(svc => svc.is_active);

                            if (data.selected_treatment_ids && data.selected_treatment_ids.length > 0) {
                              const selected = filteredServices.filter(svc => data.selected_treatment_ids.includes(svc.id));
                              if (selected.length > 0) filteredServices = selected;
                            }

                            if (data.max_items) {
                              filteredServices = filteredServices.slice(0, data.max_items);
                            }

                            if (filteredServices.length === 0 && dbServices.length > 0) {
                              filteredServices = dbServices.filter(svc => svc.is_active).slice(0, 6);
                            }

                            if (filteredServices.length === 0) {
                              return (
                                <InspectableSection
                                  key={block.id}
                                  id={block.id}
                                  name={`Catálogo: ${category?.name || 'Tratamientos'}`}
                                  pageSlug={slug}
                                  blockType={block.block_type}
                                >
                                  <div className="w-full py-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-200 p-6">
                                    <p className="text-xs font-bold uppercase tracking-wider text-stone-400">Catálogo de Servicios · Sin tratamientos activos</p>
                                  </div>
                                </InspectableSection>
                              );
                            }

                            const rawLayout = data.layout || 'cards_slider';
                            const layoutStyle = 
                              rawLayout === 'slider' ? 'cards_slider' :
                              rawLayout === 'bento' ? 'bento_grid' :
                              rawLayout === 'grid' ? 'traditional_grid' :
                              rawLayout === 'list' ? 'minimalist_list' :
                              rawLayout;

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name={`Catálogo: ${category?.name || 'Tratamientos'}`}
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className="w-full py-6">
                                  {layoutStyle === 'cards_slider' && (
                                    <div className="w-full flex flex-col justify-center pb-4">
                                      {/* Cabecera de categoría idéntica a la Home */}
                                      <div className="w-full max-w-7xl mx-auto px-6 mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-3">
                                        <div className="max-w-2xl">
                                          <h2 className="text-2xl md:text-4xl font-serif font-extrabold text-stone-900 leading-tight">
                                            {category?.name || 'Nuestros Tratamientos'}
                                          </h2>
                                          {category?.description && (
                                            <p className="text-sm md:text-base text-stone-500 mt-1 font-sans">
                                              {category.description}
                                            </p>
                                          )}
                                        </div>
                                        <Link
                                          href={`/tratamientos/${category?.slug || category?.id || ''}`}
                                          className="self-start md:self-auto inline-flex items-center gap-1.5 font-black text-primary hover:text-stone-900 transition-colors uppercase tracking-widest text-xs"
                                        >
                                          <span>{data.link_text || 'Ver Catálogo'}</span>
                                          <span className="text-base">→</span>
                                        </Link>
                                      </div>

                                      {/* DESKTOP VIEW CON FLECHAS Y CARRUSEL OFICIAL EDGE-TO-EDGE */}
                                      <div className="hidden md:block w-full">
                                        {filteredServices.length === 1 && (
                                          <div className="max-w-7xl mx-auto px-6">
                                            <div className="w-full aspect-[16/9] md:h-[500px]">
                                              <ServiceCard service={filteredServices[0]} className="w-full h-full" />
                                            </div>
                                          </div>
                                        )}
                                        {filteredServices.length === 2 && (
                                          <div className="max-w-7xl mx-auto px-6 flex justify-center gap-8">
                                            <div className="w-[372px] h-[662px]">
                                              <ServiceCard service={filteredServices[0]} className="w-full h-full" />
                                            </div>
                                            <div className="w-[372px] h-[662px]">
                                              <ServiceCard service={filteredServices[1]} className="w-full h-full" />
                                            </div>
                                          </div>
                                        )}
                                        {filteredServices.length >= 3 && (
                                          <TreatmentCarousel servicios={filteredServices} loop={true} />
                                        )}
                                      </div>

                                      {/* MOBILE VIEW */}
                                      <div className="md:hidden flex overflow-x-auto snap-x-mandatory hide-scroll gap-4 px-6 items-stretch w-full pb-4">
                                        {filteredServices.map((svc: any) => (
                                          <ServiceCard key={svc.id} service={svc} className="snap-stop-always shrink-0 w-[85vw]" />
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {layoutStyle === 'bento_grid' && (
                                    <div className="-mx-6 md:-mx-12">
                                      <BentoGridServices
                                        data={{
                                          title: category?.name || 'Nuestros Tratamientos',
                                          subtitle: category?.description || 'Nuestros tratamientos insignia.',
                                          max_services: data.max_items || 6
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
                              </InspectableSection>
                            );
                          }

                          // ──── RENDER: QUOTE TESTIMONIAL ────
                          if (block.block_type === 'quote_testimonial') {
                            const quote = data.quote || 'Nuestra prioridad es la armonía natural y el cuidado de cada detalle para realzar tu belleza única.';
                            const author = data.author || 'Dra. Mercè Guasch';
                            const role = data.role || 'Directora Médica & Especialista';
                            const rating = data.rating ?? 5;
                            const avatarUrl = data.avatar_url;

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name={`Testimonio: ${author}`}
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className="w-full py-10 px-4 flex justify-center">
                                  <div className="w-full max-w-3xl bg-white/95 rounded-3xl p-8 md:p-12 border border-stone-200/80 shadow-luxury text-center relative">
                                    <div className="w-12 h-12 rounded-full bg-amber-50 text-primary border border-amber-200/60 flex items-center justify-center mx-auto mb-5 shadow-xs">
                                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                                      </svg>
                                    </div>
                                    {rating > 0 && (
                                      <div className="flex justify-center gap-1 mb-4 text-primary">
                                        {Array.from({ length: 5 }, (_, i) => (
                                          <svg
                                            key={i}
                                            className={`w-4 h-4 ${i < rating ? 'fill-primary' : 'fill-stone-200 text-stone-200'}`}
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        ))}
                                      </div>
                                    )}
                                    <p className="font-serif text-xl md:text-2xl text-stone-800 italic leading-relaxed mb-6">
                                      “{quote}”
                                    </p>
                                    <div className="flex items-center justify-center gap-3">
                                      {avatarUrl ? (
                                        <img src={avatarUrl} alt={author} className="w-12 h-12 rounded-full object-cover border-2 border-primary/40 shadow-xs" />
                                      ) : (
                                        <div className="w-10 h-10 rounded-full bg-stone-900 text-primary font-serif font-bold text-sm flex items-center justify-center border border-stone-800 shadow-xs">
                                          {author.charAt(0)}
                                        </div>
                                      )}
                                      <div className="text-left">
                                        <span className="font-serif font-bold text-sm text-stone-900 block leading-tight">{author}</span>
                                        <span className="text-[11px] font-sans text-primary uppercase tracking-wider font-semibold block mt-0.5">{role}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </InspectableSection>
                            );
                          }

                          // ──── RENDER: FEATURES GRID ────
                          if (block.block_type === 'features_grid') {
                            const heading = data.heading || 'Pilares de Excelencia';
                            const subheading = data.subheading;
                            const items: any[] = Array.isArray(data.items) && data.items.length > 0 ? data.items : [];
                            const colClass = items.length === 2 ? 'grid-cols-1 md:grid-cols-2' : items.length === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-3';

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name={`Pilares: ${heading}`}
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className="w-full py-12 px-6">
                                  <div className="max-w-7xl mx-auto">
                                    {(heading || subheading) && (
                                      <div className="text-center mb-12 max-w-2xl mx-auto">
                                        {heading && (
                                          <h3 className="font-serif text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight">
                                            {heading}
                                          </h3>
                                        )}
                                        {subheading && (
                                          <p className="text-stone-500 text-base font-sans mt-3">
                                            {subheading}
                                          </p>
                                        )}
                                        <div className="w-12 h-0.5 bg-primary mx-auto mt-5" />
                                      </div>
                                    )}
                                    <div className={`grid ${colClass} gap-8`}>
                                      {items.map((item, idx) => (
                                        <div
                                          key={idx}
                                          className="bg-white rounded-3xl p-8 border border-stone-150 shadow-luxury hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                                        >
                                          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-primary border border-amber-200/70 flex items-center justify-center font-serif font-black text-base mb-6 shadow-2xs">
                                            0{idx + 1}
                                          </div>
                                          <h4 className="font-serif font-bold text-xl text-stone-900 mb-3">
                                            {item.title}
                                          </h4>
                                          <p className="text-stone-600 text-sm font-sans leading-relaxed">
                                            {item.description}
                                          </p>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </InspectableSection>
                            );
                          }

                          // ──── RENDER: ACCORDION FAQ ────
                          if (block.block_type === 'accordion_faq') {
                            const heading = data.heading || 'Preguntas Frecuentes';
                            const subheading = data.subheading;
                            const items: any[] = Array.isArray(data.items) && data.items.length > 0 ? data.items : [];

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name={`FAQ: ${heading}`}
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className="w-full py-12 px-6">
                                  <div className="max-w-4xl mx-auto">
                                    {(heading || subheading) && (
                                      <div className="text-center mb-10">
                                        {heading && (
                                          <h3 className="font-serif text-3xl md:text-4xl font-extrabold text-stone-900 leading-tight">
                                            {heading}
                                          </h3>
                                        )}
                                        {subheading && (
                                          <p className="text-stone-500 text-base font-sans mt-2">
                                            {subheading}
                                          </p>
                                        )}
                                      </div>
                                    )}
                                    <div className="space-y-4">
                                      {items.map((item, idx) => (
                                        <details
                                          key={idx}
                                          className="group bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs transition-all"
                                          open={idx === 0}
                                        >
                                          <summary className="w-full px-7 py-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-stone-50/50 list-none select-none">
                                            <span className="font-serif font-bold text-lg text-stone-800 group-hover:text-primary transition-colors">
                                              {item.question}
                                            </span>
                                            <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-500 shrink-0 group-open:rotate-180 group-open:bg-amber-50 group-open:text-primary transition-all duration-300">
                                              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                              </svg>
                                            </div>
                                          </summary>
                                          <div className="px-7 pb-6 pt-1 text-stone-600 text-sm font-sans leading-relaxed border-t border-stone-100">
                                            {item.answer}
                                          </div>
                                        </details>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </InspectableSection>
                            );
                          }

                          // ──── RENDER: SEPARATOR SPACER ────
                          if (block.block_type === 'separator_spacer') {
                            const spacing = data.spacing || 'medium';
                            const style = data.style || 'line_gold';
                            const pyClass = spacing === 'small' ? 'py-4' : spacing === 'large' ? 'py-16' : 'py-8';

                            return (
                              <InspectableSection
                                key={block.id}
                                id={block.id}
                                name="Divisor Decorativo"
                                pageSlug={slug}
                                blockType={block.block_type}
                              >
                                <div className={`w-full ${pyClass} flex items-center justify-center px-6`}>
                                  {style === 'line_gold' && (
                                    <div className="w-full max-w-xl flex items-center gap-3">
                                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                                      <div className="w-2 h-2 rotate-45 border border-primary bg-amber-50" />
                                      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
                                    </div>
                                  )}
                                  {style === 'line_subtle' && (
                                    <div className="w-full max-w-2xl h-px bg-stone-200" />
                                  )}
                                  {style === 'spacer_only' && <div className="w-full h-1" />}
                                </div>
                              </InspectableSection>
                            );
                          }

                          return null;
                        })
                      )}
                      </div>
                    ))}
                  </div>
                </section>
              </InspectableSection>
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
