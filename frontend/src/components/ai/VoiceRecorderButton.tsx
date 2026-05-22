'use client';

import { useState, useRef } from 'react';
import { Mic, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRecorderButtonProps {
  onAudioRecorded?: (base64Audio: string, mimeType: string) => void;
  disabled?: boolean;
}

export default function VoiceRecorderButton({
  onAudioRecorded,
  disabled = false,
}: VoiceRecorderButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    if (disabled) return;
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      
      // Determinar el mejor formato de audio soportado por el navegador
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/wav')) {
        mimeType = 'audio/wav';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        // Detener todos los tracks de audio para apagar el indicador del micrófono en el navegador
        stream.getTracks().forEach((track) => track.stop());

        // Convertir Blob a Base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Data = reader.result as string;
          if (onAudioRecorded) {
            onAudioRecorded(base64Data, mimeType);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Grabando audio... Habla ahora.');
    } catch (err) {
      console.error('Error al acceder al micrófono:', err);
      toast.error('No se pudo acceder al micrófono. Por favor, concede permisos en tu navegador.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Audio grabado correctamente. Procesando...');
    }
  };

  const handleToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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
        title={isRecording ? 'Detener grabación de voz' : 'Grabar con voz'}
      >
        <Mic size={20} className={isRecording ? 'animate-pulse' : ''} strokeWidth={isRecording ? 2.5 : 1.8} />
      </button>
    </div>
  );
}
