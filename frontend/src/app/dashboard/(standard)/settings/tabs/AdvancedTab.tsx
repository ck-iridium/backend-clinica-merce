import { SearchCode, Sparkles, Key } from 'lucide-react';

interface AdvancedTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function AdvancedTab({ settings, setSettings }: AdvancedTabProps) {
  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      
      {/* Sección Asistente IA */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-9 h-9 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-500">
            <Sparkles size={18} strokeWidth={1.5} />
          </span>
          <h3 className="text-2xl font-serif font-semibold text-stone-800">Asistente de Inteligencia Artificial</h3>
        </div>
        
        <div className="space-y-6">
          <p className="text-sm text-stone-500 leading-relaxed px-2">
            Configura los modelos generativos para redactar contenido y SEO automáticamente.
          </p>

          {/* Selector de Proveedor */}
          <div className="flex flex-col md:flex-row gap-4">
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${settings.ai_provider === 'gemini' ? 'border-[#d4af37] bg-yellow-50/30' : 'border-stone-100 bg-stone-50 hover:bg-stone-100'}`}>
              <input 
                type="radio" 
                name="ai_provider" 
                value="gemini" 
                checked={settings.ai_provider === 'gemini'} 
                onChange={() => setSettings({...settings, ai_provider: 'gemini'})} 
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${settings.ai_provider === 'gemini' ? 'border-[#d4af37]' : 'border-stone-300'}`}>
                {settings.ai_provider === 'gemini' && <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />}
              </div>
              <div>
                <span className="font-bold text-stone-800 block text-sm">Google Gemini</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Recomendado</span>
              </div>
            </label>

            <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${settings.ai_provider === 'openai' ? 'border-[#d4af37] bg-yellow-50/30' : 'border-stone-100 bg-stone-50 hover:bg-stone-100'}`}>
              <input 
                type="radio" 
                name="ai_provider" 
                value="openai" 
                checked={settings.ai_provider === 'openai'} 
                onChange={() => setSettings({...settings, ai_provider: 'openai'})} 
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${settings.ai_provider === 'openai' ? 'border-[#d4af37]' : 'border-stone-300'}`}>
                {settings.ai_provider === 'openai' && <div className="w-2.5 h-2.5 rounded-full bg-[#d4af37]" />}
              </div>
              <div>
                <span className="font-bold text-stone-800 block text-sm">OpenAI (ChatGPT)</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Avanzado</span>
              </div>
            </label>
          </div>

          {/* Campos de API Key */}
          <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Key size={16} className="text-stone-400" />
              <h4 className="font-bold text-stone-700 text-sm uppercase tracking-widest">Clave de API</h4>
            </div>
            
            {settings.ai_provider === 'gemini' && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <input 
                  type="password" 
                  value={settings.gemini_api_key || ''} 
                  onChange={e => setSettings({...settings, gemini_api_key: e.target.value})} 
                  placeholder="AIzaSy..." 
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all font-mono text-sm shadow-sm"
                />
                <p className="text-xs text-stone-400 mt-2 ml-1">Consigue tu API Key gratuita en <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline font-bold">Google AI Studio</a>.</p>
              </div>
            )}

            {settings.ai_provider === 'openai' && (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <input 
                  type="password" 
                  value={settings.openai_api_key || ''} 
                  onChange={e => setSettings({...settings, openai_api_key: e.target.value})} 
                  placeholder="sk-..." 
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20 outline-none transition-all font-mono text-sm shadow-sm"
                />
                <p className="text-xs text-stone-400 mt-2 ml-1">Consigue tu API Key en la <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline font-bold">plataforma de OpenAI</a>.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección Visibilidad SEO */}
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
