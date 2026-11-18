'use client';

import FeedbackModal from '../FeedbackModal';
import { useWebmasterChat } from './webmaster/useWebmasterChat';
import WebmasterHeader from './webmaster/WebmasterHeader';
import WebmasterMessageList from './webmaster/WebmasterMessageList';
import WebmasterCommandGrid from './webmaster/WebmasterCommandGrid';
import WebmasterInputBar from './webmaster/WebmasterInputBar';
import {
  Sparkles,
  Edit3,
  Image as ImageIcon,
  Type,
  FileText,
  DollarSign,
  Clock,
  LayoutGrid,
  SlidersHorizontal,
  Plus,
  MessageSquare,
  Wand2,
  Trash2,
  MapPin,
  PhoneCall,
  X,
  type LucideIcon
} from 'lucide-react';

export interface SelectedSection {
  id: string;
  name: string;
  pageSlug: string;
  blockType?: string;
}

interface ActionChip {
  icon: LucideIcon;
  label: string;
  prompt: string;
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

  const getSectionActionChips = (section: SelectedSection): ActionChip[] => {
    const type = section.blockType || '';
    if (type === 'about') {
      return [
        { icon: FileText, label: 'Cambiar texto', prompt: 'Quiero cambiar el texto de la sección Sobre Nosotros.' },
        { icon: ImageIcon, label: 'Cambiar foto', prompt: 'Quiero cambiar la fotografía de la sección Sobre Nosotros.' },
        { icon: Type, label: 'Cambiar título', prompt: 'Quiero cambiar el título de la sección Sobre Nosotros.' },
      ];
    }
    if (type === 'hero') {
      return [
        { icon: Type, label: 'Cambiar título', prompt: 'Quiero cambiar el título principal del Hero.' },
        { icon: Plus, label: 'Añadir diapositiva', prompt: 'Quiero añadir una nueva diapositiva destacada al Hero.' },
        { icon: SlidersHorizontal, label: 'Cambiar botón', prompt: 'Quiero cambiar el botón de acción del Hero.' },
      ];
    }
    if (type === 'service_title') {
      return [
        { icon: Type, label: 'Cambiar nombre', prompt: 'Quiero cambiar el nombre de este tratamiento.' },
      ];
    }
    if (type === 'service_pricing') {
      return [
        { icon: DollarSign, label: 'Cambiar precio', prompt: 'Quiero cambiar el precio de este tratamiento.' },
        { icon: Clock, label: 'Cambiar duración', prompt: 'Quiero cambiar la duración en minutos de este tratamiento.' },
      ];
    }
    if (type === 'service_description') {
      return [
        { icon: FileText, label: 'Cambiar descripción', prompt: 'Quiero cambiar la descripción corta de este tratamiento.' },
      ];
    }
    if (type === 'service_content') {
      return [
        { icon: Edit3, label: 'Cambiar contenido', prompt: 'Quiero cambiar el contenido detallado de este tratamiento.' },
      ];
    }
    if (type === 'service_media') {
      return [
        { icon: ImageIcon, label: 'Cambiar foto', prompt: 'Quiero cambiar la fotografía de este tratamiento.' },
        { icon: Wand2, label: 'Crear foto con IA', prompt: 'Quiero generar una fotografía con IA para este tratamiento.' },
      ];
    }
    if (type === 'category_header') {
      return [
        { icon: Type, label: 'Cambiar título', prompt: 'Quiero cambiar el título de esta categoría.' },
      ];
    }
    if (type === 'category_list') {
      return [
        { icon: LayoutGrid, label: 'Formato Bento Grid', prompt: 'Configura los tratamientos en formato Bento Grid.' },
        { icon: SlidersHorizontal, label: 'Formato Carrusel', prompt: 'Configura los tratamientos en formato Carrusel.' },
      ];
    }
    if (type === 'category_editorial') {
      return [
        { icon: FileText, label: 'Cambiar texto', prompt: 'Quiero cambiar el texto de esta categoría.' },
      ];
    }
    if (type === 'contact_info') {
      return [
        { icon: Clock, label: 'Cambiar horarios', prompt: 'Quiero cambiar los horarios de atención de la clínica.' },
        { icon: PhoneCall, label: 'Cambiar WhatsApp', prompt: 'Quiero cambiar el número de WhatsApp de contacto.' },
        { icon: MapPin, label: 'Cambiar dirección', prompt: 'Quiero cambiar la dirección física de la clínica.' },
      ];
    }
    if (type === 'atomic_title' || type === 'title_heading') {
      return [
        { icon: Type, label: 'Cambiar título', prompt: `Quiero cambiar el título de este encabezado.` },
      ];
    }
    if (type === 'atomic_text') {
      return [
        { icon: FileText, label: 'Cambiar texto', prompt: 'Quiero cambiar el texto de este párrafo.' },
      ];
    }
    if (type === 'atomic_image') {
      return [
        { icon: ImageIcon, label: 'Cambiar imagen', prompt: 'Quiero cambiar la imagen de este bloque.' },
        { icon: Wand2, label: 'Crear foto con IA', prompt: 'Quiero generar una foto con IA para este espacio.' },
      ];
    }
    if (type === 'category' || type === 'atomic_category') {
      return [
        { icon: LayoutGrid, label: 'Formato Bento Grid', prompt: 'Configura las categorías en formato Bento Grid.' },
        { icon: SlidersHorizontal, label: 'Formato Carrusel', prompt: 'Configura los tratamientos en formato Carrusel.' },
      ];
    }
    if (type === 'cta') {
      return [
        { icon: MessageSquare, label: 'Cambiar texto', prompt: 'Quiero cambiar el texto de este mensaje de reserva.' },
        { icon: SlidersHorizontal, label: 'Cambiar botón', prompt: 'Quiero cambiar el botón de reserva.' },
      ];
    }
    return [
      { icon: Edit3, label: 'Cambiar contenido', prompt: `Quiero modificar el contenido de este bloque.` },
      { icon: Trash2, label: 'Eliminar bloque', prompt: `Quiero eliminar este bloque de la página.` },
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

      {/* Pastilla Visual de Inspección Activa (Quiet Luxury 2026 - Con Color de Acento) */}
      {selectedSection && (
        <div className="mx-4 mb-2 p-3.5 rounded-2xl bg-gradient-to-br from-[#1c1917] via-[#261f17] to-[#1c1917] border border-[#d4af37]/60 shadow-[0_12px_35px_-5px_rgba(212,175,55,0.3)] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-2 mb-2.5 pb-2 border-b border-[#d4af37]/25">
            <div className="flex items-center gap-2 truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#d4af37] shrink-0">Elemento Activo:</span>
              <span className="text-xs font-bold text-amber-100 truncate font-serif">{selectedSection.name}</span>
            </div>
            {onClearSelectedSection && (
              <button
                onClick={onClearSelectedSection}
                className="text-stone-400 hover:text-white hover:bg-white/10 rounded-lg p-1 transition-colors text-[11px] font-medium shrink-0 flex items-center gap-1"
                title="Deseleccionar elemento"
              >
                <X size={12} />
                <span className="text-[10px] hidden sm:inline">Cerrar</span>
              </button>
            )}
          </div>
          {/* Pastillas de acción directa con botones dorados de alto contraste */}
          <div className="flex flex-wrap gap-1.5">
            {getSectionActionChips(selectedSection).map((chip, chipIdx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chipIdx}
                  onClick={() => handleSend(chip.prompt)}
                  disabled={isLoading}
                  className="group inline-flex items-center gap-1.5 text-[11px] font-semibold bg-[#d4af37]/15 hover:bg-[#d4af37] text-amber-200 hover:text-stone-950 border border-[#d4af37]/40 hover:border-[#d4af37] rounded-xl px-2.5 py-1.5 transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-40"
                >
                  <Icon size={12} className="text-[#d4af37] group-hover:text-stone-950 transition-colors shrink-0" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
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
