import { SearchCode } from 'lucide-react';

interface AdvancedTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function AdvancedTab({ settings, setSettings }: AdvancedTabProps) {
  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <SearchCode size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Configuración Avanzada</h3>
        </div>
        
        <div className="space-y-6">
          <div className="p-6 bg-[#fcf8e5] rounded-[2rem] border border-[#f5efd5] flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400 shrink-0 shadow-sm">
              <SearchCode size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-800">Visibilidad en Buscadores</h4>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                Controla si tu página de tratamientos aparece en Google y otros motores de búsqueda. Desactivar esto añadirá la etiqueta <code>noindex</code> a tu sitio.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-4 cursor-pointer group p-6 bg-white rounded-[2rem] border border-stone-100 transition-all hover:bg-stone-50 shadow-sm">
            <div className="relative">
              <input 
                type="checkbox" 
                checked={settings.allow_search_engine_indexing} 
                onChange={e => setSettings({...settings, allow_search_engine_indexing: e.target.checked})} 
                className="sr-only" 
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${settings.allow_search_engine_indexing ? 'bg-[#d4af37]' : 'bg-stone-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.allow_search_engine_indexing ? 'translate-x-6' : ''} shadow-sm`}></div>
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold transition-colors ${settings.allow_search_engine_indexing ? 'text-stone-900' : 'text-stone-400'}`}>
                {settings.allow_search_engine_indexing ? 'Indexación Activada' : 'Indexación Desactivada'}
              </span>
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-0.5">Estado actual del rastreo</span>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
}
