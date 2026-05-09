import { useState } from 'react';
import { Image as ImageIcon, Pipette, Sparkles, Video, Trash2 } from 'lucide-react';
import { UseFormRegister, Control, UseFormSetValue } from 'react-hook-form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from 'react-hook-form';
import type { ServiceFormData } from '@/components/cms/ServiceEditor';
import AIImageGeneratorModal from '@/components/cms/AIImageGeneratorModal';

interface DesignTabProps {
  formValues: ServiceFormData;
  register: UseFormRegister<ServiceFormData>;
  control: Control<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  setMediaPickerSlot: (slot: 'image' | 'video' | null) => void;
}

export default function DesignTab({ formValues, register, control, setValue, setMediaPickerSlot }: DesignTabProps) {
  const [showAIImageModal, setShowAIImageModal] = useState(false);
  
  const getFullUrl = (url: string) => {
    if (!url) return '';
    return url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${url}` : url;
  };

  return (
    <div className="space-y-8">
      {/* SECCIÓN: IMAGEN PRINCIPAL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-[0.15em]">Imagen Principal</label>
          <button 
            type="button" 
            onClick={() => setShowAIImageModal(true)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#d4af37] hover:bg-yellow-50/50 px-2.5 py-1.5 rounded-lg border border-yellow-100 transition-all shadow-sm"
          >
            <Sparkles size={12} strokeWidth={2.5} />
            Generar con IA
          </button>
        </div>
        
        {formValues.image_url ? (
          <div className="relative group rounded-2xl overflow-hidden border border-stone-200 aspect-video shadow-sm">
            <img src={getFullUrl(formValues.image_url)} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button 
                type="button" 
                onClick={() => setMediaPickerSlot('image')} 
                className="px-4 py-2 bg-white text-stone-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-white transition-all shadow-xl active:scale-95"
              >
                Cambiar
              </button>
              <button 
                type="button" 
                onClick={() => setValue('image_url', '', { shouldDirty: true })} 
                className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-xl active:scale-95"
                title="Eliminar imagen"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => setMediaPickerSlot('image')} 
            className="w-full py-12 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-[#d4af37] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
              <ImageIcon size={24} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Seleccionar Imagen</span>
          </button>
        )}
      </div>

      {/* SECCIÓN: VÍDEO DE PORTADA (HOVER) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-[0.15em]">Vídeo de Portada (Hover)</label>
        </div>
        
        {formValues.video_url ? (
          <div className="relative group rounded-2xl overflow-hidden border border-stone-200 aspect-video shadow-sm bg-stone-100">
            <video 
              src={getFullUrl(formValues.video_url)} 
              className="w-full h-full object-cover"
              muted
              loop
              autoPlay
              playsInline
            />
            <div className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <button 
                type="button" 
                onClick={() => setMediaPickerSlot('video')} 
                className="px-4 py-2 bg-white text-stone-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d4af37] hover:text-white transition-all shadow-xl active:scale-95"
              >
                Cambiar Vídeo
              </button>
              <button 
                type="button" 
                onClick={() => setValue('video_url', '', { shouldDirty: true })} 
                className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-xl active:scale-95"
                title="Eliminar vídeo"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="absolute top-3 right-3 p-1.5 bg-black/40 backdrop-blur-md rounded-lg text-white">
              <Video size={14} />
            </div>
          </div>
        ) : (
          <button 
            type="button" 
            onClick={() => setMediaPickerSlot('video')} 
            className="w-full py-12 border-2 border-dashed border-stone-200 rounded-2xl flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-[#d4af37] transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center mb-3 group-hover:bg-white group-hover:shadow-md transition-all">
              <Video size={24} strokeWidth={1.5} />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest">Seleccionar Vídeo</span>
            <p className="text-[10px] mt-2 opacity-60">Se activará al hacer hover sobre la tarjeta</p>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-stone-200 pt-8">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-[0.15em] mb-3">Estilo Cabecera</label>
          <Controller
            name="layout_preferences.headerStyle"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full h-[45px] rounded-xl border-stone-200 bg-white text-sm font-semibold shadow-sm focus:ring-stone-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-xl border-stone-200">
                  <SelectItem value="split" className="text-sm py-2.5">Dividida (Split)</SelectItem>
                  <SelectItem value="full" className="text-sm py-2.5">Fondo Completo (Full)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-[0.15em] mb-4">Color de Acento</label>
          <div className="flex flex-wrap gap-3 items-center bg-white p-3 rounded-2xl border border-stone-100 shadow-sm">
            <button 
              type="button" 
              onClick={() => setValue('layout_preferences.accentColor', '#d4af37', { shouldDirty: true })}
              className={`w-9 h-9 rounded-full border-2 transition-all ${formValues.layout_preferences.accentColor === '#d4af37' ? 'border-stone-800 scale-110 shadow-lg' : 'border-transparent hover:scale-105 shadow-sm'}`}
              style={{ backgroundColor: '#d4af37' }}
              title="Dorado Corporativo"
            />
            <div className="w-px h-6 bg-stone-200 mx-1" />
            <div className="relative group" title="Color Personalizado">
              <input 
                type="color" 
                value={formValues.layout_preferences.accentColor}
                onChange={(e) => setValue('layout_preferences.accentColor', e.target.value, { shouldDirty: true })}
                className="w-9 h-9 rounded-full cursor-pointer border-2 border-stone-100 overflow-hidden p-0 bg-transparent opacity-0 absolute inset-0 z-10"
              />
              <div 
                className="w-9 h-9 rounded-full border-2 border-stone-200 flex items-center justify-center bg-white shadow-sm transition-all group-hover:shadow-md"
                style={{ borderColor: formValues.layout_preferences.accentColor !== '#d4af37' ? formValues.layout_preferences.accentColor : '#e5e7eb' }}
              >
                <Pipette size={14} className="text-stone-400" />
              </div>
            </div>
            <span className="text-[11px] font-mono text-stone-500 font-bold uppercase ml-1">{formValues.layout_preferences.accentColor}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 p-5 bg-stone-50 border border-stone-200 rounded-[2rem] shadow-sm">
        <div className="relative flex items-center justify-center">
          <input 
            type="checkbox" 
            {...register('is_featured')} 
            id="is_featured"
            className="peer w-6 h-6 accent-[#d4af37] rounded-lg opacity-0 absolute inset-0 cursor-pointer z-10" 
          />
          <div className="w-6 h-6 border-2 border-stone-200 rounded-lg bg-white peer-checked:bg-[#d4af37] peer-checked:border-[#d4af37] transition-all flex items-center justify-center text-white">
            <Sparkles size={12} fill="currentColor" />
          </div>
        </div>
        <label htmlFor="is_featured" className="cursor-pointer select-none">
          <p className="text-sm font-bold text-stone-800">Servicio Destacado</p>
          <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-0.5">Mostrar en slider principal</p>
        </label>
      </div>

      <AIImageGeneratorModal 
        open={showAIImageModal} 
        onClose={() => setShowAIImageModal(false)}
        serviceName={formValues.name}
        description={formValues.description}
        contentHtml={formValues.content_html}
        onGenerate={(url) => {
          setValue('image_url', url, { shouldDirty: true });
        }}
      />
    </div>
  );
}
