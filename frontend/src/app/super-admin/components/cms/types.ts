import { HeroTabItem } from '../SaaSCMSHeroForm';
import { PainComparisonData } from '../SaaSCMSPainForm';
import { PillarsSectionData } from '../SaaSCMSPillarsForm';
import { ShowcaseSector } from '../SaaSCMSSectorList';

export type SubTabType = 'hero' | 'sectors' | 'pain' | 'pillars' | 'branding' | 'seo';

export interface MarketingSettings {
  hero_title: string;
  hero_subtitle: string;
  hero_tabs?: HeroTabItem[];
  hero_image_1?: string | null;
  hero_image_2?: string | null;
  hero_image_3?: string | null;
  logo_svg?: string | null;
  primary_color?: string | null;
  secondary_color?: string | null;
  tertiary_color?: string | null;
  font_family?: string | null;
  font_family_body?: string | null;
  font_weight_headings?: string | null;
  favicon_url?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  seo_keywords?: string | null;
  pain_comparison?: PainComparisonData;
  pillars?: PillarsSectionData;
}

export interface SectorFormData {
  title: string;
  slug: string;
  badge_text: string;
  video_url: string;
  image_url: string;
  order_index: number;
}

export type MediaPickerTarget = {
  field: string;
  tabId?: string;
} | null;

export type { HeroTabItem, PainComparisonData, PillarsSectionData, ShowcaseSector };

