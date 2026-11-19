import React from 'react';
import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { MediaSelectorField } from '../MediaSelectorField';
import { SmartLinkField } from '../SmartLinkField';

interface HeroFieldsProps {
  editFormData: Record<string, any>;
  set: (key: string, value: any) => void;
  openGalleryFor: (field: string, mediaType?: 'image' | 'video' | 'all') => void;
  dbCategories?: any[];
  dbServices?: any[];
}

const inputClass = "w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs text-stone-800 font-sans shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all duration-200";
const labelClass = "block text-[10px] font-black uppercase tracking-wider text-stone-500 mb-1.5";

export function HeroFields({
  editFormData,
  set,
  openGalleryFor,
  dbCategories = [],
  dbServices = [],
}: HeroFieldsProps) {
  return (
    <div className="space-y-4">
      <MediaSelectorField
        value={editFormData.image_url || ''}
        onChange={val => set('image_url', val)}
        onOpenGallery={() => openGalleryFor('image_url', 'all')}
        label="Fotografía o Vídeo de Fondo (Cinematográfico 16:9)"
        aspectRatio="aspect-[16/7]"
      />

      {/* Alineación de Contenido */}
      <div>
        <label className={labelClass}>Alineación del Titular y Contenido</label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'left', label: 'Izquierda', icon: AlignLeft },
            { value: 'center', label: 'Centrado', icon: AlignCenter },
            { value: 'right', label: 'Derecha', icon: AlignRight }
          ].map(opt => {
            const Icon = opt.icon;
            const isSel = (editFormData.alignment || 'center') === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => set('alignment', opt.value)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
                  isSel
                    ? 'bg-stone-900 border-stone-900 text-white shadow-sm ring-1 ring-stone-900'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon size={14} className={isSel ? 'text-primary' : 'text-stone-400'} />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Titular Principal */}
      <div>
        <label className={labelClass}>Título Principal (Serif de Gran Formato)</label>
        <input 
          className={`${inputClass} font-serif text-base font-bold text-stone-900`} 
          value={editFormData.heading || editFormData.title || ''} 
          onChange={e => set('heading', e.target.value)} 
          placeholder="Descubre tu mejor versión" 
        />
      </div>

      {/* Subtítulo */}
      <div>
        <label className={labelClass}>Subtítulo Descriptivo</label>
        <textarea 
          className={`${inputClass} resize-none leading-relaxed`} 
          rows={2} 
          value={editFormData.subheading || editFormData.subtitle || editFormData.description || ''} 
          onChange={e => set('subheading', e.target.value)} 
          placeholder="Texto explicativo breve que complementa el titular..." 
        />
      </div>

      {/* Botón de Acción CTA con Selector Inteligente */}
      <div className="p-4 rounded-2xl bg-stone-50/70 border border-stone-200/80 space-y-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-primary block">
          Botón de Llamada a la Acción (CTA)
        </span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-[10px] font-bold text-stone-500 mb-1">Texto del Botón</label>
            <input 
              className={inputClass} 
              value={editFormData.cta_text || editFormData.button_text || ''} 
              onChange={e => set('cta_text', e.target.value)} 
              placeholder="Reservar cita" 
            />
          </div>

          <SmartLinkField
            label="Enlace de Destino"
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
    </div>
  );
}
