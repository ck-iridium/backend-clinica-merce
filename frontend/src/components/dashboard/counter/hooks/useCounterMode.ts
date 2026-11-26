"use client";

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { getCounterOperatorsAction, getCounterShowcaseServicesAction } from '@/app/actions/team';
import { Operator, ShowcaseService, CounterModeManagerProps } from '../types';

export function useCounterMode({
  tenantId: initialTenantId,
  clinicName = "Clínica",
  logoUrl,
  initialEnableCounterMode = false,
  initialEnableTimeClock = true,
  initialDarkMode = false
}: CounterModeManagerProps) {
  const [tenantId, setTenantId] = useState<string>(initialTenantId || '');
  const [enableCounterMode, setEnableCounterMode] = useState<boolean>(initialEnableCounterMode);
  const [enableTimeClock, setEnableTimeClock] = useState<boolean>(initialEnableTimeClock);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(initialDarkMode);
  const [autolockMinutes, setAutolockMinutes] = useState<number>(10);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  // Estados de Operadoras
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoadingOperators, setIsLoadingOperators] = useState<boolean>(true);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [pinValue, setPinValue] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);
  const [showcaseServices, setShowcaseServices] = useState<ShowcaseService[]>([]);

  // Estados del Token QR dinámico de 20s
  const [qrToken, setQrToken] = useState<string>('');
  const [qrSecondsLeft, setQrSecondsLeft] = useState<number>(20);
  const [isFetchingToken, setIsFetchingToken] = useState<boolean>(false);

  // Refs de temporizadores y teclado físico
  const autolockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrCountdownRef = useRef<NodeJS.Timeout | null>(null);

  const pinValueRef = useRef<string>(pinValue);
  const selectedOperatorRef = useRef<Operator | null>(selectedOperator);
  const isLockedRef = useRef<boolean>(isLocked);
  const isVerifyingPinRef = useRef<boolean>(isVerifyingPin);
  const availableOperatorsRef = useRef<Operator[]>([]);

  const operatorsRef = useRef<Operator[]>([]);
  const enableCounterModeRef = useRef<boolean>(initialEnableCounterMode);
  const autolockMinutesRef = useRef<number>(10);
  const isFetchingOperatorsRef = useRef<boolean>(false);
  const initialLoadedRef = useRef<string>('');

  // Filtrar estrictamente operadoras que cuentan con PIN configurado
  const availableOperators = useMemo(() => {
    return operators.filter(op => Boolean(op.has_pin));
  }, [operators]);

  useEffect(() => { pinValueRef.current = pinValue; }, [pinValue]);
  useEffect(() => { selectedOperatorRef.current = selectedOperator; }, [selectedOperator]);
  useEffect(() => { isLockedRef.current = isLocked; }, [isLocked]);
  useEffect(() => { isVerifyingPinRef.current = isVerifyingPin; }, [isVerifyingPin]);
  useEffect(() => { availableOperatorsRef.current = availableOperators; }, [availableOperators]);
  useEffect(() => { operatorsRef.current = operators; }, [operators]);
  useEffect(() => { enableCounterModeRef.current = enableCounterMode; }, [enableCounterMode]);
  useEffect(() => { autolockMinutesRef.current = autolockMinutes; }, [autolockMinutes]);

  useEffect(() => {
    if (initialTenantId && initialTenantId !== tenantId) {
      setTenantId(initialTenantId);
    }
  }, [initialTenantId, tenantId]);

  useEffect(() => {
    if (typeof initialDarkMode !== 'undefined' && initialDarkMode !== isDarkMode) {
      setIsDarkMode(initialDarkMode);
    }
  }, [initialDarkMode]);

  useEffect(() => {
    setMounted(true);
    if (typeof document !== 'undefined') {
      const hasDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
      if (hasDark) {
        setIsDarkMode(true);
      }
    }
  }, []);

  // 1. Obtención ultra-resiliente del tenant_id
  const getResolvedTenantId = useCallback(() => {
    if (tenantId) return tenantId;
    if (initialTenantId) return initialTenantId;
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.tenant_id) return u.tenant_id;
        } catch (e) {}
      }
      const match = document.cookie.match(/(?:^|; )tenant_id=([^;]*)/);
      if (match && match[1]) return match[1];

      // Fallback a subdominio si estamos en *.probookia.com
      const host = window.location.hostname.toLowerCase();
      if (host.endsWith('.probookia.com') && host !== 'probookia.com' && host !== 'www.probookia.com') {
        return host.replace('.probookia.com', '');
      }
    }
    return '';
  }, [tenantId, initialTenantId]);

  // Cargar operadoras frescas del backend
  const fetchOperators = useCallback(async () => {
    if (isFetchingOperatorsRef.current) return operatorsRef.current;
    isFetchingOperatorsRef.current = true;
    setIsLoadingOperators(true);
    const tid = getResolvedTenantId();
    try {
      const actionRes = await getCounterOperatorsAction(tid || undefined);
      if (actionRes.success && Array.isArray(actionRes.data) && actionRes.data.length > 0) {
        setOperators(actionRes.data);
        operatorsRef.current = actionRes.data;
        setIsLoadingOperators(false);
        isFetchingOperatorsRef.current = false;
        return actionRes.data as Operator[];
      }
    } catch (e) {
      console.warn("Fallo Server Action getCounterOperatorsAction, probando fallback API:", e);
    }

    if (!tid) {
      setIsLoadingOperators(false);
      isFetchingOperatorsRef.current = false;
      return [] as Operator[];
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      let headers: Record<string, string> = { 'X-Tenant-ID': tid };
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const token = u.access_token || u.token;
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch(e) {}
      }

      const res = await fetch(`${apiUrl}/time-clock/operators?tenant_id=${tid}`, {
        headers,
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOperators(data);
          operatorsRef.current = data;
          if (data.length === 0) {
            setIsLocked(false);
            sessionStorage.removeItem('counter_is_locked');
          }
          setIsLoadingOperators(false);
          isFetchingOperatorsRef.current = false;
          return data as Operator[];
        }
      }
    } catch (err) {
      console.warn("No se pudieron cargar operadoras:", err);
    } finally {
      setIsLoadingOperators(false);
      isFetchingOperatorsRef.current = false;
    }
    return [] as Operator[];
  }, [getResolvedTenantId]);

  const lockCounter = useCallback((reason?: string, opsList?: Operator[]) => {
    if (!enableCounterModeRef.current) {
      toast.info("El Modo Mostrador está desactivado en Ajustes > Agenda.");
      return;
    }
    const list = opsList || operatorsRef.current;
    const withPin = list.filter(op => Boolean(op.has_pin));
    if (withPin.length === 0) {
      toast.info("Para usar el Modo Mostrador, crea al menos una operadora con PIN en Equipo.");
      setIsLocked(false);
      sessionStorage.removeItem('counter_is_locked');
      return;
    }
    setIsLocked(true);
    if (withPin.length === 1) {
      setSelectedOperator(withPin[0]);
      selectedOperatorRef.current = withPin[0];
    } else {
      setSelectedOperator(null);
      selectedOperatorRef.current = null;
    }
    setPinValue('');
    pinValueRef.current = '';
    setPinError(null);
    sessionStorage.setItem('counter_is_locked', 'true');
    if (reason) {
      toast.info(`Mostrador bloqueado por seguridad (${reason}).`);
    }
  }, []);

  const unlockCounter = useCallback(() => {
    setIsLocked(false);
    setSelectedOperator(null);
    selectedOperatorRef.current = null;
    setPinValue('');
    pinValueRef.current = '';
    setPinError(null);
    sessionStorage.removeItem('counter_is_locked');
  }, []);

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem('counter_is_locked');
    localStorage.removeItem('counter_active_operator');
    localStorage.removeItem('user');
    window.location.href = '/login';
  }, []);

  // 3. Sistema de Auto-bloqueo por Inactividad
  const resetAutolockTimer = useCallback(() => {
    if (autolockTimerRef.current) clearTimeout(autolockTimerRef.current);
    if (!enableCounterModeRef.current) return;
    if (isLockedRef.current) return;
    if (autolockMinutesRef.current <= 0) return;
    if (operatorsRef.current.length === 0) return;

    const timeoutMs = autolockMinutesRef.current * 60 * 1000;
    autolockTimerRef.current = setTimeout(() => {
      lockCounter("Inactividad prolongada en el mostrador");
    }, timeoutMs);
  }, [lockCounter]);

  // Sincronizar tenantId y escuchar eventos globales
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const resolved = getResolvedTenantId();
    if (resolved && !tenantId) setTenantId(resolved);

    if (resolved && initialLoadedRef.current !== resolved) {
      initialLoadedRef.current = resolved;

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      fetch(`${apiUrl}/settings/?tenant_id=${resolved}`, {
        headers: { 'X-Tenant-ID': resolved }
      })
        .then(res => res.json())
        .then(settings => {
          if (settings) {
            const isEnabled = Boolean(settings.enable_counter_mode);
            setEnableCounterMode(isEnabled);
            setEnableTimeClock(settings.enable_time_clock !== false);
            if (typeof settings.dark_mode_enabled !== 'undefined') {
              setIsDarkMode(Boolean(settings.dark_mode_enabled));
            }
            if (!isEnabled) {
              setIsLocked(false);
              sessionStorage.removeItem('counter_is_locked');
            } else {
              const wasLocked = sessionStorage.getItem('counter_is_locked');
              if (wasLocked === 'true') {
                setIsLocked(true);
              }
            }
            if (typeof settings.counter_autolock_minutes !== 'undefined') {
              setAutolockMinutes(Number(settings.counter_autolock_minutes) ?? 10);
            }
          }
        })
        .catch(err => console.warn("No se pudo cargar ajuste de auto-bloqueo:", err));

      fetchOperators();
      getCounterShowcaseServicesAction(resolved)
        .then(async res => {
          if (res.success && Array.isArray(res.data) && res.data.length > 0) {
            setShowcaseServices(res.data);
            return;
          }
          // Fallback directo al backend API si la Server Action devuelve vacío
          try {
            const headers: Record<string, string> = { 'X-Tenant-ID': resolved };
            const userStr = localStorage.getItem('user');
            if (userStr) {
              try {
                const u = JSON.parse(userStr);
                const token = u.access_token || u.token;
                if (token) headers['Authorization'] = `Bearer ${token}`;
              } catch (e) {}
            }
            const svcRes = await fetch(`${apiUrl}/services/`, { headers, cache: 'no-store' });
            if (svcRes.ok) {
              const svcData = await svcRes.json();
              if (Array.isArray(svcData) && svcData.length > 0) {
                const mapped = svcData
                  .filter((s: any) => s.is_active !== false && s.is_product !== true && s.is_visible_on_web !== false)
                  .slice(0, 36)
                  .map((s: any) => ({
                    id: String(s.id),
                    name: s.name,
                    price: s.price,
                    duration_minutes: s.duration_minutes,
                    image_url: s.image_url || null,
                    category_name: s.category?.name || null,
                  }))
                  .sort((a: any, b: any) => Number(Boolean(b.image_url)) - Number(Boolean(a.image_url)));
                setShowcaseServices(mapped);
              }
            }
          } catch (err) {}
        })
        .catch(() => {});
    }

    const handleOpenQR = () => setShowQRModal(true);
    const handleLock = async () => {
      if (!enableCounterModeRef.current) {
        toast.info("El Modo Mostrador está desactivado en Ajustes > Agenda.");
        return;
      }
      const freshOps = await fetchOperators();
      lockCounter("Bloqueo manual", freshOps);
    };

    const handleSettingsUpdated = (e: any) => {
      if (e?.detail) {
        if (typeof e.detail.enable_counter_mode !== 'undefined') {
          const isEnabled = Boolean(e.detail.enable_counter_mode);
          setEnableCounterMode(isEnabled);
          if (!isEnabled) {
            setIsLocked(false);
            sessionStorage.removeItem('counter_is_locked');
          }
        }
        if (typeof e.detail.enable_time_clock !== 'undefined') {
          setEnableTimeClock(e.detail.enable_time_clock !== false);
        }
        if (typeof e.detail.dark_mode_enabled !== 'undefined') {
          setIsDarkMode(Boolean(e.detail.dark_mode_enabled));
        }
      }
    };

    window.addEventListener('open_counter_qr', handleOpenQR);
    window.addEventListener('lock_counter', handleLock);
    window.addEventListener('settings_updated', handleSettingsUpdated);

    return () => {
      window.removeEventListener('open_counter_qr', handleOpenQR);
      window.removeEventListener('lock_counter', handleLock);
      window.removeEventListener('settings_updated', handleSettingsUpdated);
    };
  }, [tenantId, getResolvedTenantId, fetchOperators, lockCounter]);

  useEffect(() => {
    if (!enableCounterMode || isLocked || autolockMinutes <= 0 || operators.length === 0) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetAutolockTimer();

    events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));
    resetAutolockTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleActivity));
      if (autolockTimerRef.current) clearTimeout(autolockTimerRef.current);
    };
  }, [enableCounterMode, isLocked, autolockMinutes, operators.length, resetAutolockTimer]);

  // 4. Obtención y rotación del Token QR cada 20 segundos
  const fetchQRToken = useCallback(async () => {
    const tid = getResolvedTenantId();
    if (!tid) return;
    setIsFetchingToken(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      let headers: Record<string, string> = { 'X-Tenant-ID': tid };
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const token = u.access_token || u.token;
          if (token) headers['Authorization'] = `Bearer ${token}`;
        } catch(e) {}
      }

      const res = await fetch(`${apiUrl}/time-clock/qr-token?tenant_id=${tid}`, {
        headers,
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        const rawToken = data.token || data.qr_token || '';
        setQrToken(rawToken);
        setQrSecondsLeft(data.expires_in_seconds || 20);
      }
    } catch (err) {
      console.warn("Error al renovar token QR:", err);
    } finally {
      setIsFetchingToken(false);
    }
  }, [getResolvedTenantId]);

  useEffect(() => {
    if (!showQRModal) {
      if (qrCountdownRef.current) clearInterval(qrCountdownRef.current);
      return;
    }

    fetchQRToken();

    qrCountdownRef.current = setInterval(() => {
      setQrSecondsLeft(prev => {
        if (prev <= 1) {
          fetchQRToken();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (qrCountdownRef.current) clearInterval(qrCountdownRef.current);
    };
  }, [showQRModal, fetchQRToken]);

  // 5. Verificación de PIN
  const verifyPinAndUnlock = useCallback(async (staffId: string, pin: string) => {
    setIsVerifyingPin(true);
    setPinError(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/time-clock/verify-pin?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          staff_id: staffId,
          pin: pin
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "PIN incorrecto.");
      }

      const activeOperator = data.operator || data;

      localStorage.setItem('counter_active_operator', JSON.stringify(activeOperator));
      window.dispatchEvent(new CustomEvent('counter_operator_changed', { detail: activeOperator }));

      toast.success(`Mostrador activo: ${activeOperator.full_name || 'Operadora'}`);
      unlockCounter();
    } catch (err: any) {
      setPinError(err.message || "PIN incorrecto.");
      setPinValue('');
      pinValueRef.current = '';
    } finally {
      setIsVerifyingPin(false);
    }
  }, [tenantId, unlockCounter]);

  const handlePinInput = useCallback((digit: string) => {
    if (pinValue.length < 4) {
      const nextPin = pinValue + digit;
      setPinValue(nextPin);
      setPinError(null);

      if (nextPin.length === 4 && selectedOperator) {
        verifyPinAndUnlock(selectedOperator.id, nextPin);
      }
    }
  }, [pinValue, selectedOperator, verifyPinAndUnlock]);

  const handlePinBackspace = useCallback(() => {
    setPinValue(prev => {
      const next = prev.slice(0, -1);
      pinValueRef.current = next;
      return next;
    });
    setPinError(null);
  }, []);

  const handleResetOperator = useCallback(() => {
    if (availableOperators.length > 1) {
      setSelectedOperator(null);
      selectedOperatorRef.current = null;
    }
    setPinValue('');
    pinValueRef.current = '';
    setPinError(null);
  }, [availableOperators.length]);

  // 6. Teclado Físico
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (showQRModal || isVerifyingPinRef.current) return;

      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        let targetOp = selectedOperatorRef.current;
        const currentAvailable = availableOperatorsRef.current;

        if (!targetOp && currentAvailable.length === 1) {
          targetOp = currentAvailable[0];
          setSelectedOperator(targetOp);
          selectedOperatorRef.current = targetOp;
        }

        if (targetOp) {
          const currentPin = pinValueRef.current;
          if (currentPin.length < 4) {
            const nextPin = currentPin + e.key;
            setPinValue(nextPin);
            pinValueRef.current = nextPin;
            setPinError(null);
            if (nextPin.length === 4) {
              verifyPinAndUnlock(targetOp.id, nextPin);
            }
          }
        }
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handlePinBackspace();
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        if (selectedOperatorRef.current && availableOperatorsRef.current.length > 1) {
          setSelectedOperator(null);
          selectedOperatorRef.current = null;
          setPinValue('');
          pinValueRef.current = '';
          setPinError(null);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLocked, showQRModal, handlePinBackspace, verifyPinAndUnlock]);

  const resolvedTid = getResolvedTenantId();
  const cleanToken = qrToken?.includes('t=')
    ? (new URL(qrToken.startsWith('http') ? qrToken : `http://dummy.com/?${qrToken}`).searchParams.get('t') || qrToken)
    : qrToken;

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/fichar?t=${encodeURIComponent(cleanToken || '')}&tenant=${encodeURIComponent(resolvedTid || '')}`
    : `https://probookia.com/fichar?t=${encodeURIComponent(cleanToken || '')}&tenant=${encodeURIComponent(resolvedTid || '')}`;

  return {
    mounted,
    enableCounterMode,
    enableTimeClock,
    isDarkMode,
    isLocked,
    autolockMinutes,
    clinicName,
    logoUrl,
    showQRModal,
    setShowQRModal,
    qrToken,
    qrUrl,
    qrSecondsLeft,
    isFetchingToken,
    operators,
    availableOperators,
    isLoadingOperators,
    selectedOperator,
    setSelectedOperator,
    pinValue,
    pinError,
    isVerifyingPin,
    handlePinInput,
    handlePinBackspace,
    handleResetOperator,
    unlockCounter,
    handleLogout,
    showcaseServices
  };
}
