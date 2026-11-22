"use client";
import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { Sparkles, Globe, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface SeoTabProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

const LANGUAGES = [
  { code: 'es', label: 'Español', flag: '🇪🇸', isDefault: true },
  { code: 'en', label: 'English', flag: '🇬🇧', isDefault: false },
  { code: 'fr', label: 'Français', flag: '🇫🇷', isDefault: false },
] as const;

type LangCode = (typeof LANGUAGES)[number]['code'];

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

export default function SeoTab({ formData, setFormData }: SeoTabProps) {
  const { t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState<LangCode>('es');
  const [isGeneratingSEO, setIsGeneratingSEO] = useState(false);
  const [isTranslatingLang, setIsTranslatingLang] = useState(false);

  // Valores dinámicos según idioma
  const currentTitle =
    selectedLang === 'es'
      ? formData.seo_title || ''
      : formData.translations?.[selectedLang]?.seo_title || '';

  const currentDesc =
    selectedLang === 'es'
      ? formData.seo_description || ''
      : formData.translations?.[selectedLang]?.seo_description || '';

  const currentKeywords =
    selectedLang === 'es'
      ? formData.seo_keywords || ''
      : formData.translations?.[selectedLang]?.seo_keywords || '';

  const updateField = (field: 'seo_title' | 'seo_description' | 'seo_keywords', val: string) => {
    if (selectedLang === 'es') {
      setFormData((prev: any) => ({ ...prev, [field]: val }));
    } else {
      setFormData((prev: any) => {
        const curTrans = prev.translations || {};
        const langTrans = curTrans[selectedLang] || {};
        return {
          ...prev,
          translations: {
            ...curTrans,
            [selectedLang]: {
              ...langTrans,
              [field]: val,
            },
          },
        };
      });
    }
  };

  // Generar SEO en Español (Idioma Base)
  const handleGenerateSEO = async () => {
    const heroTitle = formData.hero_title || '';
    const heroSubtitle = formData.hero_subtitle || '';
    const aboutTitle = formData.about_title || '';
    const aboutText = formData.about_text || '';

    setIsGeneratingSEO(true);
    try {
      const contextPrompt = `Portal web de clínica de estética y bienestar.\nTitular portada: ${heroTitle}\nSubtítulo portada: ${heroSubtitle}\nSección Sobre Mí: ${aboutTitle} - ${aboutText}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          prompt: contextPrompt,
          type: 'seo',
          tone: 'premium',
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Error al generar metadatos SEO con IA');
      }

      const seoData = await res.json();
      setFormData((prev: any) => ({
        ...prev,
        seo_title: seoData.seo_title || prev.seo_title,
        seo_description: seoData.seo_description || prev.seo_description,
        seo_keywords: seoData.seo_keywords || prev.seo_keywords,
      }));

      toast.success('¡Metadatos SEO optimizados con éxito!');
    } catch (error: any) {
      toast.error(error.message || 'Error al generar SEO');
    } finally {
      setIsGeneratingSEO(false);
    }
  };

  // Traducir con IA al idioma seleccionado (EN o FR)
  const handleTranslateWithAi = async () => {
    if (selectedLang === 'es') return;

    const baseTitle = formData.seo_title;
    const baseDesc = formData.seo_description;
    const baseKw = formData.seo_keywords;

    if (!baseTitle && !baseDesc) {
      toast.error('Primero debes rellenar el Título o la Descripción en Español para poder traducirlos.');
      return;
    }

    setIsTranslatingLang(true);
    try {
      const langName = selectedLang === 'en' ? 'English' : 'French';
      const prompt =
        `Translate the following Spanish clinic website SEO metadata into natural, engaging, and high-CTR ${langName} for Google search results.\n` +
        `Return ONLY a raw JSON object with keys: "seo_title", "seo_description", "seo_keywords".\n` +
        JSON.stringify({
          seo_title: baseTitle || '',
          seo_description: baseDesc || '',
          seo_keywords: baseKw || '',
        });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/ai/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
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

      const raw = await res.json();
      let transData: any = {};
      if (typeof raw === 'object' && raw !== null) {
        transData = raw.content ? JSON.parse(raw.content) : raw;
      }

      setFormData((prev: any) => {
        const curTrans = prev.translations || {};
        const langTrans = curTrans[selectedLang] || {};
        return {
          ...prev,
          translations: {
            ...curTrans,
            [selectedLang]: {
              ...langTrans,
              seo_title: transData.seo_title || langTrans.seo_title || '',
              seo_description: transData.seo_description || langTrans.seo_description || '',
              seo_keywords: transData.seo_keywords || langTrans.seo_keywords || '',
            },
          },
        };
      });

      toast.success(`¡Metadatos traducidos al ${langName} con éxito!`);
    } catch (err: any) {
      toast.error(err.message || 'Error al traducir con IA');
    } finally {
      setIsTranslatingLang(false);
    }
  };

  // Longitud de caracteres
  const titleLength = currentTitle.length;
  const descLength = currentDesc.length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-2">
        <div>
          <h2 className="text-2xl font-serif font-bold text-stone-900 mb-1">
            {t('cms.seo.title') || 'Optimización SEO y Motores de Búsqueda'}
          </h2>
          <p className="text-stone-500 text-sm">
            {t('cms.seo.subtitle') || 'Configura cómo aparecerá tu negocio en Google en múltiples idiomas.'}
          </p>
        </div>

        {selectedLang === 'es' ? (
          <button
            type="button"
            onClick={handleGenerateSEO}
            disabled={isGeneratingSEO}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-50"
          >
            {isGeneratingSEO ? (
              <Loader2 size={13} className="animate-spin text-[#FF6B00]" />
            ) : (
              <Sparkles size={13} className="text-[#FF6B00]" />
            )}
            <span>Generar SEO con IA</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleTranslateWithAi}
            disabled={isTranslatingLang}
            className="flex items-center gap-1.5 text-xs font-bold text-[#FF6B00] bg-orange-50 hover:bg-orange-100 border border-orange-200/80 px-3 py-1.5 rounded-xl transition-all shadow-2xs active:scale-95 disabled:opacity-50"
          >
            {isTranslatingLang ? (
              <Loader2 size={13} className="animate-spin text-[#FF6B00]" />
            ) : (
              <Sparkles size={13} className="text-[#FF6B00]" />
            )}
            <span>Traducir con IA ({selectedLang.toUpperCase()})</span>
          </button>
        )}
      </div>

      {/* PESTAÑAS DE IDIOMA */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        {LANGUAGES.map((lang) => {
          const isSelected = selectedLang === lang.code;
          const hasTranslation =
            lang.code === 'es'
              ? !!formData.seo_title
              : !!formData.translations?.[lang.code]?.seo_title;

          return (
            <button
              key={lang.code}
              type="button"
              onClick={() => setSelectedLang(lang.code)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isSelected
                  ? 'bg-stone-900 text-white shadow-sm'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {hasTranslation && (
                <CheckCircle2 size={12} className={isSelected ? 'text-[#FF6B00]' : 'text-emerald-500'} />
              )}
            </button>
          );
        })}
      </div>

      {/* FORMULARIO DE METADATOS */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('cms.seo.page_title') || 'Título SEO (Meta Title)'}
            </label>
            <span
              className={`text-[10px] font-bold ${
                titleLength >= 45 && titleLength <= 65
                  ? 'text-emerald-600'
                  : titleLength > 65
                  ? 'text-amber-600'
                  : 'text-stone-400'
              }`}
            >
              {titleLength}/60 caracteres (Recomendado: 50-60)
            </span>
          </div>
          <input
            type="text"
            value={currentTitle}
            onChange={(e) => updateField('seo_title', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-bold shadow-xs transition-all"
            placeholder={
              selectedLang === 'es'
                ? 'Ej: Clínica de Estética y Bienestar en Madrid | Tratamientos Exclusivos'
                : 'Ej: Aesthetic & Wellness Clinic | Exclusive Treatments'
            }
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">
              {t('cms.seo.description') || 'Meta Descripción'}
            </label>
            <span
              className={`text-[10px] font-bold ${
                descLength >= 130 && descLength <= 165
                  ? 'text-emerald-600'
                  : descLength > 165
                  ? 'text-amber-600'
                  : 'text-stone-400'
              }`}
            >
              {descLength}/160 caracteres (Recomendado: 140-160)
            </span>
          </div>
          <textarea
            rows={4}
            value={currentDesc}
            onChange={(e) => updateField('seo_description', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium shadow-xs leading-relaxed transition-colors resize-y"
            placeholder={
              selectedLang === 'es'
                ? 'Descubre una experiencia de belleza personalizada con los tratamientos faciales y corporales más avanzados. Reserva tu consulta.'
                : 'Discover a personalized luxury beauty experience with advanced facial and body treatments. Book your appointment.'
            }
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-stone-500 mb-2">
            {t('cms.seo.keywords') || 'Palabras Clave (Keywords separadas por coma)'}
          </label>
          <input
            type="text"
            value={currentKeywords}
            onChange={(e) => updateField('seo_keywords', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 text-sm font-medium shadow-xs transition-all"
            placeholder="estetica facial, tratamientos corporales, bienestar, clinica belleza"
          />
        </div>

        {/* VISTA PREVIA SERP GOOGLE */}
        <div className="p-5 rounded-2xl bg-stone-50/80 border border-stone-200 space-y-2">
          <div className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Globe size={14} className="text-[#FF6B00]" />
            <span>Vista Previa en Google ({selectedLang.toUpperCase()})</span>
          </div>
          <div className="bg-white p-4 rounded-xl border border-stone-200/80 shadow-2xs space-y-1 max-w-xl">
            <div className="text-[11px] text-stone-400 font-sans truncate">
              https://tuclinica.com{selectedLang !== 'es' ? `/${selectedLang}` : ''}
            </div>
            <div className="text-base text-[#1a0dab] font-medium font-sans hover:underline cursor-pointer truncate">
              {currentTitle || 'Tu Clínica de Estética y Bienestar'}
            </div>
            <div className="text-xs text-stone-600 font-sans line-clamp-2 leading-relaxed">
              {currentDesc ||
                'Tratamientos faciales, corporales y medicina estética avanzada en un entorno de máxima tranquilidad y profesionalidad.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
