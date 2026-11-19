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
  const pySpacing = isFirstWithHero
    ? 'pt-0 pb-0'
    : hasHero
    ? 'py-0'
    : isFirstSection
    ? 'pt-6 md:pt-8 pb-12 md:pb-16'
    : struct.py_spacing || 'py-20';

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

  const isBoxed = struct.content_width === 'boxed';
  const isExplicitFullWidth = struct.content_width === 'fullwidth';
  const isFullWidth = isExplicitFullWidth || (!isBoxed && (hasHero || hasCardsSlider));

  // Alineación exacta con el Navbar (max-w-7xl mx-auto px-6)
  const paddingClass = isFullWidth
    ? (hasHero ? 'px-0' : hasCardsSlider ? 'px-0 py-4' : 'px-4 md:px-8')
    : (hasHero ? 'px-0' : 'px-0');

  const widthClass = isFullWidth
    ? 'w-full'
    : 'max-w-7xl mx-auto px-6 w-full';
  const verticalAlign = struct.vertical_alignment || 'items-start';
  const horizontalAlign = struct.horizontal_alignment || 'justify-start';

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
        className={`w-full ${pySpacing} ${bgColor} ${paddingClass} ${
          isDark ? 'text-white' : ''
        } transition-all duration-300 border-b border-stone-100/30`}
      >
        <div
          className={`${widthClass} ${
            hasHero || hasCardsSlider ? '' : `grid ${gridClass}`
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
                    isBoxed={isBoxed}
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
