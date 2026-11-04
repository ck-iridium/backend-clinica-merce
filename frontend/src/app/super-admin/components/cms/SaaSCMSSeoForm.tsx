"use client";

import React from 'react';
import { Globe } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MarketingSettings } from './types';

interface SaaSCMSSeoFormProps {
  settings: MarketingSettings;
  onChange: (updates: Partial<MarketingSettings>) => void;
  onSave: (e: React.FormEvent) => void;
  saving: boolean;
  loading?: boolean;
}

export default function SaaSCMSSeoForm({
  settings,
  onChange,
  onSave,
  saving,
  loading = false,
}: SaaSCMSSeoFormProps) {
  if (loading) {
    return (
      <div className="p-6 space-y-4 animate-pulse">
        <div className="h-4 w-32 bg-stone-100 rounded"></div>
        <div className="h-10 w-full bg-stone-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="bg-stone-50 border border-stone-200 p-4 rounded-xl space-y-1">
        <h4 className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-stone-600" /> Posicionamiento en Buscadores (SEO)
        </h4>
        <p className="text-[10px] text-stone-500 leading-relaxed font-medium">
          Optimiza la indexación del SaaS corporativo de ProBookia en buscadores de Google, Bing y redes sociales.
        </p>
      </div>

      <form onSubmit={onSave} className="space-y-6 select-text">
        {/* SEO Title */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
            Meta Título (SEO Title)
          </label>
          <Input 
            type="text" 
            value={settings.seo_title || ''}
            onChange={(e) => onChange({ seo_title: e.target.value })}
            placeholder="Probookia | El SaaS de Gestión Premium..."
            className="w-full text-xs font-sans"
          />
        </div>

        {/* SEO Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
            Meta Descripción (SEO Description)
          </label>
          <Textarea 
            rows={4}
            value={settings.seo_description || ''}
            onChange={(e) => onChange({ seo_description: e.target.value })}
            placeholder="Describe tu plataforma para los buscadores de Google..."
            className="w-full text-xs font-sans leading-relaxed"
          />
        </div>

        {/* SEO Keywords */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">
            Palabras Clave (SEO Keywords)
          </label>
          <Input 
            type="text" 
            value={settings.seo_keywords || ''}
            onChange={(e) => onChange({ seo_keywords: e.target.value })}
            placeholder="saas, agenda online, estetica"
            className="w-full text-xs font-sans"
          />
        </div>

        <Button 
          type="submit"
          variant="luxury"
          disabled={saving}
          className="w-full py-3 h-11"
        >
          {saving ? 'Guardando Ajustes...' : 'Guardar SEO'}
        </Button>
      </form>
    </div>
  );
}

