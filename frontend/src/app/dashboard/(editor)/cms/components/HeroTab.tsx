"use client";
import React, { useState } from 'react';
import ImageUploadBlock from './ImageUploadBlock';
import SmartLinkPickerModal from '@/components/cms/SmartLinkPickerModal';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { 
  ImageIcon, 
  Film, 
  Type, 
  Tag, 
  MousePointerClick, 
  Layout, 
  Sliders, 
  Wand2,
  Monitor,
  Tablet,
  Smartphone,
  RotateCcw
} from 'lucide-react';
import { SelectSimple } from '@/components/ui/select';

interface HeroTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setPickerTarget: React.Dispatch<React.SetStateAction<any>>;
  categories?: any[];
  services?: any[];
  activeDevice?: 'desktop' | 'tablet' | 'mobile';
  setActiveDevice?: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

const parseSizeScale = (val: any, fallback: number = 100): number => {
  if (typeof val === 'number') return val;
  if (!val) return fallback;
  if (val === 'small') return 80;
  if (val === 'medium') return 90;
  if (val === 'large') return 100;
  if (val === 'xl') return 125;
  const parsed = parseInt(val, 10);
  return isNaN(parsed) ? fallback : parsed;
};

// Componente fuera de HeroTab para evitar recreaciones y errores de parsing JSX
function ResponsiveBadge({
  field,
  device,
  isOverridden,
  hasTabletConfig,
  hasMobileConfig,
  onDeviceChange,
  onReset
}: {
  field: string;
  device: 'desktop' | 'tablet' | 'mobile';
  isOverridden: boolean;
  hasTabletConfig: boolean;
  hasMobileConfig: boolean;
  onDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void;
  onReset: (field: string) => void;
}) {
  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <div className="inline-flex items-center bg-stone-100 dark:bg-stone-800 p-0.5 rounded-lg border border-stone-200/60 dark:border-stone-700/60">
        <button
          type="button"
          onClick={() => onDeviceChange?.('desktop')}
          className={`p-1 rounded-md transition-all ${
            device === 'desktop'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          title="Escritorio (Desktop)"
        >
          <Monitor size={11} className={device === 'desktop' ? 'text-[#d4af37]' : ''} />
        </button>
        <button
          type="button"
          onClick={() => onDeviceChange?.('tablet')}
          className={`p-1 rounded-md relative transition-all ${
            device === 'tablet'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          title="Tablet (768px)"
        >
          <Tablet size={11} className={device === 'tablet' ? 'text-[#d4af37]' : ''} />
          {hasTabletConfig && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onDeviceChange?.('mobile')}
          className={`p-1 rounded-md relative transition-all ${
            device === 'mobile'
              ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs'
              : 'text-stone-400 hover:text-stone-700'
          }`}
          title="Móvil (390px)"
        >
          <Smartphone size={11} className={device === 'mobile' ? 'text-[#d4af37]' : ''} />
          {hasMobileConfig && (
            <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
          )}
        </button>
      </div>

      {device !== 'desktop' && isOverridden && (
        <button
          type="button"
          onClick={() => onReset(field)}
          className="flex items-center gap-1 text-[9px] font-bold text-stone-400 hover:text-red-500 bg-stone-100 hover:bg-red-50 dark:bg-stone-800 px-1.5 py-0.5 rounded-md transition-all"
          title="Restablecer a heredar de Escritorio"
        >
          <RotateCcw size={9} />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
}

export default function HeroTab({ 
  formData, 
  setFormData, 
  setPickerTarget,
  categories = [],
  services = [],
  activeDevice = 'desktop',
  setActiveDevice
}: HeroTabProps) {
  const { t } = useLanguage();
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false);
  const [mediaTypeTab, setMediaTypeTab] = useState<'image' | 'video'>('image');

  const device = activeDevice || 'desktop';

  // Responsive getters & setters
  const getResponsiveValue = (field: string, fallback: any) => {
    if (device === 'mobile') {
      return formData.hero_responsive_config?.mobile?.[field] 
        ?? formData.hero_responsive_config?.tablet?.[field] 
        ?? formData[field] 
        ?? fallback;
    }
    if (device === 'tablet') {
      return formData.hero_responsive_config?.tablet?.[field] 
        ?? formData[field] 
        ?? fallback;
    }
    return formData[field] ?? fallback;
  };

  const hasOverride = (field: string) => {
    if (device === 'desktop') return false;
    return formData.hero_responsive_config?.[device]?.[field] !== undefined;
  };

  const setResponsiveValue = (field: string, value: any) => {
    if (device === 'desktop') {
      setFormData((prev: any) => ({
        ...prev,
        [field]: value
      }));
    } else {
      setFormData((prev: any) => {
        const currentConfig = prev.hero_responsive_config || {};
        const deviceConfig = { ...(currentConfig[device] || {}) };
        deviceConfig[field] = value;
        return {
          ...prev,
          hero_responsive_config: {
            ...currentConfig,
            [device]: deviceConfig
          }
        };
      });
    }
  };

  const resetResponsiveValue = (field: string) => {
    if (device === 'desktop') return;
    setFormData((prev: any) => {
      const currentConfig = prev.hero_responsive_config || {};
      const deviceConfig = { ...(currentConfig[device] || {}) };
      delete deviceConfig[field];
      return {
        ...prev,
        hero_responsive_config: {
          ...currentConfig,
          [device]: deviceConfig
        }
      };
    });
  };

  const renderBadge = (field: string) => (
    <ResponsiveBadge
      field={field}
      device={device}
      isOverridden={hasOverride(field)}
      hasTabletConfig={formData.hero_responsive_config?.tablet?.[field] !== undefined}
      hasMobileConfig={formData.hero_responsive_config?.mobile?.[field] !== undefined}
      onDeviceChange={setActiveDevice}
      onReset={resetResponsiveValue}
    />
  );

  const titleMaxWidth = getResponsiveValue('hero_title_max_width', formData.hero_title_max_width ?? 100);
  const buttonStyle = formData.hero_button_style || 'glass';
  const priceStyle = formData.hero_price_style || 'capsule_dark';
  const priceOffsetY = getResponsiveValue('hero_price_offset_y', formData.hero_price_offset_y ?? 0);

  const titleScale = parseSizeScale(getResponsiveValue('hero_title_size', formData.hero_title_size ?? 100), 100);
  const subtitleScale = parseSizeScale(getResponsiveValue('hero_subtitle_size', formData.hero_subtitle_size ?? 100), 100);
  const priceScale = parseSizeScale(getResponsiveValue('hero_price_size', formData.hero_price_size ?? 100), 100);

  const heroAlignment = getResponsiveValue('hero_alignment', formData.hero_alignment || 'center');
  const heroHorizontalAlignment = getResponsiveValue('hero_horizontal_alignment', formData.hero_horizontal_alignment || 'center');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      {/* ─── TARJETA 1: FONDO Y MULTIMEDIA ─── */}
      <div className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-4">
        {/* Cabecera a ancho completo */}
        <div className="space-y-3 pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37] shrink-0">
              <ImageIcon size={18} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                {t('cms.hero.card_media_title') || 'Fondo de Portada'}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('cms.hero.card_media_desc') || 'Define la imagen de alto impacto o el vídeo de fondo cinematográfico.'}
              </p>
            </div>
          </div>
          
          {/* Fila dedicada para botones de Imagen / Vídeo */}
          <div className="grid grid-cols-2 bg-stone-200/60 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold w-full">
            <button
              type="button"
              onClick={() => setMediaTypeTab('image')}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mediaTypeTab === 'image' 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <ImageIcon size={14} />
              {t('cms.hero.tab_image') || 'Imagen'}
            </button>
            <button
              type="button"
              onClick={() => setMediaTypeTab('video')}
              className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                mediaTypeTab === 'video' 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Film size={14} />
              {t('cms.hero.tab_video') || 'Vídeo (Opcional)'}
              {formData.hero_video_url && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
              )}
            </button>
          </div>
        </div>

        {mediaTypeTab === 'image' ? (
          <div>
            <ImageUploadBlock 
              label={t('cms.hero.main_image')}
              value={formData.hero_image_url} 
              onSelect={() => setPickerTarget({ type: 'form', field: 'hero_image_url' })} 
              onClear={() => setFormData((prev: any) => ({ ...prev, hero_image_url: '' }))} 
              onUpload={(url) => setFormData((prev: any) => ({ ...prev, hero_image_url: url }))}
              accepts="image"
            />
          </div>
        ) : (
          <div className="space-y-3">
            <ImageUploadBlock 
              label={t('cms.hero.bg_video')}
              value={formData.hero_video_url} 
              onSelect={() => setPickerTarget({ type: 'form', field: 'hero_video_url' })} 
              onClear={() => setFormData((prev: any) => ({ ...prev, hero_video_url: '' }))} 
              onUpload={(url) => setFormData((prev: any) => ({ ...prev, hero_video_url: url }))}
              accepts="video"
            />
            <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
              {t('cms.hero.video_hint') || 'Nota: El vídeo se reproducirá automáticamente en bucle y silenciado en la portada reemplazando la imagen estática.'}
            </p>
          </div>
        )}
      </div>

      {/* ─── TARJETA 2: TIPOGRAFÍA Y TEXTOS ─── */}
      <div className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-5">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Type size={18} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
              {t('cms.hero.card_typography_title') || 'Tipografía y Textos'}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t('cms.hero.card_typography_desc') || 'Personaliza el titular de bienvenida, sus proporciones y el subtítulo.'}
            </p>
          </div>
        </div>

        {/* TÍTULO PRINCIPAL H1 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              {t('cms.hero.main_title')}
            </label>
            <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full">
              {titleScale}%
            </span>
          </div>
          <input 
            type="text" 
            value={formData.hero_title || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, hero_title: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all font-serif font-bold text-lg" 
          />

          {/* SLIDER DE ESCALA / TAMAÑO DEL TÍTULO */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#d4af37]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t('cms.hero.title_size_slider') || 'Escala / Tamaño del Titular'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge('hero_title_size')}
                <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                  {titleScale}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-stone-400">60%</span>
              <input
                id="cms-hero-title-size-slider"
                type="range"
                min="60"
                max="160"
                step="5"
                value={titleScale}
                onChange={e => setResponsiveValue('hero_title_size', e.target.value)}
                className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-bold text-stone-400">160%</span>
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
              <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
              <div className="flex items-center gap-1">
                {[80, 100, 120, 140].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setResponsiveValue('hero_title_size', String(preset))}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      titleScale === preset
                        ? 'bg-[#d4af37] text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CONTROL DE ANCHO MÁXIMO DEL TÍTULO (%) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#d4af37]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t('cms.hero.title_max_width') || 'Ancho Máximo del Titular'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge('hero_title_max_width')}
                <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full">
                  {titleMaxWidth}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="cms-hero-title-max-width-slider"
                type="range"
                min="30"
                max="100"
                step="5"
                value={titleMaxWidth}
                onChange={e => setResponsiveValue('hero_title_max_width', parseInt(e.target.value, 10))}
                className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
              <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
              <div className="flex items-center gap-1">
                {[100, 75, 60, 50].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setResponsiveValue('hero_title_max_width', preset)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      titleMaxWidth === preset
                        ? 'bg-[#d4af37] text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SUBTÍTULO */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              {t('cms.hero.subtitle')}
            </label>
            <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full">
              {subtitleScale}%
            </span>
          </div>
          <textarea 
            rows={2} 
            value={formData.hero_subtitle || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, hero_subtitle: e.target.value }))} 
            placeholder="Donde la belleza y el bienestar se encuentran en perfecta armonía."
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all font-medium text-sm leading-relaxed" 
          />

          {/* SLIDER DE ESCALA / TAMAÑO DEL SUBTÍTULO */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#d4af37]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t('cms.hero.subtitle_size_slider') || 'Escala / Tamaño del Subtítulo'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge('hero_subtitle_size')}
                <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                  {subtitleScale}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-stone-400">70%</span>
              <input
                id="cms-hero-subtitle-size-slider"
                type="range"
                min="70"
                max="140"
                step="5"
                value={subtitleScale}
                onChange={e => setResponsiveValue('hero_subtitle_size', e.target.value)}
                className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-bold text-stone-400">140%</span>
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
              <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
              <div className="flex items-center gap-1">
                {[85, 100, 115, 130].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setResponsiveValue('hero_subtitle_size', String(preset))}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      subtitleScale === preset
                        ? 'bg-[#d4af37] text-white'
                        : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                    }`}
                  >
                    {preset}%
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── TARJETA 3: BLOQUE DE PRECIO / OFERTA DESTACADA ─── */}
      <div className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
              <Tag size={18} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
                {t('cms.hero.card_price_title') || 'Bloque de Precio / Oferta'}
                {formData.hero_price_enabled && (
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#d4af37]/20 text-[#997a15] dark:text-[#f3d36b]">
                    Activo
                  </span>
                )}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('cms.hero.card_price_desc') || 'Destaca una tarifa de entrada o precio estrella pegado directamente junto al titular.'}
              </p>
            </div>
          </div>

          <button 
            id="cms-hero-price-toggle"
            type="button"
            role="switch"
            aria-checked={!!formData.hero_price_enabled}
            onClick={() => setFormData((prev: any) => ({ ...prev, hero_price_enabled: !prev.hero_price_enabled }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.hero_price_enabled ? 'bg-[#d4af37]' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.hero_price_enabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {formData.hero_price_enabled && (
          <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t('cms.hero.price_prefix') || 'Etiqueta Superior'}
                </label>
                <input 
                  type="text" 
                  value={formData.hero_price_prefix ?? 'Desde'} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, hero_price_prefix: e.target.value }))} 
                  placeholder="Desde"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t('cms.hero.price_amount') || 'Importe / Precio'}
                </label>
                <input 
                  type="text" 
                  value={formData.hero_price_amount || ''} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, hero_price_amount: e.target.value }))} 
                  placeholder="45"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-serif font-extrabold focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-[#d4af37]" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t('cms.hero.price_suffix') || 'Símbolo / Moneda'}
                </label>
                <input 
                  type="text" 
                  value={formData.hero_price_suffix ?? '€'} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, hero_price_suffix: e.target.value }))} 
                  placeholder="€"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30" 
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t('cms.hero.price_period') || 'Periodo / Frecuencia'}
                </label>
                <input 
                  type="text" 
                  value={formData.hero_price_period || ''} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, hero_price_period: e.target.value }))} 
                  placeholder="MES, AÑO, SESIÓN..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30" 
                />
              </div>
            </div>

            {/* SELECTOR DE ESTILOS VISUALES DEL PRECIO (2 POR FILA) */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                {t('cms.hero.price_style_label') || 'Estilo Visual del Precio'}
              </label>

              <div className="grid grid-cols-2 gap-3" id="cms-hero-price-style-select">
                {/* 1. Cápsula Oscura */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_price_style: 'capsule_dark' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    priceStyle === 'capsule_dark'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-1.5 px-3 rounded-xl bg-stone-900/80 border border-white/20 text-white text-xs font-serif font-black">
                    15€
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    {t('cms.hero.price_style_capsule_dark') || 'Cápsula Oscura'}
                  </span>
                </button>

                {/* 2. Solo Borde */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_price_style: 'outline' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    priceStyle === 'outline'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-1.5 px-3 rounded-xl bg-transparent border-2 border-stone-800 dark:border-white text-stone-800 dark:text-white text-xs font-serif font-black">
                    15€
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    {t('cms.hero.price_style_outline') || 'Solo Borde'}
                  </span>
                </button>

                {/* 3. Sin Fondo / Minimal */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_price_style: 'minimal' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    priceStyle === 'minimal'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-1.5 px-3 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 text-stone-800 dark:text-white text-xs font-serif font-black">
                    15€
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    {t('cms.hero.price_style_minimal') || 'Sin Fondo / Minimal'}
                  </span>
                </button>

                {/* 4. Cápsula Clara */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_price_style: 'solid_white' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    priceStyle === 'solid_white'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-1.5 px-3 rounded-xl bg-white text-stone-900 border border-stone-200 text-xs font-serif font-black shadow-xs">
                    15€
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    {t('cms.hero.price_style_solid_white') || 'Cápsula Clara'}
                  </span>
                </button>
              </div>
            </div>

            {/* SLIDER DE ESCALA / TAMAÑO DEL PRECIO */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#d4af37]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                    {t('cms.hero.price_size') || 'Escala Visual del Precio'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderBadge('hero_price_size')}
                  <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full">
                    {priceScale}%
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-stone-400">70%</span>
                <input
                  id="cms-hero-price-size-slider"
                  type="range"
                  min="70"
                  max="200"
                  step="5"
                  value={priceScale}
                  onChange={e => setResponsiveValue('hero_price_size', e.target.value)}
                  className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-bold text-stone-400">200%</span>
              </div>

              {/* Presets rápidos */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
                <div className="flex items-center gap-1">
                  {[85, 100, 130, 160, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setResponsiveValue('hero_price_size', String(preset))}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        priceScale === preset
                          ? 'bg-[#d4af37] text-white'
                          : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CONTROL DE AJUSTE VERTICAL / SEPARACIÓN DEL PRECIO (px) */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Sliders size={13} className="text-[#d4af37]" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                    {t('cms.hero.price_offset_y') || 'Ajuste Vertical / Proximidad'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {renderBadge('hero_price_offset_y')}
                  <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full">
                    {priceOffsetY > 0 ? `+${priceOffsetY}px` : `${priceOffsetY}px`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-stone-400">Pegar (-60)</span>
                <input
                  id="cms-hero-price-offset-y-slider"
                  type="range"
                  min="-60"
                  max="30"
                  step="1"
                  value={priceOffsetY}
                  onChange={e => setResponsiveValue('hero_price_offset_y', parseInt(e.target.value, 10))}
                  className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] font-bold text-stone-400">Separar (+30)</span>
              </div>

              {/* Presets rápidos */}
              <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
                <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
                <div className="flex items-center gap-1">
                  {[-40, -20, 0, 10, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setResponsiveValue('hero_price_offset_y', preset)}
                      className={`px-2 py-0.5 rounded-md transition-all ${
                        priceOffsetY === preset
                          ? 'bg-[#d4af37] text-white'
                          : 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-200'
                      }`}
                    >
                      {preset > 0 ? `+${preset}` : preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Vista previa compacta de 2 columnas con precio encapsulado (Muestra el estilo visual) */}
            <div className="p-4 rounded-2xl bg-stone-950 text-white space-y-2 border border-stone-800">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] block">
                {t('cms.hero.preview_badge') || 'Previsualización del Badge'}
              </span>
              <div className="flex items-center justify-between gap-4">
                {/* Col 1: Textos */}
                <div className="space-y-1 min-w-0">
                  <div 
                    style={{ fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif" }}
                    className="font-serif font-extrabold text-base text-white truncate"
                  >
                    {formData.hero_title || 'Título Principal'}
                  </div>
                  <div className="text-[11px] text-stone-400 truncate max-w-xs">
                    {formData.hero_subtitle || 'Subtítulo descriptivo del tratamiento o clínica.'}
                  </div>
                </div>

                {/* Col 2: Cápsula de Precio con Estilo Seleccionado */}
                <div className={`shrink-0 text-left transition-all ${
                  priceStyle === 'outline' ? 'px-4 py-2.5 rounded-2xl bg-transparent border-2 border-white/40' :
                  priceStyle === 'minimal' ? 'p-1 bg-transparent border-0' :
                  priceStyle === 'solid_white' ? 'px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-900 shadow-md' :
                  'px-4 py-2.5 rounded-2xl bg-black/60 border border-white/20 shadow-md text-white'
                }`}>
                  <div className="flex flex-col items-start gap-1">
                    <span className={`text-[9px] uppercase tracking-widest font-black block leading-none select-none ${
                      priceStyle === 'minimal' ? 'text-white/80' : 'text-[#d4af37]'
                    }`}>
                      {formData.hero_price_prefix || 'Desde'}
                    </span>
                    <div className="flex items-center gap-2 leading-none">
                      <span 
                        style={{ fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif" }}
                        className={`font-serif font-black text-2xl ${priceStyle === 'solid_white' ? 'text-stone-900' : 'text-white'}`}
                      >
                        {formData.hero_price_amount || '15'}
                      </span>
                      <div className="flex flex-col items-start justify-center leading-none pl-0.5">
                        <span 
                          style={{ fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif" }}
                          className={`text-xs font-serif font-bold ${priceStyle === 'minimal' ? 'text-white' : 'text-[#d4af37]'}`}
                        >
                          {formData.hero_price_suffix || '€'}
                        </span>
                        {formData.hero_price_period && (
                          <span className={`text-[9px] font-black uppercase tracking-wider ${priceStyle === 'minimal' ? 'text-white/80' : 'text-[#d4af37]'} mt-0.5 leading-none`}>
                            {formData.hero_price_period}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Botón CTA debajo */}
              {formData.hero_show_button !== false && (
                <div className="pt-2 border-t border-stone-800/60 flex items-center">
                  <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 font-bold inline-flex items-center gap-1">
                    {formData.hero_button_text || 'Reservar Cita'} <span className="text-[#d4af37]">→</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ─── TARJETA 4: BOTÓN DE ACCIÓN (CTA) ─── */}
      <div className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
              <MousePointerClick size={18} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
                {t('cms.hero.action_button')}
              </h4>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {t('cms.hero.action_button_desc') || 'Personaliza el botón de llamada a la acción, su enlace inteligente y apariencia visual.'}
              </p>
            </div>
          </div>

          <button 
            type="button"
            role="switch"
            aria-checked={formData.hero_show_button !== false}
            onClick={() => setFormData((prev: any) => ({ ...prev, hero_show_button: !prev.hero_show_button }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.hero_show_button !== false ? 'bg-[#d4af37]' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.hero_show_button !== false ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
        
        {formData.hero_show_button !== false && (
          <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
            {/* SELECTOR DE ESTILOS VISUALES DEL BOTÓN (2 POR FILA) */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                {t('cms.hero.button_style_label') || 'Estilo Visual del Botón'}
              </label>

              <div className="grid grid-cols-2 gap-3" id="cms-hero-button-style-select">
                {/* 1. Glassmorphism */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_button_style: 'glass' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    buttonStyle === 'glass'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-2 px-3 rounded-full bg-stone-900/60 backdrop-blur-md border border-white/30 text-white text-xs font-bold">
                    Glass
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Cristalino
                  </span>
                </button>

                {/* 2. Color de Marca (Sólido) */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_button_style: 'gold_solid' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    buttonStyle === 'gold_solid'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-2 px-3 rounded-full bg-[#d4af37] text-white text-xs font-bold shadow-xs">
                    Color
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    {t('cms.hero.style_solid_color') || 'Relleno de Color'}
                  </span>
                </button>

                {/* 3. Outline Minimalista */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_button_style: 'outline' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    buttonStyle === 'outline'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-2 px-3 rounded-full border-2 border-stone-800 dark:border-white text-stone-800 dark:text-white text-xs font-bold">
                    Outline
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Línea Fina
                  </span>
                </button>

                {/* 4. Blanco Contraste */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_button_style: 'solid_white' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    buttonStyle === 'solid_white'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-2 px-3 rounded-full bg-white text-stone-900 border border-stone-200 text-xs font-bold shadow-xs">
                    Blanco
                  </div>
                  <span className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                    Blanco Contraste
                  </span>
                </button>
              </div>
            </div>

            {/* TEXTO Y ENLACE DEL BOTÓN */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                  {t('cms.hero.button_text')}
                </label>
                <input 
                  type="text" 
                  value={formData.hero_button_text || ""} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, hero_button_text: e.target.value }))} 
                  placeholder="Reservar Tratamiento"
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" 
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                    {t('cms.hero.button_link')}
                  </label>
                  <button
                    id="cms-hero-smart-link-btn"
                    type="button"
                    onClick={() => setIsLinkPickerOpen(true)}
                    className="text-[10px] font-extrabold uppercase text-[#d4af37] hover:underline flex items-center gap-1"
                  >
                    <Wand2 size={12} />
                    {t('cms.hero.open_link_picker') || 'Elegir Enlace Smart'}
                  </button>
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    value={formData.hero_button_link || ""} 
                    onChange={e => setFormData((prev: any) => ({ ...prev, hero_button_link: e.target.value }))} 
                    placeholder="/reservar o #tratamientos"
                    className="w-full pl-4 pr-10 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium font-mono" 
                  />
                  <button
                    type="button"
                    onClick={() => setIsLinkPickerOpen(true)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 hover:bg-[#d4af37]/10 text-stone-500 hover:text-[#d4af37] transition-colors"
                    title={t('cms.hero.open_link_picker') || 'Abrir selector inteligente de enlaces'}
                  >
                    <Wand2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ─── TARJETA 5: DISTRIBUCIÓN Y POSICIÓN ─── */}
      <div className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Layout size={18} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100">
              {t('cms.hero.card_layout_title') || 'Distribución y Posición'}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {t('cms.hero.card_layout_desc') || 'Ajusta la posición vertical, horizontal y la cuadrícula del contenido.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {t('cms.hero.vertical_alignment')}
              </label>
              {renderBadge('hero_alignment')}
            </div>
            <SelectSimple 
              id="cms-hero-vertical-alignment-select"
              value={heroAlignment} 
              onChange={val => setResponsiveValue('hero_alignment', val)} 
              options={[
                { value: "top", label: t('cms.hero.alignment_top') },
                { value: "center", label: t('cms.hero.alignment_center') },
                { value: "bottom", label: t('cms.hero.alignment_bottom') }
              ]}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                {t('cms.hero.horizontal_alignment')}
              </label>
              {renderBadge('hero_horizontal_alignment')}
            </div>
            <SelectSimple 
              id="cms-hero-horizontal-alignment-select"
              value={heroHorizontalAlignment} 
              onChange={val => setResponsiveValue('hero_horizontal_alignment', val)} 
              options={[
                { value: "left", label: t('cms.hero.alignment_left') },
                { value: "center", label: t('cms.hero.alignment_center') },
                { value: "right", label: t('cms.hero.alignment_right') }
              ]}
            />
          </div>
        </div>

        {/* Conmutador Ancho Completo (Fullwidth) vs Cuadrícula Web */}
        <div 
          id="cms-hero-fullwidth-toggle"
          className="p-4 rounded-2xl bg-white dark:bg-stone-800/80 border border-stone-200/70 dark:border-stone-700 flex items-center justify-between gap-4 transition-all"
        >
          <div className="space-y-0.5">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 block">
              {t('cms.hero.content_fullwidth')}
            </label>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm">
              {t('cms.hero.content_fullwidth_desc')}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={!!formData.hero_content_fullwidth}
            onClick={() => setFormData((prev: any) => ({ ...prev, hero_content_fullwidth: !prev.hero_content_fullwidth }))}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formData.hero_content_fullwidth ? 'bg-[#d4af37]' : 'bg-stone-300 dark:bg-stone-700'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                formData.hero_content_fullwidth ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* ─── MODAL SELECTOR INTELIGENTE DE ENLACES ─── */}
      <SmartLinkPickerModal
        isOpen={isLinkPickerOpen}
        onClose={() => setIsLinkPickerOpen(false)}
        currentValue={formData.hero_button_link || ''}
        categories={categories}
        services={services}
        onSelect={(url, suggestedText) => {
          setFormData((prev: any) => ({
            ...prev,
            hero_button_link: url,
            ...(suggestedText && (!prev.hero_button_text || prev.hero_button_text === 'Reservar Cita') ? { hero_button_text: suggestedText } : {})
          }));
        }}
      />
    </div>
  );
}
