import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { toast } from 'sonner';
import { Editor } from '@tiptap/react';
import type { ServiceFormData } from '@/components/cms/ServiceEditor';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface SeoTabProps {
  formValues: ServiceFormData;
  register: UseFormRegister<ServiceFormData>;
  setValue: UseFormSetValue<ServiceFormData>;
  editor: Editor | null;
}

export default function SeoTab({ formValues, register, setValue, editor }: SeoTabProps) {
  const { t } = useLanguage();
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);

  const handleGenerateSEO = async () => {
    const plainTextContent = editor?.getText() || '';
    const name = formValues.name || '';
    const description = formValues.description || '';

    if (!name && !description && !plainTextContent) {
      toast.error(t('dashboard.services.seo_content_error'));
      return;
    }

    setIsGeneratingSEO(true);
    try {
      const contextPrompt = `Nombre del servicio: ${name}\nDescripción corta: ${description}\nContenido detallado: ${plainTextContent}`;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: contextPrompt,
          type: 'seo',
          tone: 'premium'
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || t('dashboard.services.seo_generation_failed'));
      }

      const seoData = await res.json();
      
      if (seoData.seo_title) setValue('seo_title', seoData.seo_title, { shouldDirty: true });
      if (seoData.seo_description) setValue('seo_description', seoData.seo_description, { shouldDirty: true });
      if (seoData.seo_keywords) setValue('seo_keywords', seoData.seo_keywords, { shouldDirty: true });
      
      toast.success(t('dashboard.services.seo_generated'));
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <button 
          type="button" 
          onClick={handleGenerateSEO}
          disabled={isGeneratingSEO || (!formValues.name && !formValues.description && !editor?.getText())}
          className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {isGeneratingSEO ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('dashboard.services.seo_optimizing')}
            </>
          ) : (
            <>
              <Sparkles size={16} />
              {t('dashboard.services.generate_seo_auto')}
            </>
          )}
        </button>
        <p className="text-[10px] text-stone-400 text-center mt-2 uppercase tracking-widest font-semibold">{t('dashboard.services.based_on_content')}</p>
      </div>
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.meta_title_label')}</label>
        <input {...register('seo_title')} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" placeholder={`Ej: ${formValues.name || t('dashboard.services.service_label')} | Clínica`} />
      </div>
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.meta_description_label')}</label>
        <textarea {...register('seo_description')} rows={3} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm resize-none" placeholder={t('dashboard.services.meta_description_placeholder')} />
      </div>
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.meta_keywords_label')}</label>
        <input {...register('seo_keywords')} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm" placeholder={t('dashboard.services.meta_keywords_placeholder')} />
      </div>
    </div>
  );
}
