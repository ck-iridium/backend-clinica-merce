"use client"

import React from 'react';

interface OnboardingHeaderProps {
  step: number;
  totalSteps: number;
  planType?: string;
}

export const OnboardingHeader: React.FC<OnboardingHeaderProps> = ({ step, totalSteps, planType = 'basic' }) => {
  const getStepTitle = () => {
    if (totalSteps === 4) {
      switch (step) {
        case 1: return "Identidad de Marca";
        case 2: return "Sede y Modalidad de Trabajo";
        case 3: return "Horarios & Agenda";
        case 4: return "Catálogo Inicial y Lanzamiento";
        default: return "Configuración Inicial";
      }
    } else {
      switch (step) {
        case 1: return "Identidad de Marca";
        case 2: return "Sedes y Modalidad de Trabajo";
        case 3: return "Cabinas y Recursos Físicos";
        case 4: return "Equipo y Especialistas";
        case 5: return "Horarios & Agenda";
        case 6: return "Catálogo Inicial y Lanzamiento";
        default: return "Configuración Inicial";
      }
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 font-sans">
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#d4af37]">
            Configuración ProBookia
          </span>
          <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-stone-900 text-[#d4af37] border border-[#d4af37]/30">
            Plan {planType.toUpperCase()}
          </span>
        </div>
        <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 tracking-tight transition-all duration-300">
          {getStepTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-3 self-start md:self-auto">
        <span className="text-stone-400 text-xs font-semibold">
          Paso {step} de {totalSteps}
        </span>
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const s = index + 1;
            return (
              <div 
                key={s} 
                className={`h-1.5 rounded-full transition-all duration-500 ${
                  s === step 
                    ? 'w-7 bg-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.4)]' 
                    : s < step 
                    ? 'w-3 bg-stone-900' 
                    : 'w-2 bg-stone-200'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
