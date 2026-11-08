'use client';

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Volume2, VolumeX, Smartphone, Sparkles, X } from 'lucide-react';

interface VideoAudioPromptModalProps {
  isOpen: boolean;
  fileName?: string;
  fileSize?: number;
  onSelectOption: (keepAudio: boolean) => void;
  onCancel: () => void;
}

export default function VideoAudioPromptModal({
  isOpen,
  fileName,
  fileSize,
  onSelectOption,
  onCancel
}: VideoAudioPromptModalProps) {
  // Manejo de tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  const formattedSize = fileSize
    ? fileSize > 1024 * 1024
      ? `${(fileSize / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(fileSize / 1024)} KB`
    : null;

  const content = (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-stone-200/90 relative text-left animate-in zoom-in-95 duration-200 space-y-5"
      >
        {/* Botón de cierre */}
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-500 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>

        {/* Cabecera */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200/60 text-[10px] font-black uppercase tracking-wider mb-2.5">
            <Sparkles size={12} className="text-[#D4AF37]" />
            <span>Compresión Inteligente Probookia</span>
          </div>

          <h3 className="text-lg font-serif font-bold text-stone-900 leading-tight">
            ¿Deseas mantener el sonido del vídeo?
          </h3>

          {fileName && (
            <p className="text-[11px] text-stone-500 mt-1 truncate">
              Archivo: <span className="font-semibold text-stone-700">{fileName}</span>
              {formattedSize && ` (${formattedSize})`}
            </p>
          )}
        </div>

        {/* Aviso de reducción a pantalla móvil */}
        <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-stone-50 border border-stone-200/70 text-[11px] text-stone-600 leading-relaxed">
          <Smartphone size={16} className="text-[#D4AF37] shrink-0 mt-0.5" />
          <p>
            El vídeo se reducirá automáticamente a <strong className="text-stone-900 font-semibold">resolución de pantalla móvil (máx. 540p)</strong> para que cargue instantáneamente y no sature la memoria.
          </p>
        </div>

        {/* Opciones de Audio */}
        <div className="grid grid-cols-1 gap-3">
          {/* Opción 1: Silenciar (Recomendado) */}
          <button
            type="button"
            onClick={() => onSelectOption(false)}
            className="w-full text-left p-4 rounded-2xl border border-stone-200 hover:border-amber-400 bg-white hover:bg-amber-50/30 transition-all duration-200 group flex items-start gap-3.5 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 group-hover:bg-[#D4AF37] group-hover:text-stone-950 flex items-center justify-center shrink-0 transition-colors">
              <VolumeX size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900 group-hover:text-stone-950">
                  Silenciar (Sin Sonido)
                </span>
                <span className="text-[9px] font-black bg-stone-100 group-hover:bg-amber-100 text-stone-600 group-hover:text-amber-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Recomendado
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Elimina la pista de audio. Ideal para vídeos de demostración o fondos en bucle web con peso ultra ligero.
              </p>
            </div>
          </button>

          {/* Opción 2: Mantener Audio */}
          <button
            type="button"
            onClick={() => onSelectOption(true)}
            className="w-full text-left p-4 rounded-2xl border border-stone-200 hover:border-stone-900 bg-white hover:bg-stone-50 transition-all duration-200 group flex items-start gap-3.5 cursor-pointer shadow-2xs hover:shadow-sm"
          >
            <div className="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 group-hover:bg-stone-900 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
              <Volume2 size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-900">
                  Conservar Sonido
                </span>
                <span className="text-[9px] font-black bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  AAC 96 kbps
                </span>
              </div>
              <p className="text-[11px] text-stone-500 mt-1 leading-snug">
                Mantiene la locución y música original comprimida en alta fidelidad estéreo.
              </p>
            </div>
          </button>
        </div>

        {/* Botón cancelar */}
        <div className="pt-1 flex justify-center">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-stone-400 hover:text-stone-700 font-medium py-1 px-3 transition-colors cursor-pointer"
          >
            Cancelar subida
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : null;
}

