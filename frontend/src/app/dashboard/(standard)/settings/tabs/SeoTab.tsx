"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SeoAuditReport, SemanticNode } from '@/lib/seo-engine/types';
import { SeoOptimizationProposal } from '@/lib/seo-engine/ai-orchestrator';
import {
  SeoHeaderBanner,
  SeoProgressBar,
  SeoKpiGrid,
  SeoFilterBar,
  SeoNodeCard,
  SeoReviewModal,
  OptimizationProgress,
  SeoFilterType,
} from './seo';

interface SeoTabProps {
  settings: any;
  setSettings?: (settings: any) => void;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function resolveCurrentTenantId(settings?: any): string {
  // 1. Modo Soporte (Impersonación de super-admin desde ProBookia central)
  const impersonateId = getCookie('impersonate_tenant_id');
  if (impersonateId && impersonateId.trim()) return impersonateId.trim();

  // 2. Cookie directa tenant_id o cacheadas
  const cookieTenantId = getCookie('tenant_id') || getCookie('cached_tenant_id');
  if (cookieTenantId && cookieTenantId.trim()) return cookieTenantId.trim();

  // 3. De settings si viniera
  if (settings?.tenant_id && typeof settings.tenant_id === 'string' && settings.tenant_id.trim()) {
    return settings.tenant_id.trim();
  }

  // 4. De la sesión del usuario en localStorage
  if (typeof window !== 'undefined') {
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed.tenant_id && typeof parsed.tenant_id === 'string') {
          return parsed.tenant_id.trim();
        }
      }
    } catch {}
  }

  // 5. Slug de soporte o de inquilino como fallback
  const impersonateSlug = getCookie('impersonate_tenant_slug');
  if (impersonateSlug && impersonateSlug.trim()) return impersonateSlug.trim();

  const cookieSlug = getCookie('tenant_slug') || getCookie('cached_tenant_slug');
  if (cookieSlug && cookieSlug.trim()) return cookieSlug.trim();

  return '';
}

