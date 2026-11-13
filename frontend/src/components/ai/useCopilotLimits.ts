'use client';

import { useState, useEffect, useCallback } from 'react';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

export function useCopilotLimits() {
  const [planType, setPlanType] = useState<string | null>(null);
  const [trialRemaining, setTrialRemaining] = useState<number | null>(null);
  const [hasOwnKey, setHasOwnKey] = useState<boolean>(false);
  const [isTrialExhausted, setIsTrialExhausted] = useState<boolean>(false);
  const [dailyActionsUsed, setDailyActionsUsed] = useState<number>(0);
  const [dailyActionsLimit, setDailyActionsLimit] = useState<number>(0);

  // 1. Fetch inicial de límites y cuotas asignadas según suscripción
  useEffect(() => {
    async function fetchPlanAndTrial() {
      try {
        const userSession = localStorage.getItem('user');
        let tenantId = getCookie('tenant_id') || '';
        let authToken = '';
        if (userSession) {
          try {
            const parsed = JSON.parse(userSession);
            if (!tenantId) tenantId = parsed.tenant_id || '';
            authToken = parsed.access_token || parsed.token || '';
          } catch (e) {
            console.error('Error parsing user session in AI Widget:', e);
          }
        }
        if (!tenantId) {
          return;
        }

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        const res = await fetch(`${API_URL}/settings/limits`, {
          headers: {
            'X-Tenant-ID': tenantId,
            'Authorization': authToken ? `Bearer ${authToken}` : ''
          }
        });

        if (res.ok) {
          const d = await res.json();
          const plan = d.plan_type?.toLowerCase() || 'free';
          setPlanType(plan);
          
          const ownKey = d.limits?.ai_allowed && d.limits?.ai_requires_byok;
          setHasOwnKey(!!ownKey);
          
          const used = d.ai_trial_queries_used ?? 0;
          const remaining = Math.max(0, 10 - used);
          setTrialRemaining(remaining);
          
          setDailyActionsUsed(d.ai_daily_actions_used ?? 0);
          setDailyActionsLimit(d.limits?.ai_smart_actions_daily ?? 0);
          
          if (plan === 'free' && !ownKey && remaining <= 0) {
            setIsTrialExhausted(true);
          }
        }
      } catch (err) {
        console.error('Error al obtener límites de plan en useCopilotLimits:', err);
      }
    }

    fetchPlanAndTrial();
  }, []);

  // 2. Método auxiliar para actualizar las cuotas tras una respuesta del servidor
  const updateLimitsAfterResponse = useCallback((data: any) => {
    if (typeof data?.trial_remaining === 'number') {
      setTrialRemaining(data.trial_remaining);
      if (planType === 'free' && data.trial_remaining <= 0 && !hasOwnKey) {
        setIsTrialExhausted(true);
      } else if ((planType === 'basic' || planType === 'pro') && !hasOwnKey) {
        setDailyActionsUsed(Math.max(0, dailyActionsLimit - data.trial_remaining));
      }
    }
  }, [planType, hasOwnKey, dailyActionsLimit]);

  return {
    planType,
    setPlanType,
    trialRemaining,
    setTrialRemaining,
    hasOwnKey,
    setHasOwnKey,
    isTrialExhausted,
    setIsTrialExhausted,
    dailyActionsUsed,
    setDailyActionsUsed,
    dailyActionsLimit,
    setDailyActionsLimit,
    updateLimitsAfterResponse
  };
}
