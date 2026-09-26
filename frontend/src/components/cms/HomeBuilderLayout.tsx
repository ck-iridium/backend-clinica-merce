import React, { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Monitor, Tablet, Smartphone } from 'lucide-react';

interface HomeBuilderLayoutProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  panel: React.ReactNode;
  preview: React.ReactNode;
  onSave: () => void;
  isSaving: boolean;
  onBack?: () => void;
  viewportDevice?: 'desktop' | 'tablet' | 'mobile';
  onViewportDeviceChange?: (device: 'desktop' | 'tablet' | 'mobile') => void;
}

export default function HomeBuilderLayout({ 
  tabs, 
  activeTab, 
  onTabChange, 
  panel, 
  preview, 
  onSave, 
  isSaving, 
  onBack,
  viewportDevice: controlledDevice,
  onViewportDeviceChange
}: HomeBuilderLayoutProps) {
  const { t } = useLanguage();
  const [internalDevice, setInternalDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const currentDevice = controlledDevice !== undefined ? controlledDevice : internalDevice;
  const setDevice = (dev: 'desktop' | 'tablet' | 'mobile') => {
    if (onViewportDeviceChange) {
      onViewportDeviceChange(dev);
    } else {
      setInternalDevice(dev);
    }
  };

  const titleText = t('cms.edit_homepage');
  const subtitleText = t('cms.visual_cms');
  const saveBtnText = isSaving ? t('cms.saving') : t('cms.save');

  return (
    <div className="flex flex-col md:flex-row h-screen overflow-hidden bg-[#FAFAFA] w-full animate-in fade-in duration-300">
      
      {/* ─── PANEL IZQUIERDO: Configuración (30% Desktop) ─────────────────────────────── */}
      <aside className="w-full md:w-[32%] md:min-w-[370px] md:max-w-[460px] h-full bg-white border-r border-stone-200 flex flex-col shadow-sm overflow-hidden shrink-0 z-20">
        
        {/* Cabecera del Panel */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center gap-4 shrink-0">
          {onBack && (
            <button 
              onClick={onBack}
              className="text-stone-400 hover:text-stone-800 transition-colors p-1.5 rounded-xl hover:bg-stone-50 border border-transparent hover:border-stone-100 shrink-0"
              title="Volver al panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h2 className="font-serif text-lg font-semibold text-stone-800 leading-tight truncate">
              {titleText}
            </h2>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest truncate">
              {subtitleText}
            </p>
          </div>
          <div className="shrink-0 flex gap-2">
            <button
              onClick={onSave}
              disabled={isSaving}
              className="bg-stone-900 hover:bg-[#d4af37] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-30 shadow-sm"
            >
              {saveBtnText}
            </button>
          </div>
        </div>

        {/* Navegación por Pestañas */}
        <div className="flex px-6 pt-4 gap-4 border-b border-stone-100 shrink-0 overflow-x-auto hide-scroll">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => onTabChange(tab)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border-b-2 ${
                activeTab === tab
                  ? 'border-[#d4af37] text-stone-800'
                  : 'border-transparent text-stone-400 hover:text-stone-600'
              }`}
            >
              {tab === 'HERO' 
                ? t('cms.tabs.hero')
                : tab === 'SOBRE MÍ' 
                ? t('cms.tabs.about') 
                : tab === 'CATEGORÍAS' 
                ? t('cms.tabs.categories') 
                : tab === 'CTA'
                ? t('cms.tabs.cta')
                : tab === 'SEO'
                ? t('cms.tabs.seo')
                : tab}
            </button>
          ))}
        </div>

        {/* Área de Formulario */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-stone-50/30">
          {panel}
        </div>
      </aside>

      {/* ─── PANEL DERECHO: Live Preview (Responsive Canvas) ────────────────────────────────── */}
      <div className="hidden md:flex flex-1 h-full overflow-y-auto bg-stone-100/70 relative flex-col">
        
        {/* Barra Superior del Preview con selector de resolución */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-stone-200/80 px-6 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-widest text-stone-600">
              {t('cms.live_preview')}
            </span>
            <span className="text-[10px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md uppercase">
              {currentDevice === 'desktop' ? 'Desktop 100%' : currentDevice === 'tablet' ? 'Tablet 768px' : 'Móvil 390px'}
            </span>
          </div>

          {/* Conmutador de Dispositivos (Desktop / Tablet / Móvil) */}
          <div className="flex items-center bg-stone-100/80 p-1 rounded-xl border border-stone-200/60 shadow-inner">
            <button
              type="button"
              onClick={() => setDevice('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentDevice === 'desktop'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Resolución de Escritorio (Desktop)"
            >
              <Monitor className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden lg:inline text-[11px]">Desktop</span>
            </button>

            <button
              type="button"
              onClick={() => setDevice('tablet')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentDevice === 'tablet'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Resolución de Tablet (768px)"
            >
              <Tablet className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden lg:inline text-[11px]">Tablet</span>
            </button>

            <button
              type="button"
              onClick={() => setDevice('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                currentDevice === 'mobile'
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/50'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
              title="Resolución de Smartphone (390px)"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
              <span className="hidden lg:inline text-[11px]">Móvil</span>
            </button>
          </div>
        </div>

        {/* CONTENEDOR DEL PREVIEW (Adaptativo por resolución y Centrado según pantalla) */}
        <div className="flex-1 w-full overflow-y-auto flex items-center justify-center p-3 lg:p-6 custom-scrollbar bg-stone-100/70">
          {currentDevice === 'desktop' && (
            <div className="w-full bg-white min-h-full shadow-sm transition-all duration-300">
              {preview}
            </div>
          )}

          {currentDevice === 'tablet' && (
            <div className="w-[780px] max-w-[94vw] h-[calc(100vh-130px)] min-h-[760px] max-h-[980px] my-auto bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-stone-850 overflow-hidden shrink-0 flex flex-col transition-all duration-300">
              <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar flex flex-col bg-white">
                {preview}
              </div>
            </div>
          )}

          {currentDevice === 'mobile' && (
            <div className="w-[420px] max-w-[92vw] h-[calc(100vh-130px)] min-h-[700px] max-h-[880px] my-auto bg-white rounded-[3rem] shadow-2xl border-[8px] border-stone-850 overflow-hidden shrink-0 flex flex-col transition-all duration-300">
              <div className="flex-1 w-full h-full overflow-y-auto custom-scrollbar flex flex-col bg-white">
                {preview}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
