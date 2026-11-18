'use client';

import { RefObject } from 'react';
import { User, Sparkles, Compass, AlertTriangle, Trash2, Check } from 'lucide-react';
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
  loadingText = 'Director Creativo analizando diseño en tiempo real...',
}: WebmasterMessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-200">
      {messages.map((msg, i) => {
        const isUser = msg.role === 'user';
        const { clean, options } = parseOptionsAndText(msg.content);

        return (
          <div
            key={i}
            className={`flex gap-3.5 max-w-[88%] ${
              isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
            } animate-in fade-in slide-in-from-bottom-3 duration-400 ease-out`}
          >
            {/* Avatar Exclusivo */}
            <div
              className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-xl shadow-xs border transition-all duration-300 overflow-hidden ${
                isUser
                  ? 'bg-gradient-to-br from-stone-900 to-stone-950 border-stone-800 text-stone-200'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100/80 border-amber-300/60 text-[#d4af37]'
              }`}
            >
              {isUser ? (
                userAvatar ? (
                  <img src={userAvatar} alt="Usuario" className="w-full h-full object-cover" />
                ) : (
                  <User size={13} />
                )
              ) : (
                <Sparkles size={14} className="text-[#d4af37]" />
              )}
            </div>

            {/* Contenedor del Mensaje */}
            <div className="flex flex-col gap-2 max-w-full">
              {/* Tarjeta de Mensaje */}
              <div
                className={`relative px-5 py-4 rounded-3xl text-[13.5px] leading-relaxed shadow-sm font-sans transition-all duration-300 ${
                  isUser
                    ? 'bg-gradient-to-br from-stone-900 via-stone-900 to-stone-950 text-white rounded-tr-xs border border-stone-800 ring-1 ring-white/10'
                    : 'bg-white/95 backdrop-blur-xl border border-amber-200/50 text-stone-800 rounded-tl-xs shadow-[0_4px_25px_-5px_rgba(212,175,55,0.12)]'
                }`}
              >
                {/* Cabecera distintiva del Director Creativo */}
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-amber-100/60 text-[10px] font-bold uppercase tracking-widest text-[#b38f2b]">
                    <span className="flex h-1.5 w-1.5 rounded-full bg-[#d4af37] animate-pulse" />
                    <span>Director Creativo · Asesoría de Diseño</span>
                  </div>
                )}

                <div className="whitespace-pre-line leading-relaxed">
                  {clean}
                </div>
              </div>

              {/* Pastillas Interactivas o Recuadro de Confirmación de Color */}
              {!isUser && options.length > 0 && (() => {
                const isConfirmation = options.some(opt => 
                  /eliminar|borrar|suprimir|delete/i.test(opt.label) || 
                  /eliminar|borrar|suprimir|delete/i.test(opt.value)
                );

                if (isConfirmation) {
                  return (
                    <div className="mt-2 p-4 rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 text-stone-900 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                      <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                        <AlertTriangle size={15} className="text-amber-600 animate-pulse" />
                        <span>Confirmación de Seguridad Requerida</span>
                      </div>
                      <p className="text-xs text-stone-600 mb-3 font-medium">
                        Esta acción afectará la estructura de tu web. Selecciona una opción para continuar:
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        {options.map((opt, optIdx) => {
                          const isDestructive = /eliminar|borrar|suprimir|delete/i.test(opt.label) || /eliminar|borrar|suprimir|delete/i.test(opt.value);
                          return (
                            <button
                              key={optIdx}
                              onClick={() => onSelectOption(opt.value)}
                              disabled={isLoading}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-xs active:scale-95 disabled:opacity-40 ${
                                isDestructive
                                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
                                  : 'bg-white hover:bg-stone-100 text-stone-700 border border-stone-300'
                              }`}
                            >
                              {isDestructive ? <Trash2 size={13} /> : <Check size={13} />}
                              <span>{opt.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="flex flex-wrap gap-2 mt-0.5 pt-1 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {options.map((opt, optIdx) => (
                      <button
                        key={optIdx}
                        onClick={() => onSelectOption(opt.value)}
                        disabled={isLoading}
                        className="group relative overflow-hidden px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100/60 text-stone-800 hover:text-stone-950 border border-amber-300/80 hover:border-[#d4af37] shadow-2xs hover:shadow-[0_4px_16px_rgba(212,175,55,0.2)] transition-all duration-200 active:scale-95 text-left flex items-center gap-2 disabled:opacity-40"
                      >
                        {/* Micro-destello de cristal al hover */}
                        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] group-hover:scale-125 transition-transform" />
                        <span className="font-medium tracking-tight">{opt.label}</span>
                        <Sparkles size={11} className="text-[#d4af37] opacity-60 group-hover:opacity-100 transition-opacity ml-auto" />
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        );
      })}

      {/* Indicador de Análisis y Generación en Tiempo Real */}
      {isLoading && (
        <div className="flex gap-3.5 max-w-[88%] mr-auto animate-in fade-in duration-300">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white border border-[#d4af37]/40 text-[#d4af37] shadow-xs">
            <Compass size={14} className="animate-spin text-[#d4af37]" />
          </div>
          <div className="px-5 py-3.5 rounded-3xl rounded-tl-xs bg-white/95 backdrop-blur-xl border border-amber-200/50 text-stone-500 text-[13px] flex items-center gap-2.5 shadow-sm">
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
            <span className="text-[12px] font-medium text-stone-500 font-sans tracking-wide">
              {loadingText}
            </span>
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
