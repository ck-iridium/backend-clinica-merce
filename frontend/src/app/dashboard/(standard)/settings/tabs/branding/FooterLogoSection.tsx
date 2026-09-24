"use client";

import { useRef } from 'react';
import { Layers, Check, Building2, Trash2, Info } from 'lucide-react';

interface FooterLogoSectionProps {
  settings: any;
  updateSetting: (field: string, value: any) => void;
  handleImageUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FooterLogoSection({
  settings,
  updateSetting,
  handleImageUpload
}: FooterLogoSectionProps) {
  const logoFooterRef = useRef<HTMLInputElement>(null);

  const footerLogoMode = settings.footer_logo_mode ?? 'white';
  const effectiveFooterLogo = settings.logo_footer_b64 || settings.logo_app_b64;

  return (
    <div className="xl:col-span-12 bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm space-y-6 hover:shadow-md transition-all duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-stone-900 flex items-center justify-center text-[#d4af37]">
            <Layers size={18} strokeWidth={1.8} />
          </span>
          <div>
            <h4 className="text-base font-bold text-stone-900">Logotipo del Pie de Página (Footer)</h4>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Logotipo exclusivo opcional y contraste sobre fondo oscuro</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {settings.logo_footer_b64 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[11px] font-bold text-amber-800">
              <Check size={12} className="text-[#d4af37]" />
              Logotipo exclusivo activo
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[11px] font-bold text-stone-600">
              Heredando de cabecera
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Visualizador simulado del pie de página */}
        <div className="lg:col-span-5 space-y-4">
          <div className="h-44 bg-[#121212] border border-stone-800 rounded-2xl flex flex-col items-center justify-center p-6 relative group/footerlogo overflow-hidden">
            <span className="absolute top-3 left-4 text-[10px] uppercase font-bold tracking-widest text-stone-500">
              Simulación Fondo Footer
            </span>

            {effectiveFooterLogo ? (
              <div className="relative group/box flex items-center justify-center w-full h-full pt-4">
                <img 
                  src={effectiveFooterLogo} 
                  alt="Footer Logo" 
                  className={`max-h-16 max-w-[240px] object-contain transition-all duration-200 ${
                    footerLogoMode === 'white' 
                      ? 'brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.12)]' 
                      : 'drop-shadow-sm'
                  }`}
                />
                {settings.logo_footer_b64 && (
                  <button
                    type="button"
                    onClick={() => updateSetting('logo_footer_b64', null)}
                    className="absolute top-0 right-0 w-8 h-8 rounded-full bg-stone-800 text-stone-400 hover:text-red-400 hover:bg-stone-700 flex items-center justify-center transition-all shadow-md active:scale-95"
                    title="Eliminar Logotipo del Footer (volver al de cabecera)"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-stone-600">
                <Building2 size={40} />
                <span className="text-xs font-bold text-stone-500">Sin logotipo</span>
              </div>
            )}
          </div>

          <input 
            id="branding-footer-logo-file-input" 
            type="file" 
            accept="image/*" 
            ref={logoFooterRef} 
            className="hidden" 
            onChange={e => handleImageUpload('logo_footer_b64', e)} 
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => logoFooterRef.current?.click()}
              className="text-xs font-black uppercase tracking-wider text-white bg-stone-900 px-5 py-3 rounded-xl hover:bg-[#d4af37] hover:text-stone-950 transition-all flex-1 shadow-md hover:shadow-lg active:scale-95 duration-300"
            >
              {settings.logo_footer_b64 ? 'Cambiar Logotipo del Footer' : 'Subir Logotipo Exclusivo'}
            </button>
            {settings.logo_footer_b64 && (
              <button
                type="button"
                onClick={() => updateSetting('logo_footer_b64', null)}
                className="text-xs font-bold text-stone-600 bg-stone-100 hover:bg-red-50 hover:text-red-600 px-4 py-3 rounded-xl transition-all active:scale-95"
                title="Volver a usar el de la cabecera"
              >
                Usar Cabecera
              </button>
            )}
          </div>
        </div>

        {/* Configuración y modo Dark/Light */}
        <div className="lg:col-span-7 space-y-5">
          <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200/60 space-y-4">
            <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Modo de Color en el Pie de Página (Dark / Light)
            </span>
            <p className="text-xs text-stone-500 leading-relaxed">
              Dado que el pie de página de la clínica cuenta con un elegante fondo antracita oscuro, puedes forzar la conversión del logotipo a blanco puro o mantener sus colores originales.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => updateSetting('footer_logo_mode', 'white')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  footerLogoMode === 'white'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-stone-900 font-bold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black">Blanco Puro (Invertido)</span>
                  {footerLogoMode === 'white' && (
                    <Check size={14} className="text-[#d4af37]" />
                  )}
                </div>
                <span className="text-[11px] text-stone-500 block leading-tight font-normal">
                  Recomendado. Convierte logotipos negros u oscuros a blanco nítido para máxima legibilidad.
                </span>
              </button>

              <button
                type="button"
                onClick={() => updateSetting('footer_logo_mode', 'original')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  footerLogoMode === 'original'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-stone-900 font-bold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-black">Color Original</span>
                  {footerLogoMode === 'original' && (
                    <Check size={14} className="text-[#d4af37]" />
                  )}
                </div>
                <span className="text-[11px] text-stone-500 block leading-tight font-normal">
                  Muestra el archivo con sus colores nativos de marca sin aplicar filtros.
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 p-4 bg-amber-50/70 rounded-2xl border border-amber-200/50 text-xs text-amber-900 leading-relaxed">
            <Info size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
            <span>
              <strong>Comportamiento inteligente:</strong> Si no se sube un logotipo específico para el pie de página, el sistema usará automáticamente el de la cabecera. Es totalmente opcional.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
