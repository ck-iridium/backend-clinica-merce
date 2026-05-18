"use client"
import React from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function SeoTab({ 
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
           {t('cms.seo.title')}
         </h2>
         <p className="text-stone-500">
           {t('cms.seo.subtitle')}
         </p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.seo.page_title')}
          </label>
          <input 
            type="text" 
            value={formData.seo_title || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, seo_title: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" 
            placeholder={t('cms.seo.placeholder')} 
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.seo.description')}
          </label>
          <textarea 
            rows={4} 
            value={formData.seo_description || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, seo_description: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.seo.keywords')}
          </label>
          <input 
            type="text" 
            value={formData.seo_keywords || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, seo_keywords: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium" 
          />
        </div>
      </div>
    </div>
  );
}
