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
    
    // Reset regex lastIndex
    cleanRegex.lastIndex = 0;
    
    let match;
    while ((match = cleanRegex.exec(content)) !== null) {
      options.push({
        label: match[1].trim(),
        value: match[2].trim(),
      });
    }
    
    // Eliminar las etiquetas del texto
    const textWithoutOptions = content.replace(cleanRegex, '').trim();
    
    return { text: textWithoutOptions, options };
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F5] hide-scroll select-text">
      {messages.map((msg, index) => {
        const isAI = msg.role === 'model';
        const { text, options } = isAI ? parseMessage(msg.content) : { text: msg.content, options: [] };

        return (
          <div
            key={index}
            className={`flex gap-3 max-w-[92%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'}`}
          >
            {isAI ? (
              <div className="w-10 h-10 rounded-full bg-stone-900 border border-primary/30 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
                <Bot size={18} className="text-primary" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#d4af37]/20 border border-primary/30 flex items-center justify-center text-stone-900 shrink-0 shadow-sm mt-0.5">
                <User size={18} className="text-stone-900" />
              </div>
            )}

            <div className="flex flex-col gap-1.5 max-w-full">
              <div
                className={`p-3.5 rounded-luxury-card text-xs leading-relaxed shadow-sm transition-all duration-300 whitespace-pre-wrap ${
                  isAI
                    ? 'bg-white text-stone-800 border border-stone-200/50 rounded-tl-none font-medium'
                    : 'bg-stone-900 text-white rounded-tr-none font-bold'
                }`}
              >
                {text}
              </div>

              {isAI && options.length > 0 && (
                <div className="flex flex-col gap-2 mt-1.5 w-full">
                  {options.map((opt, i) => (
                    <button
                      key={i}
                      onClick={() => onSendMessage?.(opt.value)}
                      className="w-full text-left px-4 py-2.5 rounded-2xl border border-[#d4af37]/35 bg-white text-[11.5px] font-semibold text-stone-800 hover:bg-[#d4af37]/5 hover:border-[#d4af37]/65 active:scale-[0.98] transition-all duration-200 flex items-center gap-2.5 shadow-sm"
                    >
                      <span className="w-2 h-2 rounded-full bg-[#d4af37] shrink-0 animate-pulse" />
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Indicador de carga (dots pulsantes) */}
      {isLoading && (
        <div className="flex gap-3 max-w-[92%] self-start animate-pulse">
          <div className="w-10 h-10 rounded-full bg-stone-900 border border-primary/30 flex items-center justify-center text-white shrink-0 shadow-sm mt-0.5">
            <Bot size={18} className="text-primary" />
          </div>
          <div className="p-3 bg-white border border-stone-200/50 rounded-luxury-card rounded-tl-none text-[10px] text-stone-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-100" />
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce delay-200" />
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
