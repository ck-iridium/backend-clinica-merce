export type EntityType = 'home' | 'category' | 'service' | 'location';
export type NodeStatus = 'optimal' | 'warning' | 'conflict';

export interface EcosystemTenant {
  id: string;
  name: string;
  slug: string;
  custom_domain?: string | null;
}

export interface EcosystemSettings {
  clinic_name: string;
  clinic_description?: string | null;
  business_sector: string;
  clinic_address?: string | null;
  clinic_city?: string | null;
  allow_search_engine_indexing: boolean;
}

export interface EcosystemSiteContent {
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
}

export interface EcosystemCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  seo_description?: string | null;
  order_index?: number;
}

export interface EcosystemService {
  id: string;
  name: string;
  slug: string;
  category_id?: string | null;
  category_name?: string | null;
  description?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  price?: number | null;
  duration_minutes?: number | null;
  is_active?: boolean;
}

export interface EcosystemLocation {
  id: string;
  name: string;
  slug: string;
  city?: string | null;
  province?: string | null;
  address?: string | null;
}

export interface EcosystemData {
  tenant: EcosystemTenant;
  settings: EcosystemSettings;
  siteContent: EcosystemSiteContent;
  categories: EcosystemCategory[];
  services: EcosystemService[];
  locations: EcosystemLocation[];
  detectedCity: string;
  detectedProvince?: string;
  allCities?: string[];
  businessSector: string;
}

export interface SeoEntity {
  id: string;
  type: EntityType;
  name: string;
  urlPath: string;
  level: 1 | 2 | 3;
  parentId?: string | null;
  categoryName?: string | null;
  currentTitle?: string | null;
  currentDescription?: string | null;
  currentKeywords: string[];
  rawText?: string | null;
}

export interface CannibalizationIssue {
  hasRisk: boolean;
  conflictingEntityIds: string[];
  conflictingEntityNames: string[];
  sharedKeywords: string[];
  reason: string;
}

export interface SemanticNode {
  entity: SeoEntity;
  targetCluster: string;
  assignedKeyword: string;
  forbiddenKeywords: string[];
  cannibalizationRisk: CannibalizationIssue;
  seoScore: number;
  status: NodeStatus;
  issues: string[];
  recommendations: string[];
}

export interface SeoAuditReport {
  tenantId: string;
  overallScore: number;
  summary: {
    totalEntities: number;
    optimalCount: number;
    warningCount: number;
    conflictCount: number;
    missingMetaCount: number;
    cannibalizationCount: number;
  };
  nodes: SemanticNode[];
  timestamp: string;
}
