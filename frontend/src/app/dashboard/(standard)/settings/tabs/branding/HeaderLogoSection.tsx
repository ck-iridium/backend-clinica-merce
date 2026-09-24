"use client";

import { RefObject, useState } from 'react';
import { 
  Building2, 
  RotateCcw, 
  Trash2, 
  SlidersHorizontal, 
  Maximize2, 
  MoveVertical, 
  MoveHorizontal, 
  Sun, 
  Eye 
} from 'lucide-react';

interface HeaderLogoSectionProps {
  settings: any;
  updateSetting: (field: string, value: any) => void;
  logoAppRef: RefObject<HTMLInputElement>;
  handleImageUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HeaderLogoSection({
  settings,
  updateSetting,
  logoAppRef,
  handleImageUpload
}: HeaderLogoSectionProps) {
  const [previewDarkBg, setPreviewDarkBg] = useState(false);

  // Valores de calibración del header con fallbacks armónicos
  const logoHeight = settings.header_logo_height ?? 42;
  const logoOffsetY = settings.header_logo_padding_y ?? 0;
  const logoMarginRight = settings.header_logo_margin_right ?? 24;
  const logoMarginLeft = settings.header_logo_margin_left ?? 0;
  const headerLogoMode = settings.header_logo_mode || 'original';

  const resetHeaderLogoDefaults = () => {
    updateSetting('header_logo_height', 42);
    updateSetting('header_logo_padding_y', 0);
    updateSetting('header_logo_margin_right', 24);
    updateSetting('header_logo_margin_left', 0);
    updateSetting('header_logo_mode', 'original');
  };

  return (
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

          {/* Control 5: Modo de Color del Logotipo en Cabecera (Dark / Light) */}
          <div className="space-y-2 pt-2 border-t border-stone-200/50">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-stone-700 flex items-center gap-1.5">
                <Sun size={13} className="text-stone-400" />
                Color del Logotipo en Cabecera (Dark / Light)
              </span>
              <span className="text-stone-400 text-[11px] font-medium">
                {headerLogoMode === 'white' ? 'Blanco Puro' : headerLogoMode === 'adaptive' ? 'Adaptativo' : 'Original'}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => updateSetting('header_logo_mode', 'original')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs ${
                  headerLogoMode === 'original'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-stone-900 font-bold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                Original / Oscuro
              </button>
              <button
                type="button"
                onClick={() => updateSetting('header_logo_mode', 'white')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs ${
                  headerLogoMode === 'white'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-stone-900 font-bold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
              >
                Blanco Puro
              </button>
              <button
                type="button"
                onClick={() => updateSetting('header_logo_mode', 'adaptive')}
                className={`py-2 px-2 rounded-xl border text-center transition-all text-xs ${
                  headerLogoMode === 'adaptive'
                    ? 'border-[#d4af37] bg-[#d4af37]/15 text-stone-900 font-bold shadow-sm'
                    : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
                }`}
                title="Blanco en portada transparente, Original al hacer scroll"
              >
                Adaptativo
              </button>
            </div>
            <p className="text-[11px] text-stone-400 leading-tight">
              <strong className="text-stone-600">Adaptativo</strong> muestra el logotipo en blanco cuando la cabecera es transparente sobre el hero, y recupera su color original cuando el usuario hace scroll.
            </p>
          </div>

        </div>

      </div>

      {/* ── SIMULADOR EN VIVO DEL HEADER ── */}
      <div className="pt-4 border-t border-stone-100 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span className="text-xs font-black uppercase tracking-widest text-stone-500 flex items-center gap-2">
            <Eye size={14} className="text-[#d4af37]" />
            Vista Previa en Tiempo Real de la Cabecera
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-stone-400 font-semibold mr-1">Simular Fondo:</span>
            <button
              type="button"
              onClick={() => setPreviewDarkBg(false)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                !previewDarkBg
                  ? 'bg-white text-stone-900 shadow-xs border border-stone-200'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Claro (Scroll)
            </button>
            <button
              type="button"
              onClick={() => setPreviewDarkBg(true)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                previewDarkBg
                  ? 'bg-stone-900 text-white shadow-xs border border-stone-800'
                  : 'text-stone-400 hover:text-stone-700'
              }`}
            >
              Oscuro (Portada)
            </button>
          </div>
        </div>

        <div className="w-full bg-stone-100/70 border border-stone-200 rounded-2xl p-3 md:p-4 overflow-hidden">
          <div className={`w-full rounded-xl border shadow-sm h-20 px-6 flex items-center overflow-hidden relative transition-colors duration-300 ${
            previewDarkBg 
              ? 'bg-[#1c1917] border-stone-800' 
              : 'bg-white/95 border-stone-200/80'
          }`}>
            
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
                    className={`w-auto max-w-[240px] object-contain transition-all duration-150 ${
                      headerLogoMode === 'white' || (headerLogoMode === 'adaptive' && previewDarkBg)
                        ? 'brightness-0 invert drop-shadow-[0_2px_8px_rgba(255,255,255,0.15)]'
                        : 'drop-shadow-sm'
                    }`}
                  />
                  <div className="absolute -inset-1 border border-dashed border-[#d4af37]/40 pointer-events-none rounded opacity-0 group-hover/box:opacity-100 transition-opacity" />
                </div>
              ) : (
                <span className={`font-serif font-black text-xl tracking-tight transition-colors ${
                  previewDarkBg ? 'text-white' : 'text-stone-900'
                }`}>
                  {settings.clinic_name || 'ESTÉTICA MERCÈ'}
                </span>
              )}
            </div>

            {/* Enlaces simulados: ¡reaccionan directamente al margen derecho del logo! */}
            <div className={`hidden sm:flex items-center gap-6 text-xs font-bold transition-all duration-150 shrink-0 ${
              previewDarkBg ? 'text-stone-300' : 'text-stone-600'
            }`}>
              <span className={previewDarkBg ? 'hover:text-white cursor-default' : 'hover:text-stone-900 cursor-default'}>Inicio</span>
              <span className="text-[#d4af37] font-semibold flex items-center gap-1 cursor-default">
                Tratamientos
              </span>
              <span className={previewDarkBg ? 'hover:text-white cursor-default' : 'hover:text-stone-900 cursor-default'}>Contacto</span>
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
  );
}
