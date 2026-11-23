"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Operator } from '../types';

interface CounterOperatorPickerProps {
  availableOperators: Operator[];
  isLoadingOperators: boolean;
  isDarkMode: boolean;
  onSelectOperator: (operator: Operator) => void;
  onUnlockCounter: () => void;
}

export function CounterOperatorPicker({
  availableOperators,
  isLoadingOperators,
  isDarkMode,
  onSelectOperator,
  onUnlockCounter,
}: CounterOperatorPickerProps) {
  if (isLoadingOperators) {
    return (
      <div className="space-y-5 text-center max-w-md w-full mx-auto animate-in fade-in duration-200">
        <div className="space-y-2">
          <div className={`h-8 w-60 rounded-2xl mx-auto animate-pulse ${isDarkMode ? 'bg-white/10' : 'bg-stone-200/70'}`} />
          <div className={`h-4 w-44 rounded-xl mx-auto animate-pulse ${isDarkMode ? 'bg-white/5' : 'bg-stone-100'}`} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-2 pb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className={`p-4 rounded-3xl flex flex-col items-center gap-2.5 animate-pulse ${
              isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-stone-200/70 shadow-xs'
            }`}>
              <div className={`w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-2xl ${isDarkMode ? 'bg-stone-800' : 'bg-stone-100'}`} />
              <div className={`h-3 w-16 rounded mt-1 ${isDarkMode ? 'bg-stone-800' : 'bg-stone-200'}`} />
              <div className={`h-2.5 w-12 rounded ${isDarkMode ? 'bg-stone-850' : 'bg-stone-100'}`} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (availableOperators.length === 0) {
    return (
      <div className={`p-8 rounded-3xl text-center space-y-4 max-w-md mx-auto animate-in zoom-in-95 duration-200 ${
        isDarkMode ? 'bg-white/5 border border-white/10' : 'bg-white border border-stone-200/80 shadow-xl'
      }`}>
        <div className={`w-12 h-12 rounded-2xl text-[#FF6B00] flex items-center justify-center mx-auto ${
          isDarkMode ? 'bg-orange-500/20' : 'bg-orange-50 border border-orange-200/60'
        }`}>
          <AlertCircle size={24} />
        </div>
        <div className="space-y-1.5">
          <h3 className={`font-serif text-xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
            Sin Operadoras con PIN
          </h3>
          <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
            Aún no se ha registrado ninguna operadora con PIN en este centro. Para utilizar el modo mostrador bloqueado, crea primero a tus empleadas o configúrate un PIN desde el panel de Equipo.
          </p>
        </div>
        <button
          type="button"
          onClick={onUnlockCounter}
          className="w-full py-3 px-5 rounded-2xl bg-[#FF6B00] hover:bg-[#e05e00] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          Continuar al Panel Principal
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <div>
        <h3 className={`font-serif text-2xl sm:text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>
          ¿Quién va a usar el mostrador?
        </h3>
        <p className={`text-xs mt-1 ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
          Toca tu nombre e introduce tu PIN de 4 dígitos para acceder.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 p-2 pb-4 max-h-[55vh] overflow-y-auto custom-scrollbar">
        {availableOperators.map(op => (
          <button
            key={op.id}
            type="button"
            onClick={() => onSelectOperator(op)}
            className={`p-4 rounded-3xl flex flex-col items-center gap-2.5 text-center transition-all group active:scale-95 cursor-pointer ${
              isDarkMode
                ? 'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50'
                : 'bg-white hover:bg-orange-50/50 border border-stone-200/80 hover:border-[#FF6B00] shadow-sm hover:shadow-md'
            }`}
          >
            <div className={`w-16 h-16 sm:w-[68px] sm:h-[68px] rounded-2xl flex items-center justify-center text-xl font-bold shadow-md transition-all overflow-hidden shrink-0 ${
              isDarkMode
                ? 'bg-gradient-to-tr from-stone-800 to-stone-700 group-hover:from-orange-600 group-hover:to-orange-500 border border-white/10 text-white'
                : 'bg-stone-100 group-hover:bg-[#FF6B00] border border-stone-200 text-stone-700 group-hover:text-white'
            }`}>
              {op.avatar_url ? (
                <img src={op.avatar_url} alt={op.full_name || "Operadora"} className="w-full h-full object-cover" />
              ) : (
                op.full_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="w-full truncate">
              <p className={`text-xs font-bold truncate ${isDarkMode ? 'text-white' : 'text-stone-900'}`}>{op.full_name}</p>
              <p className={`text-[10px] truncate capitalize ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>{op.role}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
