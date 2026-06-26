'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Clock, AlertTriangle } from 'lucide-react';

export default function GracePeriodBanner() {
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const fetchLimits = async () => {
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
        try {
          const parsed = JSON.parse(userSession);
          if (!tenantId) {
            tenantId = parsed.tenant_id || '';
          }
          authToken = parsed.access_token || parsed.token || '';
        } catch (e) {
          console.error("Error parsing user session in GracePeriodBanner:", e);
        }
      }

      if (!tenantId) return;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/settings/limits`, {
        headers: {
          'X-Tenant-ID': tenantId,
          'Authorization': authToken ? `Bearer ${authToken}` : ''
        }
      });
      if (res.ok) {
        const json = await res.json();
        setSubscriptionData(json);
      }
    } catch (e) {
      console.error("Error fetching limits for GracePeriodBanner:", e);
    }
  };

  useEffect(() => {
    fetchLimits();
    
    // Escuchar el evento de actualización de límites para refrescar el banner al instante
    const handleRefresh = () => {
      fetchLimits();
    };
    window.addEventListener('refresh-limits', handleRefresh);
    return () => {
      window.removeEventListener('refresh-limits', handleRefresh);
    };
  }, []);

  useEffect(() => {
    if (!subscriptionData || subscriptionData.subscription_status !== 'grace' || !subscriptionData.subscription_expires_at) {
      return;
    }

    const interval = setInterval(() => {
      const expiresAt = new Date(subscriptionData.subscription_expires_at).getTime();
      const now = new Date().getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft('Expirado');
        clearInterval(interval);
        // Recargar la página para que el middleware bloquee el acceso
        window.location.reload();
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        let text = '';
        if (hours > 0) text += `${hours}h `;
        text += `${minutes}m ${seconds}s`;
        setTimeLeft(text);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [subscriptionData]);

  if (!subscriptionData || subscriptionData.subscription_status !== 'grace') {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-600/5 border-b border-amber-500/20 px-6 py-3.5 flex items-center justify-between gap-4 select-none relative z-40 animate-in fade-in duration-300">
      <div className="flex items-center gap-3.5 mx-auto md:mx-0">
        <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 animate-pulse shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-left">
          <p className="text-xs font-bold text-amber-800 tracking-wide">
            Activación Optimista (Bizum en verificación)
          </p>
          <p className="text-[10px] md:text-xs text-amber-700/80 font-medium mt-0.5">
            Hemos activado temporalmente tu plan solicitado para que sigas operando con normalidad.
          </p>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 bg-amber-500/10 border border-amber-500/25 px-4 py-1.5 rounded-2xl shrink-0">
        <Clock className="w-3.5 h-3.5 text-amber-700 animate-spin-slow" />
        <span className="text-xs font-mono font-black text-amber-800 tracking-wider">
          {timeLeft || 'Calculando...'} restantes
        </span>
      </div>
    </div>
  );
}
