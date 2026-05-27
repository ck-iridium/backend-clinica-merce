"use client";

import { ChevronRight, Image as ImageIcon, Trash2 } from 'lucide-react';

interface SaaSCMSHeroFormProps {
  heroTitle: string;
  heroSubtitle: string;
  heroImage1: string | null;
  heroImage2: string | null;
  heroImage3: string | null;
  onChangeTitle: (val: string) => void;
  onChangeSubtitle: (val: string) => void;
  onSelectImage: (index: 1 | 2 | 3) => void;
  onClearImage: (index: 1 | 2 | 3) => void;
  onSubmit: (e: React.FormEvent) => void;
  saving: boolean;
}

export default function SaaSCMSHeroForm({
  heroTitle,
  heroSubtitle,
  heroImage1,
  heroImage2,
  heroImage3,
  onChangeTitle,
  onChangeSubtitle,
  onSelectImage,
  onClearImage,
  onSubmit,
  saving
}: SaaSCMSHeroFormProps) {
  
  const renderImageSlot = (index: 1 | 2 | 3, heroImage: string | null) => {
    return (
      <div key={index} className="bg-stone-50 border border-stone-200/80 rounded-xl p-3 flex items-center justify-between gap-3 transition-all hover:border-stone-300">
        <div className="flex items-center gap-3">
          {heroImage ? (
            <img 
              src={heroImage} 
              alt={`Imagen de Portada ${index}`} 
              className="w-12 h-12 rounded-lg object-cover border border-stone-200/60 shadow-sm" 
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-stone-100 border border-stone-200 border-dashed flex items-center justify-center text-stone-400">
              <ImageIcon className="w-5 h-5 text-stone-300" />
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold text-stone-750 block">Imagen Rotativa {index}</span>
            <span className="text-[9px] text-stone-450 block font-medium">
              {heroImage ? 'Asignada de la Galería' : 'No seleccionada'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectImage(index)}
            className="px-2.5 py-1.5 bg-white border border-stone-200 text-stone-700 text-[10px] font-bold rounded-lg hover:bg-stone-50 active:scale-95 transition-all shadow-sm"
          >
            {heroImage ? 'Cambiar' : 'Elegir'}
          </button>
          {heroImage && (
            <button
              type="button"
              onClick={() => onClearImage(index)}
              className="p-1.5 bg-red-50 hover:bg-red-100/80 text-red-650 rounded-lg active:scale-95 transition-all"
              title="Eliminar imagen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div>
        <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">
          Título Principal (Hero Title)
        </label>
        <input
          type="text"
          required
          value={heroTitle}
          onChange={(e) => onChangeTitle(e.target.value)}
          className="w-full px-4 py-3 bg-stone-50 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-semibold text-stone-800"
          placeholder="Ej. La elegancia de tu negocio..."
        />
      </div>

      <div>
        <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-2">
          Subtítulo Descriptivo (Hero Subtitle)
        </label>
        <textarea
          required
          rows={3}
          value={heroSubtitle}
          onChange={(e) => onChangeSubtitle(e.target.value)}
          className="w-full px-4 py-3 bg-stone-50 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37] transition-all text-xs font-medium text-stone-500 leading-relaxed"
          placeholder="Describe los puntos fuertes..."
        />
      </div>

      <div className="space-y-3">
        <label className="block text-[9px] font-bold text-stone-400 uppercase tracking-wider">
          Imágenes Rotativas del Hero (Hasta 3)
        </label>
        <p className="text-[9px] text-stone-450 leading-relaxed font-medium -mt-1 mb-2">
          Las imágenes seleccionadas rotarán de manera fluida y elegante en la cabecera editorial de la página principal.
        </p>
        
        {renderImageSlot(1, heroImage1)}
        {renderImageSlot(2, heroImage2)}
        {renderImageSlot(3, heroImage3)}
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-stone-950 hover:bg-stone-900 text-white font-bold text-xs py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
        >
          <span>{saving ? 'Guardando...' : 'Guardar y Publicar'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
