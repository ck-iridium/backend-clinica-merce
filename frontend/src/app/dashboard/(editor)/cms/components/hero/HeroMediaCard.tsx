"use client";
import React, { useState } from 'react';
import ImageUploadBlock from '../ImageUploadBlock';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { ImageIcon, Film } from 'lucide-react';
import { HeroSlideData } from './types';

interface HeroMediaCardProps {
  data: HeroSlideData;
  onChange: (field: string, value: any) => void;
  setPickerTarget: React.Dispatch<React.SetStateAction<any>>;
}

export default function HeroMediaCard({
  data,
  onChange,
  setPickerTarget
}: HeroMediaCardProps) {
  const { t } = useLanguage();
  const [mediaTypeTab, setMediaTypeTab] = useState<'image' | 'video'>(
    data.hero_video_url ? 'video' : 'image'
  );

  return (
    <div className="p-6 rounded-3xl bg-stone-50/70 dark:bg-stone-900/40 border border-stone-200/70 dark:border-stone-800 shadow-sm space-y-4">
      {/* Cabecera a ancho completo */}
      <div className="space-y-3 pb-3 border-b border-stone-200/60 dark:border-stone-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#d4af37] shrink-0">
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
        
        {/* Fila dedicada para botones de Imagen / Vídeo */}
        <div className="grid grid-cols-2 bg-stone-200/60 dark:bg-stone-800 p-1 rounded-xl text-xs font-bold w-full">
          <button
            type="button"
            onClick={() => setMediaTypeTab('image')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mediaTypeTab === 'image' 
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <ImageIcon size={14} />
            {t('cms.hero.tab_image') || 'Imagen'}
          </button>
          <button
            type="button"
            onClick={() => setMediaTypeTab('video')}
            className={`py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mediaTypeTab === 'video' 
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-white shadow-xs' 
                : 'text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
            }`}
          >
            <Film size={14} />
            {t('cms.hero.tab_video') || 'Vídeo (Opcional)'}
            {data.hero_video_url && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            )}
          </button>
        </div>
      </div>

      {mediaTypeTab === 'image' ? (
        <div>
          <ImageUploadBlock 
            label={t('cms.hero.main_image')}
            value={data.hero_image_url ?? null} 
            onSelect={() => setPickerTarget({ type: 'form', field: 'hero_image_url' })} 
            onClear={() => onChange('hero_image_url', '')} 
            onUpload={(url) => onChange('hero_image_url', url)}
            accepts="image"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <ImageUploadBlock 
            label={t('cms.hero.bg_video')}
            value={data.hero_video_url ?? null} 
            onSelect={() => setPickerTarget({ type: 'form', field: 'hero_video_url' })} 
            onClear={() => onChange('hero_video_url', '')} 
            onUpload={(url) => onChange('hero_video_url', url)}
            accepts="video"
          />
          <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
            {t('cms.hero.video_hint') || 'Nota: El vídeo se reproducirá automáticamente en bucle y silenciado en la portada reemplazando la imagen estática.'}
          </p>
        </div>
      )}
    </div>
  );
}
