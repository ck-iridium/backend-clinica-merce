"use client"
import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function CtaTab({ 
  formData, 
  setFormData 
}: { 
  formData: any, 
  setFormData: React.Dispatch<React.SetStateAction<any>> 
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
         <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
           {t('cms.cta.title')}
         </h2>
         <p className="text-stone-500">
           {t('cms.cta.subtitle')}
         </p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.cta.cta_title')}
          </label>
          <input 
            type="text" 
            value={formData.cta_title || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, cta_title: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.cta.cta_subtitle')}
          </label>
          <input 
            type="text" 
            value={formData.cta_subtitle || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, cta_subtitle: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium" 
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {t('cms.cta.button_text')}
            </label>
            <input 
              type="text" 
              value={formData.cta_button_text || ""} 
              onChange={e => setFormData((prev: any) => ({ ...prev, cta_button_text: e.target.value }))} 
              className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" 
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {t('cms.cta.link')}
            </label>
            <input 
              type="text" 
              value={formData.cta_button_link || ""} 
              onChange={e => setFormData((prev: any) => ({ ...prev, cta_button_link: e.target.value }))} 
              className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
