"use client";

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Globe, 
  Loader2, 
  ShieldCheck, 
  Search, 
  Layers, 
  TrendingUp, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  Save, 
  FileCode, 
  UploadCloud,
  Trash2,
  Lock,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface SaaSGlobalSettingsProps {
  saasSettings: {
    allow_search_engine_indexing: boolean;
    google_site_verification?: string;
    gtm_container_id?: string;
    google_ads_id?: string;
    google_ads_conversion_label?: string;
    google_analytics_id?: string;
    google_verification_filename?: string;
    google_verification_content?: string;
  } | null;
  loadingSettings: boolean;
  savingSettings: boolean;
  onToggleIndexing: () => Promise<void>;
  onSaveSettings: (settings: any) => Promise<void>;
}

export default function SaaSGlobalSettings({
  saasSettings,
  loadingSettings,
  savingSettings,
  onToggleIndexing,
  onSaveSettings,
}: SaaSGlobalSettingsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Estado local para edición de formulario
  const [formData, setFormData] = useState({
    allow_search_engine_indexing: true,
    google_site_verification: '',
    gtm_container_id: '',
    google_ads_id: '',
    google_ads_conversion_label: '',
    google_analytics_id: '',
    google_verification_filename: '',
    google_verification_content: '',
  });

  // Sincronizar estado cuando lleguen los datos del backend
  useEffect(() => {
    if (saasSettings) {
      setFormData({
        allow_search_engine_indexing: saasSettings.allow_search_engine_indexing ?? true,
        google_site_verification: saasSettings.google_site_verification || '',
        gtm_container_id: saasSettings.gtm_container_id || '',
        google_ads_id: saasSettings.google_ads_id || '',
        google_ads_conversion_label: saasSettings.google_ads_conversion_label || '',
        google_analytics_id: saasSettings.google_analytics_id || '',
        google_verification_filename: saasSettings.google_verification_filename || 'google2cf0952089a4bfcd.html',
        google_verification_content: saasSettings.google_verification_content || 'google-site-verification: google2cf0952089a4bfcd.html',
      });
    }
  }, [saasSettings]);

  // Manejador del archivo HTML de verificación de Google
  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith('.html')) {
      toast.error('Por favor, selecciona un archivo HTML de Google válido (.html)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = (e.target?.result as string) || '';
      const fname = file.name.trim();
      const tokenMatch = fname.match(/google([a-zA-Z0-9_-]+)\.html/i);
      
      setFormData(prev => ({
        ...prev,
        google_verification_filename: fname,
        google_verification_content: content.trim() || `google-site-verification: ${fname}`,
        google_site_verification: tokenMatch ? tokenMatch[1] : prev.google_site_verification,
      }));
      toast.success(`Archivo "${fname}" cargado. Haz clic en "Guardar Configuración Global".`);
    };
    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({
      ...prev,
      google_verification_filename: '',
      google_verification_content: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    toast.info('Archivo de verificación desvinculado. Guarda los cambios para aplicar.');
  };

  // Manejador del código de Google Search Console con auto-limpieza
  const handleSearchConsoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (val.includes('content=')) {
      const match = val.match(/content=["']([^"']+)["']/i);
      if (match && match[1]) {
        val = match[1];
      }
    } else if (val.includes('=')) {
      val = val.split('=').pop()?.replace(/["']/g, '').trim() || val;
    }
    setFormData(prev => ({ ...prev, google_site_verification: val.trim() }));
  };

  // Manejador de GTM
  const handleGtmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/<[^>]*>?/gm, '').trim();
    setFormData(prev => ({ ...prev, gtm_container_id: val.toUpperCase() }));
  };

  // Manejador de Google Ads ID
  const handleGoogleAdsIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/<[^>]*>?/gm, '').trim();
    setFormData(prev => ({ ...prev, google_ads_id: val }));
  };

  // Manejador de Google Ads Conversion Label
  const handleGoogleAdsLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/<[^>]*>?/gm, '').trim();
    setFormData(prev => ({ ...prev, google_ads_conversion_label: val }));
  };

  // Manejador de Google Analytics 4 (GA4)
  const handleGa4Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/<[^>]*>?/gm, '').trim();
    setFormData(prev => ({ ...prev, google_analytics_id: val.toUpperCase() }));
  };

  // Validaciones en vivo
  const gtmValidation = useMemo(() => {
    const val = formData.gtm_container_id.trim();
    if (!val) return { status: 'empty', message: 'No configurado (opcional)' };
    if (val.includes('<') || val.toLowerCase().includes('script')) {
      return { status: 'error', message: 'No introduzcas etiquetas <script>' };
    }
    const regex = /^GTM-[A-Z0-9]+$/;
    if (regex.test(val.toUpperCase())) {
      return { status: 'valid', message: 'Identificador GTM válido' };
    }
    return { status: 'error', message: 'Formato esperado: GTM-XXXXXXX' };
  }, [formData.gtm_container_id]);

  const ga4Validation = useMemo(() => {
    const val = formData.google_analytics_id.trim();
    if (!val) return { status: 'empty', message: 'No configurado (opcional)' };
    const regex = /^G-[A-Z0-9]+$/;
    if (regex.test(val.toUpperCase())) {
      return { status: 'valid', message: 'ID de Medición GA4 válido' };
    }
    return { status: 'error', message: 'Formato esperado: G-XXXXXXXXXX' };
  }, [formData.google_analytics_id]);

  const googleAdsIdValidation = useMemo(() => {
    const val = formData.google_ads_id.trim();
    if (!val) return { status: 'empty', message: 'No configurado (opcional)' };
    const clean = val.toUpperCase().startsWith('AW-') ? val.toUpperCase() : `AW-${val}`;
    const regex = /^AW-[0-9]+$/;
    if (regex.test(clean)) {
      return { status: 'valid', message: 'ID de Google Ads válido' };
    }
    return { status: 'error', message: 'Formato esperado: AW-123456789 o números' };
  }, [formData.google_ads_id]);

  const googleAdsLabelValidation = useMemo(() => {
    const val = formData.google_ads_conversion_label.trim();
    if (!val) return { status: 'empty', message: 'No configurado (opcional)' };
    const regex = /^[a-zA-Z0-9_-]+$/;
    if (regex.test(val)) {
      return { status: 'valid', message: 'Etiqueta válida' };
    }
    return { status: 'error', message: 'Solo letras, números, guiones o barras bajas' };
  }, [formData.google_ads_conversion_label]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveSettings(formData);
  };

  return (
    <div className="flex-1 p-6 md:p-12 overflow-y-auto space-y-8 max-w-4xl w-full animate-in fade-in duration-300">
      
      {/* Banner de Cabecera: Ecosistema Google & Quiet Luxury */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-luxury border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <Sparkles size={18} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Consola SaaS Corporativa</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-100">
              Configuración Global & Herramientas Google
            </h2>
            <p className="text-stone-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Configura el ecosistema oficial de Google para la plataforma central <strong>(www.probookia.com)</strong>: 
              subida y verificación de archivo en Search Console, Google Tag Manager, Google Analytics 4, campañas de Google Ads e indexación global.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shrink-0">
            <Lock className="text-[#d4af37]" size={20} />
            <div className="text-xs">
              <span className="font-bold block text-white">Dominio Central</span>
              <span className="text-stone-300">probookia.com</span>
            </div>
          </div>
        </div>
      </div>

      {loadingSettings ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3 bg-white rounded-3xl border border-stone-100 shadow-sm">
          <Loader2 className="w-8 h-8 text-[#d4af37] animate-spin" />
          <span className="text-sm text-stone-400 font-medium font-sans">Cargando configuración global del SaaS...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* BENTO GRID: Herramientas de Google */}
          <div className="grid grid-cols-1 gap-8">
            
            {/* Bento Card 1: Google Search Console con Cargador de Archivos */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-5 border-b border-stone-100 mb-6">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shadow-sm">
                    <Search size={22} />
                  </span>
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-stone-900">Google Search Console</h3>
                    <p className="text-xs text-stone-400">Verificación de la propiedad https://www.probookia.com/ en Google</p>
                  </div>
                </div>
                <a
                  href="https://search.google.com/search-console"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-emerald-600 transition-colors font-medium bg-stone-50 hover:bg-emerald-50 px-3.5 py-2 rounded-xl border border-stone-200/60"
                >
                  <span>Abrir Search Console</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="space-y-6">
                
                {/* 1. SECCIÓN PRINCIPAL: CARGADOR DE ARCHIVO HTML DE GOOGLE */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-stone-800 flex items-center gap-2">
                      <FileCode size={16} className="text-emerald-600" />
                      Método Recomendado: Subir Archivo HTML de Google
                    </span>
                    {formData.google_verification_filename && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/50">
                        <CheckCircle2 size={12} />
                        Archivo Vinculado
                      </span>
                    )}
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".html"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />

                  {formData.google_verification_filename ? (
                    /* Tarjeta de Archivo Cargado */
                    <div className="p-5 bg-stone-50/80 rounded-2xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center shrink-0">
                          <FileCode size={20} />
                        </div>
                        <div>
                          <span className="font-mono font-bold text-sm text-stone-900 block">
                            {formData.google_verification_filename}
                          </span>
                          <span className="text-[11px] text-stone-500 block mt-0.5">
                            {formData.google_verification_content || `google-site-verification: ${formData.google_verification_filename}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        <a
                          href={`https://www.probookia.com/${formData.google_verification_filename}`}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-stone-700 hover:text-emerald-700 font-semibold bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-sm transition-all hover:bg-stone-50"
                        >
                          <span>Probar URL</span>
                          <ExternalLink size={12} />
                        </a>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-xs text-stone-700 hover:text-stone-900 font-medium bg-white px-3 py-2 rounded-xl border border-stone-200 shadow-sm transition-all hover:bg-stone-50 cursor-pointer"
                        >
                          Cambiar
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveFile}
                          className="p-2 text-stone-400 hover:text-rose-600 transition-colors rounded-xl hover:bg-rose-50 cursor-pointer"
                          title="Eliminar archivo"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Dropzone de Carga de Archivo */
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        isDragging 
                          ? 'border-[#d4af37] bg-amber-50/40' 
                          : 'border-stone-200 hover:border-[#d4af37] bg-stone-50/50 hover:bg-[#FAF9F6]'
                      }`}
                    >
                      <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-stone-100 text-[#d4af37] flex items-center justify-center mx-auto mb-3">
                        <UploadCloud size={24} />
                      </div>
                      <span className="text-sm font-bold text-stone-800 block">
                        Haz clic para seleccionar o arrastra el archivo HTML de Google aquí
                      </span>
                      <p className="text-xs text-stone-400 mt-1 max-w-md mx-auto">
                        Sube el archivo descargado de Search Console (ej. <code className="text-stone-600 font-mono">google2cf0952089a4bfcd.html</code>). 
                        El sistema lo publicará de inmediato en <code className="text-stone-600">https://www.probookia.com/</code>.
                      </p>
                    </div>
                  )}
                </div>

                {/* 2. MÉTODO SECUNDARIO: ETIQUETA META HTML */}
                <div className="pt-4 border-t border-stone-100">
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="saas-google-verification" className="text-sm font-bold text-stone-700">
                      Método Alternativo: Código o Metaetiqueta HTML
                    </label>
                    {formData.google_site_verification && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        Token configurado
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="saas-google-verification"
                    value={formData.google_site_verification}
                    onChange={handleSearchConsoleChange}
                    placeholder='ej. 2cf0962089e4bfed o etiqueta <meta name="google-site-verification" content="..." />'
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-mono text-xs md:text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    Al subir el archivo HTML, este token se autocompleta. También puedes pegar la etiqueta <code>&lt;meta&gt;</code> manualmente si lo prefieres.
                  </p>
                </div>

              </div>
            </div>

            {/* Bento Card 2: Google Tag Manager & Google Analytics 4 */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-5 border-b border-stone-100 mb-6">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-amber-50 text-[#d4af37] flex items-center justify-center font-bold shadow-sm">
                    <Layers size={22} />
                  </span>
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-stone-900">Google Tag Manager & Analytics 4</h3>
                    <p className="text-xs text-stone-400">Contenedor de etiquetas y métricas de visitas para la landing pública</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://tagmanager.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#d4af37] transition-colors font-medium bg-stone-50 hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-stone-200/60"
                  >
                    <span>GTM</span>
                    <ExternalLink size={12} />
                  </a>
                  <a
                    href="https://analytics.google.com/"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#d4af37] transition-colors font-medium bg-stone-50 hover:bg-amber-50 px-3 py-1.5 rounded-xl border border-stone-200/60"
                  >
                    <span>GA4</span>
                    <ExternalLink size={12} />
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* GTM Container ID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="saas-gtm-id" className="text-sm font-bold text-stone-700">
                      ID del Contenedor GTM
                    </label>
                    {gtmValidation.status === 'valid' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        Válido
                      </span>
                    )}
                    {gtmValidation.status === 'error' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertCircle size={12} />
                        Inválido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="saas-gtm-id"
                    value={formData.gtm_container_id}
                    onChange={handleGtmChange}
                    placeholder="GTM-N4FTWCBX"
                    maxLength={20}
                    className={`w-full px-4 py-3 rounded-xl border bg-stone-50 text-stone-900 font-mono text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:bg-white ${
                      gtmValidation.status === 'error'
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-200'
                        : 'border-stone-200 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20'
                    }`}
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    Formato: <code>GTM-XXXXXXX</code>. Si se deja en blanco, usará el contenedor GTM por defecto.
                  </p>
                </div>

                {/* Google Analytics 4 ID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="saas-ga4-id" className="text-sm font-bold text-stone-700">
                      ID de Medición GA4
                    </label>
                    {ga4Validation.status === 'valid' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        Válido
                      </span>
                    )}
                    {ga4Validation.status === 'error' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertCircle size={12} />
                        Inválido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="saas-ga4-id"
                    value={formData.google_analytics_id}
                    onChange={handleGa4Change}
                    placeholder="G-XXXXXXXXXX"
                    maxLength={25}
                    className={`w-full px-4 py-3 rounded-xl border bg-stone-50 text-stone-900 font-mono text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:bg-white ${
                      ga4Validation.status === 'error'
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-200'
                        : 'border-stone-200 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20'
                    }`}
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    Formato: <code>G-XXXXXXXXXX</code>. Seguimiento de páginas vistas y tráfico en probookia.com.
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Card 3: Google Ads */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-5 border-b border-stone-100 mb-6">
                <div className="flex items-center gap-4">
                  <span className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-sm">
                    <TrendingUp size={22} />
                  </span>
                  <div>
                    <h3 className="text-xl font-serif font-semibold text-stone-900">Google Ads (Campañas Corporativas)</h3>
                    <p className="text-xs text-stone-400">Medición de conversiones y captación de nuevas clínicas en Probookia</p>
                  </div>
                </div>
                <a
                  href="https://ads.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-blue-600 transition-colors font-medium bg-stone-50 hover:bg-blue-50 px-3.5 py-2 rounded-xl border border-stone-200/60"
                >
                  <span>Google Ads</span>
                  <ExternalLink size={13} />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Google Ads ID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="saas-ads-id" className="text-sm font-bold text-stone-700">
                      ID de Conversión (Google Ads)
                    </label>
                    {googleAdsIdValidation.status === 'valid' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="saas-ads-id"
                    value={formData.google_ads_id}
                    onChange={handleGoogleAdsIdChange}
                    placeholder="AW-123456789 o 123456789"
                    maxLength={25}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-mono text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    Tu ID numérico de Google Ads. Si omites &quot;AW-&quot;, se autocompletará.
                  </p>
                </div>

                {/* Google Ads Label */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="saas-ads-label" className="text-sm font-bold text-stone-700">
                      Etiqueta de Conversión (Label)
                    </label>
                    {googleAdsLabelValidation.status === 'valid' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        Válido
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    id="saas-ads-label"
                    value={formData.google_ads_conversion_label}
                    onChange={handleGoogleAdsLabelChange}
                    placeholder="AbCdEfGhIjKlMnOp"
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-stone-50 text-stone-900 font-mono text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                  <p className="text-[11px] text-stone-400 mt-1.5">
                    Etiqueta generada en la acción de conversión (ej. Registro completado o Lead).
                  </p>
                </div>
              </div>
            </div>

            {/* Bento Card 4: Indexación de Buscadores */}
            <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-4 mb-6 pb-5 border-b border-stone-100">
                <span className="w-12 h-12 rounded-2xl bg-[#fcf8e5] text-[#b08e23] flex items-center justify-center font-bold shadow-sm">
                  <Globe className="w-6 h-6" />
                </span>
                <div>
                  <h3 className="text-xl font-serif font-semibold text-stone-900">Indexación en Buscadores</h3>
                  <span className="text-[10px] text-stone-400 font-medium uppercase tracking-widest block mt-0.5">Control de Visibilidad Global de Probookia</span>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-5 bg-stone-50 rounded-2xl border border-stone-100 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-stone-400 shrink-0 shadow-sm">
                    <ShieldCheck size={20} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-stone-800 text-sm">Visibilidad del SaaS Global</h4>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      Controla si la landing page corporativa de <strong>Probookia (www.probookia.com)</strong> y sus páginas de marketing son indexables en Google. Si desactivas esta opción, se agregará la directiva <code>noindex, nofollow</code> al sitio global.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-stone-50/50 rounded-2xl border border-stone-100">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-stone-900">
                      {formData.allow_search_engine_indexing ? 'Indexación Global Activada' : 'Indexación Global Desactivada'}
                    </span>
                    <span className="text-[11px] text-stone-400 font-medium mt-0.5">
                      {formData.allow_search_engine_indexing 
                        ? 'El SaaS corporativo y la landing serán rastreados por motores de búsqueda.' 
                        : 'Rastreo bloqueado temporalmente (Directiva noindex activa).'}
                    </span>
                  </div>

                  <label className="flex items-center gap-4 cursor-pointer self-start sm:self-auto">
                    <div className="relative">
                      <input 
                        type="checkbox" 
                        checked={formData.allow_search_engine_indexing} 
                        onChange={(e) => setFormData(prev => ({ ...prev, allow_search_engine_indexing: e.target.checked }))}
                        disabled={savingSettings}
                        className="sr-only" 
                      />
                      <div className={`block w-14 h-8 rounded-full transition-colors ${formData.allow_search_engine_indexing ? 'bg-[#d4af37]' : 'bg-stone-300'} ${savingSettings ? 'opacity-50' : ''}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${formData.allow_search_engine_indexing ? 'translate-x-6' : ''} shadow-sm`}></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

          </div>

          {/* BOTÓN DE GUARDADO PRINCIPAL (Quiet Luxury) */}
          <div className="flex items-center justify-end pt-4 pb-12">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2.5 bg-[#1F2937] hover:bg-[#d4af37] text-white font-bold py-3.5 px-8 rounded-2xl shadow-luxury text-sm transition-all duration-300 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {savingSettings ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando Cambios...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Configuración Global</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
}
