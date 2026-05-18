"use client"
import React from 'react';
import ImageUploadBlock from './ImageUploadBlock';
import { useLanguage } from '@/app/contexts/LanguageContext';

export default function HeroTab({ 
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
      <ImageUploadBlock 
        label={t('cms.hero.main_image')}
        value={formData.hero_image_url} 
        onSelect={() => setPickerTarget({ type: 'form', field: 'hero_image_url' })} 
        onClear={() => setFormData((prev: any) => ({ ...prev, hero_image_url: '' }))} 
        onUpload={(url) => setFormData((prev: any) => ({ ...prev, hero_image_url: url }))}
        accepts="image"
      />
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.hero.main_title')}
          </label>
          <input 
            type="text" 
            value={formData.hero_title || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, hero_title: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all font-serif font-bold text-lg" 
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.hero.subtitle')}
          </label>
          <textarea 
            rows={2} 
            value={formData.hero_subtitle || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, hero_subtitle: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 transition-all font-medium text-sm" 
          />
        </div>
        <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('cms.hero.action_button')}
            </label>
            <button 
              onClick={() => setFormData((prev: any) => ({ ...prev, hero_show_button: !prev.hero_show_button }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.hero_show_button ? 'bg-[#d4af37]' : 'bg-stone-300'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.hero_show_button ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
          
          {formData.hero_show_button && (
            <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  {t('cms.hero.button_text')}
                </label>
                <input 
                  type="text" 
                  value={formData.hero_button_text || ""} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, hero_button_text: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-stone-400 mb-2">
                  {t('cms.hero.button_link')}
                </label>
                <input 
                  type="text" 
                  value={formData.hero_button_link || ""} 
                  onChange={e => setFormData((prev: any) => ({ ...prev, hero_button_link: e.target.value }))} 
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm" 
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {t('cms.hero.vertical_alignment')}
            </label>
            <select 
              value={formData.hero_alignment || "center"} 
              onChange={e => setFormData((prev: any) => ({ ...prev, hero_alignment: e.target.value }))} 
              className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold"
            >
              <option value="top">{t('cms.hero.alignment_top')}</option>
              <option value="center">{t('cms.hero.alignment_center')}</option>
              <option value="bottom">{t('cms.hero.alignment_bottom')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
              {t('cms.hero.horizontal_alignment')}
            </label>
            <select 
              value={formData.hero_horizontal_alignment || "center"} 
              onChange={e => setFormData((prev: any) => ({ ...prev, hero_horizontal_alignment: e.target.value }))} 
              className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#d4af37]/30 text-sm font-bold"
            >
              <option value="left">{t('cms.hero.alignment_left')}</option>
              <option value="center">{t('cms.hero.alignment_center')}</option>
              <option value="right">{t('cms.hero.alignment_right')}</option>
            </select>
          </div>
        </div>
      </div>
      <div className="pt-8 border-t border-border/30 mt-8">
        <ImageUploadBlock 
          label={t('cms.hero.bg_video')}
          value={formData.hero_video_url} 
          onSelect={() => setPickerTarget({ type: 'form', field: 'hero_video_url' })} 
          onClear={() => setFormData((prev: any) => ({ ...prev, hero_video_url: '' }))} 
          onUpload={(url) => setFormData((prev: any) => ({ ...prev, hero_video_url: url }))}
          accepts="video"
        />
      </div>
    </div>
  );
}
