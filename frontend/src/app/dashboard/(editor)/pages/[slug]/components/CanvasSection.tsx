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
  onCloneBlock: (blockId: string, sectionId: string, columnId: string) => void;
  onOpenAIBlock: (block: any, sectionId: string, columnId: string) => void;
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
  onCloneBlock,
  onOpenAIBlock,
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
  
  // Modos de ancho: 'boxed' (Todo Boxed) | 'fullwidth' (Todo Fullwidth) | 'fullwidth_boxed' (Fondo Fullwidth, Contenido Boxed)
  const contentWidth = struct.content_width || 'boxed';
  const isAllBoxed = contentWidth === 'boxed';
  const isAllFullWidth = contentWidth === 'fullwidth';

  // Márgenes / espaciados verticales configurables (Top & Bottom)
  const SPACING_TOP_MAP: Record<string, string> = {
    none: 'pt-0',
    sm: 'pt-6 md:pt-8',
    md: 'pt-10 md:pt-14',
    lg: 'pt-20 md:pt-24',
    xl: 'pt-28 md:pt-36',
  };

  const SPACING_BOTTOM_MAP: Record<string, string> = {
    none: 'pb-0',
    sm: 'pb-6 md:pb-8',
    md: 'pb-10 md:pb-14',
    lg: 'pb-20 md:pb-24',
    xl: 'pb-28 md:pb-36',
  };

  const ptClass = struct.padding_top && SPACING_TOP_MAP[struct.padding_top]
    ? SPACING_TOP_MAP[struct.padding_top]
    : hasHero ? 'pt-0' : (hasCardsSlider ? 'pt-4' : 'pt-10 md:pt-14');

  const pbClass = struct.padding_bottom && SPACING_BOTTOM_MAP[struct.padding_bottom]
    ? SPACING_BOTTOM_MAP[struct.padding_bottom]
    : hasHero ? 'pb-0' : (hasCardsSlider ? 'pb-4' : 'pb-10 md:pb-14');

  const gapClass = hasHero ? 'gap-0' : 'gap-6';
  const verticalAlign = struct.vertical_alignment || 'items-start';
  const horizontalAlign = struct.horizontal_alignment || 'justify-start';

  // ── 1. Caso TODO BOXED: La sección entera es una caja centrada contenida ──
  if (isAllBoxed) {
    return (
      <div className="relative group/section w-full px-4 md:px-6 my-4 transition-all duration-300">
        <div className="max-w-7xl mx-auto w-full relative">
          {/* Toolbar flotante de sección */}
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

          {/* Caja contenida con su propio fondo y bordes redondeados */}
          <div
            style={isCustomHex ? { backgroundColor: rawBg } : undefined}
            className={`w-full ${bgColor} ${isDark ? 'text-white' : ''} rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-luxury border border-stone-200/50 transition-all duration-300 ${ptClass} ${pbClass}`}
          >
            <div className={`flex ${gapClass} w-full ${hasHero ? 'px-0' : 'px-6 md:px-12'} ${verticalAlign} ${horizontalAlign}`}>
              {columns.map((col: any) => (
                <CanvasColumn
                  key={col.id}
                  col={col}
                  sectionId={section.id}
                  columnsCount={columnsCount}
                  onEdit={onEditBlock}
                  onDelete={onDeleteBlock}
                  onClone={onCloneBlock}
                  onOpenAI={onOpenAIBlock}
                  onAddBlock={onAddBlock}
                  dbCategories={dbCategories}
                  dbServices={dbServices}
                  isBoxed={true}
                  sectionVerticalAlign={verticalAlign}
                  contentWidth={contentWidth}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 2 y 3. Casos TODO FULLWIDTH o FONDO FULLWIDTH CON CONTENIDO BOXED ──
  const innerContentClass = isAllFullWidth
    ? `w-full ${hasHero || hasCardsSlider ? 'px-0' : 'px-6 md:px-12'}`
    : `${hasHero ? 'w-full' : 'max-w-7xl mx-auto px-6 w-full'}`;

  return (
    <div 
      style={isCustomHex ? { backgroundColor: rawBg } : undefined}
      className={`relative group/section w-full ${bgColor} ${isDark ? 'text-white' : ''} transition-all duration-300`}
    >
      {/* Toolbar flotante de sección */}
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

      {/* Columnas del canvas */}
      <div className={`w-full ${ptClass} ${pbClass}`}>
        <div className={`flex ${gapClass} ${innerContentClass} ${verticalAlign} ${horizontalAlign}`}>
          {columns.map((col: any) => (
            <CanvasColumn
              key={col.id}
              col={col}
              sectionId={section.id}
              columnsCount={columnsCount}
              onEdit={onEditBlock}
              onDelete={onDeleteBlock}
              onClone={onCloneBlock}
              onOpenAI={onOpenAIBlock}
              onAddBlock={onAddBlock}
              dbCategories={dbCategories}
              dbServices={dbServices}
              isBoxed={false}
              sectionVerticalAlign={verticalAlign}
              contentWidth={contentWidth}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
