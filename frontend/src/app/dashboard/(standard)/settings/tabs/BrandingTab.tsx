import { 
  Sparkles, 
  Building2, 
  Palette, 
  Type, 
  Check, 
  Compass, 
  Sliders, 
  Moon, 
  Sun, 
  Info, 
  Trash2, 
  MoveVertical, 
  MoveHorizontal, 
  Maximize2, 
  RotateCcw,
  Eye,
  SlidersHorizontal
} from 'lucide-react';
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

  // Valores de calibración del header con fallbacks armónicos
  const logoHeight = settings.header_logo_height ?? 42;
  const logoOffsetY = settings.header_logo_padding_y ?? 0;
  const logoMarginRight = settings.header_logo_margin_right ?? 24;
  const logoMarginLeft = settings.header_logo_margin_left ?? 0;

  const resetHeaderLogoDefaults = () => {
    setSettings({
      ...settings,
      header_logo_height: 42,
      header_logo_padding_y: 0,
      header_logo_margin_right: 24,
      header_logo_margin_left: 0,
    });
  };

  return (
    <div className="space-y-8 md:space-y-10 animate-in slide-in-from-bottom-2 duration-300 font-sans w-full">
      
      {/* ── CABECERA COMPACTA DE BRANDING ── */}
      <div className="relative overflow-hidden bg-[#1C1917] text-white rounded-3xl py-6 px-6 md:px-8 border border-stone-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-gradient-to-br from-[#d4af37]/15 to-transparent blur-3xl pointer-events-none" />
        
        <div className="flex items-center gap-5 relative z-10">
          <span className="w-12 h-12 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 shadow-inner">
            <Palette size={22} strokeWidth={1.5} />
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg md:text-xl font-serif font-semibold tracking-wide text-white">Identidad Visual & Branding Premium</h3>
              <span className="bg-[#d4af37]/20 text-[#d4af37] text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border border-[#d4af37]/30">
                Deluxe
              </span>
            </div>
            <p className="text-xs md:text-sm text-stone-300 leading-relaxed max-w-2xl font-normal">
              Gestiona el logotipo, dimensiones de cabecera, paleta de colores de lujo, tipografías y geometría inyectadas en tu web pública y panel de control.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-stone-900/80 border border-stone-800 px-4 py-2.5 rounded-2xl relative z-10 shrink-0 self-stretch md:self-auto justify-center backdrop-blur-sm">
          <div className="w-7 h-7 rounded-xl bg-stone-950 flex items-center justify-center border border-[#d4af37]/30">
            <Sparkles size={13} className="text-[#d4af37] animate-pulse" />
          </div>
          <div className="text-left">
            <p className="text-[9px] text-stone-400 font-black uppercase tracking-widest leading-none">Diseño & Estilo</p>
            <p className="text-xs text-[#d4af37] font-bold mt-1">Activo</p>
          </div>
        </div>
      </div>

      {/* ── BENTO GRID PRINCIPAL DE IDENTIDAD & CALIBRACIÓN (EXPANDIDO) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* ── TARJETA: LOGOTIPO & CALIBRACIÓN DEL HEADER (12 COLUMNAS EN XL) ── */}
        <div className="xl:col-span-12 bg-white rounded-3xl border border-stone-200/70 p-6 md:p-8 shadow-sm space-y-6 hover:shadow-md transition-all duration-300">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-stone-100 gap-4">
            <div className="flex items-center gap-3.5">
              <span className="w-10 h-10 rounded-2xl bg-amber-50/60 border border-amber-200/40 flex items-center justify-center text-[#d4af37]">
                <Building2 size={18} strokeWidth={1.8} />
              </span>
              <div>
                <h4 className="text-base font-bold text-stone-900">Logotipo Principal & Cabecera</h4>
                <p className="text-[11px] text-stone-400 font-bold uppercase tracking-wider mt-0.5">Identidad Corporativa y Calibración de Escala</p>
              </div>
            </div>

            <button
              type="button"
              onClick={resetHeaderLogoDefaults}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-stone-600 hover:text-stone-900 bg-stone-50 hover:bg-stone-100 border border-stone-200/70 rounded-xl transition-all self-start sm:self-auto active:scale-95"
              title="Restablecer proporciones recomendadas del logo en cabecera"
            >
              <RotateCcw size={13} />
              <span>Restablecer Proporciones</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* SUB-COLUMNA 1: SUBIDA DEL LOGO (5 COLS) */}
            <div className="lg:col-span-5 space-y-4">
              <label className="text-xs font-black uppercase tracking-widest text-stone-500 block">
                Archivo de Logotipo
              </label>

              <div className="w-full h-52 bg-stone-50 border border-stone-200/60 rounded-2xl flex items-center justify-center p-6 relative group/logo transition-all duration-300 hover:border-stone-300">
                {settings.logo_app_b64 ? (
                  <>
                    <img 
                      src={settings.logo_app_b64} 
                      alt="App Logo" 
                      className="max-h-full max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover/logo:scale-105" 
                    />
                    <button
                      id="branding-logo-delete-btn"
                      type="button"
                      onClick={() => updateSetting('logo_app_b64', null)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md shadow-md border border-stone-200/80 flex items-center justify-center text-stone-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all duration-300 active:scale-90"
                      title="Eliminar Logotipo"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-stone-300">
                    <Building2 size={54} strokeWidth={1.2} />
                    <span className="text-xs font-bold text-stone-400">Sin logotipo asignado</span>
                  </div>
                )}
              </div>

              <p className="text-xs text-stone-500 font-medium leading-relaxed">
                Compatible con <strong className="text-stone-700">SVG, PNG transparente o JPG</strong>. Ajusta el tamaño y los márgenes con los controles de la derecha para adaptarlo a cualquier pantalla.
              </p>

              <input 
                id="branding-logo-file-input" 
                type="file" 
                accept="image/*" 
                ref={logoAppRef} 
                className="hidden" 
                onChange={e => handleImageUpload('logo_app_b64', e)} 
              />
              
              <button
                id="branding-logo-change-btn"
                type="button"
                onClick={() => logoAppRef.current?.click()}
                className="text-xs font-black uppercase tracking-wider text-white bg-stone-900 px-6 py-3.5 rounded-xl hover:bg-[#d4af37] hover:text-stone-950 transition-all w-full shadow-md hover:shadow-lg active:scale-95 duration-300 flex items-center justify-center gap-2"
              >
                <span>{settings.logo_app_b64 ? 'Cambiar Logotipo' : 'Subir Logotipo'}</span>
              </button>
            </div>

            {/* SUB-COLUMNA 2: CONTROLES DE CALIBRACIÓN DEL HEADER (7 COLS) */}
            <div className="lg:col-span-7 space-y-4 bg-stone-50/70 border border-stone-200/60 rounded-2xl p-5 md:p-6">
              
              <div className="flex items-center gap-2 text-stone-800 font-bold text-xs uppercase tracking-wider border-b border-stone-200/60 pb-3">
                <SlidersHorizontal size={15} className="text-[#d4af37]" />
                <span>Calibración de Margen y Posición en el Header</span>
              </div>

              {/* Control 1: Altura del Logo */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700 flex items-center gap-1.5">
                    <Maximize2 size={13} className="text-stone-400" />
                    Altura Máxima en Cabecera
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400 text-[11px] font-medium">Recomendado: 38-48px</span>
                    <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 text-xs">
                      {logoHeight}px
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="24"
                    max="68"
                    step="1"
                    value={logoHeight}
                    onChange={(e) => updateSetting('header_logo_height', parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="24"
                    max="68"
                    value={logoHeight}
                    onChange={(e) => updateSetting('header_logo_height', Math.max(20, Math.min(70, parseInt(e.target.value) || 24)))}
                    className="w-16 px-2 py-1 text-xs font-mono font-bold border border-stone-200 rounded-lg text-center bg-white"
                  />
                </div>
              </div>

              {/* Control 2: Desplazamiento Vertical (Subir / Bajar) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700 flex items-center gap-1.5">
                    <MoveVertical size={13} className="text-stone-400" />
                    Alineación Vertical (Subir / Bajar)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400 text-[11px] font-medium">0 = centrado</span>
                    <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 text-xs">
                      {logoOffsetY === 0 ? '0px (Centrado)' : logoOffsetY > 0 ? `+${logoOffsetY}px (Bajar)` : `${logoOffsetY}px (Subir)`}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="-24"
                    max="24"
                    step="1"
                    value={logoOffsetY}
                    onChange={(e) => updateSetting('header_logo_padding_y', parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="-24"
                    max="24"
                    value={logoOffsetY}
                    onChange={(e) => updateSetting('header_logo_padding_y', Math.max(-24, Math.min(24, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-1 text-xs font-mono font-bold border border-stone-200 rounded-lg text-center bg-white"
                  />
                </div>
              </div>

              {/* Control 3: Margen Derecho (Separación de Enlaces) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700 flex items-center gap-1.5">
                    <MoveHorizontal size={13} className="text-stone-400" />
                    Margen Derecho (Separación del Menú)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400 text-[11px] font-medium">Recomendado: 16-36px</span>
                    <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 text-xs">
                      {logoMarginRight}px
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="8"
                    max="80"
                    step="2"
                    value={logoMarginRight}
                    onChange={(e) => updateSetting('header_logo_margin_right', parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="8"
                    max="80"
                    value={logoMarginRight}
                    onChange={(e) => updateSetting('header_logo_margin_right', Math.max(8, Math.min(80, parseInt(e.target.value) || 8)))}
                    className="w-16 px-2 py-1 text-xs font-mono font-bold border border-stone-200 rounded-lg text-center bg-white"
                  />
                </div>
              </div>

              {/* Control 4: Margen Izquierdo (Separación del Borde) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-stone-700 flex items-center gap-1.5">
                    <MoveHorizontal size={13} className="text-stone-400" />
                    Margen Izquierdo (Separación del Borde)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-400 text-[11px] font-medium">0 = alineado normal</span>
                    <span className="font-mono font-bold text-stone-900 bg-white px-2 py-0.5 rounded border border-stone-200 text-xs">
                      {logoMarginLeft}px
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="48"
                    step="2"
                    value={logoMarginLeft}
                    onChange={(e) => updateSetting('header_logo_margin_left', parseInt(e.target.value))}
                    className="w-full accent-[#d4af37] cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="48"
                    value={logoMarginLeft}
                    onChange={(e) => updateSetting('header_logo_margin_left', Math.max(0, Math.min(48, parseInt(e.target.value) || 0)))}
                    className="w-16 px-2 py-1 text-xs font-mono font-bold border border-stone-200 rounded-lg text-center bg-white"
                  />
                </div>
              </div>

            </div>

          </div>

          {/* ── SIMULADOR EN VIVO DEL HEADER ── */}
          <div className="pt-4 border-t border-stone-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
                <Eye size={14} className="text-[#d4af37]" />
                Vista Previa en Tiempo Real de la Cabecera
              </span>
              <span className="text-[10px] text-stone-400 font-semibold">Simulación a escala real y reactiva</span>
            </div>

            <div className="w-full bg-stone-100/70 border border-stone-200 rounded-2xl p-3 md:p-4 overflow-hidden">
              <div className="w-full bg-white/95 rounded-xl border border-stone-200/80 shadow-sm h-20 px-6 flex items-center overflow-hidden relative">
                
                {/* Logo simulado con desplazamiento vertical, margen izquierdo y margen derecho */}
                <div 
                  className="flex items-center shrink-0 transition-all duration-150 relative"
                  style={{ 
                    marginLeft: `${logoMarginLeft}px`,
                    marginRight: `${logoMarginRight}px`,
                    transform: `translateY(${logoOffsetY}px)`
                  }}
                >
                  {settings.logo_app_b64 ? (
                    <div className="relative group/box flex items-center">
                      <img 
                        src={settings.logo_app_b64} 
                        alt="Preview" 
                        style={{
                          height: `${logoHeight}px`,
                          maxHeight: `${logoHeight}px`,
                        }}
                        className="w-auto max-w-[240px] object-contain transition-all duration-150 drop-shadow-sm" 
                      />
                      <div className="absolute -inset-1 border border-dashed border-[#d4af37]/40 pointer-events-none rounded opacity-0 group-hover/box:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <span className="font-serif font-black text-xl text-stone-900 tracking-tight">
                      {settings.clinic_name || 'ESTÉTICA MERCÈ'}
                    </span>
                  )}
                </div>

                {/* Enlaces simulados: ¡reaccionan directamente al margen derecho del logo! */}
                <div className="hidden sm:flex items-center gap-6 text-xs font-bold text-stone-600 transition-all duration-150 shrink-0">
                  <span className="hover:text-stone-900 cursor-default">Inicio</span>
                  <span className="text-[#d4af37] font-semibold flex items-center gap-1 cursor-default">
                    Tratamientos
                  </span>
                  <span className="hover:text-stone-900 cursor-default">Contacto</span>
                </div>

                {/* Botón CTA empujado a la derecha con ml-auto */}
                <div className="ml-auto hidden sm:flex items-center shrink-0 pl-4">
                  <div className="h-8 px-4 rounded-xl bg-[#d4af37] text-white flex items-center justify-center text-xs font-bold shadow-sm cursor-default">
                    Reservar Cita
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>

        {/* ── TARJETA: FAVICON DEL NAVEGADOR (12 COLS O XL:6 COLS) ── */}
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

        {/* ── TARJETA: ESTILO, PALETAS CROMÁTICAS & TIPOGRAFÍAS (12 COLS EN XL) ── */}
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

      </div>
    </div>
  );
}
