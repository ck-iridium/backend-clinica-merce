"use client";
import React from 'react';
import type { SectionBlock } from '../types';
import { SectionToolbar } from './canvas/SectionToolbar';
import { CanvasColumn } from './canvas/CanvasColumn';

interface CanvasSectionProps {
  section: SectionBlock;
  index: number;
  totalSections: number;
  onReorder: (i: number, dir: 'up' | 'down') => void;
  onDelete: (id: string) => void;
  onUpdateLayout: (id: string, cols: number) => void;
  onUpdateSectionMetadata: (id: string, key: string, value: any) => void;
  onEditBlock: (block: any) => void;
  onDeleteBlock: (blockId: string, sectionId: string, columnId: string) => void;
  onAddBlock: (sectionId: string, columnId: string) => void;
  dbCategories: any[];
  dbServices: any[];
}

export function CanvasSection({
  section,
  index,
  totalSections,
  onReorder,
  onDelete,
  onUpdateLayout,
  onUpdateSectionMetadata,
  onEditBlock,
  onDeleteBlock,
  onAddBlock,
  dbCategories,
  dbServices,
}: CanvasSectionProps) {
  const struct = section.content_data;
  const columns = struct.columns || [];
  const columnsCount = struct.columns_count || 1;

  const rawBg = struct.bg_color || 'cream';
  const isCustomHex = rawBg.startsWith('#');
  const isDark = rawBg === 'dark' || rawBg === 'anthracite' || rawBg === '#1c1917';
  const bgColor = isCustomHex 
    ? '' 
    : rawBg === 'white' 
    ? 'bg-white' 
    : isDark 
    ? 'bg-stone-900 text-white' 
    : rawBg === 'soft_gold' 
    ? 'bg-[#FAF7F0]' 
    : 'bg-[#FAFAFA]';

  const hasHero = columns.some((col: any) => (col.blocks || []).some((b: any) => b.block_type === 'hero'));
  const hasCardsSlider = columns.some((col: any) => (col.blocks || []).some((b: any) => b.block_type === 'atomic_category' && (b.content_data?.layout === 'cards_slider' || !b.content_data?.layout)));
  const isFullWidth = struct.content_width === 'fullwidth';
  
  // Si tiene Hero o Carrusel de tratamientos, el ancho es fullwidth para efecto edge-to-edge
  const innerContainerClass = (hasHero || hasCardsSlider || isFullWidth)
    ? 'w-full'
    : 'max-w-7xl mx-auto';

  const paddingClass = hasHero
    ? 'p-0'
    : hasCardsSlider
    ? 'px-0 py-4'
    : (isFullWidth ? 'px-6 md:px-12 py-10 md:py-14' : 'px-6 md:px-8 py-10 md:py-14');

  const gapClass = hasHero ? 'gap-0' : 'gap-6';
  const verticalAlign = struct.vertical_alignment || 'items-start';
  const horizontalAlign = struct.horizontal_alignment || 'justify-start';

  return (
    <div 
      style={isCustomHex ? { backgroundColor: rawBg } : undefined}
      className={`relative group/section w-full ${bgColor} ${isDark ? 'text-white' : ''} transition-all duration-300`}
    >
      {/* ── Toolbar flotante de sección ── */}
      <SectionToolbar
        section={section}
        index={index}
        totalSections={totalSections}
        columnsCount={columnsCount}
        onReorder={onReorder}
        onDelete={onDelete}
        onUpdateLayout={onUpdateLayout}
        onUpdateSectionMetadata={onUpdateSectionMetadata}
      />

      {/* ── Columnas del canvas ── */}
      <div className={`w-full ${paddingClass}`}>
        <div className={`flex ${gapClass} ${innerContainerClass} ${verticalAlign} ${horizontalAlign}`}>
          {columns.map((col: any) => (
            <CanvasColumn
              key={col.id}
              col={col}
              sectionId={section.id}
              columnsCount={columnsCount}
              onEdit={onEditBlock}
              onDelete={onDeleteBlock}
              onAddBlock={onAddBlock}
              dbCategories={dbCategories}
              dbServices={dbServices}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
