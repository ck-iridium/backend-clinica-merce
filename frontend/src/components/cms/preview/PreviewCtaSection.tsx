"use client";
import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { cleanTitle } from './previewUtils';

interface PreviewCtaSectionProps {
  formData: any;
}

export const PreviewCtaSection = React.memo(function PreviewCtaSection({
  formData
}: PreviewCtaSectionProps) {
  const { translate } = useLanguage();

  return (
    <section className="flex flex-col justify-center w-full py-16 bg-[#d4af37] text-stone-900 text-center px-6 select-none">
      <div className="max-w-xl mx-auto space-y-4 w-full">
        <h2 className="text-3xl font-extrabold tracking-tight">
          {cleanTitle(translate(formData?.cta_title || 'Llamada a la Acción', formData?.translations, 'cta_title'))}
        </h2>
        <p className="text-stone-800 text-sm leading-relaxed max-w-md mx-auto">
          {translate(formData?.cta_subtitle || 'Texto descriptivo para invitar al usuario a realizar una acción.', formData?.translations, 'cta_subtitle')}
        </p>
        <div className="pt-2">
          <div className="inline-block bg-stone-950 text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest shadow-md">
            {translate(formData?.cta_button_text || 'Reservar Cita', formData?.translations, 'cta_button_text')}
          </div>
        </div>
      </div>
    </section>
  );
});

PreviewCtaSection.displayName = 'PreviewCtaSection';

