'use client';

import React from 'react';
import { Sparkles, X, Volume2, VolumeX, RotateCcw, AudioLines, Infinity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CopilotHeaderProps {
  language: string;
  planType: string | null;
  hasOwnKey: boolean;
  trialRemaining: number | null;
  dailyActionsUsed: number;
  dailyActionsLimit: number;
  voiceGender: 'female' | 'male';
  onToggleVoiceGender: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onClearHistory: () => void;
  onClose: () => void;
  isTrialExhausted: boolean;
  onUpgrade: () => void;
}

export default function CopilotHeader({
  language,
  planType,
  hasOwnKey,
  trialRemaining,
  dailyActionsUsed,
  dailyActionsLimit,
  voiceGender,
  onToggleVoiceGender,
  isMuted,
  onToggleMute,
  onClearHistory,
  onClose,
  isTrialExhausted,
  onUpgrade,
}: CopilotHeaderProps) {
  return (
    <div className="bg-white/95 backdrop-blur-md border-b border-stone-200/70 shrink-0 flex flex-col">
      {/* Fila 1: Título y Cerrar */}
      <div className="px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-300/40 flex items-center justify-center text-[#d4af37] shadow-xs">
            <Sparkles size={17} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-[15px] font-semibold text-stone-900 tracking-wide leading-tight">
              Co-Piloto AI
            </h3>
            <span className="text-[10px] text-[#d4af37] font-semibold uppercase tracking-widest block leading-none mt-0.5">
              {language === 'fr' ? 'Navigation Intelligente' : language === 'en' ? 'Smart Navigation' : 'Navegación Inteligente'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 flex items-center justify-center transition-all shrink-0 active:scale-95"
          title={language === 'fr' ? "Fermer l'assistant" : language === 'en' ? 'Close Assistant' : 'Cerrar Asistente'}
        >
          <X size={17} />
        </button>
      </div>

      {/* Fila 2: Controles Auxiliares */}
      <div className="px-4 py-2 bg-[#FAF9F6] border-t border-stone-100 flex items-center justify-between gap-2 text-xs">
        {/* Badge de límite de plan */}
        <div className="flex items-center gap-1.5 min-w-0">
          {planType && !hasOwnKey && (
            planType === 'free' && trialRemaining !== null ? (
              <div className="px-2.5 py-0.5 rounded-full border border-amber-300/60 bg-amber-50 text-amber-800 text-[10px] font-medium tracking-wide flex items-center gap-1.5 shrink-0">
                <Sparkles size={11} className="text-[#d4af37] animate-pulse" />
                <span>{trialRemaining} / 10 prueba</span>
              </div>
            ) : (planType === 'basic' || planType === 'pro') && dailyActionsLimit > 0 ? (
              <div
                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-medium tracking-wide flex items-center gap-1.5 shrink-0 cursor-pointer hover:opacity-90 active:scale-95 transition-all ${
                  (dailyActionsLimit - dailyActionsUsed) <= 0
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-amber-300/60 bg-amber-50 text-amber-800'
                }`}
                title={language === 'fr' ? 'Détails du quota quotidien' : language === 'en' ? 'Daily quota details' : 'Detalles de cuota diaria de Smart Actions'}
                onClick={() => {
                  const remaining = dailyActionsLimit - dailyActionsUsed;
                  const msg = language === 'fr'
                    ? `Quota quotidien : ${remaining} sur ${dailyActionsLimit} actions disponibles.`
                    : language === 'en'
                      ? `Daily quota: ${remaining} of ${dailyActionsLimit} smart actions remaining.`
                      : `Límite diario: ${remaining} de ${dailyActionsLimit} acciones inteligentes disponibles hoy.`;
                  const event = new CustomEvent('copilot-quota-info', { detail: { msg } });
                  window.dispatchEvent(event);
                }}
              >
                <Sparkles size={11} className="text-[#d4af37] animate-pulse" />
                <span>Smart: {dailyActionsLimit - dailyActionsUsed} / {dailyActionsLimit}</span>
              </div>
            ) : null
          )}

          {/* Badge ilimitado Gold/BYOK */}
          {(planType === 'gold' || hasOwnKey) && (
            <div className="px-2.5 py-0.5 rounded-full border border-amber-300/60 bg-amber-50 text-amber-800 text-[10px] font-medium tracking-wide flex items-center gap-1.5 shrink-0">
              <Infinity size={13} className="text-[#d4af37]" strokeWidth={2} />
              <span>Ilimitado</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Selector de Género de Voz */}
          <button
            onClick={onToggleVoiceGender}
            className={`px-2.5 py-1 rounded-full text-[11px] font-medium border transition-all duration-200 flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
              voiceGender === 'male'
                ? 'border-amber-300/80 bg-amber-50/80 text-amber-900 shadow-xs'
                : 'border-stone-200/80 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-xs'
            }`}
            title={language === 'fr' ? 'Changer de voix (Féminin/Masculin)' : language === 'en' ? 'Change voice (Female/Male)' : 'Cambiar voz (Femenina/Masculina)'}
          >
            <AudioLines size={12} className={voiceGender === 'male' ? 'text-amber-700' : 'text-[#d4af37]'} strokeWidth={2} />
            <span>
              {voiceGender === 'female'
                ? (language === 'fr' ? 'Voix Féminine' : language === 'en' ? 'Female Voice' : 'Voz Femenina')
                : (language === 'fr' ? 'Voix Masculine' : language === 'en' ? 'Male Voice' : 'Voz Masculina')
              }
            </span>
          </button>

          {/* Botón Silencio */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border transition-all shrink-0 active:scale-95 ${
              isMuted
                ? 'border-red-200 bg-red-50 text-red-500'
                : 'border-transparent text-stone-400 hover:text-stone-700 hover:bg-white hover:border-stone-200'
            }`}
            title={isMuted
              ? (language === 'fr' ? 'Activer la voix' : language === 'en' ? 'Unmute Voice' : 'Activar Voz')
              : (language === 'fr' ? 'Couper la voix' : language === 'en' ? 'Mute Voice' : 'Silenciar Voz')
            }
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Botón Reiniciar Chat */}
          <button
            onClick={onClearHistory}
            className="p-1.5 rounded-lg border border-transparent text-stone-400 hover:text-stone-700 hover:bg-white hover:border-stone-200 transition-all shrink-0 active:scale-95"
            title={language === 'fr' ? 'Réinitialiser la conversation' : language === 'en' ? 'Reset Conversation' : 'Reiniciar Conversación'}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Banner de Trial Exhausted */}
      {isTrialExhausted && (
        <div className="bg-amber-50/90 border-b border-amber-200/60 px-4 py-2 flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={13} className="text-amber-600 shrink-0 animate-pulse" />
            <p className="text-[11px] text-amber-900 font-medium leading-normal">
              {language === 'fr'
                ? "Essai de Smart Actions épuisé. Chat gratuit illimité !"
                : language === 'en'
                  ? "Smart Actions trial exhausted. Free queries are unlimited!"
                  : "Prueba de Smart Actions agotada. ¡Consultas ilimitadas gratis!"}
            </p>
          </div>
          <Button
            size="sm"
            variant="luxury"
            onClick={onUpgrade}
            className="h-7 text-[10px] px-3 font-semibold rounded-lg"
          >
            Upgrade
          </Button>
        </div>
      )}
    </div>
  );
}
