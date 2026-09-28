'use client';

import React, { RefObject } from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface CopilotMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  onSendMessage?: (text: string) => void;
}

export default function CopilotMessages({ messages, isLoading, messagesEndRef, onSendMessage }: CopilotMessagesProps) {
  // Función para parsear texto del mensaje y extraer opciones
  const parseMessage = (content: string) => {
    const options: { label: string; value: string }[] = [];
    const cleanRegex = /\[OPTION:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
    
    cleanRegex.lastIndex = 0;
    
    let match;
    while ((match = cleanRegex.exec(content)) !== null) {
      options.push({
        label: match[1].trim(),
        value: match[2].trim(),
      });
    }
    
    const textWithoutOptions = content.replace(cleanRegex, '').trim();
    
    return { text: textWithoutOptions, options };
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA] hide-scroll select-text">
      {messages.map((msg, index) => {
        const isAI = msg.role === 'model';
        const { text, options } = isAI ? parseMessage(msg.content) : { text: msg.content, options: [] };

        return (
          <div
            key={index}
            className={`flex gap-2.5 max-w-[88%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'} animate-in fade-in duration-200`}
          >
            {isAI ? (
              <div className="w-8 h-8 rounded-xl bg-white border border-amber-300/40 flex items-center justify-center text-[#d4af37] shrink-0 shadow-xs mt-0.5">
                <Bot size={16} />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5">
                <User size={15} />
              </div>
            )}

            <div className="flex flex-col gap-1.5 max-w-full">
              <div
                className={`p-3.5 text-[12.5px] leading-relaxed shadow-xs transition-all duration-300 whitespace-pre-wrap ${
                  isAI
                    ? 'bg-white text-stone-800 border border-stone-200/70 rounded-2xl rounded-tl-xs font-normal'
                    : 'bg-stone-900 text-white rounded-2xl rounded-tr-xs font-normal'
                }`}
              >
                {text}
              </div>

              {isAI && options.length > 0 && (
                <div className="flex flex-col gap-1.5 mt-1 w-full">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage?.(opt.value)}
                      className="w-full text-left px-3.5 py-2 rounded-xl border border-stone-200/80 bg-white text-[11.5px] font-medium text-stone-700 hover:border-[#d4af37] hover:bg-amber-50/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 shadow-xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] shrink-0 animate-pulse" />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Indicador de carga */}
      {isLoading && (
        <div className="flex gap-2.5 max-w-[88%] self-start animate-in fade-in duration-200">
          <div className="w-8 h-8 rounded-xl bg-white border border-amber-300/40 flex items-center justify-center text-[#d4af37] shrink-0 shadow-xs mt-0.5">
            <Bot size={16} />
          </div>
          <div className="px-3.5 py-2.5 bg-white border border-stone-200/70 rounded-2xl rounded-tl-xs text-[10px] text-stone-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-bounce" style={{ animationDelay: '300ms' }} />
            <span className="ml-1 text-[11px] text-stone-400 font-normal normal-case">Escribiendo...</span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
