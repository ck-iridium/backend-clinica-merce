"use client";

import { Palette, Sparkles } from 'lucide-react';
import { RefObject } from 'react';
import HeaderLogoSection from './branding/HeaderLogoSection';
import MobileLogoSection from './branding/MobileLogoSection';
import FaviconSection from './branding/FaviconSection';
import FooterLogoSection from './branding/FooterLogoSection';
import ThemeStyleSection, { PREMIUM_FONTS_HEADINGS, PREMIUM_FONTS_BODY } from './branding/ThemeStyleSection';

export { PREMIUM_FONTS_HEADINGS, PREMIUM_FONTS_BODY };

interface BrandingTabProps {
  settings: any;
  setSettings: (settings: any) => void;
  logoAppRef: RefObject<HTMLInputElement>;
  handleImageUpload: (field: string, e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function BrandingTab({ 
  settings, 
  setSettings, 
  logoAppRef, 
  handleImageUpload 
}: BrandingTabProps) {
  
  // Helper de actualización unificado y seguro
  const updateSetting = (field: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [field]: value
    }));
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

      {/* ── BENTO GRID PRINCIPAL DE IDENTIDAD & CALIBRACIÓN ── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* 1. SECCIÓN: LOGO ESCRITORIO (CABECERA) */}
        <HeaderLogoSection 
          settings={settings}
          updateSetting={updateSetting}
          logoAppRef={logoAppRef}
          handleImageUpload={handleImageUpload}
        />

        {/* 2. SECCIÓN: LOGO MÓVIL DEDICADO */}
        <MobileLogoSection 
          settings={settings}
          updateSetting={updateSetting}
          handleImageUpload={handleImageUpload}
        />

        {/* 3. SECCIÓN: FAVICON */}
        <FaviconSection 
          settings={settings}
          updateSetting={updateSetting}
          handleImageUpload={handleImageUpload}
        />

        {/* 4. SECCIÓN: LOGO FOOTER DEDICADO */}
        <FooterLogoSection 
          settings={settings}
          updateSetting={updateSetting}
          handleImageUpload={handleImageUpload}
        />

        {/* 5. SECCIÓN: PALETA DE COLORES, TIPOGRAFÍA & GEOMETRÍA */}
        <ThemeStyleSection 
          settings={settings}
          setSettings={setSettings}
          updateSetting={updateSetting}
        />

      </div>

    </div>
  );
}
