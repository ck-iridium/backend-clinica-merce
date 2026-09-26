"use client";
import React, { useState } from 'react';
import SmartLinkPickerModal from '@/components/cms/SmartLinkPickerModal';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { MousePointerClick, Wand2 } from 'lucide-react';
import { HeroSlideData } from './types';

interface HeroCtaCardProps {
  data: HeroSlideData;
  onChange: (field: string, value: any) => void;
  categories?: any[];
  services?: any[];
}

export default function HeroCtaCard({
  data,
  onChange,
  categories = [],
  services = []
}: HeroCtaCardProps) {
  const { t } = useLanguage();
  const [isLinkPickerOpen, setIsLinkPickerOpen] = useState(false);
  const buttonStyle = data.hero_button_style || 'glass';

  return (
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
          aria-checked={data.hero_show_button !== false}
          onClick={() => onChange('hero_show_button', data.hero_show_button === false ? true : false)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            data.hero_show_button !== false ? 'bg-[#d4af37]' : 'bg-stone-300 dark:bg-stone-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              data.hero_show_button !== false ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>
      
      {data.hero_show_button !== false && (
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
                onClick={() => onChange('hero_button_style', 'glass')}
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
                onClick={() => onChange('hero_button_style', 'gold_solid')}
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
                onClick={() => onChange('hero_button_style', 'outline')}
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
                onClick={() => onChange('hero_button_style', 'solid_white')}
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
                value={data.hero_button_text || ""} 
                onChange={e => onChange('hero_button_text', e.target.value)} 
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
                  value={data.hero_button_link || ""} 
                  onChange={e => onChange('hero_button_link', e.target.value)} 
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

          {/* Modal selector inteligente de enlaces */}
          <SmartLinkPickerModal
            isOpen={isLinkPickerOpen}
            onClose={() => setIsLinkPickerOpen(false)}
            onSelect={(link) => onChange('hero_button_link', link)}
            categories={categories}
            services={services}
          />
        </div>
      )}
    </div>
  );
}
