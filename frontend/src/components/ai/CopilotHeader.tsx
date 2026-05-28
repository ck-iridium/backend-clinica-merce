'use client';

import React from 'react';
import { Sparkles, X, Volume2, VolumeX, RotateCcw } from 'lucide-react';

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
    <div className="bg-stone-900 text-white border-b border-stone-800 shrink-0 flex flex-col">
      {/* Fila 1: Título y Cerrar */}
      <div className="px-5 py-3.5 flex items-center justify-between border-b border-stone-800/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-800 to-stone-950 flex items-center justify-center border border-primary/40 shadow-inner">
            <Sparkles size={18} className="text-primary animate-pulse" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold tracking-wide">Co-Piloto AI</h3>
            <span className="text-[10px] text-primary font-black uppercase tracking-widest block leading-none mt-0.5">
              {language === 'fr' ? 'Navigation Intelligente' : language === 'en' ? 'Smart Navigation' : 'Navegación Inteligente'}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-all shrink-0 active:scale-95 border border-stone-800"
          title={language === 'fr' ? "Fermer l'assistant" : language === 'en' ? 'Close Assistant' : 'Cerrar Asistente'}
        >
          <X size={18} />
        </button>
      </div>

      {/* Fila 2: Controles Auxiliares */}
      <div className="px-5 py-2.5 bg-stone-950/40 flex items-center justify-between gap-3 text-xs">
        {/* Badge de límite de plan */}
        {planType && !hasOwnKey && (
          planType === 'free' && trialRemaining !== null ? (
            <div className="px-2.5 py-1 rounded-lg border border-primary/20 bg-primary/10 text-primary text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0">
              <Sparkles size={10} className="animate-pulse" />
              <span>{trialRemaining} / 10 prueba</span>
            </div>
          ) : (planType === 'basic' || planType === 'pro') && dailyActionsLimit > 0 ? (
            <div
              className={`px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                (dailyActionsLimit - dailyActionsUsed) <= 0
                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                  : 'border-primary/20 bg-primary/10 text-primary'
              }`}
              title={language === 'fr' ? 'Détails du quota quotidien' : language === 'en' ? 'Daily quota details' : 'Detalles de cuota diaria de Smart Actions'}
              onClick={() => {
                // Toast informativo de cuota
                const remaining = dailyActionsLimit - dailyActionsUsed;
                const msg = language === 'fr'
                  ? `Quota quotidien : ${remaining} sur ${dailyActionsLimit} actions disponibles.`
                  : language === 'en'
                    ? `Daily quota: ${remaining} of ${dailyActionsLimit} smart actions remaining.`
                    : `Límite diario: ${remaining} de ${dailyActionsLimit} acciones inteligentes disponibles hoy.`;
                // Usamos un evento DOM para evitar importar toast aquí (lo lanza el padre si lo necesita)
                const event = new CustomEvent('copilot-quota-info', { detail: { msg } });
                window.dispatchEvent(event);
              }}
            >
              <Sparkles size={10} className="animate-pulse" />
              <span>Smart: {dailyActionsLimit - dailyActionsUsed} / {dailyActionsLimit} hoy</span>
            </div>
          ) : null
        )}

        {/* Badge ilimitado Gold/BYOK */}
        {(planType === 'gold' || hasOwnKey) && (
          <div className="px-2.5 py-1 rounded-lg border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 shrink-0">
            <Sparkles size={10} className="text-yellow-500" />
            <span>Ilimitado ✨</span>
          </div>
        )}

        {/* Selector de Género de Voz */}
        <button
          onClick={onToggleVoiceGender}
          className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 flex items-center justify-center gap-1.5 shrink-0 active:scale-95 ${
            voiceGender === 'male'
              ? 'border-primary bg-primary/20 text-primary font-bold shadow-lg shadow-primary/10'
              : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:text-stone-200 hover:border-stone-700'
          }`}
          title={language === 'fr' ? 'Changer de voix (Féminin/Masculin)' : language === 'en' ? 'Change voice (Female/Male)' : 'Cambiar voz (Femenina/Masculina)'}
        >
          {voiceGender === 'female'
            ? (language === 'fr' ? '👩 Voix Féminine' : language === 'en' ? '👩 Female Voice' : '👩 Voz Femenina')
            : (language === 'fr' ? '👨 Voix Masculine' : language === 'en' ? '👨 Male Voice' : '👨 Voz Masculina')
          }
        </button>

        <div className="flex items-center gap-2">
          {/* Botón Silencio */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-all shrink-0 active:scale-95 ${
              isMuted
                ? 'border-red-500/40 bg-red-500/10 text-red-400'
                : 'border-stone-800 bg-stone-900/50 text-stone-400 hover:text-primary hover:border-stone-700'
            }`}
            title={isMuted
              ? (language === 'fr' ? 'Activer la voix' : language === 'en' ? 'Unmute Voice' : 'Activar Voz')
              : (language === 'fr' ? 'Couper la voix' : language === 'en' ? 'Mute Voice' : 'Silenciar Voz')
            }
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          {/* Botón Reiniciar Chat */}
          <button
            onClick={onClearHistory}
            className="p-2 rounded-xl border border-stone-800 bg-stone-900/50 text-stone-400 hover:text-red-400 hover:border-stone-700 transition-all shrink-0 active:scale-95"
            title={language === 'fr' ? 'Réinitialiser la conversation' : language === 'en' ? 'Reset Conversation' : 'Reiniciar Conversación'}
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Banner de Trial Exhausted */}
      {isTrialExhausted && (
        <div className="bg-amber-50/70 border-b border-amber-200/50 px-4 py-2.5 flex items-center justify-between gap-3 shrink-0 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles size={14} className="text-amber-600 shrink-0 animate-pulse" />
            <p className="text-[10px] text-amber-800 font-medium leading-normal">
              {language === 'fr'
                ? "Essai de Smart Actions épuisé. Chat gratuit illimité !"
                : language === 'en'
                  ? "Smart Actions trial exhausted. Free queries are unlimited!"
                  : "Prueba de Smart Actions agotada. ¡Consultas de voz/chat ilimitadas gratis!"}
            </p>
          </div>
          <button
            onClick={onUpgrade}
            className="px-2.5 py-1 rounded-lg bg-stone-900 text-white hover:bg-[#d4af37] hover:text-stone-950 font-black text-[9px] uppercase tracking-widest transition-all duration-300 shrink-0 active:scale-95 shadow-sm"
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
}
