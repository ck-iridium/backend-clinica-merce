import React from 'react';
import type { AtomicBlock } from '../../../types';
import { HeroBlockView } from './HeroBlockView';
import { TitleBlockView } from './TitleBlockView';
import { TextBlockView } from './TextBlockView';
import { ImageBlockView } from './ImageBlockView';
import { TextImageCtaBlockView } from './TextImageCtaBlockView';
import { ButtonBlockView } from './ButtonBlockView';
import { CategoryBlockView } from './CategoryBlockView';

interface RenderBlockProps {
  block: AtomicBlock;
  dbCategories: any[];
  dbServices: any[];
}

export function RenderBlock({ block, dbCategories, dbServices }: RenderBlockProps) {
  const data = block.content_data || {};

  switch (block.block_type) {
    case 'hero':
      return <HeroBlockView data={data} />;
    case 'atomic_title':
    case 'title_heading':
      return <TitleBlockView data={data} />;
    case 'atomic_text':
      return <TextBlockView data={data} />;
    case 'atomic_image':
      return <ImageBlockView data={data} />;
    case 'text_image_cta':
      return <TextImageCtaBlockView data={data} />;
    case 'atomic_button':
      return <ButtonBlockView data={data} />;
    case 'atomic_category':
      return (
        <CategoryBlockView
          data={data}
          dbCategories={dbCategories}
          dbServices={dbServices}
        />
      );
    default:
      return null;
  }
}
