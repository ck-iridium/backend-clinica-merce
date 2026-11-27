"use client"
import React, { useState } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AITextPromptModal, AITextPromptOptions } from '@/components/cms/AITextPromptModal';

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

export default function CtaTab({ 
  formData, 
  setFormData 
}: { 
  formData: any, 
  setFormData: React.Dispatch<React.SetStateAction<any>> 
}) {
  const { t } = useLanguage();
  const [isGeneratingCta, setIsGeneratingCta] = useState(false);
  const [showAiPromptModal, setShowAiPromptModal] = useState(false);

  const handleGenerateCta = async (opts: AITextPromptOptions) => {
    setIsGeneratingCta(true);
    try {
      const promptText = `Genera un título llamativo, un subtítulo convincente y el texto de acción para el botón de la sección CTA. Título actual: "${formData.cta_title || ''}"`;
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ai/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: promptText,
          type: 'cta_copy',
          tone: opts.tone,
          length: opts.length,
          instructions: opts.instructions,
        })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Error al generar CTA con IA');
      }
      const data = await res.json();
      if (data.cta_title) setFormData((prev: any) => ({ ...prev, cta_title: data.cta_title }));
      if (data.cta_subtitle) setFormData((prev: any) => ({ ...prev, cta_subtitle: data.cta_subtitle }));
      if (data.cta_button_text) setFormData((prev: any) => ({ ...prev, cta_button_text: data.cta_button_text }));
      toast.success('¡Llamada a la acción generada con éxito!');
      setShowAiPromptModal(false);
    } catch (e: any) {
      toast.error(e.message || 'Error al generar texto con IA');
    } finally {
      setIsGeneratingCta(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
         <div>
           <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">
             {t('cms.cta.title')}
           </h2>
           <p className="text-stone-500 text-sm">
             {t('cms.cta.subtitle')}
           </p>
         </div>
         <button
           type="button"
           onClick={() => setShowAiPromptModal(true)}
           disabled={isGeneratingCta}
           className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-50"
         >
           {isGeneratingCta ? (
             <Loader2 size={13} className="animate-spin text-[#FF6B00]" />
           ) : (
             <Sparkles size={13} className="text-[#FF6B00]" />
           )}
           <span>Redactar CTA con IA</span>
         </button>
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
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-bold" 
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
            className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium" 
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
              className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-bold" 
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
              className="w-full px-4 py-3 rounded-xl border border-border/50 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm" 
            />
          </div>
        </div>
      </div>

      <AITextPromptModal
        open={showAiPromptModal}
        onClose={() => setShowAiPromptModal(false)}
        title="Redactar Llamada a la Acción (CTA)"
        isGenerating={isGeneratingCta}
        onConfirm={handleGenerateCta}
      />
    </div>
  );
}
