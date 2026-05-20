"use client";
import React from 'react';

const selectClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200 appearance-none cursor-pointer";
const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

interface BlockEditorModalProps {
  isOpen: boolean;
  editingBlock: any;
  editFormData: Record<string, any>;
  onChangeFormData: (data: Record<string, any>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  dbCategories: any[];
  dbServices: any[];
  openGalleryFor: (field: string) => void;
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

  const set = (key: string, value: any) => onChangeFormData({ ...editFormData, [key]: value });
  const blockType = editingBlock.block_type;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-8 pt-8 pb-5 border-b border-stone-100 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
            Propiedades del Bloque
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-800 capitalize">
            {blockType.replace(/_/g, ' ')}
          </h2>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">

          {/* ── HERO ── */}
          {blockType === 'hero' && (<>
            <div>
              <label className={labelClass}>Imagen / Vídeo de fondo</label>
              <div className="flex gap-2">
                <input className={inputClass} value={editFormData.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="URL de la imagen..." />
                <button onClick={() => openGalleryFor('image_url')} className="shrink-0 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-600 transition-all">Galería</button>
              </div>
            </div>
            <div>
              <label className={labelClass}>Título principal</label>
              <input className={inputClass} value={editFormData.heading || ''} onChange={e => set('heading', e.target.value)} placeholder="Descubre tu mejor versión" />
            </div>
            <div>
              <label className={labelClass}>Subtítulo</label>
              <input className={inputClass} value={editFormData.subheading || ''} onChange={e => set('subheading', e.target.value)} placeholder="Texto descriptivo..." />
            </div>
            <div>
              <label className={labelClass}>Texto del botón CTA</label>
              <input className={inputClass} value={editFormData.cta_text || ''} onChange={e => set('cta_text', e.target.value)} placeholder="Reservar cita" />
            </div>
            <div>
              <label className={labelClass}>URL del botón CTA</label>
              <input className={inputClass} value={editFormData.cta_url || ''} onChange={e => set('cta_url', e.target.value)} placeholder="/reservar" />
            </div>
          </>)}

          {/* ── TÍTULO ── */}
          {(blockType === 'atomic_title' || blockType === 'title_heading') && (<>
            <div>
              <label className={labelClass}>Texto del Título</label>
              <input className={inputClass} value={editFormData.title || ''} onChange={e => set('title', e.target.value)} placeholder="Título de la sección..." />
            </div>
            <div>
              <label className={labelClass}>Subtítulo (opcional)</label>
              <input className={inputClass} value={editFormData.subtitle || ''} onChange={e => set('subtitle', e.target.value)} placeholder="Texto complementario..." />
            </div>
            <div>
              <label className={labelClass}>Tag HTML</label>
              <select className={selectClass} value={editFormData.title_tag || 'h2'} onChange={e => set('title_tag', e.target.value)}>
                {['h1','h2','h3','h4','h5','h6'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Alineación</label>
              <select className={selectClass} value={editFormData.alignment || 'center'} onChange={e => set('alignment', e.target.value)}>
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="show_divider" checked={editFormData.show_divider !== false} onChange={e => set('show_divider', e.target.checked)} className="w-4 h-4 accent-[#d4af37]" />
              <label htmlFor="show_divider" className="text-sm font-semibold text-stone-600 cursor-pointer">Mostrar línea divisora dorada</label>
            </div>
          </>)}

          {/* ── TEXTO ── */}
          {blockType === 'atomic_text' && (<>
            <div>
              <label className={labelClass}>Contenido HTML</label>
              <textarea
                className={`${inputClass} min-h-[200px] resize-y font-mono text-xs`}
                value={editFormData.html || ''}
                onChange={e => set('html', e.target.value)}
                placeholder="<p>Tu párrafo aquí...</p>"
              />
              <p className="text-[10px] text-stone-400 mt-1">Acepta HTML básico: &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;a href=""&gt;</p>
            </div>
          </>)}

          {/* ── IMAGEN ── */}
          {(blockType === 'atomic_image' || blockType === 'text_image_cta') && (<>
            <div>
              <label className={labelClass}>Imagen / Vídeo</label>
              <div className="flex gap-2">
                <input className={inputClass} value={editFormData.image_url || ''} onChange={e => set('image_url', e.target.value)} placeholder="URL de imagen o vídeo..." />
                <button onClick={() => openGalleryFor('image_url')} className="shrink-0 px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-xs font-bold text-stone-600 transition-all">Galería</button>
              </div>
              {editFormData.image_url && (
                <div className="mt-3 rounded-2xl overflow-hidden border border-stone-100 bg-stone-50">
                  {editFormData.image_url.match(/\.(mp4|webm)/) ? (
                    <video src={editFormData.image_url} className="w-full max-h-40 object-cover" muted loop />
                  ) : (
                    <img src={editFormData.image_url} alt="" className="w-full max-h-40 object-cover" />
                  )}
                </div>
              )}
            </div>
            <div>
              <label className={labelClass}>Pie de foto (caption)</label>
              <input className={inputClass} value={editFormData.caption || ''} onChange={e => set('caption', e.target.value)} placeholder="Descripción de la imagen..." />
            </div>
            <div>
              <label className={labelClass}>Alineación</label>
              <select className={selectClass} value={editFormData.alignment || 'center'} onChange={e => set('alignment', e.target.value)}>
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
                <option value="full_width">Ancho completo</option>
              </select>
            </div>
            {editFormData.alignment !== 'full_width' && (
              <div>
                <label className={labelClass}>Ancho máximo</label>
                <select className={selectClass} value={editFormData.max_width || '800px'} onChange={e => set('max_width', e.target.value)}>
                  {['400px','600px','800px','1000px','100%'].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
            )}
          </>)}

          {/* ── BOTÓN ── */}
          {blockType === 'atomic_button' && (<>
            <div>
              <label className={labelClass}>Texto del botón</label>
              <input className={inputClass} value={editFormData.text || ''} onChange={e => set('text', e.target.value)} placeholder="Reservar cita..." />
            </div>
            <div>
              <label className={labelClass}>URL de destino</label>
              <input className={inputClass} value={editFormData.url || ''} onChange={e => set('url', e.target.value)} placeholder="/reservar" />
            </div>
            <div>
              <label className={labelClass}>Estilo del botón</label>
              <select className={selectClass} value={editFormData.style || 'gold_solid'} onChange={e => set('style', e.target.value)}>
                <option value="gold_solid">Dorado Sólido</option>
                <option value="gold_outline">Dorado Outline</option>
                <option value="dark_solid">Antracita Sólido</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Alineación</label>
              <select className={selectClass} value={editFormData.alignment || 'center'} onChange={e => set('alignment', e.target.value)}>
                <option value="left">Izquierda</option>
                <option value="center">Centro</option>
                <option value="right">Derecha</option>
              </select>
            </div>
          </>)}

          {/* ── CATEGORÍA / BENTO ── */}
          {blockType === 'atomic_category' && (<>
            <div>
              <label className={labelClass}>Categoría de Tratamientos</label>
              <select className={selectClass} value={editFormData.category_id || ''} onChange={e => set('category_id', e.target.value)}>
                <option value="">Selecciona una categoría...</option>
                {dbCategories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
              </select>
            </div>
            {editFormData.category_id && (<>
              <div>
                <label className={labelClass}>Tratamientos a mostrar (opcional)</label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-stone-100 rounded-xl p-3 bg-stone-50/50">
                  {dbServices.filter(s => s.category_id === editFormData.category_id && s.is_active).map(svc => (
                    <label key={svc.id} className="flex items-center gap-2.5 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={(editFormData.selected_treatment_ids || []).includes(svc.id)}
                        onChange={e => {
                          const current = editFormData.selected_treatment_ids || [];
                          set('selected_treatment_ids', e.target.checked ? [...current, svc.id] : current.filter((id: string) => id !== svc.id));
                        }}
                        className="w-4 h-4 accent-[#d4af37]"
                      />
                      <span className="text-sm text-stone-700 group-hover:text-stone-900 transition-colors">{svc.name}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[10px] text-stone-400 mt-1">Si no seleccionas ninguno, se mostrarán todos los activos de la categoría.</p>
              </div>
              <div>
                <label className={labelClass}>Máximo de tratamientos</label>
                <select className={selectClass} value={editFormData.max_items || 4} onChange={e => set('max_items', parseInt(e.target.value))}>
                  {[2,3,4,6,8].map(n => <option key={n} value={n}>{n} tratamientos</option>)}
                </select>
              </div>
            </>)}
          </>)}

        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-stone-100 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border border-stone-200 text-stone-500 hover:bg-stone-50 text-sm font-bold transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 py-3 rounded-2xl bg-stone-900 hover:bg-[#d4af37] text-white text-sm font-black uppercase tracking-wider transition-all duration-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
