export type ContentFilterType = 'all' | 'pending' | 'no_html' | 'optimal';
export type ContentTypeFilter = 'all' | 'services' | 'categories';

export interface ContentOptimizationProgress {
  current: number;
  total: number;
  currentTitle: string;
  percent: number;
  failedCount: number;
  failedNames: string[];
}
