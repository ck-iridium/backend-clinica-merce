'use client';

import React, { useState, RefObject } from 'react';
import { Bot, User, ZoomIn, ExternalLink, X, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface CopilotMessagesProps {
  messages: Message[];
  isLoading: boolean;
  messagesEndRef: RefObject<HTMLDivElement>;
  onSendMessage?: (text: string) => void;
  userAvatarUrl?: string | null;
  userName?: string | null;
}

interface ParsedMessageResult {
  text: string;
  options: { label: string; value: string }[];
  attachedImage: {
    name: string;
    url: string;
  } | null;
}

export default function CopilotMessages({
  messages,
  isLoading,
  messagesEndRef,
  onSendMessage,
  userAvatarUrl,
  userName,
}: CopilotMessagesProps) {
  const [zoomImageUrl, setZoomImageUrl] = useState<string | null>(null);
  const [zoomImageName, setZoomImageName] = useState<string>('');

  // Función para parsear texto del mensaje, extraer opciones y detectar imágenes adjuntas
  const parseMessage = (content: string): ParsedMessageResult => {
    let rawContent = content || '';
    let attachedImage: { name: string; url: string } | null = null;

    // 1. Detectar imagen adjunta con formato institucional
    const fullImgRegex = /\[(?:Imagen adjunta|Image jointe|Attached image):\s*"([^"]+)"\]\s*(?:\r?\n)?\s*URL de la imagen:\s*(https?:\/\/[^\s\n\)]+)/i;
    const fullMatch = rawContent.match(fullImgRegex);

    if (fullMatch) {
      attachedImage = {
        name: fullMatch[1].trim(),
        url: fullMatch[2].trim(),
      };
      rawContent = rawContent.replace(fullImgRegex, '').trim();
    } else {
      // Fallback: detectar cualquier línea con "URL de la imagen: https://..."
      const fallbackUrlRegex = /URL de la imagen:\s*(https?:\/\/[^\s\n\)]+)/i;
      const fallbackMatch = rawContent.match(fallbackUrlRegex);
      if (fallbackMatch) {
        attachedImage = {
          name: 'Captura adjunta',
          url: fallbackMatch[1].trim(),
        };
        rawContent = rawContent.replace(fallbackUrlRegex, '').trim();
        rawContent = rawContent.replace(/\[(?:Imagen adjunta|Image jointe|Attached image):[^\]]+\]/gi, '').trim();
      }
    }

    // 2. Extraer opciones interactivas de botones [OPTION: Label | Value]
    const options: { label: string; value: string }[] = [];
    const optionRegex = /\[OPTION:\s*([^|\]]+)\s*\|\s*([^\]]+)\]/g;
    let match;
    while ((match = optionRegex.exec(rawContent)) !== null) {
      options.push({
        label: match[1].trim(),
        value: match[2].trim(),
      });
    }

    const cleanText = rawContent.replace(optionRegex, '').trim();

    return {
      text: cleanText,
      options,
      attachedImage,
    };
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAFAFA] hide-scroll select-text">
        {messages.map((msg, index) => {
          const isAI = msg.role === 'model';
          const { text, options, attachedImage } = parseMessage(msg.content);

          return (
            <div
              key={index}
              className={`flex gap-2.5 max-w-[88%] ${isAI ? 'self-start' : 'self-end ml-auto flex-row-reverse'} animate-in fade-in duration-200`}
            >
              {isAI ? (
                /* Bot Avatar: Orbe de Inteligencia de Lujo */
                <div
                  className="w-10 h-10 rounded-full bg-gradient-to-tr from-stone-950 via-stone-900 to-[#1c1917] border border-[#d4af37]/60 flex items-center justify-center shrink-0 shadow-[0_2px_12px_rgba(212,175,55,0.25)] relative overflow-hidden mt-0.5 group"
                  title="Co-Piloto AI"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.3)_0%,transparent_70%)] opacity-80" />
                  <Sparkles size={17} className="text-[#d4af37] relative z-10 drop-shadow-[0_0_6px_rgba(212,175,55,0.7)] group-hover:scale-110 transition-transform duration-300" strokeWidth={1.9} />
                </div>
              ) : (
                /* User Avatar: Círculo de 40px con foto real del perfil o iniciales de lujo */
                <div
                  className="w-10 h-10 rounded-full border border-stone-200/90 shadow-sm shrink-0 mt-0.5 overflow-hidden ring-2 ring-stone-900/5 bg-stone-900 flex items-center justify-center relative select-none"
                  title={userName || 'Tú'}
                >
                  {userAvatarUrl ? (
                    <img
                      src={userAvatarUrl}
                      alt={userName || 'Avatar'}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : userName ? (
                    <span className="text-[12px] font-serif font-medium text-amber-200/90 tracking-wider">
                      {userName
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase())
                        .join('')}
                    </span>
                  ) : (
                    <User size={17} className="text-stone-300" />
                  )}
                </div>
              )}

              <div className="flex flex-col gap-1.5 max-w-full">
                <div
                  className={`p-3.5 text-[12.5px] leading-relaxed shadow-xs transition-all duration-300 ${
                    isAI
                      ? 'bg-white text-stone-800 border border-stone-200/70 rounded-2xl rounded-tl-xs font-normal'
                      : 'bg-stone-900 text-white rounded-2xl rounded-tr-xs font-normal'
                  }`}
                >
                  {/* Miniatura visual de la imagen adjunta */}
                  {attachedImage && (
                    <div className="mb-2">
                      <div className="relative group/img overflow-hidden rounded-xl border border-white/15 bg-black/20 shadow-sm max-w-[260px] sm:max-w-[290px]">
                        <img
                          src={attachedImage.url}
                          alt={attachedImage.name}
                          onClick={() => {
                            setZoomImageUrl(attachedImage.url);
                            setZoomImageName(attachedImage.name);
                          }}
                          className="w-full max-h-52 object-cover sm:object-contain rounded-xl cursor-zoom-in hover:scale-[1.03] transition-transform duration-300 bg-stone-900/50"
                        />
                        <div
                          onClick={() => {
                            setZoomImageUrl(attachedImage.url);
                            setZoomImageName(attachedImage.name);
                          }}
                          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-2 cursor-zoom-in"
                        >
                          <span className="text-[10px] text-white/95 font-medium truncate flex items-center gap-1.5">
                            <ZoomIn size={12} className="text-[#d4af37]" />
                            <span className="truncate max-w-[170px]">{attachedImage.name}</span>
                          </span>
                          <span className="text-[9px] text-stone-300 bg-black/50 px-1.5 py-0.5 rounded-md">
                            Ampliar
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Texto limpio del mensaje */}
                  {text && <div className="whitespace-pre-wrap">{text}</div>}
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

      {/* Visor Lightbox Modal para ampliar capturas de pantalla */}
      {zoomImageUrl && (
        <div
          onClick={() => setZoomImageUrl(null)}
          className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 border border-stone-700/70 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Barra superior del visor */}
            <div className="flex items-center justify-between px-4 py-3 bg-stone-950/80 border-b border-stone-800 text-stone-200">
              <span className="text-xs font-medium truncate max-w-md text-stone-300">
                {zoomImageName || 'Vista previa de captura'}
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={zoomImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  title="Abrir en pestaña nueva"
                >
                  <ExternalLink size={16} />
                </a>
                <button
                  type="button"
                  onClick={() => setZoomImageUrl(null)}
                  className="p-1.5 rounded-xl hover:bg-stone-800 text-stone-300 hover:text-white transition-colors"
                  title="Cerrar vista previa"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Imagen ampliada */}
            <div className="p-2 flex items-center justify-center overflow-auto max-h-[calc(90vh-60px)]">
              <img
                src={zoomImageUrl}
                alt={zoomImageName || 'Captura'}
                className="max-w-full max-h-[80vh] object-contain rounded-2xl"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
