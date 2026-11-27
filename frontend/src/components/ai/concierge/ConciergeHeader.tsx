'use client';

import React from 'react';
import { Volume2, VolumeX, RotateCcw, X } from 'lucide-react';
import ChromaticOrb from '../ChromaticOrb';

interface ConciergeHeaderProps {
  isThemeDark: boolean;
  isSpeaking: boolean;
  voiceGender: 'female' | 'male';
  onToggleVoiceGender: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onClearHistory: () => void;
  onClose: () => void;
}

export default function ConciergeHeader({
  isThemeDark,
  isSpeaking,
  voiceGender,
  onToggleVoiceGender,
  isMuted,
  onToggleMute,
  onClearHistory,
  onClose,
}: ConciergeHeaderProps) {
  return (
    <div className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800/80 bg-stone-50/70 dark:bg-stone-900/60 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <ChromaticOrb size="md" isSpeaking={isSpeaking} theme={isThemeDark ? 'dark' : 'light'} />
        <div>
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-stone-900 dark:text-stone-100 text-sm tracking-tight">
              Asistente Virtual
            </span>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              24/7
            </span>
          </div>
          <p className="text-[11px] text-stone-400 font-medium">Atención y Citas 24/7</p>
        </div>
      </div>

      {/* Acciones de la Cabecera */}
      <div className="flex items-center gap-1.5">
        {/* Selector Voz Femenina / Masculina */}
        <button
          type="button"
          onClick={onToggleVoiceGender}
          className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-stone-200/60 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:text-amber-500 transition-colors"
          title="Cambiar género de voz"
        >
          {voiceGender === 'female' ? 'Voz F' : 'Voz M'}
        </button>

        {/* Mute */}
        <button
          type="button"
          onClick={onToggleMute}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title={isMuted ? 'Activar voz' : 'Silenciar'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Limpiar */}
        <button
          type="button"
          onClick={onClearHistory}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors"
          title="Reiniciar conversación"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        {/* Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-stone-800 transition-colors ml-1"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
