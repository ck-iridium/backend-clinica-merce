"use client"

import React, { useState, useEffect } from 'react';
import { Lock, UserCheck, RefreshCw, Sparkles } from 'lucide-react';

interface ActiveOperator {
  id: string;
  full_name: string;
  role: string;
  avatar_url?: string | null;
}

export default function ActiveCounterOperatorPill({ className = "" }: { className?: string }) {
  const [mounted, setMounted] = useState<boolean>(false);
  const [operator, setOperator] = useState<ActiveOperator | null>(null);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);

  const formatRole = (role?: string) => {
    if (!role) return 'Operadora';
    const r = role.toLowerCase();
    if (r === 'admin' || r === 'administrador') return 'Administradora';
    if (r === 'specialist' || r === 'especialista') return 'Especialista';
    if (r === 'receptionist' || r === 'recepcion' || r === 'recepción') return 'Recepción';
    return role;
  };

  const loadOperator = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('counter_active_operator');
      if (stored) {
        const parsed = JSON.parse(stored);
        const op = parsed.operator || parsed;
        setOperator(op?.full_name ? op : null);
      } else {
        setOperator(null);
      }
    } catch {
      setOperator(null);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadOperator();

    // Comprobar si Modo Mostrador está habilitado en ajustes
    let tid = '';
    if (typeof window !== 'undefined') {
      const uStr = localStorage.getItem('user');
      if (uStr) {
        try {
          const u = JSON.parse(uStr);
          if (u.tenant_id) tid = u.tenant_id;
        } catch (e) { }
      }
      if (!tid) {
        const match = document.cookie.match(/(?:^|; )tenant_id=([^;]*)/);
        if (match && match[1]) tid = match[1];
      }
    }

    if (tid) {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      fetch(`${apiUrl}/settings/?tenant_id=${tid}`, {
        headers: { 'X-Tenant-ID': tid }
      })
        .then(res => res.json())
        .then(settings => {
          if (settings) {
            setIsEnabled(Boolean(settings.enable_counter_mode));
          }
        })
        .catch(() => { });
    }

    const handleOperatorChange = (e: any) => {
      if (e?.detail) {
        const op = e.detail.operator || e.detail;
        setOperator(op?.full_name ? op : null);
      } else {
        loadOperator();
      }
    };

    const handleSettingsUpdated = (e: any) => {
      if (e?.detail && typeof e.detail.enable_counter_mode !== 'undefined') {
        setIsEnabled(Boolean(e.detail.enable_counter_mode));
      }
    };

    window.addEventListener('counter_operator_changed', handleOperatorChange);
    window.addEventListener('settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('counter_operator_changed', handleOperatorChange);
      window.removeEventListener('settings_updated', handleSettingsUpdated);
    };
  }, []);

  const handleSwitchOperator = () => {
    window.dispatchEvent(new CustomEvent('lock_counter'));
  };

  if (!mounted || !isEnabled) {
    return null;
  }

  if (!operator) {
    return (
      <button
        type="button"
        id="counter-active-operator-pill"
        onClick={handleSwitchOperator}
        className={`inline-flex items-center gap-2.5 py-2.5 px-4 rounded-2xl bg-white hover:bg-orange-50/70 border border-stone-200/90 hover:border-orange-200 text-stone-700 hover:text-[#FF6B00] text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer ${className}`}
        title="Pulsar para identificarse como operadora de mostrador"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-[#FF6B00] animate-pulse" />
        <span className="text-xs font-bold text-stone-800">Mostrador Libre</span>
        <div className="w-6 h-6 rounded-lg bg-stone-100 flex items-center justify-center text-stone-500">
          <Lock size={13} />
        </div>
      </button>
    );
  }

  return (
    <div
      id="counter-active-operator-pill"
      className={`inline-flex items-center gap-3 py-2 px-3.5 sm:px-4 rounded-2xl bg-white border border-stone-200/90 shadow-sm text-stone-800 transition-all ${className}`}
    >
      <div className="relative flex items-center justify-center shrink-0">
        <div className="w-9 h-9 rounded-xl bg-[#FF6B00] text-white flex items-center justify-center text-sm font-bold shadow-xs overflow-hidden">
          {operator.avatar_url ? (
            <img src={operator.avatar_url} alt={operator.full_name || "Operadora"} className="w-full h-full object-cover" />
          ) : (
            <span>{operator.full_name ? operator.full_name.charAt(0).toUpperCase() : 'O'}</span>
          )}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
      </div>

      <div className="flex flex-col text-left leading-tight max-w-[150px]">
        <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
          {operator.full_name}
        </span>
        <span className="text-[11px] font-medium text-stone-500 capitalize truncate">
          {formatRole(operator.role)}
        </span>
      </div>

      <button
        type="button"
        onClick={handleSwitchOperator}
        className="ml-0.5 p-1.5 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-[#FF6B00] transition-colors active:scale-95 cursor-pointer"
        title="Cambiar operadora / Bloquear mostrador"
      >
        <Lock size={15} />
      </button>
    </div>
  );
}
