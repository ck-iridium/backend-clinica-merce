'use client';

import { useState, useEffect } from 'react';
import AIChatContainer from '@/components/ai/AIChatContainer';
import WebmasterBlocksPanel from '@/components/ai/webmaster/WebmasterBlocksPanel';
import { 
  RefreshCw, ExternalLink, Monitor, Smartphone, Tablet, Globe, 
  Sparkles, MessageSquareText, Layers, Eye, PencilRuler, Maximize2 
} from 'lucide-react';
import { toast } from 'sonner';

// Helper simple para leer cookies del lado del cliente
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export default function AIWebmasterPage() {
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [workspaceMode, setWorkspaceMode] = useState<'preview' | 'builder'>('preview');
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [leftTab, setLeftTab] = useState<'chat' | 'blocks'>('chat');
  const [activePageSlug, setActivePageSlug] = useState<string>('home');
  const [injectedPrompt, setInjectedPrompt] = useState<string | null>(null);

  // Obtener URL de vista web pública
  const getPublicUrl = (slug: string) => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const activeSlug = getCookie('impersonate_tenant_slug') || getCookie('tenant_slug') || '';
    const clean = slug === 'home' || !slug ? '' : slug.replace(/^\//, '');
    const path = clean ? `/${clean}` : '/';
    const separator = path.includes('?') ? '&' : '?';
    const tenantParam = activeSlug ? `${separator}tenant=${encodeURIComponent(activeSlug)}` : '';
    return `${origin}${path}${tenantParam}`;
  };

  // Obtener URL del diseñador visual correspondiente
  const getBuilderUrl = (slug: string) => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    if (slug === 'home' || !slug) {
      return `${origin}/dashboard/cms`;
    }
    return `${origin}/dashboard/pages/${slug.replace(/^\//, '')}`;
  };

  useEffect(() => {

    // 1. Intentar cargar rápido de localStorage
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userObj = JSON.parse(userStr);
        if (userObj.plan_type) {
          setPlanType(userObj.plan_type.toLowerCase());
          if (userObj.plan_type.toLowerCase() === 'gold') {
            setCheckingPlan(false);
          }
        }
      }
    } catch (e) {
      console.warn(e);
    }

    // 2. Hacer fetch de la API real
    async function fetchPlan() {
      try {
        const userSession = localStorage.getItem('user');
        let tenantId = getCookie('tenant_id') || '';
        let authToken = '';
        
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (!tenantId) {
              tenantId = parsed.tenant_id || '';
            }
            authToken = parsed.access_token || parsed.token || '';
          } catch (e) {
            console.error("Error parsing user session in AI Webmaster Page:", e);
          }
        }

        if (!tenantId) {
          setCheckingPlan(false);
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/settings/limits`, {
          headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          }
        });
        if (res.ok) {
          const limitsData = await res.json();
          const pType = limitsData.plan_type?.toLowerCase() || 'free';
          setPlanType(pType);
          
          const userStr = localStorage.getItem('user');
          if (userStr) {
            const userObj = JSON.parse(userStr);
            if (userObj.plan_type !== pType) {
              localStorage.setItem('user', JSON.stringify({ ...userObj, plan_type: pType }));
            }
          }
        }
      } catch (err) {
        console.error("Error al obtener límites de plan en AI Webmaster Page:", err);
      } finally {
        setCheckingPlan(false);
      }
    }
    fetchPlan();

    const isSupportMode = getCookie('is_impersonating') === 'true' || Boolean(getCookie('impersonate_tenant_id'));
    if (isSupportMode) {
      setPlanType('gold');
      setCheckingPlan(false);
    }

    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const activeSlug = getCookie('impersonate_tenant_slug') || getCookie('tenant_slug') || '';
      const previewUrl = activeSlug ? `${origin}/?tenant=${encodeURIComponent(activeSlug)}` : `${origin}/`;
      setIframeUrl(previewUrl);
    }
  }, []);

  const handleFieldsUpdated = (updatedFields: string[], redirectUrl?: string) => {
    if (redirectUrl) {
      const origin = window.location.origin;
      const activeSlug = getCookie('impersonate_tenant_slug') || getCookie('tenant_slug') || '';
      const separator = redirectUrl.includes('?') ? '&' : '?';
      const tenantParam = activeSlug ? `${separator}tenant=${encodeURIComponent(activeSlug)}` : '';
      setIframeUrl(`${origin}${redirectUrl}${tenantParam}`);
    }
    // Si la IA modificó campos de la landing page, recargar el iframe automáticamente
    setIframeKey((prev) => prev + 1);
    toast.success('Recargando vista previa con los últimos cambios...');
  };

  const forceReload = () => {
    setIsLoadingIframe(true);
    setIframeKey((prev) => prev + 1);
  };

  if (checkingPlan) {
    return (
      <div className="absolute inset-0 bg-[#FAFAFA] flex flex-col items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 rounded-full border-2 border-stone-200/30" />
            <span className="w-12 h-12 rounded-full border-2 border-t-[#d4af37] border-r-[#d4af37] animate-spin" />
          </div>
          <p className="text-[12px] font-bold text-stone-400 uppercase tracking-widest animate-pulse">
            Verificando Credenciales...
          </p>
        </div>
      </div>
    );
  }

  const isSupportMode = typeof document !== 'undefined' && Boolean(
    getCookie('is_impersonating') === 'true' || 
    getCookie('impersonate_tenant_id')
  );

  if (planType !== 'gold' && !isSupportMode) {
    return (
      <div className="absolute inset-0 bg-[#FAFAFA] flex items-center justify-center p-6 z-50 overflow-auto">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 md:p-10 border border-stone-200/60 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1c1917] to-stone-800 flex items-center justify-center shadow-md">
            <Sparkles size={28} className="text-[#d4af37] animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <span className="inline-block bg-amber-50 text-[#b38f2b] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200/50">
              Módulo VIP Exclusivo · Plan Elite
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 tracking-tight">
              Estudio AI Webmaster en Vivo
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto">
              Diseña, maqueta y transforma el escaparate público de tu negocio con asistencia creativa en tiempo real y vista previa interactiva simultánea.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-4 text-left space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] mb-1">Ventajas del Estudio Webmaster Elite</h3>
            <ul className="text-xs text-stone-600 space-y-1.5 font-medium animate-in fade-in slide-in-from-bottom-1 duration-500 delay-100">
              <li className="flex items-center gap-2">✨ Director Creativo y Webmaster 24/7 conectado a tu web pública</li>
              <li className="flex items-center gap-2">🔄 Vista previa en directo con cambios instantáneos en Móvil, Tablet y PC</li>
              <li className="flex items-center gap-2">🎨 Modificación conversacional de paletas, tipografías y secciones Hero</li>
              <li className="flex items-center gap-2">✍️ Redacción comercial premium y optimización SEO de tratamientos</li>
            </ul>
            <p className="text-[11px] text-stone-400 pt-2 border-t border-stone-200/40 italic">
              💡 Tu Co-Piloto Operativo de gestión diaria sigue activo en el icono flotante del panel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => window.location.href = '/dashboard/settings?tab=subscription'}
              className="flex-1 bg-[#1c1917] hover:bg-[#d4af37] text-white hover:text-[#1c1917] py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              Mejorar al Plan Elite (129€)
            </button>
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="sm:w-28 border border-stone-200 hover:bg-stone-50 text-stone-600 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 active:scale-95"
            >
              Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row overflow-hidden bg-white z-20">
      
      {/* ── COLUMNA IZQUIERDA: MEGA DISEÑADOR (CHAT IA + BIBLIOTECA DE BLOQUES) ── */}
      <div className="w-full lg:w-[550px] h-[50vh] lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-stone-200 shrink-0 bg-white">
        {/* Switcher Superior de Modo */}
        <div className="px-5 py-2.5 bg-white border-b border-stone-200/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 bg-stone-100/90 p-1 rounded-xl border border-stone-200/60 w-full">
            <button
              onClick={() => setLeftTab('chat')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                leftTab === 'chat'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <MessageSquareText size={13} className={leftTab === 'chat' ? 'text-[#d4af37]' : ''} />
              <span>Co-Piloto IA</span>
            </button>
            <button
              onClick={() => setLeftTab('blocks')}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 ${
                leftTab === 'blocks'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <Layers size={13} className={leftTab === 'blocks' ? 'text-[#d4af37]' : ''} />
              <span>Bloques & Elementor</span>
            </button>
          </div>
        </div>

        {/* Contenido según Pestaña */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {leftTab === 'chat' ? (
            <AIChatContainer
              onFieldsUpdated={handleFieldsUpdated}
              initialPrompt={injectedPrompt}
              onPromptConsumed={() => setInjectedPrompt(null)}
            />
          ) : (
            <WebmasterBlocksPanel
              activePageSlug={activePageSlug}
              onChangeActivePage={(slug, path) => {
                setActivePageSlug(slug);
                const origin = window.location.origin;
                const activeSlug = getCookie('impersonate_tenant_slug') || getCookie('tenant_slug') || '';
                const separator = path.includes('?') ? '&' : '?';
                const tenantParam = activeSlug ? `${separator}tenant=${encodeURIComponent(activeSlug)}` : '';
                setIframeUrl(`${origin}${path}${tenantParam}`);
                setIframeKey((k) => k + 1);
              }}
              onBlockInserted={forceReload}
              onAskAI={(prompt) => {
                setInjectedPrompt(prompt);
                setLeftTab('chat');
              }}
              onOpenVisualBuilder={() => setWorkspaceMode('builder')}
            />
          )}
        </div>
      </div>

      {/* ── COLUMNA DERECHA (60%): VISTA PREVIA O DISEÑADOR VISUAL ── */}
      <div className="flex-1 h-[50vh] lg:h-full flex flex-col bg-stone-50 overflow-hidden relative">
        
        {/* Cabecera del Espacio de Trabajo (Quiet Luxury) */}
        <div className="flex items-center justify-between px-6 bg-white border-b border-stone-200/50 shrink-0 gap-3 h-[68px]">
          
          <div className="flex items-center gap-3 min-w-0">
            {/* Conmutador de Modo: Vista Web Pública vs Diseñador Visual */}
            <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200/60 shrink-0">
              <button
                onClick={() => setWorkspaceMode('preview')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                  workspaceMode === 'preview'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Ver cómo queda la web en tiempo real"
              >
                <Eye size={13} className={workspaceMode === 'preview' ? 'text-[#d4af37]' : ''} />
                <span>Web Pública</span>
              </button>

              <button
                onClick={() => setWorkspaceMode('builder')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all duration-200 ${
                  workspaceMode === 'builder'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
                title="Abrir el diseñador con arrastre de columnas y edición de bloques"
              >
                <PencilRuler size={13} className={workspaceMode === 'builder' ? 'text-[#d4af37]' : ''} />
                <span>Diseñador Visual</span>
              </button>
            </div>

            {/* Información o Barra de URL según modo */}
            {workspaceMode === 'preview' ? (
              <div className="hidden sm:flex items-center gap-2 bg-stone-50 border border-stone-200/70 rounded-xl px-3 py-1.5 text-[11px] font-mono text-stone-600 max-w-xs md:max-w-sm truncate select-all shadow-2xs">
                <Globe size={12} className="text-[#d4af37] shrink-0" />
                <span className="truncate">{iframeUrl || getPublicUrl(activePageSlug)}</span>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 text-xs font-bold text-stone-600 bg-amber-50/60 border border-amber-200/50 rounded-xl">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
                <span className="text-[11px]">
                  {activePageSlug === 'home' ? 'Editor CMS de Portada' : `Diseñador Web: ${activePageSlug}`}
                </span>
              </div>
            )}
          </div>

          {/* Controles del Lado Derecho */}
          <div className="flex items-center gap-2 shrink-0">
            {workspaceMode === 'preview' ? (
              <>
                {/* Selector de Dispositivos */}
                <div className="flex items-center bg-stone-100/80 rounded-xl p-1 border border-stone-200/50">
                  <button
                    onClick={() => setViewMode('desktop')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      viewMode === 'desktop'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                    title="Escritorio (Ancho Completo)"
                  >
                    <Monitor size={14} />
                    <span className="hidden md:inline">Escritorio</span>
                  </button>

                  <button
                    onClick={() => setViewMode('tablet')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      viewMode === 'tablet'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                    title="Tablet (768px)"
                  >
                    <Tablet size={14} />
                    <span className="hidden md:inline">Tablet</span>
                  </button>

                  <button
                    onClick={() => setViewMode('mobile')}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      viewMode === 'mobile'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                    title="Móvil (Responsivo)"
                  >
                    <Smartphone size={14} />
                    <span className="hidden md:inline">Móvil</span>
                  </button>
                </div>

                <div className="w-px h-6 bg-stone-200" />

                {/* Recargar */}
                <button
                  onClick={forceReload}
                  className="flex items-center justify-center p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
                  title="Recargar vista previa"
                >
                  <RefreshCw size={15} className={isLoadingIframe ? 'animate-spin text-[#d4af37]' : ''} />
                </button>
                
                {iframeUrl && (
                  <a
                    href={iframeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
                    title="Abrir en pestaña nueva"
                  >
                    <ExternalLink size={15} />
                  </a>
                )}
              </>
            ) : (
              <>
                {/* Botón para abrir el diseñador a pantalla completa */}
                <a
                  href={getBuilderUrl(activePageSlug)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200/80 text-stone-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Abrir en pantalla completa en una nueva pestaña"
                >
                  <Maximize2 size={13} />
                  <span className="hidden sm:inline">Pantalla Completa</span>
                </a>

                {/* Recargar iframe del diseñador */}
                <button
                  onClick={forceReload}
                  className="flex items-center justify-center p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-all"
                  title="Recargar diseñador"
                >
                  <RefreshCw size={15} className={isLoadingIframe ? 'animate-spin text-[#d4af37]' : ''} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Iframe Viewport Container */}
        <div className={`flex-1 overflow-auto bg-stone-100/70 flex items-center justify-center relative ${
          workspaceMode === 'builder' || viewMode === 'desktop' ? 'p-0' : 'p-4 sm:p-6'
        }`}>
          <div
            className={`relative bg-white transition-all duration-300 ease-out flex flex-col ${
              workspaceMode === 'builder' || viewMode === 'desktop'
                ? 'w-full h-full border-0 shadow-none rounded-none'
                : viewMode === 'tablet'
                  ? 'w-[768px] max-w-full h-[95%] max-h-[960px] rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden'
                  : 'w-[420px] max-w-full h-[95%] max-h-[860px] rounded-3xl border border-stone-200/90 shadow-2xl overflow-hidden'
            }`}
          >
            {/* Pantalla del Iframe */}
            {(() => {
              const currentSrc = workspaceMode === 'preview' 
                ? (iframeUrl || getPublicUrl(activePageSlug)) 
                : getBuilderUrl(activePageSlug);

              return (
                <iframe
                  key={`${workspaceMode}-${activePageSlug}-${iframeKey}`}
                  src={currentSrc}
                  className="w-full h-full border-0 rounded-none overflow-auto"
                  onLoad={() => setIsLoadingIframe(false)}
                  title={workspaceMode === 'preview' ? 'Vista Previa Web Pública' : 'Diseñador Visual'}
                />
              );
            })()}

            {/* Spinner de carga superpuesto */}
            {isLoadingIframe && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center transition-all z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-12 h-12 rounded-full border-2 border-stone-200/30" />
                    <span className="w-12 h-12 rounded-full border-2 border-t-[#d4af37] border-r-[#d4af37] animate-spin" />
                  </div>
                  <p className="text-[12px] font-bold text-stone-500 uppercase tracking-widest animate-pulse">
                    {workspaceMode === 'preview' ? 'Renderizando Landing Page...' : 'Cargando Diseñador Visual...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
