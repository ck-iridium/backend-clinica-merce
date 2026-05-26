import { Sparkles, Building2, Palette, Type, ShieldAlert, Monitor, Check, Compass, Sliders, Moon, Sun, UploadCloud, Info, Trash2 } from 'lucide-react';
import { RefObject, useRef } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface BrandingTabProps {
  settings: any;
  setSettings: (settings: any) => void;
  logoAppRef: RefObject<HTMLInputElement>;
  handleImageUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PREMIUM_FONTS_HEADINGS = [
  { value: 'Cormorant Garamond', label: 'Cormorant Garamond (Elegancia Suprema)' },
  { value: 'Playfair Display', label: 'Playfair Display (Lujo Clásico)' },
  { value: 'Inter', label: 'Inter (Modernidad SaaS)' },
  { value: 'Montserrat', label: 'Montserrat (Impacto e Identidad)' },
  { value: 'Outfit', label: 'Outfit (Minimalismo Sofisticado)' }
];

const PREMIUM_FONTS_BODY = [
  { value: 'Inter', label: 'Inter (SaaS Limpio)' },
  { value: 'Outfit', label: 'Outfit (Geométrico Suave)' },
  { value: 'Montserrat', label: 'Montserrat (Corporativo Claro)' }
];

export default function BrandingTab({ 
  settings,
  setSettings,
  logoAppRef, 
  handleImageUpload 
}: BrandingTabProps) {
  const { t } = useLanguage();
  const faviconInputRef = useRef<HTMLInputElement>(null);

  const updateSetting = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in slide-in-from-bottom-2 duration-300 font-sans">
      
      {/* ── BANNER EXCLUSIVO DE BRANDING ── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-stone-900 via-stone-850 to-stone-950 text-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 border border-stone-850 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-gradient-to-br from-[#d4af37]/10 to-transparent blur-3xl" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-gradient-to-tr from-stone-800/25 to-transparent blur-2xl" />
        
        <div className="space-y-2.5 relative z-10 max-w-xl">
          <span className="inline-block bg-[#d4af37]/25 text-[#d4af37] text-[10px] font-black uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-full border border-[#d4af37]/35">
            Branding Deluxe
          </span>
          <h2 className="text-2xl md:text-3.5xl font-serif font-extrabold tracking-tight">
            Identidad Visual Premium
          </h2>
          <p className="text-stone-300 text-sm leading-relaxed font-medium">
            Define la personalidad estética de tu clínica. El color de acento, las tipografías seleccionadas, la geometría de los bordes y el modo oscuro se inyectan dinámicamente y con total aislamiento en la landing page pública y en tu dashboard.
          </p>
        </div>
        <div className="flex items-center gap-2.5 bg-stone-850/80 border border-stone-800 p-4 rounded-2xl relative z-10 shrink-0 self-stretch md:self-auto justify-center">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center border border-[#d4af37]/30">
            <Sparkles size={13} className="text-[#d4af37] animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest leading-none">Co-Piloto por Voz</p>
            <p className="text-xs text-[#d4af37] font-extrabold mt-1">Totalmente enlazado</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
        
        {/* ── COLUMNA IZQUIERDA (5 COLUMNAS): MULTIMEDIA & LOGOS ── */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          
          {/* Tarjeta del Logotipo */}
          <div className="bg-white rounded-3xl border border-stone-200/60 p-6 md:p-8 shadow-sm flex flex-col items-center gap-6 group hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 w-full border-b border-stone-100 pb-4">
              <span className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600">
                <Building2 size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-stone-800">Logotipo Principal</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Identidad Corporativa</p>
              </div>
            </div>
            
            <div className="w-full h-44 bg-stone-50 border border-stone-200/50 rounded-2xl flex items-center justify-center p-6 relative group/logo transition-transform group-hover:scale-[1.02] duration-500">
              {settings.logo_app_b64 ? (
                <>
                  <img src={settings.logo_app_b64} alt="App Logo" className="max-h-full max-w-full object-contain filter drop-shadow-sm" />
                  <button
                    type="button"
                    onClick={() => updateSetting('logo_app_b64', null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-stone-200/80 flex items-center justify-center text-stone-500 hover:text-red-650 hover:bg-red-50 hover:border-red-200 transition-all duration-300 active:scale-90"
                    title="Eliminar Logotipo"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <Building2 className="text-stone-200" size={60} />
              )}
            </div>
            
            <div className="text-center w-full">
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                Logotipo optimizado para pantallas, navbar superior y paneles laterales. Recomendado en formato PNG transparente y cuadrado/horizontal.
              </p>
            </div>
            
            <input type="file" accept="image/*" ref={logoAppRef} className="hidden" onChange={e => handleImageUpload('logo_app_b64', e)} />
            <button
              type="button"
              onClick={() => logoAppRef.current?.click()}
              className="text-xs font-black uppercase tracking-wider text-white bg-stone-900 px-8 py-3.5 rounded-xl hover:bg-[#d4af37] hover:text-stone-950 transition-all w-full shadow-lg hover:shadow-xl active:scale-95 duration-300"
            >
              Cambiar Logotipo
            </button>
          </div>

          {/* Tarjeta del Favicon */}
          <div className="bg-white rounded-3xl border border-stone-200/60 p-6 md:p-8 shadow-sm flex flex-col items-center gap-6 group hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 w-full border-b border-stone-100 pb-4">
              <span className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600">
                <Compass size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-stone-800">Icono de la Pestaña (Favicon)</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Browser Tab Icon</p>
              </div>
            </div>
            
            <div className="w-full h-32 bg-stone-50 border border-stone-200/50 rounded-2xl flex items-center justify-center p-6 relative group/favicon transition-transform group-hover:scale-[1.02] duration-500">
              {settings.favicon_b64 ? (
                <>
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 bg-white rounded-xl shadow border border-stone-150 flex items-center justify-center p-2">
                      <img src={settings.favicon_b64} alt="Favicon" className="max-h-full max-w-full object-contain" />
                    </div>
                    <span className="text-[9px] font-bold text-stone-400">Icono Actual</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateSetting('favicon_b64', null)}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-stone-200/80 flex items-center justify-center text-stone-500 hover:text-red-650 hover:bg-red-50 hover:border-red-200 transition-all duration-300 active:scale-90"
                    title="Eliminar Favicon"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-2 text-stone-300">
                  <Compass size={40} />
                  <span className="text-[9px] font-bold">Por Defecto</span>
                </div>
              )}
            </div>
            
            <div className="text-center w-full">
              <p className="text-xs text-stone-500 font-semibold leading-relaxed">
                El icono que se visualiza en la pestaña del navegador del cliente. Sube una imagen cuadrada idealmente en formato PNG o ICO.
              </p>
            </div>
            
            <input type="file" accept="image/*,.ico" ref={faviconInputRef} className="hidden" onChange={e => handleImageUpload('favicon_b64', e)} />
            <button
              type="button"
              onClick={() => faviconInputRef.current?.click()}
              className="text-xs font-black uppercase tracking-wider text-stone-800 bg-stone-50 border border-stone-200 px-8 py-3.5 rounded-xl hover:bg-stone-100 transition-all w-full active:scale-95 duration-300"
            >
              Cargar Favicon
            </button>
          </div>

        </div>

        {/* ── COLUMNA DERECHA (7 COLUMNAS): PERSONALIZACIÓN ESTÉTICA DELUXE ── */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          
          <div className="bg-white rounded-3xl border border-stone-200/60 p-6 md:p-8 shadow-sm space-y-6 md:space-y-8">
            
            <div className="flex items-center gap-3 border-b border-stone-100 pb-4">
              <span className="w-8 h-8 rounded-xl bg-stone-50 flex items-center justify-center text-stone-600">
                <Palette size={16} strokeWidth={1.8} />
              </span>
              <div>
                <h4 className="text-sm font-bold text-stone-800">Estilo & Modos Visuales</h4>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Control de Variables</p>
              </div>
            </div>

            {/* 1. Paletas de Colores Preestablecidas */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                Paletas Cromáticas Core (Lujo Silencioso)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { id: 'dorado-antracita', name: 'Dorado / Antracita', primary: '#D4AF37', secondary: '#1C1917', desc: 'Lujo silencioso tradicional' },
                  { id: 'esmeralda-lino', name: 'Esmeralda / Lino', primary: '#0F5132', secondary: '#F2EFE9', desc: 'Orgánico, spa y botánica' },
                  { id: 'bronce-crema', name: 'Bronce / Crema', primary: '#A3704C', secondary: '#FAF6F0', desc: 'Calidez, cosmética y calma' },
                  { id: 'minimalista-industrial', name: 'Minimalista Industrial', primary: '#2B2D42', secondary: '#8D99AE', desc: 'Barbería y medicina' },
                  { id: 'custom', name: 'Personalizado (Custom)', primary: '#D4AF37', secondary: '#1C1917', desc: 'Elige tus propios colores' }
                ].map(p => {
                  const activePaletteId = settings.branding_palette_id || 'dorado-antracita';
                  const active = activePaletteId === p.id;
                  return (
                    <button
                      key={p.id}
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
                            accent_color: p.primary // Backward compatibility sync
                          });
                        }
                      }}
                      className={`p-3.5 border rounded-2xl text-left transition-all relative flex flex-col justify-between min-h-[90px] ${
                        active 
                          ? 'border-[#d4af37] bg-amber-50/10 shadow-sm shadow-amber-100/10' 
                          : 'border-stone-200/80 hover:border-stone-300 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full mb-1">
                        <span className={`text-xs font-bold leading-none ${active ? 'text-stone-900' : 'text-stone-600'}`}>{p.name}</span>
                        {active && <Check size={12} className="text-[#d4af37] shrink-0" />}
                      </div>
                      
                      <p className="text-[10px] text-stone-400 font-semibold mb-2 line-clamp-1">{p.desc}</p>
                      
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
                        <span className="text-[9px] font-mono font-bold text-stone-500 uppercase">
                          {p.id === 'custom' 
                            ? `${settings.accent_color_primary || settings.accent_color || '#D4AF37'} / ${settings.accent_color_secondary || '#1C1917'}` 
                            : `${p.primary} / ${p.secondary}`
                          }
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Doble Selector de Colores Personalizados */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200/50">
                  <div className="relative shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-stone-200/60 shadow-inner flex items-center justify-center bg-white">
                    <input 
                      type="color" 
                      value={settings.accent_color_primary || settings.accent_color || '#D4AF37'} 
                      onChange={e => {
                        setSettings({
                          ...settings,
                          accent_color_primary: e.target.value,
                          accent_color: e.target.value, // Backward compatibility sync
                          branding_palette_id: 'custom' // Switch to custom automatically
                        });
                      }}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-stone-850 leading-tight">Acción Principal</p>
                    <p className="text-[9px] text-stone-400 leading-normal truncate">CTAs, Precios, Estados Activos</p>
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
                <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-2xl border border-stone-200/50">
                  <div className="relative shrink-0 w-10 h-10 rounded-xl overflow-hidden border border-stone-200/60 shadow-inner flex items-center justify-center bg-white">
                    <input 
                      type="color" 
                      value={settings.accent_color_secondary || '#1C1917'} 
                      onChange={e => {
                        setSettings({
                          ...settings,
                          accent_color_secondary: e.target.value,
                          branding_palette_id: 'custom' // Switch to custom automatically
                        });
                      }}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-stone-850 leading-tight">Acento Secundario</p>
                    <p className="text-[9px] text-stone-400 leading-normal truncate">⏱ Duración, Detalles, Contornos</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Selector de Tipografía */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fuente Encabezados */}
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                    Fuente de Encabezados
                  </label>
                  <select
                    value={settings.branding_font_headings || 'Playfair Display'}
                    onChange={e => updateSetting('branding_font_headings', e.target.value)}
                    className="w-full text-xs font-bold bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all cursor-pointer font-sans"
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
                    value={settings.branding_font_body || 'Inter'}
                    onChange={e => updateSetting('branding_font_body', e.target.value)}
                    className="w-full text-xs font-bold bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-[#d4af37]/50 focus:border-[#d4af37] transition-all cursor-pointer font-sans"
                  >
                    {PREMIUM_FONTS_BODY.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-[11px] text-stone-400 font-semibold leading-relaxed">
                Todas las fuentes se cargan bajo demanda desde los servidores de Google Fonts para garantizar un renderizado fluido y premium en dispositivos móviles y de escritorio.
              </p>
            </div>

            {/* 3. Geometría de Bordes */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                Geometría de Bordes Global
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'recto', title: 'Recto', desc: 'Bordes nítidos a 0px' },
                  { value: 'suave', title: 'Suave / Ejecutivo', desc: 'Bordes pulidos a 12px' },
                  { value: 'organico', title: 'Orgánico / Redondo', desc: 'Bordes curvos o full' }
                ].map(item => {
                  const active = (settings.border_radius || 'suave') === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => updateSetting('border_radius', item.value)}
                      className={`p-3.5 border rounded-2xl text-left transition-all relative flex flex-col justify-between h-20 ${
                        active 
                          ? 'border-[#d4af37] bg-amber-50/10 shadow-sm shadow-amber-100/10' 
                          : 'border-stone-200/80 hover:border-stone-300 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className={`text-[11px] font-bold leading-none ${active ? 'text-stone-900' : 'text-stone-600'}`}>{item.title}</span>
                        {active && <Check size={11} className="text-[#d4af37] shrink-0" />}
                      </div>
                      <span className="text-[9px] text-stone-400 font-semibold leading-tight">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Modo Oscuro Global */}
            <div className="space-y-3">
              <label className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-1.5">
                Modo de Interfaz Global
              </label>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200/50">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
                    settings.dark_mode_enabled 
                      ? 'bg-stone-900 border-stone-850 text-white' 
                      : 'bg-white border-stone-200 text-[#d4af37]'
                  }`}>
                    {settings.dark_mode_enabled ? <Moon size={16} /> : <Sun size={16} />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-850">
                      {settings.dark_mode_enabled ? 'Modo Oscuro Activo' : 'Modo Claro Activo'}
                    </p>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Tailwind Dark classes</p>
                  </div>
                </div>
                
                {/* Switch Toggle */}
                <button
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
            <div className="p-4 bg-amber-50/50 border border-amber-100/50 rounded-2xl flex items-start gap-3">
              <Info size={16} className="text-[#b08e23] shrink-0 mt-0.5" />
              <p className="text-xs text-stone-600 font-medium leading-relaxed">
                <strong className="text-stone-800">Recuerda guardar los cambios:</strong> Para aplicar la nueva identidad visual permanentemente en la base de datos y la web pública, haz clic en el botón de guardar en el menú flotante inferior o de la cabecera.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
