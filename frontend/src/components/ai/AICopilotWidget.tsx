'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { useAuthRole } from '@/hooks/useAuthRole';

// Subcomponentes y hooks modulares
import CopilotHeader from './CopilotHeader';
import CopilotMessages from './CopilotMessages';
import CopilotInputBar from './CopilotInputBar';
import CopilotTriggerButton from './CopilotTriggerButton';
import VoiceWaveVisualizer from './VoiceWaveVisualizer';
import MediaPickerModal from '@/components/MediaPickerModal';

import { useCopilotResize } from './useCopilotResize';
import { useCopilotLimits } from './useCopilotLimits';
import { useCopilotSpeech } from './useCopilotSpeech';
import { useCopilotFiles } from './useCopilotFiles';
import { useCopilotMediaPicker } from './useCopilotMediaPicker';
import { useCopilotChat } from './useCopilotChat';

export default function AICopilotWidget() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { language } = useLanguage();
  const { role, userName: authUserName, userAvatar, loading: loadingRole } = useAuthRole();
  const firstName = authUserName ? authUserName.trim().split(' ')[0] : '';
  const audioLanguage = language === 'fr' ? 'fr-FR' : language === 'en' ? 'en-US' : 'es-ES';

  useEffect(() => {
    setMounted(true);
  }, []);

  // 1. Redimensionamiento y Límites de Suscripción
  const { chatWidth, chatHeight, isResizingActive, startResize, handleResize, stopResize } =
    useCopilotResize();

  const {
    planType,
    trialRemaining,
    setTrialRemaining,
    hasOwnKey,
    isTrialExhausted,
    setIsTrialExhausted,
    dailyActionsUsed,
    dailyActionsLimit,
    updateLimitsAfterResponse,
  } = useCopilotLimits();

  // 2. Archivos y Media Picker
  const {
    attachedFile,
    setAttachedFile,
    isUploading,
    fileInputRef,
    handleFileChange,
    handlePaste,
    canAttachFiles,
  } = useCopilotFiles({ language, planType, hasOwnKey });

  const { showMediaPicker, setShowMediaPicker, handleMediaSelected, tenantId, authToken } =
    useCopilotMediaPicker({ language, setAttachedFile });

  // 3. Conversación, Síntesis de Voz y Estado de Chat
  const {
    isOpen,
    setIsOpen,
    input,
    setInput,
    isLoading,
    isMuted: chatMuted,
    setIsMuted: setChatMuted,
    voiceGender,
    messages,
    messagesEndRef,
    handleToggleVoiceGender,
    handleClearHistory,
    handleSend,
    handleKeyDown,
  } = useCopilotChat({
    language,
    firstName,
    role: role || '',
    stopSpeaking: () => stopSpeaking(),
    unlockAudioContext: () => unlockAudioContext(),
    speakText: (txt, audioBase64) => speakText(txt, audioBase64),
    attachedFile,
    setAttachedFile,
    isUploading,
    setIsTrialExhausted,
    setTrialRemaining,
    updateLimitsAfterResponse,
  });

  const { speakText, stopSpeaking, unlockAudioContext, isSpeaking } = useCopilotSpeech({
    isMuted: chatMuted,
    voiceGender,
    audioLanguage,
  });

  // 4. Verificación de Roles y Rutas Permitidas
  const localFallbackRole =
    typeof window !== 'undefined'
      ? (() => {
          try {
            const u = localStorage.getItem('user');
            return u ? JSON.parse(u).role : null;
          } catch {
            return null;
          }
        })()
      : null;

  const effectiveRole = (role || localFallbackRole || 'admin')?.toLowerCase();
  const isAuthorized = effectiveRole
    ? ['admin', 'administrador', 'recepcion', 'recepción', 'especialista', 'owner', 'titular'].includes(
        effectiveRole
      )
    : false;

  // Ocultar si no está montado o no está autorizado
  if (
    !mounted ||
    (loadingRole && !role && !localFallbackRole) ||
    !isAuthorized
  ) {
    return null;
  }

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
            ? 'fixed bottom-6 right-6 z-30 flex flex-col items-end gap-3 font-sans transition-all duration-300 max-sm:!fixed max-sm:!inset-0 max-sm:!w-full max-sm:!h-full max-sm:!p-0 max-sm:!m-0 max-sm:!z-[100000]'
            : 'fixed bottom-[96px] md:bottom-6 right-4 md:right-6 z-30 flex flex-col items-end gap-3 font-sans transition-all duration-300 pointer-events-auto'
        }
      >
        {/* PANEL ABIERTO */}
        {isOpen && (
          <div
            style={{ width: `${chatWidth}px`, height: `${chatHeight}px` }}
            onPaste={handlePaste}
            className={`bg-white/95 backdrop-blur-xl border border-stone-200/80 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] flex flex-col overflow-hidden relative select-none mr-4 md:mr-0 max-w-[calc(100vw-32px)] max-h-[calc(100vh-80px)] max-sm:!w-full max-sm:!h-full max-sm:!max-w-none max-sm:!max-h-none max-sm:!mr-0 max-sm:!rounded-none max-sm:!border-none max-sm:!h-[100dvh] ${
              isResizingActive
                ? 'transition-none pointer-events-auto'
                : 'transition-all duration-300 ease-out animate-in fade-in slide-in-from-bottom-6'
            }`}
          >
            {/* Handles de Redimensionamiento */}
            <div
              onMouseDown={startResize}
              className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize z-50 group/resize flex items-center justify-center max-sm:hidden touch-none"
              title="Arrastra para redimensionar"
            >
              <div className="w-2.5 h-2.5 border-l-2 border-t-2 border-stone-400/60 group-hover/resize:border-[#FF6B00] transition-colors rounded-tl" />
            </div>
            <div
              onMouseDown={startResize}
              className="absolute top-0 left-0 bottom-0 w-2 cursor-ew-resize z-40 hover:bg-[#FF6B00]/20 transition-colors max-sm:hidden touch-none"
              title="Arrastra para cambiar ancho"
            />
            <div
              onMouseDown={startResize}
              className="absolute top-0 left-0 right-0 h-2 cursor-ns-resize z-40 hover:bg-[#FF6B00]/20 transition-colors max-sm:hidden touch-none"
              title="Arrastra para cambiar alto"
            />

            {/* Cabecera */}
            <CopilotHeader
              language={language}
              planType={planType}
              hasOwnKey={hasOwnKey}
              trialRemaining={trialRemaining}
              dailyActionsUsed={dailyActionsUsed}
              dailyActionsLimit={dailyActionsLimit}
              voiceGender={voiceGender}
              onToggleVoiceGender={handleToggleVoiceGender}
              isMuted={chatMuted}
              onToggleMute={() => setChatMuted(!chatMuted)}
              onClearHistory={handleClearHistory}
              onClose={() => {
                setIsOpen(false);
                stopSpeaking();
              }}
              isTrialExhausted={isTrialExhausted}
              onUpgrade={() => {
                setIsOpen(false);
                stopSpeaking();
                router.push('/dashboard/settings?tab=billing');
              }}
            />

            {/* Visualizador de Ondas de Voz */}
            <VoiceWaveVisualizer isSpeaking={isSpeaking} onStop={stopSpeaking} language={language} />

            {/* Historial de Mensajes */}
            <CopilotMessages
              messages={messages}
              isLoading={isLoading}
              messagesEndRef={messagesEndRef}
              onSendMessage={handleSend}
              userAvatarUrl={userAvatar}
              userName={authUserName}
            />

            {/* Barra de Entrada */}
            <CopilotInputBar
              input={input}
              onInputChange={setInput}
              onSend={handleSend}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              isLoading={isLoading}
              isUploading={isUploading}
              attachedFile={attachedFile}
              onRemoveFile={() => setAttachedFile(null)}
              onAttachClick={() => {
                if (canAttachFiles) {
                  setShowMediaPicker(true);
                } else {
                  toast.error(
                    language === 'fr'
                      ? 'La pièce jointe est réservée aux plans Pro/Gold.'
                      : language === 'en'
                      ? 'Attaching files is restricted to Pro/Gold plans.'
                      : 'La función de adjuntar archivos está restringida a los planes Pro y Gold.'
                  );
                }
              }}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
              canAttachFiles={canAttachFiles}
              planType={planType}
              hasOwnKey={hasOwnKey}
              language={language}
              audioLanguage={audioLanguage}
              onVoiceTranscribed={(txt) =>
                handleSend(
                  language === 'fr'
                    ? `[Voix]: "${txt}"`
                    : language === 'en'
                    ? `[Voice]: "${txt}"`
                    : `[Voz]: "${txt}"`
                )
              }
              onUnlockAudio={unlockAudioContext}
            />
          </div>
        )}

        {/* BURBUJA FLOTANTE */}
        {!isOpen && (
          <CopilotTriggerButton
            onClick={() => {
              setIsOpen(true);
              unlockAudioContext();
            }}
            isSpeaking={isSpeaking}
          />
        )}

        {/* Modal de Selección Multimedia */}
        {showMediaPicker && (
          <MediaPickerModal
            onClose={() => setShowMediaPicker(false)}
            onImageSelected={handleMediaSelected}
            mediaType="all"
            tenantId={tenantId}
            token={authToken}
          />
        )}
      </div>
    </>
  );
}
