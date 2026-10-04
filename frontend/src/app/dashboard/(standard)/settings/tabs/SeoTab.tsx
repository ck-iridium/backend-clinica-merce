"use client";

import { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Globe,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Layers,
  FileText,
  Tag,
  Ban,
  Target,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { SeoAuditReport, SemanticNode } from '@/lib/seo-engine/types';
import { SeoOptimizationProposal } from '@/lib/seo-engine/ai-orchestrator';

interface SeoTabProps {
  settings: any;
  setSettings?: (settings: any) => void;
}

export default function SeoTab({ settings }: SeoTabProps) {
  const tenantId = settings?.tenant_id;
  const clinicName = settings?.clinic_name || 'Tu Centro';

  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<SeoAuditReport | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'conflict' | 'warning' | 'optimal'>('all');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});

  // Estados de optimización IA y Modal Before vs After
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [proposals, setProposals] = useState<SeoOptimizationProposal[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // 1. Cargar auditoría inicial
  const loadAudit = async (showToast = false) => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const res = await fetch('/api/seo/audit', {
        headers: { 'x-tenant-id': tenantId },
      });
      if (res.ok) {
        const data = await res.json();
        setReport(data);
        if (showToast) {
          toast.success('Auditoría SEO actualizada con éxito');
        }
      } else {
        toast.error('Error al cargar la auditoría SEO');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de conexión al auditar el ecosistema');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAudit();
  }, [tenantId]);

  // 2. Ejecutar optimización con IA
  const handleRunOptimization = async () => {
    if (!tenantId) return;
    setIsOptimizing(true);
    try {
      const res = await fetch('/api/seo/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.proposals && data.proposals.length > 0) {
          setProposals(data.proposals);
          setShowReviewModal(true);
          toast.success(`Se generaron ${data.proposals.length} propuestas de optimización con IA`);
        } else {
          toast.info('Todo el catálogo ya se encuentra 100% optimizado');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        toast.error(errData.error || 'Error al ejecutar la optimización con IA');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error al conectar con el orquestador de IA');
    } finally {
      setIsOptimizing(false);
    }
  };

  // 3. Aplicar propuestas en batch en Supabase
  const handleApplyProposals = async () => {
    if (!tenantId || proposals.length === 0) return;
    setIsApplying(true);
    try {
      const payload = {
        tenantId,
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(`¡Éxito! Se actualizaron ${data.updatedCount} páginas en Supabase.`);
        setShowReviewModal(false);
        setProposals([]);
        // Recargar auditoría para mostrar las nuevas métricas
        loadAudit();
      } else {
        toast.error('Error al persistir las optimizaciones en Supabase');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error de red al aplicar cambios');
    } finally {
      setIsApplying(false);
    }
  };

  const toggleNodeExpand = (id: string) => {
    setExpandedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtrado de nodos
  const filteredNodes = (report?.nodes || []).filter((node) => {
    if (selectedFilter === 'all') return true;
    return node.status === selectedFilter;
  });

  return (
    <div className="space-y-8 md:space-y-10 animate-in slide-in-from-bottom-2 duration-300 font-sans w-full pb-12">
      {/* ── BANNER PRINCIPAL QUIET LUXURY ── */}
      <div className="relative overflow-hidden bg-[#1C1917] text-white rounded-3xl py-7 px-6 md:px-8 border border-stone-800 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gradient-to-br from-[#d4af37]/20 to-transparent blur-3xl pointer-events-none" />

        <div className="flex items-start md:items-center gap-5 relative z-10">
          <span className="w-13 h-13 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 shadow-inner p-3">
            <Sparkles size={24} strokeWidth={1.5} />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-xl md:text-2xl font-serif font-semibold tracking-wide text-white">
                SEO & Posicionamiento Local
              </h3>
              <span className="bg-[#d4af37]/20 text-[#d4af37] text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
                Escáner Híbrido IA
              </span>
            </div>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-2xl font-normal">
              Audita y optimiza el posicionamiento orgánico de tu negocio en Google. El algoritmo anti-canibalización
              asigna palabras clave únicas por tratamiento y la IA redacta títulos y descripciones de alto impacto.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto relative z-10">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadAudit(true)}
            disabled={loading || isOptimizing}
            className="rounded-xl border-stone-700 text-stone-200 hover:bg-stone-800 hover:text-white transition-all text-xs font-semibold py-5 px-4"
          >
            <RefreshCw size={15} className={`mr-2 ${loading ? 'animate-spin' : ''}`} />
            Re-escanear
          </Button>

          <Button
            variant="luxury"
            size="sm"
            onClick={handleRunOptimization}
            disabled={loading || isOptimizing}
            className="rounded-xl font-bold text-xs py-5 px-5 shadow-luxury text-stone-950 flex items-center gap-2 active:scale-95 transition-transform shrink-0"
          >
            <Sparkles size={16} strokeWidth={2} />
            {isOptimizing ? 'Optimizando...' : 'Optimizar con IA'}
          </Button>
        </div>
      </div>

      {/* ── ESTADO DE CARGA ── */}
      {loading && !report && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 rounded-2xl bg-stone-100" />
            ))}
          </div>
          <Skeleton className="h-96 rounded-3xl bg-stone-100" />
        </div>
      )}

      {/* ── CUADRO DE MANDOS DE KPIS ── */}
      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Salud SEO */}
            <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Salud SEO Global</span>
                <span
                  className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                    report.overallScore >= 80
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : report.overallScore >= 50
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {report.overallScore >= 80 ? 'Óptimo' : report.overallScore >= 50 ? 'Mejorable' : 'Crítico'}
                </span>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-serif font-bold text-stone-900">{report.overallScore}%</span>
                <span className="text-xs text-stone-400">calificación técnica</span>
              </div>
              <div className="w-full bg-stone-100 h-2 rounded-full mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    report.overallScore >= 80 ? 'bg-emerald-500' : report.overallScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${report.overallScore}%` }}
                />
              </div>
            </div>

            {/* KPI 2: Canibalización */}
            <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Canibalización</span>
                <ShieldCheck size={18} className={report.summary.cannibalizationCount === 0 ? 'text-emerald-500' : 'text-rose-500'} />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-serif font-bold text-stone-900">
                  {report.summary.cannibalizationCount}
                </span>
                <span className="text-xs text-stone-400 ml-2">
                  {report.summary.cannibalizationCount === 1 ? 'conflicto detectado' : 'conflictos detectados'}
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                {report.summary.cannibalizationCount === 0
                  ? 'Cada página ataca búsquedas únicas en Google.'
                  : 'Páginas compitiendo por la misma búsqueda.'}
              </p>
            </div>

            {/* KPI 3: Incompletos */}
            <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Meta Vacíos</span>
                <AlertTriangle size={18} className={report.summary.missingMetaCount === 0 ? 'text-emerald-500' : 'text-amber-500'} />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-serif font-bold text-stone-900">
                  {report.summary.missingMetaCount}
                </span>
                <span className="text-xs text-stone-400 ml-2">páginas sin rellenar</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                {report.summary.missingMetaCount === 0
                  ? 'Todas las páginas tienen metadatos propios.'
                  : 'Usando actualmente el fallback automático.'}
              </p>
            </div>

            {/* KPI 4: Catálogo Indexable */}
            <div className="bg-white rounded-2xl border border-stone-200/70 p-5 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Páginas Auditadas</span>
                <Layers size={18} className="text-[#D4AF37]" />
              </div>
              <div className="mt-3">
                <span className="text-3xl font-serif font-bold text-stone-900">
                  {report.summary.totalEntities}
                </span>
                <span className="text-xs text-stone-400 ml-2">URLs en el ecosistema</span>
              </div>
              <p className="text-[11px] text-stone-500 mt-2">
                Home, categorías de servicios y tratamientos.
              </p>
            </div>
          </div>

          {/* ── BARRA DE FILTROS ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/60 overflow-x-auto">
              {[
                { id: 'all', label: 'Todos', count: report.summary.totalEntities },
                { id: 'conflict', label: 'Conflictos', count: report.summary.conflictCount, color: 'text-rose-600' },
                { id: 'warning', label: 'Advertencias', count: report.summary.warningCount, color: 'text-amber-600' },
                { id: 'optimal', label: 'Óptimos', count: report.summary.optimalCount, color: 'text-emerald-600' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFilter(f.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                    selectedFilter === f.id
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  <span>{f.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-md bg-stone-200/60 text-[10px] ${f.color || ''}`}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-xs text-stone-400 font-medium">
              Mostrando {filteredNodes.length} de {report.summary.totalEntities} páginas
            </p>
          </div>

          {/* ── LISTADO JERÁRQUICO DE NODOS SEMÁNTICOS ── */}
          <div className="space-y-3">
            {filteredNodes.map((node) => {
              const isExpanded = expandedNodes[node.entity.id];
              const titleLen = node.entity.currentTitle?.length || 0;
              const descLen = node.entity.currentDescription?.length || 0;

              return (
                <div
                  key={node.entity.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                    node.status === 'conflict'
                      ? 'border-rose-200 shadow-sm'
                      : node.status === 'warning'
                      ? 'border-amber-200/80'
                      : 'border-stone-200/70 hover:border-stone-300'
                  }`}
                >
                  {/* Fila Principal */}
                  <div
                    onClick={() => toggleNodeExpand(node.entity.id)}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/50 transition-colors"
                  >
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      {/* Badge de Tipo */}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0 ${
                          node.entity.type === 'home'
                            ? 'bg-stone-900 text-white'
                            : node.entity.type === 'category'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {node.entity.type === 'home'
                          ? 'Portada'
                          : node.entity.type === 'category'
                          ? 'Categoría'
                          : 'Tratamiento'}
                      </span>

                      <div className="min-w-0 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm sm:text-base font-bold text-stone-900 truncate">
                            {node.entity.name}
                          </h4>
                          <span className="text-[11px] font-mono text-stone-400 hidden md:inline truncate max-w-[200px]">
                            {node.entity.urlPath}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[11px] text-stone-500 flex items-center gap-1 font-medium">
                            <Target size={12} className="text-[#D4AF37]" />
                            <span className="text-stone-400">Keyword Asignada:</span>
                            <strong className="text-stone-800 font-semibold">{node.assignedKeyword}</strong>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Lado Derecho: Estado & Botón Desplegable */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div className="flex items-center gap-2">
                        {node.status === 'optimal' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle2 size={13} />
                            Óptimo ({node.seoScore})
                          </span>
                        )}
                        {node.status === 'warning' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            <AlertTriangle size={13} />
                            Revisar ({node.seoScore})
                          </span>
                        )}
                        {node.status === 'conflict' && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">
                            <XCircle size={13} />
                            Canibalización
                          </span>
                        )}
                      </div>

                      <span className="text-stone-400 p-1">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </span>
                    </div>
                  </div>

                  {/* Panel Desplegable con Diagnóstico Detallado */}
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 border-t border-stone-100 bg-stone-50/40 text-xs space-y-4">
                      {/* Alerta de Canibalización si existe */}
                      {node.cannibalizationRisk.hasRisk && (
                        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 space-y-1">
                          <div className="flex items-center gap-2 font-bold text-xs">
                            <AlertTriangle size={14} className="text-rose-600" />
                            Alerta de Canibalización en Google
                          </div>
                          <p className="text-[11px] leading-relaxed text-rose-700">
                            {node.cannibalizationRisk.reason} (Conflicto directo con:{' '}
                            <strong>{node.cannibalizationRisk.conflictingEntityNames.join(', ')}</strong>)
                          </p>
                        </div>
                      )}

                      {/* Comparativa de Metadatos Actuales */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/60">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                              Título SEO Actual
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                titleLen >= 45 && titleLen <= 65
                                  ? 'text-emerald-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {titleLen}/60 chars
                            </span>
                          </div>
                          <p className="text-stone-800 font-medium break-words">
                            {node.entity.currentTitle || (
                              <span className="italic text-stone-400">Sin título configurado</span>
                            )}
                          </p>
                        </div>

                        <div className="space-y-1 bg-white p-3.5 rounded-xl border border-stone-200/60">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">
                              Meta Descripción Actual
                            </span>
                            <span
                              className={`text-[10px] font-mono font-bold ${
                                descLen >= 130 && descLen <= 160
                                  ? 'text-emerald-600'
                                  : 'text-amber-600'
                              }`}
                            >
                              {descLen}/155 chars
                            </span>
                          </div>
                          <p className="text-stone-800 font-medium leading-relaxed break-words">
                            {node.entity.currentDescription || (
                              <span className="italic text-stone-400">Sin descripción (usando fallback neutro)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Palabras Prohibidas (Guardrails Anti-Canibalización) */}
                      {node.forbiddenKeywords.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                            <Ban size={12} className="text-rose-400" />
                            Palabras Clave Prohibidas (Guardrail para evitar canibalizar a tus otros servicios):
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {node.forbiddenKeywords.slice(0, 8).map((fk, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] bg-stone-100 text-stone-600 border border-stone-200 px-2 py-0.5 rounded-md font-mono"
                              >
                                {fk}
                              </span>
                            ))}
                            {node.forbiddenKeywords.length > 8 && (
                              <span className="text-[10px] text-stone-400 italic">
                                +{node.forbiddenKeywords.length - 8} más
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Recomendaciones específicas */}
                      {node.recommendations.length > 0 && (
                        <div className="pt-1 text-[11px] text-stone-500 space-y-1">
                          {node.recommendations.map((rec, i) => (
                            <p key={i} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                              {rec}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ── MODAL BEFORE VS AFTER: VALIDACIÓN ANTES DE GUARDAR EN SUPABASE ── */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col rounded-3xl p-0 border border-stone-200 bg-white shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b border-stone-100 bg-[#FAF9F6]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] flex items-center justify-center">
                  <Sparkles size={20} />
                </span>
                <div>
                  <DialogTitle className="text-xl font-serif font-bold text-stone-900">
                    Propuesta de Optimización SEO con IA
                  </DialogTitle>
                  <DialogDescription className="text-xs text-stone-500 font-sans mt-0.5">
                    Revisa las propuestas antes de consolidarlas en la base de datos de Supabase. Cada tratamiento
                    tendrá una intención de búsqueda única y protegida.
                  </DialogDescription>
                </div>
              </div>
            </div>
          </DialogHeader>

          {/* Listado Comparativo */}
          <div className="p-6 overflow-y-auto space-y-6 flex-1 divide-y divide-stone-100">
            {proposals.map((item) => (
              <div key={item.entityId} className="pt-5 first:pt-0 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
                      {item.entityType}
                    </span>
                    <h5 className="text-sm font-bold text-stone-900">{item.entityName}</h5>
                  </div>
                  <span className="text-[11px] font-mono text-[#D4AF37] font-semibold bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/20">
                    Target: {item.proposed.assignedKeyword}
                  </span>
                </div>

                {/* Comparativa en Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  {/* Antes */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/60 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">
                      Estado Actual en DB
                    </span>
                    <div>
                      <span className="text-[10px] text-stone-400">Título:</span>
                      <p className="font-medium text-stone-700 text-xs">
                        {item.original.seo_title || <span className="italic text-stone-400">Sin título</span>}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">Descripción:</span>
                      <p className="font-medium text-stone-600 text-[11px] leading-relaxed">
                        {item.original.seo_description || (
                          <span className="italic text-stone-400">Sin descripción</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Después (Propuesta IA) */}
                  <div className="p-3.5 rounded-xl bg-amber-50/40 border border-[#D4AF37]/30 space-y-2 relative">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#b08e23] flex items-center justify-between">
                      <span>Propuesta IA (Guardrails)</span>
                      <span className="text-[10px] font-mono text-emerald-700 font-black">Score 95+</span>
                    </span>
                    <div>
                      <span className="text-[10px] text-stone-400">Nuevo Título ({item.proposed.seo_title.length} chars):</span>
                      <p className="font-bold text-stone-900 text-xs">
                        {item.proposed.seo_title}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">Nueva Descripción ({item.proposed.seo_description.length} chars):</span>
                      <p className="font-medium text-stone-800 text-[11px] leading-relaxed">
                        {item.proposed.seo_description}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400">Keywords:</span>
                      <p className="text-[10px] font-mono text-stone-600">
                        {item.proposed.seo_keywords}
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-stone-400 italic">
                  💡 Razón estratégica: {item.rationale}
                </p>
              </div>
            ))}
          </div>

          <DialogFooter className="p-4 sm:p-5 border-t border-stone-100 bg-[#FAF9F6] flex flex-row items-center justify-between sm:justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowReviewModal(false)}
              disabled={isApplying}
              className="rounded-xl px-4 text-xs font-semibold text-stone-600"
            >
              Descartar
            </Button>

            <Button
              variant="luxury"
              size="sm"
              onClick={handleApplyProposals}
              disabled={isApplying}
              className="rounded-xl px-6 text-xs font-bold shadow-luxury text-stone-950 flex items-center gap-2"
            >
              <Check size={16} strokeWidth={2} />
              {isApplying ? 'Persistiendo en Supabase...' : `Confirmar y Aplicar (${proposals.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
