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
  const [operator, setOperator] = useState<ActiveOperator | null>(null);

  const loadOperator = () => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem('counter_active_operator');
      if (stored) {
        setOperator(JSON.parse(stored));
      } else {
        setOperator(null);
      }
    } catch {
      setOperator(null);
    }
  };

  useEffect(() => {
    loadOperator();

    const handleOperatorChange = (e: any) => {
      if (e?.detail) {
        setOperator(e.detail);
      } else {
        loadOperator();
      }
    };

    window.addEventListener('counter_operator_changed', handleOperatorChange);
    return () => {
      window.removeEventListener('counter_operator_changed', handleOperatorChange);
    };
  }, []);

  const handleSwitchOperator = () => {
    window.dispatchEvent(new CustomEvent('lock_counter'));
  };

  if (!operator) {
    return (
      <button
        type="button"
        id="counter-active-operator-pill"
        onClick={handleSwitchOperator}
        className={`inline-flex items-center gap-2 py-1.5 px-3 rounded-2xl bg-stone-100/80 hover:bg-orange-50 border border-stone-200/80 hover:border-orange-200/70 text-stone-600 hover:text-[#FF6B00] text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer ${className}`}
        title="Pulsar para seleccionar operadora de mostrador"
      >
        <span className="w-2 h-2 rounded-full bg-stone-300" />
        <span className="text-[11px]">Mostrador Libre</span>
        <Lock size={12} className="text-stone-400 ml-0.5" />
      </button>
    );
  }

  return (
    <div 
      id="counter-active-operator-pill"
      className={`inline-flex items-center gap-2 py-1 px-2.5 rounded-2xl bg-white border border-stone-200/90 shadow-2xs text-stone-800 transition-all ${className}`}
    >
      <div className="relative flex items-center justify-center">
        <div className="w-6 h-6 rounded-full bg-[#FF6B00] text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs">
          {operator.full_name ? operator.full_name.charAt(0) : 'O'}
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
      </div>

      <div className="flex flex-col text-left leading-none max-w-[130px]">
        <span className="text-xs font-bold text-stone-900 truncate">
          {operator.full_name}
        </span>
        <span className="text-[9px] font-semibold text-stone-400 capitalize truncate">
          {operator.role || 'Operadora'}
        </span>
      </div>

      <button
        type="button"
        onClick={handleSwitchOperator}
        className="ml-1 p-1 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-[#FF6B00] transition-colors active:scale-95 cursor-pointer"
        title="Cambiar operadora / Bloquear mostrador"
      >
        <Lock size={13} />
      </button>
    </div>
  );
}
