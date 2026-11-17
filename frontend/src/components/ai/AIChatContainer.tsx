'use client';

import FeedbackModal from '../FeedbackModal';
import { useWebmasterChat } from './webmaster/useWebmasterChat';
import WebmasterHeader from './webmaster/WebmasterHeader';
import WebmasterMessageList from './webmaster/WebmasterMessageList';
import WebmasterCommandGrid from './webmaster/WebmasterCommandGrid';
import WebmasterInputBar from './webmaster/WebmasterInputBar';

interface AIChatContainerProps {
  onFieldsUpdated?: (fields: string[], redirectUrl?: string) => void;
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
  activePageSlug?: string;
  activePageTitle?: string;
}

export default function AIChatContainer({
  onFieldsUpdated,
  initialPrompt,
  onPromptConsumed,
  activePageSlug,
  activePageTitle,
}: AIChatContainerProps) {
  const {
    messages,
    input,
    setInput,
    isLoading,
    isMuted,
    voiceGender,
    toggleVoiceGender,
    toggleMute,
    userAvatar,
    confirmModal,
    setConfirmModal,
    messagesEndRef,
    chatLanguage,
    language,
    t,
    handleSend,
    handleResetChat,
    handleConfirmDelete,
  } = useWebmasterChat({ onFieldsUpdated, initialPrompt, onPromptConsumed });

  return (
    <div className="flex flex-col h-full bg-[#FAFAFA] border-r border-stone-200/80">
      {/* Cabecera Quiet Luxury y Controles */}
      <WebmasterHeader
        voiceGender={voiceGender}
        onToggleVoiceGender={toggleVoiceGender}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        onResetChat={handleResetChat}
        language={language}
      />

      {/* Historial de Mensajes y Opciones Interactivas 1-Clic */}
      <WebmasterMessageList
        messages={messages}
        isLoading={isLoading}
        userAvatar={userAvatar}
        onSelectOption={handleSend}
        messagesEndRef={messagesEndRef}
        loadingText={t('general.loading') || 'Procesando...'}
      />

      {/* Botonera de Comandos de Diseño 2026 (2 Filas Glossy Glass) */}
      <WebmasterCommandGrid
        onExecuteCommand={handleSend}
        disabled={isLoading}
        activePageSlug={activePageSlug}
        activePageTitle={activePageTitle}
      />

      {/* Barra de Entrada y Grabador de Voz */}
      <WebmasterInputBar
        input={input}
        onChangeInput={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        chatLanguage={chatLanguage}
        placeholder={t('ai_chat.input_placeholder') || 'Pregúntame algo o envíame un comando de voz...'}
      />

      {/* Escudo de Seguridad Anti-Destrucción (Modal de Confirmación) */}
      {confirmModal && confirmModal.show && (
        <FeedbackModal
          type="confirm"
          title={confirmModal.title}
          message={confirmModal.message}
          confirmText={
            language === 'fr'
              ? 'Oui, supprimer'
              : language === 'en'
              ? 'Yes, delete'
              : 'Sí, confirmar borrado'
          }
          cancelText={
            language === 'fr' ? 'Annuler' : language === 'en' ? 'Cancel' : 'Cancelar'
          }
          onClose={() => setConfirmModal(null)}
          onConfirmHandler={handleConfirmDelete}
        />
      )}
    </div>
  );
}
