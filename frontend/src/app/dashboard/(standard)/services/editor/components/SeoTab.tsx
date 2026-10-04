import { useState, useEffect } from 'react';
import { Sparkles, Lock, Loader2, Globe, CheckCircle2 } from 'lucide-react';
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

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸', isDefault: true },
  { code: 'en', label: 'English', flag: '🇬🇧', isDefault: false },
  { code: 'fr', label: 'Français', flag: '🇫🇷', isDefault: false },
] as const;

type LangCode = (typeof LANGUAGES)[number]['code'];

export default function SeoTab({ formValues, register, setValue, editor }: SeoTabProps) {
  const { t } = useLanguage();
  const router = useRouter();
  const [selectedLang, setSelectedLang] = useState<LangCode>('es');
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isTranslatingLang, setIsTranslatingLang] = useState(false);
  const [redirecting, setRedirecting] = useState<string | null>(null);

  // Límites de plan
  const [limits, setLimits] = useState<{ ai_allowed: boolean; ai_requires_byok: boolean } | null>(null);
  const [loadingLimits, setLoadingLimits] = useState(true);

  // Helper simple para leer cookies del lado del cliente
  function getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  useEffect(() => {
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
            console.error('Error parsing user session in SeoTab:', e);
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
          },
        });
        if (res.ok) {
          const limitsData = await res.json();
          setLimits({
            ai_allowed: limitsData.limits.ai_allowed,
            ai_requires_byok: limitsData.limits.ai_requires_byok,
          });
        }
      } catch (err) {
        console.error('Error al obtener límites de plan:', err);
      } finally {
        setLoadingLimits(false);
      }
    }
    fetchLimits();
  }, []);

  const isBlocked = limits && !limits.ai_allowed;

  // Generar SEO en Español (Idioma Base)
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
          tone: 'premium',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || t('dashboard.services.seo_generation_failed'));
      }

      const seoData = await res.json();

      if (seoData.seo_title) setValue('seo_title', seoData.seo_title, { shouldDirty: true });
      if (seoData.seo_description) setValue('seo_description', seoData.seo_description, { shouldDirty: true });
      if (seoData.seo_keywords) setValue('seo_keywords', seoData.seo_keywords, { shouldDirty: true });

      toast.success(t('dashboard.services.seo_generated'));
    } catch (error: any) {
      console.error(error);
      if (error.message === 'AI_LIMIT_BYOK_REQUIRED') {
        toast.error('Requiere clave de API propia o mejorar su suscripción.');
      } else {
        toast.error(error.message);
      }
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  // Actualizar campo de traducción de forma reactiva
  const updateTranslationField = (field: 'seo_title' | 'seo_description' | 'seo_keywords', val: string) => {
    if (selectedLang === 'es') return;
    const curTrans = formValues.translations || {};
    const langTrans = curTrans[selectedLang] || {};
    setValue(
      'translations',
      {
        ...curTrans,
        [selectedLang]: {
          ...langTrans,
          [field]: val,
        },
      },
      { shouldDirty: true }
    );
  };

  // Traducir con IA desde el Español al idioma seleccionado (EN o FR)
  const handleTranslateWithAi = async () => {
    if (selectedLang === 'es') return;

    const baseTitle = formValues.seo_title;
    const baseDesc = formValues.seo_description;
    const baseKw = formValues.seo_keywords;

    if (!baseTitle && !baseDesc && !formValues.name) {
      toast.error('Primero debes rellenar el Título o la Descripción en Español para poder traducirlos.');
      return;
    }

    setIsTranslatingLang(true);
    try {
      const userSession = localStorage.getItem('user');
      let tenantId = getCookie('tenant_id') || '';
      let authToken = '';
      if (userSession) {
        try {
          const parsed = JSON.parse(userSession);
          if (!tenantId) tenantId = parsed.tenant_id || '';
          authToken = parsed.access_token || parsed.token || '';
        } catch {}
      }

      const langName = selectedLang === 'en' ? 'English' : 'French';
      const prompt =
        `Translate the following Spanish SEO metadata into natural, engaging, and high-CTR ${langName} for Google search results.\n` +
        `Return ONLY a raw JSON object with keys: "seo_title", "seo_description", "seo_keywords".\n` +
        JSON.stringify({
          seo_title: baseTitle || formValues.name || '',
          seo_description: baseDesc || formValues.description || '',
          seo_keywords: baseKw || formValues.name || '',
        });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId,
          'Authorization': authToken ? `Bearer ${authToken}` : '',
        },
        body: JSON.stringify({
          prompt,
          type: 'seo',
          tone: 'premium',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `Error al traducir al ${langName}`);
      }

      const data = await res.json();
      const curTrans = formValues.translations || {};
      const langTrans = curTrans[selectedLang] || {};

      setValue(
        'translations',
        {
          ...curTrans,
          [selectedLang]: {
            ...langTrans,
            seo_title: data.seo_title || baseTitle || '',
            seo_description: data.seo_description || baseDesc || '',
            seo_keywords: data.seo_keywords || baseKw || '',
          },
        },
        { shouldDirty: true }
      );

      toast.success(`Metadatos SEO traducidos al ${langName} con éxito.`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Error al traducir con IA');
    } finally {
      setIsTranslatingLang(false);
    }
  };

  const currentTrans = formValues.translations?.[selectedLang] || {};
  const activeTitle = selectedLang === 'es' ? formValues.seo_title || '' : currentTrans.seo_title || '';
  const activeDesc = selectedLang === 'es' ? formValues.seo_description || '' : currentTrans.seo_description || '';
  const activeKw = selectedLang === 'es' ? formValues.seo_keywords || '' : currentTrans.seo_keywords || '';

  return (
    <div className="space-y-5">
      {/* ── SELECTOR DE PESTAÑAS DE IDIOMA ── */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 rounded-2xl border border-stone-200/70">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          const hasTranslation =
            lang.code === 'es'
              ? Boolean(formValues.seo_title)
              : Boolean(formValues.translations?.[lang.code]?.seo_title);

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelectedLang(lang.code)}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                isSelected
                  ? 'bg-white text-stone-900 shadow-sm border border-stone-200/40'
                  : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.isDefault ? (
                <span className="text-[10px] font-normal text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded-md">
                  Base
                </span>
              ) : hasTranslation ? (
                <CheckCircle2 size={13} className="text-emerald-500" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* ── BANNER PARA IDIOMAS SECUNDARIOS (EN / FR) ── */}
      {selectedLang !== 'es' && (
        <div className="p-4 rounded-2xl bg-amber-50/50 border border-[#D4AF37]/30 text-stone-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in duration-200">
          <div className="space-y-0.5">
            <span className="font-bold flex items-center gap-1.5 text-stone-900">
              <Globe size={14} className="text-[#D4AF37]" />
              Traducción SEO para {selectedLang === 'en' ? 'Inglés (English)' : 'Francés (Français)'}
            </span>
            <p className="text-[11px] text-stone-500">
              Google y los motores de búsqueda mostrarán estos metadatos a usuarios que busquen en este idioma.
            </p>
          </div>

          <button
            type="button"
            onClick={handleTranslateWithAi}
            disabled={isTranslatingLang}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-[#d4af37] text-white text-xs font-bold transition-all shadow-sm shrink-0 active:scale-95 disabled:opacity-50"
          >
            {isTranslatingLang ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles size={14} className="text-[#D4AF37]" />
            )}
            <span>{isTranslatingLang ? 'Traduciendo...' : 'Traducir con IA'}</span>
          </button>
        </div>
      )}

      {/* ── ALERTA DE LÍMITE DE PLAN ── */}
      {isBlocked && (
        <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/40 text-[11px] text-stone-500 mb-6 flex flex-col gap-2 font-sans animate-in fade-in duration-300">
          <div className="flex items-center gap-1.5 text-stone-700 font-bold uppercase tracking-wider text-[10px]">
            <Sparkles size={12} className="text-[#d4af37]" />
            <span>Asistente de SEO Premium</span>
          </div>
          <p className="leading-relaxed">
            La automatización de metadatos mediante IA está reservada para el{' '}
            <span className="font-bold text-stone-700">Plan Gold</span> o requiere que configure su propia{' '}
            <span className="font-bold text-stone-700">Clave de API</span> en Ajustes.
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
                'Configurar Clave'
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
                'Mejorar Plan'
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── BOTÓN DE GENERACIÓN IA PARA ESPAÑOL ── */}
      {selectedLang === 'es' && (
        <div className="mb-6">
          <button
            id="service-editor-seo-generate-btn"
            type="button"
            onClick={handleGenerateSEO}
            disabled={
              loadingLimits ||
              isGeneratingSEO ||
              (!isBlocked && !formValues.name && !formValues.description && !editor?.getText())
            }
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
          <p className="text-[10px] text-stone-400 text-center mt-2 uppercase tracking-widest font-semibold">
            {t('dashboard.services.based_on_content')}
          </p>
        </div>
      )}

      {/* ── FORMULARIO: TÍTULO SEO ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">
            {t('dashboard.services.seo_title_label')}
          </label>
          <span
            className={`text-[10px] font-mono font-bold ${
              activeTitle.length >= 45 && activeTitle.length <= 65 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {activeTitle.length}/60 chars
          </span>
        </div>
        {selectedLang === 'es' ? (
          <input
            id="service-editor-seo-title-input"
            {...register('seo_title')}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold"
            placeholder={
              (t('dashboard.services.seo_title_placeholder') || 'Ej: {name} | Negocio').replace(
                '{name}',
                formValues.name || t('dashboard.services.placeholder_title')
              )
            }
          />
        ) : (
          <input
            id={`service-editor-seo-title-${selectedLang}-input`}
            value={activeTitle}
            onChange={(e) => updateTranslationField('seo_title', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all font-semibold"
            placeholder={formValues.seo_title ? `Ej. traducido de: "${formValues.seo_title}"` : 'Title in foreign language...'}
          />
        )}
      </div>

      {/* ── FORMULARIO: META DESCRIPCIÓN ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest">
            {t('dashboard.services.seo_description_label')}
          </label>
          <span
            className={`text-[10px] font-mono font-bold ${
              activeDesc.length >= 130 && activeDesc.length <= 160 ? 'text-emerald-600' : 'text-amber-600'
            }`}
          >
            {activeDesc.length}/155 chars
          </span>
        </div>
        {selectedLang === 'es' ? (
          <textarea
            id="service-editor-seo-desc-textarea"
            {...register('seo_description')}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm resize-none"
            placeholder={t('dashboard.services.meta_description_placeholder')}
          />
        ) : (
          <textarea
            id={`service-editor-seo-desc-${selectedLang}-textarea`}
            value={activeDesc}
            onChange={(e) => updateTranslationField('seo_description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm resize-none"
            placeholder={formValues.seo_description ? `Ej. traducido de: "${formValues.seo_description}"` : 'Description in foreign language...'}
          />
        )}
      </div>

      {/* ── FORMULARIO: PALABRAS CLAVE ── */}
      <div>
        <label className="block text-xs font-bold text-stone-500 uppercase tracking-widest mb-1.5">
          {t('dashboard.services.seo_keywords_label')}
        </label>
        {selectedLang === 'es' ? (
          <input
            id="service-editor-seo-keywords-input"
            {...register('seo_keywords')}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm"
            placeholder={t('dashboard.services.meta_keywords_placeholder')}
          />
        ) : (
          <input
            id={`service-editor-seo-keywords-${selectedLang}-input`}
            value={activeKw}
            onChange={(e) => updateTranslationField('seo_keywords', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-stone-900 focus:ring-2 focus:ring-[#d4af37] outline-none transition-all text-sm"
            placeholder="keywords, separated, by, commas"
          />
        )}
      </div>
    </div>
  );
}
