import React from 'react';
import { MediaSelectorField } from '../MediaSelectorField';

interface QuoteTestimonialFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
  openGalleryFor: (field: string, mediaType?: 'image' | 'video' | 'all') => void;
}

export function QuoteTestimonialFields({
  editFormData,
  set,
  openGalleryFor,
}: QuoteTestimonialFieldsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
          Cita o Testimonio
        </label>
        <textarea
          rows={3}
          value={editFormData.quote || ''}
          onChange={e => set('quote', e.target.value)}
          placeholder="Escribe la cita inspiradora o la opinión del paciente..."
          className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
            Autor
          </label>
          <input
            type="text"
            value={editFormData.author || ''}
            onChange={e => set('author', e.target.value)}
            placeholder="Ej. Dra. Mercè Guasch"
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
            Cargo o Título
          </label>
          <input
            type="text"
            value={editFormData.role || ''}
            onChange={e => set('role', e.target.value)}
            placeholder="Ej. Directora Médica / Paciente"
            className="w-full px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
          />
        </div>
      </div>

      <div>
        <label className="text-[10px] font-black uppercase tracking-wider text-stone-500 block mb-1.5">
          Valoración (Estrellas)
        </label>
        <div className="flex gap-2">
          {[5, 4, 3, 0].map(stars => (
            <button
              key={stars}
              type="button"
              onClick={() => set('rating', stars)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                (editFormData.rating ?? 5) === stars
                  ? 'bg-stone-900 border-stone-900 text-[#d4af37]'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              {stars === 0 ? 'Sin estrellas' : `${stars} ★`}
            </button>
          ))}
        </div>
      </div>

      <MediaSelectorField
        label="Foto de Perfil / Avatar (Opcional)"
        value={editFormData.avatar_url || ''}
        onChange={val => set('avatar_url', val)}
        onOpenGallery={() => openGalleryFor('avatar_url', 'image')}
      />
    </div>
  );
}
