"use client";

import React from 'react';
import { Lock, QrCode, LogOut } from 'lucide-react';
import { Operator, ShowcaseService } from '../types';
import { CounterOperatorPicker } from './CounterOperatorPicker';
import { CounterPinNumpad } from './CounterPinNumpad';
import { CounterDiagonalBackground } from './CounterDiagonalBackground';

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
  showcaseServices?: ShowcaseService[];
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
  showcaseServices = [],
  onOpenQR,
  onLogout,
  onSelectOperator,
  onUnlockCounter,
  onPinInput,
  onPinBackspace,
  onResetOperator,
}: CounterLockScreenProps) {
  return (
    <div className={`fixed inset-0 z-[150] flex flex-col justify-between p-6 sm:p-10 animate-in fade-in duration-300 overflow-hidden ${
      isDarkMode 
        ? 'bg-stone-950 text-white' 
        : 'bg-[#FAF9F6] text-stone-900'
    }`}>
      {/* Fondo 3D en perspectiva diagonal con servicios del tenant */}
      <CounterDiagonalBackground
        services={showcaseServices}
        clinicName={clinicName}
        isDarkMode={isDarkMode}
      />

      {/* Header Superior */}
      <div className="relative z-10 flex items-center justify-between max-w-4xl w-full mx-auto">
        <div className={`flex items-center gap-3 px-3.5 py-2 rounded-2xl backdrop-blur-xl border shadow-xs ${
          isDarkMode
            ? 'bg-stone-900/60 border-white/10'
            : 'bg-white/70 border-stone-200/70'
        }`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[#FF6B00] shadow-xs ${
            isDarkMode ? 'bg-orange-500/20 border border-orange-500/30' : 'bg-orange-50 border border-orange-200/80'
          }`}>
            <Lock size={18} />
          </div>
          <div>
            <h2 className={`font-serif font-bold text-base sm:text-lg tracking-tight leading-tight ${
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
              className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs transition-all shadow-xs backdrop-blur-xl active:scale-95 cursor-pointer ${
                isDarkMode 
                  ? 'bg-stone-900/70 hover:bg-stone-800/80 text-white border border-white/15' 
                  : 'bg-white/80 hover:bg-white text-stone-800 border border-stone-200/80'
              }`}
            >
              <QrCode size={15} className="text-[#FF6B00]" />
              <span>Fichar con Móvil</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className={`flex items-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs transition-all shadow-xs backdrop-blur-xl active:scale-95 cursor-pointer ${
              isDarkMode 
                ? 'bg-stone-900/60 hover:bg-rose-500/20 hover:border-rose-500/30 text-stone-300 hover:text-rose-200 border border-white/10' 
                : 'bg-white/75 hover:bg-rose-50 hover:border-rose-200 text-stone-600 hover:text-rose-700 border border-stone-200/70'
            }`}
            title="Cerrar la sesión de la clínica en este ordenador"
          >
            <LogOut size={15} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Centro: Pedestal Glassmorphism con Selección de Empleada o Numpad de PIN */}
      <div className={`relative z-10 max-w-md w-full mx-auto my-auto rounded-[2rem] p-6 sm:p-8 backdrop-blur-2xl border transition-all ${
        isDarkMode
          ? 'bg-stone-900/65 border-white/10 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.65)]'
          : 'bg-white/78 border-white/80 shadow-[0_25px_70px_-15px_rgba(28,25,23,0.12)]'
      }`}>
        <div className="space-y-6">
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
      </div>

      {/* Footer del Lock */}
      <div className="relative z-10 max-w-4xl w-full mx-auto text-center text-xs">
        <span className={`inline-block px-4 py-1.5 rounded-full backdrop-blur-xl border ${
          isDarkMode
            ? 'bg-stone-900/60 border-white/10 text-stone-400'
            : 'bg-white/70 border-stone-200/70 text-stone-500'
        }`}>
          Auto-bloqueo configurado a {autolockMinutes > 0 ? `${autolockMinutes} minutos de inactividad` : 'desactivado'}.
        </span>
      </div>
    </div>
  );
}
