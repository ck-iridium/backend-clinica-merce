"use client"

import React, { Suspense, useState, useEffect } from 'react';
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
  Lock, 
  User, 
  Loader2, 
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner';

interface Operator {
  id: string;
  full_name: string;
  role: string;
  auth_mode?: string;
  bound_device_id?: string | null;
}

interface StaffStatus {
  current_status: 'idle' | 'working' | 'break';
  last_event_time?: string;
  total_minutes_today: number;
}

function FicharContent() {
  const searchParams = useSearchParams();
  const qrToken = searchParams.get('t') || '';
  const tenantParam = searchParams.get('tenant') || '';

  const [tenantId, setTenantId] = useState<string>('');
  const [deviceId, setDeviceId] = useState<string>('');
  const [deviceLabel, setDeviceLabel] = useState<string>('');

  const [operators, setOperators] = useState<Operator[]>([]);
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

  // 1. Obtener o inicializar ID persistente del dispositivo en localStorage
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
      label = 'iPhone / Dispositivo iOS';
    } else if (/Android/.test(ua)) {
      label = 'Móvil Android';
    } else if (/Mac/.test(ua)) {
      label = 'MacBook / Safari';
    } else if (/Windows/.test(ua)) {
      label = 'PC Windows';
    }
    setDeviceLabel(label);

    // Obtener tenantId
    const tId = tenantParam || (document.cookie.split('; ').find(row => row.startsWith('tenant_id='))?.split('=')[1] || '');
    setTenantId(tId);
  }, [tenantParam]);

  // 2. Cargar lista de empleadas/operadoras
  useEffect(() => {
    if (!tenantId) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/time-clock/operators?tenant_id=${tenantId}`, {
      headers: { 'X-Tenant-ID': tenantId }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOperators(data);
          // Si solo hay una operadora o ya había una seleccionada previamente en este móvil:
          const savedStaffId = localStorage.getItem('timeclock_last_staff_id');
          if (savedStaffId) {
            const matched = data.find((op: Operator) => op.id === savedStaffId);
            if (matched) setSelectedStaff(matched);
          }
        }
      })
      .catch(err => {
        console.error("Error al cargar operadoras:", err);
      });
  }, [tenantId]);

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
        console.error("Error consultando estado de fichaje:", err);
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

  // 5. Ejecutar fichaje explícito
  const handleClockAction = async (eventType: 'clock_in' | 'clock_out' | 'break_start' | 'break_end') => {
    if (!selectedStaff) {
      toast.error("Selecciona tu perfil antes de fichar.");
      return;
    }
    if (pin.length !== 4) {
      toast.error("Por favor introduce tu PIN de 4 dígitos.");
      return;
    }
    if (!qrToken) {
      toast.error("No se ha detectado el código QR dinámico de la pantalla. Vuelve a escanearlo.");
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

      // Feedback háptico si el móvil lo soporta
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

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-stone-900 flex flex-col justify-between py-6 px-4 sm:px-6">
      {/* Top Header */}
      <header className="max-w-md mx-auto w-full text-center space-y-1.5 pt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF6B00] text-xs font-bold tracking-wide shadow-2xs">
          <Clock size={13} className="text-[#FF6B00]" />
          <span>Control Horario Laboral</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
          Fichaje Mostrador
        </h1>
        <p className="text-xs text-stone-400 font-medium">
          Registro presencial seguro con validación de terminal móvil
        </p>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto w-full my-auto space-y-4 py-4">
        {/* Alerta de QR no presente o caducado */}
        {!qrToken && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-900 text-xs flex items-start gap-3 shadow-xs">
            <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Código QR no detectado o expirado</p>
              <p className="mt-1 text-amber-800 leading-relaxed">
                Por seguridad anti-fraude, enfoca directamente con la cámara de tu móvil el código QR que se actualiza cada 20 segundos en la pantalla del salón.
              </p>
            </div>
          </div>
        )}

        {/* Pantalla de Éxito Inmediato */}
        {lastActionResult && (
          <div className="p-6 rounded-3xl bg-white border border-emerald-200 shadow-xl text-center space-y-3 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shadow-sm">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-600">
                {getEventLabel(lastActionResult.eventType)}
              </span>
              <h2 className="text-xl font-serif font-bold text-stone-900 mt-1">
                ¡Fichaje Confirmado!
              </h2>
              <p className="text-sm text-stone-500 font-medium mt-1">
                {lastActionResult.message}
              </p>
              <p className="text-xs font-mono font-bold text-stone-400 mt-2">
                Hora oficial: {lastActionResult.timestamp}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setLastActionResult(null)}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-all mt-2"
            >
              Registrar otro movimiento
            </button>
          </div>
        )}

        {/* Alerta de Error (ej. dispositivo no coincide o PIN incorrecto) */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3 shadow-xs animate-in shake duration-300">
            <AlertCircle size={18} className="text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold">Atención</p>
              <p className="mt-0.5 text-rose-800 leading-relaxed">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Tarjeta de Fichaje */}
        {!lastActionResult && (
          <div className="bg-white rounded-3xl border border-stone-200/80 shadow-lg p-5 sm:p-6 space-y-5">
            {/* 1. Selector de Empleada */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 flex items-center justify-between">
                <span>1. Selecciona tu nombre</span>
                {selectedStaff && (
                  <span className="text-stone-400 font-normal capitalize">
                    {selectedStaff.role}
                  </span>
                )}
              </label>

              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
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
                      className={`p-3 rounded-2xl border text-left flex items-center gap-2.5 transition-all ${
                        isSelected 
                          ? 'border-[#FF6B00] bg-orange-50/70 ring-1 ring-[#FF6B00]/40 text-stone-900' 
                          : 'border-stone-200/80 hover:border-stone-300 bg-white text-stone-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                        isSelected ? 'bg-[#FF6B00] text-white' : 'bg-stone-100 text-stone-500'
                      }`}>
                        {op.full_name.charAt(0)}
                      </div>
                      <div className="truncate">
                        <p className="text-xs font-bold truncate">{op.full_name}</p>
                        <p className="text-[10px] text-stone-400 truncate">{op.role}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Estado actual del turno si hay empleada seleccionada */}
            {selectedStaff && (
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200/60 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-2.5 h-2.5 rounded-full ${
                    staffStatus?.current_status === 'working' 
                      ? 'bg-emerald-500 animate-pulse' 
                      : staffStatus?.current_status === 'break'
                        ? 'bg-amber-500'
                        : 'bg-stone-300'
                  }`} />
                  <div>
                    <p className="text-xs font-bold text-stone-800">
                      {statusLoading 
                        ? 'Consultando estado...' 
                        : staffStatus?.current_status === 'working' 
                          ? 'En turno de trabajo' 
                          : staffStatus?.current_status === 'break' 
                            ? 'En tiempo de descanso / pausa' 
                            : 'Fuera de turno (No iniciado)'}
                    </p>
                    {staffStatus && staffStatus.total_minutes_today > 0 && (
                      <p className="text-[11px] text-stone-400 font-medium">
                        Tiempo acumulado hoy: {Math.floor(staffStatus.total_minutes_today / 60)}h {staffStatus.total_minutes_today % 60}min
                      </p>
                    )}
                  </div>
                </div>

                {selectedStaff.bound_device_id ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60" title="Móvil personal emparejado">
                    <Smartphone size={10} /> Vinculado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60" title="Se vinculará a este móvil en el primer fichaje">
                    Primer enlace
                  </span>
                )}
              </div>
            )}

            {/* 2. Entrada de PIN de 4 dígitos */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block text-center">
                2. Introduce tu PIN de 4 dígitos
              </label>

              {/* Indicador visual de los 4 dígitos */}
              <div className="flex items-center justify-center gap-3 py-1">
                {[0, 1, 2, 3].map(index => {
                  const hasChar = pin.length > index;
                  return (
                    <div
                      key={index}
                      className={`w-11 h-12 rounded-xl flex items-center justify-center text-xl font-bold font-mono transition-all border ${
                        hasChar 
                          ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] shadow-2xs scale-105' 
                          : 'border-stone-200 bg-stone-50 text-stone-300'
                      }`}
                    >
                      {hasChar ? '•' : ''}
                    </div>
                  );
                })}
              </div>

              {/* Teclado numérico táctil optimizado para móvil */}
              <div className="grid grid-cols-3 gap-2 pt-2 max-w-[280px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => handlePinClick(num)}
                    disabled={submitting}
                    className="h-12 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 font-mono font-bold text-lg text-stone-800 transition-all active:scale-95 flex items-center justify-center shadow-2xs"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handlePinClear}
                  disabled={submitting || pin.length === 0}
                  className="h-12 rounded-xl bg-stone-50 hover:bg-stone-100 text-[11px] font-bold uppercase tracking-wider text-stone-400 transition-all active:scale-95 flex items-center justify-center disabled:opacity-40"
                >
                  Borrar
                </button>
                <button
                  type="button"
                  onClick={() => handlePinClick('0')}
                  disabled={submitting}
                  className="h-12 rounded-xl bg-stone-100 hover:bg-stone-200 active:bg-stone-300 font-mono font-bold text-lg text-stone-800 transition-all active:scale-95 flex items-center justify-center shadow-2xs"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handlePinBackspace}
                  disabled={submitting || pin.length === 0}
                  className="h-12 rounded-xl bg-stone-50 hover:bg-stone-100 text-stone-500 transition-all active:scale-95 flex items-center justify-center disabled:opacity-40"
                  title="Eliminar último dígito"
                >
                  ⌫
                </button>
              </div>
            </div>

            {/* 3. Acciones Explícitas de Fichaje */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block text-center">
                3. Pulsa tu acción a registrar
              </label>

              <div className="grid grid-cols-2 gap-2.5">
                {/* Botón Entrada */}
                <button
                  type="button"
                  disabled={submitting || !selectedStaff || pin.length !== 4 || !qrToken}
                  onClick={() => handleClockAction('clock_in')}
                  className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <Play size={18} fill="currentColor" />
                  <span>Fichar Entrada</span>
                </button>

                {/* Botón Salida */}
                <button
                  type="button"
                  disabled={submitting || !selectedStaff || pin.length !== 4 || !qrToken}
                  onClick={() => handleClockAction('clock_out')}
                  className="p-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <LogOut size={18} />
                  <span>Fichar Salida</span>
                </button>

                {/* Botón Iniciar Pausa */}
                <button
                  type="button"
                  disabled={submitting || !selectedStaff || pin.length !== 4 || !qrToken}
                  onClick={() => handleClockAction('break_start')}
                  className="p-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <Coffee size={18} />
                  <span>Iniciar Pausa</span>
                </button>

                {/* Botón Reanudar Turno */}
                <button
                  type="button"
                  disabled={submitting || !selectedStaff || pin.length !== 4 || !qrToken}
                  onClick={() => handleClockAction('break_end')}
                  className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <Sparkles size={18} />
                  <span>Reanudar Turno</span>
                </button>
              </div>

              {submitting && (
                <div className="flex items-center justify-center gap-2 pt-2 text-xs text-stone-500 font-medium">
                  <Loader2 size={14} className="animate-spin text-[#FF6B00]" />
                  <span>Firmando registro laboral con sello de tiempo...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer Info de Seguridad */}
      <footer className="max-w-md mx-auto w-full text-center space-y-1 pt-3 pb-2 text-[11px] text-stone-400">
        <div className="inline-flex items-center gap-1.5 font-medium">
          <ShieldCheck size={13} className="text-emerald-600" />
          <span>Firma digital conforme al Real Decreto-ley 8/2019 de control horario</span>
        </div>
        <p className="text-[10px] text-stone-400">
          Terminal ID: <span className="font-mono">{deviceId ? deviceId.slice(0, 12) + '...' : 'detectando...'}</span> ({deviceLabel})
        </p>
      </footer>
    </div>
  );
}

export default function FicharPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
          <p className="text-xs font-semibold text-stone-500">Cargando control horario...</p>
        </div>
      </div>
    }>
      <FicharContent />
    </Suspense>
  );
}
