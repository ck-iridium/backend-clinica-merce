"use client";

import React from 'react';
import { Lock, QrCode, LogOut } from 'lucide-react';
import { Operator } from '../types';
import { CounterOperatorPicker } from './CounterOperatorPicker';
import { CounterPinNumpad } from './CounterPinNumpad';

interface CounterLockScreenProps {
  clinicName: string;
  isDarkMode: boolean;
  enableTimeClock: boolean;
  autolockMinutes: number;
  availableOperators: Operator[];
  isLoadingOperators: boolean;
  selectedOperator: Operator | null;
  pinValue: string;
  pinError: string | null;
  isVerifyingPin: boolean;
  onOpenQR: () => void;
  onLogout: () => void;
  onSelectOperator: (op: Operator) => void;
  onUnlockCounter: () => void;
  onPinInput: (digit: string) => void;
  onPinBackspace: () => void;
  onResetOperator: () => void;
}

export function CounterLockScreen({
  clinicName,
  isDarkMode,
  enableTimeClock,
  autolockMinutes,
  availableOperators,
  isLoadingOperators,
  selectedOperator,
  pinValue,
  pinError,
  isVerifyingPin,
  onOpenQR,
  onLogout,
  onSelectOperator,
  onUnlockCounter,
  onPinInput,
  onPinBackspace,
  onResetOperator,
}: CounterLockScreenProps) {
  return (
    <div className={`fixed inset-0 z-[150] backdrop-blur-2xl flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300 ${
      isDarkMode 
        ? 'bg-stone-950/95 text-white' 
        : 'bg-[#FAF9F6]/95 text-stone-900'
    }`}>
      {/* Header Superior */}
      <div className="flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[#FF6B00] shadow-sm ${
            isDarkMode ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-orange-50 border border-orange-200/80'
          }`}>
            <Lock size={20} />
          </div>
          <div>
            <h2 className={`font-serif font-bold text-lg sm:text-xl tracking-tight ${
              isDarkMode ? 'text-white' : 'text-stone-900'
            }`}>
              {clinicName}
            </h2>
            <p className={`text-[11px] font-medium ${isDarkMode ? 'text-stone-400' : 'text-stone-500'}`}>
              Modo Mostrador Protegido
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {enableTimeClock && (
            <button
              type="button"
              onClick={onOpenQR}
              className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/15 text-white border border-white/15' 
                  : 'bg-white hover:bg-stone-100 text-stone-800 border border-stone-200/80'
              }`}
            >
              <QrCode size={15} className="text-[#FF6B00]" />
              <span>Fichar con Móvil</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs transition-all shadow-xs active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-white/5 hover:bg-rose-500/20 hover:border-rose-500/30 text-stone-300 hover:text-rose-200 border border-white/10' 
                : 'bg-stone-100 hover:bg-rose-50 hover:border-rose-200 text-stone-600 hover:text-rose-700 border border-stone-200/70'
            }`}
            title="Cerrar la sesión de la clínica en este ordenador"
          >
            <LogOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Centro: Selección de Empleada o Numpad de PIN */}
      <div className="max-w-md w-full mx-auto my-auto space-y-6">
        {!selectedOperator ? (
          <CounterOperatorPicker
            availableOperators={availableOperators}
            isLoadingOperators={isLoadingOperators}
            isDarkMode={isDarkMode}
            onSelectOperator={onSelectOperator}
            onUnlockCounter={onUnlockCounter}
          />
        ) : (
          <CounterPinNumpad
            selectedOperator={selectedOperator}
            pinValue={pinValue}
            pinError={pinError}
            isVerifyingPin={isVerifyingPin}
            isDarkMode={isDarkMode}
            canChangeOperator={availableOperators.length > 1}
            onPinInput={onPinInput}
            onPinBackspace={onPinBackspace}
            onResetOperator={onResetOperator}
          />
        )}
      </div>

      {/* Footer del Lock */}
      <div className="max-w-4xl w-full mx-auto text-center text-xs">
        <p className={isDarkMode ? 'text-stone-500' : 'text-stone-400'}>
          Auto-bloqueo configurado a {autolockMinutes > 0 ? `${autolockMinutes} minutos de inactividad` : 'desactivado'}.
        </p>
      </div>
    </div>
  );
}
