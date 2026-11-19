import React from 'react';
import { MediaSelectorField } from '../MediaSelectorField';
import { SmartLinkField } from '../SmartLinkField';

interface TextImageCtaFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
  openGalleryFor: (field: string, mediaType?: 'image' | 'video' | 'all') => void;
  dbCategories?: any[];
  dbServices?: any[];
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function TextImageCtaFields({
  editFormData,
  set,
  openGalleryFor,
  dbCategories = [],
  dbServices = [],
}: TextImageCtaFieldsProps) {
  const currentLayout = editFormData.layout || (editFormData.alignment === 'right' ? 'image_right' : editFormData.alignment === 'center' ? 'image_top' : 'image_left');

  return (
    <div className="space-y-5">
      <MediaSelectorField
        value={editFormData.image_url || ''}
        onChange={val => set('image_url', val)}
        onOpenGallery={() => openGalleryFor('image_url', 'all')}
        label="Fotografía o Vídeo Editorial"
        aspectRatio="aspect-video"
      />

      {/* Disposición del Bloque: 3 opciones en una misma fila con iconos descriptivos */}
      <div>
        <label className={labelClass}>Disposición del Bloque</label>
        <div className="grid grid-cols-3 gap-2 select-none">
          {[
            {
              value: 'image_left',
              label: 'Imagen Izquierda',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Caja imagen izq */}
                  <rect x="2.5" y="4.5" width="8" height="15" rx="1.5" className="fill-current opacity-30 stroke-current" strokeWidth={1.5} />
                  {/* Líneas texto dcha */}
                  <line x1="13.5" y1="7.5" x2="21.5" y2="7.5" strokeWidth={2} strokeLinecap="round" />
                  <line x1="13.5" y1="12" x2="21.5" y2="12" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="13.5" y1="16.5" x2="18.5" y2="16.5" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              ),
            },
            {
              value: 'image_right',
              label: 'Imagen Derecha',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Líneas texto izq */}
                  <line x1="2.5" y1="7.5" x2="10.5" y2="7.5" strokeWidth={2} strokeLinecap="round" />
                  <line x1="2.5" y1="12" x2="10.5" y2="12" strokeWidth={1.5} strokeLinecap="round" />
                  <line x1="2.5" y1="16.5" x2="7.5" y2="16.5" strokeWidth={1.5} strokeLinecap="round" />
                  {/* Caja imagen dcha */}
                  <rect x="13.5" y="4.5" width="8" height="15" rx="1.5" className="fill-current opacity-30 stroke-current" strokeWidth={1.5} />
                </svg>
              ),
            },
            {
              value: 'image_top',
              label: 'Imagen Arriba',
              icon: (
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {/* Caja imagen arriba */}
                  <rect x="3.5" y="3.5" width="17" height="9" rx="1.5" className="fill-current opacity-30 stroke-current" strokeWidth={1.5} />
                  {/* Líneas texto abajo */}
                  <line x1="5.5" y1="16" x2="18.5" y2="16" strokeWidth={2} strokeLinecap="round" />
                  <line x1="7.5" y1="19.5" x2="16.5" y2="19.5" strokeWidth={1.5} strokeLinecap="round" />
                </svg>
              ),
            },
          ].map(opt => {
            const isSel = currentLayout === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  set('layout', opt.value);
                  set('alignment', opt.value === 'image_right' ? 'right' : opt.value === 'image_top' ? 'center' : 'left');
                }}
                className={`py-3 px-2 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition-all ${
                  isSel
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs ring-1 ring-stone-900'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
                }`}
              >
                <div className={`${isSel ? 'text-primary' : 'text-stone-400'}`}>
                  {opt.icon}
                </div>
                <span className="text-[11px] font-bold leading-tight block">
                  {opt.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido Editorial */}
      <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3.5">
        <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
          Contenido Editorial y Botón
        </span>

        <div>
          <label className="block text-[10px] font-bold text-stone-500 mb-1">Título</label>
          <input 
            className={`${inputClass} font-serif font-bold text-sm`} 
            value={editFormData.heading || editFormData.title || ''} 
            onChange={e => set('heading', e.target.value)} 
            placeholder="Ej: Armonía y Excelencia" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-stone-500 mb-1">Texto Descriptivo</label>
          <textarea 
            className={`${inputClass} resize-none leading-relaxed`} 
            rows={3} 
            value={editFormData.subheading || editFormData.description || editFormData.text || ''} 
            onChange={e => set('subheading', e.target.value)} 
            placeholder="Escribe la descripción o historia que acompaña a la imagen..." 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 mb-1">Texto del Botón CTA</label>
            <input 
              className={inputClass} 
              value={editFormData.cta_text || editFormData.button_text || ''} 
              onChange={e => set('cta_text', e.target.value)} 
              placeholder="Descubrir Más" 
            />
          </div>

          <SmartLinkField
            label="Enlace del Botón CTA"
            value={editFormData.cta_url || editFormData.button_url || editFormData.url || ''}
            onChange={val => set('cta_url', val)}
            onSelectSuggestedText={txt => {
              if (!editFormData.cta_text && !editFormData.button_text) {
                set('cta_text', txt);
              }
            }}
            categories={dbCategories}
            services={dbServices}
          />
        </div>
      </div>

      {/* Ajustes de Imagen */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Altura de Fotografía</label>
          <select 
            className={inputClass}
            value={editFormData.height_preset || 'medium'}
            onChange={e => set('height_preset', e.target.value)}
          >
            <option value="small">Compacta (250px)</option>
            <option value="medium">Estándar (400px)</option>
            <option value="large">Amplia (550px)</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Encuadre (Object-Fit)</label>
          <div className="grid grid-cols-2 gap-1.5 select-none pt-0.5">
            {[
              { id: 'cover', label: 'Recortar (Cover)' },
              { id: 'contain', label: 'Ajustar' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => set('object_fit', m.id)}
                className={`py-2 px-1.5 rounded-xl text-[10px] font-bold border transition-all text-center ${
                  (editFormData.object_fit || 'cover') === m.id
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
