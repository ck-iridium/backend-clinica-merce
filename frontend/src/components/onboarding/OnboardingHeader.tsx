"use client"

import React from 'react';

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ step, totalSteps }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37] block mb-1">
          Onboarding ProBookia
        </span>
        <h1 className="font-serif italic text-2xl text-stone-850 transition-all duration-300">
          {step === 1 && "Comienza tu viaje premium"}
          {step === 2 && "Estructura operativa"}
          {step === 3 && "Horarios & Agenda"}
          {step === 4 && "Últimos retoques de marca"}
        </h1>
      </div>
      
      <div className="flex items-center gap-3">
        <span className="text-stone-400 text-xs font-semibold font-sans">
          Paso {step} de {totalSteps}
        </span>
        <div className="flex items-center gap-1">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const s = index + 1;
            return (
              <div 
                key={s} 
                className={`h-1 rounded-full transition-all duration-500 ${
                  s === step 
                    ? 'w-6 bg-[#d4af37]' 
                    : s < step 
                    ? 'w-2.5 bg-stone-900' 
                    : 'w-2 bg-stone-100'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
