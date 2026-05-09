"use client";

import React, { useEffect } from 'react';
import { useAIImage } from '@/app/contexts/AIImageContext';
import { Sparkles, Loader2, CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function AIGenerationFloatingCard() {
  const { isGenerating, generationTime, resultUrl, error, resetGeneration, retry, cancelGeneration } = useAIImage();
  const [isClosing, setIsClosing] = React.useState(false);

  const handleClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      resetGeneration();
      setIsClosing(false);
    }, 500); // Duración de la animación de salida
  }, [resetGeneration]);

  // Auto-close success card after 15 seconds
  useEffect(() => {
    if (resultUrl && !isClosing) {
      const timer = setTimeout(() => {
        handleClose();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [resultUrl, handleClose, isClosing]);

  if (!isGenerating && !resultUrl && !error) return null;

  return (
    <div className={`fixed bottom-6 right-6 z-[200] transition-all duration-500 ${isClosing ? 'animate-out fade-out slide-out-to-bottom-10 fill-mode-forwards' : 'animate-in slide-in-from-right-10'}`}>
      <div className={`w-80 overflow-hidden bg-white rounded-[2.5rem] border shadow-2xl transition-all duration-500 ${isGenerating ? 'border-yellow-200' : resultUrl ? 'border-emerald-200' : 'border-red-200'}`}>
        
        {/* Progress Bar (Header) */}
        <div className="h-1.5 w-full bg-stone-100 relative overflow-hidden">
          {isGenerating && (
            <div className="absolute inset-0 bg-[#d4af37] animate-progress-indefinite rounded-full"></div>
          )}
          {resultUrl && <div className="absolute inset-0 bg-emerald-500"></div>}
          {error && <div className="absolute inset-0 bg-red-500"></div>}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${isGenerating ? 'bg-yellow-50 text-[#d4af37]' : resultUrl ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {isGenerating ? <Loader2 size={20} className="animate-spin" /> : resultUrl ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
              </div>
              <div>
                <h4 className="font-serif font-bold text-stone-800 leading-tight">
                  {isGenerating 
                    ? 'Generando Foto IA' 
                    : '¡Imagen Lista!'}
                </h4>
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">
                  {isGenerating ? `Procesando (${generationTime}s)...` : resultUrl ? 'Listo para el catálogo' : 'Algo salió mal'}
                </p>
              </div>
            </div>
            {(resultUrl || error) && (
              <button onClick={handleClose} className="text-stone-300 hover:text-stone-500 transition-colors">
                <X size={18} />
              </button>
            )}
          </div>

          {isGenerating && (
            <div className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px] font-bold">
                  <span className="text-stone-400 uppercase tracking-widest">Estado</span>
                  <span className={`${generationTime > 60 ? 'text-amber-500' : 'text-[#d4af37]'} transition-colors animate-pulse`}>
                    {generationTime > 60 ? 'Finalizando detalles...' : 'En curso...'}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 leading-relaxed italic">
                  {generationTime > 60 
                    ? "Está tardando más de lo habitual. Puedes esperar un poco más o cancelar y reintentar."
                    : "No cierres esta página mientras trabajamos en tu contenido editorial premium."}
                </div>
              </div>
              <button 
                onClick={cancelGeneration}
                className="w-full py-2 bg-stone-50 hover:bg-stone-100 text-stone-500 rounded-xl text-[9px] font-black uppercase tracking-widest border border-stone-100 transition-all shadow-sm flex items-center justify-center gap-2 group"
              >
                <X size={12} className="group-hover:text-red-500 transition-colors" />
                Cancelar generación
              </button>
            </div>
          )}

          {resultUrl && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300">
              <div className="aspect-[9/16] max-h-48 rounded-2xl overflow-hidden border border-emerald-100 shadow-inner bg-stone-50">
                <img src={resultUrl} alt="Result" className="w-full h-full object-cover" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-2 px-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 animate-pulse">
                  <CheckCircle2 size={14} />
                  <span className="text-[11px] font-bold">Multimedia aplicado al tratamiento</span>
                </div>
                <button 
                  onClick={handleClose}
                  className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95"
                >
                  Entendido
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 rounded-2xl border border-red-100">
              <p className="text-[11px] text-red-600 font-bold leading-tight line-clamp-2 mb-3">{error}</p>
              <button 
                onClick={retry}
                className="w-full py-2 bg-white text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-100 hover:bg-red-600 hover:text-white transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Loader2 size={12} className="rotate-90" />
                Reintentar ahora
              </button>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes progress-indefinite {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-indefinite {
          animation: progress-indefinite 2s infinite linear;
          width: 50%;
        }
      `}</style>
    </div>
  );
}
