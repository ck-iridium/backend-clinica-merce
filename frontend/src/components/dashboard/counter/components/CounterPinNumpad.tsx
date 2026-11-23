"use client";

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Operator } from '../types';

interface CounterPinNumpadProps {
  selectedOperator: Operator;
  pinValue: string;
  pinError: string | null;
  isVerifyingPin: boolean;
  isDarkMode: boolean;
  canChangeOperator: boolean;
  onPinInput: (digit: string) => void;
  onPinBackspace: () => void;
  onResetOperator: () => void;
}

export function CounterPinNumpad({
  selectedOperator,
  pinValue,
  pinError,
  isVerifyingPin,
  isDarkMode,
  canChangeOperator,
  onPinInput,
  onPinBackspace,
  onResetOperator,
}: CounterPinNumpadProps) {
  return (
    <div className="space-y-5 text-center animate-in zoom-in-95 duration-200">
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-2xl bg-[#FF6B00] text-white flex items-center justify-center text-2xl font-bold shadow-lg overflow-hidden shrink-0">
          {selectedOperator.avatar_url ? (
            <img src={selectedOperator.avatar_url} alt={selectedOperator.full_name || "Operadora"} className="w-full h-full object-cover" />
          ) : (
            selectedOperator.full_name.charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h3 className={`font-serif text-xl sm:text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Hola, {selectedOperator.full_name}
          </h3>
          <p className={`text-xs ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
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
                  ? isDarkMode
                    ? 'border-[#FF6B00] bg-orange-500/20 text-[#FF6B00] scale-105 shadow-[0_0_15px_rgba(255,107,0,0.3)]'
                    : 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] scale-105 shadow-2xs'
                  : isDarkMode
                    ? 'border-white/20 bg-white/5 text-stone-600'
                    : 'border-stone-200 bg-white text-stone-300 shadow-2xs'
              }`}
            >
              {hasChar ? '•' : ''}
            </div>
          );
        })}
      </div>

      {pinError && (
        <p className="text-xs text-rose-500 font-bold animate-in shake duration-300">
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
            onClick={() => onPinInput(num)}
            className={`h-13 rounded-2xl font-mono font-bold text-xl transition-all active:scale-95 flex items-center justify-center border cursor-pointer ${
              isDarkMode
                ? 'bg-white/10 hover:bg-white/20 active:bg-orange-500/30 text-white border-white/5'
                : 'bg-white hover:bg-stone-100 active:bg-orange-50 text-stone-900 border-stone-200/80 shadow-2xs'
            }`}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={onResetOperator}
          className={`h-13 rounded-2xl text-[11px] font-bold uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center border cursor-pointer ${
            isDarkMode
              ? 'bg-white/5 hover:bg-white/10 text-stone-400 border-white/5'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-600 border-stone-200/60 shadow-2xs'
          }`}
        >
          {canChangeOperator ? 'Cambiar' : 'Limpiar'}
        </button>
        <button
          type="button"
          disabled={isVerifyingPin}
          onClick={() => onPinInput('0')}
          className={`h-13 rounded-2xl font-mono font-bold text-xl transition-all active:scale-95 flex items-center justify-center border cursor-pointer ${
            isDarkMode
              ? 'bg-white/10 hover:bg-white/20 active:bg-orange-500/30 text-white border-white/5'
              : 'bg-white hover:bg-stone-100 active:bg-orange-50 text-stone-900 border-stone-200/80 shadow-2xs'
          }`}
        >
          0
        </button>
        <button
          type="button"
          onClick={onPinBackspace}
          disabled={isVerifyingPin || pinValue.length === 0}
          className={`h-13 rounded-2xl transition-all active:scale-95 flex items-center justify-center border disabled:opacity-30 cursor-pointer ${
            isDarkMode
              ? 'bg-white/5 hover:bg-white/10 text-stone-300 border-white/5'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200/60 shadow-2xs'
          }`}
        >
          ⌫
        </button>
      </div>

      {isVerifyingPin && (
        <div className="flex items-center justify-center gap-2 pt-2 text-xs text-[#FF6B00] font-semibold">
          <Loader2 size={14} className="animate-spin" />
          <span>Verificando PIN de seguridad...</span>
        </div>
      )}
    </div>
  );
}
