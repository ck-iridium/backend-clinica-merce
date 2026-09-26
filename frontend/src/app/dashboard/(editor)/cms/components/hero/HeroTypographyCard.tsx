"use client";
import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Type, Sliders } from 'lucide-react';
import { HeroSubCardProps, parseSizeScale } from './types';

export default function HeroTypographyCard({
  data,
  onChange,
  getResponsiveValue,
  setResponsiveValue,
  renderBadge
}: HeroSubCardProps) {
  const { t } = useLanguage();

  const titleScale = parseSizeScale(getResponsiveValue('hero_title_size', data.hero_title_size ?? 100), 100);
  const subtitleScale = parseSizeScale(getResponsiveValue('hero_subtitle_size', data.hero_subtitle_size ?? 100), 100);
  const titleMaxWidth = getResponsiveValue('hero_title_max_width', data.hero_title_max_width ?? 100);

  return (
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
          value={data.hero_title || ""} 
          onChange={e => onChange('hero_title', e.target.value)} 
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
            <span className="text-[10px] font-bold text-stone-400">50%</span>
            <input
              id="cms-hero-title-size-slider"
              type="range"
              min="50"
              max="220"
              step="5"
              value={titleScale}
              onChange={e => setResponsiveValue('hero_title_size', e.target.value)}
              className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-bold text-stone-400">220%</span>
          </div>

          {/* Presets rápidos */}
          <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
            <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
            <div className="flex items-center gap-1">
              {[80, 100, 130, 160, 200].map((preset) => (
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
          value={data.hero_subtitle || ""} 
          onChange={e => onChange('hero_subtitle', e.target.value)} 
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
            <span className="text-[10px] font-bold text-stone-400">100%</span>
            <input
              id="cms-hero-subtitle-size-slider"
              type="range"
              min="100"
              max="200"
              step="5"
              value={Math.max(100, subtitleScale)}
              onChange={e => setResponsiveValue('hero_subtitle_size', e.target.value)}
              className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] font-bold text-stone-400">200%</span>
          </div>

          {/* Presets rápidos */}
          <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
            <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
            <div className="flex items-center gap-1">
              {[100, 120, 140, 160, 180].map((preset) => (
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
  );
}
