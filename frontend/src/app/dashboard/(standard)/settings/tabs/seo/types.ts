import { SeoAuditReport, SemanticNode } from '@/lib/seo-engine/types';
import { SeoOptimizationProposal } from '@/lib/seo-engine/ai-orchestrator';

export interface OptimizationProgress {
  current: number;
  total: number;
  currentTitle: string;
  percent: number;
  failedCount: number;
  failedNames: string[];
}

export type SeoFilterType = 'all' | 'conflict' | 'warning' | 'optimal';
