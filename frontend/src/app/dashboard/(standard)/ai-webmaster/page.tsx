'use client';

import { useState, useEffect } from 'react';
import AIChatContainer from '@/components/ai/AIChatContainer';
import { 
  RefreshCw, ExternalLink, Monitor, Smartphone, Tablet, Globe, 
  Sparkles, ChevronDown, Check 
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

interface PageItem {
  id: string;
  label: string;
  path: string;
  is_custom: boolean;
}

export interface SelectedSection {
  id: string;
  name: string;
  pageSlug: string;
  blockType?: string;
}

export default function AIWebmasterPage() {
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [activePageSlug, setActivePageSlug] = useState<string>('home');
  const [activePageTitle, setActivePageTitle] = useState<string>('Portada');
  const [injectedPrompt, setInjectedPrompt] = useState<string | null>(null);
  const [pages, setPages] = useState<PageItem[]>([]);
  const [showPageMenu, setShowPageMenu] = useState(false);
  const [selectedSection, setSelectedSection] = useState<SelectedSection | null>(null);

  // Construir URL pública según slug
  const buildPublicUrl = (path: string) => {
    if (typeof window === 'undefined') return '';
    const origin = window.location.origin;
    const activeSlug = getCookie('impersonate_tenant_slug') || getCookie('tenant_slug') || '';
    const cleanPath = path || '/';
    const separator = cleanPath.includes('?') ? '&' : '?';
    const tenantParam = activeSlug ? `${separator}tenant=${encodeURIComponent(activeSlug)}` : '';
    return `${origin}${cleanPath}${tenantParam}`;
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

    // 2. Fetch de límites y páginas
    async function loadData() {
      try {
        const userSession = localStorage.getItem('user');
        let tenantId = getCookie('tenant_id') || '';
        let authToken = '';

        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (!tenantId) tenantId = parsed.tenant_id || '';
            authToken = parsed.access_token || parsed.token || '';
          } catch (e) {
            console.error('Error parsing session:', e);
          }
        }

        if (!tenantId) {
          setCheckingPlan(false);
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        
        // Cargar plan y páginas en paralelo
        const [resPlan, resNav] = await Promise.all([
          fetch(`${API_URL}/settings/limits`, {
            headers: {
              'X-Tenant-ID': tenantId,
              Authorization: authToken ? `Bearer ${authToken}` : '',
            },
          }),
          fetch(`${API_URL}/cms/navigation`, {
            headers: {
              'X-Tenant-ID': tenantId,
              Authorization: authToken ? `Bearer ${authToken}` : '',
            },
          }),
        ]);

        if (resPlan.ok) {
          const limitsData = await resPlan.json();
          const pType = limitsData.plan_type?.toLowerCase() || 'free';
          setPlanType(pType);
        }

        if (resNav.ok) {
          const navItems: any[] = await resNav.json();
          const customNavs: PageItem[] = navItems
            .filter((n: any) => n.is_custom)
            .map((n: any) => ({
              id: n.id || n.slug,
              label: n.label || n.title,
              path: n.path.startsWith('/') ? n.path : `/${n.path}`,
              is_custom: true,
            }));

          setPages([
            { id: 'home', label: 'Portada (Home)', path: '/', is_custom: false },
            ...customNavs,
          ]);
        }
      } catch (err) {
        console.error('Error cargando datos de AI Webmaster:', err);
      } finally {
        setCheckingPlan(false);
      }
    }

    loadData();

    const isSupportMode = getCookie('is_impersonating') === 'true' || Boolean(getCookie('impersonate_tenant_id'));
    if (isSupportMode) {
      setPlanType('gold');
      setCheckingPlan(false);
    }

    if (typeof window !== 'undefined') {
      const initialUrl = buildPublicUrl('/');
      setIframeUrl(initialUrl);
    }
  }, []);

  // Escuchar selecciones visuales desde el iframe (Inspector Visual)
  useEffect(() => {
    const handleIframeMessage = (event: MessageEvent) => {
      if (event.data?.type === 'WEBMASTER_SECTION_SELECTED') {
        const { sectionId, sectionName, pageSlug, blockType } = event.data;
        setSelectedSection({ id: sectionId, name: sectionName, pageSlug, blockType });
        toast.info(`Sección seleccionada: ${sectionName}`);
      }
    };
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  const handleClearSelectedSection = () => {
    setSelectedSection(null);
    const iframe = document.querySelector('iframe');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage({ type: 'WEBMASTER_CLEAR_SELECTION' }, '*');
    }
  };

  const handleSelectPage = (page: PageItem) => {
    const slug = page.path === '/' ? 'home' : page.path.replace(/^\//, '');
    setActivePageSlug(slug);
    setActivePageTitle(page.label);
    const newUrl = buildPublicUrl(page.path);
    setIframeUrl(newUrl);
    setIsLoadingIframe(true);
    setIframeKey((k) => k + 1);
    setShowPageMenu(false);
    setSelectedSection(null);
  };

  const handleFieldsUpdated = (updatedFields: string[], redirectUrl?: string) => {
    if (redirectUrl) {
      const cleanPath = redirectUrl.startsWith('/') ? redirectUrl : `/${redirectUrl}`;
      const slug = cleanPath === '/' ? 'home' : cleanPath.replace(/^\//, '');
      setActivePageSlug(slug);
      
      const matchingPage = pages.find(p => p.path === cleanPath || (cleanPath === '/' && p.id === 'home'));
      if (matchingPage) {
        setActivePageTitle(matchingPage.label);
      } else {
        setActivePageTitle(slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '));
      }
      setIframeUrl(buildPublicUrl(cleanPath));
    }
    setIframeKey((prev) => prev + 1);
    toast.success('Escaparate actualizado en vivo.');
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
            <ul className="text-xs text-stone-600 space-y-1.5 font-medium">
              <li className="flex items-center gap-2">✨ Director Creativo y Webmaster 24/7 conectado a tu web pública</li>
              <li className="flex items-center gap-2">🔄 Vista previa en directo con cambios instantáneos en Móvil, Tablet y PC</li>
              <li className="flex items-center gap-2">🎨 Modificación conversacional de paletas, tipografías y secciones Hero</li>
              <li className="flex items-center gap-2">✍️ Redacción comercial premium y optimización SEO de tratamientos</li>
            </ul>
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
      
      {/* ── COLUMNA IZQUIERDA: CO-PILOTO IA (100% LIMPIO Y ENFOCADO) ── */}
      <div className="w-full lg:w-[480px] xl:w-[520px] h-[45vh] lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-stone-200 shrink-0 bg-white">
        <AIChatContainer
          onFieldsUpdated={handleFieldsUpdated}
          initialPrompt={injectedPrompt}
          onPromptConsumed={() => setInjectedPrompt(null)}
          activePageSlug={activePageSlug}
          activePageTitle={activePageTitle}
          selectedSection={selectedSection}
          onClearSelectedSection={handleClearSelectedSection}
        />
      </div>

      {/* ── COLUMNA DERECHA: ESCAPARATE EN VIVO (100% WEB PÚBLICA) ── */}
      <div className="flex-1 h-[55vh] lg:h-full flex flex-col bg-stone-100 overflow-hidden relative">
        
        {/* Cabecera del Escaparate */}
        <div className="flex items-center justify-between px-6 bg-white border-b border-stone-200/70 shrink-0 gap-3 h-14 z-30">
          
          {/* Izquierda: Selector de Página Activa */}
          <div className="flex items-center gap-3 min-w-0 relative">
            <div className="relative">
              <button
                onClick={() => setShowPageMenu(!showPageMenu)}
                className="flex items-center gap-2 bg-stone-100 hover:bg-stone-200/80 px-3 py-1.5 rounded-xl text-xs font-bold text-stone-800 transition-colors border border-stone-200/70 shadow-2xs"
                title="Cambiar página de la vista previa"
              >
                <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                <span className="truncate max-w-[150px] sm:max-w-[200px]">{activePageTitle}</span>
                <ChevronDown size={13} className={`text-stone-400 transition-transform ${showPageMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Menú Flotante de Páginas */}
              {showPageMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowPageMenu(false)} />
                  <div className="absolute top-full left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-stone-200/80 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-[#d4af37]">
                      Páginas del Escaparate
                    </div>
                    {pages.map((p) => {
                      const isSelected = (activePageSlug === 'home' && p.path === '/') || p.path.endsWith(`/${activePageSlug}`);
                      return (
                        <button
                          key={p.id}
                          onClick={() => handleSelectPage(p)}
                          className={`w-full text-left px-3.5 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-amber-50/70 text-[#b38f2b]'
                              : 'text-stone-700 hover:bg-stone-50'
                          }`}
                        >
                          <span className="truncate">{p.label}</span>
                          {isSelected && <Check size={12} className="text-[#d4af37] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* URL pública del escaparate */}
            <div className="hidden md:flex items-center gap-1.5 text-[11px] font-mono text-stone-400 truncate max-w-xs">
              <Globe size={11} className="text-[#d4af37] shrink-0" />
              <span className="truncate">{iframeUrl || buildPublicUrl('/')}</span>
            </div>
          </div>

          {/* Derecha: Selector de Dispositivos & Acciones */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Dispositivos */}
            <div className="flex items-center bg-stone-100/90 rounded-xl p-1 border border-stone-200/60 shadow-2xs">
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
                <span className="hidden sm:inline">Escritorio</span>
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
                <span className="hidden sm:inline">Tablet</span>
              </button>

              <button
                onClick={() => setViewMode('mobile')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-400 hover:text-stone-700'
                }`}
                title="Móvil (390px)"
              >
                <Smartphone size={14} />
                <span className="hidden sm:inline">Móvil</span>
              </button>
            </div>

            <div className="w-px h-5 bg-stone-200 mx-0.5" />

            {/* Botón Recargar */}
            <button
              onClick={forceReload}
              className="flex items-center justify-center p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-all"
              title="Recargar vista previa"
            >
              <RefreshCw size={15} className={isLoadingIframe ? 'animate-spin text-[#d4af37]' : ''} />
            </button>
            
            {/* Abrir en pestaña nueva */}
            {iframeUrl && (
              <a
                href={iframeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-2 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-xl transition-all"
                title="Abrir web en pestaña nueva"
              >
                <ExternalLink size={15} />
              </a>
            )}
          </div>
        </div>

        {/* Lienzo del Escaparate */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-2 sm:p-4 bg-stone-100/70">
          <div
            className={`transition-all duration-300 flex flex-col bg-white overflow-hidden ${
              viewMode === 'desktop'
                ? 'w-full h-full rounded-2xl shadow-sm border border-stone-200/80'
                : viewMode === 'tablet'
                ? 'w-[768px] max-w-full h-full rounded-3xl shadow-xl border-4 border-stone-800'
                : 'w-[390px] max-w-full h-full rounded-[36px] shadow-2xl border-[6px] border-stone-900'
            }`}
          >
            {/* Barra superior simulada para dispositivo Móvil o Tablet */}
            {viewMode !== 'desktop' && (
              <div className="h-6 bg-stone-900 text-stone-400 flex items-center justify-between px-6 text-[10px] select-none shrink-0 font-medium">
                <span>9:41</span>
                <div className="w-16 h-3 bg-stone-800 rounded-full" />
                <span>100%</span>
              </div>
            )}

            <iframe
              key={iframeKey}
              src={iframeUrl}
              onLoad={() => setIsLoadingIframe(false)}
              className="w-full flex-1 border-0 bg-white"
              title="Escaparate Web en Vivo"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
