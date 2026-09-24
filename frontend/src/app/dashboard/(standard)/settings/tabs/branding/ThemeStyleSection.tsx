"use client";

import { Palette, Check, Moon, Sun, Info } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface ThemeStyleSectionProps {
  settings: any;
  setSettings: (settings: any) => void;
  updateSetting: (field: string, value: any) => void;
}

export const PREMIUM_FONTS_HEADINGS = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (Elegancia Suprema)' },
  { value: 'Playfair Display', label: 'Playfair Display (Lujo Clásico)' },
  { value: 'Inter', label: 'Inter (Modernidad SaaS)' },
  { value: 'Montserrat', label: 'Montserrat (Impacto e Identidad)' },
  { value: 'Outfit', label: 'Outfit (Minimalismo Sofisticado)' }
];

export const PREMIUM_FONTS_BODY = [
  { value: 'Inter', label: 'Inter (SaaS Limpio)' },
  { value: 'Outfit', label: 'Outfit (Geométrico Suave)' },
  { value: 'Montserrat', label: 'Montserrat (Corporativo Claro)' }
];

export default function ThemeStyleSection({
  settings,
  setSettings,
  updateSetting
}: ThemeStyleSectionProps) {
  const { t } = useLanguage();

  return (
    <div className="xl:col-span-12 bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm space-y-8 hover:shadow-md transition-all duration-300">
      
      <div className="flex items-center gap-3.5 border-b border-stone-100 pb-5">
        <span className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-700">
          <Palette size={18} strokeWidth={1.8} />
        </span>
        <div>
          <h4 className="text-base font-bold text-stone-900">
            {t('dashboard.branding.theme_style.title') || 'Estilo & Modos Visuales'}
          </h4>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
            {t('dashboard.branding.theme_style.subtitle') || 'Global Design Tokens'}
          </p>
        </div>
      </div>

      {/* 1. Paletas de Colores Preestablecidas (Grid de 5 columnas en desktop) */}
      <div className="space-y-4">
        <label className="text-xs font-black uppercase tracking-widest text-stone-500 block">
          {t('dashboard.branding.theme_style.palette_preset_title') || 'Paletas Cromáticas Core'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {[
            { id: 'dorado-antracita', name: 'Dorado / Antracita', primary: '#D4AF37', secondary: '#1C1917', desc: 'Lujo tradicional' },
            { id: 'esmeralda-lino', name: 'Esmeralda / Lino', primary: '#0F5132', secondary: '#F2EFE9', desc: 'Orgánico y spa' },
            { id: 'bronce-crema', name: 'Bronce / Crema', primary: '#A3704C', secondary: '#FAF6F0', desc: 'Cosmética y calma' },
            { id: 'minimalista-industrial', name: 'Minimalista Industrial', primary: '#2B2D42', secondary: '#8D99AE', desc: 'Barbería y medicina' },
            { id: 'custom', name: 'Personalizado', primary: '#D4AF37', secondary: '#1C1917', desc: 'Ajuste libre' }
          ].map(p => {
            const activePaletteId = settings.branding_palette_id || 'dorado-antracita';
            const active = activePaletteId === p.id;
            return (
              <button
                key={p.id}
                id={`branding-palette-btn-${p.id}`}
                type="button"
                onClick={() => {
                  if (p.id === 'custom') {
                    setSettings({
                      ...settings,
                      branding_palette_id: 'custom'
                    });
                  } else {
                    setSettings({
                      ...settings,
                      branding_palette_id: p.id,
                      accent_color: p.primary,
                      secondary_color: p.secondary
                    });
                  }
                }}
                className={`p-4 rounded-2xl border text-left transition-all duration-300 relative flex flex-col justify-between h-28 group/card ${
                  active 
                    ? 'border-[#d4af37] bg-amber-50/20 shadow-sm shadow-amber-200/20 ring-1 ring-[#d4af37]/30' 
                    : 'border-stone-200/70 hover:border-stone-300 bg-white hover:bg-stone-50/50'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-bold ${active ? 'text-stone-900 font-extrabold' : 'text-stone-700'}`}>
                    {p.name}
                  </span>
                  {active && <Check size={14} className="text-[#d4af37] shrink-0" />}
                </div>

                <div className="flex items-center gap-2 my-1">
                  <div 
                    className="w-5 h-5 rounded-full border border-stone-200 shadow-2xs" 
                    style={{ backgroundColor: p.primary }} 
                    title={`Primario: ${p.primary}`}
                  />
                  <div 
                    className="w-5 h-5 rounded-full border border-stone-200 shadow-2xs" 
                    style={{ backgroundColor: p.secondary }} 
                    title={`Secundario: ${p.secondary}`}
                  />
                </div>

                <span className="text-[10px] text-stone-400 font-semibold tracking-tight">{p.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selectores de Color Manuales (HEX) */}
      <div className="space-y-4 pt-2 border-t border-stone-100">
        <label className="text-xs font-black uppercase tracking-widest text-stone-500 block">
          {t('dashboard.branding.theme_style.palette_custom_title') || 'Personalización de Colores de Marca'}
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Color Primario / Acento */}
          <div className="p-4 bg-stone-50/60 rounded-2xl border border-stone-200/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: settings.accent_color || '#d4af37' }} />
                {t('dashboard.branding.theme_style.primary_color_label') || 'Color Primario (Acento / Botones)'}
              </span>
              <p className="text-[10px] text-stone-400 font-medium">Botones CTA, enlaces activos e iconos</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <input 
                id="branding-color-primary-input"
                type="color" 
                value={settings.accent_color || '#d4af37'} 
                onChange={e => {
                  updateSetting('accent_color', e.target.value);
                  updateSetting('branding_palette_id', 'custom');
                }}
                className="w-9 h-9 rounded-xl border border-stone-200 cursor-pointer p-0.5 bg-white shadow-2xs" 
              />
              <span className="font-mono text-xs font-bold text-stone-700 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200">
                {settings.accent_color || '#d4af37'}
              </span>
            </div>
          </div>

          {/* Color Secundario / Fondo */}
          <div className="p-4 bg-stone-50/60 rounded-2xl border border-stone-200/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: settings.secondary_color || '#1C1917' }} />
                {t('dashboard.branding.theme_style.secondary_color_label') || 'Color Secundario (Fondo / Superficies)'}
              </span>
              <p className="text-[10px] text-stone-400 font-medium">Banners, footers y contrastes de fondo</p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <input 
                id="branding-color-secondary-input"
                type="color" 
                value={settings.secondary_color || '#1C1917'} 
                onChange={e => {
                  updateSetting('secondary_color', e.target.value);
                  updateSetting('branding_palette_id', 'custom');
                }}
                className="w-9 h-9 rounded-xl border border-stone-200 cursor-pointer p-0.5 bg-white shadow-2xs" 
              />
              <span className="font-mono text-xs font-bold text-stone-700 bg-white px-2.5 py-1.5 rounded-lg border border-stone-200">
                {settings.secondary_color || '#1C1917'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tipografías Corporativas */}
      <div className="space-y-4 pt-2 border-t border-stone-100">
        <label className="text-xs font-black uppercase tracking-widest text-stone-500 block">
          {t('dashboard.branding.theme_style.fonts_title') || 'Tipografías Corporativas'}
        </label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Fuente de Títulos */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
              {t('dashboard.branding.theme_style.font_headings_label') || 'Fuente de Títulos y Encabezados'}
            </label>
            <select
              id="branding-font-headings-select"
              value={settings.branding_font_headings || 'Playfair Display'}
              onChange={e => updateSetting('branding_font_headings', e.target.value)}
              className="w-full text-xs font-bold bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all cursor-pointer font-serif"
            >
              {PREMIUM_FONTS_HEADINGS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Fuente del Cuerpo */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
              {t('dashboard.branding.theme_style.font_body_label') || 'Fuente de Cuerpo y Lectura'}
            </label>
            <select
              id="branding-font-body-select"
              value={settings.branding_font_body || 'Inter'}
              onChange={e => updateSetting('branding_font_body', e.target.value)}
              className="w-full text-xs font-bold bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all cursor-pointer font-sans"
            >
              {PREMIUM_FONTS_BODY.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Geometría de Bordes */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
          {t('dashboard.branding.theme_style.geometry_title') || 'Geometría de Bordes Global'}
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: 'recto', title: t('dashboard.branding.theme_style.geometry_sharp') || 'Recto', desc: 'Bordes nítidos a 0px' },
            { value: 'suave', title: t('dashboard.branding.theme_style.geometry_soft') || 'Suave / Ejecutivo', desc: 'Bordes pulidos a 12px' },
            { value: 'organico', title: t('dashboard.branding.theme_style.geometry_organic') || 'Orgánico / Redondo', desc: 'Bordes curvos o full' }
          ].map(item => {
            const active = (settings.border_radius || 'suave') === item.value;
            return (
              <button
                key={item.value}
                id={`branding-border-radius-btn-${item.value}`}
                type="button"
                onClick={() => updateSetting('border_radius', item.value)}
                className={`p-4 border rounded-2xl text-left transition-all relative flex flex-col justify-between h-22 ${
                  active 
                    ? 'border-[#d4af37] bg-amber-50/15 shadow-sm shadow-amber-200/20 ring-1 ring-[#d4af37]/30' 
                    : 'border-stone-200/80 hover:border-stone-300 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-xs font-bold leading-none ${active ? 'text-stone-900' : 'text-stone-700'}`}>{item.title}</span>
                  {active && <Check size={12} className="text-[#d4af37] shrink-0" />}
                </div>
                <span className="text-[10px] text-stone-400 font-semibold leading-tight">{item.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 5. Modo Oscuro Global */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
          {t('dashboard.branding.theme_style.dark_mode_title') || 'Modo de Interfaz Global'}
        </label>
        <div className="flex items-center justify-between p-4 md:p-5 bg-stone-50 rounded-2xl border border-stone-200/50">
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
              settings.dark_mode_enabled 
                ? 'bg-stone-900 border-stone-800 text-white shadow-inner' 
                : 'bg-white border-stone-200 text-[#d4af37] shadow-sm'
            }`}>
              {settings.dark_mode_enabled ? <Moon size={18} /> : <Sun size={18} />}
            </div>
            <div>
              <p className="text-xs md:text-sm font-bold text-stone-900">
                {settings.dark_mode_enabled 
                  ? (t('dashboard.branding.theme_style.dark_mode_active') || 'Modo Oscuro Activo')
                  : (t('dashboard.branding.theme_style.dark_mode_inactive') || 'Modo Claro Activo')
                }
              </p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">
                {t('dashboard.branding.theme_style.dark_mode_sub') || 'Inyección de clases CSS dark'}
              </p>
            </div>
          </div>
          
          <button
            id="branding-dark-mode-toggle"
            type="button"
            onClick={() => updateSetting('dark_mode_enabled', !settings.dark_mode_enabled)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              settings.dark_mode_enabled ? 'bg-[#d4af37]' : 'bg-stone-300'
            }`}
          >
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              settings.dark_mode_enabled ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Banner Informativo */}
      <div className="p-4 bg-amber-50/50 border border-amber-200/40 rounded-2xl flex items-start gap-3">
        <Info size={16} className="text-[#b08e23] shrink-0 mt-0.5" />
        <p className="text-xs text-stone-600 font-medium leading-relaxed">
          {t('dashboard.branding.theme_style.save_reminder') || 'Recuerda guardar los cambios: Para aplicar la calibración del logo, los márgenes y la nueva identidad visual permanentemente en tu web pública, pulsa en el botón "Guardar Cambios".'}
        </p>
      </div>

    </div>
  );
}
