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
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface Operator {
  id: string;
  full_name: string;
  role: string;
  auth_mode?: string;
  bound_device_id?: string | null;
}

interface CounterModeManagerProps {
  tenantId?: string;
  clinicName?: string;
  logoUrl?: string | null;
}

export default function CounterModeManager({ tenantId: initialTenantId, clinicName = "Clínica", logoUrl }: CounterModeManagerProps) {
  const [tenantId, setTenantId] = useState<string>(initialTenantId || '');
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

  // Refs de temporizadores
  const autolockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const qrIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const qrCountdownRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Obtener tenantId de cookie si no viene en props
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (!tenantId) {
      const match = document.cookie.match(/(?:^|; )tenant_id=([^;]*)/);
      if (match) setTenantId(match[1]);
    }

    // Verificar si estaba bloqueado en sessionStorage
    const wasLocked = sessionStorage.getItem('counter_is_locked');
    if (wasLocked === 'true') {
      setIsLocked(true);
    }

    const handleOpenQR = () => setShowQRModal(true);
    const handleLock = () => lockCounter("Bloqueo manual");

    window.addEventListener('open_counter_qr', handleOpenQR);
    window.addEventListener('lock_counter', handleLock);

    return () => {
      window.removeEventListener('open_counter_qr', handleOpenQR);
      window.removeEventListener('lock_counter', handleLock);
    };
  }, [tenantId]);

  // 2. Cargar ajustes de auto-bloqueo y lista de operadoras
  useEffect(() => {
    if (!tenantId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    // Obtener ajustes de la clínica para saber minutos de auto-bloqueo
    fetch(`${apiUrl}/settings/?tenant_id=${tenantId}`, {
      headers: { 'X-Tenant-ID': tenantId }
    })
      .then(res => res.json())
      .then(settings => {
        if (settings && typeof settings.counter_autolock_minutes !== 'undefined') {
          setAutolockMinutes(Number(settings.counter_autolock_minutes) ?? 10);
        }
      })
      .catch(err => console.warn("No se pudo cargar ajuste de auto-bloqueo:", err));

    // Cargar operadoras
    fetch(`${apiUrl}/time-clock/operators?tenant_id=${tenantId}`, {
      headers: { 'X-Tenant-ID': tenantId }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setOperators(data);
      })
      .catch(err => console.warn("No se pudieron cargar operadoras:", err));
  }, [tenantId]);

  // 3. Sistema de Auto-bloqueo por Inactividad
  const resetAutolockTimer = useCallback(() => {
    if (autolockTimerRef.current) clearTimeout(autolockTimerRef.current);
    if (isLocked) return;
    if (autolockMinutes <= 0) return; // 0 significa desactivado

    const timeoutMs = autolockMinutes * 60 * 1000;
    autolockTimerRef.current = setTimeout(() => {
      lockCounter("Inactividad prolongada en el mostrador");
    }, timeoutMs);
  }, [isLocked, autolockMinutes]);

  useEffect(() => {
    if (isLocked || autolockMinutes <= 0) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const handleActivity = () => resetAutolockTimer();

    events.forEach(ev => window.addEventListener(ev, handleActivity, { passive: true }));
    resetAutolockTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, handleActivity));
      if (autolockTimerRef.current) clearTimeout(autolockTimerRef.current);
    };
  }, [isLocked, autolockMinutes, resetAutolockTimer]);

  const lockCounter = (reason?: string) => {
    setIsLocked(true);
    setSelectedOperator(null);
    setPinValue('');
    setPinError(null);
    sessionStorage.setItem('counter_is_locked', 'true');
    if (reason) {
      toast.info(`Mostrador bloqueado por seguridad (${reason}).`);
    }
  };

  const unlockCounter = () => {
    setIsLocked(false);
    setSelectedOperator(null);
    setPinValue('');
    setPinError(null);
    sessionStorage.removeItem('counter_is_locked');
  };

  // 4. Obtención y rotación del Token QR cada 20 segundos
  const fetchQRToken = useCallback(async () => {
    if (!tenantId) return;
    setIsFetchingToken(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/time-clock/qr-token?tenant_id=${tenantId}`, {
        headers: { 'X-Tenant-ID': tenantId }
      });
      if (res.ok) {
        const data = await res.json();
        setQrToken(data.qr_token);
        setQrSecondsLeft(data.expires_in_seconds || 20);
      }
    } catch (err) {
      console.warn("Error al renovar token QR:", err);
    } finally {
      setIsFetchingToken(false);
    }
  }, [tenantId]);

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

      // Guardar operadora activa en sesión
      localStorage.setItem('counter_active_operator', JSON.stringify(data));
      window.dispatchEvent(new CustomEvent('counter_operator_changed', { detail: data }));

      toast.success(`Mostrador activo: ${data.full_name}`);
      unlockCounter();
    } catch (err: any) {
      setPinError(err.message || "PIN incorrecto.");
      setPinValue('');
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const qrUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/fichar?t=${qrToken}&tenant=${tenantId}`
    : `https://probookia.com/fichar?t=${qrToken}&tenant=${tenantId}`;

  return (
    <>
      {/* MODAL 1: CÓDIGO QR DINÁMICO DE 20 SEGUNDOS */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-[420px] rounded-[2.5rem] p-6 bg-white border-stone-100 shadow-2xl text-center space-y-4">
          <DialogHeader className="items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B00] text-xs font-bold mb-1 shadow-2xs">
              <Clock size={12} />
              <span>Código Dinámico Anti-Fraude</span>
            </div>
            <DialogTitle className="font-serif text-2xl font-bold text-stone-900">
              Fichar con tu Móvil
            </DialogTitle>
            <DialogDescription className="text-xs text-stone-500 max-w-xs mx-auto">
              Abre la cámara de tu teléfono móvil y enfoca este código QR para registrar tu entrada, pausa o salida.
            </DialogDescription>
          </DialogHeader>

          {/* Contenedor del Código QR */}
          <div className="relative p-6 bg-white rounded-3xl border-2 border-stone-100 shadow-inner flex flex-col items-center justify-center mx-auto w-fit">
            {qrToken ? (
              <div className="p-2 bg-white rounded-2xl shadow-sm border border-stone-200/50">
                <QRCodeSVG
                  value={qrUrl}
                  size={200}
                  level="M"
                  includeMargin={true}
                />
              </div>
            ) : (
              <div className="w-[200px] h-[200px] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
              </div>
            )}

            {/* Barra de progreso de rotación de 20s */}
            <div className="w-full mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 px-1">
                <span className="flex items-center gap-1">
                  <RefreshCw size={11} className={`text-[#FF6B00] ${isFetchingToken ? 'animate-spin' : ''}`} />
                  Se renueva en:
                </span>
                <span className="font-mono text-[#FF6B00] font-black">{qrSecondsLeft}s</span>
              </div>
              <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-orange-400 to-[#FF6B00] transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(qrSecondsLeft / 20) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/60 text-[11px] text-stone-500 flex items-start gap-2.5 text-left">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Vinculación de terminal</strong>: Cada empleada ficha exclusivamente desde su teléfono vinculado para garantizar presencia física en el centro.
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* PANTALLA COMPLETA 2: PROTECTOR DE PANTALLA / MODO MOSTRADOR BLOQUEADO */}
      {isLocked && (
        <div className="fixed inset-0 z-[99999] bg-stone-950/95 backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 text-white animate-in fade-in duration-300">
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

            {/* Acceso a QR de fichaje directamente desde la pantalla bloqueada */}
            <button
              type="button"
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-2 py-2.5 px-4 rounded-2xl bg-white/10 hover:bg-white/15 active:scale-95 text-white font-bold text-xs border border-white/15 transition-all shadow-sm"
            >
              <QrCode size={15} className="text-[#FF6B00]" />
              <span>Fichar con Móvil</span>
            </button>
          </div>

          {/* Centro: Selección de Empleada y Numpad */}
          <div className="max-w-md w-full mx-auto my-auto space-y-6">
            {!selectedOperator ? (
              /* Selección de Operadora para Desbloquear */
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
                  {operators.map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => {
                        setSelectedOperator(op);
                        setPinValue('');
                        setPinError(null);
                      }}
                      className="p-4 rounded-3xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 flex flex-col items-center gap-2.5 text-center transition-all group active:scale-95 cursor-pointer"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-stone-800 to-stone-700 group-hover:from-orange-600 group-hover:to-orange-500 border border-white/10 flex items-center justify-center text-lg font-bold text-white shadow-md transition-all">
                        {op.full_name.charAt(0)}
                      </div>
                      <div className="w-full truncate">
                        <p className="text-xs font-bold text-white truncate">{op.full_name}</p>
                        <p className="text-[10px] text-stone-400 truncate">{op.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Numpad de Desbloqueo por PIN */
              <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-xl font-bold shadow-lg">
                    {selectedOperator.full_name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
                      Hola, {selectedOperator.full_name}
                    </h3>
                    <p className="text-xs text-stone-400">
                      Introduce tu PIN de 4 dígitos
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
                      setSelectedOperator(null);
                      setPinValue('');
                      setPinError(null);
                    }}
                    className="h-13 rounded-2xl bg-white/5 hover:bg-white/10 text-[11px] font-bold uppercase tracking-wider text-stone-400 transition-all active:scale-95 flex items-center justify-center border border-white/5"
                  >
                    Volver
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
                    onClick={() => setPinValue(prev => prev.slice(0, -1))}
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
