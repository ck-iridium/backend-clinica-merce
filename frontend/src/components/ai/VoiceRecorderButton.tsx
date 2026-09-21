'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderButtonProps {
  onVoiceTranscribed?: (transcribedText: string) => void;
  disabled?: boolean;
  lang?: string;
  onStartClick?: () => void;
}

export default function VoiceRecorderButton({
  onVoiceTranscribed,
  disabled = false,
  lang = 'es-ES',
  onStartClick,
}: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onVoiceTranscribedRef = useRef(onVoiceTranscribed);
  
  const isFr = lang.startsWith('fr');
  const isEn = lang.startsWith('en');

  // Mantener la referencia del callback siempre al día sin disparar re-renderizados
  useEffect(() => {
    onVoiceTranscribedRef.current = onVoiceTranscribed;
  }, [onVoiceTranscribed]);

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
        recognitionRef.current = null;
      }
    };
  }, []);

  const startListening = () => {
    if (disabled || typeof window === 'undefined') return;

    // Detectar proactivamente navegadores internos de redes sociales (Instagram/WhatsApp WebView) en iOS
    const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const isInApp = /FBAN|FBAV|Instagram|Twitter|WhatsApp|Line/i.test(ua);
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;

    if (isInApp && isIOS) {
      toast.error(
        isFr 
          ? "iOS: Veuillez ouvrir ce site directement dans Safari (bouton '...') pour utiliser les commandes vocales."
          : isEn
            ? "iOS Restriction: Please open this site directly in standard Safari browser (tap '...' button) to use voice features."
            : "Restricción de iOS: Para usar las funciones de voz, por favor abre la web directamente en la app de Safari (pulsa el botón '...' de abajo).",
        { duration: 8500 }
      );
      return;
    }

    try {
      const SpeechRecognitionClass =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognitionClass) {
        toast.error(
          isFr ? 'Votre navigateur ne prend pas en charge la reconnaissance vocale.'
          : isEn ? 'Your browser does not support voice recognition.'
          : 'Tu navegador no soporta el reconocimiento de voz nativo.'
        );
        return;
      }

      // Detener sesión previa si existiera
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (_) {}
      }

      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false; // Parar automáticamente al terminar de hablar
      recognition.interimResults = false; // Solo resultados finales para máxima precisión
      recognition.lang = lang; // Asignación dinámica del idioma (es-ES, fr-FR, en-US)

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info(isFr ? 'Écoute en cours... Parlez maintenant.' : isEn ? 'Listening... Speak now.' : 'Escuchando voz... Habla ahora.');
      };

      recognition.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };

      recognition.onerror = (event: any) => {
        console.error('Error en reconocimiento de voz nativo:', event.error);
        setIsRecording(false);
        recognitionRef.current = null;

        if (event.error === 'not-allowed') {
          toast.error(isFr ? 'Accès micro refusé. Veuillez accorder les permissions.' : isEn ? 'Microphone access denied. Please grant permissions.' : 'Acceso al micrófono denegado. Por favor, concede permisos en tu navegador.');
        } else if (event.error === 'service-not-allowed') {
          toast.error(
            isFr 
              ? "Erreur iOS: Assurez-vous d'activer le Dictée dans Réglages > Général > Claviers, ou d'ouvrir le site directement dans Safari." 
              : isEn 
                ? "iOS Restriction: Please enable 'Dictation' in iPhone Settings > General > Keyboard, or open this site directly in Safari (not inside WhatsApp)." 
                : "Restricción de iOS: Por favor activa 'Dictado' en los Ajustes de tu iPhone > General > Teclado, o abre la web directamente en la app de Safari."
          , { duration: 8000 });
        } else if (event.error === 'no-speech') {
          toast.warning(isFr ? 'Aucune voix détectée. Réessayez.' : isEn ? 'No speech detected. Try speaking again.' : 'No se detectó voz clara. Intenta hablar de nuevo.');
        } else {
          toast.error(isFr ? `Erreur micro: ${event.error}` : isEn ? `Voice error: ${event.error}` : `Error de voz: ${event.error}`);
        }
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript && transcript.trim()) {
          toast.success(isFr ? 'Audio transcrit avec succès.' : isEn ? 'Audio transcribed successfully.' : 'Audio transcrito con éxito.');
          if (onVoiceTranscribedRef.current) {
            onVoiceTranscribedRef.current(transcript);
          }
        } else {
          toast.warning(isFr ? 'Impossible de transcrire.' : isEn ? 'Could not transcribe clearly.' : 'No se pudo transcribir una frase clara.');
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Fallo al iniciar SpeechRecognition en iOS/Safari:', err);
      setIsRecording(false);
      recognitionRef.current = null;
      toast.error(
        isFr ? 'Reconnaissance vocale indisponible sur cet appareil.'
        : isEn ? 'Voice recognition unavailable on this device.'
        : 'Reconocimiento de voz no disponible en este dispositivo.'
      );
    }
  };

  const stopListening = () => {
    if (!isRecording) return;

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    } catch (err) {
      console.error('Fallo al detener SpeechRecognition:', err);
    }
  };

  const handleToggle = () => {
    if (isRecording) {
      stopListening();
    } else {
      if (onStartClick) onStartClick();
      startListening();
    }
  };

  return (
    <div className="relative flex items-center justify-center shrink-0">
      {isRecording && (
        <span className="absolute inline-flex h-12 w-12 rounded-full bg-[#d4af37]/20 animate-ping" />
      )}
      <button
        type="button"
        onClick={handleToggle}
        disabled={disabled}
        className={`relative z-10 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 shadow-md ${
          isRecording
            ? 'bg-[#d4af37] text-stone-950 scale-105 shadow-[#d4af37]/20 border border-[#d4af37]'
            : 'bg-white hover:bg-stone-50 border border-stone-200 text-stone-500 hover:text-stone-800'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'active:scale-95'}`}
        title={isRecording ? 'Detener escucha' : 'Hablar al Asistente'}
      >
        <Mic size={20} className={isRecording ? 'animate-pulse' : ''} strokeWidth={isRecording ? 2.5 : 1.8} />
      </button>
    </div>
  );
}
