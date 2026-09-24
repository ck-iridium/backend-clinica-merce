"use client";

import { useRef, useState } from 'react';
import { 
  Smartphone, 
  Check, 
  Menu, 
  SlidersHorizontal, 
  Maximize2, 
  Sun, 
  Info 
} from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface MobileLogoSectionProps {
  settings: any;
  updateSetting: (field: string, value: any) => void;
  handleImageUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function MobileLogoSection({
  settings,
  updateSetting,
  handleImageUpload
}: MobileLogoSectionProps) {
  const { t } = useLanguage();
  const logoMobileRef = useRef<HTMLInputElement>(null);
  const [previewMobileDarkBg, setPreviewMobileDarkBg] = useState(false);

  const mobileLogoHeight = settings.mobile_logo_height ?? 36;
  const mobileLogoMode = settings.mobile_logo_mode || 'adaptive';
  const effectiveMobileLogo = settings.logo_mobile_b64 || settings.logo_app_b64;

  return (
    <div className="xl:col-span-12 bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm space-y-6 hover:shadow-md transition-all duration-300">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div className="flex items-center gap-3">
          <span className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-700">
            <Smartphone size={18} strokeWidth={1.8} />
          </span>
          <div>
            <h4 className="text-base font-bold text-stone-900">
              {t('dashboard.branding.mobile_logo.title') || 'Logotipo para Móvil (Header Mobile)'}
            </h4>
            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
              {t('dashboard.branding.mobile_logo.subtitle') || 'Isotipo o versión compacta para smartphones y tablets pequeñas'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {settings.logo_mobile_b64 ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-[11px] font-bold text-amber-800">
              <Check size={12} className="text-[#d4af37]" />
              {t('dashboard.branding.mobile_logo.current_logo') || 'Logotipo móvil exclusivo activo'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-[11px] font-bold text-stone-600">
              {t('dashboard.branding.mobile_logo.default_inherited') || 'Heredando de cabecera principal'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SUB-COLUMNA 1: PREVISUALIZADOR SMARTPHONE Y CARGA (5 COLS) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-4 bg-stone-100/70 border border-stone-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                <Smartphone size={13} className="text-[#d4af37]" />
                {t('dashboard.branding.mobile_logo.preview_title') || 'Simulación Cabecera Móvil'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  id="branding-mobile-preview-scroll-btn"
                  type="button"
                  onClick={() => setPreviewMobileDarkBg(false)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    !previewMobileDarkBg ? 'bg-white text-stone-900 shadow-2xs border border-stone-200' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  {t('dashboard.branding.mobile_logo.preview_light_btn') || 'Scroll'}
                </button>
                <button
                  id="branding-mobile-preview-portada-btn"
                  type="button"
                  onClick={() => setPreviewMobileDarkBg(true)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all ${
                    previewMobileDarkBg ? 'bg-stone-900 text-white shadow-2xs border border-stone-800' : 'text-stone-400 hover:text-stone-700'
                  }`}
                >
                  {t('dashboard.branding.mobile_logo.preview_dark_btn') || 'Portada'}
                </button>
              </div>
            </div>

            {/* Marco de barra móvil simulada */}
            <div className={`w-full rounded-xl border shadow-sm h-16 px-4 flex items-center justify-between overflow-hidden relative transition-colors duration-300 ${
              previewMobileDarkBg 
                ? 'bg-[#1c1917] border-stone-800' 
                : 'bg-white/95 border-stone-200/80'
            }`}>
              {effectiveMobileLogo ? (
                <img 
                  src={effectiveMobileLogo} 
                  alt="Mobile Preview" 
                  style={{
                    height: `${mobileLogoHeight}px`,
                    maxHeight: `${mobileLogoHeight}px`,
                  }}
                  className={`w-auto max-w-[150px] object-contain transition-all duration-150 ${
                    mobileLogoMode === 'white' || (mobileLogoMode === 'adaptive' && previewMobileDarkBg)
                      ? 'brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]'
                      : 'drop-shadow-sm'
                  }`}
                />
              ) : (
                <span className={`font-serif font-black text-sm tracking-tight ${previewMobileDarkBg ? 'text-white' : 'text-stone-900'}`}>
                  {settings.clinic_name || 'ESTÉTICA MERCÈ'}
                </span>
              )}

              {/* Icono de menú hamburguesa móvil simulado */}
              <div className={`p-1.5 rounded-lg border flex items-center justify-center ${
                previewMobileDarkBg 
                  ? 'border-stone-800 text-stone-300' 
                  : 'border-stone-200 text-stone-700 bg-stone-50'
              }`}>
                <Menu size={16} />
              </div>
            </div>
          </div>

          <input 
            id="branding-mobile-logo-file-input" 
            type="file" 
            accept="image/*" 
            ref={logoMobileRef} 
            className="hidden" 
            onChange={e => handleImageUpload('logo_mobile_b64', e)} 
          />

          <div className="flex items-center gap-3">
            <button
              id="branding-mobile-logo-change-btn"
              type="button"
              onClick={() => logoMobileRef.current?.click()}
              className="text-xs font-black uppercase tracking-wider text-white bg-stone-900 px-5 py-3 rounded-xl hover:bg-[#d4af37] hover:text-stone-950 transition-all flex-1 shadow-md hover:shadow-lg active:scale-95 duration-300"
            >
              {settings.logo_mobile_b64 
                ? (t('dashboard.branding.mobile_logo.change_btn') || 'Cambiar Isotipo')
                : (t('dashboard.branding.mobile_logo.upload_btn') || 'Cargar Isotipo Móvil')
              }
            </button>
            {settings.logo_mobile_b64 && (
              <button
                id="branding-mobile-logo-delete-btn"
                type="button"
                onClick={() => updateSetting('logo_mobile_b64', null)}
                className="text-xs font-bold text-stone-600 bg-stone-100 hover:bg-red-50 hover:text-red-600 px-4 py-3 rounded-xl transition-all active:scale-95"
                title={t('dashboard.branding.mobile_logo.delete_btn') || 'Volver a heredar el logotipo principal de cabecera'}
              >
                {t('dashboard.branding.mobile_logo.delete_btn') || 'Usar Cabecera'}
              </button>
            )}
          </div>
        </div>

        {/* SUB-COLUMNA 2: CONTROLES DE CALIBRACIÓN MÓVIL (7 COLS) */}
        <div className="lg:col-span-7 space-y-5 bg-stone-50/70 border border-stone-200/60 rounded-2xl p-5 md:p-6">
          
          <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider border-b border-stone-200/60 pb-3">
            <SlidersHorizontal size={15} className="text-[#d4af37]" />
            <span>{t('dashboard.branding.mobile_logo.height_label') || 'Calibración Específica para Móvil'}</span>
          </div>

          {/* Control 1: Altura del Logo en Móvil */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <Maximize2 size={13} className="text-stone-400" />
                {t('dashboard.branding.mobile_logo.height_label') || 'Altura del Logotipo Móvil'}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-stone-400 text-[11px] font-medium">Recomendado: 32-40px</span>
                <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 text-xs">
                  {mobileLogoHeight}px
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="branding-mobile-logo-height-range"
                type="range"
                min="20"
                max="50"
                step="1"
                value={mobileLogoHeight}
                onChange={(e) => updateSetting('mobile_logo_height', parseInt(e.target.value))}
                className="w-full accent-[#d4af37] cursor-pointer"
              />
              <input
                id="branding-mobile-logo-height-number"
                type="number"
                min="20"
                max="50"
                value={mobileLogoHeight}
                onChange={(e) => updateSetting('mobile_logo_height', Math.max(18, Math.min(54, parseInt(e.target.value) || 20)))}
                className="w-16 px-2 py-1 text-xs font-mono font-bold border border-stone-200 rounded-lg text-center bg-white"
              />
            </div>
          </div>

          {/* Control 2: Modo de Color en Móvil (Dark / Light / Adaptativo) */}
          <div className="space-y-2 pt-2 border-t border-stone-200/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <Sun size={13} className="text-stone-400" />
                {t('dashboard.branding.mobile_logo.color_mode_label') || 'Modo de Color Móvil'}
              </span>
              <span className="text-stone-400 text-[11px] font-medium">
                {mobileLogoMode === 'white' 
                  ? (t('dashboard.branding.desktop_logo.mode_white') || 'Blanco Puro')
                  : mobileLogoMode === 'adaptive' 
                    ? (t('dashboard.branding.desktop_logo.mode_adaptive') || 'Adaptativo')
                    : (t('dashboard.branding.desktop_logo.mode_original') || 'Original')
                }
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                id="branding-mobile-logo-mode-original-btn"
                type="button"
                onClick={() => updateSetting('mobile_logo_mode', 'original')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs ${
                  mobileLogoMode === 'original'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-stone-900 font-bold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                {t('dashboard.branding.desktop_logo.mode_original') || 'Original'}
              </button>
              <button
                id="branding-mobile-logo-mode-white-btn"
                type="button"
                onClick={() => updateSetting('mobile_logo_mode', 'white')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs ${
                  mobileLogoMode === 'white'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-stone-900 font-bold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                {t('dashboard.branding.desktop_logo.mode_white') || 'Blanco Puro'}
              </button>
              <button
                id="branding-mobile-logo-mode-adaptive-btn"
                type="button"
                onClick={() => updateSetting('mobile_logo_mode', 'adaptive')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs ${
                  mobileLogoMode === 'adaptive'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-stone-900 font-bold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
                title={t('dashboard.branding.mobile_logo.mode_adaptive_info') || 'Blanco en portada transparente, Original al hacer scroll'}
              >
                {t('dashboard.branding.desktop_logo.mode_adaptive') || 'Adaptativo'}
              </button>
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              {t('dashboard.branding.mobile_logo.mode_adaptive_info') || 'Adaptativo muestra el isotipo en blanco nítido sobre la portada móvil y en color original durante el scroll.'}
            </p>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-amber-50/70 rounded-xl border border-amber-200/50 text-xs text-amber-900 leading-relaxed">
            <Info size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
            <span>
              {t('dashboard.branding.mobile_logo.quiet_luxury_tip') || 'Recomendación Quiet Luxury: En pantallas móviles de 360-400px de ancho, un isotipo o símbolo cuadrado/circular proporciona una jerarquía mucho más limpia junto al menú.'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
