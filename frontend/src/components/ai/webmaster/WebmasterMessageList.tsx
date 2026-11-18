'use client';

import { useState, RefObject } from 'react';
import { User, Sparkles, Compass, AlertTriangle, Trash2, Check, ZoomIn, ExternalLink, X, ImageOff } from 'lucide-react';
import { Message, parseOptionsAndText, AttachedImagePreview, ParsedOption, OptionGroup } from './webmasterConfig';

function OptionMatrixSelector({
  optionGroups,
  onSelectOption,
  disabled
}: {
  optionGroups: OptionGroup[];
  onSelectOption: (val: string) => void;
  disabled: boolean;
}) {
  const [selectedMap, setSelectedMap] = useState<Record<string, ParsedOption>>({});

  const handleToggle = (groupName: string, opt: ParsedOption) => {
    setSelectedMap(prev => {
      const next = { ...prev };
      if (next[groupName]?.label === opt.label) {
        delete next[groupName];
      } else {
        next[groupName] = opt;
      }
      return next;
    });
  };

  const selectedCount = Object.keys(selectedMap).length;

  const handleApply = () => {
    const selectedList = Object.entries(selectedMap).map(([group, opt]) => `${group}: ${opt.label}`);
    const combinedPrompt = `Aplica los siguientes ajustes: ${selectedList.join(', ')}`;
    onSelectOption(combinedPrompt);
  };

  return (
    <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 border border-amber-200/80 shadow-sm space-y-3 animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-amber-200/40">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
          <Sparkles size={12} />
          <span>Configuración Multicriterio por Fila</span>
        </span>
        <span className="text-[10px] text-stone-400 font-sans">
          {selectedCount > 0 ? `${selectedCount} seleccionado(s)` : 'Selecciona una opción por fila'}
        </span>
      </div>

      <div className="space-y-2.5">
        {optionGroups.map((grp, gIdx) => {
          const selectedInGroup = selectedMap[grp.name];
          return (
            <div key={gIdx} className="space-y-1">
              <span className="text-[9px] font-extrabold uppercase tracking-widest text-stone-500">
                {grp.name}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {grp.options.map((opt, oIdx) => {
                  const isSelected = selectedInGroup?.label === opt.label;
                  return (
                    <button
                      key={oIdx}
                      type="button"
                      disabled={disabled}
                      onClick={() => handleToggle(grp.name, opt)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 flex items-center gap-1.5 shadow-2xs active:scale-95 disabled:opacity-40 ${
                        isSelected
                          ? 'bg-stone-900 text-white border border-stone-900 shadow-sm ring-1 ring-[#d4af37]'
                          : 'bg-white hover:bg-stone-50 text-stone-700 border border-amber-200/80'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#d4af37]' : 'bg-stone-300'}`} />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {selectedCount > 0 && (
        <div className="pt-2 border-t border-amber-200/40 flex justify-end">
          <button
            type="button"
            disabled={disabled}
            onClick={handleApply}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-[#d4af37] hover:bg-[#b38f2b] text-white shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles size={13} />
            <span>Aplicar Configuración Seleccionada ({selectedCount})</span>
          </button>
        </div>
      )}
    </div>
  );
}

function AttachedImageThumbnail({
  image,
  onZoom
}: {
  image: AttachedImagePreview;
  onZoom: () => void;
}) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return null;
  }

  return (
    <div className="mb-3 rounded-2xl overflow-hidden border border-amber-300/60 bg-stone-950/10 shadow-sm group/img relative">
      <div 
        className="relative overflow-hidden cursor-zoom-in bg-stone-900/5"
        onClick={onZoom}
      >
        <img
          src={image.url}
          alt={image.name}
          onError={() => setHasError(true)}
          className="w-full max-h-56 object-cover rounded-2xl hover:scale-[1.02] transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity flex items-end justify-between p-3">
          <div className="flex items-center gap-1.5 text-white text-[11px] font-medium truncate">
            <ZoomIn size={13} className="text-[#d4af37]" />
            <span className="truncate max-w-[200px]">{image.name}</span>
          </div>
          <span className="text-[10px] bg-black/60 text-amber-200 px-2 py-0.5 rounded-lg border border-amber-300/30 font-medium shrink-0">
            Ampliar
          </span>
        </div>
      </div>
    </div>
  );
}

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
  const [zoomImage, setZoomImage] = useState<{ url: string; name: string } | null>(null);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 scrollbar-thin scrollbar-thumb-stone-200">
        {messages.map((msg, i) => {
          const isUser = msg.role === 'user';
          const { clean, options, optionGroups, attachedImage } = parseOptionsAndText(msg.content);

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

                  {/* Miniatura visual de imagen adjunta o generada con IA */}
                  {attachedImage && (
                    <AttachedImageThumbnail
                      image={attachedImage}
                      onZoom={() => setZoomImage({ url: attachedImage.url, name: attachedImage.name })}
                    />
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

                  if (optionGroups && optionGroups.length > 1) {
                    return (
                      <OptionMatrixSelector
                        optionGroups={optionGroups}
                        onSelectOption={onSelectOption}
                        disabled={isLoading}
                      />
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
                          <Sparkles size={11} className="text-[#d4af37] opacity-60 group-hover:text-stone-950 group-hover:opacity-100 transition-all ml-auto" />
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

      {/* Modal / Lightbox de Ampliación de Fotografía */}
      {zoomImage && (
        <div
          onClick={() => setZoomImage(null)}
          className="fixed inset-0 z-[99999] bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-stone-900 border border-[#d4af37]/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Barra superior del visor */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-stone-950/90 border-b border-stone-800 text-stone-200">
              <div className="flex items-center gap-2 truncate pr-4">
                <span className="w-2 h-2 rounded-full bg-[#d4af37]" />
                <span className="text-xs font-semibold truncate text-amber-100">{zoomImage.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={zoomImage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Abrir imagen en pestaña nueva"
                >
                  <ExternalLink size={15} />
                </a>
                <button
                  onClick={() => setZoomImage(null)}
                  className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-white/10 transition-colors"
                  title="Cerrar"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Contenedor de la Imagen */}
            <div className="p-2 sm:p-4 overflow-auto flex items-center justify-center max-h-[calc(90vh-60px)] min-h-[220px] bg-stone-950/40">
              <img
                src={zoomImage.url}
                alt={zoomImage.name}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById('zoom-fallback-error');
                  if (fallback) fallback.style.display = 'flex';
                }}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-xl"
              />
              <div id="zoom-fallback-error" style={{ display: 'none' }} className="flex-col items-center justify-center p-8 text-center text-stone-400 gap-2">
                <ImageOff size={28} className="text-amber-400/60 mx-auto mb-1" />
                <p className="text-xs font-medium text-stone-300">No se pudo cargar la vista previa de la fotografía.</p>
                <p className="text-[11px] text-stone-500">Es posible que el archivo haya sido actualizado o reemplazado en la galería.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
