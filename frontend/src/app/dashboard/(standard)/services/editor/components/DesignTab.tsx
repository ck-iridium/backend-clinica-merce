import { Image as ImageIcon, Pipette } from 'lucide-react';
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

interface DesignTabProps {
  formValues: ServiceFormData;
  register: UseFormRegister<ServiceFormData>;
  control: Control<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  setShowMediaPicker: (show: boolean) => void;
}

export default function DesignTab({ formValues, register, control, setValue, setShowMediaPicker }: DesignTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Imagen Principal</label>
        {formValues.image_url ? (
          <div className="relative group rounded-xl overflow-hidden border border-stone-200">
            <img src={formValues.image_url.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL}${formValues.image_url}` : formValues.image_url} alt="Cover" className="w-full h-40 object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button type="button" onClick={() => setShowMediaPicker(true)} className="px-3 py-1.5 bg-white text-stone-800 rounded-lg text-xs font-bold">Cambiar</button>
              <button type="button" onClick={() => setValue('image_url', '')} className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold">Quitar</button>
            </div>
          </div>
        ) : (
          <button type="button" onClick={() => setShowMediaPicker(true)} className="w-full py-8 border-2 border-dashed border-stone-200 rounded-xl flex flex-col items-center justify-center text-stone-400 hover:bg-stone-50 hover:border-[#d4af37] transition-all">
            <ImageIcon size={24} className="mb-2" />
            <span className="text-sm font-semibold">Seleccionar Imagen</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-stone-200 pt-6">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Estilo Cabecera</label>
          <Controller
            name="layout_preferences.headerStyle"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full h-[40px] rounded-lg border-stone-200 bg-white text-sm font-semibold shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="split">Dividida (Split)</SelectItem>
                  <SelectItem value="full">Fondo Completo (Full)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Alineación Imagen</label>
          <Controller
            name="layout_preferences.alignment"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full h-[40px] rounded-lg border-stone-200 bg-white text-sm font-semibold shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="right">Derecha</SelectItem>
                  <SelectItem value="left">Izquierda</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-2">Color de Acento</label>
          <div className="flex flex-wrap gap-2 items-center">
            <button 
              type="button" 
              onClick={() => setValue('layout_preferences.accentColor', '#d4af37', { shouldDirty: true })}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${formValues.layout_preferences.accentColor === '#d4af37' ? 'border-stone-400 scale-110 shadow-md' : 'border-stone-100 hover:scale-105'}`}
              style={{ backgroundColor: '#d4af37' }}
              title="Dorado Corporativo"
            />
            <div className="w-px h-6 bg-stone-200 mx-1" />
            <div className="relative group" title="Color Personalizado">
              <input 
                type="color" 
                value={formValues.layout_preferences.accentColor}
                onChange={(e) => setValue('layout_preferences.accentColor', e.target.value, { shouldDirty: true })}
                className="w-8 h-8 rounded-full cursor-pointer border-2 border-stone-100 overflow-hidden p-0 bg-transparent opacity-0 absolute inset-0 z-10"
              />
              <div 
                className="w-8 h-8 rounded-full border-2 border-stone-100 flex items-center justify-center bg-white shadow-sm"
                style={{ borderColor: formValues.layout_preferences.accentColor !== '#d4af37' ? formValues.layout_preferences.accentColor : '#e5e7eb' }}
              >
                <Pipette size={14} className="text-stone-400" />
              </div>
            </div>
            <span className="text-[10px] font-mono text-stone-400 uppercase">{formValues.layout_preferences.accentColor}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-100 rounded-xl">
        <input type="checkbox" {...register('is_featured')} className="w-5 h-5 accent-[#d4af37] rounded" />
        <div>
          <p className="text-sm font-bold text-yellow-800">Servicio Destacado</p>
          <p className="text-[10px] text-yellow-600 uppercase tracking-widest">Mostrar en slider principal</p>
        </div>
      </div>
    </div>
  );
}