export default function SeoTab({ settings }: SeoTabProps) {
  const [resolvedTenantId, setResolvedTenantId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [report, setReport] = useState<SeoAuditReport | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<SeoFilterType>('all');

  // Estados de optimización IA
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState<OptimizationProgress | null>(null);
  const [proposals, setProposals] = useState<SeoOptimizationProposal[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // 1. Cargar auditoría inicial
  const loadAudit = async (targetTenantId?: string, showToast = false) => {
    const tid = targetTenantId || resolvedTenantId || resolveCurrentTenantId(settings);
    if (!tid) {
      setLoading(false);
      setErrorMessage('No se encontró el identificador del tenant en la sesión o en cookies de soporte. Por favor, recarga o vuelve a iniciar sesión.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/seo/audit?tenantId=${encodeURIComponent(tid)}`, {
        headers: { 'x-tenant-id': tid },
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setErrorMessage(null);
        if (showToast) {
          toast.success('Auditoría SEO actualizada con éxito');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.error || `Error ${res.status}: No se pudo completar la auditoría SEO`;
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error('[SeoTab loadAudit Error]:', err);
      const msg = err.message || 'Error de conexión al auditar el ecosistema SEO';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tid = resolveCurrentTenantId(settings);
    setResolvedTenantId(tid);
    loadAudit(tid);
  }, [settings]);

  // 2. Ejecutar optimización con IA (soporta modo 'pending' o 'all')
  const handleRunOptimization = async (mode: 'pending' | 'all' = 'pending') => {
    const tid = resolvedTenantId || resolveCurrentTenantId(settings);
    if (!tid) {
      toast.error('No se pudo identificar el tenant.');
      return;
    }

    if (!report || !report.nodes || report.nodes.length === 0) {
      toast.error('No hay páginas cargadas en la auditoría para optimizar.');
      return;
    }

    let targetNodes: SemanticNode[] = [];
    if (mode === 'all') {
      targetNodes = report.nodes;
    } else {
      targetNodes = report.nodes.filter(
        (n) => n.status === 'conflict' || n.status === 'warning' || !n.entity.currentDescription
      );
    }

    if (targetNodes.length === 0) {
      toast.info('No hay páginas pendientes de optimización en el catálogo.');
      return;
    }

    const total = targetNodes.length;
    const CHUNK_SIZE = 8;
    const chunks: (typeof targetNodes)[] = [];
    for (let i = 0; i < total; i += CHUNK_SIZE) {
      chunks.push(targetNodes.slice(i, i + CHUNK_SIZE));
    }

    setIsOptimizing(true);
    setProgress({
      current: 0,
      total,
      currentTitle: 'Iniciando conexión con el orquestador IA...',
      percent: 0,
      failedCount: 0,
      failedNames: [],
    });

    const accumulatedProposals: SeoOptimizationProposal[] = [];
    const failedNames: string[] = [];
    let processed = 0;

    try {
      for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
        const chunk = chunks[cIdx];
        const namesString = chunk.map((n) => n.entity.name).join(', ');

        setProgress({
          current: processed,
          total,
          currentTitle: namesString,
          percent: Math.min(99, Math.round((processed / total) * 100)),
          failedCount: failedNames.length,
          failedNames: [...failedNames],
        });

        try {
          const res = await fetch('/api/seo/optimize', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': tid,
            },
            body: JSON.stringify({
              tenantId: tid,
              entityIds: chunk.map((n) => n.entity.id),
              geminiKey: settings?.gemini_api_key || undefined,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.proposals && Array.isArray(data.proposals)) {
              accumulatedProposals.push(...data.proposals);
            }
          } else {
            console.warn(`[SeoTab] Lote ${cIdx + 1} no completado (${res.status})`);
            chunk.forEach((n) => failedNames.push(n.entity.name));
          }
        } catch (chunkErr) {
          console.error(`[SeoTab] Error en lote ${cIdx + 1}:`, chunkErr);
          chunk.forEach((n) => failedNames.push(n.entity.name));
        }

        processed += chunk.length;
        const currentPercent = Math.min(100, Math.round((processed / total) * 100));

        setProgress({
          current: Math.min(processed, total),
          total,
          currentTitle: cIdx < chunks.length - 1 ? 'Cargando siguiente lote...' : 'Finalizando y verificando guardrails...',
          percent: currentPercent,
          failedCount: failedNames.length,
          failedNames: [...failedNames],
        });
      }

      if (accumulatedProposals.length > 0) {
        setProposals(accumulatedProposals);
        setShowReviewModal(true);
        if (failedNames.length > 0) {
          toast.warning(
            `Se optimizaron ${accumulatedProposals.length} páginas. ${failedNames.length} tuvieron incidencias y se omitieron.`
          );
        } else {
          toast.success(`¡Optimización completada! ${accumulatedProposals.length} propuestas generadas.`);
        }
      } else {
        toast.error('No se pudo generar ninguna propuesta de optimización. Inténtalo de nuevo.');
      }
    } catch (globalErr: any) {
      console.error('[SeoTab handleRunOptimization Error]:', globalErr);
      toast.error('Ocurrió un error inesperado durante la optimización.');
    } finally {
      setIsOptimizing(false);
      setTimeout(() => setProgress(null), 1200);
    }
  };

  // 3. Aplicar propuestas en batch en Supabase
  const handleApplyProposals = async () => {
    const tid = resolvedTenantId || resolveCurrentTenantId(settings);
    if (!tid || proposals.length === 0) return;
    setIsApplying(true);
    try {
      const payload = {
        tenantId: tid,
        proposals: proposals.map((p) => ({
          entityId: p.entityId,
          entityType: p.entityType,
          seo_title: p.proposed.seo_title,
          seo_description: p.proposed.seo_description,
          seo_keywords: p.proposed.seo_keywords,
        })),
      };

      const res = await fetch('/api/seo/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tid,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`¡Éxito! Se actualizaron ${data.updatedCount || proposals.length} páginas en Supabase.`);
        setShowReviewModal(false);
        setProposals([]);
        loadAudit(tid, false);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'Error al persistir las optimizaciones en Supabase');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red al aplicar cambios');
    } finally {
      setIsApplying(false);
    }
  };

  // Contadores para el Split Button y filtrado
  const pendingCount = (report?.nodes || []).filter(
    (n) => n.status === 'conflict' || n.status === 'warning' || !n.entity.currentDescription
  ).length;
  const totalCount = report?.nodes?.length || 0;

  const filteredNodes = (report?.nodes || []).filter((node) => {
    if (selectedFilter === 'all') return true;
    return node.status === selectedFilter;
  });

  return (
    <div className="space-y-8 md:space-y-10 animate-in slide-in-from-bottom-2 duration-300 font-sans w-full pb-12">
      {/* ── BANNER PRINCIPAL QUIET LUXURY & SPLIT BUTTON ── */}
      <SeoHeaderBanner
        loading={loading}
        isOptimizing={isOptimizing}
        progress={progress}
        pendingCount={pendingCount}
        totalCount={totalCount}
        onRescan={() => loadAudit(undefined, true)}
        onOptimize={handleRunOptimization}
      />

      {/* ── BARRA DE PROGRESO EN TIEMPO REAL ── */}
      {isOptimizing && progress && (
        <SeoProgressBar progress={progress} />
      )}

      {/* ── MENSAJE DE ERROR VISIBLE SI FALLA ── */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-900 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </span>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-rose-900">Error al cargar la auditoría SEO</h4>
              <p className="text-xs text-rose-700 leading-relaxed max-w-xl">{errorMessage}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAudit(undefined, true)}
            className="rounded-xl border-rose-300 text-rose-800 hover:bg-rose-100 shrink-0 font-medium text-xs py-2 px-4 shadow-none"
          >
            <RefreshCw size={14} className="mr-2" />
            Reintentar
          </Button>
        </div>
      )}

      {/* ── ESTADO DE CARGA (SKELETONS) ── */}
      {loading && !report && !errorMessage && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-stone-100" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-3xl bg-stone-100" />
        </div>
      )}

      {/* ── CUADRO DE MANDOS DE KPIS, FILTROS Y FICHAS DE PÁGINAS ── */}
      {report && (
        <>
          <SeoKpiGrid report={report} />

          <SeoFilterBar
            report={report}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            filteredCount={filteredNodes.length}
          />

          <div className="space-y-3">
            {filteredNodes.map((node) => (
              <SeoNodeCard key={node.entity.id} node={node} />
            ))}
          </div>
        </>
      )}

      {/* ── MODAL BEFORE VS AFTER ── */}
      <SeoReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        proposals={proposals}
        isApplying={isApplying}
        onApply={handleApplyProposals}
      />
    </div>
  );
}
