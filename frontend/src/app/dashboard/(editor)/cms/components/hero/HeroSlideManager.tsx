"use client";
import React, { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { 
  Plus, 
  Copy, 
  Trash2, 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal, 
  ImageIcon, 
  Film,
  Sparkles,
  Check,
  X
} from 'lucide-react';
import { HeroSlideData, HeroSliderConfig } from './types';

interface HeroSlideManagerProps {
  slides: HeroSlideData[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onDuplicateSlide: (index: number) => void;
  onDeleteSlide: (index: number) => void;
  onMoveSlide: (fromIndex: number, toIndex: number) => void;
  sliderConfig: HeroSliderConfig;
  onUpdateSliderConfig: (field: keyof HeroSliderConfig, value: any) => void;
}

export default function HeroSlideManager({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onAddSlide,
  onDuplicateSlide,
  onDeleteSlide,
  onMoveSlide,
  sliderConfig,
  onUpdateSliderConfig
}: HeroSlideManagerProps) {
  const { t } = useLanguage();
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDeleteIndex, setConfirmDeleteIndex] = useState<number | null>(null);

  const autoplay = sliderConfig.hero_slider_autoplay ?? true;
  const interval = sliderConfig.hero_slider_interval ?? 5;
  const effect = sliderConfig.hero_slider_effect ?? 'fade';
  const showArrows = sliderConfig.hero_slider_show_arrows ?? true;
  const showDots = sliderConfig.hero_slider_show_dots ?? true;

  const handleDelete = (index: number) => {
    if (slides.length <= 1) return;
    onDeleteSlide(index);
    setConfirmDeleteIndex(null);
  };

  return (
    <div 
      id="cms-hero-slide-manager" 
      className="p-5 rounded-3xl bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 shadow-sm space-y-4"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center text-[#FF6B00]">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 font-serif">
              {t('cms.hero.slides_manager') || 'Gestor de Diapositivas (Slider)'}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {slides.length} {slides.length === 1 ? 'diapositiva' : 'diapositivas en carrusel'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            id="cms-hero-slider-settings-btn"
            onClick={() => setShowSettings(!showSettings)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all ${
              showSettings 
                ? 'bg-[#FF6B00] text-white shadow-sm' 
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            <SlidersHorizontal size={13} />
            <span>{t('cms.hero.slider_settings') || 'Ajustes del Carrusel'}</span>
          </button>

          <button
            type="button"
            id="cms-hero-add-slide-btn"
            onClick={onAddSlide}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-[#FF6B00] dark:hover:bg-[#FF6B00] dark:hover:text-white transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>{t('cms.hero.add_slide') || 'Añadir Diapositiva'}</span>
          </button>
        </div>
      </div>

      {/* Global Slider Settings Drawer */}
      {showSettings && (
        <div className="p-5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/60 border border-stone-200/90 dark:border-stone-700/60 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/70 dark:border-stone-700/60">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-[#FF6B00]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-stone-200">
                {t('cms.hero.slider_settings') || 'Configuración del Carrusel'}
              </h4>
            </div>
            <button 
              type="button" 
              onClick={() => setShowSettings(false)}
              className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-700/50 transition-colors"
            >
              <X size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Tarjeta 1: Reproducción y Tiempos */}
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-stone-800 dark:text-stone-200 block text-xs">
                    {t('cms.hero.autoplay') || 'Reproducción Automática'}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium">
                    {autoplay ? 'Transición continua activa' : 'Avance manual por el visitante'}
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={autoplay}
                  onClick={() => onUpdateSliderConfig('hero_slider_autoplay', !autoplay)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    autoplay ? 'bg-[#FF6B00]' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      autoplay ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Intervalo / Tiempo por Slide */}
              <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-stone-700 dark:text-stone-300">
                    {t('cms.hero.interval') || 'Tiempo por Diapositiva'}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#FF6B00] bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 px-2 py-0.5 rounded-full">
                    {interval}s
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-bold text-stone-400">3s</span>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    step={1}
                    value={interval}
                    disabled={!autoplay}
                    onChange={(e) => onUpdateSliderConfig('hero_slider_interval', parseInt(e.target.value, 10))}
                    className="w-full accent-[#FF6B00] h-1.5 bg-stone-200 dark:bg-stone-700 rounded-lg cursor-pointer disabled:opacity-40"
                  />
                  <span className="text-[10px] font-bold text-stone-400">12s</span>
                </div>
                {/* Presets rápidos */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-stone-400 font-medium">Ajuste rápido:</span>
                  <div className="flex items-center gap-1">
                    {[3, 5, 8, 10].map((sec) => (
                      <button
                        key={sec}
                        type="button"
                        disabled={!autoplay}
                        onClick={() => onUpdateSliderConfig('hero_slider_interval', sec)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition-all ${
                          interval === sec
                            ? 'bg-[#FF6B00] text-white shadow-2xs'
                            : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Efecto de Transición */}
              <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-stone-800">
                <span className="font-medium text-stone-700 dark:text-stone-300 block">
                  {t('cms.hero.effect') || 'Efecto de Transición'}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSliderConfig('hero_slider_effect', 'fade')}
                    className={`py-1.5 px-3 text-center rounded-xl text-xs font-bold transition-all ${
                      effect === 'fade'
                        ? 'bg-[#FF6B00] text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    Fade (Lujo)
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateSliderConfig('hero_slider_effect', 'slide')}
                    className={`py-1.5 px-3 text-center rounded-xl text-xs font-bold transition-all ${
                      effect === 'slide'
                        ? 'bg-[#FF6B00] text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    Slide
                  </button>
                </div>
              </div>
            </div>

            {/* Tarjeta 2: Controles de Navegación del Visitante */}
            <div className="p-4 rounded-xl bg-white dark:bg-stone-900 border border-stone-200/70 dark:border-stone-800 space-y-4 shadow-2xs flex flex-col justify-between">
              <div>
                <h5 className="font-bold text-stone-800 dark:text-stone-200 text-xs mb-1">
                  Navegación Visual
                </h5>
                <p className="text-[11px] text-stone-400 font-medium mb-3">
                  Elementos interactivos visibles para tus clientes en la web.
                </p>

                <div className="divide-y divide-stone-100 dark:divide-stone-800 space-y-3">
                  {/* Flechas Laterales */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <span className="font-medium text-stone-800 dark:text-stone-200 block">
                        {t('cms.hero.show_arrows') || 'Flechas de Navegación'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Botones laterales anterior/siguiente
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showArrows}
                      onClick={() => onUpdateSliderConfig('hero_slider_show_arrows', !showArrows)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showArrows ? 'bg-[#FF6B00]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          showArrows ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Puntos Indicadores */}
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <span className="font-medium text-stone-800 dark:text-stone-200 block">
                        {t('cms.hero.show_dots') || 'Puntos Indicadores'}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Barra inferior de diapositivas
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={showDots}
                      onClick={() => onUpdateSliderConfig('hero_slider_show_dots', !showDots)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        showDots ? 'bg-[#FF6B00]' : 'bg-stone-300 dark:bg-stone-700'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          showDots ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-stone-800/50 border border-stone-200/50 dark:border-stone-700/50 text-[11px] text-stone-500">
                💡 Consejo: Si activas la reproducción continua (Autoplay), te recomendamos mantener los puntos indicadores visibles.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Carousel of Slide Tabs */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {slides.map((slide, index) => {
          const isActive = index === activeSlideIndex;
          const bgImage = slide.hero_image_url;
          const isVideo = !!slide.hero_video_url;
          const title = slide.hero_title || `Diapositiva ${index + 1}`;

          return (
            <div
              key={slide.id || `slide-${index}`}
              className={`relative group flex-shrink-0 w-44 rounded-2xl p-2.5 transition-all border text-left cursor-pointer ${
                isActive
                  ? 'bg-stone-50 dark:bg-stone-800/80 border-[#FF6B00] shadow-md ring-2 ring-[#FF6B00]/20'
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700'
              }`}
              onClick={() => onSelectSlide(index)}
            >
              {/* Media Thumbnail */}
              <div className="relative w-full h-16 rounded-xl overflow-hidden bg-stone-900 mb-2 border border-stone-200/40 dark:border-stone-800">
                {bgImage ? (
                  <img
                    src={bgImage.startsWith('/') ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${bgImage}` : bgImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                ) : isVideo ? (
                  <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-800">
                    <Film size={20} />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-500 bg-stone-800/60">
                    <ImageIcon size={20} />
                  </div>
                )}
                
                {/* Active Indicator Chip */}
                {isActive && (
                  <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-[#FF6B00] text-white shadow-xs">
                    EDITANDO
                  </span>
                )}

                {/* Media Icon Badge */}
                <span className="absolute bottom-1 right-1 p-1 rounded-md bg-stone-900/80 text-white text-[10px]">
                  {isVideo ? <Film size={10} /> : <ImageIcon size={10} />}
                </span>
              </div>

              {/* Title & Index */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Slide {index + 1}
                  </span>
                  {slide.hero_price_enabled && (
                    <span className="text-[10px] font-semibold text-[#FF6B00]">
                      {slide.hero_price_amount ? `${slide.hero_price_amount}${slide.hero_price_suffix || '€'}` : 'Precio'}
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-stone-800 dark:text-stone-200 truncate" title={title}>
                  {title}
                </h4>
              </div>

              {/* Action Buttons Toolbar on Hover / Active */}
              <div 
                className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Move Left */}
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => onMoveSlide(index, index - 1)}
                  title={t('cms.hero.move_left') || 'Mover hacia la izquierda'}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <ChevronLeft size={13} />
                </button>

                {/* Move Right */}
                <button
                  type="button"
                  disabled={index === slides.length - 1}
                  onClick={() => onMoveSlide(index, index + 1)}
                  title={t('cms.hero.move_right') || 'Mover hacia la derecha'}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 disabled:opacity-20 hover:bg-stone-100 dark:hover:bg-stone-800"
                >
                  <ChevronRight size={13} />
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => onDuplicateSlide(index)}
                  title={t('cms.hero.duplicate_slide') || 'Duplicar diapositiva'}
                  className="p-1 rounded-lg text-stone-400 hover:text-[#FF6B00] hover:bg-orange-500/10 transition-colors"
                >
                  <Copy size={13} />
                </button>

                {/* Delete */}
                {confirmDeleteIndex === index ? (
                  <div className="flex items-center gap-1 bg-red-50 dark:bg-red-950/60 p-0.5 rounded-lg border border-red-200 dark:border-red-900">
                    <button
                      type="button"
                      onClick={() => handleDelete(index)}
                      className="p-1 rounded text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                      title="Confirmar eliminación"
                    >
                      <Check size={11} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteIndex(null)}
                      className="p-1 rounded text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800"
                      title="Cancelar"
                    >
                      <X size={11} />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={slides.length <= 1}
                    onClick={() => setConfirmDeleteIndex(index)}
                    title={slides.length <= 1 ? (t('cms.hero.cannot_delete_only_slide') || 'Debe haber al menos 1 diapositiva') : (t('cms.hero.delete_slide') || 'Eliminar')}
                    className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-20 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add Slide Quick Card */}
        <button
          type="button"
          onClick={onAddSlide}
          className="flex-shrink-0 w-36 h-[178px] rounded-2xl border-2 border-dashed border-stone-200 dark:border-stone-800 hover:border-[#FF6B00] dark:hover:border-[#FF6B00] bg-stone-50/50 dark:bg-stone-900/30 hover:bg-[#FF6B00]/5 flex flex-col items-center justify-center gap-2 text-stone-500 hover:text-[#FF6B00] transition-all group"
        >
          <div className="w-9 h-9 rounded-xl bg-white dark:bg-stone-800 group-hover:bg-[#FF6B00] group-hover:text-white flex items-center justify-center shadow-xs transition-colors">
            <Plus size={18} />
          </div>
          <span className="text-xs font-medium text-center px-2">
            {t('cms.hero.add_slide') || '+ Añadir Slide'}
          </span>
        </button>
      </div>
    </div>
  );
}
