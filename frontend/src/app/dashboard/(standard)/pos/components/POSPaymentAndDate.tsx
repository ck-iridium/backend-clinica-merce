'use client';

import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { PaymentMethod } from './types';

interface POSPaymentAndDateProps {
  selectedDate: string;
  setSelectedDate: (val: string) => void;
  getFriendlyDateStr: (dateStr: string) => string;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (val: PaymentMethod) => void;
}

export function POSPaymentAndDate({
  selectedDate,
  setSelectedDate,
  getFriendlyDateStr,
  paymentMethod,
  setPaymentMethod,
}: POSPaymentAndDateProps) {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
      {/* Selector Manual de Fecha */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
          {t('dashboard.pos.registration_date') || 'Fecha del Registro'}
        </label>
        <div className="relative pointer-events-auto cursor-pointer">
          <div className="bg-white/5 border border-white/10 text-white rounded-2xl px-4 py-3.5 text-xs font-semibold flex items-center justify-between gap-3 hover:bg-white/10 hover:border-white/20 transition-all">
            <Calendar size={16} className="text-[#d4af37] shrink-0" />
            <span className="truncate flex-1 text-center font-medium">
              {getFriendlyDateStr(selectedDate)}
            </span>
            <ChevronDown size={14} className="text-white/40 shrink-0" />
          </div>
          {/* Input nativo oculto superpuesto a todo el botón */}
          <input
            id="pos-datepicker"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            onClick={(e) => {
              try {
                if (typeof e.currentTarget.showPicker === 'function') {
                  e.currentTarget.showPicker();
                }
              } catch (err) {
                // Silenciar fallo en navegadores antiguos
              }
            }}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer pointer-events-auto z-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
          />
        </div>
      </div>

      {/* Método de Pago */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-white/60">
          {t('dashboard.pos.payment_method') || 'Método de Pago'}
        </label>
        <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center w-full">
          {(['Tarjeta', 'Efectivo'] as PaymentMethod[]).map((method) => (
            <button
              key={method}
              type="button"
              id={method === 'Tarjeta' ? 'pos-pay-card' : 'pos-pay-cash'}
              onClick={() => setPaymentMethod(method)}
              className={`flex-1 text-center py-2.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                paymentMethod === method
                  ? 'bg-white text-stone-950 font-bold shadow-md'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {method === 'Tarjeta'
                ? t('dashboard.pos.pay_card') || '💳 Tarj.'
                : t('dashboard.pos.pay_cash') || '💵 Efect.'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
