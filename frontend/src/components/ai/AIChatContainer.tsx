'use client';

import FeedbackModal from '../FeedbackModal';
import { useWebmasterChat } from './webmaster/useWebmasterChat';
import WebmasterHeader from './webmaster/WebmasterHeader';
import WebmasterMessageList from './webmaster/WebmasterMessageList';
import WebmasterCommandGrid from './webmaster/WebmasterCommandGrid';
import WebmasterInputBar from './webmaster/WebmasterInputBar';

export interface SelectedSection {
  id: string;
  name: string;
  pageSlug: string;
  blockType?: string;
}

interface AIChatContainerProps {
  onFieldsUpdated?: (fields: string[], redirectUrl?: string) => void;
  initialPrompt?: string | null;
  onPromptConsumed?: () => void;
  activePageSlug?: string;
  activePageTitle?: string;
  selectedSection?: SelectedSection | null;
  onClearSelectedSection?: () => void;
}

export default function AIChatContainer({
  onFieldsUpdated,
  initialPrompt,
  onPromptConsumed,
  activePageSlug,
  activePageTitle,
  selectedSection,
  onClearSelectedSection,
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
  } = useWebmasterChat({ onFieldsUpdated, initialPrompt, onPromptConsumed, selectedSection });

  const getSectionActionChips = (section: SelectedSection) => {
    const type = section.blockType || '';
    if (type === 'about') {
      return [
        { label: '✍️ Redactar texto explicativo', prompt: 'Quiero que redactes un texto explicativo elegante y cálido para la sección Sobre Nosotros.' },
        { label: '🖼️ Cambiar fotografía', prompt: 'Quiero cambiar la fotografía de la sección Sobre Nosotros.' },
        { label: '🏷️ Modificar título', prompt: 'Quiero cambiar el título de la sección Sobre Nosotros.' },
      ];
    }
    if (type === 'hero') {
      return [
        { label: '✨ Nuevo eslogan', prompt: 'Propón y redacta un nuevo título y eslogan elegante para el Hero.' },
        { label: '➕ Añadir diapositiva', prompt: 'Quiero añadir una nueva diapositiva destacada al Hero.' },
        { label: '🔘 Cambiar botón', prompt: 'Quiero cambiar el texto y enlace del botón de acción del Hero.' },
      ];
    }
    if (type === 'atomic_title' || type === 'title_heading') {
      return [
        { label: '✏️ Cambiar título', prompt: `Quiero cambiar el título y subtítulo principal de la página "${section.pageSlug}".` },
        { label: '💎 Rediseño sobrio', prompt: `Adapta el título y estilo de este encabezado a un formato más sobrio y elegante.` },
      ];
    }
    if (type === 'atomic_text') {
      return [
        { label: '✍️ Mejorar redacción', prompt: 'Reescribe y perfecciona el texto de este párrafo con estilo Quiet Luxury.' },
        { label: '📄 Redactar nuevo contenido', prompt: 'Redacta un texto más extenso y explicativo para este bloque.' },
      ];
    }
    if (type === 'atomic_image') {
      return [
        { label: '🖼️ Cambiar imagen', prompt: 'Quiero cambiar la imagen de este bloque.' },
        { label: '🤖 Generar con IA', prompt: 'Genera una fotografía editorial de alta gama para este espacio.' },
      ];
    }
    if (type === 'category' || type === 'atomic_category') {
      return [
        { label: '🔲 Formato Bento Grid', prompt: 'Configura las categorías de la portada en formato Bento Grid 2026.' },
        { label: '🎠 Formato Carrusel', prompt: 'Configura los tratamientos en formato carrusel de tarjetas horizontal.' },
      ];
    }
    if (type === 'cta') {
      return [
        { label: '💬 Mejorar mensaje CTA', prompt: 'Redacta un nuevo mensaje más persuasivo para la llamada a la acción final.' },
        { label: '🎯 Cambiar botón', prompt: 'Quiero modificar el texto del botón de reserva final.' },
      ];
    }
    return [
      { label: '✏️ Modificar contenido', prompt: `Quiero modificar el contenido de este bloque.` },
      { label: '🗑️ Eliminar bloque', prompt: `Quiero eliminar este bloque de la página.` },
    ];
  };

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

      {/* Pastilla Visual de Inspección Activa (Aceternity Quiet Luxury Style) */}
      {selectedSection && (
        <div className="mx-4 mb-2 p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-400/40 shadow-xs animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-pulse shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#b38f2b] shrink-0">Elemento Seleccionado:</span>
              <span className="text-xs font-bold text-stone-900 truncate">{selectedSection.name}</span>
            </div>
            {onClearSelectedSection && (
              <button
                onClick={onClearSelectedSection}
                className="text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-lg p-1 transition-colors text-[11px] font-bold shrink-0 flex items-center gap-1"
                title="Deseleccionar elemento"
              >
                <span>✕</span>
                <span className="text-[10px] hidden sm:inline">Cerrar</span>
              </button>
            )}
          </div>
          {/* Pastillas de acción directa para el elemento seleccionado */}
          <div className="flex flex-wrap gap-1.5">
            {getSectionActionChips(selectedSection).map((chip, chipIdx) => (
              <button
                key={chipIdx}
                onClick={() => handleSend(chip.prompt)}
                disabled={isLoading}
                className="text-[11px] font-semibold bg-white hover:bg-amber-50 text-stone-800 hover:text-[#b38f2b] border border-amber-300/60 rounded-lg px-2.5 py-1 transition-all duration-150 shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-40"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      )}

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
        placeholder={selectedSection ? `¿Qué cambio deseas en "${selectedSection.name}"?` : (t('ai_chat.input_placeholder') || 'Pregúntame algo o envíame un comando de voz...')}
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
