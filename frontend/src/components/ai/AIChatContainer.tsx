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
        { icon: FileText, label: 'Redactar texto explicativo', prompt: 'Quiero que redactes un texto explicativo elegante y cálido para la sección Sobre Nosotros.' },
        { icon: ImageIcon, label: 'Cambiar fotografía', prompt: 'Quiero cambiar la fotografía de la sección Sobre Nosotros.' },
        { icon: Type, label: 'Modificar título', prompt: 'Quiero cambiar el título de la sección Sobre Nosotros.' },
      ];
    }
    if (type === 'hero') {
      return [
        { icon: Sparkles, label: 'Nuevo eslogan', prompt: 'Propón y redacta un nuevo título y eslogan elegante para el Hero.' },
        { icon: Plus, label: 'Añadir diapositiva', prompt: 'Quiero añadir una nueva diapositiva destacada al Hero.' },
        { icon: SlidersHorizontal, label: 'Cambiar botón', prompt: 'Quiero cambiar el texto y enlace del botón de acción del Hero.' },
      ];
    }
    if (type === 'service_title') {
      return [
        { icon: Type, label: 'Cambiar nombre', prompt: 'Quiero cambiar el nombre de este tratamiento.' },
        { icon: Sparkles, label: 'Sugerir nombre premium', prompt: 'Sugiere y aplica un nombre más exclusivo y sofisticado para este tratamiento.' },
      ];
    }
    if (type === 'service_pricing') {
      return [
        { icon: DollarSign, label: 'Modificar precio', prompt: 'Quiero modificar el precio de este tratamiento.' },
        { icon: Clock, label: 'Modificar duración', prompt: 'Quiero cambiar la duración en minutos de este tratamiento.' },
      ];
    }
    if (type === 'service_description') {
      return [
        { icon: FileText, label: 'Mejorar descripción corta', prompt: 'Reescribe la descripción breve de este tratamiento con un tono persuasivo y exclusivo de alta gama.' },
        { icon: Sparkles, label: 'Resumen inspirador', prompt: 'Redacta una descripción corta, evocadora e inspiradora para este tratamiento.' },
      ];
    }
    if (type === 'service_content') {
      return [
        { icon: Edit3, label: 'Perfeccionar protocolo', prompt: 'Redacta un protocolo detallado con beneficios y pasos para este tratamiento.' },
        { icon: Sparkles, label: 'Enfoque Quiet Luxury', prompt: 'Optimiza el contenido detallado de este tratamiento con redacción de lujo.' },
      ];
    }
    if (type === 'service_media') {
      return [
        { icon: ImageIcon, label: 'Cambiar fotografía', prompt: 'Quiero cambiar la fotografía principal de este tratamiento.' },
        { icon: Wand2, label: 'Generar foto con IA', prompt: 'Genera una fotografía editorial de alta gama para este tratamiento.' },
      ];
    }
    if (type === 'category_header') {
      return [
        { icon: Type, label: 'Editar título', prompt: 'Quiero actualizar el título y subtítulo de esta categoría.' },
        { icon: Sparkles, label: 'Mejorar presentación', prompt: 'Optimiza la presentación y eslogan de esta categoría de tratamientos.' },
      ];
    }
    if (type === 'category_list') {
      return [
        { icon: LayoutGrid, label: 'Formato Bento Grid 2026', prompt: 'Configura la visualización de tratamientos en formato Bento Grid 2026.' },
        { icon: SlidersHorizontal, label: 'Formato Carrusel dinámico', prompt: 'Configura la visualización de tratamientos en formato carrusel interactivo.' },
      ];
    }
    if (type === 'category_editorial') {
      return [
        { icon: FileText, label: 'Optimizar texto SEO', prompt: 'Optimiza el texto editorial y enfoque SEO de esta categoría.' },
      ];
    }
    if (type === 'contact_info') {
      return [
        { icon: Clock, label: 'Actualizar horarios', prompt: 'Quiero revisar y actualizar los horarios de atención de la clínica.' },
        { icon: PhoneCall, label: 'Modificar WhatsApp / Teléfono', prompt: 'Quiero modificar el número de contacto y WhatsApp.' },
        { icon: MapPin, label: 'Modificar dirección', prompt: 'Quiero actualizar la dirección física de la clínica.' },
      ];
    }
    if (type === 'atomic_title' || type === 'title_heading') {
      return [
        { icon: Type, label: 'Cambiar título', prompt: `Quiero cambiar el título y subtítulo principal de la página "${section.pageSlug}".` },
        { icon: Sparkles, label: 'Rediseño sobrio', prompt: `Adapta el título y estilo de este encabezado a un formato más sobrio y elegante.` },
      ];
    }
    if (type === 'atomic_text') {
      return [
        { icon: FileText, label: 'Mejorar redacción', prompt: 'Reescribe y perfecciona el texto de este párrafo con estilo Quiet Luxury.' },
        { icon: Edit3, label: 'Redactar nuevo contenido', prompt: 'Redacta un texto más extenso y explicativo para este bloque.' },
      ];
    }
    if (type === 'atomic_image') {
      return [
        { icon: ImageIcon, label: 'Cambiar imagen', prompt: 'Quiero cambiar la imagen de este bloque.' },
        { icon: Wand2, label: 'Generar foto con IA', prompt: 'Genera una fotografía editorial de alta gama para este espacio.' },
      ];
    }
    if (type === 'category' || type === 'atomic_category') {
      return [
        { icon: LayoutGrid, label: 'Formato Bento Grid', prompt: 'Configura las categorías de la portada en formato Bento Grid 2026.' },
        { icon: SlidersHorizontal, label: 'Formato Carrusel', prompt: 'Configura los tratamientos en formato carrusel de tarjetas horizontal.' },
      ];
    }
    if (type === 'cta') {
      return [
        { icon: MessageSquare, label: 'Mejorar mensaje CTA', prompt: 'Redacta un nuevo mensaje más persuasivo para la llamada a la acción final.' },
        { icon: SlidersHorizontal, label: 'Cambiar botón', prompt: 'Quiero modificar el texto del botón de reserva final.' },
      ];
    }
    return [
      { icon: Edit3, label: 'Modificar contenido', prompt: `Quiero modificar el contenido de este bloque.` },
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

      {/* Pastilla Visual de Inspección Activa (Aceternity Quiet Luxury Style) */}
      {selectedSection && (
        <div className="mx-4 mb-2 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-[#d4af37]/35 shadow-[0_8px_25px_rgba(212,175,55,0.08)] animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-stone-100">
            <div className="flex items-center gap-2 truncate">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d4af37]" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#b08e23] shrink-0">Elemento Activo:</span>
              <span className="text-xs font-bold text-stone-900 truncate font-serif">{selectedSection.name}</span>
            </div>
            {onClearSelectedSection && (
              <button
                onClick={onClearSelectedSection}
                className="text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg p-1 transition-colors text-[11px] font-medium shrink-0 flex items-center gap-1"
                title="Deseleccionar elemento"
              >
                <X size={12} />
                <span className="text-[10px] hidden sm:inline">Cerrar</span>
              </button>
            )}
          </div>
          {/* Pastillas de acción directa con iconos Lucide y microinteracciones de lujo */}
          <div className="flex flex-wrap gap-1.5">
            {getSectionActionChips(selectedSection).map((chip, chipIdx) => {
              const Icon = chip.icon;
              return (
                <button
                  key={chipIdx}
                  onClick={() => handleSend(chip.prompt)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium bg-stone-50/90 hover:bg-amber-50/80 text-stone-700 hover:text-amber-900 border border-stone-200/80 hover:border-[#d4af37]/60 rounded-xl px-2.5 py-1.5 transition-all duration-200 shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-40"
                >
                  <Icon size={12} className="text-[#b08e23] shrink-0" />
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
