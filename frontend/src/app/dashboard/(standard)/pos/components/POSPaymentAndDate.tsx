'use client';

import React from 'react';
import { Calendar, ChevronDown, CreditCard, Banknote } from 'lucide-react';
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
      {/* Selector Manual de Fecha */}
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
          {t('dashboard.pos.registration_date') || 'Fecha de Emisión'}
        </label>
        <div className="relative pointer-events-auto cursor-pointer group">
          <div className="bg-white/5 border border-white/10 text-white rounded-2xl px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between gap-2.5 group-hover:bg-white/10 group-hover:border-white/20 transition-all">
            <div className="flex items-center gap-2 truncate">
              <Calendar size={14} className="text-[#D4AF37] shrink-0" />
              <span className="truncate font-medium text-white/90">
                {getFriendlyDateStr(selectedDate)}
              </span>
            </div>
            <ChevronDown size={13} className="text-white/40 shrink-0 group-hover:text-white/80 transition-colors" />
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
      <div className="space-y-1.5">
        <label className="block text-xs font-bold uppercase tracking-wider text-white/70">
          {t('dashboard.pos.payment_method') || 'Método de Pago'}
        </label>
        <div className="bg-white/5 p-1 rounded-full border border-white/10 flex items-center w-full backdrop-blur-md">
          {(['Tarjeta', 'Efectivo'] as PaymentMethod[]).map((method) => {
            const isSelected = paymentMethod === method;
            return (
              <button
                key={method}
                type="button"
                id={method === 'Tarjeta' ? 'pos-pay-card' : 'pos-pay-cash'}
                onClick={() => setPaymentMethod(method)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${
                  isSelected
                    ? 'bg-white text-stone-950 font-extrabold shadow-sm'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {method === 'Tarjeta' ? (
                  <CreditCard size={13} className={isSelected ? 'text-stone-950' : 'text-stone-400'} />
                ) : (
                  <Banknote size={13} className={isSelected ? 'text-stone-950' : 'text-stone-400'} />
                )}
                <span>
                  {method === 'Tarjeta'
                    ? t('dashboard.pos.pay_card') || 'Tarjeta'
                    : t('dashboard.pos.pay_cash') || 'Efectivo'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
