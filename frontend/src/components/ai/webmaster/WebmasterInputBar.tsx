'use client';

import React, { RefObject } from 'react';
import { Send, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import VoiceRecorderButton from '../VoiceRecorderButton';
import type { AttachedFile } from '../useCopilotFiles';

interface WebmasterInputBarProps {
  input: string;
  onChangeInput: (val: string) => void;
  onSend: (textToSend?: string) => void;
  isLoading: boolean;
  chatLanguage: string;
  placeholder?: string;
  // Soporte de Imágenes y Capturas (Ctrl+V)
  attachedFile?: AttachedFile | null;
  onRemoveFile?: () => void;
  onAttachClick?: () => void;
  fileInputRef?: RefObject<HTMLInputElement>;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPaste?: (e: React.ClipboardEvent) => void;
  isUploading?: boolean;
}

export default function WebmasterInputBar({
  input,
  onChangeInput,
  onSend,
  isLoading,
  chatLanguage,
  placeholder = 'Pregúntame algo o envíame un comando de voz...',
  attachedFile,
  onRemoveFile,
  onAttachClick,
  fileInputRef,
  onFileChange,
  onPaste,
  isUploading = false,
}: WebmasterInputBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-stone-200/60 shadow-xs shrink-0 select-text">
      {/* Vista previa de fotografía adjunta o pegada */}
      {attachedFile && (
        <div className="mb-2.5 px-3 py-1.5 bg-amber-50/90 border border-amber-300/70 rounded-2xl flex items-center justify-between gap-2 shadow-2xs animate-in fade-in slide-in-from-bottom-1 duration-150">
          <div className="flex items-center gap-2.5 text-stone-700 min-w-0">
            {attachedFile.type === 'image' && attachedFile.url ? (
              <img
                src={attachedFile.url}
                className="w-8 h-8 rounded-xl object-cover border border-amber-300/80 shadow-2xs shrink-0"
                alt="Vista previa"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-100/80 border border-amber-300/80 flex items-center justify-center text-[#d4af37] shrink-0">
                <ImageIcon size={15} />
              </div>
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-stone-900 truncate max-w-[200px]">
                {attachedFile.name}
              </span>
              <span className="text-[10px] text-amber-800 font-medium tracking-tight">
                Fotografía lista para análisis, cambio o inserción
              </span>
            </div>
          </div>
          {onRemoveFile && (
            <button
              onClick={onRemoveFile}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-amber-100 transition-colors shrink-0"
              title="Quitar archivo adjunto"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Input de archivo oculto */}
      {fileInputRef && onFileChange && (
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept=".png,.jpg,.jpeg,.webp"
          className="hidden"
        />
      )}

      {/* Cápsula de entrada interactiva con soporte de pegado (Ctrl+V) */}
      <div 
        onPaste={onPaste}
        className="flex items-center gap-2 bg-stone-50 hover:bg-stone-50/80 border border-stone-200/80 focus-within:bg-white focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/15 rounded-2xl p-2 transition-all shadow-xs"
      >
        {/* Botón de adjuntar imagen desde galería/disco */}
        {onAttachClick && (
          <button
            type="button"
            onClick={onAttachClick}
            disabled={isLoading || isUploading}
            className="h-8 w-8 rounded-xl text-stone-400 hover:text-[#d4af37] hover:bg-amber-50/60 flex items-center justify-center transition-all disabled:opacity-30 shrink-0"
            title="Adjuntar imagen o captura de pantalla (también puedes pulsar Ctrl+V para pegar directamente)"
          >
            {isUploading ? (
              <Loader2 size={15} className="animate-spin text-[#d4af37]" />
            ) : (
              <ImageIcon size={16} />
            )}
          </button>
        )}

        <VoiceRecorderButton
          disabled={isLoading || isUploading}
          lang={chatLanguage}
          onVoiceTranscribed={(text) => onSend(`[Voz]: "${text}"`)}
          size="sm"
        />

        <input
          type="text"
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={onPaste}
          disabled={isLoading || isUploading}
          placeholder={isUploading ? 'Subiendo fotografía...' : placeholder}
          className="flex-1 bg-transparent border-none text-[13px] text-stone-800 placeholder-stone-400 focus:outline-none px-2 py-1 leading-relaxed"
        />

        <button
          onClick={() => onSend()}
          disabled={(!input.trim() && !attachedFile) || isLoading || isUploading}
          className="h-8 w-8 rounded-xl bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:hover:bg-stone-900 active:scale-95 shadow-xs shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
