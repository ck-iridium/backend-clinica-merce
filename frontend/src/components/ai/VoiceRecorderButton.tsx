'use client';

import { useState, useRef, useEffect } from 'react';
import { Mic } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderButtonProps {
  onVoiceTranscribed?: (transcribedText: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorderButton({
  onVoiceTranscribed,
  disabled = false,
}: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const onVoiceTranscribedRef = useRef(onVoiceTranscribed);

  // Mantener la referencia del callback siempre al día sin disparar re-renderizados
  useEffect(() => {
    onVoiceTranscribedRef.current = onVoiceTranscribed;
  }, [onVoiceTranscribed]);

  // Inicializar SpeechRecognition una sola vez al montar el componente
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      console.warn('Este navegador no soporta la API nativa de reconocimiento de voz (SpeechRecognition).');
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = false; // Parar automáticamente al terminar de hablar
    recognition.interimResults = false; // Solo resultados finales para máxima precisión
    recognition.lang = 'es-ES'; // Español clínico y estético de alta precisión

    recognition.onstart = () => {
      setIsRecording(true);
      toast.info('Escuchando voz... Habla ahora.');
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Error en reconocimiento de voz nativo:', event.error);
      setIsRecording(false);

      if (event.error === 'not-allowed') {
        toast.error('Acceso al micrófono denegado. Por favor, concede permisos en tu navegador.');
      } else if (event.error === 'no-speech') {
        toast.warning('No se detectó voz clara. Intenta hablar de nuevo.');
      } else {
        toast.error(`Error de voz: ${event.error}`);
      }
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (transcript && transcript.trim()) {
        toast.success('Audio transcrito con éxito.');
        if (onVoiceTranscribedRef.current) {
          onVoiceTranscribedRef.current(transcript);
        }
      } else {
        toast.warning('No se pudo transcribir una frase clara.');
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []); // Dependencias vacías: inicialización única y estable

  const startListening = () => {
    if (disabled) return;

    if (!recognitionRef.current) {
      toast.error('Tu navegador no soporta el reconocimiento de voz nativo en español.');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (err) {
      console.error('Fallo al iniciar SpeechRecognition:', err);
    }
  };

  const stopListening = () => {
    if (!isRecording) return;

    try {
      recognitionRef.current.stop();
    } catch (err) {
      console.error('Fallo al detener SpeechRecognition:', err);
    }
  };

  const handleToggle = () => {
    if (isRecording) {
      stopListening();
    } else {
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
