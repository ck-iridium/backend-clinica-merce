"use client"

import React from 'react';
import { ChevronRight } from 'lucide-react';

interface OnboardingFooterProps {
  step: number;
  submitting: boolean;
  handlePrevStep: () => void;
  handleNextStep: () => void;
  handleCompleteSetup: () => void;
}

export const OnboardingFooter: React.FC<OnboardingFooterProps> = ({
  step,
  submitting,
  handlePrevStep,
  handleNextStep,
  handleCompleteSetup
}) => {
  return (
    <div className="border-t border-stone-100 pt-6 flex items-center justify-between shrink-0 mt-auto">
      <button
        type="button"
        onClick={handlePrevStep}
        disabled={step === 1 || submitting}
        className={`text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-stone-850 transition-colors select-none active:scale-95 disabled:opacity-30 ${
          step === 1 ? 'opacity-0 pointer-events-none' : ''
        }`}
      >
        Anterior
      </button>

      {step < 4 ? (
        <button
          type="button"
          onClick={handleNextStep}
          className="bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-8 py-4 rounded-xl text-xs font-bold transition-all shadow-md uppercase tracking-widest active:scale-95 duration-300 flex items-center gap-2"
        >
          Siguiente <ChevronRight className="w-3.5 h-3.5" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleCompleteSetup}
          disabled={submitting}
          className="bg-stone-900 hover:bg-[#d4af37] hover:text-stone-950 text-white px-8 py-4 rounded-xl text-xs font-bold transition-all shadow-lg uppercase tracking-widest disabled:opacity-50 active:scale-95 duration-300 flex items-center gap-2"
        >
          {submitting ? 'Creando Portal...' : 'Finalizar Registro'}
        </button>
      )}
    </div>
  );
};
