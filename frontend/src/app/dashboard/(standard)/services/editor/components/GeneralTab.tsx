import { useState } from 'react';
import { UseFormRegister, Control, UseFormSetValue } from 'react-hook-form';
import { Lock, Unlock, Sparkles, Plus } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Controller } from 'react-hook-form';
import type { ServiceFormData } from '@/components/cms/ServiceEditor';
import CreateCategoryInlineModal from './CreateCategoryInlineModal';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface GeneralTabProps {
  register: UseFormRegister<ServiceFormData>;
  control: Control<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  formValues: ServiceFormData;
  categories: any[];
  refreshCategories: () => void;
  slugLocked: boolean;
  setSlugLocked: (locked: boolean) => void;
  setShowAIModal: (type: 'short_description' | 'rich_content') => void;
}

export default function GeneralTab({
  register,
  control,
  setValue,
  formValues,
  categories,
  refreshCategories,
  slugLocked,
  setSlugLocked,
  setShowAIModal
}: GeneralTabProps) {
  const { t } = useLanguage();
  const [showCreateCat, setShowCreateCat] = useState(false);
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.service_name_label')}</label>
        <input id="service-editor-general-name-input" {...register('name', { required: true })} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 dark:text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" placeholder={t('dashboard.services.service_name_placeholder')} />
      </div>
      <div className="relative group">
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.slug_label')}</label>
        <div className="relative">
          <input 
            id="service-editor-general-slug-input"
            {...register('slug', { required: true })} 
            readOnly={slugLocked}
            className={`w-full pl-4 pr-12 py-3 rounded-xl border outline-none transition-all text-sm font-mono ${slugLocked ? 'bg-stone-50 border-stone-200 text-stone-500 dark:text-stone-500' : 'bg-white border-[#d4af37] text-stone-800 dark:text-stone-800'}`} 
          />
          <button 
            id="service-editor-general-slug-toggle-btn"
            type="button"
            onClick={() => setSlugLocked(!slugLocked)}
            className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${slugLocked ? 'text-stone-400 hover:text-stone-600' : 'bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20'}`}
            title={slugLocked ? t('dashboard.services.slug_unlock') : t('dashboard.services.slug_lock')}
          >
            {slugLocked ? <Lock size={14} /> : <Unlock size={14} />}
          </button>
        </div>
        <p className="text-[10px] text-stone-400 mt-1">{t('dashboard.services.slug_help')}</p>
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">{t('dashboard.services.category_label')}</label>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Controller
              name="category_id"
              control={control}
              rules={{ required: true }}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger id="service-editor-general-category-trigger" className="w-full h-[46px] rounded-xl border-stone-200 bg-white dark:bg-white text-stone-900 dark:text-stone-900 font-semibold shadow-none border dark:border-stone-200">
                    <SelectValue placeholder={t('dashboard.services.select_placeholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <button 
            id="service-editor-general-add-category-btn"
            type="button" 
            onClick={() => setShowCreateCat(true)}
            className="w-[46px] h-[46px] flex items-center justify-center shrink-0 rounded-xl border border-stone-200 bg-stone-50 hover:bg-white hover:border-stone-300 transition-colors text-stone-500"
            title={t('dashboard.services.add_category')}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.price_label')}</label>
          <input id="service-editor-general-price-input" type="number" step="0.01" {...register('price', { required: true, valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 dark:text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" />
        </div>
        <div>
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.duration_label')}</label>
          <input id="service-editor-general-duration-input" type="number" step="15" {...register('duration_minutes', { required: true, valueAsNumber: true })} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 dark:text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">Modalidad Permitida</label>
        <Controller
          name="allowed_modality"
          control={control}
          rules={{ required: true }}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value || 'clinic'}>
              <SelectTrigger id="service-editor-general-modality-trigger" className="w-full h-[46px] rounded-xl border-stone-200 bg-white dark:bg-white text-stone-900 dark:text-stone-900 font-semibold shadow-none border dark:border-stone-200">
                <SelectValue placeholder="Selecciona la modalidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="clinic">Solo en Clínica</SelectItem>
                <SelectItem value="home">Solo a Domicilio</SelectItem>
                <SelectItem value="both">Ambas (Mixto)</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-[10px] text-stone-400 mt-1">
          Configura si este tratamiento puede reservarse solo en clínica, solo a domicilio, o bajo ambas opciones.
        </p>
      </div>

      {/* STRIPE FIANZA CONFIGURATION */}
      <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-4">
        <div className="flex items-center gap-3">
          <label className="relative flex items-center justify-center cursor-pointer select-none">
            <input 
              id="service-editor-general-deposit-checkbox"
              type="checkbox" 
              {...register('requires_deposit')} 
              className="sr-only" 
            />
            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
              formValues.requires_deposit 
                ? 'bg-[#d4af37] border-[#d4af37]' 
                : 'border-stone-300 bg-white hover:border-stone-400'
            }`}>
              {formValues.requires_deposit && (
                <svg className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </label>
          <div>
            <p className="text-sm font-bold text-stone-700">{t('dashboard.services.requires_deposit_title')}</p>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest">{t('dashboard.services.requires_deposit_helper')}</p>
          </div>
        </div>
        {formValues.requires_deposit && (
          <div className="pt-3 border-t border-stone-200 mt-2">
            <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.deposit_amount_label')}</label>
            <input 
              id="service-editor-general-deposit-amount-input"
              type="number" 
              step="0.01" 
              {...register('deposit_amount', { required: formValues.requires_deposit, valueAsNumber: true })} 
              className="w-full sm:w-1/2 px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 dark:text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" 
            />
            <p className="text-[10px] text-stone-400 mt-1">{t('dashboard.services.deposit_amount_helper')}</p>
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">{t('dashboard.services.short_description_label')}</label>
          <button 
            id="service-editor-general-ai-desc-btn"
            type="button" 
            onClick={() => setShowAIModal('short_description')}
            className="flex items-center gap-1.5 text-xs font-bold text-[#d4af37] hover:bg-yellow-50/50 px-2.5 py-1 rounded-lg border border-yellow-100 transition-colors shadow-sm"
          >
            <Sparkles size={12} strokeWidth={2} />
            {t('dashboard.services.generate_ia')}
          </button>
        </div>
        <textarea id="service-editor-general-desc-textarea" {...register('description')} rows={3} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 dark:text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm resize-none" placeholder={t('dashboard.services.short_description_placeholder')} />
      </div>
      
      <div className="flex items-center gap-3 p-4 bg-white border border-stone-200 rounded-xl">
        <label className="relative flex items-center justify-center cursor-pointer select-none">
          <input 
            id="service-editor-general-active-checkbox"
            type="checkbox" 
            {...register('is_active')} 
            className="sr-only" 
          />
          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
            formValues.is_active 
              ? 'bg-[#d4af37] border-[#d4af37]' 
              : 'border-stone-300 bg-white hover:border-stone-400'
          }`}>
            {formValues.is_active && (
              <svg className="w-3.5 h-3.5 text-white animate-in zoom-in-50 duration-150" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </label>
        <div>
          <p className="text-sm font-bold text-stone-700">{t('dashboard.services.active_service_title')}</p>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest">{t('dashboard.services.active_service_helper')}</p>
        </div>
      </div>

      <CreateCategoryInlineModal 
        open={showCreateCat} 
        onOpenChange={setShowCreateCat} 
        onCreated={(newId) => {
          refreshCategories();
          setValue('category_id', newId, { shouldDirty: true });
        }} 
      />
    </div>
  );
}
