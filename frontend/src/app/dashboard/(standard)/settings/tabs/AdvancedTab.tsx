import { useState } from 'react';
import { toast } from 'sonner';
import { SearchCode, Sparkles, Key, ChevronDown, AlertTriangle, Building, FileText, Database, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AdvancedTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function AdvancedTab({ settings, setSettings }: AdvancedTabProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      toast.info('Preparando la copia de datos de tu clínica...');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/backup/export`, {
        credentials: 'include'
      });
      if (!res.ok) {
        throw new Error('Error al obtener la copia de datos');
      }
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_clinica_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('Copia de datos descargada correctamente');
    } catch (e) {
      console.error(e);
      toast.error('No se pudo generar la copia de seguridad');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      
      {/* Sección Asistente IA */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200/80 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <Sparkles size={18} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-semibold text-stone-900">Asistente de Inteligencia Artificial</h3>
            <p className="text-xs text-stone-400 mt-0.5">Configura los modelos generativos para redactar contenido y SEO automáticamente</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Selector de Proveedor */}
          <div className="flex flex-col md:flex-row gap-4">
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${settings.ai_provider === 'gemini' ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm' : 'border-stone-200/80 bg-stone-50/60 hover:bg-stone-100/70'}`}>
              <input 
                id="advanced-provider-gemini-radio"
                type="radio" 
                name="ai_provider" 
                value="gemini" 
                checked={settings.ai_provider === 'gemini'} 
                onChange={() => setSettings({...settings, ai_provider: 'gemini'})} 
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${settings.ai_provider === 'gemini' ? 'border-[#D4AF37]' : 'border-stone-300'}`}>
                {settings.ai_provider === 'gemini' && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />}
              </div>
              <div>
                <span className="font-bold text-stone-900 block text-sm">Google Gemini</span>
                <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-bold">Recomendado</span>
              </div>
            </label>

            <label className={`flex-1 flex items-center gap-3 p-4 rounded-2xl border-2 transition-all cursor-pointer ${settings.ai_provider === 'openai' ? 'border-[#D4AF37] bg-[#D4AF37]/5 shadow-sm' : 'border-stone-200/80 bg-stone-50/60 hover:bg-stone-100/70'}`}>
              <input 
                id="advanced-provider-openai-radio"
                type="radio" 
                name="ai_provider" 
                value="openai" 
                checked={settings.ai_provider === 'openai'} 
                onChange={() => setSettings({...settings, ai_provider: 'openai'})} 
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${settings.ai_provider === 'openai' ? 'border-[#D4AF37]' : 'border-stone-300'}`}>
                {settings.ai_provider === 'openai' && <div className="w-2.5 h-2.5 rounded-full bg-[#D4AF37]" />}
              </div>
              <div>
                <span className="font-bold text-stone-900 block text-sm">OpenAI (ChatGPT)</span>
                <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Avanzado</span>
              </div>
            </label>
          </div>

          {/* Campos de API Key */}
          <div className="bg-stone-50/70 p-6 rounded-3xl border border-stone-200/80 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Key size={16} className="text-[#D4AF37]" />
              <h4 className="font-bold text-stone-700 text-xs uppercase tracking-widest">Clave de API</h4>
            </div>
            
            {settings.ai_provider === 'gemini' && (
              <div className="animate-in fade-in zoom-in-95 duration-200 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-1.5 block">API Key de Gemini</label>
                  <input 
                    id="advanced-gemini-api-key"
                    type="password" 
                    value={settings.gemini_api_key || ''} 
                    onChange={e => setSettings({...settings, gemini_api_key: e.target.value})} 
                    placeholder="AIzaSy..." 
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none transition-all font-mono text-sm shadow-2xs text-stone-850"
                  />
                  <p className="text-xs text-stone-400 mt-2 ml-1">Consigue tu API Key gratuita en <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline font-bold">Google AI Studio</a>.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Modelo de Texto</label>
                    <Select 
                      value={settings.gemini_model_text || 'gemini-2.5-flash'} 
                      onValueChange={val => setSettings({...settings, gemini_model_text: val})}
                    >
                      <SelectTrigger id="advanced-gemini-model-text-trigger" className="w-full h-12 bg-white border-stone-200 rounded-xl focus:ring-[#D4AF37]/30 font-semibold text-stone-800">
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-200 shadow-xl">
                        <SelectItem value="gemini-2.5-flash" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">Gemini 2.5 Flash</span>
                            <span className="text-[10px] text-stone-400 uppercase">Más barato y rápido</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gemini-3-flash" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">Gemini 3 Flash</span>
                            <span className="text-[10px] text-stone-400 uppercase">Estándar equilibrado</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gemini-3.1-pro" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">Gemini 3.1 Pro</span>
                            <span className="text-[10px] text-stone-400 uppercase">Máxima calidad de texto</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Modelo de Imagen</label>
                    <Select 
                      value={settings.gemini_model_image || 'gemini-3.1-flash-image-preview'} 
                      onValueChange={val => setSettings({...settings, gemini_model_image: val})}
                    >
                      <SelectTrigger id="advanced-gemini-model-image-trigger" className="w-full h-12 bg-white border-stone-200 rounded-xl focus:ring-[#D4AF37]/30 font-semibold text-stone-800">
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-200 shadow-xl">
                        <SelectItem value="gemini-3.1-flash-image-preview" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">Nano Banana 2 (3.1 Flash)</span>
                            <span className="text-[10px] text-[#D4AF37] font-bold uppercase">Recomendado (Image-to-Image)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="imagen-4.0-generate-001" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">Imagen 4.0 Standard</span>
                            <span className="text-[10px] text-stone-400 uppercase">Calidad clásica estable</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {settings.ai_provider === 'openai' && (
              <div className="animate-in fade-in zoom-in-95 duration-200 space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-2 block">API Key de OpenAI</label>
                  <input 
                    id="advanced-openai-api-key"
                    type="password" 
                    value={settings.openai_api_key || ''} 
                    onChange={e => setSettings({...settings, openai_api_key: e.target.value})} 
                    placeholder="sk-..." 
                    className="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30 outline-none transition-all font-mono text-sm shadow-2xs text-stone-850"
                  />
                  <p className="text-xs text-stone-400 mt-2 ml-1">Consigue tu API Key en la <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[#D4AF37] hover:underline font-bold">plataforma de OpenAI</a>.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Modelo de Texto</label>
                    <Select 
                      value={settings.openai_model_text || 'gpt-4o-mini'} 
                      onValueChange={val => setSettings({...settings, openai_model_text: val})}
                    >
                      <SelectTrigger id="advanced-openai-model-text-trigger" className="w-full h-12 bg-white border-stone-200 rounded-xl focus:ring-[#D4AF37]/30 font-semibold text-stone-800">
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-200 shadow-xl">
                        <SelectItem value="gpt-4o-mini" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">GPT-4o mini</span>
                            <span className="text-[10px] text-stone-400 uppercase">Más barato y potente</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gpt-4o" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">GPT-4o</span>
                            <span className="text-[10px] text-stone-400 uppercase">Máximo rendimiento</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Modelo de Imagen</label>
                    <Select 
                      value={settings.openai_model_image || 'dall-e-3'} 
                      onValueChange={val => setSettings({...settings, openai_model_image: val})}
                    >
                      <SelectTrigger id="advanced-openai-model-image-trigger" className="w-full h-12 bg-white border-stone-200 rounded-xl focus:ring-[#D4AF37]/30 font-semibold text-stone-800">
                        <SelectValue placeholder="Seleccionar modelo" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-stone-200 shadow-xl">
                        <SelectItem value="dall-e-3" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">
                          <div className="flex flex-col">
                            <span className="font-bold">DALL-E 3</span>
                            <span className="text-[10px] text-stone-400 uppercase">Calidad Standard (Ahorro)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sección Visibilidad SEO & Funcionalidades */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200/80 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <SearchCode size={18} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-semibold text-stone-900">Configuración Avanzada</h3>
            <p className="text-xs text-stone-400 mt-0.5">Controla la indexación de tu web y la activación de módulos específicos</p>
          </div>
        </div>
        
        <div className="space-y-6">
          {/* Fila Visibilidad */}
          <div className="p-6 bg-stone-50/70 rounded-3xl border border-stone-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-stone-500 shrink-0 shadow-sm border border-stone-200/50">
              <SearchCode size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-850">Visibilidad en Buscadores</h4>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                Controla si tu página de tratamientos aparece en Google y otros motores de búsqueda. Desactivar esto añadirá la etiqueta <code>noindex</code> a tu sitio.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-4 cursor-pointer group p-6 bg-white rounded-3xl border border-stone-200/80 transition-all hover:bg-stone-50/60 shadow-2xs">
            <div className="relative">
              <input 
                id="advanced-allow-indexing-checkbox"
                type="checkbox" 
                checked={settings.allow_search_engine_indexing} 
                onChange={e => setSettings({...settings, allow_search_engine_indexing: e.target.checked})} 
                className="sr-only" 
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${settings.allow_search_engine_indexing ? 'bg-[#D4AF37]' : 'bg-stone-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.allow_search_engine_indexing ? 'translate-x-6' : ''} shadow-sm`}></div>
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold transition-colors ${settings.allow_search_engine_indexing ? 'text-stone-900' : 'text-stone-400'}`}>
                {settings.allow_search_engine_indexing ? 'Indexación Activada' : 'Indexación Desactivada'}
              </span>
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-0.5">Estado actual del rastreo</span>
            </div>
          </label>

          {/* Campo Google Search Console */}
          <div className="p-6 bg-white rounded-3xl border border-stone-200/80 shadow-2xs space-y-3">
            <div>
              <label htmlFor="advanced-google-verification" className="block text-sm font-bold text-stone-850">
                Verificación de Google Search Console
              </label>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Pega aquí tu código de verificación (o la etiqueta HTML completa proporcionada por Google). ProBookia inyectará automáticamente la metaetiqueta en la cabecera <code>&lt;head&gt;</code> para verificar tu propiedad en 1 clic.
              </p>
            </div>
            <div className="relative">
              <input
                id="advanced-google-verification"
                type="text"
                value={settings.google_site_verification || ''}
                onChange={e => {
                  let val = e.target.value;
                  if (val.includes('content=')) {
                    const match = val.match(/content=["']([^"']+)["']/i);
                    if (match && match[1]) {
                      val = match[1];
                    }
                  }
                  setSettings({ ...settings, google_site_verification: val.trim() });
                }}
                placeholder="ej. dX8bQ7y1Z_AbCdEfGhIjKlMnOpQrStUvWxYz o etiqueta <meta name=...>"
                className="w-full px-4 py-3 rounded-xl bg-stone-50/70 border border-stone-200 text-stone-900 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37] transition-all"
              />
            </div>
          </div>

          {/* Fila Consentimientos */}
          <div className="p-6 bg-stone-50/70 rounded-3xl border border-stone-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-stone-500 shrink-0 shadow-sm border border-stone-200/50">
              <FileText size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-850">Módulo de Consentimientos Legales</h4>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                Habilita o deshabilita la firma de consentimiento informado para los tratamientos de los clientes. Si se desactiva, se ocultará la pestaña correspondiente en la ficha de cada cliente.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-4 cursor-pointer group p-6 bg-white rounded-3xl border border-stone-200/80 transition-all hover:bg-stone-50/60 shadow-2xs">
            <div className="relative">
              <input 
                id="advanced-enable-consents-checkbox"
                type="checkbox" 
                checked={settings.enable_consents ?? true} 
                onChange={e => setSettings({...settings, enable_consents: e.target.checked})} 
                className="sr-only" 
              />
              <div className={`block w-14 h-8 rounded-full transition-colors ${settings.enable_consents ?? true ? 'bg-[#D4AF37]' : 'bg-stone-200'}`}></div>
              <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${settings.enable_consents ?? true ? 'translate-x-6' : ''} shadow-sm`}></div>
            </div>
            <div className="flex flex-col">
              <span className={`text-sm font-bold transition-colors ${settings.enable_consents ?? true ? 'text-stone-900' : 'text-stone-400'}`}>
                {settings.enable_consents ?? true ? 'Módulo Activado' : 'Módulo Desactivado'}
              </span>
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider mt-0.5">Estado actual del módulo</span>
            </div>
          </label>
        </div>
      </div>

      {/* Sección Copia de Seguridad y Portabilidad RGPD */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-200/80 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-stone-100">
          <span className="w-10 h-10 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shadow-inner">
            <Database size={18} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-semibold text-stone-900">Copia de Seguridad y Portabilidad (RGPD)</h3>
            <span className="text-[10px] text-stone-400 uppercase tracking-widest font-semibold">Respaldo exclusivo de los datos de tu clínica</span>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-stone-50/70 rounded-3xl border border-stone-200/80 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-[#D4AF37] shrink-0 shadow-sm border border-stone-200/50">
              <ShieldCheck size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-stone-850">Descarga Completa de Información</h4>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                Descarga un archivo estructurado (.json) con todos los registros de tu clínica: pacientes, citas, servicios, bonos, facturación y ajustes. Esta funcionalidad garantiza el cumplimiento del <strong>derecho a la portabilidad de datos (Art. 20 RGPD)</strong> y te permite conservar un respaldo local en frío siempre que lo necesites.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-stone-200/80 shadow-2xs">
            <div>
              <span className="font-bold text-stone-850 block text-sm">Exportación Segura de la Clínica</span>
              <span className="text-xs text-stone-400 font-medium">Tus datos en Supabase se respaldan de manera continua y cifrada en la nube.</span>
            </div>

            <Button
              type="button"
              id="advanced-export-data-btn"
              variant="luxury"
              onClick={handleExportData}
              disabled={isExporting}
              className="w-full sm:w-auto px-6 py-5 rounded-2xl font-bold text-xs shadow-luxury text-stone-950 flex items-center justify-center gap-2"
            >
              <Download size={16} className={isExporting ? 'animate-bounce text-stone-950' : ''} />
              {isExporting ? 'Generando Archivo...' : 'Descargar Copia (.json)'}
            </Button>
          </div>
        </div>
      </div>

      {/* Danger Zone: Sector del Negocio */}
      <div className="bg-rose-50/20 rounded-3xl md:rounded-[2.5rem] border border-rose-200/50 p-5 md:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4 md:mb-6 pb-3 md:pb-4 border-b border-rose-100">
          <span className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 border border-rose-100">
            <AlertTriangle size={18} strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-semibold text-rose-900">Zona de Peligro (Configuración Crítica)</h3>
            <p className="text-xs text-rose-400 mt-0.5">Ajustes que reconfiguran el modelo de datos de la aplicación</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-white rounded-3xl border border-rose-150/60 flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0 shadow-sm">
              <Building size={20} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-rose-900">Sector o Vertical del Negocio</h4>
              <p className="text-sm text-stone-500 mt-1 leading-relaxed">
                Cambiar el sector modificará de forma radical la estructura del CRM, los campos de las fichas de tus clientes y las vistas del dashboard. Los datos anteriores se guardan pero no serán visibles a menos que regreses al sector correspondiente.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div>
              <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest ml-1 mb-2 block">Sector Actual</label>
              <Select 
                value={settings.business_sector || 'general'} 
                onValueChange={(val) => setSettings({ ...settings, business_sector: val })}
              >
                <SelectTrigger id="advanced-business-sector-trigger" className="w-full h-12 bg-white border-rose-200/60 rounded-xl focus:ring-rose-200/30 font-semibold text-stone-850">
                  <SelectValue placeholder="Seleccionar sector" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-stone-200 shadow-xl">
                  <SelectItem value="clinical" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">Medicina / Clínica de Salud</SelectItem>
                  <SelectItem value="beauty" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">Estética y Bienestar</SelectItem>
                  <SelectItem value="barber" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">Salones y Barberías</SelectItem>
                  <SelectItem value="veterinary" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">Veterinaria</SelectItem>
                  <SelectItem value="automotive" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">Automoción y Mecánica</SelectItem>
                  <SelectItem value="home_services" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">Servicios a Domicilio</SelectItem>
                  <SelectItem value="professional" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">Servicios Profesionales / Asesoría</SelectItem>
                  <SelectItem value="general" className="focus:bg-stone-50 focus:text-stone-900 rounded-lg py-3">Comercio General / Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="text-xs text-rose-600 font-medium bg-white/70 border border-rose-200/60 p-4 rounded-2xl">
              Nota: La confirmación del cambio se te solicitará con confirmación de seguridad al pulsar en el botón global <strong>&quot;Guardar Cambios&quot;</strong>.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
