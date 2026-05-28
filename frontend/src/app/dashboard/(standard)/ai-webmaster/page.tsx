'use client';

import { useState, useEffect } from 'react';
import AIChatContainer from '@/components/ai/AIChatContainer';
import { RefreshCw, ExternalLink, Monitor, Smartphone, Globe, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

export default function AIWebmasterPage() {
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);
  const [planType, setPlanType] = useState<string | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(true);

  useEffect(() => {
    // Helper simple para leer cookies del lado del cliente
    function getCookie(name: string): string | null {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    }

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

    if (typeof window !== 'undefined') {
      // Usar la raíz de la app actual (incluyendo subdominio de inquilino) para la vista previa
      const origin = window.location.origin;
      // Añadir timestamp para evitar caché agresiva en cargas de iframe
      setIframeUrl(`${origin}/`);
    }
  }, []);

  const handleFieldsUpdated = (updatedFields: string[], redirectUrl?: string) => {
    if (redirectUrl) {
      const origin = window.location.origin;
      setIframeUrl(`${origin}${redirectUrl}`);
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

  if (planType !== 'gold') {
    return (
      <div className="absolute inset-0 bg-[#FAFAFA] flex items-center justify-center p-6 z-50 overflow-auto">
        <div className="w-full max-w-lg bg-white rounded-3xl p-8 md:p-10 border border-stone-200/60 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1c1917] to-stone-800 flex items-center justify-center shadow-md">
            <Sparkles size={28} className="text-[#d4af37] animate-pulse" />
          </div>
          
          <div className="space-y-2">
            <span className="inline-block bg-amber-50 text-[#b38f2b] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-amber-200/50">
              Módulo VIP Exclusivo
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 tracking-tight">
              Asistente IA Webmaster
            </h1>
            <p className="text-stone-500 text-sm leading-relaxed max-w-sm mx-auto">
              La edición automatizada y el control conversacional de tu clínica a través de Inteligencia Artificial es una característica reservada para miembros del <span className="font-bold text-stone-800">Plan Gold Elite</span>.
            </p>
          </div>

          <div className="bg-stone-50 border border-stone-200/50 rounded-2xl p-4 text-left space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#d4af37] mb-1">¿Qué incluye el Plan Gold?</h3>
            <ul className="text-xs text-stone-600 space-y-1.5 font-medium animate-in fade-in slide-in-from-bottom-1 duration-500 delay-100">
              <li className="flex items-center gap-2">✨ Especialistas y servicios ilimitados sin restricciones</li>
              <li className="flex items-center gap-2">🤖 Conversaciones por Voz y Texto con el Webmaster IA</li>
              <li className="flex items-center gap-2">🔄 Generación de copias y redacción automatizada para tu web</li>
              <li className="flex items-center gap-2">💼 Terminal POS de Venta Rápida y Facturación Deluxe</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => window.location.href = '/dashboard/settings?tab=subscription'}
              className="flex-1 bg-[#1c1917] hover:bg-[#d4af37] text-white hover:text-[#1c1917] py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95"
            >
              Mejorar Plan de Suscripción
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
      
      {/* ── COLUMNA IZQUIERDA: CHAT DE LA IA ── */}
      <div className="w-full lg:w-[550px] h-[50vh] lg:h-full flex flex-col border-b lg:border-b-0 lg:border-r border-stone-200 shrink-0">
        <AIChatContainer onFieldsUpdated={handleFieldsUpdated} />
      </div>

      {/* ── COLUMNA DERECHA (60%): VISTA PREVIA DEL SITIO PÚBLICO ── */}
      <div className="flex-1 h-[50vh] lg:h-full flex flex-col bg-stone-50 overflow-hidden relative">
        
        {/* Cabecera de la Vista Previa (Quiet Luxury / Simulación de Navegador) */}
        <div className="flex items-center justify-between px-6 bg-white border-b border-stone-200/50 shrink-0 gap-3 h-[72px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-400/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <span className="w-3 h-3 rounded-full bg-green-400/80" />
            </div>
            {/* Barra de dirección simulada */}
            <div className="hidden md:flex items-center gap-2 bg-stone-50 border border-stone-200/60 rounded-lg px-3 py-1 text-[11px] font-mono text-stone-400 w-80 truncate select-all">
              <Globe size={11} className="text-stone-300" />
              {iframeUrl}
            </div>
          </div>

          {/* Controles de Vista Previa */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            {/* Cambiar dispositivo */}
            <div className="flex items-center bg-stone-100 rounded-lg p-0.5 border border-stone-200/40">
              <button
                onClick={() => setViewMode('desktop')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'desktop'
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
                title="Vista de Escritorio"
              >
                <Monitor size={15} />
              </button>
              <button
                onClick={() => setViewMode('mobile')}
                className={`p-1.5 rounded-md transition-all ${
                  viewMode === 'mobile'
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-400 hover:text-stone-600'
                }`}
                title="Vista Móvil"
              >
                <Smartphone size={15} />
              </button>
            </div>

            <div className="w-px h-6 bg-stone-200" />

            {/* Recargar / Abrir externa */}
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
          </div>
        </div>

        {/* Iframe Viewport Container */}
        <div className={`flex-1 overflow-auto bg-stone-100/60 flex items-start justify-start shadow-inner ${viewMode === 'mobile' ? 'p-6' : 'p-0'}`}>
          <div
            className={`relative bg-white shadow-2xl border border-stone-200/80 transition-all duration-500 ease-out flex flex-col shrink-0 ${
              viewMode === 'mobile'
                ? 'w-[375px] h-[667px] rounded-[2.5rem] border-[10px] border-stone-900 shadow-stone-400/50 mx-auto'
                : 'w-[1500px] h-full min-h-[750px] rounded-xl'
            }`}
          >
            {/* Pantalla del Iframe */}
            {iframeUrl ? (
              <iframe
                key={`${iframeKey}`}
                src={iframeUrl}
                className="w-full h-full border-0 rounded-none overflow-auto"
                onLoad={() => setIsLoadingIframe(false)}
                title="Vista Previa de Landing Page"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-400">
                <Globe size={32} className="animate-pulse" />
                <p className="text-sm font-medium">Iniciando previsualizador...</p>
              </div>
            )}

            {/* Spinner de carga superpuesto */}
            {isLoadingIframe && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center transition-all z-20">
                <div className="flex flex-col items-center gap-3">
                  <div className="relative flex items-center justify-center">
                    <span className="absolute w-12 h-12 rounded-full border-2 border-stone-200/30" />
                    <span className="w-12 h-12 rounded-full border-2 border-t-[#d4af37] border-r-[#d4af37] animate-spin" />
                  </div>
                  <p className="text-[12px] font-bold text-stone-500 uppercase tracking-widest animate-pulse">
                    Renderizando Landing Page...
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
