"use client";

import { ArrowLeft, ChevronRight } from 'lucide-react';
import ImageUploadBlock from '@/app/dashboard/(editor)/cms/components/ImageUploadBlock';

interface SaaSCMSSectorFormProps {
  editingSector: any;
  sectorFormData: {
    title: string;
    slug: string;
    badge_text: string;
    video_url: string;
    image_url: string;
    order_index: number;
  };
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChangeInput: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSetPickerTarget: (target: { field: 'video_url' | 'image_url' } | null) => void;
  onClearMedia: (field: 'video_url' | 'image_url') => void;
  onUploadMedia: (field: 'video_url' | 'image_url', url: string) => void;
  submitting: boolean;
}

export default function SaaSCMSSectorForm({
  editingSector,
  sectorFormData,
  onBack,
  onSubmit,
  onChangeInput,
  onSetPickerTarget,
  onClearMedia,
  onUploadMedia,
  submitting
}: SaaSCMSSectorFormProps) {
  return (
    <form onSubmit={onSubmit} className="p-6 space-y-5">
      <div className="flex items-center justify-between pb-3 border-b border-stone-100">
        <button 
          type="button"
          onClick={onBack}
          className="text-stone-400 hover:text-stone-950 text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver a la Lista</span>
        </button>
        <span className="text-[9px] font-black uppercase text-[#d4af37]">
          {editingSector ? 'Edición' : 'Creación'}
        </span>
      </div>

      <div className="space-y-4">
        
        {/* Visual Media Pickers */}
        <div className="space-y-4 p-4 bg-stone-50 rounded-2xl border border-stone-200/65">
          <ImageUploadBlock 
            label="Imagen Cobertura (Opcional)"
            value={sectorFormData.image_url} 
            onSelect={() => onSetPickerTarget({ field: 'image_url' })} 
            onClear={() => onClearMedia('image_url')} 
            onUpload={(url) => onUploadMedia('image_url', url)}
            accepts="image"
          />

          <ImageUploadBlock 
            label="Vídeo del Sector (Loop 9:16)"
            value={sectorFormData.video_url} 
            onSelect={() => onSetPickerTarget({ field: 'video_url' })} 
            onClear={() => onClearMedia('video_url')} 
            onUpload={(url) => onUploadMedia('video_url', url)}
            accepts="video"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Nombre del Sector (Título)</label>
          <input
            type="text"
            name="title"
            required
            placeholder="Ej. Dental Studio, Clínicas Estéticas"
            value={sectorFormData.title}
            onChange={onChangeInput}
            className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Slug Único</label>
            <input
              type="text"
              name="slug"
              required
              placeholder="ej-dentistas"
              value={sectorFormData.slug}
              onChange={onChangeInput}
              className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-mono font-bold text-stone-700"
            />
          </div>
          <div>
            <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Badge Superior</label>
            <input
              type="text"
              name="badge_text"
              placeholder="Ej. Odontología"
              value={sectorFormData.badge_text}
              onChange={onChangeInput}
              className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
            />
          </div>
        </div>

        <div>
          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Enlace de Vídeo Directo (Opcional)</label>
          <input
            type="url"
            name="video_url"
            placeholder="https://..."
            value={sectorFormData.video_url}
            onChange={onChangeInput}
            className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-750"
          />
        </div>

        <div>
          <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1.5">Índice Orden</label>
          <input
            type="number"
            name="order_index"
            min={0}
            value={sectorFormData.order_index}
            onChange={onChangeInput}
            className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-700"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-4 bg-stone-950 hover:bg-stone-900 text-white font-bold py-3.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1 active:scale-95 disabled:opacity-50 text-xs"
        >
          <span>{editingSector ? 'Guardar Cambios' : 'Crear Sector'}</span>
          <ChevronRight size={14} />
        </button>
      </div>
    </form>
  );
}
