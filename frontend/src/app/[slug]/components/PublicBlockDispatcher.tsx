import React from 'react';
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
  contentWidth?: 'boxed' | 'fullwidth' | 'fullwidth_boxed';
}

export function PublicBlockDispatcher({
  block,
  slug,
  dbCategories,
  dbServices,
  isBoxed = false,
  sectionVerticalAlign,
  contentWidth,
}: PublicBlockDispatcherProps) {
  const data = block.content_data || {};

  switch (block.block_type) {
    case 'atomic_title':
    case 'title_heading':
      return <PublicTitleBlock key={block.id} data={data} />;

    case 'atomic_text':
      return <PublicTextBlock key={block.id} data={data} />;

    case 'atomic_image':
      return <PublicImageBlock key={block.id} data={data} />;

    case 'text_image_cta':
      return <PublicTextImageCtaBlock key={block.id} data={data} />;

    case 'atomic_button':
      return <PublicButtonBlock key={block.id} data={data} />;

    case 'hero':
      return (
        <PublicHeroBlock
          key={block.id}
          data={data}
          isBoxed={isBoxed}
          sectionVerticalAlign={sectionVerticalAlign}
          contentWidth={contentWidth}
        />
      );

    case 'atomic_category':
      return (
        <PublicCategoryBlock
          key={block.id}
          data={data}
          dbCategories={dbCategories}
          dbServices={dbServices}
          contentWidth={contentWidth}
        />
      );

    case 'quote_testimonial':
      return <PublicQuoteBlock key={block.id} data={data} />;

    case 'features_grid':
      return <PublicFeaturesGridBlock key={block.id} data={data} />;

    case 'accordion_faq':
      return <PublicAccordionFaqBlock key={block.id} data={data} />;

    case 'separator_spacer':
      return <PublicSeparatorSpacerBlock key={block.id} data={data} />;

    default:
      return null;
  }
}
