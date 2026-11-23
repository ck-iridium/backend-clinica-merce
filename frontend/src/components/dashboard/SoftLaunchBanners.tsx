"use client"

import { useState, useEffect } from 'react';
import { Mail, Compass, ShieldAlert, Loader2, Sparkles, ExternalLink, Bot, X } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SoftLaunchBanners() {
  const [limitsData, setLimitsData] = useState<any>(null);
  const [trialTimeLeft, setTrialTimeLeft] = useState<string>('');
  const [emailTimeLeft, setEmailTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [demoBannerDismissed, setDemoBannerDismissed] = useState(true); // default true until checked
  const [trialBannerDismissed, setTrialBannerDismissed] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('probookia_demo_banner_dismissed') === 'true';
      setDemoBannerDismissed(dismissed);
      const trialDismissed = sessionStorage.getItem('probookia_trial_banner_dismissed') === 'true';
      setTrialBannerDismissed(trialDismissed);
    }
  }, []);

  const handleDismissTrialBanner = () => {
    setTrialBannerDismissed(true);
    try {
      sessionStorage.setItem('probookia_trial_banner_dismissed', 'true');
    } catch {}
  };

  const handleDismissDemoBanner = () => {
    setDemoBannerDismissed(true);
    try {
      localStorage.setItem('probookia_demo_banner_dismissed', 'true');
    } catch {}
  };

  const handleOpenCopilot = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-probookia-copilot'));
    }
  };

  useEffect(() => {
    const fetchLimitsAndStatus = async () => {
      try {
        const response = await fetch(`${API_URL}/settings/limits`);
        if (response.ok) {
          const data = await response.json();
          setLimitsData(data);
          
          // Guardar metadatos locales para uso posterior del Paywall (/suspended)
          if (data.tenant_id) {
            localStorage.setItem('last_tenant_id', data.tenant_id);
            localStorage.setItem('last_plan', data.plan_type || 'pro');
          }
        }
      } catch (err) {
        console.warn('SoftLaunchBanners: Error al recuperar datos de suscripción.', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLimitsAndStatus();
    
    // Polling ligero de estado cada 5 minutos
    const interval = setInterval(fetchLimitsAndStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcular cuentas atrás
  useEffect(() => {
    if (!limitsData) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();

      // 1. Cuenta atrás del Trial (14 días)
      if (limitsData.subscription_status === 'trial' && limitsData.subscription_expires_at) {
        const expireTime = new Date(limitsData.subscription_expires_at).getTime();
        const diff = expireTime - now;

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          if (days > 0) {
            setTrialTimeLeft(`Te quedan ${days} ${days === 1 ? 'día' : 'días'} de prueba gratuita.`);
          } else {
            setTrialTimeLeft(`Te quedan ${hours} ${hours === 1 ? 'hora' : 'horas'} de prueba gratuita.`);
          }
        } else {
          setTrialTimeLeft('');
        }
      } else {
        setTrialTimeLeft('');
      }

      // 2. Cuenta atrás del Email (48 horas)
      if (!limitsData.email_verified && limitsData.created_at) {
        const createTime = new Date(limitsData.created_at).getTime();
        const limitTime = createTime + (48 * 60 * 60 * 1000); // 48 horas
        const diff = limitTime - now;

        if (diff > 0) {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setEmailTimeLeft(`Te quedan ${hours}h y ${minutes}m para confirmar tu cuenta.`);
        } else {
          setEmailTimeLeft('Tiempo de verificación expirado.');
        }
      } else {
        setEmailTimeLeft('');
      }

    }, 1000);

    return () => clearInterval(timer);
  }, [limitsData]);

  if (!mounted || loading || !limitsData) return null;

  const showTrialBanner = limitsData.subscription_status === 'trial' && trialTimeLeft;
  const showEmailBanner = !limitsData.email_verified && emailTimeLeft && limitsData.subscription_status !== 'suspended';

  return (
    <div className="w-full space-y-3 mb-6 select-none font-sans">
      
      {/* 1. Banner de Verificación de Email (48 Horas) - Azul Premium */}
      {showEmailBanner && (
        <div className="bg-blue-50/70 backdrop-blur-sm border border-blue-100 rounded-2xl p-4 flex flex-col md:flex-row items-center md:justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner">
              <Mail className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-blue-900">Confirma tu correo electrónico</p>
              <p className="text-[10px] text-blue-600 font-medium mt-0.5 leading-normal">
                Hemos enviado un correo a tu bandeja de entrada. Por favor, confírmalo para evitar que tu cuenta sea suspendida temporalmente por seguridad.
              </p>
            </div>
          </div>
          <div className="flex items-center bg-white border border-blue-100 rounded-xl px-4 py-2 shadow-inner">
            <span className="text-[9px] uppercase font-extrabold text-blue-500 tracking-wider mr-2">Cierre en</span>
            <span className="text-xs font-extrabold text-blue-700 font-mono tracking-tight">{emailTimeLeft}</span>
          </div>
        </div>
      )}

      {/* 2. Banner de Trial - Compacto, Elegante y Descartable */}
      {showTrialBanner && !trialBannerDismissed && (
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 border border-stone-800/90 rounded-2xl py-3 px-4 sm:px-5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#FF6B00] border border-orange-500/20 flex items-center justify-center shrink-0 shadow-inner">
              <Compass className="w-4 h-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-white truncate">Periodo de Prueba Activo (Plan {limitsData.plan_type?.toUpperCase() || 'PRO'})</p>
                <span className="text-[9px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full font-black uppercase shrink-0">
                  Prueba
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-medium mt-0.5 leading-tight truncate sm:whitespace-normal">
                Disfruta de todas las características sin límites. Activa tu plan en cualquier momento.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
            <div className="bg-stone-900/90 border border-orange-500/30 rounded-xl px-3 py-1.5 shadow-inner">
              <span className="text-xs font-black text-orange-400 font-mono tracking-tight">{trialTimeLeft}</span>
            </div>
            <button
              type="button"
              onClick={handleDismissTrialBanner}
              className="p-1.5 text-stone-400 hover:text-white transition-colors rounded-xl hover:bg-white/10 cursor-pointer"
              title="Ocultar este aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Banner de Inicialización con Contenido de Demostración */}
      {!demoBannerDismissed && (
        <div className="bg-gradient-to-r from-amber-500/10 via-[#FAF9F5] to-amber-500/5 border border-[#d4af37]/40 rounded-2xl p-4 flex flex-col md:flex-row items-center md:justify-between gap-4 shadow-sm animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3.5">
            <span className="w-10 h-10 rounded-xl bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 flex items-center justify-center shrink-0 shadow-inner">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-xs font-bold text-stone-900">
                  Tu web ha sido inicializada con datos y fotografías de ejemplo
                </p>
                <span className="text-[9px] bg-[#d4af37]/20 text-[#9e7d17] border border-[#d4af37]/40 px-2 py-0.5 rounded-full font-extrabold uppercase">
                  Modo Inicial
                </span>
              </div>
              <p className="text-[11px] text-stone-600 font-medium mt-0.5 leading-normal max-w-2xl">
                Hemos preparado tu web con imágenes editoriales y servicios sugeridos de tu sector. Puedes editarlos en tu catálogo, eliminarlos o pedirle al Asistente IA que vuelque tus tarifas reales.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white hover:text-amber-300 border border-stone-700/80 hover:border-amber-400/50 text-[11px] font-bold transition-all shadow-sm active:scale-95 group"
            >
              <span>Ver mi Web</span>
              <ExternalLink className="w-3 h-3 text-stone-400 group-hover:text-amber-300 transition-colors" />
            </a>
            <button
              type="button"
              onClick={handleOpenCopilot}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-900 dark:text-amber-200 border border-amber-400/40 hover:border-amber-400/70 text-[11px] font-bold transition-all shadow-xs active:scale-95"
            >
              <Bot className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Abrir Copiloto IA</span>
            </button>
            <button
              type="button"
              onClick={handleDismissDemoBanner}
              className="p-1.5 text-stone-400 hover:text-stone-700 transition-colors rounded-lg hover:bg-stone-200/50"
              title="Ocultar este aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
