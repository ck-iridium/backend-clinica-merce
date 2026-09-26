"use client";
import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Tag, Sliders } from 'lucide-react';
import { HeroSubCardProps, parseSizeScale } from './types';

export default function HeroPriceCard({
  data,
  onChange,
  getResponsiveValue,
  setResponsiveValue,
  renderBadge
}: HeroSubCardProps) {
  const { t } = useLanguage();

  const priceStyle = data.hero_price_style || 'capsule_dark';
  const priceScale = parseSizeScale(getResponsiveValue('hero_price_size', data.hero_price_size ?? 100), 100);
  const priceOffsetY = getResponsiveValue('hero_price_offset_y', data.hero_price_offset_y ?? 0);
  const pricePeriodSize = parseSizeScale(getResponsiveValue('hero_price_period_size', data.hero_price_period_size ?? 100), 100);
  const pricePeriodOffsetY = getResponsiveValue('hero_price_period_offset_y', data.hero_price_period_offset_y ?? 0);

  return (
    <div className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200/60 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37]">
            <Tag size={18} />
          </div>
          <div>
            <h4 className="font-serif font-bold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-2">
              {t('cms.hero.card_price_title') || 'Bloque de Precio / Oferta'}
              {data.hero_price_enabled && (
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
          aria-checked={!!data.hero_price_enabled}
          onClick={() => onChange('hero_price_enabled', !data.hero_price_enabled)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            data.hero_price_enabled ? 'bg-[#d4af37]' : 'bg-stone-300 dark:bg-stone-700'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              data.hero_price_enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {data.hero_price_enabled && (
        <div className="space-y-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-1.5">
                {t('cms.hero.price_prefix') || 'Etiqueta Superior'}
              </label>
              <input 
                type="text" 
                value={data.hero_price_prefix ?? 'Desde'} 
                onChange={e => onChange('hero_price_prefix', e.target.value)} 
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
                value={data.hero_price_amount || ''} 
                onChange={e => onChange('hero_price_amount', e.target.value)} 
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
                value={data.hero_price_suffix ?? '€'} 
                onChange={e => onChange('hero_price_suffix', e.target.value)} 
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
                value={data.hero_price_period || ''} 
                onChange={e => onChange('hero_price_period', e.target.value)} 
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
                onClick={() => onChange('hero_price_style', 'capsule_dark')}
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
                onClick={() => onChange('hero_price_style', 'outline')}
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
                onClick={() => onChange('hero_price_style', 'minimal')}
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
                onClick={() => onChange('hero_price_style', 'solid_white')}
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

          {/* CONTROL DE AJUSTE VERTICAL / SEPARACIÓN DEL DESDE (px) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#d4af37]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t('cms.hero.price_offset_y') || 'Proximidad / Separación del DESDE'}
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
              <span className="text-[10px] font-bold text-stone-400">Pegar al Precio (-40)</span>
              <input
                id="cms-hero-price-offset-y-slider"
                type="range"
                min="-40"
                max="40"
                step="1"
                value={priceOffsetY}
                onChange={e => setResponsiveValue('hero_price_offset_y', parseInt(e.target.value, 10))}
                className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-bold text-stone-400">Separar (+40)</span>
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
              <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
              <div className="flex items-center gap-1">
                {[-30, -15, 0, 15, 30].map((preset) => (
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

          {/* CONTROL DE TAMAÑO / ESCALA DE SESIÓN (PERIODO) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#d4af37]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t('cms.hero.price_period_size') || 'Escala / Tamaño de SESIÓN'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge('hero_price_period_size')}
                <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded-full">
                  {pricePeriodSize}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-stone-400">50%</span>
              <input
                id="cms-hero-price-period-size-slider"
                type="range"
                min="50"
                max="160"
                step="5"
                value={pricePeriodSize}
                onChange={e => setResponsiveValue('hero_price_period_size', e.target.value)}
                className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-bold text-stone-400">160%</span>
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
              <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
              <div className="flex items-center gap-1">
                {[70, 85, 100, 120, 140].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setResponsiveValue('hero_price_period_size', String(preset))}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      pricePeriodSize === preset
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

          {/* CONTROL DE AJUSTE VERTICAL / SEPARACIÓN DE SESIÓN (px) */}
          <div className="p-3.5 rounded-2xl bg-white dark:bg-stone-800/60 border border-stone-200/60 dark:border-stone-700/60 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sliders size={13} className="text-[#d4af37]" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300">
                  {t('cms.hero.price_period_offset_y') || 'Ajuste Vertical / Separación de SESIÓN'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {renderBadge('hero_price_period_offset_y')}
                <span className="font-mono text-xs font-extrabold text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full">
                  {pricePeriodOffsetY > 0 ? `+${pricePeriodOffsetY}px` : `${pricePeriodOffsetY}px`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-stone-400">Pegar al € (-20)</span>
              <input
                id="cms-hero-price-period-offset-y-slider"
                type="range"
                min="-20"
                max="20"
                step="1"
                value={pricePeriodOffsetY}
                onChange={e => setResponsiveValue('hero_price_period_offset_y', parseInt(e.target.value, 10))}
                className="w-full accent-[#d4af37] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] font-bold text-stone-400">Separar (+20)</span>
            </div>

            {/* Presets rápidos */}
            <div className="flex items-center justify-between pt-1 text-[10px] font-bold">
              <span className="text-stone-400">{t('cms.hero.presets') || 'Ajustes Rápidos'}:</span>
              <div className="flex items-center gap-1">
                {[-12, -6, 0, 6, 12].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setResponsiveValue('hero_price_period_offset_y', preset)}
                    className={`px-2 py-0.5 rounded-md transition-all ${
                      pricePeriodOffsetY === preset
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
                  {data.hero_title || 'Título Principal'}
                </div>
                <div className="text-[11px] text-stone-400 truncate max-w-xs">
                  {data.hero_subtitle || 'Subtítulo descriptivo del tratamiento o clínica.'}
                </div>
              </div>

              {/* Col 2: Cápsula de Precio con Estilo Seleccionado */}
              <div className={`shrink-0 text-left transition-all ${
                priceStyle === 'outline' ? 'px-4 py-2.5 rounded-2xl bg-transparent border-2 border-white/40' :
                priceStyle === 'minimal' ? 'p-1 bg-transparent border-0' :
                priceStyle === 'solid_white' ? 'px-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-stone-900 shadow-md' :
                'px-4 py-2.5 rounded-2xl bg-black/60 border border-white/20 shadow-md text-white'
              }`}>
                <div className="flex flex-col items-start">
                  <span 
                    style={{
                      marginBottom: `${-4 + Math.round(priceOffsetY / 5)}px`
                    }}
                    className={`text-[9px] uppercase tracking-widest font-black block leading-none select-none transition-all ${
                      priceStyle === 'minimal' ? 'text-white/80' : 'text-[#d4af37]'
                    }`}
                  >
                    {data.hero_price_prefix || 'Desde'}
                  </span>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span 
                      style={{ 
                        fontSize: `${(1.5 * (priceScale / 100)).toFixed(2)}rem`,
                        fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif" 
                      }}
                      className={`font-serif font-bold ${priceStyle === 'solid_white' ? 'text-stone-900' : 'text-white'}`}
                    >
                      {data.hero_price_amount || '15'}
                    </span>
                    <div className="flex flex-col items-start justify-center leading-none pl-0.5">
                      <span 
                        style={{ 
                          fontSize: `${(0.85 * (priceScale / 100)).toFixed(2)}rem`,
                          fontFamily: "var(--font-playfair-base), var(--font-playfair), 'Playfair', 'Playfair Display', Georgia, serif" 
                        }}
                        className={`font-serif font-bold ${priceStyle === 'minimal' ? 'text-white' : 'text-[#d4af37]'}`}
                      >
                        {data.hero_price_suffix || '€'}
                      </span>
                      {data.hero_price_period && (
                        <span 
                          style={{
                            fontSize: `${(0.55 * (pricePeriodSize / 100)).toFixed(2)}rem`,
                            marginTop: `${2 + Math.round(pricePeriodOffsetY / 2)}px`
                          }}
                          className={`font-black uppercase tracking-wider ${priceStyle === 'minimal' ? 'text-white/80' : 'text-[#d4af37]'} leading-tight block transition-all`}
                        >
                          {data.hero_price_period}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón CTA debajo */}
            {data.hero_show_button !== false && (
              <div className="pt-2 border-t border-stone-800/60 flex items-center">
                <span className="text-[10px] px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/90 font-bold inline-flex items-center gap-1">
                  {data.hero_button_text || 'Reservar Cita'} <span className="text-[#d4af37]">→</span>
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
