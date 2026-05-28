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
}

export default function CopilotMessages({ messages, isLoading, messagesEndRef }: CopilotMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F5] hide-scroll select-text">
      {messages.map((msg, index) => {
        const isAI = msg.role === 'model';
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

            <div
              className={`p-3.5 rounded-luxury-card text-xs leading-relaxed shadow-sm transition-all duration-300 whitespace-pre-wrap ${
                isAI
                  ? 'bg-white text-stone-800 border border-stone-200/50 rounded-tl-none font-medium'
                  : 'bg-stone-900 text-white rounded-tr-none font-bold'
              }`}
            >
              {msg.content}
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
