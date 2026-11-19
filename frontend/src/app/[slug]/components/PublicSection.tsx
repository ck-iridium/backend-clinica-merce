import React from 'react';
import InspectableSection, { EmptyColumnDropZone } from '@/components/ai/webmaster/InspectableSection';
import type { SectionBlock } from '../types';
import { PublicBlockDispatcher } from './PublicBlockDispatcher';

interface PublicSectionProps {
  section: SectionBlock;
  index: number;
  slug: string;
  dbCategories: any[];
  dbServices: any[];
}

export function PublicSection({
  section,
  index,
  slug,
  dbCategories,
  dbServices,
}: PublicSectionProps) {
  const struct = section.content_data || { columns_count: 1, columns: [] };
  const columnsCount = struct.columns_count || 1;
  const columns = struct.columns || [];

  // Clases CSS Grid según el conteo de columnas
  let gridClass = 'grid-cols-1';
  if (columnsCount === 2) gridClass = 'grid-cols-1 md:grid-cols-2 gap-8 md:gap-12';
  if (columnsCount === 3) gridClass = 'grid-cols-1 md:grid-cols-3 gap-6 md:gap-8';
  if (columnsCount === 4) gridClass = 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6';

  // Espaciados Quiet Luxury, fondos y anchos
  const hasHero = columns.some((col) =>
    (col.blocks || []).some((b) => b.block_type === 'hero')
  );
  const hasCardsSlider = columns.some((col) =>
    (col.blocks || []).some((b) => {
      if (b.block_type !== 'atomic_category') return false;
      const l = b.content_data?.layout;
      return !l || l === 'cards_slider' || l === 'slider';
    })
  );
  const isFirstWithHero = index === 0 && hasHero;
  const isFirstSection = index === 0;
  // Márgenes / espaciados verticales configurables (Top & Bottom)
  const SPACING_TOP_MAP: Record<string, string> = {
    none: 'pt-0',
    sm: 'pt-6 md:pt-8',
    md: 'pt-12 md:pt-16',
    lg: 'pt-20 md:pt-24',
    xl: 'pt-28 md:pt-36',
  };

  const SPACING_BOTTOM_MAP: Record<string, string> = {
    none: 'pb-0',
    sm: 'pb-6 md:pb-8',
    md: 'pb-12 md:pb-16',
    lg: 'pb-20 md:pb-24',
    xl: 'pb-28 md:pb-36',
  };

  const ptClass = struct.padding_top && SPACING_TOP_MAP[struct.padding_top]
    ? SPACING_TOP_MAP[struct.padding_top]
    : isFirstWithHero
    ? 'pt-0'
    : hasHero
    ? 'pt-0'
    : isFirstSection
    ? 'pt-6 md:pt-8'
    : struct.py_spacing || 'pt-20';

  const pbClass = struct.padding_bottom && SPACING_BOTTOM_MAP[struct.padding_bottom]
    ? SPACING_BOTTOM_MAP[struct.padding_bottom]
    : isFirstWithHero
    ? 'pb-0'
    : hasHero
    ? 'pb-0'
    : isFirstSection
    ? 'pb-12 md:pb-16'
    : struct.py_spacing || 'pb-20';

  const rawBg = struct.bg_color || 'cream';
  const isCustomHex = rawBg.startsWith('#');
  const isDark =
    rawBg === 'dark' ||
    rawBg === 'anthracite' ||
    rawBg === '#1c1917' ||
    rawBg === '#121212';
  const bgColor = isCustomHex
    ? ''
    : rawBg === 'white'
    ? 'bg-white'
    : rawBg === 'dark' || rawBg === 'anthracite'
    ? 'bg-stone-900 text-white'
    : rawBg === 'soft_gold'
    ? 'bg-[#FAF7F0]'
    : 'bg-[#FAFAFA]';

  // Modos de ancho: 'boxed' (Todo Boxed) | 'fullwidth' (Todo Fullwidth) | 'fullwidth_boxed' (Fondo Fullwidth, Contenido Boxed)
  const contentWidth = struct.content_width || 'boxed';
  const isAllBoxed = contentWidth === 'boxed';
  const isAllFullWidth = contentWidth === 'fullwidth';

  const verticalAlign = struct.vertical_alignment || 'items-start';
  const horizontalAlign = struct.horizontal_alignment || 'justify-start';

  // ── 1. Caso TODO BOXED: La sección entera es una caja centrada contenida ──
  if (isAllBoxed) {
    return (
      <InspectableSection
        key={section.id}
        id={section.id}
        name={`Sección ${index + 1} (${columnsCount} ${
          columnsCount === 1 ? 'columna' : 'columnas'
        })`}
        pageSlug={slug}
        blockType="section"
      >
        <div className="w-full px-4 md:px-6 my-4 md:my-6">
          <section
            style={isCustomHex ? { backgroundColor: rawBg } : undefined}
            className={`max-w-7xl mx-auto w-full ${ptClass} ${pbClass} ${bgColor} rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-luxury border border-stone-200/40 ${
              isDark ? 'text-white' : ''
            } transition-all duration-300`}
          >
            <div
              className={`w-full ${
                hasHero || hasCardsSlider ? '' : `grid ${gridClass} px-6 md:px-12`
              } ${verticalAlign} ${horizontalAlign}`}
            >
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
                    (col.blocks || []).map((block) => (
                      <PublicBlockDispatcher
                        key={block.id}
                        block={block}
                        slug={slug}
                        dbCategories={dbCategories}
                        dbServices={dbServices}
                        isBoxed={true}
                        sectionVerticalAlign={verticalAlign}
                      />
                    ))
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </InspectableSection>
    );
  }

  // ── 2 y 3. Casos TODO FULLWIDTH o FONDO FULLWIDTH CON CONTENIDO BOXED ──
  const innerContentClass = isAllFullWidth
    ? (hasHero || hasCardsSlider ? 'w-full' : `w-full grid ${gridClass} px-4 md:px-8`)
    : (hasHero ? 'w-full' : `max-w-7xl mx-auto px-6 w-full grid ${gridClass}`);

  return (
    <InspectableSection
      key={section.id}
      id={section.id}
      name={`Sección ${index + 1} (${columnsCount} ${
        columnsCount === 1 ? 'columna' : 'columnas'
      })`}
      pageSlug={slug}
      blockType="section"
    >
      <section
        style={isCustomHex ? { backgroundColor: rawBg } : undefined}
        className={`w-full ${ptClass} ${pbClass} ${bgColor} ${
          isDark ? 'text-white' : ''
        } transition-all duration-300 border-b border-stone-100/30`}
      >
        <div
          className={`${innerContentClass} ${verticalAlign} ${horizontalAlign}`}
        >
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
                (col.blocks || []).map((block) => (
                  <PublicBlockDispatcher
                    key={block.id}
                    block={block}
                    slug={slug}
                    dbCategories={dbCategories}
                    dbServices={dbServices}
                    isBoxed={false}
                    sectionVerticalAlign={verticalAlign}
                  />
                ))
              )}
            </div>
          ))}
        </div>
      </section>
    </InspectableSection>
  );
}
