'use client';

import React from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

interface ConciergeInputBarProps {
  input: string;
  setInput: (value: string) => void;
  isListening: boolean;
  isLoading: boolean;
  onToggleVoiceRecording: () => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export default function ConciergeInputBar({
  input,
  setInput,
  isListening,
  isLoading,
  onToggleVoiceRecording,
  onSend,
  onKeyDown,
}: ConciergeInputBarProps) {
  return (
    <div className="p-3 border-t border-stone-100 dark:border-stone-800 bg-white/80 dark:bg-stone-950/80 shrink-0">
      <div className="flex items-end gap-2 bg-stone-100/80 dark:bg-stone-900/80 rounded-2xl p-1.5 border border-stone-200/60 dark:border-stone-800 focus-within:border-[#d4af37] transition-colors">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={
            isListening
              ? 'Escuchando tu voz...'
              : 'Pregunta por un servicio, precio o cita...'
          }
          rows={1}
          className="flex-1 bg-transparent border-none text-xs md:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none resize-none px-2 py-1 max-h-24"
        />

        {/* Botón de Entrada por Voz */}
        <button
          type="button"
          onClick={onToggleVoiceRecording}
          className={`p-2 rounded-xl transition-all duration-300 ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-md'
              : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800'
          }`}
          title={isListening ? 'Detener micrófono' : 'Hablar por micrófono'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Botón Enviar */}
        <button
          type="button"
          onClick={onSend}
          disabled={!input.trim() || isLoading}
          className="p-2 rounded-xl bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#d4af37] dark:hover:bg-[#d4af37] transition-all duration-300 shrink-0 active:scale-95"
          title="Enviar consulta"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
