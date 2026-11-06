"use client";

import React from 'react';
import { Palette, Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/color-picker';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MarketingSettings } from './types';

interface SaaSCMSBrandingFormProps {
  settings: MarketingSettings;
  onChange: (updates: Partial<MarketingSettings>) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
  loading?: boolean;
}

export default function SaaSCMSBrandingForm({
  settings,
  onChange,
  onSave,
  saving,
  loading = false,
}: SaaSCMSBrandingFormProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-4 w-32 bg-stone-100 rounded"></div>
        <div className="h-10 w-full bg-stone-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-5">
      <form onSubmit={onSave} className="space-y-5 select-text">
        {/* 1. TIPOGRAFÍA Y GROSOR DE TÍTULOS / ENCABEZADOS */}
        <div className="space-y-3 p-4 bg-stone-50/80 rounded-2xl border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between border-b border-stone-200/70 pb-2">
            <div>
              <label className="text-[10px] font-black text-stone-800 uppercase tracking-widest block">
                Tipografía de Títulos / Encabezados
              </label>
              <span className="text-[9px] text-stone-400 font-medium">Afecta a H1, H2, H3 y Hero</span>
            </div>
            <span className="text-[9px] text-[#997715] font-bold bg-[#fcf8e5] px-2 py-0.5 rounded-full border border-[#D4AF37]/30">
              Hero & Títulos
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {/* Selector de Fuente */}
            <div className="space-y-1">
              <label className="text-[8.5px] font-bold text-stone-500 uppercase tracking-wider block">
                Familia Tipográfica
              </label>
              <Select
                value={
                  settings.font_family === 'playfair_inter' ? 'playfair' :
                  settings.font_family === 'cormorant_montserrat' ? 'cormorant' :
                  settings.font_family === 'cinzel_roboto' ? 'cinzel' :
                  (settings.font_family || 'playfair')
                }
                onValueChange={(val) => onChange({ font_family: val })}
              >
                <SelectTrigger className="h-10 text-xs bg-white border-stone-200">
                  <SelectValue placeholder="Seleccionar tipografía" />
                </SelectTrigger>
                <SelectContent className="bg-white border-stone-200 shadow-xl rounded-xl">
                  <SelectItem value="playfair" className="text-xs font-medium">Playfair Display (Serif Lujo)</SelectItem>
                  <SelectItem value="cormorant" className="text-xs font-medium">Cormorant Garamond (Boutique)</SelectItem>
                  <SelectItem value="cinzel" className="text-xs font-medium">Cinzel (Imperial / Clásica)</SelectItem>
                  <SelectItem value="outfit" className="text-xs font-medium">Outfit (Geométrica)</SelectItem>
                  <SelectItem value="plus_jakarta_sans" className="text-xs font-medium">Plus Jakarta Sans (SaaS)</SelectItem>
                  <SelectItem value="montserrat" className="text-xs font-medium">Montserrat (Equilibrada)</SelectItem>
                  <SelectItem value="fredoka" className="text-xs font-medium">Fredoka (Redondeada)</SelectItem>
                  <SelectItem value="inter" className="text-xs font-medium">Inter (Minimalista)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Selector de Grosor / Peso */}
            <div className="space-y-1">
              <label className="text-[8.5px] font-bold text-stone-500 uppercase tracking-wider block">
                Grosor / Peso (Font Weight)
              </label>
              <Select
                value={settings.font_weight_headings || 'semibold'}
                onValueChange={(val) => onChange({ font_weight_headings: val })}
              >
                <SelectTrigger className="h-10 text-xs bg-white border-stone-200">
                  <SelectValue placeholder="Seleccionar grosor" />
                </SelectTrigger>
                <SelectContent className="bg-white border-stone-200 shadow-xl rounded-xl">
                  <SelectItem value="light" className="text-xs font-light">Fino (Light - 300)</SelectItem>
                  <SelectItem value="normal" className="text-xs font-normal">Regular (Normal - 400)</SelectItem>
                  <SelectItem value="medium" className="text-xs font-medium">Medio (Medium - 500)</SelectItem>
                  <SelectItem value="semibold" className="text-xs font-semibold">Semibold (Imprenta - 600)</SelectItem>
                  <SelectItem value="bold" className="text-xs font-bold">Bold (Sólido - 700)</SelectItem>
                  <SelectItem value="extrabold" className="text-xs font-extrabold">Extra Bold (800)</SelectItem>
                  <SelectItem value="black" className="text-xs font-black">Black (Máximo - 900)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* 2. TIPOGRAFÍA DE TEXTO Y CUERPO (BODY) */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest block">
              Tipografía de Texto y Cuerpo (Body)
            </label>
            <span className="text-[9px] text-stone-400 font-semibold">Subtítulos & Párrafos</span>
          </div>
          <Select
            value={
              settings.font_family_body || (
                settings.font_family === 'cormorant_montserrat' ? 'montserrat' :
                settings.font_family === 'cinzel_roboto' ? 'roboto' :
                'inter'
              )
            }
            onValueChange={(val) => onChange({ font_family_body: val })}
          >
            <SelectTrigger className="h-10 text-xs bg-white border-stone-200">
              <SelectValue placeholder="Seleccionar tipografía del cuerpo" />
            </SelectTrigger>
            <SelectContent className="bg-white border-stone-200 shadow-xl rounded-xl">
              <SelectItem value="inter" className="text-xs font-medium">Inter (Limpia & Ultra Legible)</SelectItem>
              <SelectItem value="plus_jakarta_sans" className="text-xs font-medium">Plus Jakarta Sans (Moderna & Clara)</SelectItem>
              <SelectItem value="montserrat" className="text-xs font-medium">Montserrat (Elegante & Nítida)</SelectItem>
              <SelectItem value="outfit" className="text-xs font-medium">Outfit (Geométrica & Espaciosa)</SelectItem>
              <SelectItem value="dm_sans" className="text-xs font-medium">DM Sans (Suave & Minimalista)</SelectItem>
              <SelectItem value="roboto" className="text-xs font-medium">Roboto (Neutral & Técnica)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 3 Colors in 1 Row */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest block border-b border-stone-100 pb-1">
            Paleta de Colores de la Landing
          </label>
          
          <div className="grid grid-cols-3 gap-3">
            {/* Primary Color */}
            <div className="space-y-1">
              <label className="text-[8px] font-black text-stone-500 uppercase tracking-wider block truncate">
                Primario
              </label>
              <ColorPicker 
                value={settings.primary_color || '#3b82f6'} 
                onChange={(val) => onChange({ primary_color: val })}
                label="Primario"
              />
            </div>
            
            {/* Secondary Color */}
            <div className="space-y-1">
              <label className="text-[8px] font-black text-stone-500 uppercase tracking-wider block truncate">
                Secundario
              </label>
              <ColorPicker 
                value={settings.secondary_color || '#1c1917'} 
                onChange={(val) => onChange({ secondary_color: val })}
                label="Secundario"
              />
            </div>

            {/* Tertiary Color */}
            <div className="space-y-1">
              <label className="text-[8px] font-black text-stone-500 uppercase tracking-wider block truncate">
                Terciario
              </label>
              <ColorPicker 
                value={settings.tertiary_color || '#d4af37'} 
                onChange={(val) => onChange({ tertiary_color: val })}
                label="Terciario"
              />
            </div>
          </div>
        </div>

        {/* Logo SVG */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest block flex justify-between items-center">
            <span>Logotipo (SVG)</span>
            {settings.logo_svg && (
              <span className="text-[8px] text-[#d4af37] font-bold">Cargado</span>
            )}
          </label>

          {/* SVG Dropzone / File Uploader */}
          <div className="border border-dashed border-stone-200 rounded-xl p-3 hover:bg-stone-50/50 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer relative">
            <input 
              type="file" 
              accept=".svg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    if (text.includes('<svg')) {
                      onChange({ logo_svg: text });
                      toast.success('¡Logotipo SVG cargado con éxito!');
                    } else {
                      toast.error('El archivo no parece ser un SVG válido.');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] text-stone-500 font-medium">Arrastra o sube tu archivo .svg aquí</p>
          </div>

          {settings.logo_svg && (
            <div className="p-3 bg-stone-50 border border-stone-150 rounded-xl flex items-center justify-center max-h-[60px] overflow-hidden relative group">
              <div 
                className="h-8 w-full flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: settings.logo_svg }}
              />
              <button
                type="button"
                onClick={() => onChange({ logo_svg: null })}
                className="absolute right-2 top-2 text-[8px] bg-red-50 text-red-600 px-2 py-0.5 rounded-md hover:bg-red-100 transition-colors font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 duration-300"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Logo Footer SVG */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest block flex justify-between items-center">
            <span>Logotipo del Footer (SVG / Versión Blanca)</span>
            {settings.logo_footer_svg && (
              <span className="text-[8px] text-[#d4af37] font-bold">Cargado</span>
            )}
          </label>

          {/* SVG Dropzone / File Uploader */}
          <div className="border border-dashed border-stone-200 rounded-xl p-3 hover:bg-stone-50/50 transition-colors flex flex-col items-center justify-center gap-1.5 cursor-pointer relative">
            <input 
              type="file" 
              accept=".svg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const text = event.target?.result as string;
                    if (text.includes('<svg')) {
                      onChange({ logo_footer_svg: text });
                      toast.success('¡Logotipo del footer SVG cargado con éxito!');
                    } else {
                      toast.error('El archivo no parece ser un SVG válido.');
                    }
                  };
                  reader.readAsText(file);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="w-7 h-7 rounded-lg bg-stone-100 text-stone-600 flex items-center justify-center">
              <Palette className="w-3.5 h-3.5" />
            </div>
            <p className="text-[9px] text-stone-500 font-medium">Sube el SVG en blanco o especial para el fondo del footer</p>
          </div>

          {settings.logo_footer_svg && (
            <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-center max-h-[60px] overflow-hidden relative group">
              <div 
                className="h-8 w-full flex items-center justify-center [&>svg]:h-full [&>svg]:w-auto [&>svg]:max-w-full"
                dangerouslySetInnerHTML={{ __html: settings.logo_footer_svg }}
              />
              <button
                type="button"
                onClick={() => onChange({ logo_footer_svg: null })}
                className="absolute right-2 top-2 text-[8px] bg-red-900/60 text-red-200 px-2 py-0.5 rounded-md hover:bg-red-800 transition-colors font-bold uppercase tracking-wider opacity-0 group-hover:opacity-100 duration-300"
              >
                Eliminar
              </button>
            </div>
          )}
        </div>

        {/* Favicon Uploader */}
        <div className="space-y-1.5">
          <label className="text-[9px] font-black text-stone-400 uppercase tracking-widest block flex justify-between items-center">
            <span>Favicon (.ico, .png, .svg)</span>
            {settings.favicon_url && (
              <span className="text-[8px] text-[#d4af37] font-bold">Cargado</span>
            )}
          </label>

          <div className="flex items-center gap-3">
            {/* Preview */}
            <div className="w-10 h-10 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-center overflow-hidden shrink-0">
              {settings.favicon_url ? (
                <img src={settings.favicon_url} alt="Favicon" className="w-5 h-5 object-contain" />
              ) : (
                <Globe className="w-4 h-4 text-stone-400" />
              )}
            </div>

            {/* File Input */}
            <div className="flex-1 relative border border-dashed border-stone-200 rounded-xl px-4 py-2 hover:bg-stone-50/50 transition-colors flex items-center justify-center gap-2 cursor-pointer h-10">
              <input 
                type="file" 
                accept=".ico,.png,.svg"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      const base64 = event.target?.result as string;
                      onChange({ favicon_url: base64 });
                      toast.success('¡Favicon cargado con éxito!');
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <span className="text-[9px] text-stone-500 font-bold uppercase tracking-wider">Subir Favicon</span>
            </div>
          </div>
        </div>

        <Button 
          type="submit"
          variant="luxury"
          disabled={saving}
          className="w-full py-3 h-11"
        >
          {saving ? 'Guardando Ajustes...' : 'Guardar Branding'}
        </Button>
      </form>
    </div>
  );
}

