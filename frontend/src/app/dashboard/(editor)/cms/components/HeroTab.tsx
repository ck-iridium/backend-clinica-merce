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
  Sparkles, 
  MousePointerClick, 
  Layout, 
  Sliders, 
  Wand2, 
  ExternalLink,
  ChevronDown
} from 'lucide-react';

interface HeroTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  setPickerTarget: React.Dispatch<React.SetStateAction<any>>;
  categories?: any[];
  services?: any[];
}

export default function HeroTab({ 
  formData, 
  setFormData, 
  setPickerTarget,
  categories = [],
  services = []
}: HeroTabProps) {
  const { t } = useLanguage();
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false);
  const [mediaTypeTab, setMediaTypeTab] = useState<'image' | 'video'>('image');

  const titleMaxWidth = formData.hero_title_max_width !== undefined && formData.hero_title_max_width !== null
    ? formData.hero_title_max_width 
    : 100;

  const buttonStyle = formData.hero_button_style || 'glass';

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 pb-12">
      {/* ─── TARJETA 1: FONDO Y MULTIMEDIA ─── */}
      <div className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
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
          
          <div className="flex bg-stone-200/60 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMediaTypeTab('image')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                mediaTypeTab === 'image' 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <ImageIcon size={13} />
              {t('cms.hero.tab_image') || 'Imagen'}
            </button>
            <button
              type="button"
              onClick={() => setMediaTypeTab('video')}
              className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1.5 ${
                mediaTypeTab === 'video' 
                  ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                  : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
              }`}
            >
              <Film size={13} />
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
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              {t('cms.hero.main_title')}
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-stone-400">
                {t('cms.hero.title_size')}:
              </span>
              <select
                id="cms-hero-title-size-select"
                value={formData.hero_title_size || "large"}
                onChange={e => setFormData((prev: any) => ({ ...prev, hero_title_size: e.target.value }))}
                className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              >
                <option value="medium">{t('cms.hero.size_medium')}</option>
                <option value="large">{t('cms.hero.size_large')}</option>
                <option value="xl">{t('cms.hero.size_xl')}</option>
              </select>
            </div>
          </div>
          <input 
            type="text" 
            value={formData.hero_title || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, hero_title: e.target.value }))} 
            placeholder="Bienvenidos a Clínica Mercè"
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all font-serif font-bold text-lg" 
          />

          {/* CONTROL DE ANCHO MÁXIMO DEL TÍTULO (%) */}
          <div className="mt-3 p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#d4af37]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t('cms.hero.title_max_width') || 'Ancho Máximo del Titular'}
                </span>
              </div>
              <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full">
                {titleMaxWidth}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="cms-hero-title-max-width-slider"
                type="range"
                min="30"
                max="100"
                step="5"
                value={titleMaxWidth}
                onChange={e => setFormData((prev: any) => ({ ...prev, hero_title_max_width: parseInt(e.target.value, 10) }))}
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
                    onClick={() => setFormData((prev: any) => ({ ...prev, hero_title_max_width: preset }))}
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
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
              {t('cms.hero.subtitle')}
            </label>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] uppercase font-bold text-stone-400">
                {t('cms.hero.subtitle_size')}:
              </span>
              <select
                id="cms-hero-subtitle-size-select"
                value={formData.hero_subtitle_size || "medium"}
                onChange={e => setFormData((prev: any) => ({ ...prev, hero_subtitle_size: e.target.value }))}
                className="text-xs px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              >
                <option value="small">{t('cms.hero.size_small')}</option>
                <option value="medium">{t('cms.hero.size_medium')}</option>
                <option value="large">{t('cms.hero.size_large')}</option>
              </select>
            </div>
          </div>
          <textarea 
            rows={2} 
            value={formData.hero_subtitle || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, hero_subtitle: e.target.value }))} 
            placeholder="Donde la belleza y el bienestar se encuentran en perfecta armonía."
            className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all font-medium text-sm leading-relaxed" 
          />
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
                {t('cms.hero.card_price_desc') || 'Destaca una tarifa de entrada o precio estrella alineado en 2 columnas junto al titular.'}
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
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
                  {t('cms.hero.price_suffix') || 'Símbolo / Unidad'}
                </label>
                <input 
                  type="text" 
                  value={formData.hero_price_suffix ?? '€'} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, hero_price_suffix: e.target.value }))} 
                  placeholder="€"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30" 
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
                {t('cms.hero.price_size') || 'Escala Visual del Precio'}
              </label>
              <select
                value={formData.hero_price_size || "large"}
                onChange={e => setFormData((prev: any) => ({ ...prev, hero_price_size: e.target.value }))}
                className="text-xs px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 font-bold focus:outline-none focus:ring-1 focus:ring-[#d4af37]"
              >
                <option value="medium">{t('cms.hero.size_medium') || 'Mediano'}</option>
                <option value="large">{t('cms.hero.size_large') || 'Grande (Impacto)'}</option>
                <option value="xl">{t('cms.hero.size_xl') || 'Extra Grande (Monumento)'}</option>
              </select>
            </div>

            {/* Vista previa en miniatura del bloque de precio */}
            <div className="p-4 rounded-2xl bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37] block">
                  {t('cms.hero.preview_badge') || 'Previsualización del Badge'}
                </span>
                <p className="text-xs text-stone-400">
                  {t('cms.hero.preview_badge_desc') || 'Así se presentará en la columna lateral del Hero:'}
                </p>
              </div>

              <div className="text-right">
                <span className="block text-[11px] uppercase tracking-widest font-semibold text-[#d4af37]">
                  {formData.hero_price_prefix || 'Desde'}
                </span>
                <div className="flex items-baseline justify-end gap-1">
                  <span className="font-serif font-extrabold text-3xl leading-none text-white">
                    {formData.hero_price_amount || '45'}
                  </span>
                  <span className="text-sm font-serif font-bold text-white/80">
                    {formData.hero_price_suffix || '€'}
                  </span>
                </div>
              </div>
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
            {/* SELECTOR DE ESTILOS VISUALES DEL BOTÓN */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                {t('cms.hero.button_style_label') || 'Estilo Visual del Botón'}
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5" id="cms-hero-button-style-select">
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
                  <div className="w-full py-1.5 px-3 rounded-full bg-stone-900/60 backdrop-blur-md border border-white/30 text-white text-[11px] font-bold">
                    Glass
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                    Cristalino
                  </span>
                </button>

                {/* 2. Dorado Sólido */}
                <button
                  type="button"
                  onClick={() => setFormData((prev: any) => ({ ...prev, hero_button_style: 'gold_solid' }))}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    buttonStyle === 'gold_solid'
                      ? 'border-[#d4af37] bg-[#d4af37]/10 shadow-xs'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800 hover:border-stone-300'
                  }`}
                >
                  <div className="w-full py-1.5 px-3 rounded-full bg-[#d4af37] text-white text-[11px] font-bold shadow-xs">
                    Dorado
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                    Oro Joya
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
                  <div className="w-full py-1.5 px-3 rounded-full border-2 border-stone-800 dark:border-white text-stone-800 dark:text-white text-[11px] font-bold">
                    Outline
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
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
                  <div className="w-full py-1.5 px-3 rounded-full bg-white text-stone-900 border border-stone-200 text-[11px] font-bold shadow-xs">
                    Blanco
                  </div>
                  <span className="text-[10px] font-bold text-stone-500 dark:text-stone-400">
                    Contraste
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
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              {t('cms.hero.vertical_alignment')}
            </label>
            <select 
              value={formData.hero_alignment || "center"} 
              onChange={e => setFormData((prev: any) => ({ ...prev, hero_alignment: e.target.value }))} 
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold"
            >
              <option value="top">{t('cms.hero.alignment_top')}</option>
              <option value="center">{t('cms.hero.alignment_center')}</option>
              <option value="bottom">{t('cms.hero.alignment_bottom')}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-2">
              {t('cms.hero.horizontal_alignment')}
            </label>
            <select 
              id="cms-hero-horizontal-alignment-select"
              value={formData.hero_horizontal_alignment || "center"} 
              onChange={e => setFormData((prev: any) => ({ ...prev, hero_horizontal_alignment: e.target.value }))} 
              className="w-full px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold"
            >
              <option value="left">{t('cms.hero.alignment_left')}</option>
              <option value="center">{t('cms.hero.alignment_center')}</option>
              <option value="right">{t('cms.hero.alignment_right')}</option>
            </select>
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
