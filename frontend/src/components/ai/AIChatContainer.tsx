'use client';

import { useState } from 'react';
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
  Palette,
  Layers,
  MapPin,
  PhoneCall,
  X,
  AlignLeft,
  AlignCenter,
  AlignRight,
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

interface ActionRow {
  title: string;
  chips: ActionChip[];
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
    attachedFile,
    onRemoveFile,
    onAttachClick,
    fileInputRef,
    onFileChange,
    onPaste,
    isUploadingFile,
  } = useWebmasterChat({ onFieldsUpdated, initialPrompt, onPromptConsumed, selectedSection });

  const [selectedMultiChips, setSelectedMultiChips] = useState<Record<string, ActionChip>>({});

  const toggleMultiChip = (rowTitle: string, chip: ActionChip) => {
    setSelectedMultiChips(prev => {
      const next = { ...prev };
      if (next[rowTitle]?.label === chip.label) {
        delete next[rowTitle];
      } else {
        next[rowTitle] = chip;
      }
      return next;
    });
  };

  const handleApplyMultiChips = () => {
    const list = Object.entries(selectedMultiChips).map(([grp, c]) => `${grp}: ${c.label}`);
    const name = selectedSection?.name || 'este elemento';
    const combinedPrompt = `Aplica los siguientes ajustes a ${name}: ${list.join(', ')}`;
    setSelectedMultiChips({});
    handleSend(combinedPrompt);
  };

  const getSectionActionRows = (section: SelectedSection): ActionRow[] => {
    const type = section.blockType || '';
    if (type === 'hero') {
      return [
        {
          title: 'Alineación de Textos',
          chips: [
            { icon: AlignLeft, label: '⇦ Izquierda', prompt: 'Alinea el Hero a la izquierda' },
            { icon: AlignCenter, label: '↔ Centrado', prompt: 'Centra los textos del Hero' },
            { icon: AlignRight, label: '⇨ Derecha', prompt: 'Alinea el Hero a la derecha' },
          ]
        },
        {
          title: 'Edición y Multimedia',
          chips: [
            { icon: Type, label: 'Cambiar titular', prompt: 'Quiero cambiar el título principal de este Hero.' },
            { icon: ImageIcon, label: 'Cambiar fondo', prompt: 'Quiero cambiar la imagen o vídeo de fondo de este Hero.' },
            { icon: SlidersHorizontal, label: 'Cambiar botón CTA', prompt: 'Quiero cambiar el texto y enlace del botón de este Hero.' },
          ]
        }
      ];
    }
    if (type === 'category' || type === 'atomic_category' || type === 'category_list') {
      return [
        {
          title: 'Diseño Visual',
          chips: [
            { icon: SlidersHorizontal, label: '🎠 Carrusel', prompt: 'Configura esta sección de tratamientos en formato Carrusel.' },
            { icon: LayoutGrid, label: '📐 Bento Grid 2026', prompt: 'Configura esta sección de tratamientos en formato Bento Grid.' },
            { icon: LayoutGrid, label: '▦ Cuadrícula', prompt: 'Configura esta sección de tratamientos en formato traditional_grid.' },
            { icon: Layers, label: '📋 Lista Elegante', prompt: 'Configura esta sección de tratamientos en formato minimalist_list.' },
          ]
        },
        {
          title: 'Máximo Visible',
          chips: [
            { icon: Layers, label: '2 Tratamientos', prompt: 'Muestra un máximo de 2 tratamientos en esta sección.' },
            { icon: Layers, label: '4 Tratamientos', prompt: 'Muestra un máximo de 4 tratamientos en esta sección.' },
            { icon: Layers, label: '6 Tratamientos', prompt: 'Muestra un máximo de 6 tratamientos en esta sección.' },
            { icon: Layers, label: '8 Tratamientos', prompt: 'Muestra un máximo de 8 tratamientos en esta sección.' },
          ]
        }
      ];
    }
    if (type === 'section') {
      return [
        {
          title: 'Alineación Horizontal',
          chips: [
            { icon: AlignLeft, label: '⇦ Izquierda', prompt: 'Alinea el contenido de esta sección a la izquierda' },
            { icon: AlignCenter, label: '↔ Centro', prompt: 'Centra el contenido de esta sección' },
            { icon: AlignRight, label: '⇨ Derecha', prompt: 'Alinea el contenido de esta sección a la derecha' },
          ]
        },
        {
          title: 'Color de Fondo',
          chips: [
            { icon: Palette, label: '⚪ Blanco', prompt: 'Pon el fondo de esta sección en blanco' },
            { icon: Palette, label: '🍦 Crema', prompt: 'Pon el fondo de esta sección en crema' },
            { icon: Palette, label: '🖤 Oscuro', prompt: 'Pon el fondo de esta sección en antracita oscuro' },
            { icon: Palette, label: '✨ Oro', prompt: 'Pon el fondo de esta sección en oro suave' },
          ]
        },
        {
          title: 'Ancho de Contenedor',
          chips: [
            { icon: Layers, label: '📦 Centrado (Boxed)', prompt: 'Configura el contenedor de esta sección centrado en cuadrícula' },
            { icon: Layers, label: '↔ Ancho Completo', prompt: 'Configura el contenedor de esta sección a ancho completo' },
          ]
        }
      ];
    }
    if (type === 'atomic_title' || type === 'title_heading') {
      return [
        {
          title: 'Alineación',
          chips: [
            { icon: AlignLeft, label: '⇦ Izquierda', prompt: 'Alinea este encabezado a la izquierda' },
            { icon: AlignCenter, label: '↔ Centro', prompt: 'Centra este encabezado' },
            { icon: AlignRight, label: '⇨ Derecha', prompt: 'Alinea este encabezado a la derecha' },
          ]
        },
        {
          title: 'Edición',
          chips: [
            { icon: Type, label: 'Cambiar título', prompt: 'Quiero cambiar el título de este encabezado.' },
            { icon: Sparkles, label: 'Línea divisora', prompt: 'Modifica la visibilidad de la línea divisora dorada de este encabezado.' },
          ]
        }
      ];
    }
    return [
      {
        title: 'Acciones Rápidas',
        chips: getSectionActionChips(section)
      }
    ];
  };

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
    if (type === 'contact_header' || type === 'contact_info') {
      return [
        { icon: Type, label: 'Cambiar título', prompt: 'Quiero cambiar el título de la página de contacto.' },
        { icon: FileText, label: 'Cambiar subtítulo', prompt: 'Quiero cambiar el subtítulo de la página de contacto.' },
        { icon: Sparkles, label: 'Mejorar redacción', prompt: 'Mejora la redacción del título y subtítulo de la página de contacto con estilo elegante y conciso.' },
      ];
    }
    if (type === 'hero') {
      return [
        { icon: Type, label: 'Cambiar titular', prompt: 'Quiero cambiar el título principal de este Hero.' },
        { icon: ImageIcon, label: 'Cambiar fondo', prompt: 'Quiero cambiar la imagen o vídeo de fondo de este Hero.' },
        { icon: SlidersHorizontal, label: 'Cambiar botón CTA', prompt: 'Quiero cambiar el texto y enlace del botón de este Hero.' },
      ];
    }
    if (type === 'text_image_cta') {
      return [
        { icon: Type, label: 'Cambiar textos', prompt: 'Quiero cambiar el título y texto descriptivo de este bloque.' },
        { icon: ImageIcon, label: 'Cambiar imagen', prompt: 'Quiero cambiar la fotografía de este bloque.' },
        { icon: SlidersHorizontal, label: 'Cambiar botón', prompt: 'Quiero configurar el botón de acción de este bloque.' },
      ];
    }
    if (type === 'atomic_button') {
      return [
        { icon: Type, label: 'Cambiar texto', prompt: 'Quiero cambiar el texto de este botón.' },
        { icon: SlidersHorizontal, label: 'Cambiar enlace', prompt: 'Quiero cambiar la URL de destino de este botón.' },
        { icon: Palette, label: 'Cambiar estilo', prompt: 'Quiero cambiar el estilo de este botón (dorado, outline o antracita).' },
      ];
    }
    if (type === 'atomic_title' || type === 'title_heading') {
      return [
        { icon: Type, label: 'Cambiar título', prompt: `Quiero cambiar el título de este encabezado.` },
        { icon: SlidersHorizontal, label: 'Alinear texto', prompt: 'Alinea este encabezado (izquierda, centro o derecha).' },
        { icon: Sparkles, label: 'Línea divisora', prompt: 'Modifica la visibilidad de la línea divisora dorada de este encabezado.' },
      ];
    }
    if (type === 'atomic_text') {
      return [
        { icon: FileText, label: 'Cambiar texto', prompt: 'Quiero cambiar el texto de este párrafo.' },
        { icon: SlidersHorizontal, label: 'Alinear párrafo', prompt: 'Cambia la alineación de este párrafo (izquierda, centro, derecha o justificado).' },
      ];
    }
    if (type === 'atomic_image') {
      return [
        { icon: ImageIcon, label: 'Cambiar imagen', prompt: 'Quiero cambiar la imagen de este bloque.' },
        { icon: Wand2, label: 'Crear foto con IA', prompt: 'Quiero generar una foto con IA para este espacio.' },
        { icon: SlidersHorizontal, label: 'Ajustar encuadre', prompt: 'Modifica el encuadre o altura de esta fotografía.' },
      ];
    }
    if (type === 'category' || type === 'atomic_category') {
      return [
        { icon: LayoutGrid, label: 'Formato Bento Grid', prompt: 'Configura esta sección de tratamientos en formato Bento Grid.' },
        { icon: SlidersHorizontal, label: 'Formato Carrusel', prompt: 'Configura esta sección de tratamientos en formato Carrusel.' },
        { icon: Layers, label: 'Mostrar 4 tratamientos', prompt: 'Configura esta sección para mostrar un máximo de 4 tratamientos.' },
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
          {/* Opciones organizadas por fila con selección multicriterio */}
          <div className="space-y-2 mt-2">
            {getSectionActionRows(selectedSection).map((row, rIdx) => {
              const selectedInRow = selectedMultiChips[row.title];
              return (
                <div key={rIdx} className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#d4af37]/80 block">
                    {row.title}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {row.chips.map((chip, chipIdx) => {
                      const Icon = chip.icon;
                      const isSelected = selectedInRow?.label === chip.label;
                      return (
                        <button
                          key={chipIdx}
                          onClick={() => toggleMultiChip(row.title, chip)}
                          disabled={isLoading}
                          className={`group inline-flex items-center gap-1.5 text-[11px] font-semibold rounded-xl px-2.5 py-1.5 transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-40 ${
                            isSelected
                              ? 'bg-[#d4af37] text-stone-950 border border-[#d4af37] font-black ring-2 ring-amber-300 ring-offset-1 ring-offset-stone-950 scale-102'
                              : 'bg-[#d4af37]/15 hover:bg-[#d4af37] text-amber-200 hover:text-stone-950 border border-[#d4af37]/40 hover:border-[#d4af37]'
                          }`}
                        >
                          <Icon size={12} className={isSelected ? 'text-stone-950 shrink-0' : 'text-[#d4af37] group-hover:text-stone-950 transition-colors shrink-0'} />
                          <span>{chip.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Botón de Aplicar Configuración Seleccionada */}
          {Object.keys(selectedMultiChips).length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-[#d4af37]/25 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <button
                onClick={handleApplyMultiChips}
                disabled={isLoading}
                className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#d4af37]/30 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles size={13} className="text-stone-950" />
                <span>Aplicar Configuración ({Object.keys(selectedMultiChips).length} ajustes seleccionados)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Botonera de Comandos de Diseño 2026 (2 Filas Glossy Glass) */}
      <WebmasterCommandGrid
        onExecuteCommand={handleSend}
        disabled={isLoading}
        activePageSlug={activePageSlug}
        activePageTitle={activePageTitle}
      />

      {/* Barra de Entrada, Adjuntos y Grabador de Voz */}
      <WebmasterInputBar
        input={input}
        onChangeInput={setInput}
        onSend={handleSend}
        isLoading={isLoading}
        chatLanguage={chatLanguage}
        placeholder={selectedSection ? `¿Qué cambio deseas en "${selectedSection.name}"?` : (t('ai_chat.input_placeholder') || 'Pregúntame algo o envíame un comando de voz...')}
        attachedFile={attachedFile}
        onRemoveFile={onRemoveFile}
        onAttachClick={onAttachClick}
        fileInputRef={fileInputRef}
        onFileChange={onFileChange}
        onPaste={onPaste}
        isUploading={isUploadingFile}
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
