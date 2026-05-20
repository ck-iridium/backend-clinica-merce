"use client";
import React from 'react';

interface Block {
  id: string;
  block_type: 'title_heading' | 'text_image_cta' | 'atomic_image' | 'atomic_category';
  content_data: Record<string, any>;
  order_index: number;
}

interface BlockEditorModalProps {
  isOpen: boolean;
  editingBlock: Block | null;
  editFormData: Record<string, any>;
  onChangeFormData: (data: Record<string, any>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  dbCategories: any[];
  dbServices: any[];
  openGalleryFor: (field: 'text_image_cta_image' | 'atomic_image_image') => void;
}

export default function BlockEditorModal({
  isOpen,
  editingBlock,
  editFormData,
  onChangeFormData,
  onSave,
  onClose,
  saving,
  dbCategories,
  dbServices,
  openGalleryFor,
}: BlockEditorModalProps) {
  if (!isOpen || !editingBlock) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-xl p-10 animate-in zoom-in-95 duration-300 max-h-[85vh] overflow-y-auto">
        
        <div className="mb-6">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
            Panel de Configuración
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-800">
            Ajustes del Bloque
          </h2>
          <p className="text-stone-400 text-xs mt-1">
            Edita las variables y textos del bloque seleccionado. Los cambios se aplicarán en vivo.
          </p>
        </div>

        <div className="space-y-5 mb-8">
          
          {/* ──── FORMULARIO: TITLE HEADING ─────────────────────────── */}
          {editingBlock.block_type === 'title_heading' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Título de Encabezado</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={e => onChangeFormData({ ...editFormData, title: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Subtítulo o Párrafo Secundario</label>
                <textarea
                  rows={3}
                  value={editFormData.subtitle || ''}
                  onChange={e => onChangeFormData({ ...editFormData, subtitle: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Nivel HTML</label>
                  <select
                    value={editFormData.title_tag || 'h2'}
                    onChange={e => onChangeFormData({ ...editFormData, title_tag: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                  >
                    <option value="h1">H1 (Principal)</option>
                    <option value="h2">H2 (Sección)</option>
                    <option value="h3">H3 (Subsección)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Alineación</label>
                  <select
                    value={editFormData.alignment || 'center'}
                    onChange={e => onChangeFormData({ ...editFormData, alignment: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-stone-50 rounded-xl border border-stone-100">
                <span className="text-sm font-bold text-stone-700">Mostrar línea decorativa dorada</span>
                <button
                  type="button"
                  onClick={() => onChangeFormData({ ...editFormData, show_divider: !editFormData.show_divider })}
                  className={`relative w-11 h-6 rounded-full transition-all duration-300 ${editFormData.show_divider ? 'bg-[#d4af37]' : 'bg-stone-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${editFormData.show_divider ? 'translate-x-5' : ''}`} />
                </button>
              </div>
            </>
          )}

          {/* ──── FORMULARIO: TEXT IMAGE CTA ───────────────────────── */}
          {editingBlock.block_type === 'text_image_cta' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Título de la Sección</label>
                <input
                  type="text"
                  value={editFormData.title || ''}
                  onChange={e => onChangeFormData({ ...editFormData, title: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Cuerpo / Descripción</label>
                <textarea
                  rows={5}
                  value={editFormData.description || ''}
                  onChange={e => onChangeFormData({ ...editFormData, description: e.target.value })}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Imagen del Bloque</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Sin archivo multimedia seleccionado"
                    value={editFormData.image_url || ''}
                    readOnly
                    className="flex-grow border border-stone-200 rounded-xl px-4 py-3 text-xs font-mono bg-stone-50 text-stone-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => openGalleryFor('text_image_cta_image')}
                    className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0"
                  >
                    Elegir de Galería
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Posición de Imagen</label>
                  <select
                    value={editFormData.image_position || 'left'}
                    onChange={e => onChangeFormData({ ...editFormData, image_position: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                  >
                    <option value="left">A la izquierda</option>
                    <option value="right">A la derecha</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Estilo de Botón CTA</label>
                  <select
                    value={editFormData.cta_button?.style || 'gold_solid'}
                    onChange={e => onChangeFormData({
                      ...editFormData,
                      cta_button: {
                        ...(editFormData.cta_button || {}),
                        style: e.target.value
                      }
                    })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                  >
                    <option value="gold_solid">Dorado Sólido</option>
                    <option value="gold_outline">Dorado Borde</option>
                    <option value="dark_solid">Oscuro Sólido</option>
                    <option value="white_solid">Blanco Sólido</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-stone-100 pt-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Texto del Botón CTA</label>
                  <input
                    type="text"
                    value={editFormData.cta_button?.text || ''}
                    onChange={e => onChangeFormData({
                      ...editFormData,
                      cta_button: {
                        ...(editFormData.cta_button || {}),
                        text: e.target.value
                      }
                    })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Enlace del Botón CTA</label>
                  <input
                    type="text"
                    value={editFormData.cta_button?.url || ''}
                    onChange={e => onChangeFormData({
                      ...editFormData,
                      cta_button: {
                        ...(editFormData.cta_button || {}),
                        url: e.target.value
                      }
                    })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] font-mono text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* ──── FORMULARIO: ATOMIC IMAGE ─────────────────────────── */}
          {editingBlock.block_type === 'atomic_image' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Imagen / Loop de Vídeo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Sin archivo multimedia seleccionado"
                    value={editFormData.image_url || ''}
                    readOnly
                    className="flex-grow border border-stone-200 rounded-xl px-4 py-3 text-xs font-mono bg-stone-50 text-stone-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => openGalleryFor('atomic_image_image')}
                    className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0"
                  >
                    Elegir de Galería
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Pie de Foto / Título Corto</label>
                <input
                  type="text"
                  value={editFormData.caption || ''}
                  onChange={e => onChangeFormData({ ...editFormData, caption: e.target.value })}
                  placeholder="Ej: Resultados del tratamiento tras 3 sesiones."
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Alineación</label>
                  <select
                    value={editFormData.alignment || 'center'}
                    onChange={e => onChangeFormData({ ...editFormData, alignment: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                  >
                    <option value="left">Izquierda</option>
                    <option value="center">Centro</option>
                    <option value="right">Derecha</option>
                    <option value="full_width">Ancho Completo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Ancho Máximo</label>
                  <input
                    type="text"
                    value={editFormData.max_width || '800px'}
                    onChange={e => onChangeFormData({ ...editFormData, max_width: e.target.value })}
                    placeholder="Ej: 800px o 100%"
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37] font-mono text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* ──── FORMULARIO: ATOMIC CATEGORY ──────────────────────── */}
          {editingBlock.block_type === 'atomic_category' && (
            <>
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Categoría del Negocio</label>
                <select
                  value={editFormData.category_id || ''}
                  onChange={e => {
                    const newCatId = e.target.value;
                    onChangeFormData({
                      ...editFormData,
                      category_id: newCatId,
                      selected_treatment_ids: [] // Reiniciar seleccionados al cambiar categoría
                    });
                  }}
                  className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                >
                  <option value="" disabled>Selecciona una categoría...</option>
                  {dbCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {editFormData.category_id && (
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Tratamientos a Mostrar</label>
                  <p className="text-[10px] text-stone-400 mb-3">Marca los tratamientos específicos que deseas renderizar. Si no seleccionas ninguno, se mostrarán todos los de la categoría por defecto.</p>
                  
                  <div className="border border-stone-200 rounded-2xl max-h-48 overflow-y-auto p-4 space-y-3 bg-stone-50/50">
                    {dbServices
                      .filter(svc => svc.category_id === editFormData.category_id && svc.is_active)
                      .map(svc => {
                        const isChecked = editFormData.selected_treatment_ids?.includes(svc.id);
                        return (
                          <label key={svc.id} className="flex items-center gap-3 cursor-pointer text-xs font-semibold text-stone-700 hover:text-stone-900 transition-colors">
                            <input
                              type="checkbox"
                              checked={isChecked || false}
                              onChange={() => {
                                const currentList = editFormData.selected_treatment_ids || [];
                                const nextList = currentList.includes(svc.id)
                                  ? currentList.filter((id: string) => id !== svc.id)
                                  : [...currentList, svc.id];
                                onChangeFormData({ ...editFormData, selected_treatment_ids: nextList });
                              }}
                              className="w-4 h-4 rounded text-[#d4af37] focus:ring-[#d4af37] border-stone-300"
                            />
                            <span>{svc.name} <span className="text-[10px] text-stone-400">({svc.price}€)</span></span>
                          </label>
                        );
                      })}

                    {dbServices.filter(svc => svc.category_id === editFormData.category_id && svc.is_active).length === 0 && (
                      <p className="text-xs text-stone-400 italic text-center py-4">No hay tratamientos activos en esta categoría.</p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Diseño del Grid</label>
                  <select
                    value={editFormData.layout || 'grid'}
                    onChange={e => onChangeFormData({ ...editFormData, layout: e.target.value })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none bg-transparent"
                  >
                    <option value="grid">Bento Grid Dinámico</option>
                    <option value="slider">Slider Cards Deslizable</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-600 mb-2 uppercase tracking-wider">Máximo de elementos</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editFormData.max_items || 4}
                    onChange={e => onChangeFormData({ ...editFormData, max_items: parseInt(e.target.value) || 4 })}
                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Botonera */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl border border-stone-200 text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"
          >
            Descartar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3.5 rounded-2xl bg-stone-900 hover:bg-[#d4af37] text-white text-sm font-bold transition-all duration-300 disabled:opacity-40"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

      </div>
    </div>
  );
}
