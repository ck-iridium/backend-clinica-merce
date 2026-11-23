"use client";

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  LogOut, 
  Play, 
  Smartphone, 
  ShieldCheck, 
  User, 
  Loader2, 
  RefreshCw,
  Sparkles,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { getCounterOperatorsAction } from '@/app/actions/team';

interface Operator {
  id: string;
  tenant_id?: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
  auth_mode?: string;
  bound_device_id?: string | null;
  has_bound_device?: boolean;
  has_pin?: boolean;
}

interface StaffStatus {
  current_status: 'idle' | 'working' | 'break' | 'in_shift' | 'on_break' | 'out';
  last_event_time?: string;
  today_total_minutes?: number;
  total_minutes_today?: number;
}

function FicharContent() {
  const searchParams = useSearchParams();
  const qrToken = searchParams.get('t') || '';
  const tenantParam = searchParams.get('tenant') || '';

  const [tenantId, setTenantId] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceLabel, setDeviceLabel] = useState<string>('');

  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoadingOperators, setIsLoadingOperators] = useState<boolean>(true);
  const [selectedStaff, setSelectedStaff] = useState<Operator | null>(null);
  const [pin, setPin] = useState<string>('');
  const [statusLoading, setStatusLoading] = useState<boolean>(false);
  const [staffStatus, setStaffStatus] = useState<StaffStatus | null>(null);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [lastActionResult, setLastActionResult] = useState<{
    success: boolean;
    eventType: string;
    message: string;
    timestamp: string;
  } | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Obtener o inicializar ID persistente del dispositivo móvil en localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let storedDevId = localStorage.getItem('timeclock_bound_device_id');
    if (!storedDevId) {
      storedDevId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('timeclock_bound_device_id', storedDevId);
    }
    setDeviceId(storedDevId);

    // Detección amigable del modelo / navegador
    const ua = navigator.userAgent;
    let label = 'Navegador Web';
    if (/iPhone|iPad|iPod/.test(ua)) {
      label = 'iPhone / iOS';
    } else if (/Android/.test(ua)) {
      label = 'Móvil Android';
    } else if (/Mac/.test(ua)) {
      label = 'MacBook';
    } else if (/Windows/.test(ua)) {
      label = 'PC Windows';
    }
    setDeviceLabel(label);

    // Resolución ultra-resiliente del tenantId:
    // A. Query Param 'tenant'
    let resolved = tenantParam;
    // B. Cookie 'tenant_id'
    if (!resolved) {
      const match = document.cookie.match(/(?:^|; )tenant_id=([^;]*)/);
      if (match && match[1]) resolved = match[1];
    }
    // C. Subdominio en el hostname (ej: ultimetest.probookia.com -> ultimetest)
    if (!resolved) {
      const host = window.location.hostname.toLowerCase();
      if (host.endsWith('.probookia.com') && host !== 'probookia.com' && host !== 'www.probookia.com') {
        resolved = host.replace('.probookia.com', '');
      } else if (host.endsWith('.localhost')) {
        resolved = host.replace('.localhost', '');
      }
    }
    setTenantId(resolved);
  }, [tenantParam]);

  // 2. Cargar operadoras del salón (usando Server Action a Supabase con fallback a API)
  const loadOperators = useCallback(async (tId: string) => {
    if (!tId) return;
    setIsLoadingOperators(true);
    try {
      // 1. Intento rápido vía Server Action
      const actionRes = await getCounterOperatorsAction(tId);
      if (actionRes.success && Array.isArray(actionRes.data) && actionRes.data.length > 0) {
        setOperators(actionRes.data);
        autoSelectStaff(actionRes.data);
        setIsLoadingOperators(false);
        return;
      }

      // 2. Fallback vía API REST de FastAPI
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/time-clock/operators?tenant_id=${tId}`, {
        headers: { 'X-Tenant-ID': tId }
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOperators(data);
          autoSelectStaff(data);
        }
      }
    } catch (err) {
      console.warn("Fallo cargando operadoras:", err);
    } finally {
      setIsLoadingOperators(false);
    }
  }, []);

  const autoSelectStaff = (list: Operator[]) => {
    if (!list || list.length === 0) return;

    // Si solo hay una empleada en total o solo una con PIN, auto-seleccionarla inmediatamente
    const withPin = list.filter(op => op.has_pin !== false);
    if (withPin.length === 1) {
      setSelectedStaff(withPin[0]);
      return;
    }
    if (list.length === 1) {
      setSelectedStaff(list[0]);
      return;
    }

    // Si había una seleccionada previamente en este móvil:
    const savedStaffId = typeof window !== 'undefined' ? localStorage.getItem('timeclock_last_staff_id') : null;
    if (savedStaffId) {
      const matched = list.find(op => op.id === savedStaffId);
      if (matched) {
        setSelectedStaff(matched);
        return;
      }
    }

    // Por defecto, pre-seleccionar la primera operadora para que el usuario no tenga los botones bloqueados
    if (withPin.length > 0) {
      setSelectedStaff(withPin[0]);
    } else {
      setSelectedStaff(list[0]);
    }
  };

  useEffect(() => {
    if (tenantId) {
      loadOperators(tenantId);
    }
  }, [tenantId, loadOperators]);

  // 3. Cuando se selecciona una empleada, consultar su estado de turno hoy
  useEffect(() => {
    if (!selectedStaff || !tenantId) {
      setStaffStatus(null);
      return;
    }

    setStatusLoading(true);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/time-clock/status/${selectedStaff.id}?tenant_id=${tenantId}`, {
      headers: { 'X-Tenant-ID': tenantId }
    })
      .then(res => res.json())
      .then(data => {
        setStaffStatus(data);
      })
      .catch(err => {
        console.warn("Error consultando estado de fichaje:", err);
      })
      .finally(() => {
        setStatusLoading(false);
      });
  }, [selectedStaff, tenantId]);

  // 4. Manejo de dígitos del PIN
  const handlePinClick = (digit: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + digit);
    }
  };

  const handlePinBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handlePinClear = () => {
    setPin('');
  };

  // 5. Ejecutar fichaje explícito con validaciones guiadas amigables
  const handleClockAction = async (eventType: 'clock_in' | 'clock_out' | 'break_start' | 'break_end') => {
    if (!selectedStaff) {
      toast.error("Selecciona primero tu nombre arriba.");
      return;
    }
    if (pin.length !== 4) {
      toast.error("Introduce tu PIN de 4 dígitos antes de fichar.");
      return;
    }
    if (!qrToken) {
      toast.error("Código QR caducado o no detectado. Vuelve a enfocar el QR en la pantalla del mostrador.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${apiUrl}/time-clock/clock-event?tenant_id=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          staff_id: selectedStaff.id,
          pin: pin,
          event_type: eventType,
          qr_token: qrToken,
          device_id: deviceId,
          device_label: deviceLabel
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error al procesar el registro de jornada.");
      }

      // Recordar empleada en este móvil
      localStorage.setItem('timeclock_last_staff_id', selectedStaff.id);

      // Feedback háptico en móvil
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }

      const nowFormatted = new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLastActionResult({
        success: true,
        eventType,
        message: data.message || "Fichaje registrado con validez legal.",
        timestamp: nowFormatted
      });

      toast.success(data.message || "Registro completado con éxito.");
      setPin('');

      // Actualizar estado del turno
      if (selectedStaff && tenantId) {
        fetch(`${apiUrl}/time-clock/status/${selectedStaff.id}?tenant_id=${tenantId}`, {
          headers: { 'X-Tenant-ID': tenantId }
        })
          .then(r => r.json())
          .then(st => setStaffStatus(st))
          .catch(() => {});
      }

    } catch (err: any) {
      console.error("Error en fichaje:", err);
      setErrorMessage(err.message || "Error al registrar el fichaje.");
      toast.error(err.message || "Error al registrar el fichaje.");
      setPin('');
    } finally {
      setSubmitting(false);
    }
  };

  const getEventLabel = (type: string) => {
    switch (type) {
      case 'clock_in': return 'Entrada al Turno';
      case 'break_start': return 'Inicio de Pausa';
      case 'break_end': return 'Reanudación de Turno';
      case 'clock_out': return 'Salida de Jornada';
      default: return 'Registro de Fichaje';
    }
  };

  const isFormComplete = Boolean(selectedStaff && pin.length === 4 && qrToken);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden bg-[#FAF9F6] text-stone-900 flex flex-col justify-between p-3 sm:p-4 select-none">
      {/* ── HEADER COMPACTO ────────────────────────────────────────── */}
      <header className="w-full text-center space-y-0.5 shrink-0 pt-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B00] text-[10px] font-bold tracking-wide shadow-2xs">
          <Clock size={11} className="text-[#FF6B00]" />
          <span>Control Horario Laboral</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 leading-tight">
          Fichaje Mostrador
        </h1>
        <p className="text-[10px] sm:text-xs text-stone-400 font-medium">
          Registro presencial seguro con validación de terminal móvil
        </p>
      </header>

      {/* ── CONTENIDO PRINCIPAL ────────────────────────────────────── */}
      <main className="w-full max-w-sm mx-auto flex-1 flex flex-col justify-center py-2 space-y-2.5 overflow-hidden">
        {/* Alerta de QR no presente o caducado */}
        {!qrToken && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-center gap-2 shadow-xs shrink-0">
            <AlertCircle size={15} className="text-amber-600 shrink-0" />
            <p className="leading-tight">
              <strong>QR no detectado o expirado.</strong> Enfoca el código dinámico en la pantalla del salón.
            </p>
          </div>
        )}

        {/* Pantalla de Éxito Inmediato */}
        {lastActionResult ? (
          <div className="p-5 rounded-2xl bg-white border border-emerald-200 shadow-xl text-center space-y-3 animate-in zoom-in-95 duration-300 my-auto">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
              <CheckCircle2 size={28} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">
                {getEventLabel(lastActionResult.eventType)}
              </span>
              <h2 className="text-lg font-serif font-bold text-stone-900 mt-0.5">
                ¡Fichaje Confirmado!
              </h2>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {lastActionResult.message}
              </p>
              <p className="text-[11px] font-mono font-bold text-stone-400 mt-1.5">
                Hora oficial: {lastActionResult.timestamp}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLastActionResult(null)}
              className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all"
            >
              Registrar otro movimiento
            </button>
          </div>
        ) : (
          /* Tarjeta de Fichaje Compacta */
          <div className="bg-white rounded-2xl border border-stone-200/80 shadow-md p-3 sm:p-4 flex flex-col justify-between space-y-2.5">
            {/* Alerta de error si ocurrió */}
            {errorMessage && (
              <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-[11px] flex items-center gap-2 shadow-xs">
                <AlertCircle size={14} className="text-rose-600 shrink-0" />
                <p className="leading-tight flex-1">{errorMessage}</p>
              </div>
            )}

            {/* 1. SELECCIÓN DE EMPLEADA / OPERADORA */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-stone-400">
                <span>1. Tu Nombre</span>
                {selectedStaff && (
                  <span className="text-stone-500 font-semibold normal-case">
                    {staffStatus?.current_status === 'working' || staffStatus?.current_status === 'in_shift'
                      ? '● En turno'
                      : staffStatus?.current_status === 'break' || staffStatus?.current_status === 'on_break'
                        ? '● En pausa'
                        : '○ Fuera de turno'}
                  </span>
                )}
              </div>

              {isLoadingOperators ? (
                <div className="h-11 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center gap-2 text-xs text-stone-400">
                  <Loader2 size={13} className="animate-spin text-[#FF6B00]" />
                  <span>Cargando personal...</span>
                </div>
              ) : operators.length === 0 ? (
                <div className="h-11 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-between px-3 text-xs text-stone-500">
                  <span>Sin personal asignado</span>
                  <button 
                    type="button" 
                    onClick={() => tenantId && loadOperators(tenantId)}
                    className="text-[#FF6B00] font-bold inline-flex items-center gap-1"
                  >
                    <RefreshCw size={11} /> Recargar
                  </button>
                </div>
              ) : operators.length === 1 ? (
                /* Caso 1 única empleada: card destacada elegante sin ocupar espacio */
                <div className="h-11 rounded-xl border border-[#FF6B00] bg-orange-50/70 px-3 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <div className="w-7 h-7 rounded-full bg-[#FF6B00] text-white flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-2xs">
                      {operators[0].avatar_url ? (
                        <img 
                          src={operators[0].avatar_url} 
                          alt={operators[0].full_name} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        operators[0].full_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-stone-900 truncate leading-tight">
                        {operators[0].full_name}
                      </p>
                      <p className="text-[10px] text-stone-500 capitalize leading-tight">
                        {operators[0].role}
                      </p>
                    </div>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-[#FF6B00] text-white flex items-center justify-center shrink-0">
                    <Check size={12} strokeWidth={3} />
                  </span>
                </div>
              ) : (
                /* Caso múltiples empleadas: carrusel horizontal táctil compacto */
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {operators.map(op => {
                    const isSelected = selectedStaff?.id === op.id;
                    return (
                      <button
                        key={op.id}
                        type="button"
                        onClick={() => {
                          setSelectedStaff(op);
                          setPin('');
                          setErrorMessage(null);
                        }}
                        className={`h-11 px-3 rounded-xl border text-left flex items-center gap-2 shrink-0 transition-all ${
                          isSelected 
                            ? 'border-[#FF6B00] bg-orange-50/80 ring-1 ring-[#FF6B00]/40 text-stone-900 shadow-2xs' 
                            : 'border-stone-200/80 bg-stone-50 hover:bg-stone-100 text-stone-700'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 overflow-hidden ${
                          isSelected ? 'bg-[#FF6B00] text-white' : 'bg-stone-200 text-stone-600'
                        }`}>
                          {op.avatar_url ? (
                            <img src={op.avatar_url} alt={op.full_name} className="w-full h-full object-cover" />
                          ) : (
                            op.full_name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <span className="text-xs font-bold whitespace-nowrap">
                          {op.full_name.split(' ')[0]}
                        </span>
                        {isSelected && <Check size={12} className="text-[#FF6B00] stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. ENTRADA DE PIN DE 4 DÍGITOS */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                  2. PIN de 4 dígitos
                </span>
              </div>

              {/* Indicador visual de los 4 dígitos */}
              <div className="flex items-center justify-center gap-2.5 py-0.5">
                {[0, 1, 2, 3].map(index => {
                  const hasChar = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-9 h-10 sm:w-10 sm:h-11 rounded-xl flex items-center justify-center text-xl font-bold font-mono transition-all border ${
                        hasChar 
                          ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] shadow-2xs scale-105' 
                          : 'border-stone-200 bg-stone-50/80 text-stone-300'
                      }`}
                    >
                      {hasChar ? '•' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Teclado numérico táctil optimizado */}
              <div className="grid grid-cols-3 gap-1.5 max-w-[250px] mx-auto pt-0.5">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinClick(num)}
                    disabled={submitting}
                    className="h-9 sm:h-10 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 font-mono font-bold text-base sm:text-lg text-stone-800 transition-all active:scale-95 flex items-center justify-center shadow-2xs cursor-pointer"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePinClear}
                  disabled={submitting || pin.length === 0}
                  className="h-9 sm:h-10 rounded-xl bg-stone-50 hover:bg-stone-100 text-[10px] font-bold uppercase tracking-wider text-stone-400 transition-all active:scale-95 flex items-center justify-center disabled:opacity-30 cursor-pointer"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={() => handlePinClick('0')}
                  disabled={submitting}
                  className="h-9 sm:h-10 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 font-mono font-bold text-base sm:text-lg text-stone-800 transition-all active:scale-95 flex items-center justify-center shadow-2xs cursor-pointer"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  disabled={submitting || pin.length === 0}
                  className="h-9 sm:h-10 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-600 font-bold transition-all active:scale-95 flex items-center justify-center disabled:opacity-30 cursor-pointer text-sm"
                  title="Eliminar último dígito"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* 3. ACCIONES DE FICHAJE */}
            <div className="space-y-1.5 pt-1.5 border-t border-stone-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block text-center">
                3. Pulsa tu acción a registrar
              </span>

              <div className="grid grid-cols-2 gap-2">
                {/* Botón Entrada */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleClockAction('clock_in')}
                  className={`py-2 px-3 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                    isFormComplete ? 'opacity-100 ring-2 ring-emerald-500/20' : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  <Play size={14} fill="currentColor" />
                  <span>Fichar Entrada</span>
                </button>

                {/* Botón Salida */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleClockAction('clock_out')}
                  className={`py-2 px-3 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                    isFormComplete ? 'opacity-100 ring-2 ring-rose-500/20' : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  <LogOut size={14} />
                  <span>Fichar Salida</span>
                </button>

                {/* Botón Iniciar Pausa */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleClockAction('break_start')}
                  className={`py-2 px-3 sm:py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                    isFormComplete ? 'opacity-100 ring-2 ring-amber-400/20' : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  <Coffee size={14} />
                  <span>Iniciar Pausa</span>
                </button>

                {/* Botón Reanudar Turno */}
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => handleClockAction('break_end')}
                  className={`py-2 px-3 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer ${
                    isFormComplete ? 'opacity-100 ring-2 ring-blue-500/20' : 'opacity-70 hover:opacity-90'
                  }`}
                >
                  <Sparkles size={14} />
                  <span>Reanudar Turno</span>
                </button>
              </div>

              {submitting && (
                <div className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-stone-500 font-medium">
                  <Loader2 size={13} className="animate-spin text-[#FF6B00]" />
                  <span>Firmando registro laboral digital...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── FOOTER LEGAL COMPACTO ──────────────────────────────────── */}
      <footer className="w-full text-center space-y-0.5 shrink-0 pb-1 text-[10px] text-stone-400">
        <div className="inline-flex items-center gap-1 font-medium">
          <ShieldCheck size={12} className="text-emerald-600" />
          <span>Firma digital conforme al Real Decreto-ley 8/2019 de control horario</span>
        </div>
        <p className="text-[9px] text-stone-400">
          Terminal: <span className="font-mono">{deviceId ? deviceId.slice(0, 8) + '...' : 'detectando...'}</span> ({deviceLabel})
        </p>
      </footer>
    </div>
  );
}

export default function FicharPage() {
  return (
    <Suspense fallback={
      <div className="h-[100dvh] flex items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
          <p className="text-xs font-semibold text-stone-500">Cargando control horario...</p>
        </div>
      </div>
    }>
      <FicharContent />
    </Suspense>
  );
}
