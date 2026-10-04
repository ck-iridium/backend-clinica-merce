export type ContentStatus = 'empty' | 'thin' | 'optimal';
export type ContentEntityType = 'service' | 'category';

export interface ContentAuditNode {
  id: string;
  type: ContentEntityType;
  name: string;
  slug: string;
  categoryName?: string | null;
  price?: number | null;
  duration?: number | null;
  description?: string | null;
  contentHtml?: string | null;
  descriptionLength: number;
  contentHtmlLength: number;
  status: ContentStatus;
  score: number; // 0 a 100
  issues: string[];
  translations?: Record<string, any> | null;
}

export interface ContentAuditReport {
  overallScore: number; // 0 - 100
  totalEntities: number;
  emptyCount: number;
  thinCount: number;
  optimalCount: number;
  withoutRichContentCount: number;
  summary: {
    servicesCount: number;
    categoriesCount: number;
    averageDescriptionLength: number;
    withFullContentCount: number;
  };
  nodes: ContentAuditNode[];
  analyzedAt: string;
}

export interface LocalizedContent {
  description: string;
  content_html?: string | null;
}

export interface ContentOptimizationProposal {
  entityId: string;
  entityType: ContentEntityType;
  entityName: string;
  categoryName?: string | null;
  original: {
    description?: string | null;
    content_html?: string | null;
    translations?: Record<string, any> | null;
  };
  proposed: {
    es: LocalizedContent;
    en: LocalizedContent;
    fr: LocalizedContent;
  };
  rationale: string;
}
