"use client";
import React from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { cleanTitle, getPreviewImageUrl } from './previewUtils';

interface PreviewAboutSectionProps {
  formData: any;
  viewportDevice?: 'desktop' | 'tablet' | 'mobile';
}

export const PreviewAboutSection = React.memo(function PreviewAboutSection({
  formData,
  viewportDevice = 'desktop'
}: PreviewAboutSectionProps) {
  const { translate, t } = useLanguage();

  return (
    <section className="py-12 md:py-16 bg-white flex items-center select-none">
      {viewportDevice === 'mobile' ? (
        <div className="px-6 flex flex-col items-center text-center w-full space-y-4">
          <h2 className="text-2xl font-serif font-extrabold text-stone-900 leading-tight">
            {cleanTitle(translate(formData?.about_title || 'Sobre Nosotros', formData?.translations, 'about_title'))}
          </h2>

          {formData?.about_image_url ? (
            <div className="rounded-[2.5rem] overflow-hidden shadow-2xl aspect-[4/5] w-full max-w-[280px] mx-auto relative group shrink-0">
              <img src={getPreviewImageUrl(formData.about_image_url)} alt="Sobre Mí" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-stone-900/5 mix-blend-multiply"></div>
            </div>
          ) : (
            <div className="rounded-[2.5rem] bg-stone-50 aspect-[4/5] w-full max-w-[280px] mx-auto flex flex-col items-center justify-center text-stone-300 border-2 border-dashed border-stone-200">
              <ImageIcon size={40} strokeWidth={1} />
              <p className="font-bold text-[9px] uppercase tracking-widest mt-3">
                {t('cms.section_image')}
              </p>
            </div>
          )}

          <div className="text-xs text-stone-600 leading-relaxed whitespace-pre-wrap font-medium max-w-sm px-2">
            {translate(formData?.about_text || 'Texto introductorio sobre la filosofía de la clínica...', formData?.translations, 'about_text')}
          </div>

          {formData?.about_show_button && (
            <div className="pt-2">
              <div className="inline-block border border-stone-200 text-stone-800 px-7 py-2.5 rounded-full font-bold text-[11px] uppercase tracking-widest">
                {translate(formData?.about_button_text || 'Saber Más', formData?.translations, 'about_button_text')}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className={`px-12 grid grid-cols-1 md:grid-cols-2 gap-12 items-center w-full ${formData?.about_layout === 'left' ? 'md:flex-row-reverse' : ''}`}>
          <div className={`space-y-6 ${formData?.about_layout === 'left' ? 'order-2' : 'order-1'}`}>
            <h2 className="text-3xl font-serif font-extrabold text-stone-900 leading-tight">
              {cleanTitle(translate(formData?.about_title || 'Sobre Nosotros', formData?.translations, 'about_title'))}
            </h2>
            <div className="text-sm text-stone-500 leading-relaxed whitespace-pre-wrap font-medium">
              {translate(formData?.about_text || 'Texto introductorio sobre la filosofía de la clínica...', formData?.translations, 'about_text')}
            </div>
            {formData?.about_show_button && (
              <div className="pt-2">
                <div className="inline-block border border-stone-200 text-stone-800 px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest">
                  {translate(formData?.about_button_text || 'Saber Más', formData?.translations, 'about_button_text')}
                </div>
              </div>
            )}
          </div>
          <div className={`${formData?.about_layout === 'left' ? 'order-1' : 'order-2'}`}>
            {formData?.about_image_url ? (
              <div className="rounded-3xl overflow-hidden shadow-luxury aspect-[4/5] w-full max-w-[400px] mx-auto relative group transition-transform hover:scale-[1.02] duration-500">
                <img src={getPreviewImageUrl(formData.about_image_url)} alt="Sobre Mí" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-stone-900/5 mix-blend-multiply"></div>
              </div>
            ) : (
              <div className="rounded-3xl bg-stone-50 aspect-[4/5] w-full max-w-[400px] mx-auto flex flex-col items-center justify-center text-stone-300 border-2 border-dashed border-stone-200">
                <ImageIcon size={48} strokeWidth={1} />
                <p className="font-bold text-[10px] uppercase tracking-widest mt-4">
                  {t('cms.section_image')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
});

PreviewAboutSection.displayName = 'PreviewAboutSection';

