'use client';

import { useCallback } from 'react';

interface UseCopilotSpeechOptions {
  isMuted: boolean;
  voiceGender: 'female' | 'male';
  audioLanguage: string;
}

// Persistent singletons to reuse across voice playbacks and bypass iOS Safari autoplay restrictions
let persistentAudio: HTMLAudioElement | null = null;
let persistentAudioContext: AudioContext | null = null;
let activeSource: AudioBufferSourceNode | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;

const getPersistentAudio = () => {
  if (typeof window === 'undefined') return null;
  if (!persistentAudio) {
    persistentAudio = new Audio();
    // Preload a tiny silent base64 to unlock it initially
    persistentAudio.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";
  }
  return persistentAudio;
};

const getPersistentAudioContext = () => {
  if (typeof window === 'undefined') return null;
  if (!persistentAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      persistentAudioContext = new AudioContextClass();
    }
  }
  return persistentAudioContext;
};

// Helper to convert base64 to ArrayBuffer safely stripping data URI headers if present
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const rawBase64 = base64.includes(';base64,') ? base64.split(';base64,')[1] : base64;
  const binaryString = window.atob(rawBase64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export function useCopilotSpeech({ isMuted, voiceGender, audioLanguage }: UseCopilotSpeechOptions) {
  
  // Unlocks Web Audio context, SpeechSynthesis, and HTML5 Audio on user interaction gestures
  const unlockAudioContext = useCallback(() => {
    if (isMuted || typeof window === 'undefined') return;
    try {
      // 1. Prime SpeechSynthesis (crucial for iOS Safari fallback)
      if (window.speechSynthesis) {
        const silentUtterance = new SpeechSynthesisUtterance('');
        silentUtterance.volume = 0;
        window.speechSynthesis.speak(silentUtterance);
      }
      
      // 2. Prime AudioContext (preferred for base64 playback)
      const ctx = getPersistentAudioContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      // 3. Prime HTMLAudioElement (backup for base64 playback)
      const audio = getPersistentAudio();
      if (audio) {
        audio.play().then(() => {
          audio.pause();
        }).catch(() => {});
      }
    } catch (e) {
      console.warn("Error warming up audio context on user gesture:", e);
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
      activeUtterance = utterance; // Keep active utterance reference to prevent GC cutoffs!

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

      let called = false;
      const triggerCallback = () => {
        if (!called) {
          called = true;
          if (activeUtterance === utterance) {
            activeUtterance = null;
          }
          if (onEndCallback) onEndCallback();
        }
      };

      utterance.onend = triggerCallback;
      utterance.onerror = triggerCallback;

      // Safety fallback in case onend doesn't fire
      const wordCount = text.split(/\s+/).length;
      const backupDelay = Math.max(2000, wordCount * 180 + 1000);
      setTimeout(triggerCallback, backupDelay);

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis fail:', e);
      if (onEndCallback) onEndCallback();
    }
  }, [isMuted, voiceGender, audioLanguage]);

  // Plays Gemini's native base64 audio response using the best available unlocked channel
  const speakText = useCallback((text: string, audioBase64?: string | null, onEndCallback?: () => void) => {
    if (isMuted || typeof window === 'undefined') {
      if (onEndCallback) onEndCallback();
      return;
    }

    // Cancel existing SpeechSynthesis immediately
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    // Stop active buffer source if playing
    if (activeSource) {
      try {
        activeSource.stop();
      } catch (e) {}
      activeSource = null;
    }

    // Stop active HTMLAudioElement if playing
    const audio = getPersistentAudio();
    if (audio) {
      try {
        audio.pause();
      } catch (e) {}
    }

    if (audioBase64) {
      // Helper function to fallback to HTML5 Audio if Web Audio API fails
      const playViaHTMLAudio = () => {
        try {
          if (audio) {
            audio.src = "data:audio/mp3;base64," + audioBase64;
            audio.onended = () => {
              if (onEndCallback) onEndCallback();
            };
            audio.onerror = (e) => {
              console.warn("HTMLAudioElement playback error, falling back to speech synthesis:", e);
              fallbackSpeak(text, onEndCallback);
            };
            // Note: NO .load() call because it resets/revokes gesture state on iOS Safari
            audio.play().catch(err => {
              console.warn("HTMLAudioElement blocked, falling back to speech synthesis:", err);
              fallbackSpeak(text, onEndCallback);
            });
          } else {
            fallbackSpeak(text, onEndCallback);
          }
        } catch (err) {
          console.warn("Fallo en fallback de HTMLAudioElement:", err);
          fallbackSpeak(text, onEndCallback);
        }
      };

      try {
        // Try Web Audio API first (most reliable on iOS Safari once context is running)
        const ctx = getPersistentAudioContext();
        if (ctx) {
          const arrayBuffer = base64ToArrayBuffer(audioBase64);

          const playBuffer = (buffer: AudioBuffer) => {
            const source = ctx.createBufferSource();
            source.buffer = buffer;
            source.connect(ctx.destination);
            
            source.onended = () => {
              if (activeSource === source) {
                activeSource = null;
              }
              if (onEndCallback) onEndCallback();
            };
            
            activeSource = source;
            source.start(0);
          };

          // Check if we need to resume suspended context
          const resumePromise = ctx.state === 'suspended' ? ctx.resume() : Promise.resolve();

          resumePromise.then(() => {
            // Safari historically required callback-style decodeAudioData
            try {
              ctx.decodeAudioData(
                arrayBuffer,
                (decodedBuffer) => {
                  playBuffer(decodedBuffer);
                },
                (err) => {
                  console.warn("decodeAudioData callback error, falling back to HTMLAudioElement:", err);
                  playViaHTMLAudio();
                }
              );
            } catch (decErr) {
              // Promise-based decodeAudioData fallback
              ctx.decodeAudioData(arrayBuffer)
                .then((decodedBuffer) => {
                  playBuffer(decodedBuffer);
                })
                .catch((err) => {
                  console.warn("decodeAudioData promise error, falling back to HTMLAudioElement:", err);
                  playViaHTMLAudio();
                });
            }
          }).catch((err) => {
            console.warn("Could not resume AudioContext, falling back to HTMLAudioElement:", err);
            playViaHTMLAudio();
          });
          return;
        }
      } catch (err) {
        console.warn("Web Audio API failed, falling back to HTMLAudioElement:", err);
        playViaHTMLAudio();
        return;
      }
    }

    fallbackSpeak(text, onEndCallback);
  }, [isMuted, fallbackSpeak]);

  return { speakText, unlockAudioContext };
}
