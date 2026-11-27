'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCopilotResize } from './useCopilotResize';
import VoiceWaveVisualizer from './VoiceWaveVisualizer';

// Subcomponentes modulares del Concierge
import { useConciergeChat } from './concierge/useConciergeChat';
import ConciergeHeader from './concierge/ConciergeHeader';
import ConciergeMessages from './concierge/ConciergeMessages';
import ConciergeInputBar from './concierge/ConciergeInputBar';
import ConciergeTriggerButton from './concierge/ConciergeTriggerButton';

export default function FrontEndConciergeWidget() {
  const router = useRouter();

  // 1. Detección de Modo Oscuro / Claro del Tema del Tenant
  const [isThemeDark, setIsThemeDark] = useState(false);
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const checkDark = () => {
        const isDark =
          document.documentElement.classList.contains('dark') ||
          document.body.classList.contains('dark');
        setIsThemeDark(isDark);
      };
      checkDark();
      const observer = new MutationObserver(checkDark);
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => observer.disconnect();
    }
  }, []);

  // 2. Detección de iframe / entorno embebido
  const [isEmbedded, setIsEmbedded] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsEmbedded(window.self !== window.top);
    }
  }, []);

  // 3. Redimensionamiento Suave (Reutilización de useCopilotResize)
  const {
    chatWidth,
    chatHeight,
    isResizingActive,
    startResize,
    handleResize,
    stopResize,
  } = useCopilotResize();

  // 4. Hook de Estado y Lógica del Chat
  const {
    isOpen,
    setIsOpen,
    input,
    setInput,
    isLoading,
    isMuted,
    setIsMuted,
    voiceGender,
    isListening,
    multiSelections,
    setMultiSelections,
    messages,
    messagesEndRef,
    language,
    isSpeaking,
    stopSpeaking,
    unlockAudioContext,
    toggleVoiceRecording,
    handleSend,
    handleOptionClick,
    handleKeyDown,
    handleClearHistory,
    handleToggleVoiceGender,
    chips,
  } = useConciergeChat();

  const handleNavigateUrl = (url: string) => {
    setIsOpen(false);
    stopSpeaking();
    router.push(url);
  };

  if (isEmbedded) return null;

  return (
    <>
      {/* Overlay invisible mientras se redimensiona */}
      {isResizingActive && (
        <div
          className="fixed inset-0 z-[99999] cursor-nwse-resize select-none bg-transparent"
          onMouseMove={(e) => handleResize(e.nativeEvent)}
          onMouseUp={stopResize}
        />
      )}

      <div
        className={
          isOpen
            ? 'fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 transition-all duration-300 max-sm:!fixed max-sm:!inset-0 max-sm:!w-full max-sm:!h-full max-sm:!p-0 max-sm:!m-0 font-sans'
            : 'fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3 transition-all duration-300 pointer-events-auto font-sans'
        }
      >
        {/* ── PANEL ABIERTO DEL CONCIERGE ── */}
        {isOpen && (
          <div
            style={{ width: `${chatWidth}px`, height: `${chatHeight}px` }}
            className={`bg-white/95 dark:bg-stone-950/95 backdrop-blur-2xl border border-stone-200/90 dark:border-stone-800/90 rounded-[2rem] shadow-[0_20px_70px_-15px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden relative select-none mr-4 md:mr-0 min-w-[390px] sm:min-w-[420px] max-w-[calc(100vw-32px)] max-h-[calc(100vh-80px)] max-sm:!w-full max-sm:!h-full max-sm:!min-w-0 max-sm:!max-w-none max-sm:!max-h-none max-sm:!mr-0 max-sm:!rounded-none max-sm:!border-none max-sm:!h-[100dvh] ${
              isResizingActive
                ? 'transition-none pointer-events-auto'
                : 'transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6'
            }`}
          >
            {/* Handles de Redimensionamiento (Desktop) */}
            <div
              onMouseDown={startResize}
              className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 group/resize flex items-center justify-center max-sm:hidden touch-none"
              title="Arrastra para redimensionar"
            >
              <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-stone-400/60 group-hover/resize:border-[#d4af37] transition-colors rounded-tl" />
            </div>

            {/* Cabecera del Asistente */}
            <ConciergeHeader
              isThemeDark={isThemeDark}
              isSpeaking={isSpeaking}
              voiceGender={voiceGender}
              onToggleVoiceGender={handleToggleVoiceGender}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              onClearHistory={handleClearHistory}
              onClose={() => {
                setIsOpen(false);
                stopSpeaking();
              }}
            />

            {/* Ecualizador de Ondas de Voz */}
            <VoiceWaveVisualizer
              isSpeaking={isSpeaking}
              onStop={stopSpeaking}
              language={language || 'es'}
            />

            {/* Lista y Burbujas de Mensajes */}
            <ConciergeMessages
              messages={messages}
              isLoading={isLoading}
              isSpeaking={isSpeaking}
              isThemeDark={isThemeDark}
              multiSelections={multiSelections}
              setMultiSelections={setMultiSelections}
              onOptionClick={handleOptionClick}
              onSend={handleSend}
              onNavigateUrl={handleNavigateUrl}
              chips={chips}
              messagesEndRef={messagesEndRef}
            />

            {/* Barra de Entrada de Texto y Micrófono */}
            <ConciergeInputBar
              input={input}
              setInput={setInput}
              isListening={isListening}
              isLoading={isLoading}
              onToggleVoiceRecording={toggleVoiceRecording}
              onSend={() => handleSend()}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}

        {/* ── BURBUJA FLOTANTE CAMALEÓNICA ── */}
        {!isOpen && (
          <ConciergeTriggerButton
            isThemeDark={isThemeDark}
            isSpeaking={isSpeaking}
            onOpen={() => {
              setIsOpen(true);
              unlockAudioContext();
            }}
          />
        )}
      </div>
    </>
  );
}
