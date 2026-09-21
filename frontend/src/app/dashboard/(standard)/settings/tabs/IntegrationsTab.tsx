"use client";

import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Sparkles,
  HelpCircle,
  Lock,
  Layers,
  BarChart3
} from 'lucide-react';

interface IntegrationsTabProps {
  settings: any;
  setSettings: (s: any) => void;
}

export default function IntegrationsTab({ settings, setSettings }: IntegrationsTabProps) {
  const gtmId = settings.gtm_container_id || '';
  const googleAdsId = settings.google_ads_id || '';
  const googleAdsLabel = settings.google_ads_conversion_label || '';

  // Validación en vivo de GTM
  const gtmValidation = useMemo(() => {
    if (!gtmId) return { status: 'empty', message: 'No configurado (opcional)' };
    const trimmed = gtmId.trim();
    if (trimmed.includes('<') || trimmed.toLowerCase().includes('script')) {
      return { status: 'error', message: 'No se admiten etiquetas de código <script>, introduce solo el identificador' };
    }
    const regex = /^GTM-[A-Z0-9]+$/;
    if (regex.test(trimmed.toUpperCase())) {
      return { status: 'valid', message: 'Identificador válido' };
    }
    return { status: 'error', message: 'Formato esperado: GTM-XXXXXXX' };
  }, [gtmId]);

  // Validación en vivo de Google Ads ID
  const googleAdsIdValidation = useMemo(() => {
    if (!googleAdsId) return { status: 'empty', message: 'No configurado (opcional)' };
    const trimmed = googleAdsId.trim();
    if (trimmed.includes('<') || trimmed.toLowerCase().includes('script')) {
      return { status: 'error', message: 'No se admiten etiquetas de script' };
    }
    const clean = trimmed.toUpperCase().startsWith('AW-') ? trimmed.toUpperCase() : `AW-${trimmed}`;
    const regex = /^AW-[0-9]+$/;
    if (regex.test(clean)) {
      return { status: 'valid', message: 'ID de Google Ads válido' };
    }
    return { status: 'error', message: 'Formato esperado: AW-123456789 o números' };
  }, [googleAdsId]);

  // Validación en vivo de Conversion Label
  const googleAdsLabelValidation = useMemo(() => {
    if (!googleAdsLabel) return { status: 'empty', message: 'No configurado (opcional)' };
    const trimmed = googleAdsLabel.trim();
    if (trimmed.includes('<') || trimmed.toLowerCase().includes('script')) {
      return { status: 'error', message: 'No se admiten scripts' };
    }
    const regex = /^[a-zA-Z0-9_-]+$/;
    if (regex.test(trimmed)) {
      return { status: 'valid', message: 'Etiqueta válida' };
    }
    return { status: 'error', message: 'Solo caracteres alfanuméricos, guiones y barras bajas' };
  }, [googleAdsLabel]);

  const handleGtmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Sanitización básica inmediata: evitar que peguen tags completos
    val = val.replace(/<[^>]*>?/gm, '').trim();
    setSettings({ ...settings, gtm_container_id: val.toUpperCase() });
  };

  const handleGoogleAdsIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/<[^>]*>?/gm, '').trim();
    setSettings({ ...settings, google_ads_id: val });
  };

  const handleGoogleAdsLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/<[^>]*>?/gm, '').trim();
    setSettings({ ...settings, google_ads_conversion_label: val });
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-2 duration-300">
      
      {/* Banner de Filosofía Quiet Luxury & Seguridad RGPD */}
      <div className="bg-gradient-to-r from-stone-900 to-stone-800 text-white rounded-3xl p-6 md:p-8 shadow-luxury border border-stone-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#d4af37]">
              <ShieldCheck size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Aislamiento Seguro & RGPD</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-100">
              Integraciones de Marketing y Conversión
            </h2>
            <p className="text-stone-300 text-sm max-w-2xl leading-relaxed">
              Mide el retorno de tus campañas de Google Ads y gestiona eventos analíticos con total autonomía. 
              Los rastreadores solo se ejecutan en las páginas públicas de reserva y únicamente cuando el paciente acepta las cookies.
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 flex items-center gap-3 shrink-0">
            <Lock className="text-[#d4af37]" size={20} />
            <div className="text-xs">
              <span className="font-bold block text-white">Panel Clínico Protegido</span>
              <span className="text-stone-300">Cero tracking en área médica</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta 1: Google Tag Manager */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-[#d4af37] flex items-center justify-center font-bold">
              <Layers size={20} />
            </span>
            <div>
              <h3 className="text-xl font-serif font-semibold text-stone-900">Google Tag Manager (GTM)</h3>
              <p className="text-xs text-stone-400">Contenedor unificado para Google Analytics, Meta Pixel y más</p>
            </div>
          </div>
          <a
            href="https://tagmanager.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-[#d4af37] transition-colors font-medium"
          >
            <span>Consola de GTM</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="space-y-4">
          <label className="block">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-stone-700">ID del Contenedor GTM</span>
              {gtmValidation.status === 'valid' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <CheckCircle2 size={13} />
                  {gtmValidation.message}
                </span>
              )}
              {gtmValidation.status === 'error' && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  <AlertCircle size={13} />
                  {gtmValidation.message}
                </span>
              )}
            </div>
            <input
              type="text"
              id="integrations-gtm-container-input"
              value={gtmId}
              onChange={handleGtmChange}
              placeholder="GTM-XXXXXXX"
              maxLength={20}
              className={`w-full px-4 py-3 rounded-xl border bg-stone-50 text-stone-900 font-mono text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:bg-white ${
                gtmValidation.status === 'error' 
                  ? 'border-rose-300 focus:ring-2 focus:ring-rose-200' 
                  : 'border-stone-200 focus:border-[#d4af37] focus:ring-2 focus:ring-[#d4af37]/20'
              }`}
            />
          </label>

          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 flex items-start gap-3">
            <HelpCircle className="text-stone-400 shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-stone-500 space-y-1">
              <p>
                Introduce el código con formato <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-bold text-stone-700">GTM-XXXXXXX</code>.
              </p>
              <p>
                Al confirmarse una cita en tu web, Probookia emitirá automáticamente el evento <code className="bg-white px-1.5 py-0.5 rounded border border-stone-200 font-mono text-stone-700">appointment_booked</code> con el valor de la reserva hacia tu <code className="text-stone-700">dataLayer</code>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Google Ads (Seguimiento de Conversiones) */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-stone-100 p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between pb-4 border-b border-stone-100 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp size={20} />
            </span>
            <div>
              <h3 className="text-xl font-serif font-semibold text-stone-900">Google Ads (Conversiones)</h3>
              <p className="text-xs text-stone-400">Atribución directa de citas reservadas a tus campañas de pago</p>
            </div>
          </div>
          <a
            href="https://ads.google.com/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-stone-500 hover:text-blue-600 transition-colors font-medium"
          >
            <span>Google Ads</span>
            <ExternalLink size={13} />
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ID de Conversión */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-stone-700">ID de Conversión</span>
              {googleAdsIdValidation.status === 'valid' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} />
                  Válido
                </span>
              )}
            </div>
            <input
              type="text"
              id="integrations-google-ads-id-input"
              value={googleAdsId}
              onChange={handleGoogleAdsIdChange}
              placeholder="AW-123456789 o 123456789"
              maxLength={25}
              className={`w-full px-4 py-3 rounded-xl border bg-stone-50 text-stone-900 font-mono text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:bg-white ${
                googleAdsIdValidation.status === 'error'
                  ? 'border-rose-300 focus:ring-2 focus:ring-rose-200'
                  : 'border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
            />
            <p className="text-[11px] text-stone-400 mt-1.5">
              Tu ID numérico de Google Ads. Si omites &quot;AW-&quot;, el sistema lo normalizará automáticamente.
            </p>
          </div>

          {/* Etiqueta de Conversión */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-stone-700">Etiqueta de Conversión (Label)</span>
              {googleAdsLabelValidation.status === 'valid' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={12} />
                  Válido
                </span>
              )}
            </div>
            <input
              type="text"
              id="integrations-google-ads-label-input"
              value={googleAdsLabel}
              onChange={handleGoogleAdsLabelChange}
              placeholder="AbCdEfGhIjKlMnOp"
              maxLength={50}
              className={`w-full px-4 py-3 rounded-xl border bg-stone-50 text-stone-900 font-mono text-sm placeholder:text-stone-400 transition-all focus:outline-none focus:bg-white ${
                googleAdsLabelValidation.status === 'error'
                  ? 'border-rose-300 focus:ring-2 focus:ring-rose-200'
                  : 'border-stone-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
              }`}
            />
            <p className="text-[11px] text-stone-400 mt-1.5">
              Etiqueta alfanumérica generada en la acción de conversión de Google Ads (ej. <em>Reserva de Cita</em>).
            </p>
          </div>
        </div>
      </div>

      {/* Tarjeta 3: Ecosistema Extensible (Próximas Integraciones) */}
      <div className="bg-stone-50/70 border border-stone-200/80 rounded-3xl p-6 md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-xl bg-stone-200/60 text-stone-600 flex items-center justify-center">
            <Sparkles size={16} />
          </span>
          <div>
            <h4 className="text-base font-serif font-semibold text-stone-800">Ecosistema Extensible</h4>
            <p className="text-xs text-stone-500">Próximos conectores nativos en desarrollo para tu clínica</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-white rounded-2xl border border-stone-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800 block">Meta Pixel & CAPI</span>
              <span className="text-[10px] text-stone-400">Facebook e Instagram Ads</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-1 rounded-md">
              Pronto
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800 block">TikTok Pixel</span>
              <span className="text-[10px] text-stone-400">Captación en vídeo corto</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-1 rounded-md">
              Pronto
            </span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-stone-200/60 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800 block">Webhooks en Vivo</span>
              <span className="text-[10px] text-stone-400">Zapier / Make / CRM externo</span>
            </div>
            <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500 px-2 py-1 rounded-md">
              Pronto
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
