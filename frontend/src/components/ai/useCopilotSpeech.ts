'use client';

import { useCallback } from 'react';

interface UseCopilotSpeechOptions {
  isMuted: boolean;
  voiceGender: 'female' | 'male';
  audioLanguage: string;
}

export function useCopilotSpeech({ isMuted, voiceGender, audioLanguage }: UseCopilotSpeechOptions) {
  const unlockAudioContext = useCallback(() => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      const silentAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==");
      silentAudio.play().catch(() => {
        // Ignorar rechazo de autoplay — la llamada misma registra la interacción
      });
    } catch (e) {
      // Ignorar errores
    }
  }, [isMuted]);

  const fallbackSpeak = useCallback((text: string, onEndCallback?: () => void) => {
    if (isMuted || typeof window === 'undefined' || !window.speechSynthesis) {
      if (onEndCallback) onEndCallback();
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const voices = window.speechSynthesis.getVoices();
      const langPrefix = audioLanguage.split('-')[0].toLowerCase();
      const langVoices = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix));

      let selectedVoice: SpeechSynthesisVoice | null = null;
      if (langVoices.length > 0) {
        selectedVoice = langVoices.find((v) => {
          const name = v.name.toLowerCase();
          if (voiceGender === 'male') {
            return name.includes('male') || name.includes('david') || name.includes('george') ||
              name.includes('paul') || name.includes('daniel') || name.includes('microsoft');
          } else {
            return name.includes('female') || name.includes('zira') || name.includes('helena') ||
              name.includes('hortense') || name.includes('samantha') || name.includes('elene') ||
              name.includes('google') || name.includes('hazel') || name.includes('natural');
          }
        }) ?? null;
        if (!selectedVoice) {
          selectedVoice = langVoices[0];
        }
      }

      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = audioLanguage;
      }

      utterance.rate = 0.98;
      utterance.pitch = voiceGender === 'male' ? 0.90 : 1.12;

      if (onEndCallback) {
        let called = false;
        const triggerCallback = () => {
          if (!called) {
            called = true;
            onEndCallback();
          }
        };
        utterance.onend = triggerCallback;
        utterance.onerror = triggerCallback;

        const wordCount = text.split(/\s+/).length;
        const backupDelay = Math.max(2000, wordCount * 180 + 1000);
        setTimeout(triggerCallback, backupDelay);
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis fail:', e);
      if (onEndCallback) onEndCallback();
    }
  }, [isMuted, voiceGender, audioLanguage]);

  const speakText = useCallback((text: string, audioBase64?: string | null, onEndCallback?: () => void) => {
    if (isMuted || typeof window === 'undefined') {
      if (onEndCallback) onEndCallback();
      return;
    }

    if (audioBase64) {
      try {
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
        }
        const audio = new Audio("data:audio/mp3;base64," + audioBase64);
        audio.onended = () => {
          if (onEndCallback) onEndCallback();
        };
        audio.onerror = () => {
          console.warn("Fallo en la reproducción del audio nativo en copilot widget, fallback a síntesis");
          fallbackSpeak(text, onEndCallback);
        };
        audio.play().catch(err => {
          console.warn("Fallo al reproducir audio nativo de Gemini, usando fallback:", err);
          fallbackSpeak(text, onEndCallback);
        });
        return;
      } catch (err) {
        console.warn("Fallo al decodificar audio de Gemini:", err);
      }
    }

    fallbackSpeak(text, onEndCallback);
  }, [isMuted, fallbackSpeak]);

  return { speakText, unlockAudioContext };
}
