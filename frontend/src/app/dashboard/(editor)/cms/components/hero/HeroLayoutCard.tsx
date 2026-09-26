"use client";
import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Layout } from 'lucide-react';
import { SelectSimple } from '@/components/ui/select';
import { HeroSubCardProps } from './types';

export default function HeroLayoutCard({
  data,
  onChange,
  getResponsiveValue,
  setResponsiveValue,
  renderBadge
}: HeroSubCardProps) {
  const { t } = useLanguage();

  const heroAlignment = getResponsiveValue('hero_alignment', data.hero_alignment || 'center');
  const heroHorizontalAlignment = getResponsiveValue('hero_horizontal_alignment', data.hero_horizontal_alignment || 'center');

  return (
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
          aria-checked={!!data.hero_content_fullwidth}
          onClick={() => onChange('hero_content_fullwidth', !data.hero_content_fullwidth)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            data.hero_content_fullwidth ? 'bg-[#d4af37]' : 'bg-stone-300 dark:bg-stone-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              data.hero_content_fullwidth ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
    </div>
  );
}
