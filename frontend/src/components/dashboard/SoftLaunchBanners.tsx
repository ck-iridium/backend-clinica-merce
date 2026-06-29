"use client"

import { useState, useEffect } from 'react';
import { Mail, Compass, ShieldAlert, Loader2 } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function SoftLaunchBanners() {
  const [limitsData, setLimitsData] = useState<any>(null);
  const [trialTimeLeft, setTrialTimeLeft] = useState<string>('');
  const [emailTimeLeft, setEmailTimeLeft] = useState<string>('');
  const [loading, setLoading] = useState(true);

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

  if (loading || !limitsData) return null;

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

      {/* 2. Banner de Trial de 14 Días - Dorado Premium */}
      {showTrialBanner && (
        <div className="bg-gradient-to-r from-stone-950 to-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row items-center md:justify-between gap-4 shadow-luxury animate-in fade-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#d4af37]/10 text-[#d4af37] border border-[#d4af37]/20 flex items-center justify-center shadow-inner">
              <Compass className="w-5 h-5" />
            </span>
            <div>
              <p className="text-xs font-bold text-white">Periodo de Prueba Activo (Plan {limitsData.plan_type?.toUpperCase()})</p>
              <p className="text-[10px] text-stone-400 font-medium mt-0.5 leading-normal">
                Disfruta de todas las características premium sin límites de prueba. Activa tu suscripción en cualquier momento desde los ajustes de facturación.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-stone-900 border border-stone-800 rounded-xl px-4 py-2 shadow-inner">
              <span className="text-xs font-extrabold text-[#d4af37] font-mono tracking-tight">{trialTimeLeft}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
