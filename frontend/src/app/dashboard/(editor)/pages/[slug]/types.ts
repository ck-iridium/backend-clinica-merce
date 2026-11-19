export type BlockType =
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

export interface AtomicBlock {
  id: string;
  block_type: BlockType;
  content_data: Record<string, any>;
}

export interface ColumnStructure {
  id: string;
  width: string;
  blocks: AtomicBlock[];
}

export interface SectionStructure {
  id: string;
  columns_count: number;
  py_spacing?: string;
  bg_color?: string;
  content_width?: 'boxed' | 'fullwidth';
  horizontal_alignment?: string;
  vertical_alignment?: string;
  columns: ColumnStructure[];
}

export interface SectionBlock {
  id: string;
  block_type: 'section';
  content_data: SectionStructure;
  order_index: number;
}
