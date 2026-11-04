export interface DocPage {
  id: string;
  section_id: string;
  slug: string;
  title: Record<string, string>;
  content: Record<string, string>;
  position: number;
}

export interface DocSection {
  id: string;
  slug: string;
  title: Record<string, string>;
  position: number;
  pages: DocPage[];
}

export type LangTab = 'es' | 'en' | 'fr';

export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

