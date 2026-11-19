import type { SectionBlock } from '../types';

export function normalizeSlug(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function matchSlug(itemPath: string, targetSlug: string): boolean {
  const cleanItem = normalizeSlug(itemPath.replace(/^\//, ''));
  const cleanTarget = normalizeSlug(targetSlug);
  if (cleanItem === cleanTarget) return true;
  const stripItem = cleanItem.replace(/-+/g, '');
  const stripTarget = cleanTarget.replace(/-+/g, '');
  return stripItem === stripTarget;
}

/**
 * Normalización defensiva para páginas con bloques antiguos o planos.
 * Si el bloque ya es una sección moderna ('section'), la conserva.
 * Si es un bloque suelto, lo envuelve en una sección de 1 columna para asegurar retrocompatibilidad.
 */
export function normalizeSections(rawBlocks: any[], slug: string): SectionBlock[] {
  return (rawBlocks || []).map((block: any, idx: number): SectionBlock => {
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
            subtitle: bData.seo_description || 'Excelencia y distinción en cada detalle.',
          },
        });
      }

      generatedBlocks.push({
        id: `atomic-${block.id}`,
        block_type: block.block_type.startsWith('atomic_')
          ? block.block_type
          : `atomic_${block.block_type}`,
        content_data: {
          ...bData,
          html: bData.html || bData.body_html || bData.text || '',
        },
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
              blocks: generatedBlocks,
            },
          ],
        },
      };
    }
  });
}
