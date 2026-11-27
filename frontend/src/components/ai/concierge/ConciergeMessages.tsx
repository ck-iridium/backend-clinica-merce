'use client';

import React from 'react';
import { Sparkles, Calendar, Clock, MapPin, ArrowRight, Phone, MessageCircle, ExternalLink } from 'lucide-react';
import ChromaticOrb from '../ChromaticOrb';
import ConciergeOptionGroups from './ConciergeOptionGroups';
import { ConciergeMessage, ConciergeOptionItem, ConciergeChip } from './types';

interface ConciergeMessagesProps {
  messages: ConciergeMessage[];
  isLoading: boolean;
  isSpeaking: boolean;
  isThemeDark: boolean;
  multiSelections: Record<number, Record<string, string>>;
  setMultiSelections: React.Dispatch<React.SetStateAction<Record<number, Record<string, string>>>>;
  onOptionClick: (opt: ConciergeOptionItem) => void;
  onSend: (text: string) => void;
  onNavigateUrl: (url: string) => void;
  chips: ConciergeChip[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function ConciergeMessages({
  messages,
  isLoading,
  isSpeaking,
  isThemeDark,
  multiSelections,
  setMultiSelections,
  onOptionClick,
  onSend,
  onNavigateUrl,
  chips,
  messagesEndRef,
}: ConciergeMessagesProps) {
  const renderMessageContent = (text: string) => {
    if (!text) return null;

    const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+|tel:[^\s)]+|\/[^\s)]+)\)/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;

    let parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    let match;

    while ((match = markdownLinkRegex.exec(text)) !== null) {
      const matchIndex = match.index;
      if (matchIndex > lastIndex) {
        parts.push(text.substring(lastIndex, matchIndex));
      }

      const label = match[1];
      const href = match[2];
      const isInternal = href.startsWith('/');
      const isPhone = href.startsWith('tel:');

      parts.push(
        <a
          key={`md-link-${matchIndex}`}
          href={href}
          onClick={(e) => {
            if (isInternal) {
              e.preventDefault();
              onNavigateUrl(href);
            }
          }}
          target={isInternal || isPhone ? undefined : '_blank'}
          rel={isInternal || isPhone ? undefined : 'noopener noreferrer'}
          className="inline-flex items-center gap-1 font-semibold text-[#b08e23] dark:text-[#d4af37] underline underline-offset-2 hover:opacity-80 transition-opacity"
        >
          {isPhone && <Phone className="w-3 h-3 inline-block shrink-0" />}
          {href.includes('wa.me') && <MessageCircle className="w-3 h-3 inline-block shrink-0" />}
          <span>{label}</span>
          {!isInternal && !isPhone && <ExternalLink className="w-2.5 h-2.5 inline-block shrink-0" />}
        </a>
      );
      lastIndex = matchIndex + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    const finalElements: (string | React.ReactNode)[] = [];
    parts.forEach((part, pIdx) => {
      if (typeof part !== 'string') {
        finalElements.push(part);
        return;
      }

      const subParts = part.split(urlRegex);
      subParts.forEach((sp, spIdx) => {
        if (sp.match(urlRegex)) {
          finalElements.push(
            <a
              key={`raw-url-${pIdx}-${spIdx}`}
              href={sp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-[#b08e23] dark:text-[#d4af37] underline underline-offset-2 hover:opacity-80 transition-opacity"
            >
              {sp.includes('wa.me') && <MessageCircle className="w-3 h-3 inline-block shrink-0" />}
              <span>{sp}</span>
              <ExternalLink className="w-2.5 h-2.5 inline-block shrink-0" />
            </a>
          );
        } else {
          finalElements.push(sp);
        }
      });
    });

    return <p className="whitespace-pre-wrap">{finalElements}</p>;
  };

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-4 select-text">
      {messages.map((msg, index) => {
        const isModel = msg.role === 'model';
        return (
          <div
            key={index}
            className={`flex flex-col ${isModel ? 'items-start' : 'items-end'} animate-in fade-in duration-300`}
          >
            <div className={`flex items-end gap-2 ${msg.action ? 'w-full max-w-[96%]' : 'max-w-[88%]'}`}>
              {isModel && (
                <div className="mb-1 shrink-0">
                  <ChromaticOrb 
                    size="sm" 
                    isSpeaking={isSpeaking && index === messages.length - 1} 
                    theme={isThemeDark ? 'dark' : 'light'} 
                  />
                </div>
              )}
              <div
                className={`p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm w-full ${
                  isModel
                    ? 'bg-stone-100 dark:bg-stone-900 text-stone-800 dark:text-stone-200 rounded-bl-sm border border-stone-200/60 dark:border-stone-800'
                    : 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 rounded-br-sm'
                }`}
              >
                {renderMessageContent(msg.content)}

                {/* Opciones Interactivas Clicables */}
                <ConciergeOptionGroups
                  action={msg.action}
                  msgIndex={index}
                  multiSelections={multiSelections}
                  setMultiSelections={setMultiSelections}
                  onOptionClick={onOptionClick}
                  onSend={onSend}
                />

                {/* Tarjeta Interactiva de Cita Sugerida / Acción */}
                {msg.action && msg.action.type === 'booking' && (
                  <div className="mt-3 p-3 rounded-xl bg-white dark:bg-stone-950 border border-[#d4af37]/40 shadow-md flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#b08e23] dark:text-[#d4af37]">
                      <Sparkles className="w-3.5 h-3.5 shrink-0" />
                      <span>Hueco disponible seleccionado</span>
                    </div>

                    {msg.action.service_name && (
                      <p className="font-serif text-sm font-bold text-stone-900 dark:text-stone-100">
                        {msg.action.service_name}
                      </p>
                    )}

                    {(msg.action.date || msg.action.time || msg.action.location_name) && (
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-stone-500 dark:text-stone-400">
                        {msg.action.location_name && (
                          <span className="flex items-center gap-1 font-medium text-stone-700 dark:text-stone-300">
                            <MapPin className="w-3 h-3 text-[#d4af37] shrink-0" />
                            {msg.action.location_name}
                          </span>
                        )}
                        {msg.action.date && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#d4af37] shrink-0" />
                            {msg.action.date}
                          </span>
                        )}
                        {msg.action.time && (
                          <span className="flex items-center gap-1 font-bold text-stone-700 dark:text-stone-200">
                            <Clock className="w-3 h-3 text-[#d4af37] shrink-0" />
                            {msg.action.time}
                          </span>
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => onNavigateUrl(msg.action?.url || '/reservar')}
                      className="mt-1.5 w-full bg-[#d4af37] hover:bg-[#bfa030] text-stone-950 font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-sm hover:shadow-md active:scale-95"
                    >
                      <span>Reservar Cita Ahora</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {isLoading && (
        <div className="flex items-center gap-2 text-stone-400 text-xs italic pl-10 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
          <span>El asistente está consultando la información...</span>
        </div>
      )}

      {/* Sugerencias Rápidas Iniciales (Chips sin emojis estilo Quiet Luxury) */}
      {messages.length === 1 && !isLoading && (
        <div className="pt-2 pl-10 pr-2">
          <p className="text-[11px] font-medium text-stone-400 mb-2">Preguntas frecuentes:</p>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSend(chip.query)}
                className="text-xs px-3.5 py-1.5 rounded-full bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-800 hover:border-[#d4af37] dark:hover:border-[#d4af37] transition-all shadow-xs font-medium text-left"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
