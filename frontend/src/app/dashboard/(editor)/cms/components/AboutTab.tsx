"use client"
import React, { useState } from 'react';
import ImageUploadBlock from './ImageUploadBlock';
import { SelectSimple } from '@/components/ui/select';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window === 'undefined') return headers;
  let tenantId = getCookie('tenant_id') || '';
  let authToken = '';
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (!tenantId) tenantId = parsed.tenant_id || '';
      authToken = parsed.access_token || parsed.token || '';
    }
  } catch {}
  if (tenantId) headers['X-Tenant-ID'] = tenantId;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  return headers;
}

export default function AboutTab({ 
  formData, 
  setFormData, 
  setPickerTarget,
  onOpenAIModal
}: { 
  formData: any, 
  setFormData: React.Dispatch<React.SetStateAction<any>>, 
  setPickerTarget: React.Dispatch<React.SetStateAction<any>>,
  onOpenAIModal?: () => void;
}) {
  const { t } = useLanguage();
  const [isGeneratingBio, setIsGeneratingBio] = useState(false);

  const handleGenerateBio = async () => {
    setIsGeneratingBio(true);
    try {
      const promptText = `Genera un título y una biografía o manifiesto de filosofía exclusivo y cálido para la sección Sobre Mí de una clínica de estética y bienestar. Título actual: "${formData.about_title || ''}"`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: promptText,
          type: 'about_bio',
          tone: 'premium'
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al generar biografía con IA');
      }
      const data = await res.json();
      if (data.about_title) setFormData((prev: any) => ({ ...prev, about_title: data.about_title }));
      if (data.about_text) setFormData((prev: any) => ({ ...prev, about_text: data.about_text }));
      toast.success('¡Filosofía y biografía redactadas con éxito!');
    } catch (e: any) {
      toast.error(e.message || 'Error al generar texto con IA');
    } finally {
      setIsGeneratingBio(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="mb-6">
        <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">
          {t('cms.about.title')}
        </h2>
        <p className="text-stone-500 text-sm">
          {t('cms.about.subtitle')}
        </p>
      </div>
      <ImageUploadBlock 
        label={t('cms.about.image_label')}
        value={formData.about_image_url} 
        onSelect={() => setPickerTarget({ type: 'form', field: 'about_image_url' })} 
        onClear={() => setFormData((prev: any) => ({ ...prev, about_image_url: '' }))} 
        onUpload={(url) => setFormData((prev: any) => ({ ...prev, about_image_url: url }))}
        onGenerateAI={onOpenAIModal}
        accepts="image"
      />
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
           <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                {t('cms.about.image_position')}
              </label>
              <SelectSimple
                value={formData.about_layout || "right"}
                onChange={(val) => setFormData((prev: any) => ({ ...prev, about_layout: val }))}
                options={[
                  { value: "left", label: t('cms.about.img_left') },
                  { value: "right", label: t('cms.about.img_right') }
                ]}
              />
           </div>
           <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
                {t('cms.about.section_title')}
              </label>
              <input 
                type="text" 
                value={formData.about_title || ""} 
                onChange={e => setFormData((prev: any) => ({ ...prev, about_title: e.target.value }))} 
                className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-bold transition-colors" 
              />
           </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('cms.about.bio_philosophy')}
            </label>
            <button
              type="button"
              onClick={handleGenerateBio}
              disabled={isGeneratingBio}
              className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-2.5 py-1 rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-50"
            >
              {isGeneratingBio ? (
                <Loader2 size={13} className="animate-spin text-[#FF6B00]" />
              ) : (
                <Sparkles size={13} className="text-[#FF6B00]" />
              )}
              <span>Redactar Biografía con IA</span>
            </button>
          </div>
          <textarea 
            rows={8} 
            value={formData.about_text || ""} 
            onChange={e => setFormData((prev: any) => ({ ...prev, about_text: e.target.value }))} 
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium leading-relaxed resize-y transition-colors" 
          />
        </div>

        <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200">
          <div className="flex items-center justify-between mb-4">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('cms.about.action_button_opt')}
            </label>
            <button 
              onClick={() => setFormData((prev: any) => ({ ...prev, about_show_button: !prev.about_show_button }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.about_show_button ? 'bg-[#FF6B00]' : 'bg-stone-300'}`}
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
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-bold" 
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
                  className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm" 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
