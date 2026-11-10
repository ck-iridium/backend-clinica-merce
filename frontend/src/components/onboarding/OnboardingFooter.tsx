"use client"

import React from 'react';
import { ChevronRight, Sparkles, Loader2 } from 'lucide-react';

interface OnboardingFooterProps {
  step: number;
  totalSteps: number;
  submitting: boolean;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  handleCompleteSetup: () => void;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({
  step,
  totalSteps,
  submitting,
  handlePrevStep,
  handleNextStep,
  handleCompleteSetup
}) => {
  return (
    <div className="border-t border-stone-100 pt-6 flex items-center justify-between shrink-0 mt-auto font-sans">
      <button
        type="button"
        onClick={handlePrevStep}
        disabled={step === 1 || submitting}
        className={`text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-900 transition-colors select-none active:scale-95 disabled:opacity-30 ${
          step === 1 ? 'opacity-0 pointer-events-none' : ''
        }`}
      >
        Anterior
      </button>

      {step < totalSteps ? (
        <button
          type="button"
          onClick={handleNextStep}
          className="bg-stone-900 hover:bg-[#d4af37] text-white hover:text-stone-950 px-8 py-3.5 rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-wider active:scale-95 duration-300 flex items-center gap-2 group cursor-pointer"
        >
          Siguiente 
          <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCompleteSetup}
          disabled={submitting}
          className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 hover:from-[#d4af37] hover:to-[#b89528] text-[#d4af37] hover:text-stone-950 px-8 py-3.5 rounded-xl text-xs font-bold transition-all shadow-luxury uppercase tracking-wider disabled:opacity-50 active:scale-95 duration-300 flex items-center gap-2 border border-[#d4af37]/40 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-[#d4af37]" />
              Creando Entorno...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Finalizar y Entrar
            </>
          )}
        </button>
      )}
    </div>
  );
};
