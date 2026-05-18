"use client"
import React from 'react';
import ImageUploadBlock from './ImageUploadBlock';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function AboutTab({ 
  formData, 
  setFormData, 
  setPickerTarget 
}: { 
  formData: any, 
  setFormData: React.Dispatch<React.SetStateAction<any>>, 
  setPickerTarget: React.Dispatch<React.SetStateAction<any>> 
}) {
  const { t } = useLanguage();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
         <h2 className="text-2xl font-serif font-bold text-stone-900 mb-2">
           {t('cms.about.title')}
         </h2>
         <p className="text-stone-500">
           {t('cms.about.subtitle')}
         </p>
      </div>
      <ImageUploadBlock 
        label={t('cms.about.image_label')}
        value={formData.about_image_url} 
        onSelect={() => setPickerTarget({ type: 'form', field: 'about_image_url' })} 
        onClear={() => setFormData((prev: any) => ({ ...prev, about_image_url: '' }))} 
        onUpload={(url) => setFormData((prev: any) => ({ ...prev, about_image_url: url }))}
        accepts="image"
      />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                {t('cms.about.image_position')}
              </label>
              <select 
                value={formData.about_layout || "right"} 
                onChange={e => setFormData((prev: any) => ({ ...prev, about_layout: e.target.value }))} 
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold"
              >
                <option value="left">{t('cms.about.img_left')}</option>
                <option value="right">{t('cms.about.img_right')}</option>
              </select>
           </div>
           <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                {t('cms.about.section_title')}
              </label>
              <input 
                type="text" 
                value={formData.about_title || ""} 
                onChange={e => setFormData((prev: any) => ({ ...prev, about_title: e.target.value }))} 
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" 
              />
           </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.about.bio_philosophy')}
          </label>
          <textarea 
            rows={8} 
            value={formData.about_text || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, about_text: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-medium leading-relaxed" 
          />
        </div>

        <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('cms.about.action_button_opt')}
            </label>
            <button 
              onClick={() => setFormData((prev: any) => ({ ...prev, about_show_button: !prev.about_show_button }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.about_show_button ? 'bg-[#d4af37]' : 'bg-stone-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.about_show_button ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {formData.about_show_button && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  {t('cms.about.button_text')}
                </label>
                <input 
                  type="text" 
                  value={formData.about_button_text || ""} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, about_button_text: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  {t('cms.about.button_link')}
                </label>
                <input 
                  type="text" 
                  value={formData.about_button_link || ""} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, about_button_link: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
