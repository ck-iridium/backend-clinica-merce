'use client';

import React, { RefObject } from 'react';
import { Send, Paperclip, FileText, Lock, X } from 'lucide-react';
import { toast } from 'sonner';
import VoiceRecorderButton from './VoiceRecorderButton';
import type { AttachedFile } from './useCopilotFiles';

interface CopilotInputBarProps {
  // Texto
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  isLoading: boolean;
  isUploading: boolean;
  // Adjuntos
  attachedFile: AttachedFile | null;
  onRemoveFile: () => void;
  onAttachClick: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  canAttachFiles: boolean;
  planType: string | null;
  hasOwnKey: boolean;
  // Voz
  language: string;
  audioLanguage: string;
  onVoiceTranscribed: (text: string) => void;
  onUnlockAudio: () => void;
}

export default function CopilotInputBar({
  input,
  onInputChange,
  onSend,
  onKeyDown,
  isLoading,
  isUploading,
  attachedFile,
  onRemoveFile,
  onAttachClick,
  fileInputRef,
  onFileChange,
  canAttachFiles,
  planType,
  hasOwnKey,
  language,
  audioLanguage,
  onVoiceTranscribed,
  onUnlockAudio,
}: CopilotInputBarProps) {
  const handleAttachClick = () => {
    if (!canAttachFiles) {
      toast.error(
        language === 'fr'
          ? 'Le téléchargement de documents nécessite un plan Pro ou Gold.'
          : language === 'en'
            ? 'Uploading files requires a Pro or Gold plan.'
            : 'Subir archivos requiere una suscripción Pro o Gold.'
      );
      return;
    }
    onAttachClick();
  };

  const attachButtonTitle = !canAttachFiles
    ? (language === 'fr'
      ? 'Téléchargement de fichiers (Pro/Gold uniquement)'
      : language === 'en'
        ? 'File upload (Pro/Gold only)'
        : 'Subir archivos (Solo Pro/Gold)')
    : (language === 'fr'
      ? 'Joindre un fichier sécurisé (CSV, TXT, JSON, Image)'
      : language === 'en'
        ? 'Attach secure file (CSV, TXT, JSON, Image)'
        : 'Adjuntar archivo seguro (CSV, TXT, JSON, Imagen)');

  return (
    <div className="p-3 bg-white border-t border-stone-200/60 flex flex-col gap-2 shrink-0 select-text pb-safe">
      {/* Vista previa de archivo adjunto */}
      {attachedFile && (
        <div className="px-3 py-1.5 bg-amber-50/70 border border-amber-200/50 rounded-xl flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-stone-700 min-w-0">
            {attachedFile.type === 'image' && attachedFile.url ? (
              <img src={attachedFile.url} className="w-7 h-7 rounded-lg object-cover border border-amber-200/60 shrink-0" alt="Preview" />
            ) : (
              <FileText size={15} className="text-[#d4af37] shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-medium text-stone-800 truncate max-w-[200px]">
                {attachedFile.name}
              </span>
              <span className="text-[9px] text-amber-700/80 font-medium">
                {attachedFile.type === 'image'
                  ? (language === 'fr' ? 'Image pour service' : language === 'en' ? 'Image for service' : 'Imagen para servicio')
                  : (language === 'fr' ? 'Document sécurisé' : language === 'en' ? 'Secure document' : 'Documento seguro')
                }
              </span>
            </div>
          </div>
          <button
            onClick={onRemoveFile}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-amber-100/50 transition-all shrink-0"
            title={language === 'fr' ? 'Retirer le fichier' : language === 'en' ? 'Remove file' : 'Quitar archivo'}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Input de archivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        accept=".txt,.csv,.json,.png,.jpg,.jpeg,.webp"
        className="hidden"
      />

      {/* Cápsula Unificada de Entrada */}
      <div className="bg-stone-50 hover:bg-stone-50/80 border border-stone-200/80 focus-within:bg-white focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/15 rounded-2xl p-2.5 transition-all flex flex-col gap-2 shadow-xs">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading || isUploading}
          rows={2}
          placeholder={language === 'fr' ? 'Écrire un message...' : language === 'en' ? 'Type a message...' : 'Escribe tu mensaje...'}
          className="w-full bg-transparent border-none text-[12.5px] text-stone-800 placeholder-stone-400 focus:outline-none resize-none leading-relaxed min-h-[38px] max-h-28 overflow-y-auto px-1 py-0.5"
        />

        {/* Fila de Herramientas Inferior */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-stone-200/40">
          {/* Botón de Adjuntar */}
          <button
            type="button"
            onClick={handleAttachClick}
            disabled={isLoading || isUploading}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 shrink-0 ${
              isUploading
                ? 'animate-pulse bg-amber-50 text-amber-800'
                : 'text-stone-500 hover:text-stone-800 hover:bg-stone-200/50'
            }`}
            title={attachButtonTitle}
          >
            {!canAttachFiles ? (
              <Lock size={13} className="text-amber-500" />
            ) : (
              <Paperclip size={13} />
            )}
            <span className="text-[11px]">
              {isUploading
                ? (language === 'fr' ? 'Envoi...' : language === 'en' ? 'Uploading...' : 'Subiendo...')
                : (language === 'fr' ? 'Joindre' : language === 'en' ? 'Attach' : 'Adjuntar')
              }
            </span>
          </button>

          {/* Grabadora de Voz + Enviar */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-400 font-medium hidden sm:inline-block">
              {language === 'fr' ? 'Parler ?' : language === 'en' ? 'Speak?' : '¿Hablar?'}
            </span>
            <VoiceRecorderButton
              onVoiceTranscribed={onVoiceTranscribed}
              disabled={isLoading || isUploading}
              lang={audioLanguage}
              onStartClick={onUnlockAudio}
              size="sm"
            />
            <button
              onClick={onSend}
              disabled={isLoading || isUploading || (!input.trim() && !attachedFile)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl bg-stone-900 text-white transition-all duration-300 border border-stone-800 shadow-xs shrink-0 active:scale-95 ${
                isLoading || isUploading || (!input.trim() && !attachedFile)
                  ? 'opacity-30 cursor-not-allowed'
                  : 'hover:bg-[#d4af37] hover:text-stone-950 hover:border-[#d4af37]'
              }`}
              title={language === 'fr' ? 'Envoyer le message' : language === 'en' ? 'Send Message' : 'Enviar Mensaje'}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
