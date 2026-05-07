import { Sparkles, Building2 } from 'lucide-react';
import { RefObject } from 'react';

interface BrandingTabProps {
  settings: any;
  logoAppRef: RefObject<HTMLInputElement>;
  handleImageUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BrandingTab({ 
  settings, 
  logoAppRef, 
  handleImageUpload 
}: BrandingTabProps) {
  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <Sparkles size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Identidad Visual App</h3>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
          <div className="border border-stone-200 rounded-[2rem] p-5 md:p-8 bg-stone-50/50 flex flex-col items-center gap-6 transition-all hover:bg-stone-50 group">
            <div className="w-32 h-32 bg-white shadow-xl shadow-stone-200/50 border border-stone-100 rounded-3xl md:rounded-[2.5rem] flex items-center justify-center p-6 transition-transform group-hover:scale-105 duration-500">
                {settings.logo_app_b64 ? <img src={settings.logo_app_b64} alt="App Logo" className="max-h-full object-contain" /> : <Building2 className="text-stone-200" size={48} />}
            </div>
            <div className="text-center">
              <p className="text-lg font-serif font-bold text-stone-800">Logo del Panel</p>
              <p className="text-sm text-stone-400 mt-1 max-w-[200px]">Este es el icono que verás en la barra de navegación principal.</p>
            </div>
            <input type="file" accept="image/*" ref={logoAppRef} className="hidden" onChange={e => handleImageUpload('logo_app_b64', e)} />
            <button type="button" onClick={() => logoAppRef.current?.click()} className="text-sm font-bold text-white bg-stone-900 px-8 py-3 rounded-xl hover:bg-stone-800 transition-all w-full shadow-lg shadow-stone-200">
              Cargar Nuevo Logo
            </button>
          </div>

          <div className="space-y-6">
            <div className="p-6 border-2 border-dashed border-stone-100 rounded-[2rem] bg-white flex flex-col items-center text-center justify-center h-full opacity-60">
              <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4">
                <Sparkles size={24} />
              </div>
              <h4 className="text-base font-serif font-bold text-stone-500">Temas Personalizados</h4>
              <p className="text-xs text-stone-400 max-w-[200px] mt-2">Próximamente podrás cambiar el color principal y la tipografía de todo el panel.</p>
              <div className="flex gap-2 mt-4">
                <div className="w-6 h-6 rounded-full bg-stone-100"></div>
                <div className="w-6 h-6 rounded-full bg-stone-100"></div>
                <div className="w-6 h-6 rounded-full bg-stone-100"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
