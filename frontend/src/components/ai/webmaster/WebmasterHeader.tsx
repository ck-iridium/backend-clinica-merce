'use client';

import { Sparkles, AudioLines, Volume2, VolumeX, RefreshCw } from 'lucide-react';

interface WebmasterHeaderProps {
  voiceGender: 'female' | 'male';
  onToggleVoiceGender: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onResetChat: () => void;
  language: string;
}

export default function WebmasterHeader({
  voiceGender,
  onToggleVoiceGender,
  isMuted,
  onToggleMute,
  onResetChat,
  language,
}: WebmasterHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 bg-white border-b border-stone-200/60 shadow-xs shrink-0 h-[68px]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-300/40 text-[#d4af37] shadow-xs">
          <Sparkles size={18} className="animate-pulse" />
        </div>
        <div>
          <h2 className="text-[15px] font-semibold text-stone-900 tracking-wide font-serif">
            Estudio AI Webmaster
          </h2>
          <p className="text-[10px] font-semibold text-[#d4af37] uppercase tracking-widest mt-0.5">
            Director Creativo · Plan Elite
          </p>
        </div>
      </div>

      {/* Controles de Cabecera (Voz, Silencio y Reinicio) */}
      <div className="flex items-center gap-2">
        {/* Selector de Género de Voz */}
        <button
          onClick={onToggleVoiceGender}
          className={`px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all duration-200 flex items-center gap-1.5 ${
            voiceGender === 'male'
              ? 'border-amber-300/80 bg-amber-50/80 text-amber-900 shadow-xs'
              : 'border-stone-200/80 bg-white text-stone-600 hover:text-stone-900 hover:border-stone-300 shadow-xs'
          }`}
          title={language === 'fr' ? 'Changer de voix' : language === 'en' ? 'Change voice' : 'Cambiar voz'}
        >
          <AudioLines
            size={13}
            className={voiceGender === 'male' ? 'text-amber-700' : 'text-[#d4af37]'}
            strokeWidth={2}
          />
          <span>
            {voiceGender === 'female'
              ? language === 'fr'
                ? 'Voix Féminine'
                : language === 'en'
                ? 'Female Voice'
                : 'Voz Femenina'
              : language === 'fr'
              ? 'Voix Masculine'
              : language === 'en'
              ? 'Male Voice'
              : 'Voz Masculina'}
          </span>
        </button>

        {/* Silenciar / Activar Voz */}
        <button
          onClick={onToggleMute}
          className={`p-2.5 rounded-xl transition-all duration-300 ${
            isMuted
              ? 'text-stone-300 hover:text-stone-500 hover:bg-stone-50'
              : 'text-[#d4af37] hover:text-[#b38f2b] hover:bg-amber-50/50'
          }`}
          title={
            isMuted
              ? language === 'fr'
                ? 'Activer la lecture'
                : language === 'en'
                ? 'Unmute reading'
                : 'Activar lectura en voz alta'
              : language === 'fr'
              ? 'Désactiver la lecture'
              : language === 'en'
              ? 'Mute reading'
              : 'Silenciar lectura'
          }
        >
          {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Reiniciar Conversación */}
        <button
          onClick={onResetChat}
          className="p-2.5 text-stone-400 hover:text-stone-700 hover:bg-stone-50 rounded-xl transition-all duration-300"
          title={language === 'fr' ? 'Réinitialiser la conversation' : language === 'en' ? 'Reset chat' : 'Reiniciar chat'}
        >
          <RefreshCw size={15} />
        </button>
      </div>
    </div>
  );
}
