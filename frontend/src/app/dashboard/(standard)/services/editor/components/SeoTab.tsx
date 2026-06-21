import { useState, useEffect } from 'react';
import { Sparkles, Lock, Loader2 } from 'lucide-react';
import { UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [redirecting, setRedirecting] = useState<string | null>(null);

  // Límites de plan
  const [limits, setLimits] = useState<{ ai_allowed: boolean; ai_requires_byok: boolean } | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(true);

  useEffect(() => {
    // Helper simple para leer cookies del lado del cliente
    function getCookie(name: string): string | null {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
    }

    async function fetchLimits() {
      try {
        const userSession = localStorage.getItem('user');
        let tenantId = getCookie('tenant_id') || '';
        let authToken = '';
        
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (!tenantId) {
              tenantId = parsed.tenant_id || '';
            }
            authToken = parsed.access_token || parsed.token || '';
          } catch (e) {
            console.error("Error parsing user session in SeoTab:", e);
          }
        }

        if (!tenantId) {
          setLoadingLimits(false);
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/settings/limits`, {
          headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': authToken ? `Bearer ${authToken}` : '',
          }
        });
        if (res.ok) {
          const limitsData = await res.json();
          setLimits({
            ai_allowed: limitsData.limits.ai_allowed,
            ai_requires_byok: limitsData.limits.ai_requires_byok
          });
        }
      } catch (err) {
        console.error("Error al obtener límites de plan:", err);
      } finally {
        setLoadingLimits(false);
      }
    }
    fetchLimits();
  }, []);

  const isBlocked = limits && !limits.ai_allowed;

  const handleGenerateSEO = async () => {
    if (isBlocked) {
      toast.error('Acción restringida. Habilite su propia clave de API o mejore su plan.');
      return;
    }

    const plainTextContent = editor?.getText() || '';
    const name = formValues.name || '';
    const description = formValues.description || '';

    if (!name && !description && !plainTextContent) {
      toast.error(t('dashboard.services.seo_content_error'));
      return;
    }

    setIsGeneratingSEO(true);
    try {
      const getCookie = (name: string): string | null => {
        if (typeof document === 'undefined') return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
        return null;
      };

      const userSession = localStorage.getItem('user');
      let tenantId = getCookie('tenant_id') || '';
      let authToken = '';
      if (userSession) {
        const parsed = JSON.parse(userSession);
        if (!tenantId) {
          tenantId = parsed.tenant_id || '';
        }
        authToken = parsed.access_token || parsed.token || '';
      }

      const contextPrompt = `Nombre del servicio: ${name}\nDescripción corta: ${description}\nContenido detallado: ${plainTextContent}`;
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
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
      if (error.message === "AI_LIMIT_BYOK_REQUIRED") {
        toast.error("Requiere clave de API propia o mejorar su suscripción.");
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  return (
    <div className="space-y-4">
      {isBlocked && (
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/40 text-[11px] text-stone-500 mb-6 flex flex-col gap-2 font-sans animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
            <Sparkles size={12} className="text-[#d4af37]" />
            <span>Asistente de SEO Premium</span>
          </div>
          <p className="leading-relaxed">
            La automatización de metadatos mediante IA está reservada para el <span className="font-bold text-stone-700">Plan Gold</span> o requiere que configure su propia <span className="font-bold text-stone-700">Clave de API</span> en Ajustes.
          </p>
          <div className="flex gap-2 mt-1">
            <button 
              id="service-editor-seo-config-key-btn"
              onClick={() => {
                setRedirecting('advanced');
                router.push('/dashboard/settings?tab=advanced');
              }}
              disabled={redirecting !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 text-stone-700 font-bold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              {redirecting === 'advanced' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-stone-600" />
                  <span>Redirigiendo...</span>
                </>
              ) : (
                "Configurar Clave"
              )}
            </button>
            <button 
              id="service-editor-seo-upgrade-plan-btn"
              onClick={() => {
                setRedirecting('subscription');
                router.push('/dashboard/settings?tab=subscription');
              }}
              disabled={redirecting !== null}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d4af37] text-white font-bold transition-all shadow-sm hover:bg-stone-900 active:scale-95 disabled:opacity-50"
            >
              {redirecting === 'subscription' ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin text-white" />
                  <span>Redirigiendo...</span>
                </>
              ) : (
                "Mejorar Plan"
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <button 
          id="service-editor-seo-generate-btn"
          type="button" 
          onClick={handleGenerateSEO}
          disabled={loadingLimits || isGeneratingSEO || (!isBlocked && !formValues.name && !formValues.description && !editor?.getText())}
          className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-md ${
            isBlocked 
              ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed shadow-none' 
              : 'bg-stone-900 hover:bg-[#d4af37] text-white disabled:opacity-50 disabled:cursor-not-allowed'
          }`}
        >
          {isGeneratingSEO ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              {t('dashboard.services.seo_optimizing')}
            </>
          ) : isBlocked ? (
            <>
              <Lock size={16} className="text-stone-400" />
              <span>Optimización con IA Deshabilitada</span>
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
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.seo_title_label')}</label>
        <input 
          id="service-editor-seo-title-input"
          {...register('seo_title')} 
          className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 dark:text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold" 
          placeholder={(t('dashboard.services.seo_title_placeholder') || 'Ej: {name} | Negocio')
            .replace('{name}', formValues.name || t('dashboard.services.placeholder_title'))} 
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.seo_description_label')}</label>
        <textarea id="service-editor-seo-desc-textarea" {...register('seo_description')} rows={3} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 dark:text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm resize-none" placeholder={t('dashboard.services.meta_description_placeholder')} />
      </div>
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">{t('dashboard.services.seo_keywords_label')}</label>
        <input id="service-editor-seo-keywords-input" {...register('seo_keywords')} className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 dark:text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm" placeholder={t('dashboard.services.meta_keywords_placeholder')} />
      </div>
    </div>
  );
}

