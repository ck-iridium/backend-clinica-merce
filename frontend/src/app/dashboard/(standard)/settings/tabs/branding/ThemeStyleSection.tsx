"use client";

import { Palette, Check, Moon, Sun, Info } from 'lucide-react';

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
  return (
    <div className="xl:col-span-12 bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm space-y-8 hover:shadow-md transition-all duration-300">
      
      <div className="flex items-center gap-3.5 border-b border-stone-100 pb-5">
        <span className="w-10 h-10 rounded-2xl bg-stone-50 border border-stone-200/50 flex items-center justify-center text-stone-700">
          <Palette size={18} strokeWidth={1.8} />
        </span>
        <div>
          <h4 className="text-base font-bold text-stone-900">Estilo & Modos Visuales</h4>
          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Paletas, Tipografía y Geometría Quiet Luxury</p>
        </div>
      </div>

      {/* 1. Paletas de Colores Preestablecidas (Grid de 5 columnas en desktop) */}
      <div className="space-y-4">
        <label className="text-xs font-black uppercase tracking-widest text-stone-500 block">
          Paletas Cromáticas Core (Lujo Silencioso)
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
                      accent_color_primary: p.primary,
                      accent_color_secondary: p.secondary,
                      accent_color: p.primary
                    });
                  }
                }}
                className={`p-4 border rounded-2xl text-left transition-all relative flex flex-col justify-between min-h-[105px] ${
                  active 
                    ? 'border-[#d4af37] bg-amber-50/15 shadow-sm shadow-amber-200/20 ring-1 ring-[#d4af37]/30' 
                    : 'border-stone-200/80 hover:border-stone-300 bg-white hover:bg-stone-50'
                }`}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className={`text-xs font-bold leading-none ${active ? 'text-stone-900' : 'text-stone-700'}`}>{p.name}</span>
                  {active && <Check size={13} className="text-[#d4af37] shrink-0" />}
                </div>
                
                <p className="text-[10px] text-stone-400 font-semibold mb-2">{p.desc}</p>
                
                <div className="flex items-center gap-2">
                  <div className="flex items-center -space-x-1.5">
                    <div 
                      className="w-4 h-4 rounded-full border border-white shadow-sm" 
                      style={{ backgroundColor: p.id === 'custom' ? (settings.accent_color_primary || settings.accent_color || '#D4AF37') : p.primary }}
                    />
                    <div 
                      className="w-4 h-4 rounded-full border border-white shadow-sm" 
                      style={{ backgroundColor: p.id === 'custom' ? (settings.accent_color_secondary || '#1C1917') : p.secondary }}
                    />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-stone-500 uppercase truncate">
                    {p.id === 'custom' 
                      ? `${settings.accent_color_primary || settings.accent_color || '#D4AF37'}` 
                      : `${p.primary}`
                    }
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Selectores de Color Acento Primario & Secundario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Color Primario */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500">
              Color Acento Primario
            </label>
            <span className="text-xs font-mono font-bold text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
              {settings.accent_color_primary || settings.accent_color || '#D4AF37'}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/50">
            <div className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-stone-200/60 shadow-inner flex items-center justify-center bg-white">
              <input 
                id="branding-color-primary-input"
                type="color" 
                value={settings.accent_color_primary || settings.accent_color || '#D4AF37'} 
                onChange={e => {
                  setSettings({
                    ...settings,
                    accent_color_primary: e.target.value,
                    accent_color: e.target.value,
                    branding_palette_id: 'custom'
                  });
                }}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-stone-850 leading-tight">Acción Principal</p>
              <p className="text-[10px] text-stone-400 leading-normal truncate">CTAs, Precios, Estados Activos</p>
            </div>
          </div>
        </div>

        {/* Color Secundario */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500">
              Color Acento Secundario
            </label>
            <span className="text-xs font-mono font-bold text-stone-600 bg-stone-50 px-2 py-0.5 rounded border border-stone-200/60">
              {settings.accent_color_secondary || '#1C1917'}
            </span>
          </div>
          <div className="flex items-center gap-3 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/50">
            <div className="relative shrink-0 w-11 h-11 rounded-xl overflow-hidden border border-stone-200/60 shadow-inner flex items-center justify-center bg-white">
              <input 
                id="branding-color-secondary-input"
                type="color" 
                value={settings.accent_color_secondary || '#1C1917'} 
                onChange={e => {
                  setSettings({
                    ...settings,
                    accent_color_secondary: e.target.value,
                    branding_palette_id: 'custom'
                  });
                }}
                className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-stone-850 leading-tight">Acento Secundario</p>
              <p className="text-[10px] text-stone-400 leading-normal truncate">⏱ Duración, Detalles, Contornos</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Selector de Tipografía */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Fuente Encabezados */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
              Fuente de Encabezados
            </label>
            <select
              id="branding-font-headings-select"
              value={settings.branding_font_headings || 'Playfair Display'}
              onChange={e => updateSetting('branding_font_headings', e.target.value)}
              className="w-full text-xs font-bold bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all cursor-pointer font-sans"
            >
              {PREMIUM_FONTS_HEADINGS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>

          {/* Fuente del Cuerpo */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
              Fuente del Cuerpo (UI)
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
        <p className="text-[11px] text-stone-400 font-semibold leading-relaxed">
          Las fuentes se cargan automáticamente desde los servidores de Google Fonts para garantizar un renderizado nítido y consistente.
        </p>
      </div>

      {/* 4. Geometría de Bordes */}
      <div className="space-y-3">
        <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
          Geometría de Bordes Global
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: 'recto', title: 'Recto', desc: 'Bordes nítidos a 0px' },
            { value: 'suave', title: 'Suave / Ejecutivo', desc: 'Bordes pulidos a 12px' },
            { value: 'organico', title: 'Orgánico / Redondo', desc: 'Bordes curvos o full' }
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
          Modo de Interfaz Global
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
                {settings.dark_mode_enabled ? 'Modo Oscuro Activo' : 'Modo Claro Activo'}
              </p>
              <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Inyección de clases CSS dark</p>
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
          <strong className="text-stone-800">Recuerda guardar los cambios:</strong> Para aplicar la calibración del logo, los márgenes y la nueva identidad visual permanentemente en tu web pública, pulsa en el botón <strong className="text-stone-900">"Guardar Cambios"</strong> en el lateral o en la barra inferior.
        </p>
      </div>

    </div>
  );
}
