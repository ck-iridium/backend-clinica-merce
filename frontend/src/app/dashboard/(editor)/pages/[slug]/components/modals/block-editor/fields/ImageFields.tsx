import React from 'react';
import { MediaSelectorField } from '../MediaSelectorField';

interface ImageFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
  openGalleryFor: (field: string, mediaType?: 'image' | 'video' | 'all') => void;
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37]/40 focus:border-[#d4af37] transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function ImageFields({ editFormData, set, openGalleryFor }: ImageFieldsProps) {
  return (
    <>
      <MediaSelectorField
        value={editFormData.image_url || ''}
        onChange={val => set('image_url', val)}
        onOpenGallery={() => openGalleryFor('image_url', 'all')}
        label="Archivo Multimedia"
        aspectRatio="aspect-video"
      />

      <div>
        <label className={labelClass}>Pie de foto (caption)</label>
        <input 
          className={inputClass} 
          value={editFormData.caption || ''} 
          onChange={e => set('caption', e.target.value)} 
          placeholder="Descripción o nota al pie..." 
        />
      </div>

      <div>
        <label className={labelClass}>Alineación</label>
        <div className="grid grid-cols-4 gap-2 select-none">
          {[
            { value: 'left', label: 'Izquierda' },
            { value: 'center', label: 'Centro' },
            { value: 'right', label: 'Derecha' },
            { value: 'full_width', label: 'Ancho Total' }
          ].map(opt => {
            const isSel = (editFormData.alignment || 'center') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('alignment', opt.value)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all text-center ${
                  isSel
                    ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass}>Altura de Imagen / Vídeo</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 select-none">
          {[
            { value: 'auto', label: 'Auto' },
            { value: 'small', label: '250px' },
            { value: 'medium', label: '400px' },
            { value: 'large', label: '550px' },
            { value: 'screen', label: '750px' }
          ].map(h => {
            const isSel = (editFormData.height_preset || 'auto') === h.value;
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

      {editFormData.alignment !== 'full_width' && (
        <div>
          <label className={labelClass}>Ancho Máximo</label>
          <div className="grid grid-cols-4 gap-2 select-none">
            {['25%', '50%', '75%', '100%'].map(w => {
              const isSel = editFormData.max_width === w || (!editFormData.max_width && w === '100%');
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => set('max_width', w)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                    isSel
                      ? 'bg-stone-900 border-stone-900 text-white shadow-xs'
                      : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        <label className={labelClass}>Encuadre de Imagen (Object Fit)</label>
        <div className="grid grid-cols-2 gap-2 select-none">
          {[
            { value: 'cover', label: 'Recortar y Llenar (Cover)' },
            { value: 'contain', label: 'Ajustar Completa (Contain)' }
          ].map(fit => {
            const isSel = (editFormData.object_fit || 'cover') === fit.value;
            return (
              <button
                key={fit.value}
                type="button"
                onClick={() => set('object_fit', fit.value)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border text-center ${
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
    </>
  );
}
