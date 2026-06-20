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
    <div className="flex flex-col shrink-0">
      {/* Vista previa de archivo adjunto */}
      {attachedFile && (
        <div className="px-3.5 py-2 bg-stone-50 border-t border-stone-200/60 flex items-center justify-between gap-2 shrink-0 select-text">
          <div className="flex items-center gap-2 text-stone-700 min-w-0">
            {attachedFile.type === 'image' && attachedFile.url ? (
              <img src={attachedFile.url} className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0" alt="Preview" />
            ) : (
              <FileText size={16} className="text-primary shrink-0" />
            )}
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-stone-700 truncate max-w-[180px]">
                {attachedFile.name}
              </span>
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-wider">
                {attachedFile.type === 'image'
                  ? (language === 'fr' ? 'Image pour service/catégorie' : language === 'en' ? 'Image for service/category' : 'Imagen para servicio/categoría')
                  : (language === 'fr' ? 'Document sécurisé (CSV/TXT/JSON)' : language === 'en' ? 'Secure document (CSV/TXT/JSON)' : 'Documento seguro (CSV/TXT/JSON)')
                }
              </span>
            </div>
          </div>
          <button
            onClick={onRemoveFile}
            className="p-1 rounded-full text-stone-400 hover:text-stone-600 hover:bg-stone-200/50 transition-all shrink-0"
            title={language === 'fr' ? 'Retirer le fichier' : language === 'en' ? 'Remove file' : 'Quitar archivo'}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Fila 1: Controles multimedia */}
      <div className="px-4 py-2.5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3 shrink-0">
        {/* Input de archivo oculto */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileChange}
          accept=".txt,.csv,.json,.png,.jpg,.jpeg,.webp"
          className="hidden"
        />

        {/* Botón de Adjuntar */}
        <button
          onClick={handleAttachClick}
          disabled={isLoading || isUploading}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 shrink-0 ${
            isUploading
              ? 'animate-pulse border-primary bg-primary/10 text-primary'
              : 'border-stone-200/80 bg-white hover:bg-stone-50 text-stone-600 hover:text-stone-800'
          }`}
          title={attachButtonTitle}
        >
          {!canAttachFiles ? (
            <Lock size={15} className="text-amber-500" />
          ) : (
            <Paperclip size={15} />
          )}
          <span>
            {isUploading
              ? (language === 'fr' ? 'Téléchargement...' : language === 'en' ? 'Uploading...' : 'Subiendo...')
              : (language === 'fr' ? 'Joindre un fichier' : language === 'en' ? 'Attach File' : 'Adjuntar Archivo')
            }
          </span>
        </button>

        {/* Grabadora de Voz */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">
            {language === 'fr' ? 'Préférez-vous parler ?' : language === 'en' ? 'Prefer to speak?' : '¿Prefieres hablar?'}
          </span>
          <VoiceRecorderButton
            onVoiceTranscribed={onVoiceTranscribed}
            disabled={isLoading || isUploading}
            lang={audioLanguage}
            onStartClick={onUnlockAudio}
          />
        </div>
      </div>

      {/* Fila 2: Textarea + Enviar */}
      <div className="p-3 bg-white border-t border-stone-200/80 flex items-center gap-2.5 shrink-0 select-text pb-safe">
        <textarea
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={onKeyDown}
          disabled={isLoading || isUploading}
          rows={2}
          placeholder={language === 'fr' ? 'Écrire un message...' : language === 'en' ? 'Type a message...' : 'Escribe tu mensaje...'}
          className="flex-1 bg-stone-50 border border-stone-200/80 rounded-xl px-3 py-2.5 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-primary transition-all font-medium resize-none min-h-[48px] max-h-32 overflow-y-auto leading-relaxed"
        />

        <button
          onClick={onSend}
          disabled={isLoading || isUploading || (!input.trim() && !attachedFile)}
          className={`flex h-12 w-12 items-center justify-center rounded-xl bg-stone-900 text-white transition-all duration-300 border border-stone-800 shadow-md shrink-0 active:scale-95 ${
            isLoading || isUploading || (!input.trim() && !attachedFile)
              ? 'opacity-40 cursor-not-allowed'
              : 'hover:bg-primary hover:text-stone-900 hover:border-primary'
          }`}
          title={language === 'fr' ? 'Envoyer le message' : language === 'en' ? 'Send Message' : 'Enviar Mensaje'}
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
