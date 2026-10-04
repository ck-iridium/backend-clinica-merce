"use client";

import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ContentAuditReport, ContentAuditNode, ContentOptimizationProposal } from '@/lib/content-engine/types';
import {
  ContentHeaderBanner,
  ContentProgressBar,
  ContentKpiGrid,
  ContentFilterBar,
  ContentNodeCard,
  ContentReviewModal,
  ContentOptimizationProgress,
  ContentFilterType,
  ContentTypeFilter,
} from './content';

interface ContentTabProps {
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

export default function ContentTab({ settings }: ContentTabProps) {
  const [resolvedTenantId, setResolvedTenantId] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en' | 'fr'>('es');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [report, setReport] = useState<ContentAuditReport | null>(null);

  // Filtros
  const [selectedFilter, setSelectedFilter] = useState<ContentFilterType>('all');
  const [typeFilter, setTypeFilter] = useState<ContentTypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Estados de generación IA
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState<ContentOptimizationProgress | null>(null);
  const [proposals, setProposals] = useState<ContentOptimizationProposal[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // 1. Cargar auditoría inicial
  const loadAudit = async (targetTenantId?: string, showToast = false) => {
    const tid = targetTenantId || resolvedTenantId || resolveCurrentTenantId(settings);
    if (!tid) {
      setLoading(false);
      setErrorMessage('No se encontró el identificador del tenant en la sesión. Por favor, recarga o vuelve a iniciar sesión.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/content/audit?tenantId=${encodeURIComponent(tid)}`, {
        headers: { 'x-tenant-id': tid },
      });

      if (res.ok) {
        const data = await res.json();
        setReport(data);
        setErrorMessage(null);
        if (showToast) {
          toast.success('Auditoría de contenidos actualizada con éxito');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        const msg = errData.error || `Error ${res.status}: No se pudo completar la auditoría de contenidos`;
        setErrorMessage(msg);
        toast.error(msg);
      }
    } catch (err: any) {
      console.error('[ContentTab loadAudit Error]:', err);
      const msg = err.message || 'Error de conexión al auditar los contenidos';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const tid = resolveCurrentTenantId(settings);
    setResolvedTenantId(tid);
    loadAudit(tid, false);
  }, [settings]);

  // 2. Ejecutar generación con IA (por lote)
  const handleRunGeneration = async (mode: 'pending' | 'all' = 'pending') => {
    const tid = resolvedTenantId || resolveCurrentTenantId(settings);
    if (!tid) {
      toast.error('No se pudo identificar el tenant.');
      return;
    }

    if (!report || !report.nodes || report.nodes.length === 0) {
      toast.error('No hay entidades en el catálogo para redactar.');
      return;
    }

    let targetNodes: ContentAuditNode[] = [];
    if (mode === 'all') {
      targetNodes = report.nodes;
    } else {
      targetNodes = report.nodes.filter(
        (n) => n.status === 'empty' || n.status === 'thin' || (n.type === 'service' && !n.contentHtml)
      );
    }

    if (targetNodes.length === 0) {
      toast.info('No hay entidades con Thin Content o pendientes de redacción.');
      return;
    }

    const total = targetNodes.length;
    // Chunks de 2 para asegurar máxima solvencia literaria, rapidez y evitar timeouts con Gemini
    const CHUNK_SIZE = 2;
    const chunks: (typeof targetNodes)[] = [];
    for (let i = 0; i < total; i += CHUNK_SIZE) {
      chunks.push(targetNodes.slice(i, i + CHUNK_SIZE));
    }

    setIsGenerating(true);
    setProgress({
      current: 0,
      total,
      currentTitle: 'Iniciando conexión con el Copywriter IA...',
      percent: 0,
      failedCount: 0,
      failedNames: [],
    });

    const accumulatedProposals: ContentOptimizationProposal[] = [];
    const failedNames: string[] = [];
    let lastErrorMsg = '';
    let processed = 0;

    try {
      for (let cIdx = 0; cIdx < chunks.length; cIdx++) {
        const chunk = chunks[cIdx];
        const namesString = chunk.map((n) => n.name).join(', ');

        setProgress({
          current: processed,
          total,
          currentTitle: namesString,
          percent: Math.min(99, Math.round((processed / total) * 100)),
          failedCount: failedNames.length,
          failedNames: [...failedNames],
        });

        try {
          const res = await fetch('/api/content/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-tenant-id': tid,
            },
            body: JSON.stringify({
              tenantId: tid,
              entityIds: chunk.map((n) => n.id),
              geminiKey: settings?.gemini_api_key || undefined,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            if (data.proposals && Array.isArray(data.proposals)) {
              accumulatedProposals.push(...data.proposals);
            }
          } else {
            const errData = await res.json().catch(() => ({}));
            const msg = errData.error || `Error ${res.status} al generar contenidos`;
            console.error(`[ContentTab] Lote ${cIdx + 1} no completado:`, msg);
            lastErrorMsg = msg;
            chunk.forEach((n) => failedNames.push(n.name));
          }
        } catch (chunkErr: any) {
          console.error(`[ContentTab] Error en lote ${cIdx + 1}:`, chunkErr);
          lastErrorMsg = chunkErr.message || 'Error de conexión';
          chunk.forEach((n) => failedNames.push(n.name));
        }

        processed += chunk.length;
        const currentPercent = Math.min(100, Math.round((processed / total) * 100));

        setProgress({
          current: Math.min(processed, total),
          total,
          currentTitle: cIdx < chunks.length - 1 ? 'Cargando siguiente lote...' : 'Finalizando y estructurando contenidos...',
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
            `Se redactaron ${accumulatedProposals.length} entidades. ${failedNames.length} tuvieron incidencias y se omitieron.`
          );
        } else {
          toast.success(`¡Redacción completada! ${accumulatedProposals.length} propuestas generadas en 3 idiomas (ES, EN, FR).`);
        }
      } else {
        toast.error(lastErrorMsg || 'No se pudo generar ninguna propuesta de contenido. Inténtalo de nuevo.');
      }
    } catch (globalErr: any) {
      console.error('[ContentTab handleRunGeneration Error]:', globalErr);
      toast.error('Ocurrió un error inesperado durante la redacción de contenidos.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(null), 1200);
    }
  };

  // 3. Generar redacción para una entidad individual
  const handleGenerateSingle = async (node: ContentAuditNode) => {
    const tid = resolvedTenantId || resolveCurrentTenantId(settings);
    if (!tid) {
      toast.error('No se pudo identificar el tenant.');
      return;
    }

    setIsGenerating(true);
    setProgress({
      current: 1,
      total: 1,
      currentTitle: node.name,
      percent: 50,
      failedCount: 0,
      failedNames: [],
    });

    try {
      const res = await fetch('/api/content/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tid,
        },
        body: JSON.stringify({
          tenantId: tid,
          entityIds: [node.id],
          geminiKey: settings?.gemini_api_key || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.proposals && Array.isArray(data.proposals) && data.proposals.length > 0) {
          setProposals(data.proposals);
          setShowReviewModal(true);
          toast.success(`Propuesta generada para "${node.name}" en 3 idiomas.`);
        } else {
          toast.error('La IA no devolvió contenido para esta entidad.');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'Error al redactar la ficha.');
      }
    } catch (err: any) {
      console.error('[ContentTab handleGenerateSingle Error]:', err);
      toast.error('Error de conexión con el orquestador IA.');
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(null), 800);
    }
  };

  // 4. Aplicar propuestas en batch en Supabase
  const handleApplyProposals = async () => {
    const tid = resolvedTenantId || resolveCurrentTenantId(settings);
    if (!tid || proposals.length === 0) return;

    setIsApplying(true);
    try {
      const res = await fetch('/api/content/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tid,
        },
        body: JSON.stringify({
          tenantId: tid,
          proposals,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`¡Éxito! Se actualizaron ${data.updatedCount || proposals.length} entidades en Supabase (ES, EN, FR).`);
        setShowReviewModal(false);
        setProposals([]);
        loadAudit(tid, false);
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'Error al persistir el contenido en Supabase');
      }
    } catch (err) {
      console.error('[ContentTab handleApplyProposals Error]:', err);
      toast.error('Error de red al guardar los contenidos.');
    } finally {
      setIsApplying(false);
    }
  };

  // Contadores para el Split Button y filtrado
  const pendingCount = (report?.nodes || []).filter(
    (n) => n.status === 'empty' || n.status === 'thin' || (n.type === 'service' && !n.contentHtml)
  ).length;
  const totalCount = report?.nodes?.length || 0;

  // Filtrado de Nodos
  const filteredNodes = (report?.nodes || []).filter((node) => {
    // 1. Filtro de Estado
    if (selectedFilter === 'pending') {
      const isPending = node.status === 'empty' || node.status === 'thin' || (node.type === 'service' && !node.contentHtml);
      if (!isPending) return false;
    } else if (selectedFilter === 'no_html') {
      if (node.type !== 'service' || node.contentHtml) return false;
    } else if (selectedFilter === 'optimal') {
      if (node.status !== 'optimal') return false;
    }

    // 2. Filtro de Tipo
    if (typeFilter === 'services' && node.type !== 'service') return false;
    if (typeFilter === 'categories' && node.type !== 'category') return false;

    // 3. Búsqueda por texto
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = node.name.toLowerCase().includes(q);
      const matchSlug = node.slug.toLowerCase().includes(q);
      const matchCat = node.categoryName?.toLowerCase().includes(q) || false;
      if (!matchName && !matchSlug && !matchCat) return false;
    }

    return true;
  });

  return (
    <div className="space-y-8 md:space-y-10 animate-in slide-in-from-bottom-2 duration-300 font-sans w-full pb-12">
      {/* ── BANNER PRINCIPAL QUIET LUXURY & SPLIT BUTTON & SELECTOR DE IDIOMAS ── */}
      <ContentHeaderBanner
        loading={loading}
        isGenerating={isGenerating}
        progress={progress}
        pendingCount={pendingCount}
        totalCount={totalCount}
        selectedLanguage={selectedLanguage}
        onSelectLanguage={setSelectedLanguage}
        onRescan={() => loadAudit(undefined, true)}
        onGenerate={handleRunGeneration}
      />

      {/* ── BARRA DE PROGRESO EN TIEMPO REAL ── */}
      {isGenerating && progress && (
        <ContentProgressBar progress={progress} />
      )}

      {/* ── MENSAJE DE ERROR VISIBLE SI FALLA ── */}
      {errorMessage && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/90 p-5 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-rose-900 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <span className="p-2 rounded-xl bg-rose-100 text-rose-600 shrink-0 mt-0.5">
              <AlertTriangle size={20} />
            </span>
            <div className="space-y-1">
              <h4 className="font-semibold text-sm text-rose-900">Error al auditar contenidos</h4>
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

      {/* ── CUADRO DE MANDOS DE KPIS, FILTROS Y FICHAS DE CONTENIDO ── */}
      {report && (
        <>
          <ContentKpiGrid report={report} />

          <ContentFilterBar
            report={report}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
            typeFilter={typeFilter}
            onSelectTypeFilter={setTypeFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filteredCount={filteredNodes.length}
          />

          <div className="space-y-3">
            {filteredNodes.length > 0 ? (
              filteredNodes.map((node) => (
                <ContentNodeCard
                  key={node.id}
                  node={node}
                  selectedLanguage={selectedLanguage}
                  onGenerateSingle={handleGenerateSingle}
                  isGenerating={isGenerating}
                />
              ))
            ) : (
              <div className="bg-white rounded-2xl border border-stone-200/80 p-8 text-center text-stone-500 text-xs">
                No se encontraron entidades con los filtros seleccionados.
              </div>
            )}
          </div>
        </>
      )}

      {/* ── MODAL DE REVISIÓN Y APROBACIÓN EN 3 IDIOMAS ── */}
      <ContentReviewModal
        open={showReviewModal}
        onOpenChange={setShowReviewModal}
        proposals={proposals}
        isApplying={isApplying}
        onApply={handleApplyProposals}
      />
    </div>
  );
}
