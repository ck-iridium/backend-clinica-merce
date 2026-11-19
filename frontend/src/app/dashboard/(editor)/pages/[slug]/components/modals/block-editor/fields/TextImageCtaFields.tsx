import React from 'react';
import { MediaSelectorField } from '../MediaSelectorField';

interface TextImageCtaFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
  openGalleryFor: (field: string, mediaType?: 'image' | 'video' | 'all') => void;
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function TextImageCtaFields({ editFormData, set, openGalleryFor }: TextImageCtaFieldsProps) {
  return (
    <>
      <MediaSelectorField
        value={editFormData.image_url || ''}
        onChange={val => set('image_url', val)}
        onOpenGallery={() => openGalleryFor('image_url', 'all')}
        label="Fotografía o Vídeo Editorial"
        aspectRatio="aspect-video"
      />

      {/* Disposición del Bloque (Layout en 4 direcciones) */}
      <div>
        <label className={labelClass}>Disposición del Bloque</label>
        <div className="grid grid-cols-2 gap-2 select-none">
          {[
            { value: 'image_left', label: 'Imagen a la Izquierda', sub: 'Texto a la derecha' },
            { value: 'image_right', label: 'Imagen a la Derecha', sub: 'Texto a la izquierda' },
            { value: 'image_top', label: 'Imagen Arriba', sub: 'Texto debajo centrado' },
            { value: 'image_bottom', label: 'Texto Arriba', sub: 'Imagen debajo centrada' }
          ].map(opt => {
            const currentLayout = editFormData.layout || (editFormData.alignment === 'right' ? 'image_right' : editFormData.alignment === 'center' ? 'image_top' : 'image_left');
            const isSel = currentLayout === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  set('layout', opt.value);
                  set('alignment', opt.value === 'image_right' ? 'right' : opt.value === 'image_top' ? 'center' : 'left');
                }}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  isSel
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs ring-1 ring-stone-900'
                    : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold leading-tight">{opt.label}</span>
                  {isSel && <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />}
                </div>
                <span className={`block text-[10px] mt-0.5 ${isSel ? 'text-stone-300' : 'text-stone-400'}`}>
                  {opt.sub}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Contenido Editorial */}
      <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-[#d4af37] block">
          Contenido Editorial y Botón
        </span>

        <div>
          <label className="block text-[10px] font-bold text-stone-500 mb-1">Título</label>
          <input 
            className={`${inputClass} font-serif font-bold text-base`} 
            value={editFormData.heading || ''} 
            onChange={e => set('heading', e.target.value)} 
            placeholder="Ej: Armonía y Excelencia" 
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-stone-500 mb-1">Texto Descriptivo</label>
          <textarea 
            className={`${inputClass} min-h-[70px] resize-none`} 
            rows={3} 
            value={editFormData.subheading || ''} 
            onChange={e => set('subheading', e.target.value)} 
            placeholder="Un espacio donde el bienestar y la sofisticación se encuentran..." 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 mb-1">Texto del Botón CTA</label>
            <input 
              className={inputClass} 
              value={editFormData.cta_text || ''} 
              onChange={e => set('cta_text', e.target.value)} 
              placeholder="Descubrir más" 
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-stone-500 mb-1">Enlace del Botón CTA</label>
            <input 
              className={inputClass} 
              value={editFormData.cta_url || ''} 
              onChange={e => set('cta_url', e.target.value)} 
              placeholder="/tratamientos" 
            />
          </div>
        </div>
      </div>

      {/* Altura y Encuadre */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Altura de Fotografía</label>
          <div className="grid grid-cols-3 gap-1 select-none">
            {[
              { value: 'small', label: '250px' },
              { value: 'medium', label: '400px' },
              { value: 'large', label: '550px' }
            ].map(h => {
              const isSel = (editFormData.height_preset || 'medium') === h.value;
              return (
                <button
                  key={h.value}
                  type="button"
                  onClick={() => set('height_preset', h.value)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {h.label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className={labelClass}>Encuadre (Object Fit)</label>
          <div className="grid grid-cols-2 gap-1 select-none">
            {[
              { value: 'cover', label: 'Recortar (Cover)' },
              { value: 'contain', label: 'Ajustar' }
            ].map(fit => {
              const isSel = (editFormData.object_fit || 'cover') === fit.value;
              return (
                <button
                  key={fit.value}
                  type="button"
                  onClick={() => set('object_fit', fit.value)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {fit.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
