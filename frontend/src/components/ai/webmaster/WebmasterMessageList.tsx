'use client';

import { RefObject } from 'react';
import { User, Bot, Sparkles } from 'lucide-react';
import { Message, parseOptionsAndText } from './webmasterConfig';

interface WebmasterMessageListProps {
  messages: Message[];
  isLoading: boolean;
  userAvatar: string | null;
  onSelectOption: (value: string) => void;
  messagesEndRef: RefObject<HTMLDivElement>;
  loadingText?: string;
}

export default function WebmasterMessageList({
  messages,
  isLoading,
  userAvatar,
  onSelectOption,
  messagesEndRef,
  loadingText = 'Procesando...',
}: WebmasterMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-200">
      {messages.map((msg, i) => {
        const isUser = msg.role === 'user';
        const { clean, options } = parseOptionsAndText(msg.content);

        return (
          <div
            key={i}
            className={`flex gap-3.5 max-w-[85%] ${
              isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
            } animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            {/* Avatar */}
            <div
              className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg shadow-sm border transition-all duration-300 overflow-hidden ${
                isUser
                  ? 'bg-stone-900 border-stone-850 text-white'
                  : 'bg-white border-[#d4af37]/30 text-[#d4af37]'
              }`}
            >
              {isUser ? (
                userAvatar ? (
                  <img src={userAvatar} alt="Usuario" className="w-full h-full object-cover" />
                ) : (
                  <User size={13} />
                )
              ) : (
                <Bot size={13} />
              )}
            </div>

            {/* Contenido del Mensaje y Opciones */}
            <div className="flex flex-col gap-1.5">
              <div
                className={`px-5 py-3.5 rounded-2xl text-[13.5px] leading-relaxed shadow-sm font-sans whitespace-pre-line transition-all duration-300 ${
                  isUser
                    ? 'bg-stone-900 text-white rounded-tr-none'
                    : 'bg-white border border-stone-200/50 text-stone-800 rounded-tl-none'
                }`}
              >
                {clean}
              </div>

              {/* Botones de Opciones Rápidas 1-Clic */}
              {!isUser && options.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1 pt-1 animate-in fade-in slide-in-from-bottom-1 duration-300">
                  {options.map((opt, optIdx) => (
                    <button
                      key={optIdx}
                      onClick={() => onSelectOption(opt.value)}
                      disabled={isLoading}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-amber-50 hover:bg-[#d4af37] text-amber-900 hover:text-stone-950 border border-amber-300/70 transition-all duration-200 shadow-2xs active:scale-95 text-left flex items-center gap-1.5"
                    >
                      <Sparkles size={12} className="text-[#d4af37] shrink-0" />
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Indicador de Carga / Generación */}
      {isLoading && (
        <div className="flex gap-3.5 max-w-[85%] mr-auto animate-in fade-in duration-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white border border-[#d4af37]/30 text-[#d4af37] shadow-sm">
            <Bot size={13} className="animate-spin text-[#d4af37]" />
          </div>
          <div className="px-5 py-3.5 rounded-2xl rounded-tl-none bg-white border border-stone-200/50 text-stone-400 text-[13px] italic flex items-center gap-2 shadow-sm">
            <span
              className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce"
              style={{ animationDelay: '0ms' }}
            />
            <span
              className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce"
              style={{ animationDelay: '150ms' }}
            />
            <span
              className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-bounce"
              style={{ animationDelay: '300ms' }}
            />
            <span className="ml-1 text-[12.5px] font-medium text-stone-400">
              {loadingText}
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
