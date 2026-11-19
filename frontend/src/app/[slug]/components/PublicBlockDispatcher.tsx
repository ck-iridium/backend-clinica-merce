import React from 'react';
import InspectableSection from '@/components/ai/webmaster/InspectableSection';
import type { AtomicBlock } from '../types';
import { PublicTitleBlock } from './renderers/PublicTitleBlock';
import { PublicTextBlock } from './renderers/PublicTextBlock';
import { PublicImageBlock } from './renderers/PublicImageBlock';
import { PublicTextImageCtaBlock } from './renderers/PublicTextImageCtaBlock';
import { PublicButtonBlock } from './renderers/PublicButtonBlock';
import { PublicHeroBlock } from './renderers/PublicHeroBlock';
import { PublicCategoryBlock } from './renderers/PublicCategoryBlock';
import { PublicQuoteBlock } from './renderers/PublicQuoteBlock';
import { PublicFeaturesGridBlock } from './renderers/PublicFeaturesGridBlock';
import { PublicAccordionFaqBlock } from './renderers/PublicAccordionFaqBlock';
import { PublicSeparatorSpacerBlock } from './renderers/PublicSeparatorSpacerBlock';

interface PublicBlockDispatcherProps {
  block: AtomicBlock;
  slug: string;
  dbCategories: any[];
  dbServices: any[];
  isBoxed?: boolean;
  sectionVerticalAlign?: string;
}

export function PublicBlockDispatcher({
  block,
  slug,
  dbCategories,
  dbServices,
  isBoxed = false,
  sectionVerticalAlign,
}: PublicBlockDispatcherProps) {
  const data = block.content_data || {};

  switch (block.block_type) {
    case 'atomic_title':
    case 'title_heading':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name={`Título: "${data.title || 'Encabezado'}"`}
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicTitleBlock data={data} />
        </InspectableSection>
      );

    case 'atomic_text':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name="Texto Editorial"
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicTextBlock data={data} />
        </InspectableSection>
      );

    case 'atomic_image':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name={data.image_url ? 'Fotografía Editorial' : 'Fotografía / Espacio de Imagen'}
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicImageBlock data={data} />
        </InspectableSection>
      );

    case 'text_image_cta':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name="Imagen + Texto Editorial"
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicTextImageCtaBlock data={data} />
        </InspectableSection>
      );

    case 'atomic_button':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name="Botón de Acción"
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicButtonBlock data={data} />
        </InspectableSection>
      );

    case 'hero':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name="Hero Principal"
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicHeroBlock data={data} isBoxed={isBoxed} sectionVerticalAlign={sectionVerticalAlign} />
        </InspectableSection>
      );

    case 'atomic_category': {
      const cat = dbCategories.find((c) => c.id === data.category_id);
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name={`Catálogo: ${cat?.name || 'Tratamientos'}`}
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicCategoryBlock
            data={data}
            dbCategories={dbCategories}
            dbServices={dbServices}
          />
        </InspectableSection>
      );
    }

    case 'quote_testimonial':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name={`Testimonio: ${data.author || 'Dra. Mercè Guasch'}`}
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicQuoteBlock data={data} />
        </InspectableSection>
      );

    case 'features_grid':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name={`Pilares: ${data.heading || 'Pilares de Excelencia'}`}
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicFeaturesGridBlock data={data} />
        </InspectableSection>
      );

    case 'accordion_faq':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name={`FAQ: ${data.heading || 'Preguntas Frecuentes'}`}
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicAccordionFaqBlock data={data} />
        </InspectableSection>
      );

    case 'separator_spacer':
      return (
        <InspectableSection
          key={block.id}
          id={block.id}
          name="Divisor Decorativo"
          pageSlug={slug}
          blockType={block.block_type}
        >
          <PublicSeparatorSpacerBlock data={data} />
        </InspectableSection>
      );

    default:
      return null;
  }
}
