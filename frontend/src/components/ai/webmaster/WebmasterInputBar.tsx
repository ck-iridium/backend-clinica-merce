'use client';

import { Send } from 'lucide-react';
import VoiceRecorderButton from '../VoiceRecorderButton';

interface WebmasterInputBarProps {
  input: string;
  onChangeInput: (val: string) => void;
  onSend: (textToSend?: string) => void;
  isLoading: boolean;
  chatLanguage: string;
  placeholder?: string;
}

export default function WebmasterInputBar({
  input,
  onChangeInput,
  onSend,
  isLoading,
  chatLanguage,
  placeholder = 'Pregúntame algo o envíame un comando de voz...',
}: WebmasterInputBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSend();
    }
  };

  return (
    <div className="p-4 bg-white border-t border-stone-200/60 shadow-xs shrink-0">
      <div className="flex items-center gap-2.5 bg-stone-50 hover:bg-stone-50/80 border border-stone-200/80 focus-within:bg-white focus-within:border-[#d4af37] focus-within:ring-2 focus-within:ring-[#d4af37]/15 rounded-2xl p-2 transition-all shadow-xs">
        <VoiceRecorderButton
          disabled={isLoading}
          lang={chatLanguage}
          onVoiceTranscribed={(text) => onSend(`[Voz]: "${text}"`)}
          size="sm"
        />

        <input
          type="text"
          value={input}
          onChange={(e) => onChangeInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none text-[13px] text-stone-800 placeholder-stone-400 focus:outline-none px-2 py-1 leading-relaxed"
        />

        <button
          onClick={() => onSend()}
          disabled={!input.trim() || isLoading}
          className="h-8 w-8 rounded-xl bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:hover:bg-stone-900 active:scale-95 shadow-xs shrink-0"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
