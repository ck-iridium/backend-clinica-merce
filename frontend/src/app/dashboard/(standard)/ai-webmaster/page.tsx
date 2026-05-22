'use client';

import { useState, useEffect } from 'react';
import AIChatContainer from '@/components/ai/AIChatContainer';
import { RefreshCw, ExternalLink, Monitor, Smartphone, Globe } from 'lucide-react';
import { toast } from 'sonner';

export default function AIWebmasterPage() {
  const [iframeUrl, setIframeUrl] = useState('');
  const [iframeKey, setIframeKey] = useState(0);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isLoadingIframe, setIsLoadingIframe] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Usar la raíz de la app actual (incluyendo subdominio de inquilino) para la vista previa
      const origin = window.location.origin;
      // Añadir timestamp para evitar caché agresiva en cargas de iframe
      setIframeUrl(`${origin}/`);
    }
  }, []);

  const handleFieldsUpdated = (updatedFields: string[]) => {
    // Si la IA modificó campos de la landing page, recargar el iframe automáticamente
    setIframeKey((prev) => prev + 1);
    toast.success('Recargando vista previa con los últimos cambios...');
  };

  const forceReload = () => {
    setIsLoadingIframe(true);
    setIframeKey((prev) => prev + 1);
  };

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
