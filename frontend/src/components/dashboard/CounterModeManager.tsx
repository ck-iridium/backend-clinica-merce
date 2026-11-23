"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Lock, 
  Unlock, 
  QrCode, 
  RefreshCw, 
  ShieldCheck, 
  Smartphone, 
  Clock, 
  User, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  Sparkles,
  LogOut
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { getCounterOperatorsAction } from '@/app/actions/team';

interface Operator {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  auth_mode?: string;
  bound_device_id?: string | null;
  has_pin?: boolean;
}

interface CounterModeManagerProps {
  tenantId?: string;
  clinicName?: string;
  logoUrl?: string | null;
  initialEnableCounterMode?: boolean;
  initialEnableTimeClock?: boolean;
}

export default function CounterModeManager({ 
  tenantId: initialTenantId, 
  clinicName = "Clínica", 
  logoUrl,
  initialEnableCounterMode = false,
  initialEnableTimeClock = true
}: CounterModeManagerProps) {
  const [tenantId, setTenantId] = useState<string>(initialTenantId || '');
  const [enableCounterMode, setEnableCounterMode] = useState<boolean>(initialEnableCounterMode);
  const [enableTimeClock, setEnableTimeClock] = useState<boolean>(initialEnableTimeClock);
  const [autolockMinutes, setAutolockMinutes] = useState<number>(10);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [showQRModal, setShowQRModal] = useState<boolean>(false);

  // Estados de Operadoras
  const [operators, setOperators] = useState<Operator[]>([]);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);
  const [pinValue, setPinValue] = useState<string>('');
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);
  const [pinError, setPinError] = useState<string | null>(null);

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

  // Filtrar estrictamente operadoras que cuentan con PIN configurado
  const availableOperators = React.useMemo(() => {
    return operators.filter(op => Boolean(op.has_pin));
  }, [operators]);

  useEffect(() => { pinValueRef.current = pinValue; }, [pinValue]);
  useEffect(() => { selectedOperatorRef.current = selectedOperator; }, [selectedOperator]);
  useEffect(() => { isLockedRef.current = isLocked; }, [isLocked]);
  useEffect(() => { isVerifyingPinRef.current = isVerifyingPin; }, [isVerifyingPin]);
  useEffect(() => { availableOperatorsRef.current = availableOperators; }, [availableOperators]);

  useEffect(() => {
    if (initialTenantId && initialTenantId !== tenantId) {
      setTenantId(initialTenantId);
    }
  }, [initialTenantId, tenantId]);

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

  // Cargar operadoras frescas del backend (vía Server Action directo a Supabase con fallback a API)
  const fetchOperators = useCallback(async () => {
    try {
      const actionRes = await getCounterOperatorsAction();
      if (actionRes.success && Array.isArray(actionRes.data) && actionRes.data.length > 0) {
        setOperators(actionRes.data);
        return actionRes.data as Operator[];
      }
    } catch (e) {
      console.warn("Fallo Server Action getCounterOperatorsAction, probando fallback API:", e);
    }

    const tid = getResolvedTenantId();
    if (!tid) return [] as Operator[];
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
          if (data.length === 0) {
            setIsLocked(false);
            sessionStorage.removeItem('counter_is_locked');
          }
          return data as Operator[];
        }
      }
    } catch (err) {
      console.warn("No se pudieron cargar operadoras:", err);
    }
    return [] as Operator[];
  }, [getResolvedTenantId]);

  // Sincronizar tenantId y escuchar eventos globales
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const resolved = getResolvedTenantId();
    if (resolved && !tenantId) setTenantId(resolved);

    // Cargar ajustes de la clínica para saber si Modo Mostrador está activo
    if (resolved) {
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
    }

    const handleOpenQR = () => setShowQRModal(true);
    const handleLock = async () => {
      if (!enableCounterMode) {
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
  }, [tenantId, getResolvedTenantId, fetchOperators, enableCounterMode]);

  // 3. Sistema de Auto-bloqueo por Inactividad
  const resetAutolockTimer = useCallback(() => {
    if (autolockTimerRef.current) clearTimeout(autolockTimerRef.current);
    if (!enableCounterMode) return; // Si está desactivado en ajustes, no bloquear
    if (isLocked) return;
    if (autolockMinutes <= 0) return; // 0 = desactivado
    if (operators.length === 0) return; // Si no hay operadoras con PIN, no bloquear

    const timeoutMs = autolockMinutes * 60 * 1000;
    autolockTimerRef.current = setTimeout(() => {
      lockCounter("Inactividad prolongada en el mostrador");
    }, timeoutMs);
  }, [enableCounterMode, isLocked, autolockMinutes, operators.length]);

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

  const lockCounter = (reason?: string, opsList?: Operator[]) => {
    if (!enableCounterMode) {
      toast.info("El Modo Mostrador está desactivado en Ajustes > Agenda.");
      return;
    }
    const list = opsList || operators;
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
  };

  const unlockCounter = () => {
    setIsLocked(false);
    setSelectedOperator(null);
    selectedOperatorRef.current = null;
    setPinValue('');
    pinValueRef.current = '';
    setPinError(null);
    sessionStorage.removeItem('counter_is_locked');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('counter_is_locked');
    localStorage.removeItem('counter_active_operator');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

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
        // Extrae el token TOTP puro de 6 dígitos
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

  // Al abrir el modal o cada 20s
  useEffect(() => {
    if (!showQRModal && !isLocked) {
      if (qrIntervalRef.current) clearInterval(qrIntervalRef.current);
      if (qrCountdownRef.current) clearInterval(qrCountdownRef.current);
      return;
    }

    fetchQRToken();

    // Cuenta atrás cada 1 segundo
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
  }, [showQRModal, isLocked, fetchQRToken]);

  // 5. Manejo del PIN para desbloquear
  const handlePinInput = (digit: string) => {
    if (pinValue.length < 4) {
      const nextPin = pinValue + digit;
      setPinValue(nextPin);
      setPinError(null);

      // Si completa 4 dígitos, verificar inmediatamente
      if (nextPin.length === 4 && selectedOperator) {
        verifyPinAndUnlock(selectedOperator.id, nextPin);
      }
    }
  };

  const verifyPinAndUnlock = async (staffId: string, pin: string) => {
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

      // El backend devuelve { success: true, operator: { id, full_name, role, ... } }
      const activeOperator = data.operator || data;

      // Guardar operadora activa en sesión
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
  };

  // 6. Soporte de Teclado Físico y Numpad para Desbloqueo por PIN
  useEffect(() => {
    if (!isLocked) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el modal de QR está abierto o si se está verificando el PIN
      if (showQRModal || isVerifyingPinRef.current) return;

      // Teclas numéricas 0 a 9 (tanto teclado alfanumérico superior como Numpad lateral)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        let targetOp = selectedOperatorRef.current;
        const currentAvailable = availableOperatorsRef.current;

        // Si solo hay 1 operadora con PIN, auto-seleccionarla al pulsar el primer número
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

      // Borrar dígito con Backspace
      if (e.key === 'Backspace') {
        e.preventDefault();
        setPinValue(prev => {
          const next = prev.slice(0, -1);
          pinValueRef.current = next;
          return next;
        });
        setPinError(null);
        return;
      }

      // Volver a la lista de operadoras con Escape si hay más de una
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
  }, [isLocked, showQRModal]);

  const resolvedTid = getResolvedTenantId();
  const cleanToken = qrToken?.includes('t=')
    ? (new URL(qrToken.startsWith('http') ? qrToken : `http://dummy.com/?${qrToken}`).searchParams.get('t') || qrToken)
    : qrToken;

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/fichar?t=${encodeURIComponent(cleanToken || '')}&tenant=${encodeURIComponent(resolvedTid || '')}`
    : `https://probookia.com/fichar?t=${encodeURIComponent(cleanToken || '')}&tenant=${encodeURIComponent(resolvedTid || '')}`;

  // Si Modo Mostrador está desactivado en ajustes y no está bloqueado ni abierto el QR, no renderizar nada
  if (!enableCounterMode && !isLocked && !showQRModal) return null;

  return (
    <>
      {/* MODAL 1: CÓDIGO QR DINÁMICO DE 20 SEGUNDOS */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-sm rounded-[2rem] p-6 sm:p-7 bg-white border-stone-100 shadow-2xl text-center">
          <DialogHeader className="items-center space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B00] text-[11px] font-bold shadow-2xs">
              <Clock size={12} />
              <span>Código Dinámico Anti-Fraude</span>
            </div>
            <DialogTitle className="font-serif text-xl sm:text-2xl font-bold text-stone-900 pt-1">
              Fichar con tu Móvil
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 max-w-[260px] mx-auto mt-1 leading-relaxed">
              Abre la cámara de tu teléfono móvil y enfoca este código QR para registrar tu turno.
            </DialogDescription>
          </DialogHeader>

          {/* Contenedor del Código QR con espaciado generoso */}
          <div className="my-4 p-4 bg-stone-50/80 rounded-2xl border border-stone-200/70 shadow-2xs flex flex-col items-center justify-center mx-auto w-fit">
            {qrToken ? (
              <div className="p-2.5 bg-white rounded-xl shadow-xs border border-stone-200/60">
                <QRCodeSVG
                  value={qrUrl}
                  size={175}
                  level="M"
                  includeMargin={false}
                />
              </div>
            ) : (
              <div className="w-[175px] h-[175px] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
              </div>
            )}

            {/* Barra de progreso de rotación de 20s */}
            <div className="w-full mt-3.5 space-y-1.5 px-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500">
                <span className="flex items-center gap-1">
                  <RefreshCw size={11} className={`text-[#FF6B00] ${isFetchingToken ? 'animate-spin' : ''}`} />
                  Se renueva en:
                </span>
                <span className="font-mono text-[#FF6B00] font-black">{qrSecondsLeft}s</span>
              </div>
              <div className="w-full h-1.5 bg-stone-200/70 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-[#FF6B00] transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(qrSecondsLeft / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-stone-50/70 rounded-xl border border-stone-200/60 text-[11px] text-stone-500 flex items-start gap-2.5 text-left">
            <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong>Vinculación de terminal</strong>: Ficha exclusivamente desde tu teléfono vinculado para garantizar presencia física en el centro.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* PANTALLA COMPLETA 2: PROTECTOR DE PANTALLA / MODO MOSTRADOR BLOQUEADO */}
      {isLocked && (
        <div className="fixed inset-0 z-[150] bg-stone-950/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 text-white animate-in fade-in duration-300">
          {/* Header Superior */}
          <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[#FF6B00] shadow-sm">
                <Lock size={20} />
              </div>
              <div>
                <h2 className="font-serif font-bold text-lg sm:text-xl text-white tracking-tight">
                  {clinicName}
                </h2>
                <p className="text-[11px] text-stone-400 font-medium">Modo Mostrador Protegido</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Acceso a QR de fichaje directamente desde la pantalla bloqueada */}
              {enableTimeClock && (
                <button
                  type="button"
                  onClick={() => setShowQRModal(true)}
                  className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs border border-white/15 transition-all shadow-sm cursor-pointer"
                >
                  <QrCode size={15} className="text-[#FF6B00]" />
                  <span>Fichar con Móvil</span>
                </button>
              )}

              {/* Botón de Cerrar Sesión seguro */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 active:scale-95 text-stone-300 hover:text-rose-200 font-bold text-xs border border-white/10 transition-all shadow-sm cursor-pointer"
                title="Cerrar la sesión de la clínica en este ordenador"
              >
                <LogOut size={15} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>

          {/* Centro: Selección de Empleada y Numpad */}
          <div className="max-w-md w-full mx-auto my-auto space-y-6">
            {availableOperators.length === 0 ? (
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 text-center space-y-4 max-w-md mx-auto animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-[#FF6B00] flex items-center justify-center mx-auto">
                  <AlertCircle size={24} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-serif text-xl font-bold text-white">
                    Sin Operadoras con PIN
                  </h3>
                  <p className="text-xs text-stone-400 leading-relaxed">
                    Aún no se ha registrado ninguna operadora con PIN en este centro. Para utilizar el modo mostrador bloqueado, crea primero a tus empleadas o configúrate un PIN desde el panel de Equipo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={unlockCounter}
                  className="w-full py-3 px-5 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Continuar al Panel Principal
                </button>
              </div>
            ) : !selectedOperator ? (
              /* Selección de Operadora para Desbloquear (Solo operadoras con PIN) */
              <div className="space-y-4 text-center">
                <div>
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-white">
                    ¿Quién va a usar el mostrador?
                  </h3>
                  <p className="text-xs text-stone-400 mt-1">
                    Toca tu nombre e introduce tu PIN de 4 dígitos para acceder.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 max-h-[50vh] overflow-y-auto pr-1">
                  {availableOperators.map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setSelectedOperator(op);
                        selectedOperatorRef.current = op;
                        setPinValue('');
                        pinValueRef.current = '';
                        setPinError(null);
                      }}
                      className="p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 flex flex-col items-center gap-2.5 text-center transition-all group active:scale-95 cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-stone-800 to-stone-700 group-hover:from-orange-600 group-hover:to-orange-500 border border-white/10 flex items-center justify-center text-lg font-bold text-white shadow-md transition-all overflow-hidden">
                        {op.avatar_url ? (
                          <img src={op.avatar_url} alt={op.full_name || "Operadora"} className="w-full h-full object-cover" />
                        ) : (
                          op.full_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="w-full truncate">
                        <p className="text-xs font-bold text-white truncate">{op.full_name}</p>
                        <p className="text-[10px] text-stone-400 truncate capitalize">{op.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Numpad de Desbloqueo por PIN */
              <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-xl font-bold shadow-lg overflow-hidden">
                    {selectedOperator.avatar_url ? (
                      <img src={selectedOperator.avatar_url} alt={selectedOperator.full_name || "Operadora"} className="w-full h-full object-cover" />
                    ) : (
                      selectedOperator.full_name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      Hola, {selectedOperator.full_name}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Introduce tu PIN de 4 dígitos o usa tu teclado físico
                    </p>
                  </div>
                </div>

                {/* Dots del PIN */}
                <div className="flex items-center justify-center gap-3 py-1">
                  {[0, 1, 2, 3].map(index => {
                    const hasChar = pinValue.length > index;
                    return (
                      <div
                        key={index}
                        className={`w-11 h-12 rounded-xl flex items-center justify-center text-2xl font-bold font-mono transition-all border ${
                          hasChar 
                            ? 'border-[#FF6B00] bg-orange-500/20 text-[#FF6B00] scale-105 shadow-[0_0_15px_rgba(255,107,0,0.3)]' 
                            : 'border-white/20 bg-white/5 text-stone-600'
                        }`}
                      >
                        {hasChar ? '•' : ''}
                      </div>
                    );
                  })}
                </div>

                {pinError && (
                  <p className="text-xs text-rose-400 font-bold animate-in shake duration-300">
                    {pinError}
                  </p>
                )}

                {/* Teclado numérico táctil */}
                <div className="grid grid-cols-3 gap-2.5 max-w-[280px] mx-auto pt-2">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                    <button
                      key={num}
                      type="button"
                      disabled={isVerifyingPin}
                      onClick={() => handlePinInput(num)}
                      className="h-13 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-orange-500/30 font-mono font-bold text-xl text-white transition-all active:scale-95 flex items-center justify-center border border-white/5"
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      if (availableOperators.length > 1) {
                        setSelectedOperator(null);
                        selectedOperatorRef.current = null;
                      }
                      setPinValue('');
                      pinValueRef.current = '';
                      setPinError(null);
                    }}
                    className="h-13 rounded-2xl bg-white/5 hover:bg-white/10 text-[11px] font-bold uppercase tracking-wider text-stone-400 transition-all active:scale-95 flex items-center justify-center border border-white/5"
                  >
                    {availableOperators.length > 1 ? 'Cambiar' : 'Limpiar'}
                  </button>
                  <button
                    type="button"
                    disabled={isVerifyingPin}
                    onClick={() => handlePinInput('0')}
                    className="h-13 rounded-2xl bg-white/10 hover:bg-white/20 active:bg-orange-500/30 font-mono font-bold text-xl text-white transition-all active:scale-95 flex items-center justify-center border border-white/5"
                  >
                    0
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setPinValue(prev => {
                        const next = prev.slice(0, -1);
                        pinValueRef.current = next;
                        return next;
                      });
                    }}
                    disabled={isVerifyingPin || pinValue.length === 0}
                    className="h-13 rounded-2xl bg-white/5 hover:bg-white/10 text-stone-300 transition-all active:scale-95 flex items-center justify-center border border-white/5 disabled:opacity-30"
                  >
                    ⌫
                  </button>
                </div>

                {isVerifyingPin && (
                  <div className="flex items-center justify-center gap-2 pt-2 text-xs text-stone-400">
                    <Loader2 size={14} className="animate-spin text-[#FF6B00]" />
                    <span>Verificando PIN de seguridad...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer del Lock */}
          <div className="max-w-4xl w-full mx-auto text-center text-xs text-stone-500">
            Auto-bloqueo configurado a {autolockMinutes > 0 ? `${autolockMinutes} minutos de inactividad` : 'desactivado'}.
          </div>
        </div>
      )}
    </>
  );
}
