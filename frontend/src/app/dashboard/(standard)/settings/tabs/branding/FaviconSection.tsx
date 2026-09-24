"use client";

import { useRef } from 'react';
import { Compass, Trash2 } from 'lucide-react';

interface FaviconSectionProps {
  settings: any;
  updateSetting: (field: string, value: any) => void;
  handleImageUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FaviconSection({
  settings,
  updateSetting,
  handleImageUpload
}: FaviconSectionProps) {
  const faviconInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="xl:col-span-12 bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm space-y-6 hover:shadow-md transition-all duration-300">
      
      <div className="flex items-center gap-3 w-full border-b border-stone-100 pb-4">
        <span className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-700">
          <Compass size={18} strokeWidth={1.8} />
        </span>
        <div>
          <h4 className="text-base font-bold text-stone-900">Icono de la Pestaña (Favicon)</h4>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Browser Tab Icon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        
        <div className="md:col-span-4 h-32 bg-stone-50 border border-stone-200/50 rounded-2xl flex items-center justify-center p-6 relative group/favicon transition-transform duration-300">
          {settings.favicon_b64 ? (
            <>
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-14 bg-white rounded-2xl shadow-sm border border-stone-200 flex items-center justify-center p-2.5">
                  <img src={settings.favicon_b64} alt="Favicon" className="max-h-full max-w-full object-contain" />
                </div>
                <span className="text-[10px] font-bold text-stone-400">Favicon Activo</span>
              </div>
              <button
                id="branding-favicon-delete-btn"
                type="button"
                onClick={() => updateSetting('favicon_b64', null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-stone-200/80 flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-300 active:scale-90"
                title="Eliminar Favicon"
              >
                <Trash2 size={14} />
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-stone-300">
              <Compass size={40} />
              <span className="text-[10px] font-bold text-stone-400">Por Defecto</span>
            </div>
          )}
        </div>

        <div className="md:col-span-8 space-y-3">
          <p className="text-xs text-stone-600 font-medium leading-relaxed">
            Este icono se visualiza en la pestaña del navegador, marcadores y accesos directos de tus clientes. Sube una imagen cuadrada nítida en formato PNG o ICO.
          </p>
          
          <input 
            id="branding-favicon-file-input" 
            type="file" 
            accept="image/*,.ico" 
            ref={faviconInputRef} 
            className="hidden" 
            onChange={e => handleImageUpload('favicon_b64', e)} 
          />
          
          <button
            id="branding-favicon-load-btn"
            type="button"
            onClick={() => faviconInputRef.current?.click()}
            className="text-xs font-black uppercase tracking-wider text-stone-800 bg-stone-50 border border-stone-200 px-6 py-3 rounded-xl hover:bg-stone-100 transition-all active:scale-95 duration-300"
          >
            Cargar Favicon
          </button>
        </div>

      </div>

    </div>
  );
}
